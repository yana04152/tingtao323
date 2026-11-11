'use client';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { chapters, moments, sources, works, getSource, type Moment } from '../lib/archive';
import VideoArchive, { MomentVideos, VideoReferences } from './video-archive';
import { videos, getVideosForMoment } from '../lib/videos';
import { DeepReading, CommunityArchive, MomentClippings } from './reading-archive';
import { getRelatedRecords } from '../lib/reading';
import './videos.css';
import './reading.css';
import './social.css';
import CareerDossier from './career-dossier';
import './career.css';
import StoryJourney from './story-journey';
import './story.css';
import ReadingMusic from './reading-music';
import VoiceArchive from './voice-archive';
import ConnectionAtlas from './connection-atlas';
import './connections.css';
import './reading-music.css';
import Guestbook from './guestbook';
import GuestbookAdmin from './guestbook-admin';
import SiteNotice from './site-notice';
import { returningToDesk, trackPanel } from '../lib/guestbook';

const archivePanels=[{id:'timeline',label:'完整年表'},{id:'videos',label:'影像与长谈'},{id:'career',label:'工作与荣誉'},{id:'works',label:'作品索引'},{id:'reading',label:'访谈阅读'},{id:'community',label:'照片与旧帖'},{id:'atlas',label:'足迹与作品'},{id:'voices',label:'她说过的话'},{id:'sources',label:'参考来源'},{id:'guestbook',label:'回声 · 留言'}];

function Icon({name,size=20}:{name:string;size?:number}){
  const paths:Record<string,ReactNode>={
    arrow:<path d="M5 12h14M12 5l7 7-7 7"/>,external:<path d="M7 17 17 7M7 7h10v10"/>,down:<path d="M12 4v16m-6-6 6 6 6-6"/>,
    search:<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></>,bookmark:<path d="M6 4h12v17l-6-4-6 4V4Z"/>,close:<path d="m6 6 12 12M18 6 6 18"/>,left:<path d="m14 6-6 6 6 6"/>,right:<path d="m10 6 6 6-6 6"/>
  };return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]||paths.arrow}</svg>;
}
export default function Home(){
  const [chapter,setChapter]=useState('all');
  const [panel,setPanel]=useState(()=>{const base=window.location.hash.slice(1).split('/')[0];return base==='manage'||(returningToDesk&&(!base||base.includes('=')))?'manage':archivePanels.some(p=>p.id===base)?base:'home';});
  useEffect(()=>{const sync=()=>{const base=window.location.hash.slice(1).split('/')[0];setPanel(base==='manage'||(returningToDesk&&(!base||base.includes('=')))?'manage':archivePanels.some(p=>p.id===base)?base:'home');};sync();window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync);},[]);
  useEffect(()=>{const id=window.location.hash.slice(1).split('/')[0];if(id)requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({block:'start'}));},[panel]);
  useEffect(()=>{void trackPanel(panel);},[panel]);
  const [query,setQuery]=useState('');
  const [saved,setSaved]=useState<string[]>([]);
  const [onlySaved,setOnlySaved]=useState(false);
  const [storageError,setStorageError]=useState(false);
  const [selected,setSelected]=useState<Moment|null>(null);
  const dialogRef=useRef<HTMLDialogElement>(null);
  useEffect(()=>{try{const stored=JSON.parse(localStorage.getItem('zhou-tao-moments-v1')||'[]');if(Array.isArray(stored))setSaved(stored.filter(id=>typeof id==='string'&&moments.some(m=>m.id===id)));}catch{setStorageError(true);}},[]);
  useEffect(()=>{if(selected){dialogRef.current?.showModal();document.body.style.overflow='hidden';}else{dialogRef.current?.close();document.body.style.overflow='';}return()=>{document.body.style.overflow='';};},[selected]);
  function toggleSaved(id:string){const next=saved.includes(id)?saved.filter(s=>s!==id):[...saved,id];setSaved(next);try{localStorage.setItem('zhou-tao-moments-v1',JSON.stringify(next));setStorageError(false);}catch{setStorageError(true);}}
  function goToChapter(id:string){setChapter(id);setOnlySaved(false);setQuery('');window.location.hash='timeline';}
  function reset(){setChapter('all');setQuery('');setOnlySaved(false);}
  const visible=useMemo(()=>moments.filter(m=>(chapter==='all'||m.chapter===chapter)&&(!onlySaved||saved.includes(m.id))&&`${m.year} ${m.role} ${m.title} ${m.text} ${m.detail}`.toLowerCase().includes(query.trim().toLowerCase())),[chapter,onlySaved,saved,query]);
  const selectedIndex=selected?moments.findIndex(m=>m.id===selected.id):-1;
  const selectedHasMedia=!!selected&&(getVideosForMoment(selected.id).length>0||getRelatedRecords(selected.id).length>0);
  return <>
    <a className="skip-link" href={panel==='home'?'#story':`#${panel}`}>跳转到主要内容</a>
    <header className="site-header"><a className="brand" href="#home" aria-label="岁月有声，回到首页"><span className="seal">涛</span><span>岁月有声<small>ZHOU TAO · A LIFE IN VOICE</small></span></a><nav aria-label="主要导航"><a href="#home" aria-current={panel==='home'?'page':undefined}>读她的人生</a><a href="#videos" aria-current={panel==='videos'?'page':undefined}>听她说</a><a href="#community" aria-current={panel==='community'?'page':undefined}>看见日常</a><a href="#timeline" aria-current={panel!=='home'&&panel!=='videos'&&panel!=='community'?'page':undefined}>查阅档案</a></nav><button aria-label={`我的收藏，${saved.length}个节点`} className={`header-save ${onlySaved?'active':''}`} onClick={()=>{setOnlySaved(true);setChapter('all');setQuery('');window.location.hash='timeline';}}><Icon name="bookmark" size={16}/><span>我的收藏</span><b>{saved.length.toString().padStart(2,'0')}</b></button></header>
    <main className={panel==='home'?'story-view':'archive-view'}>
      {panel==='home'&&<>
      <section className="hero wrap" id="home"><div className="hero-copy"><div className="eyebrow"><span className="short-line"/>一份因喜欢而开始的人物册</div><h1><span>周涛</span><em>岁月有声，<br/>人生有回响。</em></h1><p className="hero-description">从荧屏前熟悉的声音，到舞台背后的创作者。<br className="desktop-break"/>沿着时间，认识她的每一次出发。</p><a className="primary-link" href="#story">从第一页，慢慢读起<Icon name="arrow"/></a><a href="#videos" className="hero-video-link">想先听听她的声音 ↗</a><div className="hero-meta"><span>1968 — 2026</span><i/>成长 · 主持 · 创作 · 舞台</div></div><div className="hero-visual"><span className="vertical-label">把热爱，交给时间。</span><div className="photo-frame"><img src="./images/zhou-tao-cctv.png" alt="周涛手持话筒、微笑面对镜头，央视网2015年人物报道配图" width="419" height="494" fetchPriority="high"/><div className="photo-footer"><span>ZHOU TAO</span><span>周 涛</span></div></div><div className="portrait-stamp">人物<br/><span>志</span></div><a className="image-credit" href={getSource('choice').url} target="_blank" rel="noreferrer">人物图片 · 央视网 2015 <Icon name="external" size={12}/></a></div><a className="scroll-cue" href="#story"><span>往下读，故事慢慢展开</span><Icon name="down" size={17}/></a></section>
      <section className="intro wrap"><span className="section-kicker">写在前面 / PROLOGUE</span><h2>喜欢一个人，<br/>也想读懂她走过的路。</h2><div><p>也许，你是在某一年的春晚记住她；也许，是一次访谈、一场朗诵，或一个笑容。熟悉是开始，往后还有很多值得慢慢认识的侧面。</p><p className="muted">这本人物册沿着五个阶段展开。读到一段经历，就停下来听一段当时的声音；看完，再回到故事里。那些工作、选择与日常，共同构成我们想要珍藏的周涛。</p></div></section>
      <StoryJourney onOpenMoment={setSelected} onBrowseChapter={goToChapter}/>
      <section className="echo-home-link wrap"><div><span className="section-kicker">故事之后，还有你的声音 / ECHOES</span><h2>读到这里，也想听听你。</h2><p>留下一段与她有关的记忆，分享一份资料，或告诉我们怎样让这本人物册更好。</p></div><a href="#guestbook">到留言页，留下回声 ↗</a></section>
      </>}
      {panel!=='home'&&<div className="archive-shell"><div className="wrap"><div className="archive-shell-top"><div><h1>岁月的底本</h1><p>把想多了解的一段，读得更深。<br/>{moments.length} 个节点 · {videos.length} 段影像 · {sources.length} 条图文来源</p></div><a className="archive-return" href="#home">← 回到人物册，继续读故事</a></div></div></div>}
      {panel!=='home'&&<div className="archive-navigation"><nav className="wrap archive-tabs" aria-label="档案分册">{archivePanels.map(p=><a href={`#${p.id}`} key={p.id} aria-current={panel===p.id?'page':undefined}>{p.label}</a>)}</nav></div>}
      {panel==='timeline'&&<>
      <section className="timeline-section wrap" id="timeline"><div className="section-heading"><div><span className="section-kicker">沿时间查阅 / THE TIMELINE</span><h2>沿着时间，读她。</h2></div><p>{moments.length} 个公开节点<span>资料核对至 2026.11.09</span></p></div><div className="timeline-layout"><aside className="timeline-nav" aria-label="时间线章节筛选"><span className="aside-label">选择一个章节</span>{chapters.map(c=><button key={c.id} className={chapter===c.id?'selected':''} aria-pressed={chapter===c.id} onClick={()=>setChapter(c.id)}><span>{c.number}</span><div>{c.title}<small>{c.years}</small></div><Icon name="arrow" size={15}/></button>)}<div className="reading-note"><span className="tiny-star">✳</span><p>每一次转身，<br/>都可以是新的起点。</p><small>点击节点，展开故事与来源。</small></div></aside><div className="timeline-content"><div className="timeline-tools"><label className="search"><Icon name="search" size={18}/><input type="search" aria-label="搜索年份、作品或身份" placeholder="搜索年份、作品或身份…" value={query} onChange={e=>setQuery(e.target.value)}/></label><button className={`saved-filter ${onlySaved?'active':''}`} aria-pressed={onlySaved} onClick={()=>setOnlySaved(v=>!v)}><Icon name="bookmark" size={16}/>{onlySaved?'已收藏':'只看收藏'}</button></div><div className="result-meta" role="status"><span>{query?`“${query}” · `:''}{onlySaved?'我的收藏':chapters.find(c=>c.id===chapter)?.title}<em>{visible.length} 个节点</em></span>{(query||onlySaved||chapter!=='all')&&<button onClick={reset}>查看全部</button>}</div>{storageError&&<p className="storage-note" role="status">当前浏览器无法保存收藏；本次浏览中的标记仍然有效。</p>}
      {visible.length===0?<div className="empty-state"><span className="empty-symbol">✧</span><h3>{onlySaved?'把喜欢的片段，留在这里。':'这一页，暂时没有找到。'}</h3><p>{onlySaved?'点击时间线中的书签，就能收藏想重温的节点。':'换一个年份、作品名，或查看全部人生轨迹。'}</p><button className="text-link" onClick={reset}>回到完整时间线<Icon name="arrow" size={17}/></button></div>:chapters.slice(1).map(c=>{const group=visible.filter(m=>m.chapter===c.id);if(!group.length)return null;return <div className="timeline-group" key={c.id}><div className="group-heading"><span>第{['一','二','三','四','五'][Number(c.number)-1]}章</span><h3>{c.title}</h3><p>{c.intro}</p></div><div className="moment-list">{group.map(m=><article className={`moment ${m.featured?'moment-featured':''}`} key={m.id}><div className="moment-year">{m.year}<small>{m.date||''}</small></div><div className="moment-dot"/><div className="moment-body"><div className="moment-top"><span className="role-label">{m.role}</span><button className={`bookmark ${saved.includes(m.id)?'is-saved':''}`} onClick={()=>toggleSaved(m.id)} aria-label={`${saved.includes(m.id)?'取消收藏':'收藏'}：${m.title}`} aria-pressed={saved.includes(m.id)} title={saved.includes(m.id)?'已收藏':'收藏这个节点'}><Icon name="bookmark" size={17}/></button></div><h4><button onClick={()=>setSelected(m)}>{m.title}</button></h4><p>{m.text}</p>{m.note&&<span className="note-label">附资料说明</span>}<button className="moment-more" onClick={()=>setSelected(m)}>展开这一页<Icon name="external" size={14}/></button>{getVideosForMoment(m.id).length>0&&<button className="moment-video-link" onClick={()=>setSelected(m)}><span aria-hidden="true">▷</span> 看相关影像 · {getVideosForMoment(m.id).length} 段相关影像</button>}</div></article>)}</div></div>;})}<p className="timeline-end"><span/>时间线仍有下一页<span/></p></div></div></section>
      </>}
      {panel==='videos'&&<VideoArchive onOpenMoment={setSelected} paused={!!selected}/>}
      {panel==='career'&&<CareerDossier onOpenMoment={setSelected}/>}
      {panel==='works'&&<>
      <section className="works-section" id="works"><div className="wrap"><div className="section-heading"><div><span className="section-kicker">从作品出发 / SELECTED WORKS</span><h2>从作品，重新认识她。</h2></div><p>{works.length} 个作品入口<span>选一部作品，走近一种身份</span></p></div><div className="works-grid">{works.map((w,i)=><article className="work" key={w.id}><button className={`work-cover ${w.className}`} onClick={()=>setSelected(moments.find(m=>m.id===w.id)!)} aria-label={`了解${w.name}`}>{w.image?<img src={w.image} alt={w.name==='中国'?'纪录片《中国》第一季海报，来源：中国新闻网':'《丰收中国》官方报道中的演出资料图，来源：国家大剧院'} loading="lazy"/>:<><span className="cover-no">COLLECTION / {String(i+1).padStart(2,'0')}</span><span className="cover-decoration" aria-hidden="true"/><strong>{w.name}</strong><span className="cover-sub">ZHOU TAO · {w.label}</span></>}<span className="cover-arrow"><Icon name="external" size={20}/></span></button><div className="work-info"><span>{w.label}<i>{w.year}</i></span><h3>{w.name}</h3><p>{w.description}</p><a href={getSource(w.source).url} target="_blank" rel="noreferrer">{w.image?'资料与图片出处':'阅读相关报道'}<Icon name="external" size={14}/></a></div></article>)}</div><p className="work-note">图文用于人物资料阅读。无照片的作品封面为本站文字设计；所有作品权利归原权利人所有。</p></div></section>
      </>}
      {panel==='reading'&&<DeepReading onOpenMoment={setSelected}/>}
      {panel==='community'&&<CommunityArchive onOpenMoment={setSelected}/>}
      {panel==='guestbook'&&<Guestbook/>}
      {panel==='manage'&&<GuestbookAdmin/>}
      {panel==='voices'&&<VoiceArchive onOpenMoment={setSelected}/>}
      {panel==='atlas'&&<ConnectionAtlas onOpenMoment={setSelected}/>}
      {panel==='sources'&&<>
      <section className="sources-section wrap" id="sources"><div className="source-intro"><span className="section-kicker">每一页的来处 / REFERENCES</span><h2>让每一段故事，<br/>都有来处。</h2><p>优先使用央视、演出机构及主流媒体的公开报道。事实、本人表达与编辑解读分别呈现，方便你继续查阅。</p><p className="muted">资料核对日期：2026年11月9日。<br/>年表、影像、长阅读与社区记录相互关联。<br/>公开资料有缺漏，不等同于逐日活动全集。</p></div><div className="source-details"><details><summary>资料与整理说明<span>展开 <Icon name="down" size={14}/></span></summary><div className="method-notes"><p><b>入台年份：</b>北京电视台工作起点在不同资料中记为1992年或1993年，因此采用“1990年代初”。</p><p><b>春晚次数：</b>连续16年指1996—2011年；另有2016年回归，累计17届。</p><p><b>角色关系：</b>时间线记录新增经历，不表示她完全结束其他工作。职位只描述报道当时的任职，不推定后续所有年份。</p><p><b>来源校读：</b>部分旧人物稿含年份笔误，本档案以同时期报道和交叉核对后的明确时间为准。出生、求学与事业资料均附出处。</p><p><b>图片：</b>首页肖像来自央视网2015年人物报道；章节中的旧影像图片为对应收录版本的封面，照片保留原图水印。相册与工作日记来自周涛本人认证账号，发布日与拍摄日分别说明；《中国》《丰收中国》配图见对应作品出处。</p><p><b>影像：</b>视频与节点按内容年代关联；后来回顾的访谈和后上传的旧节目分别注明。原视频来自B站等公开平台，个人上传不等于官方发布；播放器可用性由原平台决定。</p><p><b>社区资料：</b>本人账号、媒体记录与观众整理分别标识。旧帖以首帖日期归档；小红书部分单篇链接需要App，提供标题检索入口。未核实的传闻不作为人物经历。</p><p><b>足迹与作品：</b>城市、节目类别、年代与身份按已收录资料关联，地点依据可逐条展开。家乡、求学、工作基地与公开活动分别说明，不据节目巡演推定本人到访。</p><p><b>本人语录：</b>仅收录可追溯的直接发言，附发表日期、上下文及原文位置；主题为本站整理。</p><p><b>阅读配乐：</b>萨蒂《第一号吉姆诺佩蒂》，Kevin MacLeod编配演奏，录音采用CC BY 3.0许可。完整署名与来源见右下角配乐说明。</p><p><b>收藏：</b>节点收藏与“稍后再看”保存在当前浏览器中，不会跨设备同步；清理浏览器数据后会消失。</p></div></details><details><summary>完整参考来源<span>{sources.length} 条 <Icon name="down" size={14}/></span></summary><ol className="source-list">{sources.map((s,i)=><li key={s.id}><span>{(i+1).toString().padStart(2,'0')}</span><a href={s.url} target="_blank" rel="noreferrer"><small>{s.publisher} · {s.date}</small>{s.title}<Icon name="external" size={14}/></a></li>)}</ol></details><VideoReferences/></div></section>
      </>}
    </main>
    <footer className="site-footer"><div className="wrap"><a className="footer-title" href="#home">周涛<span>岁月有声</span></a><p>一份因喜欢而开始、可以反复翻阅的人物册。<br/><span>独立整理 · 非本人或所属机构官方网站</span></p><div className="echo-footer-links"><a href="#guestbook">留言与反馈 ↗</a><a href="#home" className="back-top">回到开篇<Icon name="arrow" size={17}/></a></div></div><SiteNotice/></footer>
    <ReadingMusic/>
    <dialog ref={dialogRef} className={`moment-dialog ${selectedHasMedia?'with-video':''}`} aria-labelledby="dialog-title" onClose={()=>setSelected(null)} onClick={e=>{if(e.target===e.currentTarget)setSelected(null);}}>{selected&&<div className="dialog-inner">
      <button className="dialog-close" onClick={()=>setSelected(null)} aria-label="关闭故事"><Icon name="close"/></button>
      <div className="dialog-kicker"><span>{chapters.find(c=>c.id===selected.chapter)?.title}</span><span>{selected.role}</span></div>
      <div className="dialog-year">{selected.year}<small>{selected.date}</small></div><h2 id="dialog-title">{selected.title}</h2><p className="dialog-lead">{selected.text}</p>
      <div className="dialog-columns"><div className="dialog-story"><p className="dialog-detail">{selected.detail}</p>{selected.note&&<aside className="fact-note"><b>资料说明</b><p>{selected.note}</p></aside>}<div className="reading-angle"><span>阅读线索 · 编辑解读</span><p>{selected.reading}</p></div><div className="dialog-sources"><h3>这段故事的出处</h3>{selected.sources.map(id=>{const s=getSource(id);return <a href={s.url} key={id} target="_blank" rel="noreferrer"><div><small>{s.publisher} · {s.date}</small><span>{s.title}</span></div><Icon name="external" size={17}/></a>;})}</div></div>
      {selectedHasMedia&&<aside className="dialog-video-column"><MomentVideos key={selected.id} momentId={selected.id} onBrowse={()=>{setSelected(null);window.location.hash='videos';}}/><MomentClippings momentId={selected.id}/></aside>}</div>
      <div className="dialog-bottom"><button className={`dialog-save ${saved.includes(selected.id)?'active':''}`} onClick={()=>toggleSaved(selected.id)} aria-pressed={saved.includes(selected.id)}><Icon name="bookmark" size={16}/>{saved.includes(selected.id)?'已收藏这一页':'收藏这一页'}</button><div><button disabled={selectedIndex===0} aria-label="上一个人生节点" onClick={()=>{setSelected(moments[selectedIndex-1]);dialogRef.current?.scrollTo(0,0);}}><Icon name="left" size={18}/></button><span>{selectedIndex+1} / {moments.length}</span><button disabled={selectedIndex===moments.length-1} aria-label="下一个人生节点" onClick={()=>{setSelected(moments[selectedIndex+1]);dialogRef.current?.scrollTo(0,0);}}><Icon name="right" size={18}/></button></div></div>
    </div>}</dialog>
  </>;
}
