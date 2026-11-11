'use client';
import {useState} from 'react';
import SocialArchive from './social-archive';
import {getSource,moments,type Moment} from '../lib/archive';
import {deepReadings,communityRecords,communityKinds,platformEntries,getRelatedRecords} from '../lib/reading';

export function DeepReading({onOpenMoment}:{onOpenMoment:(moment:Moment)=>void}){
  const [era,setEra]=useState('all');
  const [limit,setLimit]=useState(8);
  const readings=deepReadings.filter(r=>era==='all'||(era==='early'?Number(r.year)<2010:era==='middle'?Number(r.year)>=2010&&Number(r.year)<2020:Number(r.year)>=2020)).sort((a,b)=>Number(a.year)-Number(b.year));
  return <section className="deep-reading wrap" id="reading">
    <div className="section-heading"><div><span className="section-kicker">她自己的讲述 / IN HER WORDS</span><h2>留一点时间，<br/>听她慢慢讲。</h2></div><p>{deepReadings.length} 份长阅读<span>在不同年代，回到本人讲述的现场</span></p></div>
    <div className="reading-filters" aria-label="访谈年代筛选">{[{id:'all',label:'全部访谈与阅读'},{id:'early',label:'2000年代'},{id:'middle',label:'2010年代'},{id:'recent',label:'2020年至今'}].map(t=><button key={t.id} className={era===t.id?'selected':''} aria-pressed={era===t.id} onClick={()=>{setEra(t.id);setLimit(8);}}>{t.label}</button>)}</div>
    <div className="reading-list">{readings.slice(0,limit).map((r,i)=>{const source=getSource(r.source);return <article key={r.source} className="reading-row"><div className="reading-year">{r.year}<small>READ / {String(i+1).padStart(2,'0')}</small></div><div><span className="reading-tag">{r.tag}</span><h3><a href={source.url} target="_blank" rel="noreferrer">{r.title} <span>↗</span></a></h3><p>{r.description}</p><small className="reading-publisher">{source.publisher} · {source.date}</small>{r.dateNote&&<p className="reading-date-note">{r.dateNote}</p>}</div><button className="reading-context" onClick={()=>onOpenMoment(moments.find(m=>m.id===r.momentId)!)}>对应的人生节点 <span>↗</span></button></article>;})}</div>
    {readings.length>limit&&<button className="load-videos" onClick={()=>setLimit(n=>n+8)}>继续展开访谈与阅读 <span>↓</span><small>已展示 {limit} / {readings.length}</small></button>}
    <p className="reading-footnote">这里提供简要导读与原文入口。人物稿中的回忆、当时的计划与后来已经发生的事实，在时间线上分别核对。</p>
  </section>;
}

export function CommunityArchive({onOpenMoment}:{onOpenMoment:(moment:Moment)=>void}){
  return <SocialArchive onOpenMoment={onOpenMoment}/>;
}

export function MomentClippings({momentId}:{momentId:string}){
  const records=getRelatedRecords(momentId);
  if(!records.length)return null;
  return <div className="moment-clippings"><span className="section-kicker">另一份记录 / MORE TO READ</span>{records.map(r=><a href={r.url} key={r.id} target="_blank" rel="noreferrer"><small>{r.platform} · {r.date} · {communityKinds.find(k=>k.id===r.kind)?.label}</small><strong>{r.title}<span>↗</span></strong><p>{r.description}</p></a>)}</div>;
}
