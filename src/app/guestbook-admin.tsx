import { useEffect, useState, type FormEvent } from 'react';
import { formatMessageDate, guestbookClient, guestbookReady, guestbookRpc, kindLabels, panelLabels, statusLabels, type GuestMessage, type MessagePage, type MessageStatus, type VisitorStats } from '../lib/guestbook';
import './guestbook.css';

function AdminMessage({ message, onChanged }: { message: GuestMessage; onChanged: () => void }) {
  const [reply, setReply] = useState(message.reply || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function save(status: MessageStatus) {
    setBusy(true); setError('');
    try { await guestbookRpc('tt_admin_update', { p_id: message.id, p_status: status, p_reply: reply.trim() || null }); onChanged(); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  return <article className="echo-admin-message"><div className="echo-card-meta"><span>{message.visibility==='private'?'仅整理者可见':'申请公开'} · {kindLabels[message.kind]} · {statusLabels[message.status!]}</span><time dateTime={message.created_at}>{formatMessageDate(message.created_at)}</time></div><h4>{message.nickname}</h4><p className="echo-message">{message.body}</p><label className="echo-label" htmlFor={`reply-${message.id}`}>{message.visibility==='private'?'处理备注（仅你可见）':'整理者回复（留言公开后展示）'}</label><textarea id={`reply-${message.id}`} value={reply} onChange={e=>setReply(e.target.value)} maxLength={2000} rows={3}/>{error&&<p className="echo-error" role="alert">{error}</p>}<div className="echo-admin-actions">{message.visibility==='public'?<button disabled={busy} onClick={()=>save('approved')}>{message.status==='approved'?'保存回复':'确认并公开'}</button>:<button disabled={busy} onClick={()=>save('handled')}>标记已处理</button>}<button disabled={busy} onClick={()=>save('pending')}>留待处理</button><button disabled={busy} onClick={()=>save('hidden')}>隐藏保留</button></div></article>;
}

export default function GuestbookAdmin() {
  const [signedIn, setSignedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('pending');
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  useEffect(() => {
    if (!guestbookClient) { setChecking(false); return; }
    let active = true;
    guestbookClient.auth.getSession().then(({data})=>{if(active){setSignedIn(Boolean(data.session));setChecking(false);}}).catch(()=>{if(active)setChecking(false);});
    const {data:{subscription}}=guestbookClient.auth.onAuthStateChange((_event,session)=>{setSignedIn(Boolean(session));setChecking(false);});
    return()=>{active=false;subscription.unsubscribe();};
  },[]);
  useEffect(() => {
    if (!signedIn) { setStats(null);setMessages([]);return; }
    let active=true; setLoading(true);setError('');
    Promise.all([guestbookRpc<VisitorStats>('tt_admin_stats'),guestbookRpc<MessagePage>('tt_admin_messages',{p_status:filter,p_offset:page*30,p_limit:30})]).then(([s,m])=>{if(active){setStats(s);setMessages(m.items);setTotal(m.total);}}).catch(e=>{if(active){setStats(null);setMessages([]);setError(e.message);}}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[signedIn,filter,page,revision]);
  async function login(event: FormEvent) {
    event.preventDefault();if(!guestbookClient||loginBusy)return;setLoginBusy(true);setError('');setLoginMessage('');
    try {
      const {error:authError}=await guestbookClient.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:location.origin+location.pathname,shouldCreateUser:true}});
      if(authError)throw new Error('登录邮件未能发出。请确认使用项目登记的管理邮箱，稍后再试。');
      setLoginMessage('请查看管理邮箱，点击刚收到的登录链接。登录后即可回到这里。');
    } catch(e){setError((e as Error).message);} finally{setLoginBusy(false);}
  }
  async function logout(){await guestbookClient?.auth.signOut();setSignedIn(false);setStats(null);setMessages([]);setError('');}
  async function exportData(){
    setExporting(true);setError('');
    try{
      const all:GuestMessage[]=[];let offset=0;
      do {const result=await guestbookRpc<MessagePage>('tt_admin_messages',{p_status:'all',p_offset:offset,p_limit:100});all.push(...result.items);offset+=result.items.length;if(offset>=result.total||!result.items.length)break;} while(offset<100000);
      const blob=new Blob([JSON.stringify({exported_at:new Date().toISOString(),messages:all,statistics:stats},null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`听涛323-留言与统计-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }catch(e){setError((e as Error).message);}finally{setExporting(false);}
  }
  const maxViews=Math.max(1,...(stats?.daily.map(d=>d.views)||[]));
  return <section className="echo-admin wrap" id="manage"><div className="echo-heading"><div><span className="section-kicker">整理者的小书桌 / YOUR DESK</span><h2>看见来访，<br/>认真回应。</h2></div><a className="archive-return" href="#guestbook">← 回到公开留言页</a></div>
    {checking?<p role="status">正在确认登录状态……</p>:!signedIn?<form className="echo-form echo-login" onSubmit={login}><h3>整理者登录</h3><p>访客无需登录。这里用于查看私密反馈、处理留言和阅读访问统计，仅向你登记的管理邮箱开放。</p>{!guestbookReady&&<p className="echo-notice">管理服务尚未连接。</p>}<label className="echo-label" htmlFor="admin-email">管理邮箱</label><input id="admin-email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="输入你的管理邮箱"/><button className="echo-submit" disabled={!guestbookReady||loginBusy} type="submit">{loginBusy?'正在发送…':'发送登录邮件'}<span>↗</span></button>{loginMessage&&<p className="echo-success" role="status">{loginMessage}</p>}{error&&<p className="echo-error" role="alert">{error}</p>}<p className="echo-small">登录状态只保留在当前浏览器会话中。请勿把登录邮件转发给别人。</p></form>:<>
      <div className="echo-toolbar"><p>统计按北京时间归档 · 仅你可见</p><div><button disabled={loading} onClick={()=>setRevision(r=>r+1)}>刷新</button><button disabled={exporting||!stats} onClick={exportData}>{exporting?'正在导出…':'导出备份'}</button><button onClick={logout}>退出登录</button></div></div>
      {error&&<p className="echo-error" role="alert">{error}</p>}{loading&&<p role="status">正在更新留言与统计……</p>}
      {stats&&<><div className="echo-metrics">{[['今日到访',stats.today_visits],['今日浏览',stats.today_views],['近30天到访',stats.month_visits],['待处理留言',stats.pending]].map(([name,value])=><div key={name}><span>{name}</span><strong>{value}</strong></div>)}</div><div className="echo-dashboard-grid"><div className="echo-chart"><div className="echo-panel-heading"><h3>最近两周，谁来翻过这本书</h3><small>浏览次数 · 悬停查看每日数量</small></div><div className="echo-bars" role="img" aria-label={`最近14天浏览次数：${stats.daily.map(d=>`${d.day} ${d.views}次`).join('，')}`}>{stats.daily.map(d=><div className="echo-bar-column" key={d.day}><span>{d.views}</span><div className="echo-bar-track"><i title={`${d.day}：${d.views}次浏览，${d.visits}次到访`} style={{height:`${d.views/maxViews*100}%`}}/></div><small>{d.day.slice(5)}</small></div>)}</div></div><div className="echo-rankings"><h3>大家停留的章节</h3><small>近30天 · 按板块浏览次数</small>{stats.panels.length?stats.panels.map(p=><div key={p.panel}><span>{panelLabels[p.panel]||p.panel}</span><b>{p.views}</b></div>):<p>还没有访问记录。</p>}</div></div><div className="echo-referrals"><h3>从哪里找到这本人物册</h3>{stats.sources.length?stats.sources.map(s=><span key={s.source}>{s.source}<b>{s.visits}</b></span>):<p>新的访问会从功能开通后开始记录。</p>}</div><p className="echo-small">“到访”按同一标签页连续30分钟内的浏览合并，不代表独立人数。无来源信息的访问归为直接访问；统计可能因隐私设置、断网或浏览器拦截而漏计。超过90天的访问记录会在后续有效访问时清理，图表展示近14天与近30天；不会显示访客身份、IP或个人浏览轨迹。</p></>}
      <div className="echo-review-heading"><h3>留言与反馈 <span>{total}</span></h3><label>筛选状态<select value={filter} onChange={e=>{setFilter(e.target.value);setPage(0);}}><option value="pending">待处理</option><option value="all">全部留言</option><option value="approved">已公开</option><option value="handled">已处理反馈</option><option value="hidden">已隐藏</option></select></label></div>
      {messages.map(m=><AdminMessage key={`${m.id}-${revision}`} message={m} onChanged={()=>setRevision(r=>r+1)}/>)}{!loading&&!messages.length&&stats&&<div className="echo-empty">这一栏暂时没有留言。</div>}<div className="echo-pagination"><button disabled={loading||page===0} onClick={()=>setPage(p=>p-1)}>上一页</button><span>第 {page+1} 页</span><button disabled={loading||(page+1)*30>=total} onClick={()=>setPage(p=>p+1)}>下一页</button></div>
    </>}
  </section>;
}
