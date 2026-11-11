'use client';
import {useEffect,useRef,useState} from 'react';

export default function ReadingMusic(){
  const audio=useRef<HTMLAudioElement>(null);
  const [playing,setPlaying]=useState(false);
  const [open,setOpen]=useState(false);
  const [volume,setVolume]=useState(.18);
  const [status,setStatus]=useState('点一下，让钢琴陪你慢慢读。');
  useEffect(()=>{if(audio.current)audio.current.volume=volume;},[volume]);
  useEffect(()=>{
    const pauseForVideo=()=>{if(audio.current&&!audio.current.paused){audio.current.pause();setStatus('音乐已暂停，把声音留给这段影像。');}};
    const pauseWhenAway=()=>{if(document.hidden&&audio.current&&!audio.current.paused){audio.current.pause();setStatus('音乐已暂停；回到这里时，可以继续听。');}};
    const onLink=(event:MouseEvent)=>{const link=(event.target as Element)?.closest?.('a[href]');if(link&&/bilibili\.com|douyin\.com|iqiyi\.com|(?:tv|video)\.cctv\.com/.test(link.getAttribute('href')||''))pauseForVideo();};
    const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false);};
    window.addEventListener('zhou-tao:video-open',pauseForVideo);
    document.addEventListener('visibilitychange',pauseWhenAway);
    document.addEventListener('click',onLink,true);
    document.addEventListener('keydown',onKey);
    return()=>{window.removeEventListener('zhou-tao:video-open',pauseForVideo);document.removeEventListener('visibilitychange',pauseWhenAway);document.removeEventListener('click',onLink,true);document.removeEventListener('keydown',onKey);};
  },[]);
  async function toggle(){
    if(!audio.current)return;
    if(!audio.current.paused){audio.current.pause();setStatus('安静地读一会儿，也很好。');return;}
    audio.current.volume=volume;
    try{await audio.current.play();setStatus('萨蒂的钢琴，陪这一页慢慢翻过。');}catch{setStatus('暂时未能播放，请再试一次。');setOpen(true);}
  }
  return <aside className={`reading-music ${playing?'is-playing':''}`} aria-label="阅读配乐">
    <audio ref={audio} src="./audio/satie-gymnopedie-1-kevin-macleod.mp3" preload="none" loop onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={()=>{setPlaying(false);setStatus('配乐暂时未能加载，可以稍后再试。');}}/>
    {open&&<div className="music-sheet" id="music-sheet"><div className="music-sheet-top"><span>让这一页，有一点音乐</span><button onClick={()=>setOpen(false)} aria-label="收起配乐说明">×</button></div><h3>第一号吉姆诺佩蒂</h3><p className="music-title">Erik Satie · Gymnopédie No. 1</p><p>轻一点，慢一点。<br/>这首钢琴曲由本站选作阅读陪伴。</p><label className="music-volume">音量 <input type="range" min="0" max="100" step="1" value={Math.round(volume*100)} onChange={e=>setVolume(Number(e.target.value)/100)} aria-label="配乐音量"/><span>{Math.round(volume*100)}%</span></label><p className="music-status" role="status">{status}</p><div className="music-credit">作曲：Erik Satie<br/>编配与演奏：<a href="https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100787" target="_blank" rel="noreferrer">Kevin MacLeod / incompetech.com ↗</a><br/><a href="https://commons.wikimedia.org/wiki/File:Gymnopedie_No._1_(ISRC_USUAN1100787).mp3" target="_blank" rel="noreferrer">录音来源</a> · <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">CC BY 3.0</a> · 录音未改动<p>本站选配，不代表周涛本人的歌单。打开影像或离开页面时，配乐会暂停。</p></div></div>}
    <div className="music-pill"><button className="music-toggle" onClick={toggle} aria-label={playing?'暂停阅读配乐':'播放阅读配乐'} aria-pressed={playing}><span className="music-glyph" aria-hidden="true">{playing?'Ⅱ':'♪'}</span><span>{playing?'钢琴正在陪伴':'听一点钢琴'}</span></button><button className="music-more" onClick={()=>setOpen(v=>!v)} aria-label="配乐说明与音量" aria-expanded={open} aria-controls="music-sheet">{open?'⌄':'⌃'}</button></div>
  </aside>;
}
