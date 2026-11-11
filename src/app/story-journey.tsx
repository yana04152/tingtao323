'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {moments,getSource,type Moment} from '../lib/archive';
import {videos,type VideoClip} from '../lib/videos';
import {communityRecords} from '../lib/reading';
import {VideoPlayer,ClipMetadata} from './video-archive';

export const storyChapters=[
  {id:'origin',number:'01',years:'1968—1994',title:'在被看见以前'},
  {id:'screen',number:'02',years:'1995—2000',title:'走进万家灯火'},
  {id:'explore',number:'03',years:'2001—2015',title:'走向更大的现场'},
  {id:'stage',number:'04',years:'2016—2020',title:'再做一次初学者'},
  {id:'continue',number:'05',years:'2021—2026',title:'日子仍在发光'},
];

function ChapterHead({id,children}:{id:string;children:ReactNode}){
  const c=storyChapters.find(c=>c.id===id)!;
  return <header className="story-heading"><span className="story-number">{c.number}</span><div><span className="section-kicker">{c.years} · {c.title}</span><h2>{children}</h2></div></header>;
}
function StorySources({ids}:{ids:string[]}){return <details className="story-sources"><summary>本章的阅读底本 <span>＋</span></summary><div>{ids.map(id=>{const s=getSource(id);return <a key={id} href={s.url} target="_blank" rel="noreferrer">{s.title}<small>{s.publisher} · {s.date} ↗</small></a>;})}</div></details>;}

export default function StoryJourney({onOpenMoment,onBrowseChapter}:{onOpenMoment:(m:Moment)=>void;onBrowseChapter:(id:string)=>void}){
  const [film,setFilm]=useState<VideoClip|null>(null);
  const dialog=useRef<HTMLDialogElement>(null);
  const trigger=useRef<HTMLElement|null>(null);
  const photo=communityRecords.find(r=>r.id==='weibo-green-portrait-2026')!;
  const diary=communityRecords.find(r=>r.id==='douyin-6883774421459307790')!;
  const autumn=communityRecords.find(r=>r.id==='douyin-7704634635870926257')!;
  const currentWork=communityRecords.find(r=>r.id==='douyin-backstage-2026')!;
  const oldVideo=communityRecords.find(r=>r.id==='tieba-weekend-2007')!;
  const oldPhoto=communityRecords.find(r=>r.id==='tieba-photos-2008')!;
  useEffect(()=>{if(film){dialog.current?.showModal();document.body.style.overflow='hidden';}else{dialog.current?.close();document.body.style.overflow='';trigger.current?.focus();}return()=>{document.body.style.overflow='';};},[film]);
  function openFilm(id:string){trigger.current=document.activeElement as HTMLElement;setFilm(videos.find(v=>v.id===id)||null);}
  function openMoment(id:string){const m=moments.find(m=>m.id===id);if(m)onOpenMoment(m);}
  function FilmLink({id,label}:{id:string;label?:string}){const v=videos.find(v=>v.id===id)!;return <button className="story-film-link" onClick={()=>openFilm(id)}><span className="story-small-play" aria-hidden="true">▷</span><span>{label||v.title}<small>{v.contentDate} · {v.duration||'原片入口'}</small></span><i aria-hidden="true">↗</i></button>;}
  return <div className="story-journey" id="story">
    <nav className="story-contents wrap" aria-label="人物册目录"><span>慢慢读她</span>{storyChapters.map(c=><a key={c.id} href={`#chapter-${c.id}`}><small>{c.number}</small>{c.title}</a>)}</nav>

    <section className="story-chapter origin-chapter wrap" id="chapter-origin">
      <ChapterHead id="origin">从淮南到北京，<br/>先学会走向自己。</ChapterHead>
      <div className="origin-layout"><div className="story-prose"><p className="story-lead">熟悉的声音，也有尚未被听见的时候。</p><p>1968年，故事从安徽淮南开始。1986年，周涛考入北京广播学院，学习播音。十八岁的求学之路，把她带到北京，也让声音成为此后人生中一条长长的线索。</p><p>但毕业并没有直接通向演播室。1990年以后，她曾在与专业不完全对口的岗位上工作，主动到北京电视台争取学习与实践的机会。后来，在《北京新闻》等节目中，她重新走回了自己的专业。</p><p>把这段并不笔直的起步留在开篇，是因为台前的从容需要来处。在成为我们熟悉的主持人之前，她已经经历过等待，也做出过选择。</p><button className="story-text-link" onClick={()=>openMoment('1990')}>读毕业后的这一段经历 <span>↗</span></button><StorySources ids={['school','early','grad']}/></div>
      <aside className="origin-folio"><span className="folio-label">起点的几页 / FIRST PAGES</span><div className="folio-date"><b>1986</b><span>北京广播学院<br/>播音专业</span></div><div className="folio-rule"/><div className="folio-date"><b>1990</b><span>大学毕业<br/>寻找回到专业的路</span></div><div className="folio-rule"/><div className="folio-date"><b>1990s</b><span>北京电视台<br/>新闻播音与栏目实践</span></div><div className="folio-listen"><span>听听早期的声音</span><FilmLink id="btv-news-1993" label="北京台：一段晚间新闻"/></div><p className="folio-note">入台年份在旧资料中有1992、1993两种记载，年表保留了这一差异。</p></aside></div>
      <button className="story-chapter-more" onClick={()=>onBrowseChapter('origin')}>查看这一章的完整年表 <span>01 →</span></button>
    </section>

    <section className="screen-chapter" id="chapter-screen"><div className="wrap">
      <ChapterHead id="screen">后来，这个声音<br/>走进了许多人的除夕。</ChapterHead>
      <div className="screen-layout"><figure className="screen-memory"><button onClick={()=>openFilm('variety-farewell-2000')} aria-label="观看：告别综艺大观，掌声响起来"><img src="./images/story/variety-farewell-2000.jpg" width="960" height="600" alt="《掌声响起来》收录版本封面，周涛手持话筒演唱" loading="lazy"/><span className="memory-play">▷ 重温这一刻</span></button><figcaption><span>《综艺大观》告别片段 ·《掌声响起来》</span><small>2000年内容 · B站收录版本封面</small></figcaption></figure>
      <div className="story-prose"><p className="story-lead">有人先记住她的名字，<br/>有人先记住她的一声新年好。</p><p>1995年，周涛进入央视，接过《综艺大观》的话筒。新闻演播室里的准确与节制，要在综艺现场变成交流的分寸和节奏。这一次，她开始面对全国的观众。</p><p>1996年，她第一次主持央视春晚。往后一年又一年，这个声音与除夕重逢。对许多人来说，主持人的成长与自己的生活并排发生；荧屏留下节目，也留下某一个家里的某一个夜晚。</p><p>这一章选了两种相遇：第一次春晚的现场，和告别《综艺大观》时的一首歌。一段看初见，一段听不舍。</p><FilmLink id="gala-debut-1996" label="第一次春晚：西安分会场"/><button className="story-text-link" onClick={()=>openMoment('1999')}>也记下她得到的专业肯定 ↗</button><StorySources ids={['first','gala','award']}/></div></div>
      <div className="spring-memory-line"><span>一段很长的陪伴</span><p><b>1996—2011</b> 连续16年春晚主持 <i>·</i> <b>2016</b> 再次回归</p><a href="#career">晚会、央视工作与荣誉 →</a></div>
      <button className="story-chapter-more" onClick={()=>onBrowseChapter('screen')}>查看这一章的完整年表 <span>02 →</span></button>
    </div></section>

    <section className="story-chapter explore-chapter wrap" id="chapter-explore">
      <ChapterHead id="explore">话筒之外，<br/>还有更大的现场。</ChapterHead>
      <div className="explore-layout"><div className="story-prose"><p className="story-lead">改变，早在被人们注意到之前，已经开始。</p><p>2001年，她开办环保主题节目《真情无限》，兼任制片人与主持人。从表达一档节目，到参与决定节目要表达什么，工作的边界已经在向外延伸。</p><p>2005年，周涛参与北京奥运筹备。2008年8月8日，她与孙正平一起，为奥运会开幕式的电视转播解说。那一晚，声音陪伴世界观看北京；它并不需要一直站在画面中央。</p><p>奥运结束后的讲座，让人有机会从她的叙述回到那段经历。另一场TOM长访谈，则留下了更舒展的交谈状态。把时间留长一点，才更容易看见舞台片段之外的她。</p><p>这些忙碌的年份里，学习也没有停下。2006年的采访中，她谈到自己正在读研；后来的学术书目，还留下了一篇关于春晚主持的硕士论文。台前的经验，也成为她尝试研究的题目。</p><button className="story-text-link" onClick={()=>openMoment('2008-masters')}>读研与论文，沿着资料继续找 ↗</button><StorySources ids={['bio','olympicjob','olympic','r4-study2006','r4-thesis-citation']}/></div>
      <div className="talk-pair"><figure><button className="talk-cover" onClick={()=>openFilm('olympic-lecture-2008')} aria-label="观看：2008年亲历奥运讲座"><img src="./images/story/olympic-lecture-2008.jpg" alt="《亲历奥运》讲座收录版本封面" loading="lazy"/><span>▷</span></button><figcaption><small>2008 · 深圳 / 1:05:37</small><h3>亲历奥运</h3><p>在大型现场之后，听她回望自己的工作。</p></figcaption></figure><figure><button className="talk-cover" onClick={()=>openFilm('tom-interview-date-unconfirmed')} aria-label="观看：TOM访谈，节目年份待核"><img src="./images/story/tom-interview-date-unconfirmed.jpg" alt="TOM访谈收录版本封面，周涛在交谈中比画" loading="lazy"/><span>▷</span></button><figcaption><small>TOM长谈 / 1:02:24</small><h3>把一小时，交给交谈</h3><p>2005年为观众索引年份，仍待原始记录核实。</p></figcaption></figure></div></div>
      <aside className="audience-memory"><div><span className="section-kicker">在观众的记忆里 / 2007—2008</span><h3>有人把喜欢，<br/>留成了一个个帖子。</h3><p>影像被分享，照片被收集；有人一起辨认早年节目的年代，也有人在旧链接失效后寻找新的入口。早期贴吧保存的，既是她的片段，也是观众珍惜这些片段的方式。</p></div><div className="memory-letters"><a href={oldVideo.url} target="_blank" rel="noreferrer"><time>2007.07.27</time><strong>《周末喜相逢》视频分享帖</strong><span>原帖与后续补链仍可读；早期播放器已失效。↗</span></a><a href={oldPhoto.url} target="_blank" rel="noreferrer"><time>2008.04.11</time><strong>《周涛照片（二）》</strong><span>首帖和早期回复仍在；部分照片、楼层缺失。↗</span></a><a className="memory-archive-link" href="#community/audience">继续读观众留下的旧帖 →</a></div></aside>
      <button className="story-chapter-more" onClick={()=>onBrowseChapter('explore')}>查看这一章的完整年表 <span>03 →</span></button>
    </section>

    <div className="story-quote wrap"><span aria-hidden="true">“</span><blockquote>我不贪心，<br className="quote-mobile"/>只取我最想要的。</blockquote><a href={getSource('olympicself').url} target="_blank" rel="noreferrer">周涛 ·《中国青年》采访 · 新浪2005年转载 ↗</a><p>把这句话放在转身之前，再读后来的选择。</p><a className="story-more-voices" href="#voices">读更多有来处的原话 →</a></div>

    <section className="story-chapter stage-chapter wrap" id="chapter-stage">
      <ChapterHead id="stage">熟悉的舞台之外，<br/>再做一次初学者。</ChapterHead>
      <div className="stage-lead"><div className="story-prose"><p>2016年有两件事值得放在一起：年初重返春晚，年底离开央视、调入北京演艺集团。一次回归与一次转身，发生在同一年。</p><p>2017年的奥林匹克公园夏季音乐季，她承担总导演工作。2018年，《情书》让她成为路佳佳——她第一次出演话剧女主角。2020年，她又把声音放进纪录片《中国》。主持、导演、表演、解说，在这里形成新的连接。</p><p>成都讲座发生在这次转身之后。听她谈“遇见更好的自己”，再去看排练、演出与幕后，选择就有了具体的形状。</p></div><div className="stage-sequence"><button onClick={()=>openMoment('2016-bpa')}><b>2016</b><span>走向北京演艺集团</span><i>↗</i></button><button onClick={()=>openMoment('2017')}><b>2017</b><span>把构想变成一场音乐季</span><i>↗</i></button><button onClick={()=>openMoment('2018')}><b>2018</b><span>在《情书》中成为路佳佳</span><i>↗</i></button><button onClick={()=>openMoment('2020')}><b>2020</b><span>以声音讲述《中国》</span><i>↗</i></button></div></div>
      <div className="chengdu-feature"><figure><button onClick={()=>openFilm('speech-2017')} aria-label="观看：2017年6月24日成都讲座"><img src="./images/story/speech-2017.jpg" width="3978" height="2487" alt="成都讲座收录版本封面，周涛坐在话筒前" loading="lazy"/><span className="memory-play">▷ 留在这一章，听她说</span></button><figcaption>收录版本封面 · 保留原图水印与片源说明</figcaption></figure><div><span className="section-kicker">2017.06.24 · 成都</span><h3>遇见更好的自己</h3><p>一场约98分钟的讲座，留给愿意慢慢听的人。</p><button className="story-text-link" onClick={()=>openFilm('speech-2017')}>打开横版长视频 <span>1:37:46 ↗</span></button><small>同期报道确认日期为2017年6月24日；片源页另保留直播版与后台附片。</small></div></div>
      <div className="stage-companions"><FilmLink id="letter-interview-2018" label="第一次出演话剧女主角，听她谈《情书》"/><a className="story-film-link" href={diary.url} target="_blank" rel="noreferrer"><span className="story-small-play">▷</span><span>总导演的一天：走进音乐季幕后<small>本人抖音 · 2020.10.15发布 · 00:28</small></span><i>↗</i></a></div>
      <div className="story-music-thread"><span aria-hidden="true">♪</span><div><span className="section-kicker">她与古典音乐</span><h3>从听众，到一场音乐季的构思者。</h3><p>2018年的新华网采访中，她谈到自己长期喜爱和聆听古典音乐。这份日常的兴趣，后来与音乐季的策划、让更多观众走近音乐的工作连接起来。</p><a href={getSource('r4-xinhua2018-music').url} target="_blank" rel="noreferrer">读这篇专访 ↗</a><a href="#voices">读她关于音乐与学习的原话 →</a></div></div><StorySources ids={['bpa','music','letter','letter2','china','r4-xinhua2018-music']}/><button className="story-chapter-more" onClick={()=>onBrowseChapter('stage')}>查看这一章的完整年表 <span>04 →</span></button>
    </section>

    <section className="continue-chapter" id="chapter-continue"><div className="wrap">
      <ChapterHead id="continue">舞台还在延伸，<br/>日子也有自己的光。</ChapterHead>
      <div className="continue-layout"><div className="story-prose"><p className="story-lead">这里暂时没有句号。</p><p>2021年加入保利文化，2024年在《老家伙》中尝试电视剧表演，2025年担任“哈夏”开幕式总导演，2026年参与《丰收中国》朗诵。把这些工作连起来，会看到她仍在不同的舞台间往返。</p><p>而在她自己发布的记录里，还有出差、配音、回母校、逛书店，也有秋日的街道和一组绿意中的照片。工作是人生的一部分，日常让这份人物册有了呼吸的地方。</p><p>这一章留下近年的创作，也留下一些不必承担宏大意义的片刻。因为值得被珍藏的，既有被记住的舞台，也有她愿意分享的生活。</p><div className="story-inline-links"><a href="#community/style">翻开她的相册 ↗</a><a href="#community/vlog">走进工作日记 ↗</a></div><StorySources ids={['poly','tv','harbin','harvestheld']}/></div>
      <figure className="life-portrait"><a href="#community/style" aria-label="翻开绿意漫染本人相册"><img src={photo.image} width="690" height="460" alt="周涛在绿意中的个人照片，来自本人微博" loading="lazy"/></a><figcaption><span>绿意漫染</span><small>本人微博 · 2026.09.20发布<br/>照片拍摄日期未单独标注</small></figcaption></figure></div>
      <div className="life-small-moments"><span>工作与生活，翻过相邻的两页</span><a href={currentWork.url} target="_blank" rel="noreferrer"><img src={currentWork.image} alt="朗诵演出后台，本人短视频封面" loading="lazy"/><div><small>2026.10.13 · 工作记录</small><h3>上台之前，怎样准备一场朗诵？</h3><p>她自己拍下的演出后台。<b>打开原视频 ↗</b></p></div></a><a href={autumn.url} target="_blank" rel="noreferrer"><img src={autumn.image} alt="北京秋日，本人短视频封面" loading="lazy"/><div><small>2026.11.06 · 生活片刻</small><h3>枫叶拍过肩，北京又到秋天。</h3><p>把镜头留给日常的风景。<b>打开原视频 ↗</b></p></div></a></div>
      <button className="story-chapter-more" onClick={()=>onBrowseChapter('continue')}>查看这一章的完整年表 <span>05 →</span></button>
    </div></section>

    <section className="story-extensions wrap"><div className="story-extensions-heading"><span className="section-kicker">读完故事，再换一个角度 / CONNECTIONS</span><h2>那些走过的地方，<br/>和留下来的话。</h2><p>把时间摊开，会看见城市与作品的交汇；<br/>回到她自己的表达，会更懂得每一次选择。</p></div><div className="story-extension-links"><a className="atlas-entry" href="#atlas"><div className="entry-constellation" aria-hidden="true"><svg viewBox="0 0 300 116"><path d="M24 74 96 30 157 76 228 22 276 74M96 30 228 22M157 76 276 74"/><circle cx="24" cy="74" r="5"/><circle cx="96" cy="30" r="9"/><circle cx="157" cy="76" r="6"/><circle cx="228" cy="22" r="5"/><circle cx="276" cy="74" r="7"/></svg><span>城市 · 年份 · 作品 · 身份</span></div><small>01 / 看见彼此的关联</small><h3>足迹与作品 <b>↗</b></h3><p>选一座城、一段岁月，看不同的现场怎样相遇。</p></a><a className="voices-entry" href="#voices"><div className="entry-words" aria-hidden="true"><span>“</span><p>选择　·　创作<br/>学习　·　生活　·　音乐</p></div><small>02 / 把一句话放回当时</small><h3>她说过的话 <b>↗</b></h3><p>有时间、有上下文、有出处，慢慢读她自己的表达。</p></a></div></section>

    <section className="story-afterword wrap"><span className="section-kicker">写在这一页之后 / TO BE CONTINUED</span><h2>愿每一次重温，<br/>都比初见多懂她一点。</h2><p>这份人物册因喜欢而开始。我们把经历放回时间，把声音留在故事里，也认真保存那些暂时残缺的旧记录。它还会有新的一页；已经走过的每一步，值得慢慢读。</p><div className="afterword-links"><a href="#timeline"><span>沿时间细读</span><small>完整年表与每个节点的出处</small><b>↗</b></a><a href="#videos"><span>留一段时间给她</span><small>主持、访谈、讲座与幕后影像</small><b>↗</b></a><a href="#community"><span>翻开照片与旧帖</span><small>本人分享与观众的共同记忆</small><b>↗</b></a></div><p className="story-editorial-note">章节串联为基于公开经历的编辑叙述，不代替周涛本人的自述。直接引语、影像版本与年代疑点均保留出处。</p></section>

    <dialog className="story-film-dialog" ref={dialog} aria-labelledby="story-film-title" onCancel={()=>setFilm(null)} onClick={e=>{if(e.target===e.currentTarget)setFilm(null);}}>{film&&<div><header><span>留在故事里 · 看一段影像</span><button onClick={()=>setFilm(null)} aria-label="关闭影像，回到这一章" autoFocus>×</button></header><h2 id="story-film-title">{film.title}</h2><p className="story-film-date">{film.contentDate} · {film.duration}</p><VideoPlayer key={film.id} clip={film}/><p className="story-film-caption">{film.description}</p><div className="story-watch-for"><b>带着这个线索看</b><p>{film.watchFor}</p></div><ClipMetadata clip={film}/><button className="story-text-link" onClick={()=>setFilm(null)}>收起影像，继续读这一章 →</button></div>}</dialog>
  </div>;
}
