import { createClient } from '@supabase/supabase-js';
import config from './guestbook-config.json';

export const guestbookReady = Boolean(config.url && config.publishableKey);
// Older login emails included our route fragment before the auth fragment.
if (window.location.hash.startsWith('#manage#')) {
  window.history.replaceState(null, '', window.location.pathname + window.location.search + window.location.hash.slice('#manage'.length));
}
// Capture the return route before Supabase consumes and clears its URL fragment.
export const returningToDesk = /(?:^#|&)(?:access_token|error)=/.test(window.location.hash);
function sessionStorageOrMemory() {
  try { const storage = window.sessionStorage; storage.setItem('tingtao-storage-test', '1'); storage.removeItem('tingtao-storage-test'); return storage; }
  catch { const items = new Map<string,string>(); return { getItem: (key:string)=>items.get(key)??null, setItem:(key:string,value:string)=>{items.set(key,value);}, removeItem:(key:string)=>{items.delete(key);} }; }
}
export const guestbookClient = guestbookReady ? createClient(config.url, config.publishableKey, {
  auth: { persistSession: true, storage: sessionStorageOrMemory(), autoRefreshToken: true, detectSessionInUrl: true },
  global: { fetch: (input, init) => fetch(input, { ...init, signal: init?.signal ? AbortSignal.any([init.signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000) }) },
}) : null;

export type MessageKind = 'memory' | 'source' | 'feedback';
export type MessageVisibility = 'public' | 'private';
export type MessageStatus = 'pending' | 'approved' | 'hidden' | 'handled';
export interface GuestMessage { id: string; nickname: string; body: string; kind: MessageKind; created_at: string; reply: string | null; reply_at: string | null; visibility?: MessageVisibility; status?: MessageStatus }
export interface MessagePage { items: GuestMessage[]; total: number }
export interface VisitorStats { today_views: number; today_visits: number; month_views: number; month_visits: number; pending: number; daily: { day: string; views: number; visits: number }[]; panels: { panel: string; views: number }[]; sources: { source: string; visits: number }[] }
export const kindLabels: Record<MessageKind, string> = { memory: '想说的话', source: '补充资料', feedback: '使用反馈' };
export const statusLabels: Record<MessageStatus, string> = { pending: '待处理', approved: '已公开', hidden: '已隐藏', handled: '已处理' };
export const panelLabels: Record<string, string> = { home: '人物册', timeline: '完整年表', videos: '影像与长谈', career: '工作与荣誉', works: '作品索引', reading: '访谈阅读', community: '照片与旧帖', atlas: '足迹与作品', voices: '她说过的话', sources: '参考来源', guestbook: '回声 · 留言' };

export async function guestbookRpc<T>(name: string, params: Record<string, unknown> = {}): Promise<T> {
  if (!guestbookClient) throw new Error('留言服务尚未开通，请稍后再来。');
  const { data, error } = await guestbookClient.rpc(name, params);
  if (error) {
    if (error.code === '42501') throw new Error('此处仅向网站整理者开放，请使用管理邮箱登录。');
    if (error.code === 'P0001') throw new Error(error.message);
    throw new Error('暂时连接不到留言服务，请稍后重试。未成功提交的文字仍保留在输入框中。');
  }
  return data as T;
}

export function formatMessageDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

const privacyKey = 'tingtao-analytics-disabled';
export function analyticsDisabled() {
  try { return localStorage.getItem(privacyKey) === '1' || navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true; } catch { return true; }
}
export function setAnalyticsDisabled(disabled: boolean) { try { localStorage.setItem(privacyKey, disabled ? '1' : '0'); } catch { /* Storage can be unavailable in private browsing. */ } }
function referralCategory() {
  try {
    const host = new URL(document.referrer).hostname;
    if (host === location.hostname) return '直接访问';
    if (/(^|\.)(weibo\.com|weibo\.cn|sina\.cn)$/.test(host)) return '微博';
    if (/(^|\.)(douyin\.com|iesdouyin\.com)$/.test(host)) return '抖音';
    if (/(^|\.)bilibili\.com$/.test(host)) return '哔哩哔哩';
    if (/(^|\.)xiaohongshu\.com$/.test(host)) return '小红书';
    if (/(^|\.)(baidu\.com|bing\.com|google\.com)$/.test(host)) return '搜索引擎';
    return '其他网站';
  } catch { return '直接访问'; }
}
let lastTracked = '';
export async function trackPanel(panel: string) {
  if (!guestbookClient || !panelLabels[panel] || analyticsDisabled() || ['localhost', '127.0.0.1'].includes(location.hostname)) return;
  const { data } = await guestbookClient.auth.getSession();
  if (data.session || lastTracked === panel) return;
  lastTracked = panel;
  try {
    const now = Date.now();
    let visit: { id: string; touched: number };
    try { visit = JSON.parse(sessionStorage.getItem('tingtao-visit') || 'null'); } catch { visit = null as never; }
    if (!visit || now - visit.touched > 30 * 60 * 1000) visit = { id: crypto.randomUUID(), touched: now };
    visit.touched = now;
    sessionStorage.setItem('tingtao-visit', JSON.stringify(visit));
    await guestbookRpc('tt_track_view', { p_session: visit.id, p_panel: panel, p_source: referralCategory(), p_event: crypto.randomUUID() });
  } catch { /* Counting must never interrupt reading. */ }
}
