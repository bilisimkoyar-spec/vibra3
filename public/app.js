'use strict';
/* ====================================================== yardımcılar */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const P = {
  hash: 'M5.41 21l.71-4h-4l.35-2h4l1.06-6h-4l.35-2h4l.71-4h2l-.71 4h6l.71-4h2l-.71 4h4l-.35 2h-4l-1.06 6h4l-.35 2h-4l-.71 4h-2l.71-4h-6l-.71 4h-2zM9.53 9l-1.06 6h6l1.06-6h-6z',
  spk: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z',
  mic: 'M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z',
  micoff: 'M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z',
  hp: 'M12 1a9 9 0 0 0-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7a9 9 0 0 0-9-9z',
  hpoff: 'M12 1a9 9 0 0 0-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7a9 9 0 0 0-9-9z"/><path d="M3 3l18 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none',
  gear: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  phone: 'M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.956.956 0 0 1-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z',
  screen: 'M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.11-.9-2-2-2H4c-1.11 0-2 .89-2 2v10c0 1.1.89 2 2 2H0v2h24v-2h-4zm-7-3.53v-2.19c-2.78 0-4.61.85-6 2.72.56-2.67 2.11-5.33 6-5.87V7l4 3.73-4 3.74z',
  file: 'M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z',
  dl: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
  trash: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  emo: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-10c.83 0 1.5-.67 1.5-1.5S16.33 7 15.5 7 14 7.67 14 8.5s.67 1.5 1.5 1.5zm-7 0C9.33 10 10 9.33 10 8.5S9.33 7 8.5 7 7 7.67 7 8.5 7.67 10 8.5 10zm3.5 7.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z',
  chev: 'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z',
  close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  fs: 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z',
  out: 'M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z',
  add2: 'M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  crown: 'M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-1h14v1z',
  people: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  copy: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z',
};
const icon = (n, s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor"><path d="${P[n]}"/></svg>`;
const PALETTE = ['#7c5cff', '#f47b67', '#3ba55d', '#e8a317', '#5865f2', '#eb459e', '#1abc9c', '#e67e22', '#3498db'];
const sfx = n => { try { window.__sfx && window.__sfx(n); } catch {} };
const PROF = {}; // kullanıcı id -> profil (renk, afiş, hakkında, durum, avatar sürümü)
const colorOf = id => PROF[id]?.color || PALETTE[Math.abs(+id) % PALETTE.length];
const avSrc = (id, v) => `/avatars/${+id}?v=${v}`;
const avatar = (id, name, cls = '', extra = '') => {
  const p = PROF[id];
  const inner = p?.av ? `<img src="${avSrc(id, p.av)}" alt="" draggable="false">` : esc((name || '?')[0].toUpperCase());
  return `<div class="av ${cls}" data-prof="${+id}" style="background:${colorOf(id)}">${inner}${extra}</div>`;
};
const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16); const f = c => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join('');
};
const bannerCss = (c, b1, b2) => { const a = b1 || c, b = b2 || (b1 ? b1 : shade(c, -0.45)); return `linear-gradient(135deg,${a},${b})`; };
function rebuildProf() {
  for (const k of Object.keys(PROF)) delete PROF[k];
  for (const s of S.servers) for (const m of s.members) PROF[m.id] = m;
  if (S.me) PROF[S.me.id] = { ...(PROF[S.me.id] || {}), ...S.me };
}
const INLINE = /^(image\/(png|jpe?g|gif|webp|avif|bmp)|video\/(mp4|webm|ogg)|audio\/(mpeg|ogg|wav|webm|mp4|aac|flac|x-m4a))$/i;
const fmtSize = n => n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : n < 1073741824 ? (n / 1048576).toFixed(1) + ' MB' : (n / 1073741824).toFixed(2) + ' GB';
const pad = n => String(n).padStart(2, '0');
const sameDay = (a, b) => a.toDateString() === b.toDateString();
function fmtTime(ts) {
  const d = new Date(ts), t = new Date(), y = new Date(Date.now() - 864e5);
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (sameDay(d, t)) return `Bugün saat ${hm}`;
  if (sameDay(d, y)) return `Dün saat ${hm}`;
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${hm}`;
}
const fmtDay = ts => new Date(ts).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
function linkify(text) {
  return esc(text).replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])/g, u => `<a href="${u}" target="_blank" rel="noopener noreferrer">${u}</a>`);
}
let toastT;
function toast(t) { const e = $('#toast'); e.textContent = t; e.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => e.classList.remove('show'), 3000); }
async function api(path, method = 'GET', body) {
  const r = await fetch(path, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
  let d = {}; try { d = await r.json(); } catch {}
  if (!r.ok) { const e = new Error(d.error || 'Bir hata oluştu'); e.data = d; e.status = r.status; throw e; }
  return d;
}

/* ============================================================= durum */
const S = {
  me: null, servers: [], srvId: null, chanId: null, online: new Set(), voice: {}, msgs: {}, unread: {},
  typing: {}, drafts: {}, ws: null, menuOpen: false,
};
const curServer = () => S.servers.find(s => s.id === S.srvId) || null;
const curChan = () => curServer()?.channels.find(c => c.id === S.chanId) || null;
const findChan = id => { for (const s of S.servers) { const c = s.channels.find(c => c.id === id); if (c) return { s, c }; } return null; };
const userName = id => { for (const s of S.servers) { const m = s.members.find(m => m.id === id); if (m) return m.username; } return 'Kullanıcı'; };

/* ============================================================== giriş */
function showAuth(mode = 'login', note) {
  $('#boot').classList.add('hidden'); $('#app').classList.add('hidden'); $('#auth').classList.remove('hidden');
  const banner = note || '';
  const logo = `<div class="alogo"><i><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7l7 11 7-11"/></svg></i>Vibra</div>`;
  const a = $('#auth');
  if (mode === 'login') {
    a.innerHTML = `<form class="acard" id="fAuth">${logo}<h1>Tekrar hoş geldin!</h1><div class="sub">Seni yeniden gördüğümüze çok sevindik!</div>${banner}<div id="aerr"></div>
      <div class="field"><label>Kullanıcı adı</label><input name="username" autocomplete="username" required autofocus></div>
      <div class="field"><label>Şifre</label><input name="password" type="password" autocomplete="current-password" required></div>
      <button class="btn full" type="submit">Giriş Yap</button>
      <div class="alink">Hesabın yok mu? <a id="goReg">Kayıt ol</a></div></form>`;
    $('#goReg').onclick = () => showAuth('register');
    $('#fAuth').onsubmit = async e => {
      e.preventDefault(); const f = e.target; const btn = f.querySelector('button'); btn.disabled = true;
      try { await api('/api/login', 'POST', { username: f.username.value, password: f.password.value }); location.reload(); }
      catch (err) { btn.disabled = false; $('#aerr').innerHTML = `<div class="alert err">${esc(err.message)}</div>`; }
    };
  } else {
    a.innerHTML = `<form class="acard" id="fAuth">${logo}<h1>Hesap oluştur</h1><div class="sub">Kayıt kodunla aramıza katıl.</div><div id="aerr"></div>
      <div class="field"><label>Kayıt kodu</label><input name="code" autocomplete="off" spellcheck="false" maxlength="64" required autofocus></div>
      <div class="field"><label>Kullanıcı adı</label><input name="username" autocomplete="username" minlength="2" maxlength="32" required></div>
      <div class="field"><label>Şifre (en az 8 karakter)</label><input name="password" type="password" autocomplete="new-password" minlength="8" required></div>
      <button class="btn full" type="submit">Devam Et</button>
      <div class="alink"><a id="goLog">Zaten bir hesabın var mı?</a></div></form>`;
    $('#goLog').onclick = () => showAuth('login');
    $('#fAuth').onsubmit = async e => {
      e.preventDefault(); const f = e.target; const btn = f.querySelector('button'); btn.disabled = true;
      try { await api('/api/register', 'POST', { code: f.code.value, username: f.username.value, password: f.password.value }); location.reload(); }
      catch (err) { btn.disabled = false; $('#aerr').innerHTML = `<div class="alert err">${esc(err.message)}</div>`; }
    };
  }
}

/* ========================================================== başlangıç */
async function boot() {
  try {
    const me = await api('/api/me');
    S.me = me.user; S.servers = me.servers; rebuildProf();
    const last = JSON.parse(localStorage.getItem('vibra.last') || 'null');
    if (last && S.servers.some(s => s.id === last.s)) { S.srvId = last.s; S.chanId = last.c; }
    $('#boot').classList.add('hidden'); $('#auth').classList.add('hidden'); $('#app').classList.remove('hidden');
    ensureSelection(); connectWS(); renderAll();
  } catch { showAuth('login'); }
}
function ensureSelection() {
  let s = curServer();
  if (!s) { s = S.servers[0] || null; S.srvId = s ? s.id : null; S.chanId = null; }
  if (s && !curChan()) { const c = s.channels.find(c => c.type === 'text') || s.channels[0]; S.chanId = c ? c.id : null; }
  if (S.srvId) localStorage.setItem('vibra.last', JSON.stringify({ s: S.srvId, c: S.chanId }));
}
async function resync() {
  try {
    const me = await api('/api/me'); S.servers = me.servers; S.me = me.user;
    const sig = JSON.stringify(PROF); rebuildProf();
    const oldChan = S.chanId; ensureSelection();
    renderRail(); renderSide(); renderMembers();
    if (oldChan !== S.chanId || !$('#main').firstChild) renderMain();
    else if (sig !== JSON.stringify(PROF)) {
      renderUPanel(); const c = curChan();
      if (c?.type === 'text') renderMsgs(false); else if (c?.type === 'voice') renderStage();
    }
  } catch {}
}

/* ========================================================== websocket */
let wsRetry = 0;
function connectWS() {
  const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`);
  S.ws = ws;
  ws.onopen = () => { wsRetry = 0; };
  ws.onmessage = e => { try { onWS(JSON.parse(e.data)); } catch (err) { console.error(err); } };
  ws.onclose = () => {
    if (S.ws !== ws) return; S.ws = null;
    if (call.chanId) leaveCall(true);
    setTimeout(connectWS, Math.min(8000, 800 * ++wsRetry));
  };
}
const wsSend = o => { if (S.ws && S.ws.readyState === 1) S.ws.send(JSON.stringify(o)); };

function onWS(d) {
  switch (d.t) {
    case 'hello':
      S.online = new Set(d.online); S.voice = {};
      for (const [k, v] of Object.entries(d.voice || {})) S.voice[k] = v;
      resync(); renderSide(); renderMembers(); break;
    case 'presence': S.online = new Set(d.online); renderMembers(); break;
    case 'sync': resync(); break;
    case 'msg': onMsg(d.m); break;
    case 'del': {
      const st = S.msgs[d.channelId]; if (st) st.list = st.list.filter(m => m.id !== d.id);
      const el = document.querySelector(`.msg[data-id="${d.id}"]`);
      if (el) { const was = el.nextElementSibling; el.remove(); if (st && d.channelId === S.chanId) renderMsgs(true); }
      break;
    }
    case 'typing': {
      const t = S.typing[d.channelId] = S.typing[d.channelId] || {};
      t[d.userId] = { name: d.username, at: Date.now() }; renderTyping(); break;
    }
    case 'voice':
      if (call.chanId === d.channelId) {
        const old = new Set((S.voice[d.channelId] || []).map(u => u.id)), nw = new Set(d.users.map(u => u.id));
        if ([...nw].some(i => !old.has(i) && i !== S.me.id)) sfx('join'); if ([...old].some(i => !nw.has(i) && i !== S.me.id)) sfx('leave');
      }
      if (d.users.length) S.voice[d.channelId] = d.users; else delete S.voice[d.channelId];
      renderSide(); if (curChan()?.type === 'voice') { renderStage(); renderVBar(); }
      if (call.chanId === d.channelId) call.sync(d.users);
      break;
    case 'voice:peers': call.onPeers(d); break;
    case 'voice:left': call.closePeer(d.id); window.__world?.onLeft(d.id); break;
    case 'world': window.__world?.onNet(d); break;
    case 'tv': window.__world?.onTv(d); break;
    case 'okey': case 'okey:hand': case 'okey:err': window.__world?.onOkey(d); break;
    case 'signal': call.onSignal(d.from, d.data); break;
  }
}

/* ============================================================== render */
function renderAll() { renderRail(); renderSide(); renderMain(); renderMembers(); renderUPanel(); renderVPanel(); }

function renderRail() {
  const unreadSrv = s => s.channels.some(c => S.unread[c.id] > 0);
  $('#rail').innerHTML =
    `<div class="ri home" data-act="home"><span class="pill"></span><div class="ball"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:#fff"><path d="M5 7l7 11 7-11"/></svg></div><div class="tip">Vibra</div></div><div class="rsep"></div>` +
    S.servers.map(s => `<div class="ri${s.id === S.srvId ? ' active' : ''}${unreadSrv(s) ? ' unread' : ''}" data-srv="${s.id}"><span class="pill"></span><div class="ball">${esc(s.name.split(/\s+/).map(w => w[0]).join('').slice(0, 3).toUpperCase())}</div><div class="tip">${esc(s.name)}</div></div>`).join('') +
    `<div class="ri add" data-act="add"><span class="pill"></span><div class="ball">${icon('plus', 24)}</div><div class="tip">Sunucu Ekle</div></div>`;
}
$('#rail').addEventListener('click', e => {
  const el = e.target.closest('.ri'); if (!el) return;
  if (el.dataset.act === 'add' || el.dataset.act === 'home') return modalAddServer();
  selectServer(+el.dataset.srv);
});
function selectServer(id) {
  if (id === S.srvId) return;
  S.srvId = id; S.chanId = null; ensureSelection();
  const c = curChan(); if (c) S.unread[c.id] = 0;
  S.menuOpen = false; renderAll();
}
function selectChannel(id) {
  const ch = curServer()?.channels.find(c => c.id === id); if (!ch) return;
  S.drafts[S.chanId] = $('#input')?.value || '';
  S.chanId = id; S.unread[id] = 0; S.menuOpen = false;
  localStorage.setItem('vibra.last', JSON.stringify({ s: S.srvId, c: S.chanId }));
  if (ch.type === 'voice' && call.chanId !== id) call.join(id);
  renderRail(); renderSide(); renderMain();
}

function renderSide() {
  const s = curServer();
  $('#shead').innerHTML = s ? `<span class="sname">${esc(s.name)}</span>${S.menuOpen ? icon('close', 18) : icon('chev', 20)}` : '<span class="sname">Vibra</span>';
  $('#shead').onclick = () => { if (curServer()) { S.menuOpen = !S.menuOpen; renderSide(); } };
  document.querySelector('#side .menu')?.remove();
  if (s && S.menuOpen) {
    const own = s.ownerId === S.me.id;
    const m = document.createElement('div'); m.className = 'menu';
    m.innerHTML = `<button data-m="inv">Arkadaşlarını Davet Et ${icon('add2', 18)}</button>${own ? `<button data-m="chan">Kanal Oluştur ${icon('plus', 18)}</button>` : `<button class="d" data-m="leave">Sunucudan Ayrıl ${icon('out', 18)}</button>`}`;
    m.onclick = e => {
      const b = e.target.closest('button'); if (!b) return; S.menuOpen = false; renderSide();
      if (b.dataset.m === 'inv') modalInvite(s); else if (b.dataset.m === 'chan') modalChannel(s); else if (b.dataset.m === 'leave') leaveServer(s);
    };
    $('#side').appendChild(m);
  }
  const box = $('#chans');
  if (!s) { box.innerHTML = ''; return; }
  const own = s.ownerId === S.me.id;
  const section = (title, type) => {
    const list = s.channels.filter(c => c.type === type);
    return `<div class="cat"><span>${title}</span>${own ? `<button data-new="${type}" title="Kanal Oluştur">${icon('plus', 16)}</button>` : ''}</div>` + list.map(c => {
      const un = S.unread[c.id] > 0 && c.id !== S.chanId;
      let h = `<div class="chan${c.id === S.chanId ? ' active' : ''}${un ? ' unread' : ''}" data-chan="${c.id}"><span style="opacity:.8">${icon(type === 'text' ? 'hash' : 'spk', 20)}</span><span class="cname">${esc(c.name)}</span>${un ? `<span class="badge">${S.unread[c.id] > 99 ? '99+' : S.unread[c.id]}</span>` : ''}</div>`;
      if (type === 'voice' && S.voice[c.id]) {
        h += '<div class="vlist">' + S.voice[c.id].map(u => `<div class="vu">${avatar(u.id, userName(u.id), 's' + (u.speaking ? ' speak' : ''))}<span class="un">${esc(userName(u.id))}</span>${u.sharing ? '<span class="livebadge">CANLI</span>' : ''}${u.muted ? `<span class="ic">${icon('micoff', 16)}</span>` : ''}${u.deaf ? `<span class="ic">${icon('hpoff', 16)}</span>` : ''}</div>`).join('') + '</div>';
      }
      return h;
    }).join('');
  };
  box.innerHTML = section('Metin Kanalları', 'text') + section('Ses Kanalları', 'voice');
}
$('#chans').addEventListener('click', e => {
  const n = e.target.closest('[data-new]'); if (n) return modalChannel(curServer(), n.dataset.new);
  const c = e.target.closest('[data-chan]'); if (c) selectChannel(+c.dataset.chan);
});

function renderUPanel() {
  const me = S.me;
  $('#upanel').innerHTML = `<div class="upi">${avatar(me.id, me.username, '', `<span class="st on"></span>`)}<div class="upn"><b>${esc(me.username)}</b><span>${me.status ? esc(me.status) : 'Çevrimiçi'}</span></div></div>
    <button class="ib${call.muted ? ' off' : ''}" id="bMic" title="${call.muted ? 'Sesi Aç' : 'Sustur'}">${icon(call.muted || call.deaf ? 'micoff' : 'mic')}</button>
    <button class="ib${call.deaf ? ' off' : ''}" id="bDeaf" title="${call.deaf ? 'Sağırlaştırmayı Kaldır' : 'Sağırlaştır'}">${icon(call.deaf ? 'hpoff' : 'hp')}</button>
    <button class="ib" id="bSet" title="Kullanıcı Ayarları">${icon('gear')}</button>`;
  $('#bMic').onclick = () => call.toggleMute(); $('#bDeaf').onclick = () => call.toggleDeaf(); $('#bSet').onclick = modalSettings;
  $('#upanel .upi').onclick = modalProfile;
}
function renderVPanel() {
  const el = $('#vpanel');
  if (!call.chanId) { el.innerHTML = ''; return; }
  const f = findChan(call.chanId);
  el.innerHTML = `<div class="vp-row"><div style="min-width:0"><div class="vp-st">${icon('spk', 16)} Ses Bağlandı</div><div class="vp-sub">${esc(f?.c.name || '')} / ${esc(f?.s.name || '')}</div></div><button class="ib" id="bLeave" title="Bağlantıyı Kes">${icon('phone')}</button></div>
    <div class="vp-btns"><button id="bShare" class="${call.screen ? 'on' : ''}" title="${call.screen ? 'Paylaşımı Durdur' : 'Ekran Paylaş'}">${icon('screen')}</button></div>`;
  $('#bLeave').onclick = () => leaveCall(); $('#bShare').onclick = () => call.toggleShare();
}

/* ------------------------------------------------------------ ana alan */
function renderMain() {
  const m = $('#main'), s = curServer(), ch = curChan();
  if (!s) {
    m.innerHTML = `<div class="empty"><svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#7c5cff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7l7 11 7-11"/></svg><h2>Vibra'ya hoş geldin, ${esc(S.me.username)}!</h2><p>Henüz hiçbir sunucuda değilsin. Kendi sunucunu kur ya da bir arkadaşının davet koduyla katıl.</p><div class="row"><button class="btn" id="eNew">Sunucu Oluştur</button><button class="btn sec" id="eJoin">Sunucuya Katıl</button></div></div>`;
    $('#eNew').onclick = modalCreateServer; $('#eJoin').onclick = modalJoinServer; return;
  }
  if (!ch) { m.innerHTML = ''; return; }
  if (ch.type === 'voice') {
    m.innerHTML = `<div class="mhdr"><span class="hic">${icon('spk', 24)}</span><span>${esc(ch.name)}</span></div><div class="stage" id="stage"></div><div class="vbar" id="vbar"></div>`;
    renderStage(); renderVBar(); return;
  }
  m.innerHTML = `<div class="mhdr"><span class="hic">${icon('hash', 24)}</span><span>${esc(ch.name)}</span></div>
    <div class="chat"><div class="msgs" id="msgs"></div><div id="typing"></div><div id="uploads"></div>
    <div class="composer"><div class="cbox"><button class="cbtn" id="bAttach" title="Dosya Yükle">${icon('plus', 24)}</button><textarea id="input" rows="1" maxlength="4000" placeholder="#${esc(ch.name)} kanalına mesaj gönder"></textarea><button class="cbtn" id="bEmoji" title="Emoji">${icon('emo', 24)}</button></div></div></div>
    <input type="file" id="fileIn" multiple hidden>`;
  wireComposer(ch);
  loadMsgs(ch.id);
}

/* ---------------------------------------------------------- mesajlar */
async function loadMsgs(cid) {
  if (!S.msgs[cid]) {
    try { const d = await api(`/api/messages?channelId=${cid}`); S.msgs[cid] = { list: d.messages, more: d.more }; }
    catch (e) { toast(e.message); return; }
  }
  if (S.chanId === cid) renderMsgs(true);
}
function msgHTML(m, prev) {
  const grp = prev && prev.userId === m.userId && m.created - prev.created < 420000 && sameDay(new Date(m.created), new Date(prev.created));
  const f = m.file; let att = '';
  if (f) {
    const url = `/files/${f.id}`;
    if (/^image\//i.test(f.mime) && INLINE.test(f.mime)) att = `<div class="att"><img class="aimg" loading="lazy" src="${url}" alt="${esc(f.name)}" data-full="${url}"></div><div class="fcap">${esc(f.name)} · ${fmtSize(f.size)}</div>`;
    else if (/^video\//i.test(f.mime) && INLINE.test(f.mime)) att = `<div class="att"><video controls preload="metadata" src="${url}"></video></div><div class="fcap">${esc(f.name)} · ${fmtSize(f.size)} · <a href="${url}?dl=1">İndir</a></div>`;
    else if (/^audio\//i.test(f.mime) && INLINE.test(f.mime)) att = `<div class="att"><audio controls preload="metadata" src="${url}"></audio></div><div class="fcap">${esc(f.name)} · ${fmtSize(f.size)}</div>`;
    else att = `<div class="att"><div class="fcard"><span class="fi">${icon('file', 36)}</span><div class="fm"><a href="${url}?dl=1" title="${esc(f.name)}">${esc(f.name)}</a><span>${fmtSize(f.size)}</span></div><a class="dl" href="${url}?dl=1" title="İndir">${icon('dl')}</a></div></div>`;
  }
  const t = new Date(m.created);
  const head = grp ? `<div class="gut"><span class="gt">${pad(t.getHours())}:${pad(t.getMinutes())}</span></div>`
    : `<div class="gut">${avatar(m.userId, m.username, 'm')}</div>`;
  return `<div class="msg${grp ? ' grp' : ''}" data-id="${m.id}">${head}<div class="mb">${grp ? '' : `<div class="mh"><span class="mn" data-prof="${m.userId}" style="color:${colorOf(m.userId)}">${esc(m.username)}</span><span class="mt">${fmtTime(m.created)}</span></div>`}${m.content ? `<div class="mx">${linkify(m.content)}</div>` : ''}${att}</div>${m.userId === S.me.id ? `<div class="mtools"><button data-del="${m.id}" title="Sil">${icon('trash', 18)}</button></div>` : ''}</div>`;
}
function renderMsgs(scrollEnd) {
  const box = $('#msgs'); if (!box) return; const st = S.msgs[S.chanId]; if (!st) return;
  const ch = curChan();
  let h = st.more ? '' : `<div class="spacer"></div><div class="welcome"><div class="wic">${icon('hash', 40)}</div><h1>#${esc(ch.name)} kanalına hoş geldin!</h1><p>Bu, #${esc(ch.name)} kanalının başlangıcı.</p></div>`;
  let prev = null;
  for (const m of st.list) {
    if (!prev || !sameDay(new Date(prev.created), new Date(m.created))) { h += `<div class="daydiv"><span>${fmtDay(m.created)}</span></div>`; prev = null; }
    h += msgHTML(m, prev); prev = m;
  }
  const keep = box.scrollHeight - box.scrollTop;
  box.innerHTML = h;
  if (scrollEnd) box.scrollTop = box.scrollHeight; else box.scrollTop = box.scrollHeight - keep;
}
function onMsg(m) {
  const st = S.msgs[m.channelId];
  if (st) st.list.push(m);
  if (m.channelId === S.chanId && $('#msgs')) {
    const box = $('#msgs'); const near = box.scrollHeight - box.scrollTop - box.clientHeight < 140 || m.userId === S.me.id;
    if (st) renderMsgs(near);
    const t = S.typing[m.channelId]; if (t) delete t[m.userId]; renderTyping();
    if (document.hidden && m.userId !== S.me.id) bumpTitle(); if (m.userId !== S.me.id) sfx('msg');
  } else if (m.userId !== S.me.id) {
    sfx('msg'); S.unread[m.channelId] = (S.unread[m.channelId] || 0) + 1; renderRail(); renderSide(); bumpTitle();
  }
}
let titleN = 0;
function bumpTitle() { titleN++; document.title = `(${titleN}) Vibra`; }
document.addEventListener('visibilitychange', () => { if (!document.hidden) { titleN = 0; document.title = 'Vibra'; } });

function renderTyping() {
  const el = $('#typing'); if (!el) return;
  const t = S.typing[S.chanId] || {}; const now = Date.now();
  const names = Object.entries(t).filter(([id, v]) => now - v.at < 5000).map(([, v]) => v.name);
  el.innerHTML = names.length ? `<i></i><i></i><i></i><span><b>${names.length > 3 ? 'Birkaç kişi' : names.map(esc).join(', ')}</b> yazıyor...</span>` : '';
}
setInterval(renderTyping, 1500);

function wireComposer(ch) {
  const inp = $('#input'); inp.value = S.drafts[ch.id] || '';
  const grow = () => { inp.style.height = 'auto'; inp.style.height = Math.min(inp.scrollHeight, window.innerHeight * .5) + 'px'; };
  grow(); inp.focus();
  let lastTyping = 0;
  inp.oninput = () => { grow(); if (Date.now() - lastTyping > 3000 && inp.value) { lastTyping = Date.now(); wsSend({ t: 'typing', channelId: ch.id }); } };
  inp.onkeydown = e => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault(); const v = inp.value.trim(); if (!v) return;
      wsSend({ t: 'msg', channelId: ch.id, content: v }); inp.value = ''; S.drafts[ch.id] = ''; grow(); lastTyping = 0;
    }
  };
  inp.onpaste = e => { const f = [...(e.clipboardData?.files || [])]; if (f.length) { e.preventDefault(); f.forEach(uploadFile); } };
  $('#bAttach').onclick = () => $('#fileIn').click();
  $('#fileIn').onchange = e => { [...e.target.files].forEach(uploadFile); e.target.value = ''; };
  $('#bEmoji').onclick = e => { e.stopPropagation(); toggleEmoji(); };
  $('#msgs').onscroll = async e => {
    const box = e.target, st = S.msgs[S.chanId];
    if (box.scrollTop < 80 && st?.more && !st.loading) {
      st.loading = true;
      try { const d = await api(`/api/messages?channelId=${S.chanId}&before=${st.list[0].id}`); st.list = d.messages.concat(st.list); st.more = d.more; renderMsgs(false); } catch {}
      st.loading = false;
    }
  };
  $('#msgs').onclick = e => {
    const d = e.target.closest('[data-del]'); if (d) { wsSend({ t: 'del', id: +d.dataset.del }); return; }
    const img = e.target.closest('img[data-full]'); if (img) { const lb = $('#lightbox'); lb.innerHTML = `<img src="${img.dataset.full}">`; lb.classList.remove('hidden'); }
  };
}
$('#lightbox').onclick = () => { $('#lightbox').classList.add('hidden'); $('#lightbox').innerHTML = ''; };
const EMOJIS = '😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 😉 😍 🥰 😘 😋 😎 🤩 🥳 😏 😒 😞 😔 😢 😭 😤 😡 🤯 😱 🤔 🤗 🙄 😴 🤤 😷 🤒 👍 👎 👏 🙌 🙏 💪 👀 🔥 ✨ 💯 ❤️ 💔 💜 💙 💚 🎉 🎮 🎧 🎵 🍕 ☕ 🚀 ⭐ ✅ ❌ 😈 👻 💀 🤝'.split(' ');
function toggleEmoji() {
  const ex = $('.emo'); if (ex) return ex.remove();
  const d = document.createElement('div'); d.className = 'emo';
  d.innerHTML = EMOJIS.map(e => `<button type="button">${e}</button>`).join('');
  d.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    const inp = $('#input'); const p = inp.selectionStart ?? inp.value.length;
    inp.value = inp.value.slice(0, p) + b.textContent + inp.value.slice(inp.selectionEnd ?? p); inp.focus(); inp.selectionStart = inp.selectionEnd = p + b.textContent.length;
  };
  $('.composer').appendChild(d);
}
document.addEventListener('click', e => { if (!e.target.closest('.emo')) $('.emo')?.remove(); });

/* -------------------------------------------------------- dosya yükleme */
function uploadFile(file) {
  const cid = S.chanId; if (!cid) return;
  const MAX = 100 * 1024 * 1024;
  if (file.size > MAX) return toast(`"${file.name}" çok büyük (en fazla 100 MB).`);
  if (!file.size) return toast(`"${file.name}" boş bir dosya.`);
  const box = $('#uploads'); const row = document.createElement('div'); row.className = 'up';
  row.innerHTML = `<span>${icon('file', 22)}</span><span class="un2">${esc(file.name)}</span><div class="bar"><i></i></div><span class="pc">0%</span><button class="ib" title="İptal">${icon('close', 18)}</button>`;
  box?.appendChild(row);
  const x = new XMLHttpRequest(); x.open('POST', '/api/upload');
  x.setRequestHeader('X-Channel', cid); x.setRequestHeader('X-Filename', encodeURIComponent(file.name));
  x.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
  x.upload.onprogress = e => { if (e.lengthComputable) { const p = Math.round(e.loaded / e.total * 100); row.querySelector('i').style.width = p + '%'; row.querySelector('.pc').textContent = p + '%'; } };
  x.onload = () => { row.remove(); if (x.status !== 200) { let m = 'Yükleme başarısız.'; try { m = JSON.parse(x.responseText).error || m; } catch {} toast(m); } };
  x.onerror = () => { row.remove(); toast('Yükleme sırasında bağlantı hatası.'); };
  x.onabort = () => row.remove();
  row.querySelector('button').onclick = () => x.abort();
  x.send(file);
}
let dragN = 0;
const isFileDrag = e => e.dataTransfer && [...e.dataTransfer.types].includes('Files');
document.addEventListener('dragenter', e => { if (!isFileDrag(e) || curChan()?.type !== 'text') return; e.preventDefault(); if (++dragN === 1) { const d = document.createElement('div'); d.className = 'dropzone'; d.id = 'dz'; d.textContent = `#${curChan().name} kanalına yüklemek için bırak`; $('#main').appendChild(d); } });
document.addEventListener('dragover', e => { if (isFileDrag(e)) e.preventDefault(); });
document.addEventListener('dragleave', e => { if (!isFileDrag(e)) return; if (--dragN <= 0) { dragN = 0; $('#dz')?.remove(); } });
document.addEventListener('drop', e => { if (!isFileDrag(e)) return; e.preventDefault(); dragN = 0; $('#dz')?.remove(); if (curChan()?.type === 'text') [...e.dataTransfer.files].forEach(uploadFile); });

/* ------------------------------------------------------------- üyeler */
function renderMembers() {
  const s = curServer(), el = $('#members'); if (!s) { el.innerHTML = ''; return; }
  const on = s.members.filter(m => S.online.has(m.id)), off = s.members.filter(m => !S.online.has(m.id));
  const row = (m, o) => `<div class="mem${o ? '' : ' off'}" data-prof="${m.id}">${avatar(m.id, m.username, '', `<span class="st${o ? ' on' : ''}"></span>`)}<div class="mcol"><span class="mn2"${m.color ? ` style="color:${m.color}"` : ''}>${esc(m.username)}</span>${m.status ? `<span class="mst">${esc(m.status)}</span>` : ''}</div>${m.id === s.ownerId ? `<span class="crown" title="Sunucu Sahibi">${icon('crown', 16)}</span>` : ''}</div>`;
  el.innerHTML = (on.length ? `<div class="cat">Çevrimiçi — ${on.length}</div>` + on.map(m => row(m, true)).join('') : '') + (off.length ? `<div class="cat">Çevrimdışı — ${off.length}</div>` + off.map(m => row(m, false)).join('') : '');
}

/* ================================================================ ses */
const QUAL = {
  '4k60': { label: '4K · 60 FPS', w: 3840, h: 2160, fps: 60, bps: 45e6 },
  '1440p60': { label: '1440p · 60 FPS', w: 2560, h: 1440, fps: 60, bps: 25e6 },
  '1080p60': { label: '1080p · 60 FPS', w: 1920, h: 1080, fps: 60, bps: 15e6 },
  '720p30': { label: '720p · 30 FPS', w: 1280, h: 720, fps: 30, bps: 4e6 },
};
const ICE = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] };

const call = {
  chanId: null, pcs: new Map(), mic: null, ctx: null, analyser: null, speakT: null, speaking: false,
  muted: false, deaf: false, screen: null, shareSenders: new Map(), videos: new Map(), localVideo: null,
  quality: localStorage.getItem('vibra.q') || '4k60', users: [],

  async join(chanId) {
    if (!navigator.mediaDevices) toast('Mikrofon ve ekran paylaşımı için HTTPS veya localhost gerekir.');
    if (this.chanId) await leaveCall(true);
    this.chanId = chanId;
    try {
      this.mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      this.setupAnalyser();
    } catch (e) { this.mic = null; toast('Mikrofona erişilemedi; sadece dinleyici olarak bağlandın.'); }
    this.applyMic();
    wsSend({ t: 'voice:join', channelId: chanId, muted: this.muted, deaf: this.deaf });
    renderVPanel(); renderUPanel(); sfx('join');
  },
  setupAnalyser() {
    const AC = window.AudioContext || window.webkitAudioContext; this.ctx = new AC();
    const src = this.ctx.createMediaStreamSource(this.mic); this.analyser = this.ctx.createAnalyser(); this.analyser.fftSize = 512; src.connect(this.analyser);
    const buf = new Uint8Array(this.analyser.fftSize); let hold = 0;
    this.speakT = setInterval(() => {
      this.analyser.getByteTimeDomainData(buf); let s = 0; for (const v of buf) { const x = (v - 128) / 128; s += x * x; }
      const loud = Math.sqrt(s / buf.length) > 0.025 && !this.muted && !this.deaf;
      if (loud) hold = Date.now() + 350;
      const sp = Date.now() < hold;
      if (sp !== this.speaking) { this.speaking = sp; wsSend({ t: 'speaking', v: sp }); }
    }, 90);
  },
  applyMic() { this.mic?.getAudioTracks().forEach(t => t.enabled = !this.muted && !this.deaf); },
  pushState() { wsSend({ t: 'voice:state', muted: this.muted, deaf: this.deaf, sharing: !!this.screen }); },
  toggleMute() {
    if (this.deaf) { this.deaf = false; this.muted = false; } else this.muted = !this.muted;
    this.applyDeaf(); this.applyMic(); this.pushState(); renderUPanel(); renderVBar(); sfx(this.muted || this.deaf ? 'mute' : 'unmute');
  },
  toggleDeaf() {
    this.deaf = !this.deaf; this.applyDeaf(); this.applyMic(); this.pushState(); renderUPanel(); renderVBar(); sfx(this.deaf ? 'deaf' : 'undeaf');
  },
  applyDeaf() {
    document.querySelectorAll('#audio-root audio').forEach(a => a.muted = this.deaf);
    this.videos.forEach(v => { if (v !== this.localVideo) v.muted = this.deaf; });
  },
  sync(users) { this.users = users; this.applyDeaf(); },

  onPeers(d) { if (d.channelId !== this.chanId) return; d.peers.forEach(id => this.makePC(id, true)); },
  sig(to, data) { wsSend({ t: 'signal', to, data }); },
  makePC(id, initiator) {
    if (this.pcs.has(id)) return this.pcs.get(id);
    const pc = new RTCPeerConnection(ICE);
    const p = { id, pc, polite: S.me.id < id, making: false, ignore: false, screenStreamId: null, els: [] };
    this.pcs.set(id, p);
    pc.onnegotiationneeded = async () => {
      try { p.making = true; await pc.setLocalDescription(); this.sig(id, { description: pc.localDescription }); }
      catch (e) { console.error('negotiation', e); } finally { p.making = false; }
    };
    pc.onicecandidate = e => { if (e.candidate) this.sig(id, { candidate: e.candidate }); };
    pc.ontrack = e => this.onTrack(p, e);
    pc.oniceconnectionstatechange = () => { if (pc.iceConnectionState === 'failed') { try { pc.restartIce(); } catch {} } };
    if (this.mic) this.mic.getTracks().forEach(t => pc.addTrack(t, this.mic));
    else if (initiator) pc.addTransceiver('audio', { direction: 'recvonly' });
    if (this.screen) {
      this.sig(id, { screen: { streamId: this.screen.id } });
      this.screen.getTracks().forEach(t => { const s = pc.addTrack(t, this.screen); this.shareSenders.set(id + ':' + t.kind, s); });
      this.scheduleBitrate();
    }
    return p;
  },
  async onSignal(from, data) {
    if (!this.chanId) return;
    const p = this.pcs.get(from) || this.makePC(from, false); const pc = p.pc;
    try {
      if (data.screen !== undefined) {
        if (data.screen) p.screenStreamId = data.screen.streamId;
        else { p.screenStreamId = null; this.removeScreenEl(from); }
      } else if (data.description) {
        const d = data.description;
        const collision = d.type === 'offer' && (p.making || pc.signalingState !== 'stable');
        p.ignore = !p.polite && collision; if (p.ignore) return;
        await pc.setRemoteDescription(d);
        if (d.type === 'offer') { await pc.setLocalDescription(); this.sig(from, { description: pc.localDescription }); }
      } else if (data.candidate) {
        try { await pc.addIceCandidate(data.candidate); } catch (e) { if (!p.ignore) throw e; }
      }
    } catch (e) { console.error('signal', e); }
  },
  onTrack(p, e) {
    const stream = e.streams[0]; if (!stream) return;
    if (e.track.kind === 'video' || p.screenStreamId === stream.id) this.ensureScreenEl(p.id, stream);
    else this.ensureAudio(p, stream);
  },
  ensureAudio(p, stream) {
    if (p.els.some(x => x.dataset.sid === stream.id)) return;
    const a = document.createElement('audio'); a.autoplay = true; a.dataset.sid = stream.id; a.srcObject = stream; a.muted = this.deaf;
    $('#audio-root').appendChild(a); p.els.push(a); a.play().catch(() => {});
  },
  ensureScreenEl(id, stream) {
    let v = this.videos.get(id);
    if (!v) { v = document.createElement('video'); v.autoplay = true; v.playsInline = true; this.videos.set(id, v); }
    if (v.srcObject !== stream) v.srcObject = stream;
    v.muted = this.deaf; v.play().catch(() => {});
    renderStage();
  },
  removeScreenEl(id) { const v = this.videos.get(id); if (v) { v.srcObject = null; v.remove(); this.videos.delete(id); renderStage(); } },
  closePeer(id) {
    const p = this.pcs.get(id); if (!p) return;
    p.els.forEach(a => { a.srcObject = null; a.remove(); });
    try { p.pc.close(); } catch {}
    this.pcs.delete(id); this.removeScreenEl(id);
    this.shareSenders.delete(id + ':video'); this.shareSenders.delete(id + ':audio');
  },

  /* ---- ekran paylaşımı ---- */
  scheduleBitrate() { [400, 1500, 4000].forEach(ms => setTimeout(() => this.applyBitrate(), ms)); },
  async applyBitrate() {
    const q = QUAL[this.quality];
    for (const [key, s] of this.shareSenders) {
      if (!key.endsWith(':video')) continue;
      try {
        const prm = s.getParameters(); if (!prm.encodings || !prm.encodings.length) prm.encodings = [{}];
        prm.encodings[0].maxBitrate = q.bps; prm.encodings[0].maxFramerate = q.fps; prm.encodings[0].priority = 'high'; prm.encodings[0].networkPriority = 'high';
        prm.degradationPreference = 'maintain-resolution';
        await s.setParameters(prm);
      } catch (e) { /* henüz hazır değil, sonraki denemede */ }
    }
  },
  async toggleShare() { if (this.screen) return this.stopShare(); return this.startShare(); },
  async startShare() {
    if (!this.chanId) return toast('Önce bir ses kanalına katıl.');
    if (!navigator.mediaDevices?.getDisplayMedia) return toast('Tarayıcın ekran paylaşımını desteklemiyor (HTTPS/localhost gerekir).');
    const q = QUAL[this.quality];
    let stream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: q.w }, height: { ideal: q.h }, frameRate: { ideal: q.fps } }, audio: true,
      });
    } catch (e) { if (e.name !== 'NotAllowedError') toast('Ekran paylaşımı başlatılamadı: ' + e.message); return; }
    this.screen = stream;
    const vt = stream.getVideoTracks()[0]; vt.contentHint = q.fps >= 60 ? 'motion' : 'detail';
    vt.onended = () => this.stopShare();
    this.localVideo = document.createElement('video'); this.localVideo.autoplay = true; this.localVideo.muted = true; this.localVideo.playsInline = true; this.localVideo.srcObject = stream;
    for (const [id, p] of this.pcs) {
      this.sig(id, { screen: { streamId: stream.id } });
      stream.getTracks().forEach(t => { const s = p.pc.addTrack(t, stream); this.shareSenders.set(id + ':' + t.kind, s); });
    }
    this.scheduleBitrate(); this.pushState(); renderVPanel(); renderStage(); renderVBar();
    sfx('shareOn'); toast(`Ekran paylaşımı başladı (${q.label})`);
  },
  stopShare() {
    if (!this.screen) return;
    const s = this.screen; this.screen = null;
    for (const [id, p] of this.pcs) {
      this.sig(id, { screen: null });
      for (const k of ['video', 'audio']) { const snd = this.shareSenders.get(id + ':' + k); if (snd) { try { p.pc.removeTrack(snd); } catch {} this.shareSenders.delete(id + ':' + k); } }
    }
    s.getTracks().forEach(t => { t.onended = null; t.stop(); });
    this.localVideo = null; this.pushState(); renderVPanel(); renderStage(); renderVBar(); sfx('shareOff');
  },
  async setQuality(k) {
    this.quality = k; localStorage.setItem('vibra.q', k);
    if (this.screen) {
      const q = QUAL[k], vt = this.screen.getVideoTracks()[0];
      try { await vt.applyConstraints({ width: { ideal: q.w }, height: { ideal: q.h }, frameRate: { ideal: q.fps } }); } catch {}
      vt.contentHint = q.fps >= 60 ? 'motion' : 'detail'; this.applyBitrate();
    }
    renderStage();
  },
};
async function leaveCall(silent) {
  if (!call.chanId && !silent) return;
  call.stopShare();
  clearInterval(call.speakT); call.speakT = null; call.speaking = false;
  call.mic?.getTracks().forEach(t => t.stop()); call.mic = null;
  try { await call.ctx?.close(); } catch {} call.ctx = null; call.analyser = null;
  for (const id of [...call.pcs.keys()]) call.closePeer(id);
  if (call.chanId) sfx('leave'); window.__world?.close(); window.__world?.reset(); call.videos.clear(); call.chanId = null; call.users = [];
  wsSend({ t: 'voice:leave' });
  renderVPanel(); renderUPanel(); renderSide(); if (curChan()?.type === 'voice') { renderStage(); renderVBar(); }
}

function renderStage() {
  const el = $('#stage'); const ch = curChan(); if (!el || !ch || ch.type !== 'voice') return;
  const joined = call.chanId === ch.id; const users = S.voice[ch.id] || [];
  if (!joined) {
    el.innerHTML = `<div class="joinbox"><h2>${esc(ch.name)}</h2><p>${users.length ? users.length + ' kişi bu kanalda.' : 'Şu an kimse bu kanalda değil.'}</p><button class="btn" id="bJoin">Katıl</button></div>`;
    $('#bJoin').onclick = () => { call.join(ch.id); renderStage(); renderVBar(); };
    return;
  }
  const sharing = users.filter(u => u.sharing);
  const tiles = users.map(u => `<div class="tile usr${u.speaking ? ' speak' : ''}" data-uid="${u.id}">${avatar(u.id, userName(u.id), 'xl')}<div class="lab">${esc(userName(u.id))}</div><div class="ics">${u.muted ? `<span class="r">${icon('micoff', 14)}</span>` : ''}${u.deaf ? `<span class="r">${icon('hpoff', 14)}</span>` : ''}</div></div>`).join('');
  el.className = 'stage' + (sharing.length ? '' : ' nos');
  el.innerHTML = (sharing.length ? `<div class="sgrid" id="screens"></div>` : '') + `<div class="sgrid" style="flex:${sharing.length ? '0 0 auto' : '1'}">${tiles}</div>`;
  const sc = $('#screens');
  sharing.forEach(u => {
    const mine = u.id === S.me.id; const v = mine ? call.localVideo : call.videos.get(u.id);
    const t = document.createElement('div'); t.className = 'tile scr';
    let info = '';
    if (mine && call.screen) { const st = call.screen.getVideoTracks()[0]?.getSettings() || {}; info = ` · ${st.width || '?'}×${st.height || '?'} @ ${Math.round(st.frameRate || 0)} FPS`; }
    t.innerHTML = `<div class="vw"></div><div class="lab"><span class="livebadge">CANLI</span>${esc(userName(u.id))}${mine ? ' (sen)' : ''}${info}</div><button class="fs" title="Tam ekran">${icon('fs', 20)}</button>`;
    if (v) t.querySelector('.vw').appendChild(v); else t.querySelector('.vw').innerHTML = '<div class="spinner"></div>';
    t.querySelector('.fs').onclick = () => (v?.requestFullscreen?.() || Promise.resolve()).catch(() => {});
    sc.appendChild(t);
  });
}
function renderVBar() {
  const el = $('#vbar'); const ch = curChan(); if (!el || !ch || ch.type !== 'voice') return;
  if (call.chanId !== ch.id) { el.innerHTML = ''; return; }
  el.innerHTML = `<button class="vb${call.muted || call.deaf ? ' off' : ''}" id="vMic" title="Mikrofon">${icon(call.muted || call.deaf ? 'micoff' : 'mic', 24)}</button>
    <button class="vb${call.deaf ? ' off' : ''}" id="vDeaf" title="Sağırlaştır">${icon(call.deaf ? 'hpoff' : 'hp', 24)}</button>
    <select class="vsel" id="vQ" title="Yayın kalitesi">${Object.entries(QUAL).map(([k, q]) => `<option value="${k}"${k === call.quality ? ' selected' : ''}>${q.label}</option>`).join('')}</select>
    <button class="vb${call.screen ? ' on' : ''}" id="vShare">${icon('screen', 24)} ${call.screen ? 'Paylaşımı Durdur' : 'Ekranını Paylaş'}</button>
    <button class="vb world" id="vWorld" title="3D Dünya">🏕️ 3D Dünya</button>
    <button class="vb red" id="vLeave" title="Bağlantıyı Kes">${icon('phone', 24)}</button>`;
  $('#vMic').onclick = () => call.toggleMute(); $('#vDeaf').onclick = () => call.toggleDeaf();
  $('#vQ').onchange = e => call.setQuality(e.target.value); $('#vShare').onclick = () => call.toggleShare();
  $('#vWorld').onclick = () => window.__world?.open();
  $('#vLeave').onclick = () => { leaveCall(); renderStage(); renderVBar(); };
}

/* ============================================================ modallar */
function modal(html, setup, cls = '') {
  const root = $('#modal-root'); const ov = document.createElement('div'); ov.className = 'ov';
  ov.innerHTML = `<div class="modal ${cls}">${html}</div>`; root.innerHTML = ''; root.appendChild(ov);
  const close = () => { root.innerHTML = ''; document.removeEventListener('keydown', esc2); };
  const esc2 = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', esc2);
  ov.addEventListener('mousedown', e => { if (e.target === ov) close(); });
  ov.querySelectorAll('[data-close]').forEach(b => b.onclick = close);
  setup?.(ov, close); return close;
}
function modalAddServer() {
  modal(`<div class="mb2"><h2>Sunucunu Oluştur</h2><div class="desc">Sunucun, arkadaşlarınla takıldığın yerdir. Kendi sunucunu kur ve sohbete başla.</div>
    <button class="opt" id="oNew"><span style="font-size:26px">🏠</span><span>Kendi Sunucumu Oluştur<small>Arkadaşların ve topluluğun için yeni bir yer kur</small></span></button>
    <button class="opt" id="oJoin"><span style="font-size:26px">🔗</span><span>Bir Sunucuya Katıl<small>Elindeki davet koduyla bir sunucuya gir</small></span></button></div>
    <div class="mf"><button class="btn sec sm" data-close>Kapat</button></div>`, (ov) => {
    ov.querySelector('#oNew').onclick = modalCreateServer; ov.querySelector('#oJoin').onclick = modalJoinServer;
  });
}
function modalCreateServer() {
  modal(`<form><div class="mb2"><h2>Sunucunu Özelleştir</h2><div class="desc">Sunucuna bir isim ver. İstediğin zaman değiştirebilirsin.</div><div id="merr"></div>
    <div class="field"><label>Sunucu adı</label><input name="name" maxlength="48" required autofocus value="${esc(S.me.username)} kullanıcısının sunucusu"></div></div>
    <div class="mf"><button type="button" class="btn sec sm" data-close>Geri</button><button class="btn sm" type="submit">Oluştur</button></div></form>`, (ov, close) => {
    ov.querySelector('input').select();
    ov.querySelector('form').onsubmit = async e => {
      e.preventDefault();
      try { const d = await api('/api/servers', 'POST', { name: e.target.name.value }); close(); await resync(); selectServer(d.id); }
      catch (err) { ov.querySelector('#merr').innerHTML = `<div class="alert err">${esc(err.message)}</div>`; }
    };
  });
}
function modalJoinServer() {
  modal(`<form><div class="mb2"><h2>Bir Sunucuya Katıl</h2><div class="desc">Katılmak için aşağıya bir davet kodu gir.</div><div id="merr"></div>
    <div class="field"><label>Davet kodu</label><input name="code" required autofocus placeholder="örn. k3Gh9xQa"></div></div>
    <div class="mf"><button type="button" class="btn sec sm" data-close>Geri</button><button class="btn sm" type="submit">Sunucuya Katıl</button></div></form>`, (ov, close) => {
    ov.querySelector('form').onsubmit = async e => {
      e.preventDefault();
      try { const d = await api('/api/servers/join', 'POST', { code: e.target.code.value }); close(); await resync(); selectServer(d.id); }
      catch (err) { ov.querySelector('#merr').innerHTML = `<div class="alert err">${esc(err.message)}</div>`; }
    };
  });
}
function modalInvite(s) {
  modal(`<div class="mb2"><h2>Arkadaşlarını ${esc(s.name)} sunucusuna davet et</h2><div class="desc">Bu davet kodunu arkadaşlarınla paylaş. Kodu "Sunucuya Katıl" ekranına girecekler.</div>
    <div class="field"><label>Davet kodu</label><div class="codebox"><input readonly value="${esc(s.invite)}" id="icode"><button class="btn sm" id="icopy">${icon('copy', 18)} Kopyala</button></div></div></div>
    <div class="mf"><button class="btn sec sm" data-close>Kapat</button></div>`, ov => {
    ov.querySelector('#icopy').onclick = async () => { try { await navigator.clipboard.writeText(s.invite); } catch { ov.querySelector('#icode').select(); document.execCommand('copy'); } toast('Davet kodu kopyalandı!'); };
  });
}
function modalChannel(s, type = 'text') {
  modal(`<form><div class="mb2"><h2>Kanal Oluştur</h2><div class="desc">${esc(s.name)} sunucusunda</div><div id="merr"></div>
    <div class="radio"><label><input type="radio" name="type" value="text" ${type === 'text' ? 'checked' : ''}> # Metin</label><label><input type="radio" name="type" value="voice" ${type === 'voice' ? 'checked' : ''}> 🔊 Ses</label></div>
    <div class="field"><label>Kanal adı</label><input name="name" maxlength="32" required autofocus placeholder="yeni-kanal"></div></div>
    <div class="mf"><button type="button" class="btn sec sm" data-close>İptal</button><button class="btn sm" type="submit">Kanal Oluştur</button></div></form>`, (ov, close) => {
    ov.querySelector('form').onsubmit = async e => {
      e.preventDefault();
      try { const d = await api('/api/channels', 'POST', { serverId: s.id, name: e.target.name.value, type: e.target.type.value }); close(); await resync(); selectChannel(d.id); }
      catch (err) { ov.querySelector('#merr').innerHTML = `<div class="alert err">${esc(err.message)}</div>`; }
    };
  });
}
async function leaveServer(s) {
  if (!confirm(`${s.name} sunucusundan ayrılmak istediğine emin misin?`)) return;
  try { await api('/api/servers/leave', 'POST', { serverId: s.id }); S.srvId = null; await resync(); renderAll(); } catch (e) { toast(e.message); }
}
function modalSettings() {
  modal(`<div class="mb2"><h2>Kullanıcı Ayarları</h2><div class="desc">${esc(S.me.username)}</div>
    <button class="opt" id="oProf"><span style="font-size:22px">🎨</span><span>Profilimi Özelleştir<small>Avatar, afiş, renk, durum ve hakkında</small></span></button>
    <button class="opt" id="oChar"><span style="font-size:22px">🧑‍🎤</span><span>Karakterimi Düzenle<small>3D dünyadaki kıyafetin, saçın, şapkan</small></span></button>
    <button class="opt" id="oOut" style="color:var(--red)">${icon('out', 22)}<span>Çıkış Yap</span></button></div><div class="mf"><button class="btn sec sm" data-close>Kapat</button></div>`, ov => {
    ov.querySelector('#oProf').onclick = modalProfile; ov.querySelector('#oChar').onclick = () => window.__world?.editor();
    ov.querySelector('#oOut').onclick = async () => { await leaveCall(true); await api('/api/logout', 'POST'); location.reload(); };
  });
}

/* ============================================================== profil */
const ACCENTS = ['#7c5cff', '#eb459e', '#f47b67', '#e8a317', '#3ba55d', '#1abc9c', '#3498db', '#5865f2', '#e67e22', '#ed4245'];
const BANNERS = [['#7c5cff', '#eb459e'], ['#3498db', '#1abc9c'], ['#f47b67', '#e8a317'], ['#23a55a', '#0d6b3a'], ['#5865f2', '#111214'], ['#eb459e', '#f47b67'], ['#232428', '#4e5058']];

// d: {id, name, color, banner, banner2, bio, status, avUrl, online, owner}
function profileCardHTML(d) {
  const c = d.color || PALETTE[Math.abs(+d.id) % PALETTE.length];
  const av = d.avUrl ? `<img src="${esc(d.avUrl)}" alt="" draggable="false">` : esc((d.name || '?')[0].toUpperCase());
  return `<div class="pbanner" style="background:${bannerCss(c, d.banner, d.banner2)}"></div>
    <div class="pav"><div class="av pxl" style="background:${c}">${av}<span class="st${d.online ? ' on' : ''}"></span></div></div>
    <div class="pbody">
      <div class="pname"><span style="color:${c}">${esc(d.name)}</span>${d.owner ? `<span class="crown" title="Sunucu Sahibi">${icon('crown', 16)}</span>` : ''}</div>
      ${d.status ? `<div class="pstat">${esc(d.status)}</div>` : ''}
      <div class="pbox"><h4>Hakkında</h4><div class="pbio">${d.bio ? linkify(d.bio).replace(/\n/g, '<br>') : '<span class="dim">Henüz bir şey yazılmamış.</span>'}</div></div>
    </div>`;
}
function showProfile(uid) {
  const p = PROF[uid]; if (!p) return;
  const owner = S.servers.some(s => s.ownerId === uid && s.members.some(m => m.id === uid));
  const card = profileCardHTML({ id: uid, name: p.username, color: p.color, banner: p.banner, banner2: p.banner2, bio: p.bio, status: p.status,
    avUrl: p.av ? avSrc(uid, p.av) : '', online: S.online.has(uid) || uid === S.me.id, owner });
  modal(`<div class="pcard">${card}</div>${uid === S.me.id ? `<div class="mf"><button class="btn sm" id="pEdit">Profili Düzenle</button></div>` : ''}`, ov => {
    const b = ov.querySelector('#pEdit'); if (b) b.onclick = modalProfile;
  }, 'pm');
}
document.addEventListener('click', e => {
  if (e.target.closest('.upi, #modal-root, .msg a')) return;
  const t = e.target.closest('[data-prof]'); if (t) showProfile(+t.dataset.prof);
});

async function prepAvatar(file) {
  if (!/^image\//.test(file.type)) throw new Error('Lütfen bir görsel seç.');
  if (file.type === 'image/gif') { if (file.size > 2 * 1048576) throw new Error('GIF en fazla 2 MB olabilir.'); return file; }
  const bmp = await createImageBitmap(file); const m = Math.min(bmp.width, bmp.height);
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  cv.getContext('2d').drawImage(bmp, (bmp.width - m) / 2, (bmp.height - m) / 2, m, m, 0, 0, 256, 256);
  let blob = await new Promise(r => cv.toBlob(r, 'image/webp', 0.9));
  if (!blob || blob.type !== 'image/webp') blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.9));
  if (!blob) throw new Error('Görsel işlenemedi.');
  return blob;
}

function modalProfile() {
  const me = S.me;
  const d = { color: me.color || '', banner: me.banner || '', banner2: me.banner2 || '', bio: me.bio || '', status: me.status || '' };
  let pend = null, pendUrl = '';  // pend: Blob | 'remove' | null
  modal(`<form class="pe"><div class="pe-l"><h2 style="text-align:left">Profilini Özelleştir</h2><div id="merr"></div>
      <div class="field"><label>Avatar</label><div class="prow"><button type="button" class="btn sm" id="avPick">Görsel Seç</button><button type="button" class="btn sec sm" id="avDel">Kaldır</button><input type="file" id="avFile" accept="image/png,image/jpeg,image/webp,image/gif" hidden></div></div>
      <div class="field"><label>Ana renk</label><div class="swatches" id="accents">${ACCENTS.map(c => `<button type="button" class="sw" data-c="${c}" style="background:${c}"></button>`).join('')}<label class="sw custom" title="Özel renk"><input type="color" id="accC" value="${d.color || colorOf(me.id)}">+</label><button type="button" class="btn sec sm" id="accReset">Sıfırla</button></div></div>
      <div class="field"><label>Afiş</label><div class="swatches" id="banners">${BANNERS.map((b, i) => `<button type="button" class="sw wide" data-i="${i}" style="background:linear-gradient(135deg,${b[0]},${b[1]})"></button>`).join('')}</div>
        <div class="prow" style="margin-top:8px"><input type="color" id="b1" value="${d.banner || '#7c5cff'}"><input type="color" id="b2" value="${d.banner2 || '#eb459e'}"><button type="button" class="btn sec sm" id="bReset">Sıfırla</button></div></div>
      <div class="field"><label>Durum</label><input name="status" maxlength="60" placeholder="örn. 🎧 müzik dinliyorum" value="${esc(d.status)}"></div>
      <div class="field"><label>Hakkında <span id="bioN" class="dim"></span></label><textarea name="bio" maxlength="190" rows="3" placeholder="Kendinden bahset...">${esc(d.bio)}</textarea></div>
    </div>
    <div class="pe-r"><div class="plabel">Önizleme</div><div class="pcard" id="prev"></div></div>
    <div class="mf pe-f"><button type="button" class="btn sec sm" data-close>Vazgeç</button><button class="btn sm" type="submit">Kaydet</button></div></form>`, (ov, close) => {
    const f = ov.querySelector('form');
    const paint = () => {
      const url = pend === 'remove' ? '' : pendUrl || (me.av ? avSrc(me.id, me.av) : '');
      ov.querySelector('#prev').innerHTML = profileCardHTML({ id: me.id, name: me.username, ...d, avUrl: url, online: true,
        owner: false });
      ov.querySelector('#bioN').textContent = `${d.bio.length}/190`;
      ov.querySelectorAll('#accents .sw[data-c]').forEach(b => b.classList.toggle('on', b.dataset.c === d.color));
    };
    paint();
    ov.querySelector('#avPick').onclick = () => ov.querySelector('#avFile').click();
    ov.querySelector('#avFile').onchange = async e => {
      const file = e.target.files[0]; if (!file) return;
      try { const blob = await prepAvatar(file); if (pendUrl) URL.revokeObjectURL(pendUrl); pend = blob; pendUrl = URL.createObjectURL(blob); ov.querySelector('#merr').innerHTML = ''; paint(); }
      catch (err) { ov.querySelector('#merr').innerHTML = `<div class="alert err">${esc(err.message)}</div>`; }
      e.target.value = '';
    };
    ov.querySelector('#avDel').onclick = () => { if (pendUrl) URL.revokeObjectURL(pendUrl); pend = 'remove'; pendUrl = ''; paint(); };
    ov.querySelectorAll('#accents .sw[data-c]').forEach(b => b.onclick = () => { d.color = b.dataset.c; ov.querySelector('#accC').value = d.color; paint(); });
    ov.querySelector('#accC').oninput = e => { d.color = e.target.value; paint(); };
    ov.querySelector('#accReset').onclick = () => { d.color = ''; paint(); };
    ov.querySelectorAll('#banners .sw').forEach(b => b.onclick = () => {
      const [a, c] = BANNERS[+b.dataset.i]; d.banner = a; d.banner2 = c; ov.querySelector('#b1').value = a; ov.querySelector('#b2').value = c; paint();
    });
    ov.querySelector('#b1').oninput = e => { d.banner = e.target.value; if (!d.banner2) d.banner2 = ov.querySelector('#b2').value; paint(); };
    ov.querySelector('#b2').oninput = e => { d.banner2 = e.target.value; if (!d.banner) d.banner = ov.querySelector('#b1').value; paint(); };
    ov.querySelector('#bReset').onclick = () => { d.banner = ''; d.banner2 = ''; paint(); };
    f.status.oninput = () => { d.status = f.status.value; paint(); };
    f.bio.oninput = () => { d.bio = f.bio.value; paint(); };
    f.onsubmit = async e => {
      e.preventDefault(); const btn = f.querySelector('button[type=submit]'); btn.disabled = true;
      try {
        if (pend === 'remove') await api('/api/profile/avatar/remove', 'POST');
        else if (pend) {
          const r = await fetch('/api/profile/avatar', { method: 'POST', headers: { 'Content-Type': pend.type }, body: pend });
          if (!r.ok) { let m = 'Avatar yüklenemedi.'; try { m = (await r.json()).error || m; } catch {} throw new Error(m); }
        }
        await api('/api/profile', 'POST', d);
        if (pendUrl) URL.revokeObjectURL(pendUrl);
        close(); await resync(); toast('Profilin güncellendi!');
      } catch (err) { btn.disabled = false; ov.querySelector('#merr').innerHTML = `<div class="alert err">${esc(err.message)}</div>`; }
    };
  }, 'pem');
}

boot();
