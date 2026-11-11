'use client';
import { useEffect, useMemo, useState } from 'react';
import { moments, type Moment } from '../lib/archive';
import { videos, videoKinds, videoPeriods, videoUrl, kindLabel, platformLabel, videoTopics, matchesTopic, getVideosForMoment, type VideoClip } from '../lib/videos';

function Play({ small=false }: {small?:boolean}) {
  return <svg width={small?14:23} height={small?14:23} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 5 11 7-11 7V5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>;
}

function VideoCoverImage({clip}:{clip:VideoClip}) {
  const [failed,setFailed]=useState(false);
  return clip.thumbnail&&!failed?<img className="film-source-image" src={clip.thumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" onError={()=>setFailed(true)}/>:null;
}

export function VideoPlayer({clip,paused=false}:{clip:VideoClip;paused?:boolean}) {
  const [opened,setOpened]=useState(false);
  useEffect(()=>{if(paused)setOpened(false);},[paused]);
  useEffect(()=>{if(opened)window.dispatchEvent(new Event('zhou-tao:video-open'));},[opened]);
  const provider=platformLabel(clip);
  if(!clip.bvid)return <div className="film-player"><a className={`film-screen film-poster external-film film-${clip.kind}`} href={videoUrl(clip)} target="_blank" rel="noreferrer"><VideoCoverImage clip={clip}/><span className="film-topline">官方节目 <i/> ORIGINAL SOURCE</span><span className="film-big-year" aria-hidden="true">{clip.year}</span><span className="film-play"><Play/></span><strong>到{provider}观看 ↗</strong><span className="film-bottomline"><span>{kindLabel(clip)}</span><span>{clip.duration||'官方片段'}</span></span></a><div className="film-player-help"><span>官方原站入口</span><a href={videoUrl(clip)} target="_blank" rel="noreferrer">打开{provider} ↗</a></div><p className="film-access-note">{clip.platform==='iqiyi'?'正版节目页标注会员权益，观看条件以爱奇艺为准。':'在央视官方节目页观看，本站保留内容说明与时间线关联。'}</p></div>;
  return <div className="film-player">
    <div className={`film-screen film-${clip.kind}`}>
      {opened&&!paused ? <iframe
        key={`${clip.bvid}-${clip.page||1}`}
        src={`https://player.bilibili.com/player.html?bvid=${clip.bvid}&p=${clip.page||1}&autoplay=0&danmaku=0&poster=1`}
        title={`${clip.title}，B站播放器${clip.page?`，第${clip.page}P`:''}`}
        allow="fullscreen; picture-in-picture; encrypted-media" allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      /> : <button className="film-poster" onClick={()=>setOpened(true)} aria-label={`打开播放器：${clip.title}`}>
        <VideoCoverImage clip={clip}/>
        <span className="film-topline">岁月有声 <i/> MOTION ARCHIVE</span>
        <span className="film-big-year" aria-hidden="true">{clip.year}</span>
        <span className="film-play"><Play/></span>
        <strong>打开这段影像</strong>
        <span className="film-bottomline"><span>{kindLabel(clip)}</span><span>{clip.duration||'BILIBILI'}{clip.page?` · P${clip.page}`:''}</span></span>
      </button>}
    </div>
    <div className="film-player-help"><span>按需打开 · 片源来自 B 站</span><a href={videoUrl(clip)} target="_blank" rel="noreferrer">到 B 站观看 ↗</a></div>
    <p className="film-access-note">播放由 B 站提供；如遇登录、地区或站外播放限制，可打开原视频。</p>
  </div>;
}

export function ClipMetadata({clip}:{clip:VideoClip}) {
  return <details className="clip-metadata"><summary>片源与年代说明 <span>＋</span></summary><div>
    <p><b>原视频标题</b>{clip.originalTitle}</p>
    <p><b>收录版本</b>{clip.bvid?'UP主：':'发布平台：'}{clip.uploader}{clip.uploadedAt?` · ${clip.bvid?'上传于':'页面日期'} ${clip.uploadedAt}`:clip.bvid?' · 该片段上传日期未取得':''}</p>
    {clip.collectionUploadedAt&&<p>合集建立于 {clip.collectionUploadedAt}，不代表所选分P的上传日期。</p>}
    <p>{clip.sourceNote}</p>
    {clip.dateNote&&<p className="clip-date-note">{clip.dateNote}</p>}
    {clip.alternatives?.length&&<div className="clip-alternatives"><strong>同场附片与备选版本</strong>{clip.alternatives.map(a=><div key={a.url}><a href={a.url} target="_blank" rel="noreferrer">{a.title} · {a.duration} ↗</a><small>{a.note}</small></div>)}</div>}
    {clip.evidenceUrl&&<a href={clip.evidenceUrl} target="_blank" rel="noreferrer">查阅年代或背景的交叉来源 ↗</a>}
    <a href={videoUrl(clip)} target="_blank" rel="noreferrer">查看原视频与上传者说明 ↗</a>
  </div></details>;
}

export function MomentVideos({momentId,onBrowse}:{momentId:string;onBrowse:()=>void}) {
  const related=getVideosForMoment(momentId);
  const [activeId,setActiveId]=useState(related[0]?.id);
  const clip=related.find(v=>v.id===activeId)||related[0];
  if(!clip)return null;
  return <div className="moment-videos">
    <div className="moment-video-heading"><span className="section-kicker">边读边看 / IN MOTION</span><span>{related.length} 段相关影像</span></div>
    <div className="moment-video-choices" aria-label="选择相关影像">{related.map(v=><button key={v.id} aria-pressed={v.id===clip.id} onClick={()=>setActiveId(v.id)} className={v.id===clip.id?'selected':''}><Play small/><span><small>{v.contentDate}</small>{v.title}</span></button>)}</div>
    <VideoPlayer key={clip.id} clip={clip}/>
    <p className="moment-video-description">{clip.description}</p>
    <p className="moment-video-prompt"><b>观看线索</b>{clip.watchFor}</p>
    <ClipMetadata clip={clip}/>
    <button className="browse-videos" onClick={onBrowse}>展开全部 {videos.length} 段影像 <span>↗</span></button>
  </div>;
}

export default function VideoArchive({onOpenMoment,paused}:{onOpenMoment:(m:Moment)=>void;paused:boolean}) {
  const [activeId,setActiveId]=useState('variety-2000');
  const [kind,setKind]=useState('all');
  const [period,setPeriod]=useState('all');
  const [topic,setTopic]=useState('all');
  const [query,setQuery]=useState('');
  const [sort,setSort]=useState('oldest');
  const [limit,setLimit]=useState(12);
  const [saved,setSaved]=useState<string[]>([]);
  const [onlySaved,setOnlySaved]=useState(false);
  const [storageError,setStorageError]=useState(false);
  useEffect(()=>{try{const value=JSON.parse(localStorage.getItem('zhou-tao-video-saved-v1')||'[]');if(Array.isArray(value))setSaved(value.filter(id=>videos.some(v=>v.id===id)));}catch{setStorageError(true);}},[]);
  const active=videos.find(v=>v.id===activeId)||videos[0];
  const context=moments.find(m=>m.id===active.momentIds[0]);
  const filtered=useMemo(()=>{
    const era=videoPeriods.find(p=>p.id===period)!;
    return videos.filter(v=>matchesTopic(v,topic)&&(kind==='all'||v.kind===kind)&&(v.year>=era.from&&v.year<=era.to)&&(!onlySaved||saved.includes(v.id))&&`${v.title} ${v.originalTitle} ${v.contentDate} ${v.uploader} ${v.description}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a,b)=>sort==='newest'?b.year-a.year:a.year-b.year);
  },[kind,period,topic,query,sort,onlySaved,saved]);
  function choose(v:VideoClip){setActiveId(v.id);document.getElementById('video-viewer')?.scrollIntoView({behavior:'smooth',block:'start'});}
  function toggleSaved(id:string){const next=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];setSaved(next);try{localStorage.setItem('zhou-tao-video-saved-v1',JSON.stringify(next));setStorageError(false);}catch{setStorageError(true);}}
  function reset(){setKind('all');setPeriod('all');setTopic('all');setQuery('');setOnlySaved(false);setLimit(12);}
  return <section id="videos" className="video-section">
    <div className="wrap">
      <div className="section-heading"><div><span className="section-kicker">听见当时 / THE MOVING ARCHIVE</span><h2>让时间里的她，<br className="film-mobile-break"/>重新开口。</h2></div><p>{videos.length} 段精选影像<span>主持 · 访谈 · 幕后 · 自述 · 作品</span></p></div>
      <p className="video-prologue">文字记录走过的路，影像留下当时的声音与神情。选一段主持现场，也听一场长访谈；把作品、选择与她自己的讲述，放回同一条时间线。</p>
      <div className="viewing-routes" aria-label="推荐观看起点"><span>从这里开始</span>{[
        {id:'variety-2000',name:'初识 · 荧屏上的她'},
        {id:'jianghu-hosts-2009',name:'深谈 · 春晚幕后四十分钟'},
        {id:'chunni-bpa-interview-2017',name:'转身 · 一场长访谈'},
      ].map(r=>{const v=videos.find(x=>x.id===r.id);return v?<button key={r.id} onClick={()=>choose(v)}>{r.name} <span>↗</span></button>:null;})}</div>
      <div className="key-talks" aria-label="三场重点长谈">{[
        {id:'tom-interview-date-unconfirmed',year:'2005 · 索引年份待核',name:'TOM访谈',detail:'一小时长谈'},
        {id:'olympic-lecture-2008',year:'2008 · 深圳',name:'亲历奥运',detail:'奥运工作之后的讲述'},
        {id:'speech-2017',year:'2017.06.24 · 成都',name:'遇见更好的自己',detail:'横版讲座与直播备选'},
      ].map(t=>{const v=videos.find(v=>v.id===t.id)!;return <button key={t.id} onClick={()=>choose(v)}><small>{t.year}</small><strong>{t.name}</strong><span>{t.detail}<b>{v.duration} ↗</b></span></button>;})}</div>
      <div className="video-viewer" id="video-viewer">
        <VideoPlayer key={active.id} clip={active} paused={paused}/>
        <article className="video-story" aria-live="polite"><div className="video-story-kicker"><span>{kindLabel(active)}</span><span>{active.contentDate}</span></div><h3>{active.title}</h3>{active.dateUncertain&&<span className="date-uncertain">节目年份待核 · 视频可观看</span>}<p>{active.description}</p><div className="watch-prompt"><span>可以这样看</span><p>{active.watchFor}</p></div>{context&&<button className="video-context-link" onClick={()=>onOpenMoment(context)}><small>放回人生轨迹</small><span><b>{context.year}</b>{context.title}</span><i>展开故事 ↗</i></button>}<ClipMetadata clip={active}/></article>
      </div>
      <div className="video-library" id="video-library">
        <div className="video-library-title"><h3>影像目录</h3><span>以内容年代为线索，上传年份单独标注</span></div>
        <div className="video-topic-filters" aria-label="观看专题">{videoTopics.map(t=><button key={t.id} className={topic===t.id?'selected':''} aria-pressed={topic===t.id} onClick={()=>{setTopic(t.id);setKind('all');setPeriod('all');setQuery('');setOnlySaved(false);setLimit(12);}}>{t.label}</button>)}</div>
        <div className="video-type-filters" aria-label="影像类型筛选">{videoKinds.map(k=><button key={k.id} aria-pressed={kind===k.id} className={kind===k.id?'selected':''} onClick={()=>{setKind(k.id);setLimit(12);}}>{k.label}<span>{k.id==='all'?videos.length:videos.filter(v=>v.kind===k.id).length}</span></button>)}</div>
        <div className="video-search-row"><label className="search"><span aria-hidden="true">⌕</span><input type="search" aria-label="搜索影像" placeholder="搜索节目、年份、关键词或上传者…" value={query} onChange={e=>{setQuery(e.target.value);setLimit(12);}}/></label><label className="film-select"><span className="sr-only">影像年代</span><select value={period} onChange={e=>{setPeriod(e.target.value);setLimit(12);}}>{videoPeriods.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></label><label className="film-select"><span className="sr-only">排列顺序</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="oldest">年代从早到晚</option><option value="newest">年代从近到远</option></select></label><button className={`film-saved-filter ${onlySaved?'selected':''}`} aria-pressed={onlySaved} onClick={()=>{setOnlySaved(v=>!v);setLimit(12);}}>稍后再看 <b>{saved.length}</b></button></div>
        <div className="video-result-meta" role="status"><span>找到 {filtered.length} 段影像{topic!=='all'?` · ${videoTopics.find(t=>t.id===topic)?.label}`:''}{onlySaved?' · 我的稍后再看':''}</span>{(kind!=='all'||period!=='all'||topic!=='all'||query||onlySaved)&&<button onClick={reset}>清除筛选</button>}</div>
        {storageError&&<p className="storage-note">当前浏览器无法保存“稍后再看”，本次浏览中的标记仍有效。</p>}
        {filtered.length?<div className="video-grid">{filtered.slice(0,limit).map((v,i)=><article key={v.id} className={`video-card ${active.id===v.id?'is-current':''}`}><button className={`video-card-cover film-${v.kind}`} onClick={()=>choose(v)} aria-label={`观看：${v.title}`}><VideoCoverImage clip={v}/><span className="card-film-number">ARCHIVE / {String(videos.indexOf(v)+1).padStart(2,'0')}</span><span className="card-film-year">{v.year}</span><span className="card-film-play"><Play/></span><span className="card-film-bottom"><span>{kindLabel(v)}</span><span>{v.duration||'影像资料'}{v.page?` · P${v.page}`:''}</span></span></button><div className="video-card-body"><span className="video-card-date">{v.contentDate}</span><h4><button onClick={()=>choose(v)}>{v.title}</button></h4><p>{v.description}</p><div className="video-card-footer"><button className="video-card-watch" onClick={()=>choose(v)}>{active.id===v.id?'当前选中':'观看影像'} <span>↗</span></button><button className={`video-save ${saved.includes(v.id)?'selected':''}`} aria-pressed={saved.includes(v.id)} aria-label={`${saved.includes(v.id)?'移出':'加入'}稍后再看：${v.title}`} onClick={()=>toggleSaved(v.id)}>{saved.includes(v.id)?'✓ 已加入':'+ 稍后再看'}</button></div></div></article>)}</div>:<div className="empty-state"><span className="empty-symbol">✧</span><h3>{onlySaved?'留几段，慢慢看。':'暂时没有匹配的影像。'}</h3><p>{onlySaved?'点选影像旁的“稍后再看”，下次在这个浏览器里继续。':'试试节目名，或换一个年代与类型。'}</p><button className="text-link" onClick={reset}>回到全部影像 →</button></div>}
        {filtered.length>limit&&<button className="load-videos" onClick={()=>setLimit(n=>n+12)}>继续展开 {Math.min(12,filtered.length-limit)} 段 <span>↓</span><small>已展示 {limit} / {filtered.length}</small></button>}
      </div>
      <p className="video-curation-note">收录的是可追溯的节目片段与公开访谈。B站个人上传不等于官方发布；片段年代优先依据原节目、标题和简介，存在不确定性的地方单独说明。影片版权归原权利人，本站提供观看与查阅入口。</p>
    </div>
  </section>;
}

export function VideoReferences(){return <details><summary>影像来源目录<span>{videos.length} 条 ↓</span></summary><ol className="source-list">{videos.map((v,i)=><li key={v.id}><span>{String(i+1).padStart(2,'0')}</span><a href={videoUrl(v)} target="_blank" rel="noreferrer"><small>{v.contentDate} · {platformLabel(v)} / {v.uploader}{v.page?` · P${v.page}`:''}</small>{v.originalTitle}<small>{v.bvid?'此版本上传':'页面日期'}：{v.uploadedAt||'该片段日期未取得'}</small></a></li>)}</ol></details>;}
