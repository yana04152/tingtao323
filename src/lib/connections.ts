import {moments} from './archive';
import locationData from './location-records.json';

export const cities=locationData.cities;
export const locations=locationData.locations;
export const periods=[
  {id:'origin',label:'起点',years:'1968—1994',min:1968,max:1994},
  {id:'screen',label:'走上荧屏',years:'1995—2000',min:1995,max:2000},
  {id:'expand',label:'走向现场',years:'2001—2009',min:2001,max:2009},
  {id:'explore',label:'拓宽边界',years:'2010—2015',min:2010,max:2015},
  {id:'stage',label:'新的舞台',years:'2016—2020',min:2016,max:2020},
  {id:'continue',label:'继续出发',years:'2021—2026',min:2021,max:2026},
];
export const categories=[
  {id:'television',label:'电视栏目',ids:['btv','1995','2000','2001','2005-zhenqing-end','2010','2011-fangge','2014-riddle','2015-film-sharing','2019-voice','2026-taohuawu']},
  {id:'ceremony',label:'晚会与仪式',ids:['1996','1998','1999-national','2001-bid','2002-web-gala','2003-emblem','2006-crosstalk','2008-wenchuan','2008','2010-qingge','2010-yushu','2011','2012','2014','2014-crosstalk','2016-gala','2016-public','2018-buddhist-forum','2019-baihua-director','2022-anhui','2023-xibo','2024-cuc','2025-baihua','2025-security-worth']},
  {id:'music',label:'音乐与朗诵',ids:['1996-harbin','2009-national-concert','2017','2020-ncpa-guide','2023-harbin-director','2025','2026']},
  {id:'drama',label:'戏剧与影视',ids:['2018','2019-chairman-film','2020-letter','2020-wendao-kongtong','2024','2025-night-harbin','2026-short']},
  {id:'documentary',label:'纪录片',ids:['2020','2022-china','2023-china','2026-wangxizhi']},
  {id:'talk',label:'访谈与讲座',ids:['2008-olympic-lecture','2009-jianghu','2016-reading','2017-chengdu-talk','2020-jd-reading']},
  {id:'learning',label:'成长与进修',ids:['1968','1986','1990','2008-masters']},
  {id:'institution',label:'机构与公益',ids:['2004-public','2005','2008-torch','2009','2013-program-planning','2016-bpa','2021','2021-cflac','2022-poly-chair']},
  {id:'honor',label:'专业荣誉',ids:['1994','1997-silver','1999','1999-gold','2002-hundred','2003-starlight','2003-eagle','2005-cctv-host-honor','2005-youth']},
];
export const roles=[
  {id:'host',label:'主持与现场交流'},
  {id:'creator',label:'导演、制片与制作'},
  {id:'voice',label:'解说、配音与朗诵'},
  {id:'actor',label:'舞台与影视表演'},
  {id:'management',label:'文化与节目管理'},
  {id:'learning',label:'成长、学习与分享'},
  {id:'public',label:'公益与公共活动'},
  {id:'honor',label:'职业荣誉'},
];
export const workGroups=[
  {id:'variety',name:'综艺大观',ids:['1995','2000']},
  {id:'gala',name:'央视春晚',ids:['1996','2002-web-gala','2011','2016-gala','2009-jianghu','2008-masters']},
  {id:'zhenqing',name:'真情无限',ids:['2001','2005-zhenqing-end']},
  {id:'olympic',name:'北京奥运',ids:['2001-bid','2003-emblem','2005','2008-torch','2008','2008-olympic-lecture']},
  {id:'set',name:'我们有一套',ids:['2010']},
  {id:'riddle',name:'中国谜语大会',ids:['2014-riddle']},
  {id:'musicseason',name:'奥林匹克公园音乐季',ids:['2017']},
  {id:'letters',name:'情书',ids:['2018','2020-letter']},
  {id:'voice',name:'声临其境',ids:['2019-voice']},
  {id:'china',name:'中国',ids:['2020','2022-china','2023-china']},
  {id:'anhui',name:'安徽省运会系列',ids:['2022-anhui']},
  {id:'old',name:'老家伙',ids:['2024']},
  {id:'baihua',name:'百花迎春',ids:['2019-baihua-director','2025-baihua']},
  {id:'decision',name:'决胜时刻',ids:['2019-chairman-film']},
  {id:'wendao',name:'问道崆峒',ids:['2020-wendao-kongtong']},
  {id:'wang',name:'王羲之',ids:['2026-wangxizhi']},
  {id:'harbin',name:'哈尔滨之夏',ids:['1996-harbin','2023-harbin-director','2025']},
  {id:'night',name:'夜幕下的哈尔滨',ids:['2025-night-harbin']},
  {id:'taohuawu',name:'五十公里桃花坞6',ids:['2026-taohuawu']},
  {id:'harvest',name:'丰收中国',ids:['2026']},
];
function roleIds(id:string,role:string,category:string){
  const result:string[]=[];
  if(/主持|主播|大型直播|电视与网络互动|声音综艺|节目嘉宾|真人秀嘉宾/.test(role)||['1998','2001','2012','2023-xibo'].includes(id))result.push('host');
  if(/导演|制片|制作|演出策划/.test(role))result.push('creator');
  if(/解说|配音|朗诵|情景讲述|讲述人/.test(role))result.push('voice');
  if(/演员|表演|话剧|短剧/.test(role))result.push('actor');
  if(/管理|任职|奥运工作/.test(role)&&id!=='2008-olympic-lecture'||id==='2016-bpa')result.push('management');
  if(['learning','talk'].includes(category)||/导赏|阅读|讲者|职业选择/.test(role))result.push('learning');
  if(/公益|火炬手|基层/.test(role)&&category!=='honor')result.push('public');
  if(category==='honor')result.push('honor');
  if(['2017','2019-voice','2006-crosstalk'].includes(id)&&!result.includes('host'))result.push('host');
  if(['2019-voice','2006-crosstalk'].includes(id)&&!result.includes('actor'))result.push('actor');
  if(id==='2019-voice')result.push('voice');
  return result;
}
export const connectionNodes=moments.map(moment=>{
  const year=parseInt(moment.year,10);
  const category=categories.find(c=>c.ids.includes(moment.id))?.id||'unclassified';
  return {id:moment.id,moment,year,period:periods.find(p=>year>=p.min&&year<=p.max)?.id||'',category,roles:roleIds(moment.id,moment.role,category),locations:locations.filter(l=>l.momentId===moment.id),works:workGroups.filter(w=>w.ids.includes(moment.id)).map(w=>w.id)};
});
export type ConnectionNode=typeof connectionNodes[number];
export const locationKinds:Record<string,string>={'event':'公开活动','work-base':'工作基地','education':'求学','hometown':'家乡'};
