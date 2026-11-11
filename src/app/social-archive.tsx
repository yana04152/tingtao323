'use client';
import {useEffect,useRef,useState} from 'react';
import {moments,type Moment} from '../lib/archive';
import {communityRecords,communityKinds,platformEntries,type CommunityRecord} from '../lib/reading';

const categories=[{id:'all',label:'全部内容'},{id:'style',label:'写真与照片'},{id:'vlog',label:'工作 vlog'},{id:'event',label:'活动现场'},{id:'life',label:'生活日常'},{id:'words',label:'本人表达'}];
const categoryLabel=(r:CommunityRecord)=>categories.find(c=>c.id===r.category)?.label||(r.kind==='audience'?'观众旧帖':r.kind==='media'?'媒体记录':'本人表达');
const yearOf=(r:CommunityRecord)=>/^\d{4}/.test(r.date)?r.date.slice(0,4):'未标年份';

function RecordImage({record}:{record:CommunityRecord}){
  const [failed,setFailed]=useState(false);
  return record.image&&!failed?<img src={record.image} alt={`${record.title}，原帖${record.format==='video'?'视频封面':'配图'}`} loading="lazy" onError={()=>setFailed(true)}/>:<span className="social-image-fallback">{record.platform}<small>打开原帖查看</small></span>;
}

export default function SocialArchive({onOpenMoment}:{onOpenMoment:(m:Moment)=>void}){
  const [kind,setKind]=useState('self');
  useEffect(()=>{const sync=()=>{if(window.location.hash.split('/')[0]!=='#community')return;const view=window.location.hash.split('/')[1];setYear('all');setPlatform('all');setQuery('');setLimit(9);if(view==='audience'){setKind('audience');setCategory('all');setOrder('oldest');}else{setKind('self');setCategory(view&&categories.some(c=>c.id===view)?view:'all');setOrder('newest');}};sync();window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync);},[]);
  const [category,setCategory]=useState('all');
  const [platform,setPlatform]=useState('all');
  const [year,setYear]=useState('all');
  const [query,setQuery]=useState('');
  const [order,setOrder]=useState('newest');
  const [limit,setLimit]=useState(9);
  const [album,setAlbum]=useState<CommunityRecord|null>(null);
  const [photo,setPhoto]=useState(0);
  const dialog=useRef<HTMLDialogElement>(null);
  const trigger=useRef<HTMLElement|null>(null);
  const feature=communityRecords.find(r=>r.id==='weibo-green-portrait-2026')!;
  const records=communityRecords.filter(r=>(kind==='all'||r.kind===kind)&&(platform==='all'||r.platform===platform)&&(year==='all'||yearOf(r)===year)&&(category==='all'||r.category===category)&&`${r.title} ${r.description} ${r.originalTitle||''} ${r.date}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a,b)=>order==='newest'?b.date.localeCompare(a.date):a.date.localeCompare(b.date));
  const years=[...new Set(communityRecords.map(yearOf))].sort().reverse();
  const platforms=[...new Set(communityRecords.map(r=>r.platform))];
  const photos=album?.images||[];
  function openAlbum(r:CommunityRecord){trigger.current=document.activeElement as HTMLElement;setPhoto(0);setAlbum(r);}
  function closeAlbum(){setAlbum(null);}
  useEffect(()=>{if(album){dialog.current?.showModal();}else if(dialog.current?.open){dialog.current.close();trigger.current?.focus();}},[album]);
  function reset(){setKind('all');setCategory('all');setPlatform('all');setYear('all');setQuery('');setLimit(9);}
  function selectKind(value:string){setKind(value);setCategory('all');setPlatform('all');setYear('all');setQuery('');setLimit(9);}
  return <section className="community-section social-section" id="community"><div className="wrap">
    <div className="section-heading"><div><span className="section-kicker">照片与回声 / MOMENTS & MEMORIES</span><h2>镜头里的日常，<br/>岁月里的回声。</h2></div><p>{communityRecords.length} 条公开记录<span>本人相册 · 工作 vlog · 活动 · 贴吧旧帖</span></p></div>
    <p className="community-intro">正式舞台之外，还有她自己留下的照片、工作片刻与生活日记。再翻开2007年起的贴吧原帖，看看当时的观众如何记录她。</p>
    <div className="social-feature"><button className="social-feature-image" onClick={()=>openAlbum(feature)} aria-label="打开相册：绿意漫染，四张个人照片"><RecordImage record={feature}/><span>打开相册 · {feature.images?.length} 张 <b>↗</b></span></button><div className="social-feature-copy"><span className="section-kicker">MOMENTS SHE SHARED</span><h3>放慢一点，<br/>看见另一面的她。</h3><p>从摄影棚、排练厅到散步的街角。这里的本人记录来自认证账号，照片与短片都有原帖可寻。</p><span className="social-feature-source">周涛323 本人微博 · 2026.09.20 发布</span><div className="social-feature-actions"><button onClick={()=>{selectKind('self');setCategory('style');document.getElementById('social-library')?.scrollIntoView({behavior:'smooth'});}}>翻看本人照片 ↗</button><button onClick={()=>{selectKind('self');setCategory('vlog');document.getElementById('social-library')?.scrollIntoView({behavior:'smooth'});}}>走进工作 vlog ↗</button><button onClick={()=>{selectKind('audience');setOrder('oldest');document.getElementById('social-library')?.scrollIntoView({behavior:'smooth'});}}>从2007年旧帖读起 ↗</button></div></div></div>
    <div className="platform-entries">{platformEntries.map(p=><a key={p.name} href={p.url} target="_blank" rel="noreferrer"><span>{p.label}<i>↗</i></span><strong>{p.name}</strong><small>{p.detail}</small></a>)}</div>
    <div id="social-library" className="social-library">
      <div className="community-filters" aria-label="公开记录类型筛选">{communityKinds.map(k=><button key={k.id} aria-pressed={kind===k.id} className={kind===k.id?'selected':''} onClick={()=>selectKind(k.id)}>{k.label}<span>{k.id==='all'?communityRecords.length:communityRecords.filter(r=>r.kind===k.id).length}</span></button>)}</div>
      {(kind==='self'||kind==='all')&&<div className="social-category-filters" aria-label="本人记录内容筛选">{categories.map(c=><button key={c.id} className={category===c.id?'selected':''} aria-pressed={category===c.id} onClick={()=>{setCategory(c.id);setLimit(9);}}>{c.label}</button>)}</div>}
      <div className="social-search-row"><label className="search"><span aria-hidden="true">⌕</span><input type="search" aria-label="搜索公开记录" placeholder="搜索工作、活动、照片或旧帖…" value={query} onChange={e=>{setQuery(e.target.value);setLimit(9);}}/></label><select aria-label="公开记录平台" value={platform} onChange={e=>{setPlatform(e.target.value);setLimit(9);}}><option value="all">全部平台</option>{platforms.map(p=><option key={p}>{p}</option>)}</select><select aria-label="公开记录发布年份" value={year} onChange={e=>{setYear(e.target.value);setLimit(9);}}><option value="all">全部发布年份</option>{years.map(y=><option key={y}>{y}</option>)}</select><select aria-label="公开记录排序" value={order} onChange={e=>setOrder(e.target.value)}><option value="newest">从近到远</option><option value="oldest">从早到晚</option></select></div>
      <div className="social-result-meta" role="status"><span>{records.length} 条记录 · 按发布日归档</span><button onClick={reset}>重置筛选</button></div>
      {kind==='audience'&&<div className="old-post-note"><strong>2000年代，已经找到的原帖</strong><p>现已核读三条原帖：2007年的《周末喜相逢》视频分享，以及2008年的照片帖和青歌赛照片讨论。当前吧页标注建吧日期为2004年1月17日；2000—2003年的资料需从其他旧站追溯，2004—2006及2009年原帖本轮尚未找到。部分旧图缺失、播放器失效，首帖日期与节目年代分别说明。</p></div>}
      <div className={`community-grid social-grid ${kind==='audience'?'social-text-grid':''}`} aria-live="polite">{records.slice(0,limit).map(r=><article className={`community-card social-card record-${r.kind}`} key={r.id}>
        {r.image&&(r.images?.length?<button className="social-cover" onClick={()=>openAlbum(r)} aria-label={`打开相册：${r.title}`}><RecordImage record={r}/><span className="social-cover-badge">{r.images.length} 张照片 ↗</span></button>:<a className="social-cover" href={r.url} target="_blank" rel="noreferrer" aria-label={`到${r.platform}观看：${r.title}`}><RecordImage record={r}/><span className="social-cover-play" aria-hidden="true">▷</span><span className="social-cover-badge">原视频 {r.duration||''} ↗</span></a>)}
        <div className="social-card-copy"><div className="community-card-top"><span>{categoryLabel(r)}</span><small>{r.platform} · {r.date}</small></div><h3><a href={r.url} target="_blank" rel="noreferrer">{r.title}</a></h3><span className="community-author">{r.author}</span><p>{r.description}</p><details className="community-note"><summary>日期与来源说明 <span>＋</span></summary><p>{r.note}</p>{r.originalTitle&&<p>原帖标题：{r.originalTitle}</p>}{r.imageCredit&&<p>{r.imageCredit}</p>}</details><div className="community-card-bottom"><a href={r.url} target="_blank" rel="noreferrer">{r.linkLabel||'打开原记录'} ↗</a>{r.momentIds[0]&&<button onClick={()=>{const m=moments.find(m=>m.id===r.momentIds[0]);if(m)onOpenMoment(m);}}>相关人生节点 ↗</button>}</div></div>
      </article>)}</div>
      {!records.length&&<div className="empty-state"><h3>这一组暂时没有匹配的记录。</h3><p>换一个年份、平台或关键词试试。</p><button className="text-link" onClick={reset}>查看全部记录 →</button></div>}
      {records.length>limit&&<button className="load-videos" onClick={()=>setLimit(n=>n+9)}>继续翻看 <span>↓</span><small>已展示 {limit} / {records.length}</small></button>}
    </div>
    <p className="community-access-note">图片保留原帖水印与出处；短视频在发布平台观看。此处日期指发布日，拍摄日期、节目播出日与活动日期以各条说明为准。本人活动配文不自动计为任职或获奖证据。部分原帖需要登录或在App中打开，社区旧帖可能缺图、缺楼层；这里持续保留已核资料与明确的缺口。</p>
  </div>
  <dialog className="social-album" ref={dialog} onCancel={closeAlbum} onClick={e=>{if(e.target===e.currentTarget)closeAlbum();}} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();setPhoto(p=>(p+1)%photos.length);}if(e.key==='ArrowLeft'){e.preventDefault();setPhoto(p=>(p-1+photos.length)%photos.length);}}} aria-labelledby="album-title">
    {album&&<><div className="album-header"><div><small>{album.platform} · {album.date} 发布</small><h3 id="album-title">{album.title}</h3></div><button onClick={closeAlbum} autoFocus aria-label="关闭相册">×</button></div><div className="album-stage"><img src={photos[photo]} alt={`${album.title}，第${photo+1}张原帖照片`}/></div><div className="album-controls"><button aria-label="上一张照片" disabled={photos.length<2} onClick={()=>setPhoto(p=>(p-1+photos.length)%photos.length)}>← 上一张</button><span>{photo+1} / {photos.length}</span><button aria-label="下一张照片" disabled={photos.length<2} onClick={()=>setPhoto(p=>(p+1)%photos.length)}>下一张 →</button></div><div className="album-caption"><p>{album.imageCredit}。发布日不等于拍摄日。</p><a href={album.url} target="_blank" rel="noreferrer">查看本人原帖 ↗</a></div></>}
  </dialog></section>;
}
