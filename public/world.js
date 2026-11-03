'use strict';
/* =====================================================================
   Vibra 3D Dünya: ses efektleri + karakter editörü + kamp ateşi lobisi + ev (TV odası)
   three.js ilk açılışta cdnjs'ten yüklenir.
   ===================================================================== */
(() => {
/* ------------------------------------------------------------- SES EFEKTLERİ */
let AC, master;
const ac = () => {
  if (!AC) { AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = 0.6; master.connect(AC.destination); }
  if (AC.state === 'suspended') AC.resume(); return AC;
};
const tone = (f, at, dur, type = 'sine', vol = 0.2, f2) => {
  const a = ac(), t = a.currentTime + at, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
};
let noiseBuf;
const noiseBuffer = () => { if (!noiseBuf) { const a = ac(); noiseBuf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } return noiseBuf; };
const burst = (at, dur, vol, freq, type = 'lowpass', q = 1) => {
  const a = ac(), t = a.currentTime + at, s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  s.buffer = noiseBuffer(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t + dur + 0.05);
};
const FX = {
  join: () => { tone(520, 0, .14, 'sine', .22); tone(780, .09, .2, 'sine', .22); tone(1040, .18, .24, 'sine', .16); },
  leave: () => { tone(780, 0, .14, 'sine', .22); tone(520, .09, .2, 'sine', .2); tone(330, .18, .24, 'sine', .14); },
  mute: () => { tone(420, 0, .13, 'square', .09, 220); },
  unmute: () => { tone(260, 0, .06, 'square', .08); tone(520, .06, .12, 'square', .09); },
  deaf: () => { tone(380, 0, .12, 'square', .09, 160); tone(240, .1, .16, 'square', .08, 120); },
  undeaf: () => { tone(200, 0, .07, 'square', .08); tone(400, .07, .07, 'square', .08); tone(600, .14, .12, 'square', .08); },
  msg: () => { tone(1250, 0, .08, 'triangle', .18); tone(1750, .07, .13, 'triangle', .16); },
  shareOn: () => { [400, 500, 600, 800].forEach((f, i) => tone(f, i * .07, .14, 'triangle', .17)); },
  shareOff: () => { [800, 600, 500, 400].forEach((f, i) => tone(f, i * .07, .14, 'triangle', .15)); },
  step: () => { burst(0, .07, .22, 380 + Math.random() * 200); },
  sit: () => { burst(0, .16, .35, 260); tone(110, 0, .14, 'sine', .22, 70); },
  stand: () => { burst(0, .12, .25, 520); tone(160, 0, .1, 'sine', .14, 240); },
  jump: () => { tone(300, 0, .22, 'sine', .2, 760); },
  wave: () => { tone(880, 0, .1, 'triangle', .16); tone(1100, .1, .1, 'triangle', .16); tone(880, .2, .12, 'triangle', .16); },
  dance: () => { [523, 659, 784, 1046, 784, 659].forEach((f, i) => tone(f, i * .09, .12, 'square', .09)); },
  clap: () => { for (let i = 0; i < 4; i++) burst(i * .13, .06, .5, 1800, 'bandpass', 1.2); },
  tvOn: () => { burst(0, .5, .35, 3500, 'highpass'); tone(2000, 0, .05, 'square', .1); tone(900, .08, .2, 'sine', .12, 1400); },
  tvOff: () => { tone(900, 0, .25, 'sine', .15, 60); burst(0, .15, .2, 4000, 'highpass'); },
  door: () => { tone(180, 0, .18, 'sawtooth', .12, 120); burst(.05, .25, .25, 700); tone(540, .2, .25, 'sine', .14, 820); },
  pop: () => { tone(700, 0, .08, 'sine', .2, 1300); },
  tile: () => { burst(0, .05, .55, 900, 'bandpass', 3); tone(240, 0, .05, 'square', .06, 180); },
  turn: () => { tone(880, 0, .12, 'sine', .2); tone(1320, .1, .2, 'sine', .2); },
  swing: () => { burst(0, .14, .3, 2400, 'bandpass', 1.5); tone(520, 0, .12, 'sawtooth', .05, 200); },
  hit: () => { burst(0, .09, .55, 700); tone(150, 0, .12, 'square', .12, 70); },
  growl: () => { tone(95, 0, .4, 'sawtooth', .13, 55); burst(0, .35, .1, 300); },
  hurt: () => { tone(230, 0, .22, 'sawtooth', .18, 90); burst(0, .12, .3, 500); },
  die: () => { tone(220, 0, .6, 'sine', .2, 40); },
};
window.__sfx = n => { try { ac(); FX[n]?.(); } catch {} };

/* ambiyans: ateş çıtırtısı + TV uğultusu (mesafeye göre ses) */
const amb = { on: false, fire: null, tv: null, t: null };
function ambStart() {
  const a = ac(); if (amb.on) return; amb.on = true;
  const mk = (freq, type) => { const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = noiseBuffer(); s.loop = true; f.type = type; f.frequency.value = freq; g.gain.value = 0; s.connect(f); f.connect(g); g.connect(master); s.start(); return { s, g }; };
  amb.fire = mk(700, 'lowpass'); amb.tv = mk(5000, 'highpass');
  amb.t = setInterval(() => { if (amb.fire.g.gain.value > .02 && Math.random() < .7) burst(0, .04 + Math.random() * .05, .35 * Math.min(1, amb.fire.g.gain.value * 6), 1500 + Math.random() * 2500, 'bandpass', 2); }, 150);
}
function ambStop() { if (!amb.on) return; amb.on = false; clearInterval(amb.t); try { amb.fire.s.stop(); amb.tv.s.stop(); } catch {} }
const ambVol = (fire, tv) => { if (!amb.on) return; amb.fire.g.gain.value = fire * .12; amb.tv.g.gain.value = tv * .02; };

/* ------------------------------------------------------------- KARAKTER VERİSİ */
const SKIN = ['#f2c9a0', '#e0a878', '#c68642', '#8d5524', '#ffdbac', '#f1a37a', '#6b4226', '#ffcc99'];
const HAIRC = ['#2b1b12', '#5a3825', '#a0522d', '#e6c36a', '#d9d9d9', '#e8453c', '#3b82f6', '#a855f7', '#ec4899', '#10b981'];
const CLOTH = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#ecf0f1', '#34495e', '#e67e22', '#1abc9c', '#ff6b9d', '#7f8c8d', '#111827'];
const SHOES = ['#ecf0f1', '#111827', '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22', '#ff6b9d', '#7f8c8d'];
const NAMES = {
  face: ['Mutlu', 'Sakin', 'Havalı', 'Şaşkın', 'Sırıtan', 'Uykulu'],
  hair: ['Yok', 'Kısa', 'Uzun', 'Dikenli', 'Topuz', 'Afro', 'Mohawk'],
  topT: ['Tişört', 'Uzun Kol', 'Atlet', 'Çizgili'],
  hat: ['Yok', '🐸 Kurbağa', '🚧 Koni', '🍄 Mantar', '🧢 Kep', '🐰 Tavşan', '🎩 Silindir', '🎅 Noel', '🤠 Kovboy', '👑 Taç', '🚁 Pervane', '👨‍🍳 Aşçı', '📺 TV'],
  glasses: ['Yok', 'Yuvarlak', 'Güneş', 'Pembe Vizör', 'Monokl'],
};
const defOutfit = id => { id = Math.abs(+id) || 0; return { skin: id % 8, face: 0, hair: 1 + id % 6, hairC: id % 10, top: (id * 5) % 12, topT: 0, bottom: (id * 7 + 6) % 12, shoes: id % 10, hat: 0, glasses: 0 }; };
const outfitOf = id => { const p = PROF[id]; if (p?.outfit) { try { return { ...defOutfit(id), ...JSON.parse(p.outfit) }; } catch {} } return defOutfit(id); };

/* ------------------------------------------------------------- THREE yükleme */
let threeP;
const loadThree = () => window.THREE ? Promise.resolve() : (threeP ||= new Promise((res, rej) => {
  const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  s.onload = res; s.onerror = () => { threeP = null; rej(new Error('3D motoru yüklenemedi (internet bağlantısı gerekli).')); }; document.head.appendChild(s);
}));

/* ------------------------------------------------------------- KARAKTER MODELİ */
function buildChar(o) {
  const T = THREE, g = new T.Group(), M = (c, r = .7, em = .12) => { const m = new T.MeshStandardMaterial({ color: c, roughness: r }); m.emissive = new T.Color(c).multiplyScalar(em); return m; };
  const skin = M(SKIN[o.skin], .6), cloth = M(CLOTH[o.top], .75), pant = M(CLOTH[o.bottom], .8), shoe = M(SHOES[o.shoes], .45);
  const OUT = new T.MeshBasicMaterial({ color: '#1b1030', side: T.BackSide });   // çizgi film kontur
  const mesh = (geo, mat, x = 0, y = 0, z = 0, ol = 0) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; if (ol) { const k = new T.Mesh(geo, OUT); k.scale.setScalar(ol); m.add(k); } return m; };
  const body = new T.Group(); body.position.y = 0.95; g.add(body);
  // gövde: yumuşak profilli, hafif basık
  const torso = mesh(new T.LatheGeometry([[0, 0], [.17, 0], [.235, .03], [.25, .12], [.245, .3], [.26, .46], [.27, .54], [.22, .61], [.1, .64], [0, .64]].map(([x, y]) => new T.Vector2(x, y)), 22), cloth, 0, 0, 0, 1.07); torso.scale.z = .82; body.add(torso);
  const pelvis = mesh(new T.CylinderGeometry(.24, .21, .2, 16), pant, 0, -.05, 0, 1.06); pelvis.scale.z = .84; body.add(pelvis);
  if (o.topT === 3) [[.12, .257], [.3, .252], [.48, .268]].forEach(([y, r]) => { const bd = mesh(new T.CylinderGeometry(r, r, .06, 22), M('#ffffff', .8), 0, y, 0); bd.scale.z = .82; body.add(bd); });
  // boyun + yaka
  body.add(mesh(new T.CylinderGeometry(.08, .095, .14, 12), skin, 0, .64, 0));
  if (o.topT !== 2) { const col = mesh(new T.TorusGeometry(.115, .035, 8, 18), cloth, 0, .62, 0); col.rotation.x = Math.PI / 2; col.scale.y = .85; body.add(col); }
  // kafa
  const head = new T.Group(); head.position.y = .62; body.add(head);
  head.add(mesh(new T.SphereGeometry(.27, 26, 20), skin, 0, .27, 0, 1.05));
  [-1, 1].forEach(sx => { const e = mesh(new T.SphereGeometry(.055, 10, 8), skin, sx * .265, .27, 0); e.scale.x = .6; head.add(e); });   // kulaklar
  const eyeM = M('#1a1a1a', .3, .02), whiteM = M('#ffffff', .3, .35), hiM = new T.MeshBasicMaterial({ color: '#ffffff' });
  const eye = (x, sy = 1) => {   // beyaz + göz bebeği + parıltı
    const e = new T.Group(); e.position.set(x, .3, .235);
    const wh = mesh(new T.SphereGeometry(.052, 12, 10), whiteM); wh.scale.set(1, sy * 1.15, .5); e.add(wh);
    const pu = mesh(new T.SphereGeometry(.032, 10, 8), eyeM, 0, 0, .014); pu.scale.set(1, sy, .5); e.add(pu);
    e.add(mesh(new T.SphereGeometry(.009, 6, 6), hiM, .012, .012 * sy, .026)); return e;
  };
  const f = o.face;
  if (f === 2) { head.add(eye(-.09)); head.add(mesh(new T.BoxGeometry(.08, .015, .02), eyeM, .09, .3, .255)); }
  else if (f === 5) { [-.09, .09].forEach(x => head.add(mesh(new T.BoxGeometry(.08, .014, .02), eyeM, x, .3, .255))); }
  else { const sc = f === 3 ? 1.5 : 1; head.add(eye(-.09, sc)); head.add(eye(.09, sc)); }
  // kaşlar
  const browM = M(HAIRC[o.hairC], .9, .05);
  const brow = (x, rz, y) => { const bw = mesh(new T.BoxGeometry(.1, .02, .02), browM, x, y, .222); bw.rotation.z = rz; return bw; };
  if (f !== 5) { const by = f === 3 ? .44 : .395; head.add(brow(-.09, f === 2 ? .22 : f === 4 ? -.12 : 0, by)); head.add(brow(.09, f === 2 ? -.05 : f === 4 ? .12 : 0, by)); }
  // yanak kızarıklığı
  if (f === 0 || f === 1 || f === 4) [-1, 1].forEach(sx => { const ck = new T.Mesh(new T.CircleGeometry(.045, 12), new T.MeshBasicMaterial({ color: '#ff7a8a', transparent: true, opacity: .35 })); ck.position.set(sx * .16, .2, .209); ck.rotation.y = sx * .66; head.add(ck); });
  const mouthM = M('#7a2e2e', .5);
  if (f === 0 || f === 4) { const t = mesh(new T.TorusGeometry(f === 4 ? .09 : .06, .014, 6, 14, Math.PI), mouthM, 0, .2, .255); t.rotation.z = Math.PI; head.add(t); }
  else if (f === 3) head.add(mesh(new T.SphereGeometry(.035, 8, 8), mouthM, 0, .17, .25));
  else head.add(mesh(new T.BoxGeometry(.1, .016, .02), mouthM, 0, .18, .258));
  head.add(mesh(new T.SphereGeometry(.035, 8, 8), skin, 0, .26, .27)); // burun
  // saç
  const hc = M(HAIRC[o.hairC], .9);
  if (o.hair === 1) { const h = mesh(new T.SphereGeometry(.285, 18, 12, 0, Math.PI * 2, 0, Math.PI * .52), hc, 0, .28, -.01); head.add(h); }
  else if (o.hair === 2) { head.add(mesh(new T.SphereGeometry(.29, 18, 12, 0, Math.PI * 2, 0, Math.PI * .6), hc, 0, .28, -.01)); head.add(mesh(new T.BoxGeometry(.5, .5, .14), hc, 0, .05, -.2)); }
  else if (o.hair === 3) { head.add(mesh(new T.SphereGeometry(.28, 14, 10, 0, Math.PI * 2, 0, Math.PI * .45), hc, 0, .28, 0)); for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; const c = mesh(new T.ConeGeometry(.07, .22, 6), hc, Math.cos(a) * .17, .55, Math.sin(a) * .17); c.rotation.set(Math.sin(a) * .5, 0, -Math.cos(a) * .5); head.add(c); } }
  else if (o.hair === 4) { head.add(mesh(new T.SphereGeometry(.285, 18, 12, 0, Math.PI * 2, 0, Math.PI * .5), hc, 0, .28, -.01)); head.add(mesh(new T.SphereGeometry(.12, 12, 10), hc, 0, .62, -.05)); }
  else if (o.hair === 5) head.add(mesh(new T.SphereGeometry(.38, 16, 12), hc, 0, .36, -.05));
  else if (o.hair === 6) { for (let i = 0; i < 5; i++) head.add(mesh(new T.BoxGeometry(.08, .16 - Math.abs(i - 2) * .02, .1), hc, 0, .5 - Math.abs(i - 2) * .02, .16 - i * .08)); }
  // gözlük
  if (o.glasses) {
    const gm = o.glasses === 2 ? M('#0b0b0b', .2) : o.glasses === 3 ? new T.MeshStandardMaterial({ color: '#ff5fa2', transparent: true, opacity: .75 }) : M('#222');
    if (o.glasses === 1) [-.09, .09].forEach(x => { const t = mesh(new T.TorusGeometry(.065, .01, 6, 14), gm, x, .3, .255); head.add(t); });
    else if (o.glasses === 2) { [-.09, .09].forEach(x => head.add(mesh(new T.BoxGeometry(.13, .07, .02), gm, x, .3, .26))); head.add(mesh(new T.BoxGeometry(.06, .015, .02), gm, 0, .31, .26)); }
    else if (o.glasses === 3) head.add(mesh(new T.BoxGeometry(.4, .09, .03), gm, 0, .3, .26));
    else { const t = mesh(new T.TorusGeometry(.06, .01, 6, 14), M('#d4af37'), .09, .3, .26); head.add(t); }
  }
  // şapka
  const hat = (() => {
    const h = new T.Group(); h.position.y = .5; const add = (m) => h.add(m);
    switch (o.hat) {
      case 1: add(mesh(new T.CylinderGeometry(.2, .26, .2, 16), M('#c6d82e'), 0, .08, 0)); add(mesh(new T.CylinderGeometry(.38, .38, .03, 20), M('#c6d82e'), 0, -.01, 0));
        [-.1, .1].forEach(x => { add(mesh(new T.SphereGeometry(.07, 10, 8), M('#fff'), x, .22, .08)); add(mesh(new T.SphereGeometry(.03, 8, 8), M('#111'), x, .22, .14)); }); break;
      case 2: add(mesh(new T.ConeGeometry(.2, .5, 16), M('#ff7a1a'), 0, .22, 0)); add(mesh(new T.CylinderGeometry(.2, .2, .06, 16), M('#fff'), 0, .2, 0)); add(mesh(new T.BoxGeometry(.5, .04, .5), M('#222'), 0, -.02, 0)); break;
      case 3: add(mesh(new T.SphereGeometry(.38, 18, 10, 0, Math.PI * 2, 0, Math.PI * .5), M('#d62828'), 0, 0, 0)); [[.15, .25, .15], [-.2, .18, .1], [0, .33, -.1], [.05, .1, -.3]].forEach(p => add(mesh(new T.SphereGeometry(.05, 8, 8), M('#fff'), ...p))); break;
      case 4: add(mesh(new T.SphereGeometry(.285, 16, 10, 0, Math.PI * 2, 0, Math.PI * .5), M('#e63946'), 0, -.02, 0)); add(mesh(new T.BoxGeometry(.3, .03, .26), M('#e63946'), 0, -.02, .3)); break;
      case 5: [-.1, .1].forEach(x => { const e = mesh(new T.CylinderGeometry(.05, .06, .5, 8), M('#f0f0f0'), x, .28, 0); e.rotation.z = -x * 1.2; add(e); }); break;
      case 6: add(mesh(new T.CylinderGeometry(.22, .22, .36, 16), M('#7c5cff'), 0, .18, 0)); add(mesh(new T.CylinderGeometry(.34, .34, .03, 18), M('#ff3b6b'), 0, -.01, 0)); add(mesh(new T.CylinderGeometry(.225, .225, .07, 16), M('#ffd400'), 0, .06, 0)); break;
      case 7: add(mesh(new T.ConeGeometry(.26, .5, 14), M('#d62828'), 0, .2, 0)); add(mesh(new T.TorusGeometry(.27, .06, 8, 16), M('#fff'), 0, 0, 0)).rotation; h.children[1].rotation.x = Math.PI / 2; add(mesh(new T.SphereGeometry(.07, 8, 8), M('#fff'), 0, .46, 0)); break;
      case 8: add(mesh(new T.CylinderGeometry(.2, .22, .22, 14), M('#9c6b3a'), 0, .1, 0)); add(mesh(new T.CylinderGeometry(.46, .46, .03, 20), M('#9c6b3a'), 0, -.02, 0)); break;
      case 9: add(mesh(new T.CylinderGeometry(.22, .2, .16, 8), M('#ffd400', .3), 0, .05, 0)); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; add(mesh(new T.ConeGeometry(.045, .14, 6), M('#ffd400', .3), Math.cos(a) * .2, .2, Math.sin(a) * .2)); } break;
      case 10: add(mesh(new T.SphereGeometry(.12, 10, 8), M('#3b82f6'), 0, .06, 0)); add(mesh(new T.CylinderGeometry(.02, .02, .1, 6), M('#444'), 0, .17, 0)); const pr = mesh(new T.BoxGeometry(.5, .015, .06), M('#e63946'), 0, .23, 0); pr.userData.prop = true; add(pr); h.userData.prop = pr; break;
      case 11: add(mesh(new T.CylinderGeometry(.2, .2, .12, 14), M('#fff'), 0, .02, 0)); add(mesh(new T.SphereGeometry(.28, 14, 10), M('#fff'), 0, .22, 0)); break;
      case 12: add(mesh(new T.BoxGeometry(.4, .28, .2), M('#555'), 0, .14, 0)); add(mesh(new T.BoxGeometry(.32, .2, .02), M('#6ee7ff', .2), 0, .14, .11)); [-.1, .1].forEach(x => { const a = mesh(new T.CylinderGeometry(.008, .008, .3, 4), M('#999'), x, .42, 0); a.rotation.z = -x * 2.5; add(a); }); break;
      default: return null;
    }
    return h;
  })();
  if (hat) { head.add(hat); g.userData.hat = hat; }
  // kollar
  const mkArm = side => {
    const p = new T.Group(); p.position.set(side * .33, .55, 0); body.add(p);
    const long = o.topT === 1, tank = o.topT === 2;
    p.add(mesh(new T.SphereGeometry(.095, 12, 10), tank ? skin : cloth, 0, 0, 0, 1.08));   // omuz
    p.add(mesh(new T.CylinderGeometry(.07, .06, .56, 10), long ? cloth : skin, 0, -.28, 0, 1.1));
    if (!long && !tank) p.add(mesh(new T.CylinderGeometry(.088, .082, .22, 10), cloth, 0, -.1, 0));
    p.add(mesh(new T.SphereGeometry(.078, 12, 10), skin, 0, -.58, 0, 1.12)); return p;
  };
  const armL = mkArm(-1), armR = mkArm(1);
  // bacaklar
  const mkLeg = side => {
    const p = new T.Group(); p.position.set(side * .12, .95, 0); g.add(p);
    p.add(mesh(new T.CylinderGeometry(.105, .09, .78, 12), pant, 0, -.39, 0, 1.08));
    const sh = mesh(new T.SphereGeometry(.1, 12, 10), shoe, 0, -.83, .06, 1.08); sh.scale.set(1, .7, 1.7); p.add(sh);   // yuvarlak ayakkabı
    p.add(mesh(new T.BoxGeometry(.18, .03, .3), M('#f4f4f4', .6), 0, -.885, .06)); return p;                            // taban
  };
  const legL = mkLeg(-1), legR = mkLeg(1);
  g.userData = { ...g.userData, body, head, armL, armR, legL, legR, key: JSON.stringify(o) };
  return g;
}
function poseChar(g, a, t, emote, et, sk = 0) {
  if (a === 2) { a = 0; sk = 1; }
  const u = g.userData, sw = Math.sin(t * 9);
  if (u.hat?.userData.prop) u.hat.userData.prop.rotation.y = t * 20;
  let aL = 0, aR = 0, lL = 0, lR = 0, by = 0.95, bz = 0, hz = 0, ry = 0;
  if (a === 1) { lL = sw * .7; lR = -sw * .7; aL = -sw * .6; aR = sw * .6; by = .95 + Math.abs(Math.cos(t * 9)) * .04; }
  else if (a === 2) { lL = lR = -Math.PI / 2; aL = aR = -.35; by = .95; }
  else { by = .95 + Math.sin(t * 2) * .012; aL = Math.sin(t * 1.7) * .05; aR = -aL; }
  if (emote && et < 3) {
    if (emote === '👋') { aR = Math.PI - .5 + Math.sin(t * 14) * .45; }
    else if (emote === '💃') { aL = Math.PI - .4 + Math.sin(t * 8) * .4; aR = Math.PI - .4 - Math.sin(t * 8) * .4; bz = Math.sin(t * 8) * .18; hz = Math.sin(t * 4) * .2; by += Math.abs(Math.sin(t * 8)) * .1; ry = Math.sin(t * 4) * .5; lL = Math.sin(t * 8) * .4; lR = -lL; }
    else if (emote === '🦘') { const k = Math.abs(Math.sin(et * 5)); by += k * .6; aL = aR = Math.PI * .8 * k; }
    else if (emote === '⚔️') { if (et < .5) { const k = Math.min(1, et / .3), e = 1 - (1 - k) * (1 - k); aR = (Math.PI - .5) * (1 - e) - 1.5 * e; ry = .5 * (1 - e) - .5 * e; bz = -.08 * Math.sin(k * Math.PI); } }
    else if (emote === '👏') { const k = (Math.sin(t * 16) + 1) / 2; aL = aR = -1.2; u.armL.rotation.z = -.35 * (1 - k) + .05; u.armR.rotation.z = .35 * (1 - k) - .05; }
  }
  if (sk > 0) { const k = sk * sk * (3 - 2 * sk); lL = lL * (1 - k) - 1.5708 * k; lR = lR * (1 - k) - 1.5708 * k; if (!emote || et >= 3) { aL = aL * (1 - k) - .35 * k; aR = aR * (1 - k) - .35 * k; } u.body.rotation.x = Math.sin(k * Math.PI) * .32; sk = k; } else u.body.rotation.x = 0;
  if (!(emote === '👏' && et < 3)) { u.armL.rotation.z = .05; u.armR.rotation.z = -.05; }
  u.armL.rotation.x = aL; u.armR.rotation.x = aR; u.legL.rotation.x = lL; u.legR.rotation.x = lR;
  u.body.position.y = by; u.body.rotation.z = bz; u.head.rotation.z = hz; u.body.rotation.y = ry;
  u.legL.position.y = u.legR.position.y = by;
  u.legL.position.y = u.legR.position.y = by - .05 * sk;
}

/* ------------------------------------------------------------- KARAKTER EDİTÖRÜ */
function editor() {
  loadThree().then(() => {
    const me = S.me.id; let o = { ...outfitOf(me) }; let tab = 'face';
    const TABS = [['face', 'Yüz'], ['hair', 'Saç'], ['top', 'Üst'], ['bottom', 'Alt'], ['shoes', 'Ayakkabı'], ['hat', 'Şapka'], ['glasses', 'Gözlük']];
    modal(`<div class="chg"><div class="pv"><canvas id="cvp"></canvas></div><div class="ops"><h2 style="text-align:left;margin-bottom:12px">Karakterini Seç</h2><div class="tabs" id="ctabs"></div><div id="cops"></div></div></div>
      <div class="mf"><button class="btn sec sm" data-close>Vazgeç</button><button class="btn sm" id="cSave">Kaydet</button></div>`, (ov, close) => {
      const cv = ov.querySelector('#cvp'); const R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
      const sc = new THREE.Scene(); const cam = new THREE.PerspectiveCamera(32, 1, .1, 50); cam.position.set(0, 1.25, 4.6); cam.lookAt(0, 1.05, 0);
      sc.add(new THREE.HemisphereLight('#ffffff', '#6b5bd6', 1.1)); const dl = new THREE.DirectionalLight('#fff', .9); dl.position.set(2, 4, 3); sc.add(dl);
      let ch = null, spin = 0.5, drag = false, lx = 0;
      const rebuild = () => { if (ch) sc.remove(ch); ch = buildChar(o); ch.rotation.y = spin; sc.add(ch); };
      cv.onmousedown = e => { drag = true; lx = e.clientX; }; window.addEventListener('mouseup', () => drag = false);
      cv.onmousemove = e => { if (drag) { spin += (e.clientX - lx) * .01; lx = e.clientX; } };
      rebuild();
      let alive = true; const loop = t => {
        if (!alive || !cv.isConnected) { alive = false; R.dispose(); return; }
        const w = cv.clientWidth, h = cv.clientHeight; if (cv.width !== w * devicePixelRatio || cv.height !== h * devicePixelRatio) { R.setPixelRatio(devicePixelRatio); R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
        if (!drag) spin += .006; ch.rotation.y = spin; poseChar(ch, 0, t / 1000); R.render(sc, cam); requestAnimationFrame(loop);
      }; requestAnimationFrame(loop);
      const opts = () => {
        const sw = (arr, key) => arr.map((c, i) => `<button class="opb${o[key] === i ? ' on' : ''}" data-k="${key}" data-i="${i}"><i style="background:${c}"></i></button>`).join('');
        const tx = (arr, key) => arr.map((n, i) => `<button class="opb${o[key] === i ? ' on' : ''}" data-k="${key}" data-i="${i}">${n}</button>`).join('');
        const sec = (t, h) => `<div class="plabel" style="margin:10px 0 6px">${t}</div><div class="grid2">${h}</div>`;
        return { face: sec('Ten rengi', sw(SKIN, 'skin')) + sec('İfade', tx(NAMES.face, 'face')),
          hair: sec('Saç stili', tx(NAMES.hair, 'hair')) + sec('Saç rengi', sw(HAIRC, 'hairC')),
          top: sec('Model', tx(NAMES.topT, 'topT')) + sec('Renk', sw(CLOTH, 'top')),
          bottom: sec('Pantolon rengi', sw(CLOTH, 'bottom')), shoes: sec('Ayakkabı rengi', sw(SHOES, 'shoes')),
          hat: sec('Şapka', tx(NAMES.hat, 'hat')), glasses: sec('Gözlük', tx(NAMES.glasses, 'glasses')) }[tab];
      };
      const paint = () => {
        ov.querySelector('#ctabs').innerHTML = TABS.map(([k, n]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${n}</button>`).join('');
        ov.querySelector('#cops').innerHTML = opts();
      };
      paint();
      ov.addEventListener('click', e => {
        const t = e.target.closest('[data-tab]'); if (t) { tab = t.dataset.tab; paint(); sfx('pop'); return; }
        const b = e.target.closest('[data-k]'); if (b) { o[b.dataset.k] = +b.dataset.i; rebuild(); paint(); sfx('pop'); }
      });
      ov.querySelector('#cSave').onclick = async () => {
        try { await api('/api/outfit', 'POST', { outfit: o }); alive = false; close(); await resync(); toast('Karakterin kaydedildi!'); sfx('join'); }
        catch (err) { toast(err.message); }
      };
    }, 'char');
  }).catch(e => toast(e.message));
}

/* ------------------------------------------------------------- 3D DÜNYA */
let W = null;
const seatsDef = [];
/* ------------------------------------------------------------- OKEY (istemci: durum + arayüz) */
const OK = { askOff: false, s: null, hand: [], slots: Array(30).fill(null), sel: null, err: '', fresh: null };
const OCOL = ['#d99a00', '#1f6bd6', '#1b1b1b', '#d62828'], OCN = ['Sarı', 'Mavi', 'Siyah', 'Kırmızı'];
const tInfo = id => id >= 104 ? { fake: true, c: -1, n: 0 } : { fake: false, c: ((id % 52) / 13) | 0, n: (id % 13) + 1 };
const isJoker = id => { const w = OK.s?.wild; if (!w || id >= 104) return false; const t = tInfo(id); return t.c === w.c && t.n === w.n; };
const okMe = () => OK.s ? OK.s.seats.indexOf(S.me.id) : -1;
const okTileHtml = (id, extra = '') => {
  const t = tInfo(id), w = OK.s?.wild;
  if (t.fake) return `<div class="ot fk ${extra}" data-id="${id}"><b>✦</b><i></i></div>`;
  return `<div class="ot ${isJoker(id) ? 'jk' : ''} ${extra}" data-id="${id}" style="color:${OCOL[t.c]}"><b>${t.n}</b><i style="background:${OCOL[t.c]}"></i></div>`;
};
function okReconcile() {
  const set = new Set(OK.hand); OK.slots = OK.slots.map(id => set.has(id) ? id : null);
  if (OK.sel != null && !set.has(OK.sel)) OK.sel = null;
  const have = new Set(OK.slots.filter(x => x != null)); const fresh = OK.hand.filter(id => !have.has(id));
  if (!have.size && fresh.length) { okSort(); return; }
  if (have.size && fresh.length === 1) OK.fresh = fresh[0]; else if (!fresh.length) OK.fresh = OK.fresh; else OK.fresh = null;
  for (const id of fresh) {
    let L = -1; OK.slots.forEach((x, i) => { if (x != null && i < 15) L = i; });
    let k = OK.slots.findIndex((x, i) => x == null && i > L && i < 15); if (k < 0) k = OK.slots.findIndex(x => x == null); OK.slots[k] = id;
  }
}
function okSort() {
  const key = id => { const t = tInfo(id); return t.fake ? 999 : isJoker(id) ? 998 : t.c * 20 + t.n; };
  const ids = [...OK.hand].sort((a, b) => key(a) - key(b)); const slots = Array(30).fill(null); let k = 0, last = -1;
  for (const id of ids) { const c = key(id) >= 998 ? 9 : tInfo(id).c; if (last !== -1 && c !== last) k++; slots[k++] = id; last = c; }
  OK.slots = slots;
}
function okSortNum() {
  const key = id => { const t = tInfo(id); return t.fake ? 999 : isJoker(id) ? 998 : t.n * 4 + t.c; };
  const ids = [...OK.hand].sort((a, b) => key(a) - key(b)); const slots = Array(30).fill(null); let k = 0, last = -1;
  for (const id of ids) { const n = key(id) >= 998 ? 99 : tInfo(id).n; if (last !== -1 && n !== last) k++; slots[k++] = id; last = n; }
  OK.slots = slots;
}
/* Bir grup (>=3 taş) geçerli per/seri mi? (okey = joker, sahte okey = okey taşının yüzü) */
function okValidGroup(ids) {
  const w = OK.s?.wild; if (!w || ids.length < 3 || ids.length > 13) return false;
  let jk = 0; const real = [];
  for (const id of ids) { const t = tInfo(id); if (t.fake) real.push({ c: w.c, n: w.n }); else if (t.c === w.c && t.n === w.n) jk++; else real.push({ c: t.c, n: t.n }); }
  if (!real.length) return true;
  const L = ids.length;
  if (L <= 4 && real.every(t => t.n === real[0].n) && new Set(real.map(t => t.c)).size === real.length) return true; // per
  if (real.every(t => t.c === real[0].c)) {                                                                           // seri
    const nums = real.map(t => t.n); if (new Set(nums).size !== nums.length) return false;
    for (let st = 1; st + L - 1 <= 14; st++) { const pos = new Set(); for (let q = st; q < st + L; q++) pos.add(q === 14 ? 1 : q); if (pos.size === L && nums.every(n => pos.has(n))) return true; }
  }
  return false;
}
/* Rafta yan yana duran taşları en çok taşı kapsayacak şekilde geçerli gruplara böler → { ok:Set(slot), n } */
function okCover() {
  const ok = new Set();
  for (const base of [0, 15]) {
    let i = 0;
    while (i < 15) {
      if (OK.slots[base + i] == null) { i++; continue; }
      let j = i; while (j < 15 && OK.slots[base + j] != null) j++;
      const run = OK.slots.slice(base + i, base + j), n = run.length, best = Array(n + 1).fill(0), from = Array(n + 1).fill(-1);
      for (let e = 1; e <= n; e++) {
        best[e] = best[e - 1]; from[e] = -1;
        for (let b = 0; b <= e - 3; b++) if (best[b] + (e - b) > best[e] && okValidGroup(run.slice(b, e))) { best[e] = best[b] + (e - b); from[e] = b; }
      }
      for (let e = n; e > 0;) { if (from[e] >= 0) { for (let q = from[e]; q < e; q++) ok.add(base + i + q); e = from[e]; } else e--; }
      i = j;
    }
  }
  return ok;
}
function okUI() {
  const w = W; if (!w) return; const p = w.el.querySelector('#okp'); if (!p) return;
  const s = OK.s, me = S.me.id, mi = okMe();
  if (w.myP.seat < 30 || !s) { p.style.display = 'none'; return; }
  p.style.display = 'block';
  const myTurn = s.phase === 'play' && s.turn === mi, canDraw = myTurn && s.tp === 'draw', canDisc = myTurn && s.tp === 'discard';
  const nm = i => s.seats[i] == null ? '— boş —' : (s.seats[i] === me ? 'Sen' : (s.bots?.[s.seats[i]]?.name || userName(s.seats[i])));
  const nSeat = s.seats.filter(x => x != null).length, hasBots = s.seats.some(x => typeof x === 'string');
  const ask = s.phase === 'lobby' && mi >= 0 && nSeat < 4 && !OK.askOff ? `<div class="okAsk"><div>🤖 Masada <b>${nSeat}/4</b> koltuk dolu. Eksik <b>${4 - nSeat}</b> koltuk <b>botlarla</b> doldurulsun mu?</div><div class="okAskB"><button class="btn sm ok" id="okBots">🤖 Botlarla Başlat</button><button class="btn sm sec" id="okWait">⏳ Arkadaş Bekle</button></div></div>` : '';
  const chips = [0, 1, 2, 3].map(i => { const last = s.discards[i].slice(-1)[0];
    return `<div class="okPl${s.phase === 'play' && s.turn === i ? ' turn' : ''}${i === mi ? ' me' : ''}${s.phase === 'end' && s.winner === i ? ' won' : ''}"><b>${esc(nm(i))}</b><span>${s.seats[i] != null ? '🏆 ' + (s.wins[s.seats[i]] || 0) : ''}${s.phase === 'play' ? ' · 🀫 ' + s.counts[i] : ''}</span>${s.phase !== 'lobby' && last != null ? `<div class="okLast" title="Son attığı taş">${okTileHtml(last)}</div>` : ''}</div>`; }).join('');
  const prev = mi >= 0 ? (mi + 3) % 4 : -1; const sideTop = prev >= 0 ? s.discards[prev].slice(-1)[0] : null;
  let msg = '';
  if (s.phase === 'lobby') msg = s.note || `Masada ${nSeat}/4 oyuncu${hasBots ? ' (botlar dahil)' : ''}. ${nSeat < 4 ? 'Arkadaşlarını bekle ya da botlarla doldur.' : '<b>Başlat</b>\'a bas.'}`;
  else if (s.phase === 'play') msg = canDraw ? '🎯 Sıra sende: <b>desteden çek</b> ya da soldaki taşı al' : canDisc ? '🎯 Bir taş seç → <b>At</b> (çift tık) ya da <b>Bitir</b>' : `⏳ Sıra: <b>${esc(nm(s.turn))}</b>`;
  else msg = s.winner >= 0 ? `🎉 <b>${esc(nm(s.winner))}</b> kazandı!` : (s.note || 'Oyun bitti.');
  if (OK.err) msg += `<div class="okErr">${esc(OK.err)}</div>`;
  const wid = s.wild ? s.wild.c * 13 + s.wild.n - 1 : null;
  const info = s.phase === 'lobby' ? '' : `<div class="okInd"><span>Gösterge</span>${okTileHtml(s.ind)}<span>Okey</span>${okTileHtml(wid, 'wild')}</div>`;
  const mid = s.phase === 'play' ? `<button class="okPile${canDraw ? ' go' : ''}" id="okDeck">Deste<br><b>${s.deck}</b></button>
    <button class="okPile${canDraw && sideTop != null ? ' go' : ''}" id="okSide" ${sideTop == null ? 'disabled' : ''}>Soldan<br>${sideTop != null ? okTileHtml(sideTop) : '<b>—</b>'}</button>` : '';
  const hasHand = mi >= 0 && s.phase === 'play';
  const cover = hasHand ? okCover() : new Set(), placed = OK.slots.filter(x => x != null).length;
  const loose = hasHand ? OK.slots.map((id, i) => id != null && !cover.has(i) ? i : -1).filter(i => i >= 0) : [];
  const canWin = canDisc && placed === 15 && loose.length === 1;   // 14 taş gruplu, 1 taş artık → bitirilebilir
  const finIdx = canWin ? loose[0] : -1;
  const hint = hasHand ? `<div class="okHint${canWin ? ' win' : ''}">${canWin ? '🏁 El hazır! Parlayan taşı seçip <b>Bitir</b>\'e bas' : `✔ ${cover.size} taş grupta${placed ? ` · ${placed - cover.size} taş boşta` : ''}`}</div>` : '';
  const slots = OK.slots.map((id, i) => `<div class="okS${id != null && OK.sel === id ? ' sel' : ''}${i === 15 ? ' r2' : ''}${cover.has(i) ? ' grp' : ''}${i === finIdx ? ' fin' : ''}${id != null && id === OK.fresh ? ' new' : ''}" data-s="${i}" ${id != null ? 'draggable="true"' : ''}>${id != null ? okTileHtml(id) : ''}</div>`).join('');
  const full = s.seats.every(x => x != null);
  const btns = `${s.phase !== 'play' && mi >= 0 ? `<button class="btn sm" id="okStart" ${full ? '' : 'disabled'}>${s.phase === 'end' ? '🔄 Yeni El' : '▶ Başlat'}</button>` : ''}
    ${hasHand ? `<button class="btn sm sec" id="okSort" title="Renge göre diz (G)">🎨 Seri Diz</button><button class="btn sm sec" id="okSortN" title="Sayıya göre diz (H)">🔢 Per Diz</button><button class="btn sm" id="okDisc" title="Enter" ${canDisc && OK.sel != null ? '' : 'disabled'}>At</button><button class="btn sm ok${canWin ? ' pulse' : ''}" id="okFin" ${canDisc && OK.sel != null ? '' : 'disabled'}>🏁 Bitir</button>` : ''}
    ${s.phase !== 'play' && mi >= 0 && nSeat < 4 && OK.askOff ? '<button class="btn sm sec" id="okBots2">🤖 Botlarla Doldur</button>' : ''}${s.phase !== 'play' && mi >= 0 && hasBots ? '<button class="btn sm sec" id="okUnbots">🙅 Botları Çıkar</button>' : ''}
    <button class="btn sm sec" id="okLeave">Masadan Kalk</button>`;
  const rackHtml = hasHand ? `${hint}<div class="okRack">${slots}</div><div class="okKeys">C deste · V soldan · Enter at · G/H diz · çift tık = at</div>` : '';
  const reveal = s.phase === 'end' && s.hands && s.winner >= 0 ? `<div class="okReveal"><span>${esc(nm(s.winner))} eli:</span>${[...s.hands[s.winner]].sort((a, b) => { const k = id => { const t = tInfo(id); return t.fake ? 999 : isJoker(id) ? 998 : t.c * 20 + t.n; }; return k(a) - k(b); }).map(id => okTileHtml(id)).join('')}</div>` : '';
  p.innerHTML = `<div class="okTop">${chips}</div><div class="okMid">${info}${mid}<div class="okMsg">${msg}</div></div>${ask}${reveal}${rackHtml}<div class="okBtns">${btns}</div>`;
}
function okSend(o) { wsSend(o); }
function okBind(el) {
  const root = el.querySelector('#okp');
  root.addEventListener('click', e => {
    const s = OK.s; if (!s) return; const mi = okMe(), myTurn = s.phase === 'play' && s.turn === mi;
    const slot = e.target.closest('.okS');
    if (slot && slot.querySelector('.ot')) { const id = +slot.querySelector('.ot').dataset.id; OK.sel = OK.sel === id ? null : id; sfx('pop'); okUI(); return; }
    const b = e.target.closest('button'); if (!b) return;
    if (b.id === 'okDeck' && myTurn && s.tp === 'draw') { okSend({ t: 'okey:draw', from: 'deck' }); sfx('tile'); }
    else if (b.id === 'okSide' && myTurn && s.tp === 'draw') { okSend({ t: 'okey:draw', from: 'discard' }); sfx('tile'); }
    else if (b.id === 'okDisc' && OK.sel != null) { okSend({ t: 'okey:discard', id: OK.sel }); sfx('tile'); }
    else if (b.id === 'okFin' && OK.sel != null) { okSend({ t: 'okey:finish', id: OK.sel }); }
    else if (b.id === 'okStart') { okSend({ t: 'okey:start' }); }
    else if (b.id === 'okBots' || b.id === 'okBots2') { okSend({ t: 'okey:bots', start: b.id === 'okBots' }); sfx('join'); }
    else if (b.id === 'okWait') { OK.askOff = true; okUI(); }
    else if (b.id === 'okUnbots') { okSend({ t: 'okey:unbots' }); }
    else if (b.id === 'okSort') { okSort(); okUI(); sfx('pop'); }
    else if (b.id === 'okSortN') { okSortNum(); okUI(); sfx('pop'); }
    else if (b.id === 'okLeave') { W?.act(); }
  });
  root.addEventListener('dblclick', e => {
    const s = OK.s; const t = e.target.closest('.okS .ot'); if (!s || !t) return;
    if (s.phase === 'play' && s.turn === okMe() && s.tp === 'discard') { okSend({ t: 'okey:discard', id: +t.dataset.id }); sfx('tile'); }
  });
  if (!OK.keys) { OK.keys = true;
    window.addEventListener('keydown', e => {
      const rt = W?.el.querySelector('#okp'); if (!W || !rt || rt.style.display !== 'block' || e.target.closest?.('input,textarea') || e.ctrlKey || e.metaKey || e.altKey) return;
      const s = OK.s; if (!s) return; const k = e.key.toLowerCase(), myTurn = s.phase === 'play' && s.turn === okMe();
      if (k === 'c' && myTurn && s.tp === 'draw') { okSend({ t: 'okey:draw', from: 'deck' }); sfx('tile'); }
      else if (k === 'v' && myTurn && s.tp === 'draw') { okSend({ t: 'okey:draw', from: 'discard' }); sfx('tile'); }
      else if (k === 'enter' && myTurn && s.tp === 'discard' && OK.sel != null) { okSend({ t: 'okey:discard', id: OK.sel }); sfx('tile'); }
      else if (k === 'g' && s.phase === 'play') { okSort(); okUI(); sfx('pop'); }
      else if (k === 'h' && s.phase === 'play') { okSortNum(); okUI(); sfx('pop'); }
    });
  }
  let from = -1;
  root.addEventListener('dragstart', e => { const sl = e.target.closest('.okS'); if (!sl) return; from = +sl.dataset.s; e.dataTransfer.setData('text/plain', String(from)); e.dataTransfer.effectAllowed = 'move'; });
  root.addEventListener('dragover', e => { if (e.target.closest('.okS')) e.preventDefault(); });
  root.addEventListener('drop', e => {
    const sl = e.target.closest('.okS'); if (!sl || from < 0) return; e.preventDefault(); const to = +sl.dataset.s;
    if (to !== from) { const a = OK.slots[from]; OK.slots[from] = OK.slots[to]; OK.slots[to] = a; sfx('tile'); } from = -1; okUI();
  });
}
function onOkey(d) {
  if (d.t === 'okey:hand') { OK.hand = d.hand; okReconcile(); }
  else if (d.t === 'okey:err') { OK.err = d.msg; clearTimeout(OK.et); OK.et = setTimeout(() => { OK.err = ''; okUI(); }, 3500); }
  else if (d.t === 'okey') {
    const prev = OK.s; const pm = prev ? prev.seats.indexOf(S.me.id) : -1; OK.s = d; OK.err = '';
    if (pm < 0 && okMe() >= 0) OK.askOff = false;   // yeni oturdum → botlu doldurma sorusunu göster
    if (!prev || prev.phase !== d.phase) { if (d.phase === 'play') { OK.slots = Array(30).fill(null); OK.sel = null; sfx('join'); } else if (d.phase === 'end' && d.winner >= 0) sfx('clap'); }
    if (d.phase === 'play' && d.turn === okMe() && (!prev || prev.turn !== d.turn)) sfx('turn');
    else if (prev && prev.phase === 'play' && prev.turn !== d.turn) sfx('tile');
    if (d.phase === 'lobby') { OK.hand = []; OK.slots = Array(30).fill(null); OK.sel = null; }
  }
  if (W) { try { W.okeyRender?.(); } catch (e) { console.error('okey 3D:', e); } okUI(); }
}

function open() {
  if (!call.chanId) return toast('Önce bir ses kanalına katıl.');
  if (W) return;
  toast('3D Dünya yükleniyor...');
  loadThree().then(start).catch(e => { console.error(e); try { close(); } catch {} document.getElementById('world')?.remove(); W = null; ambStop(); toast('3D Dünya açılamadı: ' + e.message); });
}
function close() {
  if (!W) return; const w = W; W = null; if (w.myP?.seat >= 30) wsSend({ t: 'okey:leave' }); cancelAnimationFrame(w.raf); clearInterval(w.hb);
  window.removeEventListener('keydown', w.kd); window.removeEventListener('keyup', w.ku); window.removeEventListener('resize', w.rs); window.removeEventListener('mouseup', w.mu);
  try { w.tvEl && (w.tvEl.tagName === 'IFRAME' ? (w.tvEl.src = 'about:blank') : (w.tvEl.pause(), w.tvEl.srcObject = null)); const rv = call.videos?.get(TVS.owner); if (rv) rv.volume = 1; } catch {}
  try { w.R.dispose(); } catch {} w.el.remove(); ambStop(); sfx('door');
}
/* ---------- TV: ortak durum + link çözümleyici ---------- */
let TVS = { kind: 'off', url: '', owner: 0, playing: false, pos: 0, at: 0, rev: 0, seek: false, by: 0 };
const tvEmbed = (url, pos) => {
  let u; try { u = new URL(url); } catch { return null; }
  if (!/^https?:$/.test(u.protocol)) return null;
  const h = u.hostname.replace(/^(www|m)\./, ''), st = Math.max(0, Math.floor(pos || 0)); let id = null;
  if (h === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
  else if (/(^|\.)youtube(-nocookie)?\.com$/.test(h)) id = u.searchParams.get('v') || (u.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]{6,})/) || [])[1];
  if (id && /^[\w-]{6,15}$/.test(id)) return { type: 'yt', src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&enablejsapi=1&start=${st}` };
  const vm = h === 'vimeo.com' && u.pathname.match(/^\/(?:video\/)?(\d+)/); if (vm) return { type: 'vimeo', src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1#t=${st}s` };
  const tw = h === 'twitch.tv' && u.pathname.match(/^\/(\w+)\/?$/); if (tw) return { type: 'frame', src: `https://player.twitch.tv/?channel=${tw[1]}&parent=${location.hostname}&autoplay=true` };
  if (/\.(mp4|webm|ogv|ogg|mov|m4v|mp3|m4a)$/i.test(u.pathname)) return { type: 'video', src: url };
  if (/\.m3u8$/i.test(u.pathname) && document.createElement('video').canPlayType('application/vnd.apple.mpegurl')) return { type: 'video', src: url };
  return { type: 'frame', src: url };
};
const tvStartOf = u => { const m = u.match(/[?&#](?:t|start)=(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?(?=&|$|#)/i); return m ? (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0) : 0; };
// dikdörtgen (1280x720) -> 4 ekran noktası (sol-üst, sağ-üst, sağ-alt, sol-alt) için CSS matrix3d
const tvHomog = p => {
  const sw = 1280, sh = 720, src = [[0, 0], [sw, 0], [sw, sh], [0, sh]], A = [], b = [];
  for (let i = 0; i < 4; i++) { const [x, y] = src[i], [u, v] = p[i]; A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u); A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v); }
  for (let i = 0; i < 8; i++) {
    let m = i; for (let r = i + 1; r < 8; r++) if (Math.abs(A[r][i]) > Math.abs(A[m][i])) m = r;
    [A[i], A[m]] = [A[m], A[i]]; [b[i], b[m]] = [b[m], b[i]]; const d = A[i][i]; if (Math.abs(d) < 1e-9) return null;
    for (let r = 0; r < 8; r++) if (r !== i) { const f = A[r][i] / d; for (let c = i; c < 8; c++) A[r][c] -= f * A[i][c]; b[r] -= f * b[i]; }
  }
  const h = b.map((v, i) => v / A[i][i]);
  return `matrix3d(${h[0]},${h[3]},0,${h[6]},${h[1]},${h[4]},0,${h[7]},0,0,1,0,${h[2]},${h[5]},0,1)`;
};
function noiseTex(c1, c2, size = 256, rep = 8) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const x = cv.getContext('2d'); x.fillStyle = c1; x.fillRect(0, 0, size, size);
  for (let i = 0; i < size * 14; i++) { x.fillStyle = c2 + Math.floor(Math.random() * 60 + 10).toString(16).padStart(2, '0'); x.fillRect(Math.random() * size, Math.random() * size, 2 + Math.random() * 3, 2 + Math.random() * 3); }
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); return t;
}
function start() {
  const T = THREE; const el = document.createElement('div'); el.id = 'world';
  el.innerHTML = `<div id="tvbox" style="display:none"></div><canvas></canvas><div class="whud"><span id="wroom">🏕️ Kamp Ateşi Lobisi</span><span class="sp"></span><button id="wTv" style="display:none">📺 TV</button><button id="wChar">🧑‍🎤 Karakter</button><button id="wExit">Çık ✕</button></div>
    <div class="whelp"><b>WASD / ok tuşları</b> yürü · <b>Tıkla</b> oraya git · <b>Sürükle</b> kamerayı çevir<br><b>E</b> otur / kalk / 📺 TV kumandası (link · ekran paylaşımı) · 🎴 <b>Okey masası</b> evde (sağ taraf) · <b>Boşluk</b> zıpla · <b>Shift</b> koş · <b>F</b> 👊 yumrukla saldır (ormandaki hayvanlarla dövüş) · <b>1</b> 👋 <b>2</b> 💃 <b>3</b> 🦘 <b>4</b> 👏</div>
    <div class="wprompt" id="wprompt"></div><div id="whp"><div class="hpb"><i></i></div><span class="hpt">❤️ 100</span><span class="kl">🐺 0</span></div><div id="wdmg"></div><div id="wdead">💀 Yenildin<small>Ateşin yanında yeniden doğuyorsun…</small></div><div id="okp" style="display:none"></div><div id="wtv" style="display:none"></div><div class="wemo">${['👋', '💃', '🦘', '👏'].map(e => `<button data-em="${e}">${e}</button>`).join('')}<button id="wAtk" title="Saldır (F)">👊</button></div>`;
  document.body.appendChild(el);
  const cv = el.querySelector('canvas'); const R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); R.setPixelRatio(Math.min(devicePixelRatio, 2)); R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.3;
  const scene = new T.Scene(); const cam = new T.PerspectiveCamera(55, 1, .1, 200);
  const mesh = (geo, mat, x = 0, y = 0, z = 0) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };
  const std = (c, r = .8, extra = {}) => new T.MeshStandardMaterial({ color: c, roughness: r, ...extra });
  const seats = [];  // {id, room, x, y, z, ry}
  const rooms = [new T.Group(), new T.Group()]; scene.add(rooms[0], rooms[1]);

  /* ---------- EFEKT ALTYAPISI ---------- */
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c); })();
  const PN = 420, pP = new Float32Array(PN * 3), pV = new Float32Array(PN * 3), pL = new Float32Array(PN), pL0 = new Float32Array(PN).fill(1), pC = new Float32Array(PN * 3), pC0 = new Float32Array(PN * 3), pGv = new Float32Array(PN);
  const pGeo = new T.BufferGeometry(); pGeo.setAttribute('position', new T.BufferAttribute(pP, 3)); pGeo.setAttribute('color', new T.BufferAttribute(pC, 3));
  const pPts = new T.Points(pGeo, new T.PointsMaterial({ size: .3, map: glowTex, vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending })); pPts.frustumCulled = false; scene.add(pPts);
  let pCur = 0;
  const fxBurst = (x, y, z, col, n, sp = 3, up = 2, grav = 9, life = .6) => { const c = new T.Color(col);
    for (let i = 0; i < n; i++) { const k = pCur++ % PN, a = Math.random() * 6.283, r = sp * (.3 + Math.random() * .7);
      pP[k * 3] = x; pP[k * 3 + 1] = y; pP[k * 3 + 2] = z; pV[k * 3] = Math.cos(a) * r; pV[k * 3 + 1] = up * (.4 + Math.random() * .9); pV[k * 3 + 2] = Math.sin(a) * r;
      pC0[k * 3] = c.r; pC0[k * 3 + 1] = c.g; pC0[k * 3 + 2] = c.b; pL[k] = pL0[k] = life * (.6 + Math.random() * .8); pGv[k] = grav; } };
  const fxUpdate = dt => { for (let k = 0; k < PN; k++) { if (pL[k] > 0) { pL[k] -= dt; pV[k * 3 + 1] -= pGv[k] * dt; pP[k * 3] += pV[k * 3] * dt; pP[k * 3 + 1] = Math.max(.02, pP[k * 3 + 1] + pV[k * 3 + 1] * dt); pP[k * 3 + 2] += pV[k * 3 + 2] * dt; const f = Math.max(0, pL[k] / pL0[k]); pC[k * 3] = pC0[k * 3] * f; pC[k * 3 + 1] = pC0[k * 3 + 1] * f; pC[k * 3 + 2] = pC0[k * 3 + 2] * f; } else { pC[k * 3] = pC[k * 3 + 1] = pC[k * 3 + 2] = 0; } }
    pGeo.attributes.position.needsUpdate = true; pGeo.attributes.color.needsUpdate = true; };
  const slash = new T.Mesh(new T.RingGeometry(.55, 1.15, 20, 1, 1.2, 2.6), new T.MeshBasicMaterial({ color: '#fff1c2', transparent: true, opacity: 0, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false })); scene.add(slash); let slashT = 0;

  /* ---------- LOBİ ---------- */
  const L = rooms[0];
  const ground = mesh(new T.CircleGeometry(26, 64), new T.MeshStandardMaterial({ map: noiseTex('#a66a3a', '#ffcc88', 256, 10), roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.castShadow = false; L.add(ground);
  const grass = mesh(new T.RingGeometry(25, 140, 64), new T.MeshStandardMaterial({ map: noiseTex('#14301c', '#3d7a3a', 256, 50), roughness: 1 })); grass.rotation.x = -Math.PI / 2; grass.position.y = -.02; grass.castShadow = false; L.add(grass);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; L.add(mesh(new T.DodecahedronGeometry(.32), std('#6b6b6b', 1), Math.cos(a) * 1.15, .15, Math.sin(a) * 1.15)); }
  const flames = []; [['#ff4d00', 1.0, .55], ['#ff9500', .75, .38], ['#ffd400', .5, .24]].forEach(([c, h, r]) => { const f = mesh(new T.ConeGeometry(r, h * 1.4, 10), new T.MeshBasicMaterial({ color: c, transparent: true, opacity: .85 }), 0, h * .7 + .1, 0); f.castShadow = false; L.add(f); flames.push(f); });
  const fireL = new T.PointLight('#ff8a2a', 2.2, 22, 1.6); fireL.position.set(0, 1.2, 0); fireL.castShadow = true; L.add(fireL);
  const NP = 70, pPos = new Float32Array(NP * 3), pAge = new Float32Array(NP); for (let i = 0; i < NP; i++) pAge[i] = Math.random();
  const pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(pPos, 3)); const sparks = new T.Points(pg, new T.PointsMaterial({ color: '#ffb347', size: .34, map: glowTex, transparent: true, opacity: .9, depthWrite: false, blending: T.AdditiveBlending })); L.add(sparks);
  const logs = 6; for (let i = 0; i < logs; i++) {
    const a = i / logs * Math.PI * 2 + .3, r = 3.6, x = Math.cos(a) * r, z = Math.sin(a) * r;
    const lg = mesh(new T.CylinderGeometry(.32, .32, 2.1, 12), new T.MeshStandardMaterial({ map: noiseTex('#7a4a22', '#3a1f0a', 128, 2), roughness: 1 }), x, .32, z); lg.rotation.order = 'YXZ'; lg.rotation.set(0, -a - Math.PI / 2, Math.PI / 2); L.add(lg);
    const tx = -Math.sin(a), tz = Math.cos(a); [-.5, .5].forEach((s, j) => seats.push({ id: i * 2 + j, room: 0, x: x + tx * s, y: .62, z: z + tz * s, ry: Math.atan2(-x, -z) }));
  }
  const treeC = [];   // çarpışma daireleri {x,z,r}
  let ember, groundGlow, fireGlow, smoke = [];
  { const NT = 420, trk = new T.InstancedMesh(new T.CylinderGeometry(.35, .5, 1, 6), std('#5a3a22', 1), NT);
    const cones = [0, 1, 2].map(k => new T.InstancedMesh(new T.ConeGeometry(1, 1, 8), std('#ffffff', 1), NT));
    const dm = new T.Object3D(), tcol = new T.Color(); let n = 0;
    for (let tries = 0; n < NT && tries < 6000; tries++) {
      const a = Math.random() * Math.PI * 2, r = 28 + Math.pow(Math.random(), .85) * 90, x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (Math.hypot(x, z - 14.5) < 7) continue;
      if (treeC.some(c => Math.hypot(c.x - x, c.z - z) < 3.4)) continue;
      const h = 4 + Math.random() * 6, sc = .85 + Math.random() * .5;
      dm.rotation.set(0, Math.random() * 6, 0); dm.position.set(x, h * .25, z); dm.scale.set(1, h * .5, 1); dm.updateMatrix(); trk.setMatrixAt(n, dm.matrix);
      cones.forEach((c, k) => { dm.position.set(x, h * .55 + k * h * .22, z); dm.scale.set((2.2 - k * .5) * sc, h * .55, (2.2 - k * .5) * sc); dm.updateMatrix(); c.setMatrixAt(n, dm.matrix); c.setColorAt(n, tcol.setHSL(.3 + Math.random() * .08, .45, .15 + Math.random() * .1 + k * .02)); });
      treeC.push({ x, z, r: .75 }); n++; }
    [trk, ...cones].forEach(m => { m.count = n; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; m.castShadow = true; m.frustumCulled = false; L.add(m); }); }
  [1.15, 1.42, 1.7].forEach((k, i) => { const a = k * Math.PI, tx = Math.cos(a) * 16, tz = Math.sin(a) * 16;   // çadırlar
    const tent = mesh(new T.ConeGeometry(2, 2.6, 4), std(['#c8553d', '#3d7fc8', '#c8a23d'][i], .95), tx, 1.3, tz); tent.rotation.y = Math.PI / 4 + a; L.add(tent); treeC.push({ x: tx, z: tz, r: 1.7 }); });
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + .2, tx = Math.cos(a) * 22, tz = Math.sin(a) * 22;   // meşaleler
    L.add(mesh(new T.CylinderGeometry(.07, .09, 2.2, 6), std('#4a2e15', 1), tx, 1.1, tz));
    const fl = mesh(new T.ConeGeometry(.2, .5, 7), new T.MeshBasicMaterial({ color: '#ff9a2a' }), tx, 2.45, tz); fl.castShadow = false; L.add(fl); }

  { // ateş: kor, parıltı, dumanlar, alevler, çapraz odunlar
    const addM = (c, o) => new T.MeshBasicMaterial({ map: glowTex, color: c, transparent: true, opacity: o, depthWrite: false, blending: T.AdditiveBlending });
    ember = new T.Mesh(new T.CircleGeometry(1.5, 24), addM('#ff4a10', .9)); ember.rotation.x = -Math.PI / 2; ember.position.y = .06; L.add(ember);
    groundGlow = new T.Mesh(new T.CircleGeometry(12, 32), addM('#ff8a2a', .4)); groundGlow.rotation.x = -Math.PI / 2; groundGlow.position.y = .04; L.add(groundGlow);
    fireGlow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: '#ff7a1a', transparent: true, opacity: .55, depthWrite: false, blending: T.AdditiveBlending })); fireGlow.position.set(0, 1.4, 0); fireGlow.scale.setScalar(7); L.add(fireGlow);
    smoke = Array.from({ length: 14 }, (_, i) => { const sp = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: '#6b6b70', transparent: true, opacity: 0, depthWrite: false })); L.add(sp); return { sp, ph: i / 14 }; });
    for (let i = 0; i < 4; i++) { const a = i / 4 * 6.283 + .4, lg = mesh(new T.CylinderGeometry(.12, .13, 1.3, 8), std('#2a1608', 1), Math.cos(a) * .35, .24, Math.sin(a) * .35); lg.rotation.order = 'YXZ'; lg.rotation.set(0, a, 1.15); L.add(lg); }
    for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283, h = .7 + (i % 3) * .25; const f = mesh(new T.ConeGeometry(.16 + (i % 2) * .05, h * 1.3, 6), new T.MeshBasicMaterial({ color: ['#ff6a00', '#ffb300', '#ff3d00'][i % 3], transparent: true, opacity: .75, blending: T.AdditiveBlending, depthWrite: false }), Math.cos(a) * .4, h * .65 + .1, Math.sin(a) * .4); f.castShadow = false; f.rotation.z = Math.cos(a) * .18; f.rotation.x = Math.sin(a) * .18; L.add(f); flames.push(f); }
    fireL.shadow.mapSize.set(1024, 1024);
  }
  { // çimen öbekleri + kayalar
    const NG = 1800, gm = new T.InstancedMesh(new T.ConeGeometry(.07, .55, 3), std('#ffffff', 1), NG), dm = new T.Object3D(), col = new T.Color(); let n = 0;
    for (let tries = 0; n < NG && tries < 5000; tries++) { const a = Math.random() * 6.283, r = 14 + Math.pow(Math.random(), .8) * 88, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.abs(x) < 3.5 && z > 12 && z < 17.5) continue; if (r < 26 && Math.random() < .7) continue;
      const s2 = .7 + Math.random() * 1.1; dm.position.set(x, .22, z); dm.rotation.set((Math.random() - .5) * .4, Math.random() * 6, (Math.random() - .5) * .4); dm.scale.set(s2, s2 * (.7 + Math.random() * .8), s2); dm.updateMatrix(); gm.setMatrixAt(n, dm.matrix); gm.setColorAt(n, col.setHSL(.27 + Math.random() * .1, .5, .16 + Math.random() * .12)); n++; }
    gm.count = n; gm.instanceMatrix.needsUpdate = true; gm.instanceColor.needsUpdate = true; gm.castShadow = false; gm.frustumCulled = false; L.add(gm);
    const NR = 70, rm = new T.InstancedMesh(new T.DodecahedronGeometry(1), std('#ffffff', .95), NR); let m2 = 0;
    for (let tries = 0; m2 < NR && tries < 800; tries++) { const a = Math.random() * 6.283, r = 22 + Math.random() * 74, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.hypot(x, z - 14.5) < 7) continue; const sc = .4 + Math.random() * .9;
      dm.position.set(x, sc * .35, z); dm.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3); dm.scale.set(sc, sc * .7, sc); dm.updateMatrix(); rm.setMatrixAt(m2, dm.matrix); rm.setColorAt(m2, col.setHSL(.08, .05, .25 + Math.random() * .15)); treeC.push({ x, z, r: sc * .6 }); m2++; }
    rm.count = m2; rm.instanceMatrix.needsUpdate = true; rm.instanceColor.needsUpdate = true; rm.frustumCulled = false; L.add(rm);
  }
  const stars = (() => { const n = 600, p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, b = Math.random() * Math.PI * .45, r = 120; p[i * 3] = Math.cos(a) * Math.cos(b) * r; p[i * 3 + 1] = Math.sin(b) * r + 5; p[i * 3 + 2] = Math.sin(a) * Math.cos(b) * r; } const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(p, 3)); const s = new T.Points(g, new T.PointsMaterial({ color: '#fff', size: 1.1, sizeAttenuation: false, fog: false })); return s; })(); L.add(stars);
  const moon = new T.Mesh(new T.SphereGeometry(5, 16, 12), new T.MeshBasicMaterial({ color: '#f5f1d0', fog: false })); moon.position.set(-60, 55, -80); L.add(moon);
  { const halo = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: '#bcd0ff', transparent: true, opacity: .4, depthWrite: false, blending: T.AdditiveBlending, fog: false })); halo.position.copy(moon.position); halo.scale.setScalar(45); L.add(halo); }
  const NF = 40, fPos = new Float32Array(NF * 3), fSeed = []; for (let i = 0; i < NF; i++) { fSeed.push([Math.random() * 6, Math.random() * 6]); fPos[i * 3] = (Math.random() - .5) * 26; fPos[i * 3 + 1] = .5 + Math.random() * 2.5; fPos[i * 3 + 2] = (Math.random() - .5) * 26; }
  const fg = new T.BufferGeometry(); fg.setAttribute('position', new T.BufferAttribute(fPos, 3)); const flies = new T.Points(fg, new T.PointsMaterial({ color: '#d4ff6a', size: .5, map: glowTex, transparent: true, opacity: .95, blending: T.AdditiveBlending, depthWrite: false })); L.add(flies);
  const mkPortal = (x, z, color, label, parent) => { const g = new T.Group(); g.position.set(x, 0, z); const ring = mesh(new T.TorusGeometry(1.1, .12, 10, 28), new T.MeshBasicMaterial({ color }), 0, 1.4, 0); ring.castShadow = false; g.add(ring);
    const inner = mesh(new T.CircleGeometry(1.0, 24), new T.MeshBasicMaterial({ color, transparent: true, opacity: .25, side: T.DoubleSide }), 0, 1.4, 0); inner.castShadow = false; g.add(inner);
    const pl = new T.PointLight(color, 1.2, 8); pl.position.y = 1.4; g.add(pl); parent.add(g); g.userData = { ring, label }; return g; };
  const portalL = mkPortal(0, 11.5, '#7c5cff', '🏠 Eve Gir', L);
  const cabin = new T.Group(); cabin.position.set(0, 0, 14.5); cabin.add(mesh(new T.BoxGeometry(5, 3, 3), std('#8a5a33', 1), 0, 1.5, 0)); const roof = mesh(new T.ConeGeometry(4, 1.8, 4), std('#5a2d1a', 1), 0, 3.9, 0); roof.rotation.y = Math.PI / 4; cabin.add(roof); L.add(cabin);

  /* ---------- EV (TV odası) ---------- */
  const H = rooms[1]; H.visible = false;
  const floor = mesh(new T.PlaneGeometry(14, 11), new T.MeshStandardMaterial({ map: noiseTex('#a9743f', '#5a3a1a', 256, 3), roughness: .8 })); floor.rotation.x = -Math.PI / 2; floor.castShadow = false; H.add(floor);
  const wallM = std('#e8d9c4', 1); [[0, 2.1, -5.5, 14, 4.2, .2], [-7, 2.1, 0, .2, 4.2, 11], [7, 2.1, 0, .2, 4.2, 11], [0, 2.1, 5.5, 14, 4.2, .2]].forEach(([x, y, z, w, h, d]) => H.add(mesh(new T.BoxGeometry(w, h, d), wallM, x, y, z)));
  H.add(mesh(new T.BoxGeometry(14, .2, 11), std('#d9c9b0', 1), 0, 4.25, 0));
  const rug = mesh(new T.CircleGeometry(3.2, 32), std('#7c5cff', 1), 0, .02, .5); rug.rotation.x = -Math.PI / 2; rug.castShadow = false; H.add(rug);
  const tvC = document.createElement('canvas'); tvC.width = 320; tvC.height = 180; const tvX = tvC.getContext('2d'); const tvTex = new T.CanvasTexture(tvC);
  const tvScreen = mesh(new T.PlaneGeometry(4.4, 2.475), new T.MeshBasicMaterial({ map: tvTex }), 0, 2.2, -5.285); tvScreen.castShadow = false; H.add(tvScreen);
  // "delik": bu yüzeyde canvas şeffaf olur, arkadaki video/iframe görünür (karakterler yine önünde durur)
  const tvHole = new T.Mesh(new T.PlaneGeometry(4.4, 2.475), new T.MeshBasicMaterial({ transparent: true, blending: T.CustomBlending, blendEquation: T.AddEquation, blendSrc: T.ZeroFactor, blendDst: T.ZeroFactor, blendSrcAlpha: T.ZeroFactor, blendDstAlpha: T.ZeroFactor, fog: false, toneMapped: false })); tvHole.position.set(0, 2.2, -5.285); tvHole.renderOrder = 5; tvHole.visible = false; H.add(tvHole);
  H.add(mesh(new T.BoxGeometry(4.7, 2.75, .25), std('#111', .4), 0, 2.2, -5.42)); H.add(mesh(new T.BoxGeometry(5.5, .6, .8), std('#5a3a22', .8), 0, .3, -5));
  const tvLight = new T.PointLight('#6ee7ff', 0, 14, 1.5); tvLight.position.set(0, 2.2, -3.6); H.add(tvLight);
  const lamp = new T.Group(); lamp.position.set(-5.8, 0, -4.2); lamp.add(mesh(new T.CylinderGeometry(.06, .06, 2.2, 8), std('#333'), 0, 1.1, 0)); lamp.add(mesh(new T.ConeGeometry(.5, .6, 12, 1, true), new T.MeshBasicMaterial({ color: '#ffd89a', side: T.DoubleSide }), 0, 2.4, 0)); const lampL = new T.PointLight('#ffb866', 1.1, 14); lampL.position.y = 2.3; lamp.add(lampL); H.add(lamp);
  H.add(new T.AmbientLight('#8a7a9a', .45));
  const sofa = new T.Group(); sofa.position.set(0, 0, 2.6); sofa.add(mesh(new T.BoxGeometry(4.2, .55, 1.3), std('#c0392b', .9), 0, .28, 0)); sofa.add(mesh(new T.BoxGeometry(4.2, .9, .35), std('#a93226', .9), 0, .75, .55)); [-2.05, 2.05].forEach(x => sofa.add(mesh(new T.BoxGeometry(.3, .85, 1.3), std('#a93226', .9), x, .45, 0))); H.add(sofa);
  [-1.3, 0, 1.3].forEach((x, i) => seats.push({ id: 20 + i, room: 1, x, y: .62, z: 2.5, ry: Math.PI }));
  [[-4.2, 1.5], [4.2, 1.5]].forEach(([x, z], i) => { const pf = mesh(new T.SphereGeometry(.8, 14, 10), std(i ? '#2980b9' : '#27ae60', 1), x, .45, z); pf.scale.y = .6; H.add(pf); seats.push({ id: 23 + i, room: 1, x, y: .62, z, ry: Math.PI * (x < 0 ? .75 : 1.25) }); });

  /* ---------- OKEY MASASI (ev, sağ taraf) ---------- */
  const TC = { x: 4.4, z: -1.4 }, TR = 1.55, TY = .9, OD = [[0, 1], [-1, 0], [0, -1], [1, 0]];
  const steamSp = []; let confettiOn = false;
  { const cvs = (w_, h_, fn) => { const c = document.createElement('canvas'); c.width = w_; c.height = h_; fn(c.getContext('2d')); const t = new T.CanvasTexture(c); t.anisotropy = 4; return t; };
    const woodTex = cvs(256, 256, x => { x.fillStyle = '#7a4d28'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 90; i++) { x.strokeStyle = `rgba(${40 + Math.random() * 30 | 0},${20 + Math.random() * 15 | 0},8,${.15 + Math.random() * .25})`; x.lineWidth = .6 + Math.random() * 1.6; const y = Math.random() * 256; x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(80, y + Math.random() * 10 - 5, 170, y + Math.random() * 10 - 5, 256, y + Math.random() * 6 - 3); x.stroke(); } });
    const feltTex = cvs(512, 512, x => { const g = x.createRadialGradient(256, 256, 40, 256, 256, 360); g.addColorStop(0, '#2a8a4c'); g.addColorStop(1, '#14502a'); x.fillStyle = g; x.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * .05})`; x.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5); }
      x.strokeStyle = 'rgba(212,175,55,.85)'; x.lineWidth = 3; x.strokeRect(14, 14, 484, 484); x.lineWidth = 1.5; x.strokeRect(24, 24, 464, 464);
      [[14, 14, 1, 1], [498, 14, -1, 1], [14, 498, 1, -1], [498, 498, -1, -1]].forEach(([cx, cy, sx, sy]) => { x.beginPath(); x.arc(cx + sx * 40, cy + sy * 40, 22, 0, 6.283); x.stroke(); });
      x.lineWidth = 2; x.beginPath(); x.arc(256, 256, 70, 0, 6.283); x.stroke(); x.beginPath(); x.arc(256, 256, 60, 0, 6.283); x.stroke(); });
    const rugTex = cvs(512, 512, x => { x.fillStyle = '#5a1620'; x.fillRect(0, 0, 512, 512); [240, 210, 150, 110, 60].forEach((r, i) => { x.strokeStyle = i % 2 ? 'rgba(212,175,55,.8)' : 'rgba(240,220,170,.5)'; x.lineWidth = i % 2 ? 4 : 10; x.beginPath(); x.arc(256, 256, r, 0, 6.283); x.stroke(); });
      for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; x.fillStyle = 'rgba(212,175,55,.7)'; x.beginPath(); x.arc(256 + Math.cos(a) * 180, 256 + Math.sin(a) * 180, 7, 0, 6.283); x.fill(); } });
    const wood = new T.MeshStandardMaterial({ map: woodTex, roughness: .42, metalness: .05 }), rim = new T.MeshStandardMaterial({ map: woodTex, color: '#b08a66', roughness: .4 });
    const felt = new T.MeshStandardMaterial({ map: feltTex, roughness: 1 }), gold = new T.MeshStandardMaterial({ color: '#d4af37', roughness: .3, metalness: .8 });
    const rug = new T.Mesh(new T.CircleGeometry(2.9, 48), new T.MeshStandardMaterial({ map: rugTex, roughness: 1 })); rug.rotation.x = -Math.PI / 2; rug.position.set(TC.x, .017, TC.z); rug.receiveShadow = true; H.add(rug);
    H.add(mesh(new T.BoxGeometry(2.3, .1, 2.3), wood, TC.x, TY - .05, TC.z));
    H.add(mesh(new T.BoxGeometry(2.0, .16, 2.0), rim, TC.x, TY - .18, TC.z));
    const ft = mesh(new T.PlaneGeometry(2.0, 2.0), felt, TC.x, TY + .002, TC.z); ft.rotation.x = -Math.PI / 2; ft.castShadow = false; H.add(ft);
    const prof = [[.42, 0], [.42, .04], [.28, .08], [.12, .18], [.1, .34], [.17, .46], [.1, .56], [.13, .68], [.3, .78]].map(([x, y]) => new T.Vector2(x, y));
    H.add(mesh(new T.LatheGeometry(prof, 20), wood, TC.x, 0, TC.z));
    [[0, 1.075, 2.3, .12], [0, -1.075, 2.3, .12], [1.075, 0, .12, 2.3], [-1.075, 0, .12, 2.3]].forEach(([ox, oz, bw, bd]) => H.add(mesh(new T.BoxGeometry(bw, .09, bd), rim, TC.x + ox, TY + .02, TC.z + oz)));
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => { H.add(mesh(new T.SphereGeometry(.075, 10, 8), gold, TC.x + sx * 1.15, TY - .03, TC.z + sz * 1.15));
      const sauc = mesh(new T.CylinderGeometry(.085, .07, .012, 14), std('#f4f0e6', .3), TC.x + sx * .98, TY + .07, TC.z + sz * .98); H.add(sauc);
      const gl = mesh(new T.LatheGeometry([[.03, 0], [.04, .02], [.05, .06], [.052, .09], [.046, .125]].map(([x, y]) => new T.Vector2(x, y)), 12), new T.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: .35, roughness: .1, side: T.DoubleSide }), TC.x + sx * .98, TY + .078, TC.z + sz * .98); gl.castShadow = false; H.add(gl);
      H.add(mesh(new T.CylinderGeometry(.043, .035, .075, 10), new T.MeshStandardMaterial({ color: '#a63a12', emissive: '#401000', roughness: .3 }), TC.x + sx * .98, TY + .12, TC.z + sz * .98));
      for (let k = 0; k < 2; k++) { const sp = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: '#ffffff', transparent: true, opacity: 0, depthWrite: false })); H.add(sp); steamSp.push({ sp, x: TC.x + sx * .98, y: TY + .2, z: TC.z + sz * .98, ph: Math.random() + k * .5 }); } });
    const rackM = new T.MeshStandardMaterial({ map: woodTex, color: '#d8a878', roughness: .45 });
    OD.forEach(([dx, dz], i) => { const r = new T.Mesh(new T.BoxGeometry(1.7, .07, .2), rackM); r.position.set(TC.x + dx * .86, TY + .035, TC.z + dz * .86); r.rotation.y = Math.atan2(dx, dz); r.castShadow = true; H.add(r);
      const lip = new T.Mesh(new T.BoxGeometry(1.7, .045, .03), rackM); lip.position.set(0, .04, .1); r.add(lip); [-.85, .85].forEach(ex => { const cap = new T.Mesh(new T.SphereGeometry(.05, 8, 6), gold); cap.position.set(ex, .02, 0); r.add(cap); }); });
    OD.forEach(([dx, dz], i) => {
      const sx = TC.x + dx * TR, sz = TC.z + dz * TR, cm = std(['#c0392b', '#2980b9', '#27ae60', '#8e44ad'][i], .75), ch = new T.Group(); ch.position.set(sx, 0, sz); ch.rotation.y = Math.atan2(dx, dz); H.add(ch);
      ch.add(mesh(new T.CylinderGeometry(.28, .26, .07, 22), cm, 0, .47, 0));
      [[-.18, -.18], [.18, -.18], [-.18, .18], [.18, .18]].forEach(([lx, lz]) => ch.add(mesh(new T.CylinderGeometry(.03, .025, .44, 8), wood, lx, .22, lz)));
      ch.add(mesh(new T.BoxGeometry(.52, .5, .06), cm, 0, .8, .25)); [-.22, .22].forEach(px => ch.add(mesh(new T.CylinderGeometry(.03, .03, .55, 8), wood, px, .72, .25)));
      seats.push({ id: 30 + i, room: 1, x: sx, y: .62, z: sz, ry: Math.atan2(TC.x - sx, TC.z - sz), okey: true, i, ox: dx, oz: dz });
    });
    // sarkıt lamba
    H.add(mesh(new T.CylinderGeometry(.012, .012, 1.05, 6), std('#222'), TC.x, 3.62, TC.z));
    const shade = mesh(new T.ConeGeometry(.45, .35, 22, 1, true), new T.MeshStandardMaterial({ color: '#2d5a3a', roughness: .4, metalness: .5, side: T.DoubleSide }), TC.x, 3.0, TC.z); H.add(shade);
    const bulb = new T.Mesh(new T.SphereGeometry(.09, 12, 10), new T.MeshBasicMaterial({ color: '#fff1c0' })); bulb.position.set(TC.x, 2.88, TC.z); H.add(bulb);
    const tl = new T.PointLight('#ffd9a0', 1.6, 10, 1.6); tl.position.set(TC.x, 2.7, TC.z); H.add(tl);
    const lg = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: '#ffcc80', transparent: true, opacity: .4, depthWrite: false, blending: T.AdditiveBlending })); lg.position.set(TC.x, 2.85, TC.z); lg.scale.setScalar(2.4); H.add(lg);
    // süslemeler: süpürgelik, pencereler, tablolar
    const bb = std('#8a6a48', .6); [[0, .08, -5.38, 13.8, .16, .06], [0, .08, 5.38, 13.8, .16, .06], [-6.88, .08, 0, .06, .16, 10.8], [6.88, .08, 0, .06, .16, 10.8]].forEach(([x, y, z, w_, h_, d_]) => H.add(mesh(new T.BoxGeometry(w_, h_, d_), bb, x, y, z)));
    const fr = std('#e9dcc6', .6);
    [-4.6, 4.6].forEach(x => { const win = new T.Mesh(new T.PlaneGeometry(1.8, 1.5), new T.MeshBasicMaterial({ color: '#27407a' })); win.position.set(x, 2.5, -5.38); H.add(win);
      const wg = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: '#7a9cff', transparent: true, opacity: .3, depthWrite: false, blending: T.AdditiveBlending })); wg.position.set(x, 2.5, -5.2); wg.scale.setScalar(3.4); H.add(wg);
      [[0, .75, 1.95, .08], [0, -.75, 1.95, .08], [.9, 0, .08, 1.5], [-.9, 0, .08, 1.5], [0, 0, 1.8, .04], [0, 0, .04, 1.5]].forEach(([ox, oy, bw, bh]) => { const f = mesh(new T.BoxGeometry(bw, bh, .06), fr, x + ox, 2.5 + oy, -5.34); f.castShadow = false; H.add(f); }); });
    [[-2, '#c98a3a'], [1.5, '#3a7ab5']].forEach(([z, c]) => { H.add(mesh(new T.BoxGeometry(.05, 1.0, 1.4), std('#3a2412', .5), -6.86, 2.6, z)); const pic = new T.Mesh(new T.PlaneGeometry(1.2, .8), new T.MeshBasicMaterial({ color: c })); pic.rotation.y = Math.PI / 2; pic.position.set(-6.82, 2.6, z); H.add(pic); });
  }
  const tableFx = (dt, t) => { if (myP.room !== 1) return; steamSp.forEach(o => { const a = (t * .45 + o.ph) % 1; o.sp.position.set(o.x + Math.sin(a * 6 + o.ph * 9) * .015, o.y + a * .35, o.z); o.sp.scale.setScalar(.06 + a * .14); o.sp.material.opacity = .28 * Math.sin(a * Math.PI) * (1 - a * .4); }); };
  const okG = new T.Group(); H.add(okG);
  const tSide = std('#f4ecd8', .5), tBack = std('#c89b5a', .6), tGeo = new T.BoxGeometry(.16, .045, .22), hGeo = new T.BoxGeometry(.1, .17, .045), dGeo = new T.BoxGeometry(.2, 1, .27);
  const tMat = {}, tCv = id => {
    const t = tInfo(id), key = t.fake ? 'f' : t.c + '_' + t.n; if (tMat[key]) return tMat[key];
    const c = document.createElement('canvas'); c.width = 64; c.height = 88; const x = c.getContext('2d'); x.fillStyle = '#f4ecd8'; x.fillRect(0, 0, 64, 88); x.textAlign = 'center';
    if (t.fake) { x.fillStyle = '#1e9d4a'; x.font = 'bold 44px sans-serif'; x.fillText('✦', 32, 54); }
    else { x.fillStyle = OCOL[t.c]; x.font = 'bold 46px sans-serif'; x.fillText(t.n, 32, 52); x.beginPath(); x.arc(32, 68, 7, 0, 7); x.fill(); }
    const tx = new T.CanvasTexture(c); tx.anisotropy = 4; return tMat[key] = new T.MeshStandardMaterial({ map: tx, roughness: .5 });
  };
  const flatTile = id => { const m = new T.Mesh(tGeo, [tSide, tSide, tCv(id), tSide, tSide, tSide]); m.castShadow = true; return m; };
  const okeyRender = () => {
    while (okG.children.length) okG.remove(okG.children[0]);
    const s = OK.s; if (!s || s.phase !== 'end') confettiOn = false; if (!s || s.phase === 'lobby') { return; }
    if (s.phase === 'end' && s.winner != null && !confettiOn) { confettiOn = true; ['#ff4d6d', '#ffd400', '#4dd2ff', '#7dff9a', '#c77dff'].forEach(c => fxBurst(TC.x, TY + .9, TC.z, c, 22, 2.6, 4.5, 3.2, 2.6)); }
    const place = (m, dx, dz, u, r, y, rot = 0) => { const tx = -dz, tz = dx; m.position.set(TC.x + dx * r + tx * u, y, TC.z + dz * r + tz * u); m.rotation.y = Math.atan2(dx, dz) + rot; okG.add(m); return m; };
    OD.forEach(([dx, dz], i) => {
      if (s.seats[i] == null) return;
      const n = s.counts[i], pile = s.discards[i].slice(-5);
      if (s.phase === 'end' && s.hands) {   // el bitti: herkesin taşları masada açılır
        const hand = [...s.hands[i]].sort((a, b) => a - b), cols = 7;
        hand.forEach((id, j) => { const row = (j / cols) | 0, col = j % cols; place(flatTile(id), dx, dz, (col - (cols - 1) / 2) * .19, .8 - row * .27, TY + .025); });
      } else for (let j = 0; j < n; j++) { const m = new T.Mesh(hGeo, tBack); m.castShadow = true; place(m, dx, dz, (j - (n - 1) / 2) * .105, .86, TY + .105); }
      pile.forEach((id, j) => place(flatTile(id), dx, dz, .5, .5, TY + .025 + j * .046, ((id * 37) % 11 - 5) * .03));
      if (s.phase === 'play' && s.turn === i) { const l = new T.Mesh(new T.TorusGeometry(.13, .035, 8, 24), new T.MeshBasicMaterial({ color: '#ffd400' })); l.rotation.x = Math.PI / 2; place(l, dx, dz, -.8, 1.0, TY + .04); l.rotation.x = Math.PI / 2; }
      if (s.phase === 'end' && s.winner === i) { const l = new T.Mesh(new T.TorusGeometry(.3, .04, 8, 32), new T.MeshBasicMaterial({ color: '#7dff9a' })); place(l, dx, dz, 0, .45, TY + .06); l.rotation.x = Math.PI / 2; }
    });
    if (s.deck > 0) { const h = Math.max(.03, s.deck * .0045); const m = new T.Mesh(dGeo, tBack); m.scale.y = h; m.castShadow = true; m.position.set(TC.x - .22, TY + h / 2, TC.z); okG.add(m); }
    if (s.ind != null) { const m = flatTile(s.ind); m.position.set(TC.x + .22, TY + .025, TC.z); okG.add(m); }
  };
  H.add(mesh(new T.BoxGeometry(1.2, 1.9, .45), std('#6b4423', 1), 6.4, .95, -3)); H.add(mesh(new T.CylinderGeometry(.35, .28, .6, 10), std('#a0522d', 1), -6.2, .3, 3.6)); H.add(mesh(new T.SphereGeometry(.55, 10, 8), std('#2e8b57', 1), -6.2, 1.1, 3.6));
  const portalH = mkPortal(0, 4.4, '#ff8a2a', '🏕️ Lobiye Çık', H);
  const lights = [new T.HemisphereLight('#6a7bd1', '#2a1a10', .55), new T.DirectionalLight('#9bb0ff', .5)]; lights[1].position.set(-10, 20, 8); lights[1].castShadow = true; lights[1].shadow.mapSize.set(1024, 1024); Object.assign(lights[1].shadow.camera, { left: -20, right: 20, top: 20, bottom: -20 }); scene.add(...lights);
  seatsDef.length = 0; seatsDef.push(...seats);

  /* ---------- oyuncular ---------- */
  const players = new Map(); const me = S.me.id;
  const spawn = i => { const a = i * 2.4; return { x: Math.cos(a) * 6.2, z: Math.sin(a) * 6.2 + 1 }; };
  const getP = id => {
    let p = players.get(id);
    if (!p) { const sp = spawn(players.size); p = { id, g: null, x: sp.x, z: sp.z, tx: sp.x, tz: sp.z, ry: Math.PI, tr: Math.PI, a: 0, room: 0, seat: -1, em: '', emAt: -9, lab: document.createElement('div'), y: 0, vy: 0, sitK: 0 }; p.lab.className = 'nm'; el.appendChild(p.lab); players.set(id, p); }
    return p;
  };
  const myP = getP(me); const SP0 = { x: 0, z: 7 }; myP.x = myP.tx = SP0.x; myP.z = myP.tz = SP0.z; myP.ry = myP.tr = Math.PI;
  W = { el, R, scene, cam, players, myP, seats, rooms, keys: {}, yaw: 0, pitch: .5, dist: 8, tvOn: false, tvT: 0, lastSend: 0, lastState: '', clock: new T.Clock(), stepT: 0, goto: null, drag: false, rs: null, kd: null, ku: null, raf: 0, hb: 0, fx: { flames, fireL, pPos, pAge, pg, flies, fSeed, fPos, fg, portalL, portalH, tvX, tvTex, tvLight } };
  const w = W; w.okeyRender = okeyRender; okBind(el); okeyRender();
  const roomName = ['🏕️ Kamp Ateşi Lobisi', '🏠 Ev · TV Odası'];
  const setRoom = (r, silent) => {
    myP.room = r; rooms[0].visible = r === 0; rooms[1].visible = r === 1;
    scene.background = new T.Color(r === 0 ? '#0a1030' : '#1c1428'); scene.fog = r === 0 ? new T.Fog('#0a1030', 35, 115) : new T.Fog('#1c1428', 25, 60);
    lights[0].intensity = r === 0 ? .55 : .35; lights[1].intensity = r === 0 ? .5 : .1;
    el.querySelector('#wroom').textContent = roomName[r]; el.querySelector('#wTv').style.display = r === 1 ? '' : 'none'; if (r !== 1) el.querySelector('#wtv').style.display = 'none';
    if (r === 0) { myP.x = myP.tx = 0; myP.z = myP.tz = 9.6; } else { myP.x = myP.tx = 0; myP.z = myP.tz = 3.4; }
    myP.seat = -1; myP.a = 0; w.goto = null; if (!silent) sfx('door'); netSend(true);
  };
  w.setRoom = setRoom;

  const netSend = force => {
    const now = performance.now(); const st = [myP.x.toFixed(2), myP.z.toFixed(2), myP.ry.toFixed(2), myP.a, myP.room, myP.seat].join();
    if (!force && st === w.lastState && now - w.lastSend < 1500) return; if (!force && now - w.lastSend < 110) return;
    w.lastState = st; w.lastSend = now; wsSend({ t: 'world', x: myP.x, z: myP.z, ry: myP.ry, a: myP.a, room: myP.room, seat: myP.seat, em: '' });
  };
  const sendEm = e => wsSend({ t: 'world', x: myP.x, z: myP.z, ry: myP.ry, a: myP.a, room: myP.room, seat: myP.seat, em: e });
  setRoom(0, true);
  w.hb = setInterval(() => netSend(true), 2000);

  const nearSeat = () => { let best = null, bd = 1.9; for (const s of seats) { if (s.room !== myP.room) continue; if ([...players.values()].some(p => p.seat === s.id && p.id !== me && p.room === s.room)) continue; const d = Math.hypot(s.x - myP.x, s.z - myP.z); if (d < bd) { bd = d; best = s; } } return best; };
  const nearTV = () => myP.room === 1 && Math.hypot(myP.x, myP.z + 4) < 3.6;
  const sit = s => { if (s.okey) { if (OK.s?.phase === 'play') return toast('Okey oyunu devam ediyor, bitince oturabilirsin.'); wsSend({ t: 'okey:sit', seat: s.i }); w.yaw = Math.atan2(s.ox, s.oz); w.dist = 4.6; w.pitch = .95; } myP.seat = s.id; myP.a = 2; myP.tr = s.ry; w.goto = null; sfx('sit'); netSend(true); okUI(); };
  const stand = () => { const s = seats.find(x => x.id === myP.seat); if (s?.okey) { if (OK.s?.phase === 'play' && OK.s.seats.includes(me) && !OK.s.seats.some(x => typeof x === 'string') && !confirm('Kalkarsan okey oyunu iptal olur. Emin misin?')) return; wsSend({ t: 'okey:leave' }); w.dist = 8; w.pitch = .5; w.goto = { x: s.x + s.ox * .9, z: s.z + s.oz * .9 }; } else if (s) { w.goto = { x: s.x + Math.sin(s.ry) * 1.0, z: s.z + Math.cos(s.ry) * 1.0 }; } myP.seat = -1; myP.a = 0; sfx('stand'); netSend(true); okUI(); };
  const toggleTV = (fromNet, on) => { w.tvOn = fromNet ? on : !w.tvOn; sfx(w.tvOn ? 'tvOn' : 'tvOff'); if (!fromNet) sendEm(w.tvOn ? 'tv+' : 'tv-'); };
  const emote = e => { if (myP.a === 1) return; myP.em = e; myP.emAt = performance.now() / 1000; sfx(e === '👋' ? 'wave' : e === '💃' ? 'dance' : e === '🦘' ? 'jump' : 'clap'); sendEm(e); };
  w.act = () => { if (myP.seat >= 0) return stand(); const s = nearSeat(); if (s) return sit(s); if (nearTV()) return w.tvOpen?.(); };
  w.onNet = d => {
    if (d.id === me) return; const p = getP(d.id);
    if (d.em) { if (d.em.startsWith('tv')) { toggleTV(true, d.em === 'tv+'); } else { p.em = d.em; p.emAt = performance.now() / 1000; if (p.room === myP.room) sfx(d.em === '👋' ? 'wave' : d.em === '💃' ? 'dance' : d.em === '🦘' ? 'jump' : d.em === '⚔️' ? 'swing' : 'clap'); } }
    const wasSeat = p.seat; p.tx = d.x; p.tz = d.z; p.tr = d.ry; p.a = d.a; p.seat = d.seat; if (p.room !== d.room) { p.room = d.room; p.x = d.x; p.z = d.z; if (d.room === myP.room) sfx('pop'); }
    if (d.seat >= 0) { const s = seats.find(x => x.id === d.seat); if (s) { p.tx = s.x; p.tz = s.z; p.tr = s.ry; if (wasSeat !== d.seat && p.room === myP.room) sfx('sit'); } }
  };

  /* ---------- TV: link / ekran paylaşımı ---------- */
  const tvbox = el.querySelector('#tvbox'), tvPanel = el.querySelector('#wtv');
  const tvCorners = [[-2.2, 3.4375], [2.2, 3.4375], [2.2, .9625], [-2.2, .9625]].map(([x, y]) => new T.Vector3(x, y, -5.285));
  const tvPos = () => TVS.pos + (TVS.playing ? (performance.now() - TVS.at) / 1000 : 0);
  const tvKey = () => (myP.room === 1 && TVS.kind !== 'off') ? TVS.kind + '|' + TVS.url + '|' + TVS.owner : '';
  const tvCmd = (func, args) => { try { w.tvEl.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args: args || [] }), '*'); } catch {} };
  const vmCmd = (method, value) => { try { w.tvEl.contentWindow.postMessage(JSON.stringify(value === undefined ? { method } : { method, value }), '*'); } catch {} };
  const tvRestoreVol = () => { const rv = call.videos?.get(TVS.owner); if (rv) rv.volume = 1; };
  const tvUnlock = () => { toast('TV sesi için ekranda bir yere tıkla 🔊'); window.addEventListener('pointerdown', () => w.tvEl?.play?.().catch(() => {}), { once: true }); };
  const tvDestroy = () => {
    const e = w.tvEl; if (e) { try { if (e.tagName === 'IFRAME') e.src = 'about:blank'; else { e.pause(); e.srcObject = null; e.removeAttribute('src'); e.load(); } } catch {} e.remove(); tvRestoreVol(); }
    w.tvEl = null; w.tvKey = ''; w.tvType = ''; tvHole.visible = false; tvScreen.visible = true; tvbox.style.display = 'none';
  };
  const tvCreate = () => {
    tvDestroy(); const key = tvKey(); if (!key) return; w.tvKey = key; let e;
    if (TVS.kind === 'screen') { e = document.createElement('video'); e.autoplay = true; e.muted = true; e.playsInline = true; w.tvType = 'screen'; }
    else {
      const m = tvEmbed(TVS.url, tvPos()); if (!m) { toast('Link açılamadı.'); return; } w.tvType = m.type;
      if (m.type === 'video') { e = document.createElement('video'); e.src = m.src; e.playsInline = true; e.autoplay = true; e.addEventListener('loadedmetadata', () => { try { e.currentTime = tvPos(); } catch {} }, { once: true }); }
      else { e = document.createElement('iframe'); e.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture'; e.allowFullscreen = true; e.referrerPolicy = 'strict-origin-when-cross-origin'; e.src = m.src; e.addEventListener('load', () => { w.tvRev = -1; setTimeout(() => { w.tvRev = -1; }, 1500); }); }
    }
    tvbox.appendChild(e); w.tvEl = e; w.tvRev = -1; w.tvVol = -1; tvHole.visible = true; tvScreen.visible = false;
  };
  const tvApply = () => {
    const e = w.tvEl; if (!e) return; w.tvRev = TVS.rev; const pl = TVS.playing, pos = tvPos();
    if (w.tvType === 'video') { if (isFinite(pos) && e.readyState > 0 && Math.abs(e.currentTime - pos) > 1.2) { try { e.currentTime = pos; } catch {} } if (pl) e.play().catch(tvUnlock); else e.pause(); }
    else if (w.tvType === 'yt') { tvCmd(pl ? 'playVideo' : 'pauseVideo'); if (TVS.seek) tvCmd('seekTo', [pos, true]); }
    else if (w.tvType === 'vimeo') { vmCmd(pl ? 'play' : 'pause'); if (TVS.seek) vmCmd('setCurrentTime', pos); }
  };
  w.tvTick = dt => {
    const key = tvKey(); if (key !== w.tvKey) tvCreate();
    const e = w.tvEl; if (!e) return;
    if (w.tvType === 'screen') { const st = TVS.owner === me ? call.screen : call.videos.get(TVS.owner)?.srcObject; if (st && e.srcObject !== st) { e.srcObject = st; e.play().catch(() => {}); } }
    if (TVS.rev !== w.tvRev) tvApply();
    const vol = Math.max(.12, Math.min(1, 1.15 - Math.hypot(myP.x, myP.z + 5) / 13)), q = Math.round(vol * 10) / 10;
    if (q !== w.tvVol) { w.tvVol = q;
      if (w.tvType === 'video') e.volume = q; else if (w.tvType === 'screen') { const rv = call.videos.get(TVS.owner); if (rv) rv.volume = q; }
      else if (w.tvType === 'yt') tvCmd('setVolume', [Math.round(q * 100)]); else if (w.tvType === 'vimeo') vmCmd('setVolume', q); }
    // yerleşim: TV'nin 4 köşesini ekrana projekte edip iframe/video'yu oraya oturt
    if (document.fullscreenElement === tvbox) return;
    cam.updateMatrixWorld(); const pts = []; let ok = true;
    for (const c of tvCorners) { const v = c.clone().applyMatrix4(cam.matrixWorldInverse); if (v.z > -.1) { ok = false; break; } v.applyMatrix4(cam.projectionMatrix); pts.push([(v.x * .5 + .5) * innerWidth, (-v.y * .5 + .5) * innerHeight]); }
    const tf = ok ? tvHomog(pts) : null; if (!tf) { tvbox.style.display = 'none'; return; }
    tvbox.style.display = 'block'; tvbox.style.transform = tf;
  };
  const tvSend = o => wsSend({ t: 'tv:set', ...o });
  const tvRender = () => {
    const keep = tvPanel.querySelector('#tvUrl')?.value || ''; const on = TVS.kind !== 'off', scr = TVS.kind === 'screen';
    const sharers = (S.voice[call.chanId] || []).filter(u => u.sharing && u.id !== me);
    const now = !on ? '' : scr ? `🖥️ ${esc(TVS.owner === me ? 'Senin ekranın' : userName(TVS.owner) + ' ekranı')}` : '🔗 ' + esc(TVS.url.length > 46 ? TVS.url.slice(0, 46) + '…' : TVS.url);
    tvPanel.innerHTML = `<div class="tvh"><b>📺 TV Kumandası</b><button data-a="x" title="Kapat">✕</button></div>
      <div class="tvr"><input id="tvUrl" placeholder="Video linki yapıştır (YouTube, Vimeo, Twitch, .mp4…)" autocomplete="off"><button data-a="go">▶ Oynat</button></div>
      <div class="tvr">${scr && TVS.owner === me ? '' : '<button class="alt" data-a="me">🖥️ Ekranımı TV\'ye yansıt</button>'}${sharers.filter(u => !(scr && TVS.owner === u.id)).map(u => `<button class="alt" data-a="sh" data-id="${u.id}">🖥️ ${esc(userName(u.id))}</button>`).join('')}</div>
      ${on ? `<div class="tvn">Şu an: ${now}</div><div class="tvr">${scr ? '' : `<button data-a="b">⏪ 10 sn</button><button data-a="pp">${TVS.playing ? '⏸ Duraklat' : '▶ Devam'}</button><button data-a="f">10 sn ⏩</button>`}<button data-a="fs">⛶ Tam ekran</button><button class="danger" data-a="off">⏹ Kapat</button></div>` : ''}
      <small>İpucu: ekran paylaşırken tüm ekran yerine <b>sekme</b> seç, TV kendini yansıtmasın. TV'ye yaklaştıkça ses artar.</small>`;
    const inp = tvPanel.querySelector('#tvUrl'); inp.value = keep;
  };
  w.tvUI = () => { if (tvPanel.style.display !== 'none') tvRender(); };
  w.tvOpen = () => { if (myP.room !== 1) return; tvPanel.style.display = 'block'; tvRender(); tvPanel.querySelector('#tvUrl')?.focus(); };
  tvPanel.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'tvUrl') tvPanel.querySelector('[data-a=go]').click(); });
  tvPanel.addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return; const a = b.dataset.a, cur = { kind: TVS.kind, url: TVS.url, owner: TVS.owner };
    if (a === 'x') tvPanel.style.display = 'none';
    else if (a === 'go') { const u = tvPanel.querySelector('#tvUrl').value.trim(); if (!u) return; if (!/^https?:\/\//i.test(u) || !tvEmbed(u, 0)) return toast('Geçerli bir http(s) linki gir.'); tvSend({ kind: 'link', url: u, playing: true, pos: tvStartOf(u) }); }
    else if (a === 'me') { if (!call.screen) { await call.startShare(); if (!call.screen) return; } tvSend({ kind: 'screen', owner: me, playing: true, pos: 0 }); }
    else if (a === 'sh') tvSend({ kind: 'screen', owner: +b.dataset.id, playing: true, pos: 0 });
    else if (a === 'pp') tvSend({ ...cur, playing: !TVS.playing, pos: tvPos() });
    else if (a === 'b' || a === 'f') tvSend({ ...cur, playing: TVS.playing, pos: Math.max(0, tvPos() + (a === 'f' ? 10 : -10)), seek: 1 });
    else if (a === 'fs') { if (tvbox.requestFullscreen) tvbox.requestFullscreen().catch(() => {}); }
    else if (a === 'off') tvSend({ kind: 'off' });
  });
  el.querySelector('#wTv').onclick = () => w.tvOpen();

  /* ---------- girdi ---------- */
  w.kd = e => { if (e.target.closest('input,textarea')) return; const k = e.key.toLowerCase(); w.keys[k] = true;
    if (k === 'e') w.act(); else if (k === ' ') { e.preventDefault(); if (myP.seat < 0 && myP.vy === 0 && myP.y === 0 && !myP.dead) { myP.vy = 6; sfx('jump'); } } else if ('1234'.includes(k) && k.length === 1) emote(['👋', '💃', '🦘', '👏'][+k - 1]); else if (k === 'f') w.attack?.(); else if (k === 'escape') close(); };
  w.ku = e => { w.keys[e.key.toLowerCase()] = false; };
  window.addEventListener('keydown', w.kd); window.addEventListener('keyup', w.ku);
  let dx = 0, moved = 0;
  cv.addEventListener('mousedown', e => { w.drag = true; dx = e.clientX; moved = 0; });
  w.mu = e => { if (w.drag && moved < 5 && e.target === cv) clickGround(e); w.drag = false; }; window.addEventListener('mouseup', w.mu);
  cv.addEventListener('mousemove', e => { if (!w.drag) return; moved += Math.abs(e.movementX) + Math.abs(e.movementY); w.yaw -= e.movementX * .005; w.pitch = Math.max(.12, Math.min(1.3, w.pitch + e.movementY * .004)); });
  cv.addEventListener('wheel', e => { e.preventDefault(); w.dist = Math.max(3.5, Math.min(16, w.dist + e.deltaY * .01)); }, { passive: false });
  const ray = new T.Raycaster(), v2 = new T.Vector2(), plane = new T.Plane(new T.Vector3(0, 1, 0), 0), hit = new T.Vector3();
  const clickGround = e => { const r = cv.getBoundingClientRect(); v2.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(v2, cam);
    if (ray.ray.intersectPlane(plane, hit)) { if (myP.seat >= 30) return; if (myP.seat >= 0) stand(); w.goto = { x: hit.x, z: hit.z }; } };
  el.querySelector('#wExit').onclick = close; el.querySelector('#wChar').onclick = editor;
  el.querySelectorAll('[data-em]').forEach(b => b.onclick = () => emote(b.dataset.em)); el.querySelector('#wAtk').onclick = () => w.attack?.();
  w.rs = () => { const W_ = innerWidth, H_ = innerHeight; R.setSize(W_, H_, false); cam.aspect = W_ / H_; cam.updateProjectionMatrix(); }; window.addEventListener('resize', w.rs); w.rs();
  ac(); ambStart(); sfx('door');

  /* ---------- ÇARPIŞMA ---------- */
  const collideLobby = (o, rad) => {
    const d = Math.hypot(o.x, o.z); if (d > 96) { o.x *= 96 / d; o.z *= 96 / d; } if (d < 1.5) { o.x *= 1.5 / (d || 1); o.z *= 1.5 / (d || 1); }
    for (const c of treeC) { const dx = o.x - c.x, dz = o.z - c.z; if (Math.abs(dx) > 3 || Math.abs(dz) > 3) continue; const dd = Math.hypot(dx, dz), mn = c.r + rad; if (dd < mn) { const k = mn / (dd || .001); o.x = c.x + dx * k; o.z = c.z + dz * k; } }
    if (Math.abs(o.x) < 2.5 + rad && o.z > 13 - rad && o.z < 16 + rad) { const px = 2.5 + rad - Math.abs(o.x), p1 = o.z - (13 - rad), p2 = 16 + rad - o.z, m = Math.min(px, p1, p2); if (m === px) o.x = Math.sign(o.x || 1) * (2.5 + rad); else if (m === p1) o.z = 13 - rad; else o.z = 16 + rad; }
  };

  /* ---------- HAYVANLAR + DÖVÜŞ (yerel; ormanda) ---------- */
  const KIND = {
    wolf: { name: 'Kurt', hp: 45, spd: 5.4, dmg: 9, cd: 1.0, aggro: 15, rng: 1.6, hostile: 1, n: 7, rmin: 32, rmax: 80 },
    boar: { name: 'Yaban Domuzu', hp: 70, spd: 4.8, dmg: 13, cd: 1.3, aggro: 9, rng: 1.7, hostile: 1, n: 5, rmin: 30, rmax: 75 },
    bear: { name: 'Ayı', hp: 170, spd: 4.1, dmg: 24, cd: 1.6, aggro: 13, rng: 2.3, hostile: 1, n: 3, rmin: 55, rmax: 90 },
    deer: { name: 'Geyik', hp: 28, spd: 7, dmg: 0, cd: 0, aggro: 0, rng: 0, hostile: 0, n: 8, rmin: 28, rmax: 80 },
  };
  const LOOK = {
    wolf: { c: '#6d737c', c2: '#454a52', L: 1.25, H: .5, W: .42, lh: .55, sc: 1, lw: .07 },
    boar: { c: '#6b4a34', c2: '#46301f', L: 1.15, H: .62, W: .58, lh: .38, sc: 1, lw: .08 },
    bear: { c: '#4b3524', c2: '#2f2118', L: 1.6, H: .95, W: .85, lh: .62, sc: 1.15, lw: .13 },
    deer: { c: '#b3834f', c2: '#e8d5b0', L: 1.1, H: .48, W: .36, lh: .85, sc: 1, lw: .05 },
  };
  const mkAnimal = kind => {
    const C = LOOK[kind], g = new T.Group(), A = { g, legs: [], mats: [] }; g.rotation.order = 'YXZ';
    const mk = c => { const m = new T.MeshStandardMaterial({ color: c, roughness: .9 }); A.mats.push(m); return m; };
    const bm = mk(C.c), dm = mk(C.c2), wm = new T.MeshStandardMaterial({ color: '#f2ecd8', roughness: .6 }), km = new T.MeshBasicMaterial({ color: kind === 'wolf' || kind === 'bear' ? '#ff4a1a' : '#111' });
    const add = (par, geo, m, x, y, z, rx = 0, rz = 0) => { const o = new T.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); o.castShadow = true; par.add(o); return o; };
    const by = C.lh + C.H / 2;
    add(g, new T.BoxGeometry(C.W, C.H, C.L), bm, 0, by, 0);
    if (kind === 'bear') add(g, new T.BoxGeometry(C.W * .9, C.H * .5, .6), bm, 0, by + C.H * .45, .3);
    if (kind === 'wolf') add(g, new T.BoxGeometry(C.W * 1.05, C.H * .5, C.L * .4), dm, 0, by + C.H * .3, .25);
    if (kind === 'deer') add(g, new T.BoxGeometry(.16, .7, .2), bm, 0, by + .38, C.L / 2 - .02, .45, 0);
    const head = new T.Group(); head.position.set(0, kind === 'deer' ? by + .75 : kind === 'bear' ? by + .2 : by + .1, C.L / 2 + (kind === 'deer' ? .25 : .15)); g.add(head); A.head = head;
    const hs = kind === 'bear' ? .5 : kind === 'boar' ? .38 : kind === 'wolf' ? .34 : .26;
    add(head, new T.BoxGeometry(hs, hs * .9, hs * 1.05), bm, 0, 0, 0);
    const sn = { wolf: [.16, .15, .3], boar: [.2, .18, .3], bear: [.22, .2, .26], deer: [.13, .13, .3] }[kind];
    add(head, new T.BoxGeometry(sn[0], sn[1], sn[2]), dm, 0, -hs * .12, hs * .5 + sn[2] / 2 - .05);
    [-1, 1].forEach(sd => {
      add(head, new T.SphereGeometry(.04, 6, 6), km, sd * hs * .36, hs * .12, hs * .38);
      add(head, new T.ConeGeometry(kind === 'bear' ? .09 : .07, kind === 'deer' ? .2 : .16, 5), bm, sd * hs * .32, hs * .55, -hs * .1, 0, -sd * .25);
      if (kind === 'boar') add(head, new T.ConeGeometry(.035, .16, 5), wm, sd * .1, -hs * .3, hs * .85, -.5, 0);
      if (kind === 'deer') { const an = add(head, new T.CylinderGeometry(.015, .025, .5, 5), dm, sd * .1, hs * .9, -.05, 0, -sd * .5); add(an, new T.CylinderGeometry(.01, .015, .22, 5), dm, 0, .1, .05, .5, 0); }
    });
    [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sz]) => { const lg = new T.Group(); lg.position.set(sx * C.W * .36, C.lh, sz * C.L * .36); add(lg, new T.CylinderGeometry(C.lw, C.lw * .8, C.lh, 6), kind === 'deer' ? dm : bm, 0, -C.lh / 2, 0); g.add(lg); A.legs.push(lg); });
    add(g, new T.BoxGeometry(.1, .1, kind === 'wolf' ? .5 : .15), dm, 0, by + C.H * .3, -C.L / 2 - (kind === 'wolf' ? .2 : .05), kind === 'wolf' ? .5 : 0);
    g.scale.setScalar(C.sc); return A;
  };
  const animals = [], popTxt = [], tmpA = new T.Vector3(); let kills = 0, hpShown = -1;
  Object.assign(myP, { hp: 100, maxhp: 100, dead: 0, deadT: 0, atkT: 0, hurtT: 0 });
  const hud = { hp: el.querySelector('#whp .hpb i'), t: el.querySelector('#whp .hpt'), kl: el.querySelector('#whp .kl'), dmg: el.querySelector('#wdmg'), dead: el.querySelector('#wdead') };
  const addPop = (x, y, z, txt, col) => { const d = document.createElement('div'); d.className = 'wtxt'; d.textContent = txt; d.style.color = col; el.appendChild(d); popTxt.push({ x, y, z, age: 0, d }); };
  const heal = n => { myP.hp = Math.min(myP.maxhp, myP.hp + n); };
  const place = a => { for (let i = 0; i < 40; i++) { const ang = Math.random() * 6.283, r = a.K.rmin + Math.random() * (a.K.rmax - a.K.rmin), x = Math.cos(ang) * r, z = Math.sin(ang) * r; if (!treeC.some(c => Math.hypot(c.x - x, c.z - z) < 1.8)) { a.x = x; a.z = z; return; } } a.x = a.K.rmin; a.z = 0; };
  const respawn = a => { a.hp = a.K.hp; a.st = 'wander'; a.dieT = 0; a.stun = 0; a.fleeT = 0; a.wt = 0; a.wind = 0; place(a); a.tx = a.x; a.tz = a.z; a.g.rotation.set(0, a.ry, 0); a.g.position.y = 0; };
  for (const [kind, K] of Object.entries(KIND)) for (let i = 0; i < K.n; i++) {
    const A = mkAnimal(kind), lab = document.createElement('div'); lab.className = 'an'; lab.innerHTML = `${K.name}<div class="hpb"><i></i></div>`; el.appendChild(lab); L.add(A.g);
    const C = LOOK[kind], a = { kind, K, A, g: A.g, lab, bar: lab.querySelector('i'), x: 0, z: 0, ry: Math.random() * 6.28, ph: Math.random() * 6, hh: (C.lh + C.H) * C.sc + .9, wind: 0, atkT: 0, flash: 0, hp: K.hp, st: 'wander', dieT: 0, resp: 0, stun: 0, fleeT: 0, wt: 0, tx: 0, tz: 0, growl: 0 };
    place(a); a.tx = a.x; a.tz = a.z; animals.push(a); }
  const hurtMe = (d, ax, az) => { if (myP.dead) return; myP.hp = Math.max(0, myP.hp - d); myP.hurtT = .35; sfx('hurt'); fxBurst(myP.x, 1.2, myP.z, '#ff3030', 10, 2.6, 2, 9, .5); addPop(myP.x, 2.3, myP.z, '-' + d, '#ff5a5a');
    const dx = myP.x - ax, dz = myP.z - az, l = Math.hypot(dx, dz) || 1; myP.x += dx / l * .6; myP.z += dz / l * .6; w.goto = null;
    if (myP.hp <= 0) { myP.dead = 1; myP.deadT = 3.2; sfx('die'); hud.dead.style.display = 'flex'; } };
  const dmgAnimal = a => { if (a.st === 'dead' || myP.dead || myP.room !== 0) return; const d = Math.hypot(a.x - myP.x, a.z - myP.z); if (d > 4.2) return;
    const crit = Math.random() < .15, dm = Math.round((16 + Math.random() * 9) * (crit ? 1.8 : 1)); a.hp -= dm; a.flash = .18; sfx('hit'); fxBurst(a.x, a.hh * .55, a.z, '#ffd27a', 12, 3.6, 2.6, 9, .45); fxBurst(a.x, a.hh * .55, a.z, '#ff4a3a', 6, 2.4, 2, 9, .5); addPop(a.x, a.hh, a.z, (crit ? '💥 ' : '') + dm, crit ? '#ffd400' : '#fff');
    const dx = a.x - myP.x, dz = a.z - myP.z, l = Math.hypot(dx, dz) || 1; a.x += dx / l * .7; a.z += dz / l * .7; a.stun = .25; a.wind = 0;
    if (a.hp <= 0) { a.st = 'dead'; a.dieT = 0; a.resp = 30; kills++; fxBurst(a.x, .6, a.z, '#a89a88', 26, 1.8, 1.6, 1.5, 1.1); hud.kl.textContent = '🐺 ' + kills; sfx('die'); const hv = a.kind === 'deer' ? 25 : 12; heal(hv); addPop(myP.x, 2.6, myP.z, '+' + hv + ' ❤️', '#7dff9a'); }
    else if (a.K.hostile) a.st = 'chase'; else { a.st = 'flee'; a.fleeT = 4; } };
  w.attack = () => {
    if (myP.dead || myP.seat >= 0 || myP.room !== 0 || myP.atkT > 0 || myP.sitK > .2) return;
    myP.atkT = .55; myP.em = '⚔️'; myP.emAt = performance.now() / 1000; sfx('swing'); sendEm('⚔️');
    let best = null, bd = 3.4; for (const a of animals) { if (a.st === 'dead') continue; const d = Math.hypot(a.x - myP.x, a.z - myP.z); if (d < bd) { bd = d; best = a; } }
    if (best) { myP.tr = Math.atan2(best.x - myP.x, best.z - myP.z); setTimeout(() => dmgAnimal(best), 150); }
    slashT = .22;
  };
  const animalsUpdate = (dt, t) => {
    const on = myP.room === 0; fxUpdate(dt);
    slash.position.set(myP.x, 1.25, myP.z); slash.rotation.y = myP.tr + Math.PI / 2; slash.material.opacity = slashT > 0 ? slashT / .22 * .85 : 0; slash.scale.setScalar(1 + (1 - Math.max(0, slashT) / .22) * .35); slashT = Math.max(0, slashT - dt);
    myP.atkT = Math.max(0, myP.atkT - dt); myP.hurtT = Math.max(0, myP.hurtT - dt);
    if (myP.dead) { myP.deadT -= dt; if (myP.deadT <= 0) { myP.dead = 0; myP.hp = myP.maxhp; hud.dead.style.display = 'none'; setRoom(0, true); sfx('door'); } }
    else if (myP.hp < myP.maxhp) heal(dt * (on && Math.hypot(myP.x, myP.z) < 9 ? 8 : 1.2));
    hud.dmg.style.opacity = myP.dead ? 0 : Math.max(myP.hurtT / .35, myP.hp < 30 ? .3 + Math.sin(t * 6) * .15 : 0);
    const hh = Math.ceil(myP.hp); if (hh !== hpShown) { hpShown = hh; hud.hp.style.width = myP.hp / myP.maxhp * 100 + '%'; hud.t.textContent = '❤️ ' + hh; }
    const safe = !on || myP.dead || Math.hypot(myP.x, myP.z) < 11;
    for (const a of animals) {
      if (!on) { a.lab.style.display = 'none'; continue; }
      const g = a.g, K = a.K;
      a.flash = Math.max(0, a.flash - dt); const fe = a.flash > 0 ? .8 : 0; a.A.mats.forEach(m => m.emissive.setRGB(fe, fe * .1, fe * .1));
      if (a.st === 'dead') {
        a.dieT += dt; g.rotation.set(0, a.ry, Math.min(1, a.dieT / .4) * 1.5); a.A.legs.forEach(l => l.rotation.x = .3);
        g.position.set(a.x, a.dieT > 6 ? -(a.dieT - 6) * .5 : 0, a.z); a.resp -= dt; if (a.resp <= 0) respawn(a); a.lab.style.display = 'none'; continue;
      }
      const dxp = myP.x - a.x, dzp = myP.z - a.z, dp = Math.hypot(dxp, dzp);
      a.atkT -= dt; a.fleeT = Math.max(0, a.fleeT - dt); a.stun = Math.max(0, a.stun - dt); a.growl -= dt;
      let sp = 0, face = a.ry;
      if (a.wind > 0) { a.wind -= dt; if (a.wind <= 0 && dp < K.rng + .8 && !myP.dead) hurtMe(Math.round(K.dmg * (.8 + Math.random() * .4)), a.x, a.z); }
      if (a.stun <= 0 && a.wind <= 0) {
        let want = 'wander';
        if (K.hostile) { if (!safe && (dp < K.aggro || (a.st === 'chase' && dp < K.aggro * 2.2))) want = 'chase'; }
        else if (dp < 11 || a.fleeT > 0) want = 'flee';
        if (want === 'chase' && a.st !== 'chase' && a.growl <= 0 && dp < 22) { sfx('growl'); a.growl = 6; }
        a.st = want;
        if (want === 'chase') { face = Math.atan2(dxp, dzp); if (dp > K.rng) sp = K.spd; else if (a.atkT <= 0) { a.atkT = K.cd; a.wind = .28; } }
        else if (want === 'flee') { face = Math.atan2(-dxp, -dzp); sp = K.spd; }
        else {
          a.wt -= dt;
          if (a.wt <= 0) { if (Math.random() < .4) { a.tx = a.x; a.tz = a.z; a.wt = 2 + Math.random() * 4; } else { const ang = Math.random() * 6.283, r = 6 + Math.random() * 10; a.tx = a.x + Math.cos(ang) * r; a.tz = a.z + Math.sin(ang) * r; a.wt = 5 + Math.random() * 6; } }
          if (Math.hypot(a.tx - a.x, a.tz - a.z) > .8) { face = Math.atan2(a.tx - a.x, a.tz - a.z); sp = K.spd * .3; }
        }
      }
      let dr = face - a.ry; while (dr > Math.PI) dr -= 6.2832; while (dr < -Math.PI) dr += 6.2832; a.ry += dr * Math.min(1, dt * (a.st === 'chase' ? 9 : 5));
      if (sp) { a.x += Math.sin(a.ry) * sp * dt; a.z += Math.cos(a.ry) * sp * dt; }
      collideLobby(a, .55); const fd = Math.hypot(a.x, a.z); if (fd < 11) { a.x *= 11 / fd; a.z *= 11 / fd; }
      a.ph += sp * dt * 3; const sw = sp ? Math.sin(a.ph) * (.35 + sp * .06) : 0, lg = a.A.legs; lg[0].rotation.x = sw; lg[3].rotation.x = sw; lg[1].rotation.x = -sw; lg[2].rotation.x = -sw;
      const lunge = a.wind > 0 ? Math.sin((1 - a.wind / .28) * Math.PI) : 0;
      g.position.set(a.x, sp ? Math.abs(Math.sin(a.ph)) * .05 : 0, a.z); g.rotation.set(lunge * .22, a.ry, 0);
      a.A.head.rotation.x = lunge * .5 + (a.st === 'wander' && !sp ? .15 + Math.sin(t + a.ph) * .12 : 0);
      tmpA.set(a.x, a.hh, a.z).project(cam); const show = tmpA.z < 1 && dp < 24; a.lab.style.display = show ? '' : 'none';
      if (show) { a.lab.style.left = (tmpA.x * .5 + .5) * innerWidth + 'px'; a.lab.style.top = (-tmpA.y * .5 + .5) * innerHeight + 'px'; a.bar.style.width = a.hp / K.hp * 100 + '%'; }
    }
    for (let i = popTxt.length - 1; i >= 0; i--) { const q = popTxt[i]; q.age += dt; if (q.age > 1.1) { q.d.remove(); popTxt.splice(i, 1); continue; }
      tmpA.set(q.x, q.y + q.age * 1.1, q.z).project(cam); q.d.style.display = tmpA.z < 1 ? '' : 'none'; q.d.style.left = (tmpA.x * .5 + .5) * innerWidth + 'px'; q.d.style.top = (-tmpA.y * .5 + .5) * innerHeight + 'px'; q.d.style.opacity = 1 - q.age / 1.1; }
  };

  /* ---------- döngü ---------- */
  const tmp = new T.Vector3(); const prompt = el.querySelector('#wprompt');
  const frame = () => {
    w.raf = requestAnimationFrame(frame); const dt = Math.min(.05, w.clock.getDelta()), t = w.clock.elapsedTime, F = w.fx;
    // kullanıcı listesi senkronu
    const vu = S.voice[call.chanId] || []; const ids = new Set(vu.map(u => u.id)); ids.add(me);
    for (const u of vu) getP(u.id); for (const [id, p] of players) if (!ids.has(id)) { p.lab.remove(); if (p.g) p.g.parent?.remove(p.g); players.delete(id); }
    // hareket
    let mx = 0, mz = 0; const K = w.keys, spd = w.keys.shift ? 6.6 : 4.2; if (K.w || K.arrowup) mz -= 1; if (K.s || K.arrowdown) mz += 1; if (K.a || K.arrowleft) mx -= 1; if (K.d || K.arrowright) mx += 1;
    if (myP.seat >= 30) { mx = mz = 0; w.goto = null; }
    const rising = myP.seat < 0 && myP.sitK > .3; if (rising || myP.dead) mx = mz = 0;
    if (mx || mz) { if (myP.seat >= 0) stand(); w.goto = null; const l = Math.hypot(mx, mz); mx /= l; mz /= l; const s = Math.sin(w.yaw), c = Math.cos(w.yaw); const wx = mx * c + mz * s, wz = -mx * s + mz * c; myP.x += wx * spd * dt; myP.z += wz * spd * dt; myP.tr = Math.atan2(wx, wz); myP.a = 1; }
    else if (w.goto && myP.seat < 0 && !rising && !myP.dead) { const gx = w.goto.x - myP.x, gz = w.goto.z - myP.z, d = Math.hypot(gx, gz); if (d < .15) { w.goto = null; myP.a = 0; } else { myP.x += gx / d * spd * dt; myP.z += gz / d * spd * dt; myP.tr = Math.atan2(gx, gz); myP.a = 1; } }
    else if (myP.seat < 0) myP.a = 0;
    if (myP.seat < 0) {
      if (myP.room === 0) collideLobby(myP, .35);
      else { myP.x = Math.max(-6.3, Math.min(6.3, myP.x)); myP.z = Math.max(-3.2, Math.min(4.9, myP.z)); }
    }
    if (myP.seat >= 0) { const st = seats.find(x => x.id === myP.seat); if (st) { const gk = Math.min(1, dt * 6); myP.x += (st.x - myP.x) * gk; myP.z += (st.z - myP.z) * gk; myP.tr = st.ry; } }
    myP.tx = myP.x; myP.tz = myP.z;
    // zıplama
    if (myP.vy !== 0 || myP.y > 0) { myP.vy -= 16 * dt; myP.y = Math.max(0, myP.y + myP.vy * dt); if (myP.y === 0) myP.vy = 0; }
    // adım sesi
    if (myP.a === 1 && myP.y === 0) { w.stepT -= dt; if (w.stepT <= 0) { w.stepT = .33; sfx('step'); if (myP.room === 0) fxBurst(myP.x, .05, myP.z, '#6a5236', 3, .7, .7, 2, .35); } } else w.stepT = 0;
    // portal
    const pr = myP.room === 0 ? F.portalL : F.portalH; const pd = Math.hypot(pr.position.x - myP.x, pr.position.z - myP.z);
    if (pd < 1.2 && myP.seat < 0 && !w.cool) { w.cool = 1; setRoom(myP.room === 0 ? 1 : 0); setTimeout(() => w.cool = 0, 1500); }
    // sahne efektleri
    if (myP.room === 0) {
      F.flames.forEach((f, i) => { f.scale.set(1 + Math.sin(t * 9 + i) * .12, 1 + Math.sin(t * 13 + i * 2) * .18, 1 + Math.cos(t * 11 + i) * .12); f.rotation.y = t * (1 + i); });
      F.fireL.intensity = 2.1 + Math.sin(t * 17) * .35 + Math.sin(t * 31) * .2;
      fireGlow.material.opacity = .5 + Math.sin(t * 13) * .07 + Math.sin(t * 7.3) * .05; fireGlow.scale.setScalar(7 + Math.sin(t * 9) * .35); ember.material.opacity = .8 + Math.sin(t * 11) * .12; groundGlow.material.opacity = .38 + Math.sin(t * 17) * .05;
      smoke.forEach(o => { const a = (t * .16 + o.ph) % 1; o.sp.position.set(Math.sin(o.ph * 40 + a * 3) * .5 + a * 1.2, 2.2 + a * 6, Math.cos(o.ph * 31) * .4); o.sp.scale.setScalar(.8 + a * 3.6); o.sp.material.opacity = .2 * Math.sin(a * Math.PI) * (1 - a * .3); });
      for (let i = 0; i < 70; i++) { F.pAge[i] += dt * (.35 + (i % 5) * .1); if (F.pAge[i] > 1) F.pAge[i] = 0; const a = F.pAge[i]; F.pPos[i * 3] = Math.sin(i * 12.9 + a * 4) * .5 * (1 - a * .4); F.pPos[i * 3 + 1] = .3 + a * 3.4; F.pPos[i * 3 + 2] = Math.cos(i * 7.7 + a * 3) * .5 * (1 - a * .4); }
      F.pg.attributes.position.needsUpdate = true;
      for (let i = 0; i < 40; i++) { const s = F.fSeed[i]; F.fPos[i * 3] += Math.sin(t * .6 + s[0]) * dt * .6; F.fPos[i * 3 + 1] += Math.cos(t * .9 + s[1]) * dt * .3; F.fPos[i * 3 + 2] += Math.cos(t * .5 + s[0]) * dt * .6; } F.fg.attributes.position.needsUpdate = true;
    }
    F.portalL.userData.ring.rotation.z = t; F.portalH.userData.ring.rotation.z = -t;
    // TV
    if (myP.room === 1) {
      w.tvT -= dt; if (w.tvT <= 0) { w.tvT = .09; const x = F.tvX; if (w.tvOn) {
        const bars = ['#fff', '#ff0', '#0ff', '#0f0', '#f0f', '#f00', '#00f']; const sh = Math.floor(t * 3) % 7;
        for (let i = 0; i < 7; i++) { x.fillStyle = bars[(i + sh) % 7]; x.fillRect(i * 46, 0, 46, 180); }
        x.fillStyle = 'rgba(0,0,0,.35)'; for (let y = 0; y < 180; y += 4) x.fillRect(0, y, 320, 2);
        x.fillStyle = '#000a'; x.fillRect(60, 70, 200, 44); x.fillStyle = '#fff'; x.font = 'bold 28px sans-serif'; x.textAlign = 'center'; x.fillText('VIBRA TV', 160, 102);
        for (let i = 0; i < 80; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * .3})`; x.fillRect(Math.random() * 320, Math.random() * 180, 3, 2); }
        F.tvLight.intensity = 1.6 + Math.random() * .8; F.tvLight.color.setHSL((t * .15) % 1, .8, .6);
      } else { x.fillStyle = '#05060a'; x.fillRect(0, 0, 320, 180); if (w.tvEl) { F.tvLight.intensity = 1.3 + Math.sin(t * 3) * .15; F.tvLight.color.set('#cfe3ff'); } else F.tvLight.intensity = 0; } F.tvTex.needsUpdate = true; }
    }
    animalsUpdate(dt, t); tableFx(dt, t);
    // oyuncular
    const sp = new Set(vu.filter(u => u.speaking).map(u => u.id));
    for (const p of players.values()) {
      const vis = p.room === myP.room;
      if (!p.g || p.g.userData.key !== JSON.stringify(outfitOf(p.id))) { if (p.g) p.g.parent?.remove(p.g); p.g = buildChar(outfitOf(p.id)); scene.add(p.g); }
      p.g.visible = vis; p.lab.style.display = vis ? '' : 'none'; if (!vis) continue;
      if (p.id !== me) { p.x += (p.tx - p.x) * Math.min(1, dt * 10); p.z += (p.tz - p.z) * Math.min(1, dt * 10); }
      let dr = p.tr - p.ry; while (dr > Math.PI) dr -= Math.PI * 2; while (dr < -Math.PI) dr += Math.PI * 2; p.ry += dr * Math.min(1, dt * 12);
      p.sitK = p.sitK || 0; p.sitK += Math.max(-dt * 1.8, Math.min(dt * 1.8, (p.seat >= 0 ? 1 : 0) - p.sitK)); const sk = p.sitK, kk = sk * sk * (3 - 2 * sk), isDead = p.id === me && myP.dead; const sy = isDead ? .3 : -.3 * kk + p.y * (1 - kk); p.g.position.set(p.x, sy, p.z); p.g.rotation.order = 'YXZ'; p.g.rotation.y = p.ry; p.g.rotation.x = isDead ? -1.45 : 0;
      const et = performance.now() / 1000 - p.emAt; if (p.g.userData) poseChar(p.g, sk > .6 ? 0 : (p.id === me ? p.a : (Math.hypot(p.tx - p.x, p.tz - p.z) > .05 ? 1 : 0)), t + p.id, et < 3 ? p.em : '', et, sk);
      tmp.set(p.x, sy + 2.25, p.z).project(cam); const vis2 = tmp.z < 1;
      p.lab.style.display = vis && vis2 ? '' : 'none'; p.lab.style.left = (tmp.x * .5 + .5) * innerWidth + 'px'; p.lab.style.top = (-tmp.y * .5 + .5) * innerHeight + 'px';
      const nm = (p.id === me ? S.me.username : userName(p.id)) + (p.id === me ? ' (sen)' : ''); const emHtml = et < 2 && p.em && p.em !== '⚔️' ? `<span class="em">${p.em.startsWith('tv') ? '' : p.em}</span>` : '';
      const html = esc(nm) + emHtml; if (p.lab._h !== html) { p.lab.innerHTML = html; p.lab._h = html; } p.lab.classList.toggle('sp', sp.has(p.id));
    }
    // okey botları: boş koltuklarda oturan karakterler
    { const os = OK.s; if (!w.botG) w.botG = [null, null, null, null];
      for (let i = 0; i < 4; i++) {
        const bid = os?.seats[i], bot = typeof bid === 'string' ? os.bots?.[bid] : null; let b = w.botG[i];
        if (!bot || myP.room !== 1) { if (b) { b.g.visible = false; b.lab.style.display = 'none'; } continue; }
        if (!b || b.id !== bid) {
          if (b) { scene.remove(b.g); b.lab.remove(); }
          const o = { ...defOutfit(bot.look), hat: [0, 4, 6, 8, 11, 0, 9][bot.look % 7], glasses: bot.look % 3 === 0 ? 2 : 0 };
          const lab = document.createElement('div'); lab.className = 'nm'; lab.textContent = bot.name; el.appendChild(lab);
          b = w.botG[i] = { id: bid, g: buildChar(o), lab }; scene.add(b.g);
        }
        const st = seats.find(x => x.id === 30 + i); b.g.visible = true; b.g.position.set(st.x, -.3, st.z); b.g.rotation.y = st.ry; poseChar(b.g, 2, t + i * 3, '', 9);
        tmp.set(st.x, 1.95, st.z).project(cam); b.lab.style.display = tmp.z < 1 ? '' : 'none';
        b.lab.style.left = (tmp.x * .5 + .5) * innerWidth + 'px'; b.lab.style.top = (-tmp.y * .5 + .5) * innerHeight + 'px'; b.lab.classList.toggle('sp', os.phase === 'play' && os.turn === i);
      } }
    // ambiyans
    const fd = myP.room === 0 ? Math.hypot(myP.x, myP.z) : 99; ambVol(myP.room === 0 ? Math.max(0, 1 - fd / 14) : 0, myP.room === 1 && w.tvOn ? Math.max(0, 1 - Math.hypot(myP.x, myP.z + 5) / 12) : 0);
    // ipucu
    let ph = ''; if (myP.seat >= 30) ph = ''; else if (myP.seat >= 0) ph = 'E: Kalk'; else { const s = nearSeat(); if (s) ph = s.okey ? 'E: Okey masasına otur 🎴' : 'E: Otur 🪑'; else if (nearTV()) ph = 'E: TV Kumandası 📺'; else if (pd < 3) ph = pr.userData.label; }
    prompt.style.display = ph ? 'block' : 'none'; prompt.textContent = ph;
    // kamera
    const okS = myP.seat >= 30; const cx = okS ? TC.x : myP.x, cz = okS ? TC.z : myP.z, cy = okS ? TY : 1.4 + myP.y * .5; const cd = w.dist, cp = w.pitch;
    cam.position.set(cx + Math.sin(w.yaw) * Math.cos(cp) * cd, cy + Math.sin(cp) * cd, cz + Math.cos(w.yaw) * Math.cos(cp) * cd);
    if (myP.room === 1) { cam.position.z = Math.min(cam.position.z, 5.0); cam.position.x = Math.max(-6.6, Math.min(6.6, cam.position.x)); cam.position.y = Math.min(cam.position.y, 3.9); if (okS) cam.position.y = Math.min(cam.position.y, 3.95); }
    cam.lookAt(cx, cy, cz);
    netSend(false); w.tvTick?.(dt);
    R.render(scene, cam);
  };
  frame();
}
window.__world = {
  open, close, editor, onOkey, reset: () => { TVS = { kind: 'off', url: '', owner: 0, playing: false, pos: 0, at: 0, rev: TVS.rev + 1, seek: false, by: 0 }; OK.s = null; OK.hand = []; OK.slots = Array(30).fill(null); OK.sel = null; },
  onNet: d => W?.onNet(d),
  onTv: d => { const was = TVS.kind !== 'off'; TVS = { kind: d.kind || 'off', url: d.url || '', owner: d.owner | 0, playing: !!d.playing, pos: +d.pos || 0, at: performance.now(), rev: TVS.rev + 1, seek: !!d.seek, by: d.by | 0 }; if (W) { if (!was && TVS.kind !== 'off') sfx('tvOn'); else if (was && TVS.kind === 'off') sfx('tvOff'); W.tvUI?.(); } },
  onLeft: id => { if (!W) return; const p = W.players.get(id); if (p) { p.lab.remove(); p.g?.parent?.remove(p.g); W.players.delete(id); } },
};
})();
