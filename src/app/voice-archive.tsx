'use client';
import {useState} from 'react';
import records from '../lib/voice-records.json';
import {getSource,moments,type Moment} from '../lib/archive';

const themes=['全部','选择','创作','学习','生活','音乐'];
export default function VoiceArchive({onOpenMoment}:{onOpenMoment:(m:Moment)=>void}){
  const [theme,setTheme]=useState('全部');
  const [recent,setRecent]=useState(false);
  const visible=records.filter(q=>theme==='全部'||q.theme===theme).sort((a,b)=>recent?b.date.localeCompare(a.date):a.date.localeCompare(b.date));
  return <section id="voices" className="voices-section wrap">
    <header className="extension-heading"><div><span className="section-kicker">她说过的话 / IN HER OWN WORDS</span><h2>一句话，<br/>也有它的来处。</h2></div><div><p>在选择发生的时候，听她谈取舍；<br/>在创作遇到困难的时候，听她谈学习。</p><p className="extension-subtle">这里收录可以追溯的本人发言。每段节录都保留当时的问题和出处，让话语重新落回生活。</p></div></header>
    <div className="voices-intro-strip"><span><b>2002—2023</b> 二十余年的交谈片段</span><span>{records.length} 段原话 · {new Set(records.map(r=>r.source)).size} 篇访谈</span></div>
    <div className="voice-filter"><div role="group" aria-label="语录主题">{themes.map(t=><button key={t} onClick={()=>setTheme(t)} aria-pressed={theme===t}>{t}<small>{t==='全部'?records.length:records.filter(q=>q.theme===t).length}</small></button>)}</div><button className="voice-order" onClick={()=>setRecent(v=>!v)}>{recent?'由近及远 ↓':'由早及近 ↑'}</button></div>
    <p className="voice-result" role="status">{theme==='全部'?'沿着时间，读她自己的表达':`${theme} · 把这些话放在一起读`} <span>{visible.length} 段</span></p>
    <div className="voice-pages">{visible.map(q=>{const s=getSource(q.source);const m=moments.find(m=>q.momentIds.includes(m.id));return <article className={`voice-page voice-theme-${q.theme}`} key={q.id}><div className="voice-page-top"><time dateTime={q.date}>{q.date.slice(0,4)}</time><span>{q.topic}</span><small>原文节录</small></div><blockquote>“{q.text}”</blockquote><div className="voice-context"><span>她在谈什么</span><p>{q.context}</p></div><div className="voice-page-bottom"><a href={s.url} target="_blank" rel="noreferrer">{s.publisher}<small>{q.date} · 收录页发表日期 ↗</small></a>{m&&<button onClick={()=>onOpenMoment(m)}>回到这段经历 ↗</button>}</div><details className="voice-source-note"><summary>原文位置与日期说明 <span>＋</span></summary><p>{s.title}</p>{q.byline&&<p>{q.byline}</p>}<p>{q.form}。原文位置：{q.locator}。</p><p>{q.dateNote}。</p>{q.access.includes('导言')&&<p>本条只取公开导言中的直接引语；其余正文需在原站登录阅读。</p>}</details></article>;})}</div>
    <aside className="voice-reading-note"><span className="section-kicker">从片段，回到完整的交谈</span><h3>想再多听她说一会儿。</h3><p>文字节录只是一个入口。TOM长谈、奥运之后的讲座、成都的演讲，都可以留出更长的时间慢慢听。</p><div><a href="#videos">打开影像与长谈 →</a><a href="#reading">继续读访谈原文 →</a><a href="#atlas">从作品与足迹认识她 →</a></div></aside>
    <p className="extension-method">引语均为公开文字资料中明确归于周涛的直接发言，节录保留原文字形；主题和上下文说明为本站整理。发表日期不自动等于采访日期，也不将一句话当作她在所有时期的固定立场。</p>
  </section>;
}
