import social from './social-records.json';
import round3 from './round3-archive.json';
import round4 from './round4-archive.json';
import round2 from './round2-archive.json';
export type DeepReadingRecord={source:string;year:string;title:string;tag:string;description:string;momentId:string;dateNote?:string};
export const deepReadings:DeepReadingRecord[] = [
  ...round4.readings,
  ...round3.readings,
  ...round2.readings,
  {source:'chat2002',year:'2002',title:'在网络聊天室里，谈节目与观众',tag:'在线访谈实录',description:'离开《综艺大观》不久，她与网友谈新节目、主持工作和创作想法。保留当年的问答语境。',momentId:'2000'},
  {source:'early',year:'2005',title:'《幕后》：从起步到走上荧屏',tag:'人物访谈',description:'串起求学、毕业后的工作和进入北京电视台的经历，认识光环之前的起点。',momentId:'btv'},
  {source:'choice2005',year:'2005',title:'在坚守与放弃之间',tag:'本人专访',description:'从公益节目的制作谈到奥组委的邀请，听她在选择发生时如何解释自己的考虑。',momentId:'2005'},
  {source:'choice',year:'2015',title:'面对取舍，她怎样描述自己',tag:'人物专访',description:'把“想要什么”的问题放回工作与生活的具体选择中阅读。',momentId:'2001'},
  {source:'music',year:'2017',title:'当主持人开始构思一场音乐季',tag:'创作专访',description:'走进奥林匹克公园夏季音乐季，关注场地、演出和城市文化的关系。',momentId:'2017'},
  {source:'letter2',year:'2018',title:'《情书》翻开四十年的人生',tag:'话剧报道与采访',description:'跟随初次出演话剧的经历，观察主持人如何进入角色、与搭档共同完成叙事。',momentId:'2018'},
  {source:'letter2020',year:'2020',title:'复演《情书》时，再谈表演',tag:'后台探班',description:'与2018年的采访对照阅读，看到两年舞台实践之后的变化。',momentId:'2020-letter'},
  {source:'china2023self',year:'2023',title:'寻找生命更鲜活的表达',tag:'本人专访',description:'从《中国》前三季的声音创作，读到她对工作状态与表达方式的理解。',momentId:'2023-china'},
  {source:'night2025self',year:'2025',title:'一部音乐剧背后的总制作人',tag:'制作人专访',description:'围绕《夜幕下的哈尔滨》，把台前的完成度与幕后的筹备、协作联系起来。',momentId:'2025-night-harbin'},
];

export type CommunityKind='self'|'media'|'audience';
export type CommunityRecord={id:string;kind:CommunityKind;platform:string;date:string;title:string;author:string;description:string;note:string;url:string;momentIds:string[];linkLabel?:string;category?:'vlog'|'style'|'life'|'event'|'words';format?:'video'|'photo'|'text';image?:string;images?:string[];imageCredit?:string;duration?:string;originalTitle?:string};
const legacyCommunityRecords:CommunityRecord[]=[
  {id:'tieba-yearbook-2012',kind:'audience',platform:'百度贴吧',date:'2012.05.29',title:'2012年度工作记录：观众按日历留下的目录',author:'周涛吧 · 听说你很酷😳😳',description:'作者把元旦晚会、百花迎春、体坛风云人物等活动逐项整理，并在楼层中补充图片。可以作为查找2012年节目与现场的索引。',note:'已核首帖与前段楼层。帖名中的“全记录”是作者命名，本站未将其视为完整官方履历；具体日期和职责仍需对照当年节目与主办方资料。',url:'https://tieba.baidu.com/p/1621031743',momentIds:['2012']},
  {id:'tieba-qingge-2013',kind:'audience',platform:'百度贴吧',date:'2013.06.01',title:'《青歌赛》纪录片：一份视频与截图旧帖',author:'周涛吧 · 新盈☔--🌸',description:'帖子整理纪录片中的周涛画面，并留下新浪视频旧链接，提供追溯青歌赛幕后工作的线索。',note:'首帖日期与正文已核。旧播放器尚未验证；作者对制片、策划职责的概括暂保留为检索线索，不单独作为正式任职证据。',url:'https://tieba.baidu.com/p/2364248786',momentIds:['2010-qingge','2013-program-planning']},
  {id:'tieba-xinlianxin-2014',kind:'audience',platform:'百度贴吧',date:'2014.09.07',title:'“心连心”北屯彩排：镜头背后的工作现场',author:'周涛吧 · cctvzhoutao',description:'观众转存的幕后照片帖，正文把照片时间记为9月6日，关注她在彩排现场的工作。',note:'帖子发布于9月7日，照片日期来自作者说明。没有把照片说明直接扩写为该场演出的总导演任命；与央视节目管理资料并读。',url:'https://tieba.baidu.com/p/3280423879',momentIds:['2013-program-planning']},
  {id:'tieba-legacy-timeline-2017',kind:'audience',platform:'百度贴吧',date:'2017.03.23',title:'老涛迷的1993—2017视频年表发布记录',author:'周涛吧 · 墨白韆骥🔥',description:'一份由观众共同整理的视频时间轴发布帖。作者在回复中解释了选择视频、编写简介的过程，也留下当年档案整理的痕迹。',note:'原帖仍可读；帖内GitHub Pages旧站在本次核对时返回404，因此保留贴吧原帖入口，不把失效目录当作可播放片源。1993—2017是目录内容跨度，帖文本身发布于2017年。',url:'https://tieba.baidu.com/p/5035475018',momentIds:[]},
  {id:'douyin-backstage-2026',kind:'self',platform:'抖音',date:'2026.10.13',title:'作为朗诵嘉宾，怎样准备一场演出',author:'周涛 · 认证账号 ZT.0323',description:'本人发布的1分钟后台工作记录。从自己的镜头看演出准备，也为正式舞台之外留下一个入口。',note:'已核对账号认证、作品日期与页面内容。发布日不等于拍摄日。',url:'https://www.douyin.com/video/7696028144478139834',momentIds:['2026']},
  {id:'weibo-choice-2026',kind:'self',platform:'微博',date:'2026.05.15',title:'本人分享：面对人生的分岔路',author:'周涛323 · 认证为主持人周涛',description:'分享《五十公里桃花坞》的节目片段，并写下自己面对选择的感受。与影像档案中的节目自述可以对照阅读。',note:'使用新浪公开正文页保留本人配文；与B站同一节目片段不重复计为独立影像。',url:'https://www.sina.cn/news/detail/5298898220352307.html',momentIds:['2026-taohuawu','2005']},
  {id:'bjd-short-2026',kind:'media',platform:'北京日报',date:'2026.02.27',title:'谈第一次拍短剧的轻松体验',author:'北京日报客户端 · 长安街知事',description:'媒体保留的社交视频，听她谈第一次接触短剧拍摄的状态。',note:'原页提供视频；它是创作体验自述，不是短剧正片。',url:'https://xinwen.bjd.com.cn/content/s69a12eafe4b0cd719e9e3de1.html',momentIds:['2026-short']},
  {id:'xhs-bazaar',kind:'media',platform:'小红书',date:'页面显示 10.26',title:'请查收周涛的旅行出片指南',author:'时尚芭莎',description:'媒体账号的活动拍摄记录，关联“来自中国”年度盛典与江阴霞客行。可从现场交流中看到正式舞台之外的一面。',note:'已读原帖正文。单篇直链可能要求App，提供标题检索入口；日期沿用页面显示，不推定年份。',url:'https://www.xiaohongshu.com/search_result?keyword=%E8%AF%B7%E6%9F%A5%E6%94%B6%E5%91%A8%E6%B6%9B%E7%9A%84%E6%97%85%E8%A1%8C%E5%87%BA%E7%89%87%E6%8C%87%E5%8D%97',momentIds:[],linkLabel:'在小红书查找原帖'},
  {id:'tieba-gala-2016',kind:'audience',platform:'百度贴吧',date:'2016.02.27',title:'2016央视春晚：观众留下的截图档案',author:'周涛吧 · Lovely妮C',description:'一份春晚现场与幕后图片汇总，作者在首帖说明多数为自己截取、处理的画面。',note:'以首帖日期归档。属于观众整理，原图与节目权利归原权利人；本站链接至原帖阅读。',url:'https://tieba.baidu.com/p/4376580917',momentIds:['2016-gala']},
  {id:'tieba-olympic-memory-2015',kind:'audience',platform:'百度贴吧',date:'2015.08.10',title:'七年的跨度：一位观众回望奥运记忆',author:'周涛吧 · 大风起兮云飞远',description:'作者从北京奥运会解说写到七年后的回望，记录长期观众如何理解她的工作与变化。',note:'首帖发布于8月10日，正文回顾的是8月8日。作者对心境的描述属于个人感受，不作为人物心理或活动事实的独立依据。',url:'https://tieba.baidu.com/p/3960893302',momentIds:['2008']},
  {id:'tieba-letter-2019',kind:'audience',platform:'百度贴吧',date:'2019.10.21',title:'《情书》在国家大剧院：一份旧帖记录',author:'周涛吧 · 梦柯1120',description:'帖子记录《情书》在国家大剧院的演出，并注明图片来自国家大剧院微博。',note:'这是当时的社区转存，不能代替主办方演出记录；适合与2018、2020年的访谈并读。',url:'https://tieba.baidu.com/p/6304772051',momentIds:['2018','2020-letter']},
];
export const communityRecords:CommunityRecord[]=[...(social as CommunityRecord[]),...legacyCommunityRecords.filter(r=>!social.some(n=>n.id===r.id))];
export const communityKinds=[{id:'all',label:'全部记录'},{id:'self',label:'本人表达'},{id:'media',label:'媒体记录'},{id:'audience',label:'观众与旧帖'}];
export const getRelatedRecords=(id:string)=>communityRecords.filter(r=>r.momentIds.includes(id));
export const platformEntries=[
  {name:'抖音',label:'本人认证账号',detail:'周涛 · ZT.0323',url:'https://www.douyin.com/user/MS4wLjABAAAALbiUT0HPTRtiSBZrxATkWXZEHJi3wGG-t_APlno5lu4'},
  {name:'微博',label:'本人认证账号',detail:'周涛323 · 公开发帖',url:'https://weibo.com/u/6405308384'},
  {name:'百度贴吧',label:'历史社区入口',detail:'周涛吧 · 精华资料',url:'https://tieba.baidu.com/f?kw=%E5%91%A8%E6%B6%9B&ie=utf-8&tab=301'},
  {name:'小红书',label:'公开内容检索',detail:'媒体与观众记录',url:'https://www.xiaohongshu.com/search_result?keyword=%E5%91%A8%E6%B6%9B'},
];
