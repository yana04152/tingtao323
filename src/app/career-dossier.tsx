'use client';
import {useState} from 'react';
import {moments,getSource,type Moment} from '../lib/archive';
import dossier from '../lib/round2-archive.json';

const cctvWork=[
  {years:'1995—2000',title:'综艺大观',role:'栏目主持',description:'从新闻播音转向综艺交流，进入全国观众的日常观看。',momentId:'1995'},
  {years:'1996—2011 / 2016',title:'春节联欢晚会',role:'大型直播主持',description:'连续16年、累计17届。主持片段与《春晚江湖》访谈可以对照观看。',momentId:'1996'},
  {years:'2001—2005.04',title:'真情无限',role:'制片人兼主持人',description:'不仅承担出镜，也参与栏目制作与人员管理；2005年4月底离任时间来自本人在线交流。',momentId:'2005-zhenqing-end'},
  {years:'2006 / 2014',title:'全国电视相声大赛',role:'赛事主持与表演',description:'主持比赛，并在2006年颁奖晚会与马季、毕福剑表演《学相声》。',momentId:'2006-crosstalk'},
  {years:'2008',title:'北京奥运开幕式',role:'电视转播解说',description:'与孙正平搭档解说开幕式。解说席与仪式现场主持是不同的岗位。',momentId:'2008'},
  {years:'2009 / 2013',title:'节目组织与规划',role:'管理工作',description:'2009年管理岗位资料，与2013年介绍下一年度节目规划的公开发言，呈现幕后职责。',momentId:'2013-program-planning'},
  {years:'2010',title:'青年歌手电视大奖赛',role:'赛事主持',description:'央视赛事回顾明确列入第十四届主持团队；另有观众保存的纪录片与幕后截图线索。',momentId:'2010-qingge'},
  {years:'2010',title:'我们有一套',role:'栏目主持',description:'在栏目交流中展示大型晚会之外的另一种节奏。',momentId:'2010'},
  {years:'2011',title:'放歌九十年',role:'文艺专题节目主持',description:'参与十集电视专题片，节目主持与马东承担的访谈环节分别列明。',momentId:'2011-fangge'},
  {years:'2014—2016',title:'中国谜语大会',role:'文化节目主持',description:'与撒贝宁搭档，三季首场节目均有精确观看入口。',momentId:'2014-riddle'},
  {years:'2015 / 2016',title:'艺览天下 · 陪你读书',role:'节目嘉宾与阅读分享',description:'谈电影，也推荐《史记》，保留她作为观众与读者的声音。',momentId:'2015-film-sharing'},
];
const creativeIds=['2017','2018-buddhist-forum','2019-baihua-director','2020-ncpa-guide','2020-wendao-kongtong','2021','2022-anhui','2023-harbin-director','2025-night-harbin','2026-wangxizhi'];

export default function CareerDossier({onOpenMoment}:{onOpenMoment:(m:Moment)=>void}){
  const [tab,setTab]=useState('cctv');
  const tabs=[{id:'cctv',name:'央视工作',count:cctvWork.length},{id:'creative',name:'创作与近年工作',count:creativeIds.length},{id:'honors',name:'荣誉记录',count:dossier.honors.length}];
  return <section className="career-dossier wrap" id="career">
    <div className="section-heading"><div><span className="section-kicker">WORK & RECOGNITION / 职业档案</span><h2>不止台前，<br/>也看她承担的工作。</h2></div><p>按职责重新阅读<span>节目 · 制作 · 导演 · 荣誉</span></p></div>
    <div className="career-tabs" aria-label="职业档案分类">{tabs.map(t=><button key={t.id} className={tab===t.id?'selected':''} aria-pressed={tab===t.id} onClick={()=>setTab(t.id)}>{t.name}<small>{String(t.count).padStart(2,'0')}</small></button>)}</div>
    {tab==='cctv'&&<div className="career-table">{cctvWork.map(w=><article key={w.title}><span className="career-years">{w.years}</span><div><span className="career-role">{w.role}</span><h3>{w.title}</h3><p>{w.description}</p></div><button onClick={()=>onOpenMoment(moments.find(m=>m.id===w.momentId)!)}>展开档案 ↗</button></article>)}</div>}
    {tab==='creative'&&<div className="career-table">{creativeIds.map(id=>{const m=moments.find(m=>m.id===id)!;return <article key={id}><span className="career-years">{m.year}</span><div><span className="career-role">{m.role}</span><h3>{m.title}</h3><p>{m.text}</p></div><button onClick={()=>onOpenMoment(m)}>展开档案 ↗</button></article>;})}</div>}
    {tab==='honors'&&<><p className="honor-intro">奖项、称号按核实的年份列出。职务、作品获奖与主持颁奖礼，另归职业经历。</p><div className="honor-grid">{dossier.honors.map(h=><article key={h.id}><span className="honor-year">{h.year}<small>RECOGNITION</small></span><h3>{h.title}</h3>{h.work&&<p className="honor-work">参评作品：{h.work}</p>}<p>{h.note}</p><div className="honor-links"><button onClick={()=>onOpenMoment(moments.find(m=>m.id===h.momentId)!)}>查看获奖节点 ↗</button><a href={getSource(h.sources[0]).url} target="_blank" rel="noreferrer">查阅来源 ↗</a></div></article>)}</div></>}
    <p className="career-footnote">这里是已核实的工作索引，点击条目可继续读来源、访谈与相关影像。职位按报道当时的身份记录；荣誉表保留原始奖名与日期依据。</p>
  </section>;
}
