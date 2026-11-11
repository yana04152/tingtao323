import researchClips from './video-records.json';

export type VideoKind = 'hosting' | 'interview' | 'backstage' | 'speech' | 'performance';
export type VideoClip = {
  id: string; bvid?: string; page?: number; platform?: 'bilibili'|'cctv'|'iqiyi'; url?: string; title: string; originalTitle: string;
  year: number; contentDate: string; kind: VideoKind; uploader: string;
  uploadedAt?: string; duration?: string; sourceNote: string; dateNote?: string;
  description: string; watchFor: string; momentIds: string[]; evidenceUrl?: string;
  thumbnail?: string; collectionUploadedAt?: string; dateUncertain?: boolean; alternatives?: {title:string;url:string;duration:string;note:string}[];
};
export const videoKinds: {id: string; label: string}[] = [
  {id:'all',label:'全部影像'}, {id:'hosting',label:'主持现场'},
  {id:'interview',label:'访谈对话'}, {id:'backstage',label:'幕后与回顾'},
  {id:'speech',label:'演讲自述'}, {id:'performance',label:'作品与表演'},
];
export const videoPeriods = [
  {id:'all',label:'所有年代',from:0,to:9999},
  {id:'early',label:'1990—2004',from:1990,to:2004},
  {id:'middle',label:'2005—2016',from:2005,to:2016},
  {id:'stage',label:'2017—2020',from:2017,to:2020},
  {id:'recent',label:'2021—至今',from:2021,to:9999},
];
export const videos = (researchClips as VideoClip[]).sort((a,b)=>a.year-b.year);
export const getVideosForMoment = (id: string) => videos.filter(v=>v.momentIds.includes(id));
export const videoUrl = (v: VideoClip) => v.url || `https://www.bilibili.com/video/${v.bvid}/${v.page ? `?p=${v.page}` : ''}`;
export const platformLabel = (v: VideoClip) => v.platform==='cctv'?'央视网':v.platform==='iqiyi'?'爱奇艺':'B站';
export const videoTopics = [
  {id:'all',label:'全部专题'},
  {id:'national',label:'国家庆典与大型晚会'},
  {id:'interviews',label:'关键访谈'},
  {id:'cctv',label:'央视栏目与幕后'},
  {id:'recent',label:'近年工作'},
];
export function matchesTopic(v:VideoClip,topic:string){
  if(topic==='national')return /春晚|百花迎春|国庆|奥运|香港回归|澳门回归|赈灾|抗震|抗洪|音乐家舞台/.test(v.title+' '+v.originalTitle);
  if(topic==='interviews')return v.kind==='interview';
  if(topic==='cctv')return v.year<=2016&&/综艺大观|我们有一套|相声大赛|谜语大会|幕后|艺览天下|陪你读书|春晚江湖/.test(v.title+' '+v.originalTitle);
  if(topic==='recent')return v.year>=2021;
  return true;
}
export const kindLabel = (v: VideoClip) => videoKinds.find(k=>k.id===v.kind)?.label || '影像资料';
