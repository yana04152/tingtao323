import { useEffect, useRef, useState, type FormEvent } from 'react';
import { analyticsDisabled, formatMessageDate, guestbookReady, guestbookRpc, kindLabels, setAnalyticsDisabled, type GuestMessage, type MessageKind, type MessagePage, type MessageVisibility } from '../lib/guestbook';
import './guestbook.css';

export default function Guestbook() {
  const [nickname, setNickname] = useState('');
  const [body, setBody] = useState('');
  const [kind, setKind] = useState<MessageKind>('memory');
  const [visibility, setVisibility] = useState<MessageVisibility>('public');
  const [website, setWebsite] = useState('');
  const [items, setItems] = useState<GuestMessage[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [sent, setSent] = useState('');
  const [optOut, setOptOut] = useState(analyticsDisabled);
  const started = useRef(Date.now());
  const requestId = useRef(crypto.randomUUID());
  const lastPayload = useRef('');
  const listRequest = useRef(0);
  const [rightsContact, setRightsContact] = useState(false);

  useEffect(() => {
    const syncContact = () => {
      const isRights = window.location.hash === '#guestbook/rights';
      setRightsContact(isRights);
      if (isRights) { setKind('feedback'); setVisibility('private'); }
    };
    syncContact(); window.addEventListener('hashchange', syncContact);
    return () => window.removeEventListener('hashchange', syncContact);
  }, []);

  async function load(offset = 0) {
    const request = ++listRequest.current;
    setLoading(true); setLoadError('');
    try {
      const page = await guestbookRpc<MessagePage>('tt_public_messages', { p_offset: offset, p_limit: 12 });
      if (request !== listRequest.current) return;
      setItems(old => offset ? [...old, ...page.items.filter(item => !old.some(x => x.id === item.id))] : page.items);
      setTotal(page.total);
    } catch (error) { if (request === listRequest.current) setLoadError((error as Error).message); }
    finally { if (request === listRequest.current) setLoading(false); }
  }
  useEffect(() => { if (guestbookReady) void load(); return () => { listRequest.current += 1; }; }, []);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (sending) return;
    setFormError(''); setSent('');
    if (!nickname.trim() || body.trim().length < 2) { setFormError('请留下一个昵称，写下至少两个字。'); return; }
    setSending(true);
    try {
      const payload = JSON.stringify([nickname.trim(), body.trim(), kind, visibility]);
      if (lastPayload.current && lastPayload.current !== payload) requestId.current = crypto.randomUUID();
      lastPayload.current = payload;
      await guestbookRpc('tt_submit_message', { p_nickname: nickname.trim(), p_body: body.trim(), p_kind: kind, p_visibility: visibility, p_website: website, p_elapsed_ms: Date.now() - started.current, p_request_id: requestId.current });
      setSent(visibility === 'public' ? '已经收到。整理者看过后，这段回声会出现在这里。谢谢你留下这一页。' : '已经收到，只有网站整理者能看到这份反馈。谢谢你帮助这本人物册慢慢变好。');
      setBody(''); requestId.current = crypto.randomUUID(); lastPayload.current = ''; started.current = Date.now();
    } catch (error) { setFormError((error as Error).message); }
    finally { setSending(false); }
  }
  return <section className="guestbook-section wrap" id="guestbook">
    <div className="echo-heading"><div><span className="section-kicker">在这里，留下回声 / YOUR WORDS</span><h2>读到这里，<br/>也想听听你。</h2></div><p>也许是一段与她有关的记忆，<br/>也许是一份珍藏的资料，或一句简单的喜欢。<br/>这本人物册，也为你的声音留一页。</p></div>
    <div className="echo-layout"><aside className="echo-note"><span className="echo-mark" aria-hidden="true">回<br/>声</span><h3>因为同一种喜欢，<br/>在这里相遇。</h3><p>不必注册，也不必留下真实姓名。用一个喜欢的昵称，写下你想说的话。</p><div className="echo-guidance"><span>一段记忆</span><p>你是从哪一年、哪个节目开始认识她的？</p><span>一份补充</span><p>找到旧影像、访谈或资料更正时，请在正文附上原链接。</p><span>一点建议</span><p>页面打不开、内容有疑问，或者想看到什么，都可以告诉整理者。</p></div><p className="echo-small">这里是独立整理的涛迷人物册。留言由网站整理者阅读，不是周涛本人的收信渠道。</p></aside>
      <form className="echo-form" onSubmit={submit}><div className="echo-form-title"><span>写给这一页</span><small>昵称即可 · 无需登录</small></div>
        {rightsContact && <p className="echo-notice">素材使用反馈已预选“只给整理者”。请附具体页面或素材、权属依据及处理诉求；如需回复，可自愿留下联系方式。请勿提交身份证件。</p>}
        {!guestbookReady && <p className="echo-notice" role="status">留言服务正在准备中，暂时无法提交。</p>}
        <label className="echo-label" htmlFor="echo-name">你的昵称<small>{visibility==='private'?'只给整理者查看':'会随公开留言展示'}</small></label><input id="echo-name" value={nickname} maxLength={30} required autoComplete="nickname" placeholder="怎么称呼你？" onChange={e=>setNickname(e.target.value)}/>
        <fieldset className="echo-kinds"><legend>这一页，想留下什么？</legend>{(Object.entries(kindLabels) as [MessageKind,string][]).map(([id,label])=><label key={id}><input type="radio" name="echo-kind" value={id} checked={kind===id} onChange={()=>{setKind(id);if(id==='feedback')setVisibility('private');}}/><span>{label}</span></label>)}</fieldset>
        <label className="echo-label" htmlFor="echo-body">你的文字<small>{body.length} / 2000</small></label><textarea id="echo-body" value={body} maxLength={2000} minLength={2} required rows={7} placeholder="从一段记忆、一句感受，或一个资料链接开始……" onChange={e=>{setBody(e.target.value);setSent('');}}/>
        <div className="echo-trap" aria-hidden="true"><label>请勿填写网站<input tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/></label></div>
        <fieldset className="echo-visibility"><legend>谁可以看到？</legend><label><input type="radio" name="echo-visibility" checked={visibility==='public'} onChange={()=>setVisibility('public')}/><span>公开留言<small>整理者确认后，展示给大家</small></span></label><label><input type="radio" name="echo-visibility" checked={visibility==='private'} onChange={()=>setVisibility('private')}/><span>只给整理者<small>用于反馈与资料补充，不公开</small></span></label></fieldset>
        <p className="echo-small">{visibility==='private'?'这份反馈只给整理者查看。如需回复，可自愿留下联系方式；请勿提交证件或无关的个人敏感资料。':'提交前请确认文字中没有需要保密的联系方式或他人隐私。留言按你选择的可见范围保存。'}</p>
        {formError&&<p className="echo-error" role="alert">{formError}</p>}{sent&&<p className="echo-success" role="status">{sent}</p>}
        <button className="echo-submit" disabled={sending||!guestbookReady} type="submit">{sending?'正在送出…':'把这一页，留在这里'}<span aria-hidden="true">↗</span></button>
      </form></div>
    <div className="echo-wall"><div className="echo-wall-heading"><div><span className="section-kicker">已经留下的声音 / ECHOES</span><h3>相逢的人，写下的字。</h3></div><span>{total===null?'等待回声':`${total} 段公开留言`}</span></div>
      {loadError?<div className="echo-empty" role="status"><p>{loadError}</p><button onClick={()=>load()}>重新读取留言 ↗</button></div>:!items.length?<div className="echo-empty" role="status"><span aria-hidden="true">✳</span><p>{loading?'正在翻开留言……':guestbookReady?'这一页还很安静，等第一位读者留下回声。':'留言开通后，大家的公开留言会出现在这里。'}</p></div>:<div className="echo-cards">{items.map(item=><article className="echo-card" key={item.id}><div className="echo-card-meta"><span>{kindLabels[item.kind]}</span><time dateTime={item.created_at}>{formatMessageDate(item.created_at)}</time></div><p className="echo-message">{item.body}</p><div className="echo-signature"><span aria-hidden="true">—</span> {item.nickname}</div>{item.reply&&<div className="echo-reply"><strong>整理者的回复</strong><p>{item.reply}</p>{item.reply_at&&<small>{formatMessageDate(item.reply_at)}</small>}</div>}</article>)}</div>}
      {total!==null&&items.length<total&&!loadError&&<button className="echo-more" disabled={loading} onClick={()=>load(items.length)}>{loading?'正在读取…':'再翻开几页 ↓'}</button>}
    </div>
    <details className="echo-privacy"><summary>关于留言与访问统计</summary><p>公开留言经过整理者确认后展示；“只给整理者”的反馈不会进入公开留言墙。昵称不是身份认证，请勿将留言视为本人或机构的正式发言。</p><p>本站记录各板块的浏览次数和匿名到访次数，帮助整理者了解哪些内容受到关注。一次到访按同一浏览器标签页连续30分钟内的浏览合并，不等于独立人数；不记录你在其他网站的浏览历史。来源只保留“微博、抖音”等类别。网络请求由 Supabase 提供服务，防刷记录使用短期散列值，不在管理页展示 IP 地址。</p><p>统计从功能开通后开始，浏览器拦截、断网或退出统计都会造成漏计。你可以关闭本浏览器的统计，仍能正常阅读和留言。</p><label className="echo-optout"><input type="checkbox" checked={optOut} onChange={e=>{setOptOut(e.target.checked);setAnalyticsDisabled(e.target.checked);}}/> 不记录本浏览器的访问统计</label></details>
    <a className="echo-manage-link" href="#manage">整理者入口 ↗</a>
  </section>;
}
