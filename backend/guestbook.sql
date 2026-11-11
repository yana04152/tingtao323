-- Run once in the project's SQL editor. Tables are deliberately outside the Data API.
create schema if not exists tingtao_private;
revoke all on schema tingtao_private from public, anon, authenticated;

create table if not exists tingtao_private.admins (email text primary key);
create table if not exists tingtao_private.settings (id boolean primary key default true check (id), salt text not null default gen_random_uuid()::text);
insert into tingtao_private.settings(id) values(true) on conflict do nothing;
create table if not exists tingtao_private.messages (
  id uuid primary key default gen_random_uuid(), request_id uuid not null unique,
  nickname text not null check(char_length(nickname) between 1 and 30),
  body text not null check(char_length(body) between 2 and 2000),
  kind text not null check(kind in ('memory','source','feedback')),
  visibility text not null check(visibility in ('public','private')),
  status text not null default 'pending' check(status in ('pending','approved','hidden','handled')),
  reply text check(char_length(reply)<=2000), reply_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check(not(visibility='private' and status='approved'))
);
create index if not exists tt_messages_created on tingtao_private.messages(created_at desc);
create table if not exists tingtao_private.events (
  id uuid primary key, session_id uuid not null, panel text not null, source text not null,
  created_at timestamptz not null default now()
);
create index if not exists tt_events_created on tingtao_private.events(created_at);
create index if not exists tt_events_session on tingtao_private.events(session_id,created_at);
create table if not exists tingtao_private.rate_limits (
  bucket text primary key, hits integer not null default 1, created_at timestamptz not null default now()
);
alter table tingtao_private.admins enable row level security;
alter table tingtao_private.settings enable row level security;
alter table tingtao_private.messages enable row level security;
alter table tingtao_private.events enable row level security;
alter table tingtao_private.rate_limits enable row level security;
revoke all on all tables in schema tingtao_private from public, anon, authenticated;

create or replace function tingtao_private.is_admin() returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from tingtao_private.admins a join auth.users u on lower(u.email)=lower(a.email)
 where u.id=auth.uid() and u.email_confirmed_at is not null);
$$;
revoke all on function tingtao_private.is_admin() from public, anon, authenticated;

create or replace function tingtao_private.rate_guard(p_scope text, p_max integer) returns void
language plpgsql security definer set search_path='' as $$
declare h jsonb; origin text; address text; k text; n integer; secret text;
begin
 h:=coalesce(nullif(current_setting('request.headers',true),''),'{}')::jsonb;
 origin:=coalesce(h->>'origin','');
 if origin<>'' and origin not in ('https://yana04152.github.io','http://127.0.0.1:3769','http://localhost:3769') then
   raise exception '暂时无法从这个页面提交，请回到网站重试。';
 end if;
 -- Origin is defense in depth, not authorization. Every write is validated and rate limited independently.
 address:=split_part(coalesce(h->>'x-forwarded-for',h->>'x-real-ip','unknown'),',',1);
 select salt into secret from tingtao_private.settings where id=true;
 k:=p_scope||':'||to_char(now() at time zone 'UTC','YYYY-MM-DD-HH')||':'||encode(sha256(convert_to(address||secret||current_date::text,'UTF8')),'hex');
 insert into tingtao_private.rate_limits(bucket) values(k)
 on conflict(bucket) do update set hits=tingtao_private.rate_limits.hits+1 returning hits into n;
 if n>p_max then raise exception '操作有些频繁，请过一会儿再试。'; end if;
 delete from tingtao_private.rate_limits where created_at<now()-interval '25 hours';
end; $$;
revoke all on function tingtao_private.rate_guard(text,integer) from public, anon, authenticated;

create or replace function public.tt_submit_message(p_nickname text,p_body text,p_kind text,p_visibility text,p_website text,p_elapsed_ms bigint,p_request_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result_id uuid;
begin
 if p_request_id is null or p_nickname is null or p_body is null or p_kind is null or p_visibility is null
 or char_length(trim(p_nickname)) not between 1 and 30 or char_length(trim(p_body)) not between 2 and 2000
 or p_kind not in ('memory','source','feedback') or p_visibility not in ('public','private') then
   raise exception '请检查昵称和正文长度，再提交一次。';
 end if;
 if coalesce(p_website,'')<>'' or coalesce(p_elapsed_ms,0)<1500 then raise exception '请稍停片刻，再送出你的文字。'; end if;
 select id into result_id from tingtao_private.messages where request_id=p_request_id;
 if result_id is not null then return jsonb_build_object('received',true); end if;
 perform tingtao_private.rate_guard('message',8);
 if (select count(*) from tingtao_private.messages where created_at>now()-interval '1 hour')>=1000 then
   raise exception '此刻收到的留言较多，请稍后再来。';
 end if;
 insert into tingtao_private.messages(request_id,nickname,body,kind,visibility)
 values(p_request_id,trim(p_nickname),trim(p_body),p_kind,p_visibility)
 on conflict(request_id) do nothing;
 return jsonb_build_object('received',true);
end; $$;

create or replace function public.tt_public_messages(p_offset integer default 0,p_limit integer default 12)
returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('total',(select count(*) from tingtao_private.messages where visibility='public' and status='approved'),
 'items',coalesce((select jsonb_agg(to_jsonb(t)) from (
 select id,nickname,body,kind,created_at,reply,reply_at from tingtao_private.messages
 where visibility='public' and status='approved' order by created_at desc,id desc
 offset greatest(coalesce(p_offset,0),0) limit least(greatest(coalesce(p_limit,12),1),50)
 )t),'[]'::jsonb));
$$;

create or replace function public.tt_track_view(p_session uuid,p_panel text,p_source text,p_event uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 if p_session is null or p_event is null or p_panel is null or p_source is null
 or p_panel not in ('home','timeline','videos','career','works','reading','community','atlas','voices','sources','guestbook')
 or p_source not in ('直接访问','微博','抖音','哔哩哔哩','小红书','搜索引擎','其他网站') then return; end if;
 if tingtao_private.is_admin() then return; end if;
 if exists(select 1 from tingtao_private.events where id=p_event) then return; end if;
 perform tingtao_private.rate_guard('view',500);
 if (select count(*) from tingtao_private.events where session_id=p_session and created_at>now()-interval '1 hour')>=120 then return; end if;
 if (select count(*) from tingtao_private.events where created_at>now()-interval '1 hour')>=20000 then return; end if;
 insert into tingtao_private.events(id,session_id,panel,source) values(p_event,p_session,p_panel,p_source) on conflict do nothing;
 delete from tingtao_private.events where created_at<now()-interval '90 days';
end; $$;

create or replace function public.tt_admin_messages(p_status text default 'all',p_offset integer default 0,p_limit integer default 30)
returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not tingtao_private.is_admin() then raise exception '仅网站整理者可访问。' using errcode='42501'; end if;
 return jsonb_build_object('total',(select count(*) from tingtao_private.messages where p_status='all' or status=p_status),
 'items',coalesce((select jsonb_agg(to_jsonb(t)) from (
 select id,nickname,body,kind,visibility,status,created_at,reply,reply_at from tingtao_private.messages
 where p_status='all' or status=p_status order by created_at desc,id desc
 offset greatest(coalesce(p_offset,0),0) limit least(greatest(coalesce(p_limit,30),1),100)
 )t),'[]'::jsonb));
end; $$;

create or replace function public.tt_admin_update(p_id uuid,p_status text,p_reply text default null)
returns void language plpgsql security definer set search_path='' as $$
declare v text; old_reply text;
begin
 if not tingtao_private.is_admin() then raise exception '仅网站整理者可访问。' using errcode='42501'; end if;
 if p_status is null or p_status not in ('pending','approved','hidden','handled') or char_length(coalesce(p_reply,''))>2000 then
   raise exception '请检查处理状态和回复长度。'; end if;
 select visibility,reply into v,old_reply from tingtao_private.messages where id=p_id for update;
 if v is null then raise exception '这条留言不存在，请刷新列表。'; end if;
 if v='private' and p_status='approved' then raise exception '私密反馈不能转为公开留言。'; end if;
 update tingtao_private.messages set status=p_status,reply=nullif(trim(p_reply),''),updated_at=now(),
 reply_at=case when nullif(trim(p_reply),'') is null then null when reply is distinct from nullif(trim(p_reply),'') then now() else reply_at end
 where id=p_id;
end; $$;

create or replace function public.tt_admin_stats() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare today date := (now() at time zone 'Asia/Shanghai')::date; start_at timestamptz;
begin
 if not tingtao_private.is_admin() then raise exception '仅网站整理者可访问。' using errcode='42501'; end if;
 start_at := (today-29)::timestamp at time zone 'Asia/Shanghai';
 return jsonb_build_object(
 'today_views',(select count(*) from tingtao_private.events where created_at>=today::timestamp at time zone 'Asia/Shanghai'),
 'today_visits',(select count(distinct session_id) from tingtao_private.events where created_at>=today::timestamp at time zone 'Asia/Shanghai'),
 'month_views',(select count(*) from tingtao_private.events where created_at>=start_at),
 'month_visits',(select count(distinct session_id) from tingtao_private.events where created_at>=start_at),
 'pending',(select count(*) from tingtao_private.messages where status='pending'),
 'daily',(select jsonb_agg(to_jsonb(t) order by day) from (
 select d::date as day,count(e.id) as views,count(distinct e.session_id) as visits
 from generate_series(today-13,today,interval '1 day')d left join tingtao_private.events e
 on (e.created_at at time zone 'Asia/Shanghai')::date=d::date and e.created_at>=start_at group by d)t),
 'panels',coalesce((select jsonb_agg(to_jsonb(t)) from (select panel,count(*) as views from tingtao_private.events where created_at>=start_at group by panel order by views desc)t),'[]'::jsonb),
 'sources',coalesce((select jsonb_agg(to_jsonb(t)) from (select source,count(*) as visits from (select distinct on(session_id) session_id,source from tingtao_private.events where created_at>=start_at order by session_id,created_at) first_visits group by source order by visits desc)t),'[]'::jsonb)
 );
end; $$;

revoke all on function public.tt_submit_message(text,text,text,text,text,bigint,uuid) from public;
revoke all on function public.tt_public_messages(integer,integer) from public;
revoke all on function public.tt_track_view(uuid,text,text,uuid) from public;
revoke all on function public.tt_admin_messages(text,integer,integer) from public,anon;
revoke all on function public.tt_admin_update(uuid,text,text) from public,anon;
revoke all on function public.tt_admin_stats() from public,anon;
grant execute on function public.tt_submit_message(text,text,text,text,text,bigint,uuid) to anon,authenticated;
grant execute on function public.tt_public_messages(integer,integer) to anon,authenticated;
grant execute on function public.tt_track_view(uuid,text,text,uuid) to anon,authenticated;
grant execute on function public.tt_admin_messages(text,integer,integer) to authenticated;
grant execute on function public.tt_admin_update(uuid,text,text) to authenticated;
grant execute on function public.tt_admin_stats() to authenticated;
