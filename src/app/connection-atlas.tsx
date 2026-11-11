'use client';
import {Fragment,useEffect,useMemo,useState} from 'react';
import {getSource,type Moment} from '../lib/archive';
import {categories,cities,connectionNodes,locations,locationKinds,periods,roles,workGroups,type ConnectionNode} from '../lib/connections';

type Filter={period:string;city:string;category:string;role:string;work:string};
const initial:Filter={period:'',city:'',category:'',role:'',work:''};
const cityNotes:Record<string,string>={
  harbin:'从1996年的开幕式主持，到2023、2025年的总导演，再到音乐剧制作；一座城，连接起不同的舞台身份。',
  beijing:'这里是长期求学与工作的城市。机构任职、演出现场和回校分享并列阅读，不将它们换算成旅行次数。',
  huainan:'一端是成长的起点，一端是2008年回到家乡传递奥运圣火。',
  xian:'1996年第一次主持央视春晚，地点在西安会场。',
  shenzhen:'奥运会结束之后，她在深圳讲述自己亲历的赛会工作。',
  chengdu:'2017年的“遇见更好的自己”讲座，把职业转身后的思考留在成都。',
  shanghai:'2014年亚信峰会文艺晚会，留下另一种国际活动主持现场。',
  nanjing:'2018年《情书》在南京演出。把同一部作品放回不同城市，观察舞台实践怎样延续。',
  changsha:'2018年《情书》长沙巡演，已有实际演出报道可追溯。',
  putian:'2018年第五届世界佛教论坛，她同时承担总导演与主持工作。',
  chuzhou:'2022年安徽省运会系列活动，从实地筹备到开闭幕式，留下导演工作的地点证据。',
  hangzhou:'2023年休博会与西博会开幕式，收录其现场主持经历。',
  chongqing:'2026年《五十公里桃花坞6》的发布会与录制，在新的节目场景中相遇。',
};

export default function ConnectionAtlas({onOpenMoment}:{onOpenMoment:(m:Moment)=>void}){
  const [filter,setFilter]=useState<Filter>(initial);
  const [limit,setLimit]=useState(16);
  useEffect(()=>setLimit(16),[filter]);
  function update(key:keyof Filter,value:string){setFilter(f=>({...f,[key]:f[key]===value?'':value}));}
  function matches(node:ConnectionNode,ignore:(keyof Filter)[]=[]){
    return (ignore.includes('period')||!filter.period||node.period===filter.period)&&
      (ignore.includes('city')||!filter.city||node.locations.some(l=>l.city===filter.city))&&
      (ignore.includes('category')||!filter.category||node.category===filter.category)&&
      (ignore.includes('role')||!filter.role||node.roles.includes(filter.role))&&
      (ignore.includes('work')||!filter.work||node.works.includes(filter.work));
  }
  const visible=useMemo(()=>connectionNodes.filter(n=>matches(n)),[filter]);
  const mapNodes=connectionNodes.filter(n=>matches(n,['city']));
  const cityCounts=Object.fromEntries(cities.map(c=>[c.id,mapNodes.filter(n=>n.locations.some(l=>l.city===c.id)).length]));
  const roleCounts=Object.fromEntries(roles.map(r=>[r.id,connectionNodes.filter(n=>matches(n,['role'])&&n.roles.includes(r.id)).length]));
  const roleMax=Math.max(1,...Object.values(roleCounts));
  const matrixNodes=connectionNodes.filter(n=>matches(n,['period','category']));
  const currentCity=cities.find(c=>c.id===filter.city);
  const active=Object.values(filter).some(Boolean);
  const labels:Record<keyof Filter,string>={period:periods.find(p=>p.id===filter.period)?.years||'',city:currentCity?.name||'',category:categories.find(c=>c.id===filter.category)?.label||'',role:roles.find(r=>r.id===filter.role)?.label||'',work:workGroups.find(w=>w.id===filter.work)?.name||''};
  function chooseCell(period:string,category:string){setFilter(f=>({...f,period:f.period===period&&f.category===category?'':period,category:f.period===period&&f.category===category?'':category}));}
  return <section className="atlas-section wrap" id="atlas">
    <header className="extension-heading"><div><span className="section-kicker">足迹与作品 / PLACES & CONNECTIONS</span><h2>把岁月摊开，<br/>看见彼此的关联。</h2></div><div><p>有些城市，见证一次相遇；<br/>有些舞台，会在许多年后再次回到她的生活。</p><p className="extension-subtle">选一个年代、一座城市，或一种工作身份。下面的城市图、节目表和身份图会一起回应，再带你读回具体的经历。</p></div></header>
    <div className="atlas-periods" role="group" aria-label="足迹年代筛选"><button onClick={()=>setFilter(f=>({...f,period:''}))} aria-pressed={!filter.period}>全部岁月<small>1968—2026</small></button>{periods.map(p=><button key={p.id} onClick={()=>update('period',p.id)} aria-pressed={filter.period===p.id}>{p.label}<small>{p.years}</small></button>)}</div>
    <div className="atlas-selection" role="status"><div><span>{visible.length} 个关联节点</span>{(Object.keys(filter) as (keyof Filter)[]).filter(k=>filter[k]).map(k=><button key={k} onClick={()=>update(k,filter[k])} aria-label={`移除筛选：${labels[k]}`}>{labels[k]} ×</button>)}{!active&&<span>· 点一处，沿着关联慢慢读</span>}</div>{active&&<button onClick={()=>setFilter(initial)}>清除所有筛选 ↺</button>}</div>
    <div className="atlas-scene"><div className="atlas-map-panel"><div className="atlas-chart-label"><h3>{currentCity?`${currentCity.name}，留下的几页`:'01 / 城市里的相遇'}</h3><span>{cities.length} 城 · {locations.length} 条地点关系</span></div><p className="atlas-chart-description">{currentCity?cityNotes[currentCity.id]:'每一盏亮起的城市，都有一条可以展开的公开记录。点击城市，其他视图会随之筛选。'}</p>
      <svg className="atlas-map" viewBox="0 0 600 460" aria-label="公开活动与学习工作城市方位图"><title>周涛的城市关联，点击城市进行筛选</title><g aria-hidden="true">{[90,180,270,360].map(y=><line key={`h${y}`} x1="35" y1={y} x2="565" y2={y} className="map-grid"/>)}{[100,200,300,400,500].map(x=><line key={`v${x}`} x1={x} y1="28" x2={x} y2="435" className="map-grid"/>)}<text className="map-axis" x="551" y="22">北 ↑</text><text className="map-watermark" x="40" y="83">Places</text></g>
      {cities.map(c=>{const count=cityCounts[c.id];const radius=count?Math.min(17,4+Math.sqrt(count)*2.2):4;const selected=filter.city===c.id;const pick=()=>{if(count||selected)update('city',c.id);};return <g key={c.id} className={`map-location ${count?'':'is-dim'} ${selected?'is-selected':''}`} role="button" tabIndex={count||selected?0:-1} aria-label={`选择城市：${c.name}，${count}个关联节点`} aria-pressed={selected} onClick={pick} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick();}}}><title>{c.name} · {count} 个关联节点</title><circle className="map-hit" cx={c.x} cy={c.y} r={Math.max(20,radius+8)}/><circle className="map-ring" cx={c.x} cy={c.y} r={radius+6}/><circle className="map-dot" cx={c.x} cy={c.y} r={radius}/><path className="map-stem" d={`M${c.x} ${c.y} L${c.x+c.dx*.7} ${c.y+c.dy*.7}`}/><text className="map-label" x={c.x+c.dx} y={c.y+c.dy}>{c.name}</text></g>;})}</svg>
      <p className="atlas-map-note">城市按大致方位排布，不表示比例距离或行走路线。圆点大小表示当前条件下的关联节点数；家乡、求学、工作基地与公开活动在记录中分别标注。</p>
      <div className="atlas-city-index" role="group" aria-label="选择足迹城市">{cities.map(c=><button key={c.id} disabled={!cityCounts[c.id]&&filter.city!==c.id} onClick={()=>update('city',c.id)} aria-pressed={filter.city===c.id}>{c.name}<small>{cityCounts[c.id]}</small></button>)}</div>
    </div><div className="atlas-roles"><div className="atlas-chart-label"><h3>02 / 身份的展开</h3><span>点击一行筛选</span></div><p className="atlas-chart-description">主持之外，新的职责慢慢出现。一个节点可以同时属于多种身份。</p><div className="atlas-role-list">{roles.map(r=><button key={r.id} className="atlas-role" onClick={()=>update('role',r.id)} aria-pressed={filter.role===r.id} disabled={!roleCounts[r.id]&&filter.role!==r.id}><span>{r.label}<strong>{roleCounts[r.id]}</strong></span><i style={{width:`${roleCounts[r.id]/roleMax*100}%`}}/></button>)}</div><p className="atlas-map-note">数量来自已收录节点，不用于比较成就或统计全部演出次数。</p></div></div>
    <div className="atlas-matrix-section"><div className="atlas-chart-label"><h3>03 / 节目与岁月交汇</h3><span>点击色块，读那一类、那几年</span></div><p className="atlas-chart-description">同一段时间，可以有不同的工作并行。颜色越深，当前城市、身份和节目条件下收录的节点越多。</p><div className="atlas-matrix" role="group" aria-label="节目类型与年代交叉筛选"><span className="matrix-corner">类型 / 年代</span>{periods.map(p=><button className="matrix-era" key={p.id} onClick={()=>update('period',p.id)} aria-pressed={filter.period===p.id}>{p.years.slice(0,4)}<br/>—{p.years.slice(5)}</button>)}{categories.map(c=><Fragment key={c.id}><button className="matrix-label" onClick={()=>update('category',c.id)} aria-pressed={filter.category===c.id}>{c.label}</button>{periods.map(p=>{const count=matrixNodes.filter(n=>n.category===c.id&&n.period===p.id).length;return <button key={p.id} className="matrix-cell" data-density={Math.min(4,count)} disabled={!count} aria-label={`${p.years}，${c.label}，${count}个节点`} aria-pressed={filter.category===c.id&&filter.period===p.id} onClick={()=>chooseCell(p.id,c.id)}>{count||'·'}</button>;})}</Fragment>)}</div><div className="matrix-legend"><span>收录较少</span><i/><i/><i/><i/><span>较多</span></div></div>
    <details className="atlas-work-index"><summary>沿一档节目、一部作品继续找 <span>{workGroups.length} 组关联 ＋</span></summary><div className="atlas-work-pills">{workGroups.map(w=><button key={w.id} onClick={()=>update('work',w.id)} aria-pressed={filter.work===w.id}>{w.name}</button>)}</div></details>
    <section className="atlas-results" aria-labelledby="atlas-result-title"><div className="atlas-result-heading"><h3 id="atlas-result-title">回到具体的那一页。</h3><span aria-live="polite">{visible.length} 个节点 · 按时间排列</span></div>{visible.length?<><div className="atlas-result-list">{visible.slice(0,limit).map(n=>{const ls=n.locations.filter(l=>!filter.city||l.city===filter.city);return <article className="atlas-record" key={n.id}><time>{n.moment.year==='1990年代初'?'1990s':n.year}</time><div><div className="atlas-record-top"><span>{categories.find(c=>c.id===n.category)?.label}</span><b>{ls.length?[...new Set(ls.map(l=>cities.find(c=>c.id===l.city)?.name))].join(' · '):'地点尚未收录'}</b></div><h4><button onClick={()=>onOpenMoment(n.moment)}>{n.moment.title}</button></h4><p>{n.moment.text}</p><div className="atlas-record-links"><button onClick={()=>onOpenMoment(n.moment)}>读经历与相关影像 ↗</button><a href={getSource(n.moment.sources[0]).url} target="_blank" rel="noreferrer">资料原文 ↗</a></div>{ls.length>0&&<details><summary>这座城的记录与地点依据 <span>＋</span></summary>{ls.map(l=><div key={l.id}><p><b>{cities.find(c=>c.id===l.city)?.name} · {locationKinds[l.kind]}</b><br/>{l.date} · {l.title}{l.venue?` · ${l.venue}`:''}</p><p>{l.evidence}</p>{l.note&&<p>{l.note}</p>}<div className="atlas-record-links">{l.sourceIds.map(id=>{const s=getSource(id);return <a key={id} href={s.url} target="_blank" rel="noreferrer">{s.publisher} ↗</a>;})}</div></div>)}</details>}</div></article>;})}</div>{visible.length>limit&&<button className="atlas-load-more" onClick={()=>setLimit(l=>l+16)}>再翻开 {Math.min(16,visible.length-limit)} 页 · 还有 {visible.length-limit} 页</button>}</>:<div className="atlas-empty"><p>这个组合下，暂时没有已收录的记录。<br/>可以移除一项筛选，继续找相邻的故事。</p><button onClick={()=>setFilter(initial)}>重新展开全部岁月 →</button></div>}</section>
    <aside className="atlas-footnote"><h4>这幅图，怎样慢慢变得清楚</h4><p>节目类型与身份由本站按资料人工归组；三张视图共享筛选。矩阵保留其他年代与类型作参照，城市图与身份图也保留各自选项，便于比较和切换。一个人生节点若关联多座城市，会在各城出现；同一城市的连续场次未拆成多次到访。</p><p>地图只点亮有明确地点证据的记录。尚未核到地点的节目、纪录片录音、早年基层演出，仍保留在作品与年代视图中。《情书》巡演只收录已核实的城市；一部作品的巡演城市，也不会自动成为制作人的个人足迹。</p></aside>
    <p className="extension-method">资料核对至2026年11月9日 · 城市图是人物册的阅读索引，不是完整行程或统计年鉴。<a href="#voices">也可以换个角度，读她说过的话 →</a></p>
  </section>;
}
