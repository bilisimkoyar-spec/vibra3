'use strict';
/* Okey motoru (sunucu tarafı, saf mantık).
   Taş id: 0..103 = k*52 + renk*13 + (sayı-1) (k=0/1 iki takım), 104-105 = sahte okey. */
const FAKE = [104, 105];
const tileOf = id => id >= 104 ? { id, fake: true, c: -1, n: 0 } : { id, fake: false, c: ((id % 52) / 13) | 0, n: (id % 13) + 1 };
const BOT_NAMES = ['Ahmet', 'Ayşe', 'Mehmet', 'Zeynep', 'Can', 'Elif', 'Burak', 'Deniz', 'Selin', 'Kemal'];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* 14 taşın hepsi geçerli per/seri (en az 3'lü) olarak bölünebiliyor mu? wild = {c,n} okey taşının değeri */
function isWinning(ids, wild) {
  const jokers = []; const real = [];
  for (const id of ids) {
    const t = tileOf(id);
    if (t.fake) real.push({ c: wild.c, n: wild.n });          // sahte okey = okey taşının yüzü
    else if (t.c === wild.c && t.n === wild.n) jokers.push(1); // gerçek okey = joker
    else real.push({ c: t.c, n: t.n });
  }
  // sayım tablosu cnt[c][n] (n: 1..13)
  const cnt = [0, 1, 2, 3].map(() => new Array(15).fill(0));
  for (const t of real) cnt[t.c][t.n]++;
  const total = real.length;
  const solve = (left, jk, cap) => {
    if (left === 0) return jk <= cap;
    // ilk taş
    let c = 0, n = 0; outer: for (c = 0; c < 4; c++) for (n = 1; n <= 13; n++) if (cnt[c][n]) break outer;
    cnt[c][n]--;
    // --- PER: aynı sayı, farklı renk
    const others = [0, 1, 2, 3].filter(x => x !== c);
    for (let mask = 0; mask < 8; mask++) {
      const pick = others.filter((_, i) => mask >> i & 1); if (pick.length < 2) continue;
      let need = 0; const used = [];
      for (const oc of pick) { if (cnt[oc][n]) used.push(oc); else need++; }
      if (need > jk) continue;
      used.forEach(oc => cnt[oc][n]--);
      const ok = solve(left - 1 - used.length, jk - need, cap + (4 - 1 - pick.length));
      used.forEach(oc => cnt[oc][n]++);
      if (ok) { cnt[c][n]++; return true; }
    }
    // --- SERİ: aynı renk ardışık (13'ten sonra 1 gelebilir: 12-13-1)
    const anchors = n === 1 ? [1, 14] : [n];
    for (const a of anchors) for (let s = Math.max(1, a - 12); s <= a; s++) for (let e = Math.max(a, s + 2); e <= 14 && e - s + 1 <= 13; e++) {
      let need = 0; const used = []; let bad = false;
      for (let p = s; p <= e; p++) { if (p === a) continue; const pn = p === 14 ? 1 : p; if (cnt[c][pn] && !used.includes(pn)) used.push(pn); else need++; }
      if (bad || need > jk) continue;
      used.forEach(pn => cnt[c][pn]--);
      const ok = solve(left - 1 - used.length, jk - need, cap + (13 - (e - s + 1)));
      used.forEach(pn => cnt[c][pn]++);
      if (ok) { cnt[c][n]++; return true; }
    }
    cnt[c][n]++; return false;
  };
  // jokerleri sona bırakmak için: serbest joker sayısı = jokers.length (grup kurarken harcanır, artan kapasiteye eklenir)
  return solve(total, jokers.length, 0);
}

/* Elde (jokerlerle birlikte) en çok kaç gerçek taş geçerli per/seriye yerleştirilebilir? (bot zekâsı için) */
function maxCover(ids, wild) {
  let jokers = 0; const real = [];
  for (const id of ids) { const t = tileOf(id); if (t.fake) real.push({ c: wild.c, n: wild.n }); else if (t.c === wild.c && t.n === wild.n) jokers++; else real.push({ c: t.c, n: t.n }); }
  const cnt = [0, 1, 2, 3].map(() => new Array(15).fill(0)); for (const t of real) cnt[t.c][t.n]++;
  let nodes = 0;
  const solve = (left, jk) => {
    if (left <= 0 || ++nodes > 2500) return 0;
    let c = 0, n = 0; outer: for (c = 0; c < 4; c++) for (n = 1; n <= 13; n++) if (cnt[c][n]) break outer;
    cnt[c][n]--; let best = solve(left - 1, jk);                       // bu taş grupsuz kalsın
    const others = [0, 1, 2, 3].filter(x => x !== c);
    for (let mask = 0; mask < 8; mask++) {                              // per
      const pick = others.filter((_, i) => mask >> i & 1); if (pick.length < 2) continue;
      let need = 0; const used = []; for (const oc of pick) { if (cnt[oc][n]) used.push(oc); else need++; }
      if (need > jk) continue; used.forEach(oc => cnt[oc][n]--);
      best = Math.max(best, 1 + used.length + solve(left - 1 - used.length, jk - need)); used.forEach(oc => cnt[oc][n]++);
    }
    const anchors = n === 1 ? [1, 14] : [n];                            // seri (12-13-1 dahil)
    for (const a of anchors) for (let st = Math.max(1, a - 12); st <= a; st++) for (let e = Math.max(a, st + 2); e <= 14 && e - st + 1 <= 13; e++) {
      let need = 0; const used = [];
      for (let q = st; q <= e; q++) { if (q === a) continue; const pn = q === 14 ? 1 : q; if (cnt[c][pn] && !used.includes(pn)) used.push(pn); else need++; }
      if (need > jk) continue; used.forEach(pn => cnt[c][pn]--);
      best = Math.max(best, 1 + used.length + solve(left - 1 - used.length, jk - need)); used.forEach(pn => cnt[c][pn]++);
    }
    cnt[c][n]++; return best;
  };
  return { covered: solve(real.length, jokers), real: real.length };
}

class Okey {
  constructor() { this.seats = [null, null, null, null]; this.wins = {}; this.bots = {}; this.botSeq = 0; this.reset(); }
  reset() { this.phase = 'lobby'; this.turn = 0; this.tp = 'draw'; this.deck = []; this.ind = null; this.wild = null; this.hands = [[], [], [], []]; this.discards = [[], [], [], []]; this.winner = -1; this.note = ''; this.lastDraw = -1; }
  seatOf(uid) { return this.seats.indexOf(uid); }
  isBot(i) { return typeof this.seats[i] === 'string'; }
  humans() { return this.seats.filter(s => typeof s === 'number'); }
  addBot(i) {
    const used = new Set(Object.values(this.bots).map(b => b.name)); const free = BOT_NAMES.filter(n => !used.has('🤖 ' + n));
    const id = 'bot:' + (++this.botSeq); this.bots[id] = { name: '🤖 ' + (free[Math.floor(Math.random() * free.length)] || 'Bot'), look: Math.floor(Math.random() * 1000) };
    this.seats[i] = id;
  }
  clearBots() { this.seats = this.seats.map(s => typeof s === 'string' ? null : s); this.bots = {}; }
  fillBots(uid) {
    if (this.seatOf(uid) < 0 || this.phase === 'play' || this.seats.every(s => s != null)) return false;
    if (this.phase === 'end') this.reset();
    this.seats.forEach((s, i) => { if (s == null) this.addBot(i); }); return true;
  }
  removeBots(uid) {
    if (this.seatOf(uid) < 0 || this.phase === 'play' || !this.seats.some((_, i) => this.isBot(i))) return false;
    this.clearBots(); if (this.phase === 'end') this.reset(); return true;
  }
  sit(uid, i) {
    if (this.seatOf(uid) >= 0 || i < 0 || i > 3 || this.phase === 'play') return false;
    if (this.seats[i] != null && !this.isBot(i)) return false;
    if (this.isBot(i)) delete this.bots[this.seats[i]];
    this.seats[i] = uid; if (this.phase === 'end') this.reset(); return true;
  }
  leave(uid) {
    const i = this.seatOf(uid); if (i < 0) return false;
    const was = this.phase === 'play'; this.seats[i] = null;
    if (!this.humans().length) { this.clearBots(); if (was) this.reset(); return true; }   // masada insan kalmadı
    if (was) {
      if (this.seats.some((_, k) => this.isBot(k))) this.addBot(i);   // botlu masada: kalkanın yerine bot devralır, el devam eder
      else { this.reset(); this.note = 'Bir oyuncu kalktı, oyun iptal edildi.'; }
    } return true;
  }
  /* ---- bot zekâsı ---- */
  _jk(id) { const t = tileOf(id); return t.fake || (t.c === this.wild.c && t.n === this.wild.n); }
  _score(id, hand) {
    if (this._jk(id)) return 100;
    const t = tileOf(id); let sc = 0;
    for (const o of hand) {
      if (o === id) continue;
      if (this._jk(o)) { sc += 1.2; continue; }
      const u = tileOf(o);
      if (u.n === t.n && u.c !== t.c) sc += 2;
      else if (u.c === t.c) { let d = Math.abs(u.n - t.n); if (d === 12) d = 1; if (d === 0) sc += .6; else if (d === 1) sc += 2.5; else if (d === 2) sc += 1.4; }
    }
    return sc;
  }
  _canWin(tiles) { for (const id of tiles) { const rest = tiles.filter(x => x !== id); if (rest.length === 14 && isWinning(rest, this.wild)) return id; } return -1; }
  /* 14 taşlık elin değeri: gruplu taş sayısı baskın, grup potansiyeli (ikili/yan yana taşlar) ikincil */
  _value(hand) { const m = maxCover(hand, this.wild); let pot = 0; for (const id of hand) { const sc = this._score(id, hand); pot += sc > 50 ? 3 : sc; } return m.covered * 40 + pot; }
  /* atılabilecek taşları en iyiden kötüye sırala (sadece en zayıf 6 taş denenir → hızlı) */
  _rank(hand, noise = .4) {
    const cand = hand.filter(id => !this._jk(id)).map(id => ({ id, s: this._score(id, hand) })).sort((x, y) => x.s - y.s).slice(0, 6);
    if (!cand.length) cand.push({ id: hand[0], s: 0 });
    return cand.map(c => ({ id: c.id, v: this._value(hand.filter(x => x !== c.id)) + Math.random() * noise })).sort((x, y) => y.v - x.v);
  }
  botStep() {
    const i = this.turn; if (this.phase !== 'play' || !this.isBot(i)) return false; const uid = this.seats[i], h = this.hands[i];
    if (this.tp === 'draw') {
      const top = this.discards[(i + 3) % 4].slice(-1)[0]; let take = false;
      if (top != null) {
        const h15 = h.concat(top), r = this._rank(h15, 0);
        if (r.slice(0, 3).some(c => isWinning(h15.filter(x => x !== c.id), this.wild))) take = true;
        else take = maxCover(h15.filter(x => x !== r[0].id), this.wild).covered > maxCover(h, this.wild).covered;
      }
      return this.draw(uid, take ? 'discard' : 'deck') || this.draw(uid, 'deck') || this.draw(uid, 'discard');
    }
    const r = this._rank(h);
    for (const c of r.slice(0, 3)) { const rest = h.filter(x => x !== c.id); if (rest.length === 14 && isWinning(rest, this.wild)) return this.finish(uid, c.id); }
    return this.discard(uid, r[0].id);
  }
  start(uid) {
    if (this.seatOf(uid) < 0 || this.phase === 'play' || this.seats.some(s => s == null)) return false;
    this.reset(); const all = shuffle([...Array(106).keys()]);
    let k = all.findIndex(id => id < 104); this.ind = all.splice(k, 1)[0];
    const it = tileOf(this.ind); this.wild = { c: it.c, n: it.n === 13 ? 1 : it.n + 1 };
    const starter = Math.floor(Math.random() * 4);
    for (let i = 0; i < 4; i++) this.hands[i] = all.splice(0, i === starter ? 15 : 14);
    this.deck = all; this.turn = starter; this.tp = 'discard'; this.phase = 'play'; return true;
  }
  draw(uid, from) {
    const i = this.seatOf(uid); if (this.phase !== 'play' || i !== this.turn || this.tp !== 'draw') return false;
    let id;
    if (from === 'discard') { const prev = (i + 3) % 4; id = this.discards[prev].pop(); if (id == null) return false; }
    else { id = this.deck.pop(); if (id == null) return false; }
    this.hands[i].push(id); this.tp = 'discard'; this.lastDraw = id; return true;
  }
  discard(uid, id) {
    const i = this.seatOf(uid); if (this.phase !== 'play' || i !== this.turn || this.tp !== 'discard') return false;
    const k = this.hands[i].indexOf(id); if (k < 0) return false;
    this.hands[i].splice(k, 1); this.discards[i].push(id);
    this.turn = (i + 1) % 4; this.tp = 'draw'; this.lastDraw = -1;
    if (!this.deck.length) { this.phase = 'end'; this.winner = -1; this.note = 'Deste bitti, oyun berabere.'; }
    return true;
  }
  finish(uid, id) {
    const i = this.seatOf(uid); if (this.phase !== 'play' || i !== this.turn || this.tp !== 'discard') return false;
    const k = this.hands[i].indexOf(id); if (k < 0) return false;
    const rest = this.hands[i].filter(x => x !== id);
    if (rest.length !== 14 || !isWinning(rest, this.wild)) return false;
    this.hands[i] = rest; this.discards[i].push(id); this.phase = 'end'; this.winner = i;
    this.wins[uid] = (this.wins[uid] || 0) + 1; this.note = ''; return true;
  }
  pub() {
    return { seats: this.seats, phase: this.phase, turn: this.turn, tp: this.tp, deck: this.deck.length, ind: this.ind, wild: this.wild,
      discards: this.discards, counts: this.hands.map(h => h.length), wins: this.wins, bots: this.bots, winner: this.winner, note: this.note,
      hands: this.phase === 'end' ? this.hands : null };
  }
}
module.exports = { Okey, isWinning, tileOf };
