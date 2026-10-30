/* ── 신기능 #15 코디북: 내 옷장 옷으로 코디 판을 꾸미고 저장 · 공유 ──
   제안서 docs/proposals/패션북.md · 이슈 https://github.com/jincode93/DANGJANG/issues/15
   원본: 팀원 데모 Artemis-ignis/dangjang-demo (fe2cb70) source/app.html 의 패션북. 동작은 그대로 옮기고, 완료본과 맞물리는 곳만 고침
     - 화면 · 동작은 DJ.feature로 등록 (완료본 SCR · A를 직접 건드리지 않음)
     - 입구: 내 옷장 위 배너(closet.top) · 마이 메뉴(my.menu) · 옷 등록 완료 카드(reg.done)
     - 그린 뒤(after): 끌기 연결 · 첫 사용 안내 말풍선 · 알림 위치 · 되돌리기 버튼
     - "비슷한 핏 찾기"의 일치율(%)은 원본 계산(fitMatch) 그대로. 정의와 정책은 제안서에 더해 달라고 요청함(이슈 #15)
   데이터는 열어 둔 동안만 기억 (기기 저장 없음) */
(() => {
const SCRX = {}, AX = {};
// 원본 toast는 되돌리기 같은 버튼을 함께 받음. 완료본 toast는 글자만 받으므로 버튼은 after()에서 붙임
const toast = (t, act) => { window.toast(t); S.toastAct = act ? Object.assign({ t }, act) : null; };
/* ── 맞는 정도 계산: 상품 한 사이즈 vs 기준 옷 ── */
const FIT_TOL = { 어깨: 3, 가슴: 4, 소매: 5, 허리: 3, 엉덩이: 4, 허벅지: 3.5, 밑위: 3, 인심: 6, 총장: 6, 밑단: 4 }; // 부위마다 이만큼(cm) 차이 나면 0%
const FIT_WT = { 어깨: 2, 가슴: 2, 허리: 2, 엉덩이: 2, 허벅지: 1.5 }; // 몸에 닿는 부위일수록 비중을 크게
function fitMatch(names, a, b) { // a: 상품 치수 배열, b: 기준 옷 치수 배열 (같은 부위 순서). 비교할 칸이 둘 미만이면 null
  let sw = 0, ss = 0, n = 0, worst = null;
  names.forEach((nm, i) => { if (!a[i] || !b[i]) return; const w = FIT_WT[nm] || 1, d = a[i] - b[i], r = Math.abs(d) / (FIT_TOL[nm] || 5); sw += w; ss += w * Math.max(0, 1 - r); n++; if (!worst || r > worst.r) worst = { nm, d: +d.toFixed(1), r }; });
  return n < 2 ? null : { pc: Math.round(ss / sw * 100), worst, n };
}

/* ── 코디북: 옷장 옷으로 꾸미고 공유 ── */
const BK_W = 358, BK_H = 440;
const BK_BG = { paper: ['#F4F0E6', '종이'], sage: ['#E6EDE0', '연초록'], sky: ['#E3EAF3', '하늘'], white: ['#FFFFFF', '흰색'], butter: ['#F8EFC9', '버터'], blush: ['#F6E3E1', '분홍'], ink: ['#23272C', '밤'] };
const BK_STK = {
  flower: ['<svg viewBox="0 0 40 40"><g fill="#3E63D8"><circle cx="20" cy="9" r="7"/><circle cx="31" cy="17" r="7"/><circle cx="27" cy="30" r="7"/><circle cx="13" cy="30" r="7"/><circle cx="9" cy="17" r="7"/></g><circle cx="20" cy="20" r="5.5" fill="#F6D44B"/></svg>', '꽃', 46],
  star: ['<svg viewBox="0 0 40 40"><path d="M20 3l5 12 13 1-10 8.5 3.2 12.5L20 29l-11.2 8L12 24.5 2 16l13-1z" fill="#F6C945"/></svg>', '별', 40],
  heart: ['<svg viewBox="0 0 40 40"><path d="M20 35S4 26 4 14.5A8 8 0 0 1 20 11a8 8 0 0 1 16 3.5C36 26 20 35 20 35z" fill="#EF5B5B"/></svg>', '하트', 38],
  spark: ['<svg viewBox="0 0 40 40"><path d="M20 2c1.5 10 4 16 18 18-14 2-16.5 8-18 18-1.5-10-4-16-18-18 14-2 16.5-8 18-18z" fill="#2F5BEA"/></svg>', '반짝', 36],
  sun: ['<svg viewBox="0 0 40 40"><g stroke="#F59E0B" stroke-width="3" stroke-linecap="round"><path d="M20 3v5M20 32v5M3 20h5M32 20h5M8 8l3.5 3.5M28.5 28.5L32 32M8 32l3.5-3.5M28.5 11.5L32 8"/></g><circle cx="20" cy="20" r="9" fill="#FBBF24"/></svg>', '해', 44],
  cloud: ['<svg viewBox="0 0 48 32"><path d="M12 28a8 8 0 0 1-1-15.9A10 10 0 0 1 30 9a9 9 0 0 1 9 9 7 7 0 0 1-1 10z" fill="#fff" stroke="#9CA3AF" stroke-width="2" stroke-linejoin="round"/></svg>', '구름', 56],
  moon: ['<svg viewBox="0 0 40 40"><path d="M27 6a15 15 0 1 0 7 26A12 12 0 0 1 27 6z" fill="#FCD34D"/></svg>', '달', 38],
  smile: ['<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#FDE047" stroke="#EAB308" stroke-width="2"/><circle cx="14" cy="17" r="2" fill="#422006"/><circle cx="26" cy="17" r="2" fill="#422006"/><path d="M12 24c2 5 14 5 16 0" stroke="#422006" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>', '웃음', 42],
  bolt: ['<svg viewBox="0 0 40 40"><path d="M23 3L9 23h9l-3 14 16-22h-9z" fill="#FACC15" stroke="#CA8A04" stroke-width="1.5" stroke-linejoin="round"/></svg>', '번개', 36],
  crown: ['<svg viewBox="0 0 44 36"><path d="M4 30L2 10l12 9L22 4l8 15 12-9-2 20z" fill="#FBBF24" stroke="#B45309" stroke-width="2" stroke-linejoin="round"/><circle cx="2" cy="10" r="2.5" fill="#EF4444"/><circle cx="22" cy="4" r="2.5" fill="#EF4444"/><circle cx="42" cy="10" r="2.5" fill="#EF4444"/></svg>', '왕관', 48],
  bow: ['<svg viewBox="0 0 48 32"><path d="M24 16L5 5v22zM24 16l19-11v22z" fill="#F472B6" stroke="#BE185D" stroke-width="2" stroke-linejoin="round"/><circle cx="24" cy="16" r="5" fill="#EC4899" stroke="#BE185D" stroke-width="2"/></svg>', '리본', 52],
  leaf: ['<svg viewBox="0 0 40 40"><path d="M6 34C6 14 18 6 34 6c0 16-8 28-28 28z" fill="#4ADE80" stroke="#15803D" stroke-width="2" stroke-linejoin="round"/><path d="M8 32C16 24 22 18 30 10" stroke="#15803D" stroke-width="2" fill="none"/></svg>', '잎', 40],
  diamond: ['<svg viewBox="0 0 40 40"><path d="M20 4l14 10-14 22L6 14z" fill="#60A5FA" stroke="#1D4ED8" stroke-width="2" stroke-linejoin="round"/><path d="M6 14h28M14 14l6 22M26 14l-6 22" stroke="#1D4ED8" stroke-width="1.5" fill="none"/></svg>', '보석', 38],
  check: ['<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="#22C55E"/><path d="M11 20.5l6.5 6.5L29 14" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>', '체크', 36],
  arrow: ['<svg viewBox="0 0 56 36"><path d="M4 28C14 6 36 4 50 16" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M40 10l11 7-12 5" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>', '화살표', 60],
  ring: ['<svg viewBox="0 0 48 48"><ellipse cx="24" cy="24" rx="20" ry="16" stroke="#EF4444" stroke-width="3" fill="none"/></svg>', '동그라미', 64],
  line: ['<svg viewBox="0 0 60 14"><path d="M3 9C14 3 24 12 34 7S52 5 57 8" stroke="#F59E0B" stroke-width="4" fill="none" stroke-linecap="round"/></svg>', '밑줄', 70],
  bubble: ['<svg viewBox="0 0 56 40"><path d="M8 4h40a5 5 0 0 1 5 5v16a5 5 0 0 1-5 5H26l-9 8v-8H8a5 5 0 0 1-5-5V9a5 5 0 0 1 5-5z" fill="#fff" stroke="#111" stroke-width="2.4" stroke-linejoin="round"/></svg>', '말풍선', 64],
  tape: ['<svg viewBox="0 0 60 24"><rect x="1" y="2" width="58" height="20" fill="#E4D29A" opacity=".88"/></svg>', '테이프', 76],
  tapepk: ['<svg viewBox="0 0 60 24"><rect x="1" y="2" width="58" height="20" fill="#F9A8D4" opacity=".85"/></svg>', '분홍 테이프', 76],
  tag: ['<svg viewBox="0 0 64 28"><path d="M4 2h44l12 12-12 12H4z" fill="#111"/><circle cx="12" cy="14" r="2.5" fill="#fff"/><text x="22" y="18.5" font-size="11" font-weight="700" fill="#fff" font-family="Pretendard,sans-serif">NEW</text></svg>', 'NEW', 70],
  sale: ['<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="20" fill="#EF4444"/><text x="22" y="27" font-size="13" font-weight="800" fill="#fff" text-anchor="middle" font-family="Pretendard,sans-serif">SALE</text></svg>', 'SALE', 48],
  pane: ['<svg viewBox="0 0 150 200"><rect x="1.5" y="1.5" width="147" height="197" rx="12" fill="#fff" stroke="#E2E0D8" stroke-width="1.5"/></svg>', '카드', 150, 1],
  paneS: ['<svg viewBox="0 0 150 120"><rect x="1.5" y="1.5" width="147" height="117" rx="12" fill="#fff" stroke="#E2E0D8" stroke-width="1.5"/></svg>', '가로 카드', 140, 1],
  polaroid: ['<svg viewBox="0 0 150 186"><rect x="1" y="1" width="148" height="184" rx="3" fill="#fff" stroke="#E7E4DA"/><rect x="10" y="10" width="130" height="140" fill="#F1EFE8"/></svg>', '폴라로이드', 150, 1],
  arch: ['<svg viewBox="0 0 150 210"><path d="M1.5 75A73.5 73.5 0 0 1 148.5 75V208.5H1.5z" fill="#fff" stroke="#EBCFCB" stroke-width="1.5"/></svg>', '아치', 150, 1],
  discDk: ['<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="#343B43"/></svg>', '원', 200, 1],
  rule: ['<svg viewBox="0 0 120 3"><rect width="120" height="2" y=".5" fill="#2B2B2B"/></svg>', '선', 200, 1],
  bA: ['<svg viewBox="0 0 28 28"><circle cx="14" cy="14" r="14" fill="#2F5BEA"/><text x="14" y="19.5" font-size="15" font-weight="800" fill="#fff" text-anchor="middle" font-family="Pretendard,sans-serif">A</text></svg>', 'A', 30, 1],
  bB: ['<svg viewBox="0 0 28 28"><circle cx="14" cy="14" r="14" fill="#E5484D"/><text x="14" y="19.5" font-size="15" font-weight="800" fill="#fff" text-anchor="middle" font-family="Pretendard,sans-serif">B</text></svg>', 'B', 30, 1],
  slot: ['<svg viewBox="0 0 40 40"><g fill="none" stroke="#C4C8CF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a3 3 0 1 1 3 3c-2 0-3 1-3 3v1.5"/><path d="M20 19.5L5 30a2 2 0 0 0 1.2 3.6h27.6A2 2 0 0 0 35 30z"/></g></svg>', '빈 자리', 40, 1],
  vs: ['<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill="#2B2B2B"/><text x="22" y="27" font-size="14" font-weight="800" fill="#fff" text-anchor="middle" font-family="Pretendard,sans-serif">VS</text></svg>', 'VS', 44, 1],
  ootd: ['<svg viewBox="0 0 70 26"><rect x="2" y="2" width="66" height="22" rx="11" fill="#111"/><text x="35" y="18" font-size="13" font-weight="800" fill="#fff" text-anchor="middle" font-family="Pretendard,sans-serif" letter-spacing="1.5">OOTD</text></svg>', 'OOTD', 72],
  best: ['<svg viewBox="0 0 64 28"><rect x="2" y="2" width="60" height="24" fill="#2F5BEA"/><text x="32" y="19" font-size="12" font-weight="800" fill="#fff" text-anchor="middle" font-family="Pretendard,sans-serif">BEST</text></svg>', 'BEST', 66],
};
const BK_FONTS = [['Nanum Pen Script', '나눔 펜'], ['Gaegu', '개구'], ['Gamja Flower', '감자꽃'], ['Hi Melody', '하이멜로디'], ['Single Day', '싱글데이'], ['East Sea Dokdo', '동해 독도'], ['Jua', '주아'], ['Do Hyeon', '도현'], ['Black Han Sans', '블랙 한 산스'], ['Gowun Batang', '고운바탕'], ['Dongle', '동글'], ['Caveat', 'Caveat']]; // 무료 글꼴 (구글 글꼴)
const BK_COLORS = ['#2B2B2B', '#FFFFFF', '#E5484D', '#F5A524', '#17A34A', '#2F5BEA', '#7C3AED', '#EC4899'];const BK_SLOTS = [[104, 176, 158, -4], [262, 124, 124, 3], [250, 306, 134, -2], [92, 352, 112, 4], [184, 246, 100, -6], [304, 410, 90, 5], [76, 76, 88, -3]];
const BK_ROLE = { outer: [[100, 150, 150, -3], [96, 300, 128, 3]], top: [[262, 104, 116, 3], [256, 238, 112, -3], [160, 70, 100, -5]], bottom: [[100, 322, 104, 2], [196, 332, 96, -3], [300, 332, 92, 4]] }; // 종류별 자리: 가운데 x · y, 너비, 기울기
const BK_FEW = { 1: [[179, 236, 190, -3]], 2: [[112, 236, 152, -3], [252, 232, 144, 3]], 3: [[100, 200, 142, -3], [262, 150, 130, 3], [184, 350, 128, 2]] }; // 옷이 적을 때는 판을 채우도록 크게
const BK_SHARE = sv('<path d="M12 15V4M8 8l4-4 4 4M5 13v6h14v-6"/>', 20);
let bkN = 0;
const bkBooks = () => S.books || (S.books = []); // 저장한 코디북 (이 화면을 열어 둔 동안 유지)
const bkBlank = () => ({ id: 'b' + (++bkN), name: '코디북 ' + (bkBooks().length + 1), bg: 'paper', els: [], sel: null, z: 1, nid: 1, touched: false, at: Date.now() });
const bk = () => S.bd || (S.bd = bkBlank()); // 지금 꾸미는 코디북
const bkSnap = (b) => JSON.stringify({ n: b.name, bg: b.bg, e: b.els });
const bkDirty = () => !!S.bd && bkSnap(S.bd) !== S.bd0;
const bkSaved = () => !!S.bd && bkBooks().some((q) => q.id === S.bd.id);
function bkCommit() { // 지금 꾸미는 코디북을 목록에 저장
  const b = bk(); b.up = Date.now(); const copy = JSON.parse(JSON.stringify(b)); copy.sel = null;
  const arr = bkBooks(), i = arr.findIndex((q) => q.id === b.id); if (i >= 0) arr[i] = copy; else arr.unshift(copy); S.bd0 = bkSnap(b);
}
function bkPut(b, c) {
  if (b.els.some((e) => e.t === 'item' && e.ref === c.id)) return;
  const all = b.els.filter((e) => e.t === 'item'), same = all.filter((e) => e.cat === c.cat).length;
  const s = (BK_ROLE[c.cat] || [])[same] || BK_SLOTS[all.length % BK_SLOTS.length], o = (BK_ROLE[c.cat] || [])[same] ? 0 : Math.floor(all.length / BK_SLOTS.length) * 16;
  b.els.push({ id: 'e' + b.nid++, t: 'item', ref: c.id, cat: c.cat, x: s[0] + o, y: s[1] + o, w: s[2], r: s[3], z: b.z++ });
  bkAuto(b);
}
function bkAuto(b) { // 사용자가 손대기 전에는 옷 수에 맞춰 자리를 다시 잡음
  if (b.touched) return;
  const its = b.els.filter((e) => e.t === 'item'), cnt = {};
  its.forEach((e, i) => {
    let s; if (its.length <= 3) s = BK_FEW[its.length][i]; else { const k = cnt[e.cat] || 0; cnt[e.cat] = k + 1; s = (BK_ROLE[e.cat] || [])[k] || BK_SLOTS[i % BK_SLOTS.length] }
    e.x = s[0]; e.y = s[1]; e.w = s[2]; e.r = s[3];
  });
}
// 옷 그림: 배경이 있는 사진은 옷만 오려 냄 (측정 엔진의 상품 사진 오려 내기). 오려 내는 동안은 원래 사진을 보여 줌
const bkCut = {};
function bkSrc(c) { return bkCut[c.id] || (c.img ? (CUT[c.img] || IMG[c.img]) : null) }
function bkCutStart(c) {
  if (!c || !c.img || Object.prototype.hasOwnProperty.call(bkCut, c.id) || !window.NaranMeasure) return;
  const src = IMG[c.img]; bkCut[c.id] = null; if (!src || CUT[c.img] || /^data:image\/png/.test(src)) return;
  const im = new Image(); im.onload = () => { try { const r = NaranMeasure.cutProduct(im); const u = r.ok && !r.partial ? r.canvas.toDataURL('image/png') : bkEdgeCut(im); if (u) { bkCut[c.id] = u; if (/^book/.test(cur().s) && !S.ov) { saveY(); render() } } } catch (e) {} }; im.src = src;
}
function bkEdgeCut(im) { // 오려 내기가 안 될 때: 가장자리에서 시작해 배경색과 비슷한 부분을 지움 (한 가지 색 배경 사진용)
  const k = Math.min(1, 700 / Math.max(im.naturalWidth, im.naturalHeight)), W = Math.round(im.naturalWidth * k), H = Math.round(im.naturalHeight * k);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H), p = d.data, at = (x, y) => (y * W + x) * 4, bg = [[2, 2], [W - 3, 2], [2, H - 3], [W - 3, H - 3]].map(([x, y]) => [p[at(x, y)], p[at(x, y) + 1], p[at(x, y) + 2]]);
  const m = [0, 1, 2].map((i) => bg.reduce((a, c) => a + c[i], 0) / 4), spread = Math.max(...bg.map((c) => Math.hypot(c[0] - m[0], c[1] - m[1], c[2] - m[2])));
  if (spread > 40) return null; // 모서리 색이 제각각이면 한 가지 색 배경이 아님
  const tol = 34 + spread, seen = new Uint8Array(W * H), q = [];
  const near = (i) => Math.hypot(p[i] - m[0], p[i + 1] - m[1], p[i + 2] - m[2]) < tol;
  const push = (x, y) => { const j = y * W + x; if (!seen[j] && near(j * 4)) { seen[j] = 1; q.push(j) } };
  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1) } for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y) }
  while (q.length) { const j = q.pop(), x = j % W, y = (j / W) | 0; if (x > 0) push(x - 1, y); if (x < W - 1) push(x + 1, y); if (y > 0) push(x, y - 1); if (y < H - 1) push(x, y + 1) }
  let gone = 0; for (let j = 0; j < W * H; j++) if (seen[j]) { p[j * 4 + 3] = 0; gone++ }
  if (gone < W * H * 0.12 || gone > W * H * 0.92) return null; // 거의 안 지워졌거나 옷까지 지워짐
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const j = y * W + x; if (!seen[j] && (seen[j - 1] || seen[j + 1] || seen[j - W] || seen[j + W])) p[j * 4 + 3] = 150 } // 가장자리를 살짝 부드럽게
  g.putImageData(d, 0, 0); return cv.toDataURL('image/png');
}
const bkPic = (c) => { bkCutStart(c); const s = bkSrc(c); return s ? `<img src="${s}" alt="">` : `<span class="rkno">${I[c.cat] || ''}</span>` };
const bkThumb = (c) => { const s = bkSrc(c); return s ? `<img src="${s}" alt="" style="width:100%;height:100%;object-fit:contain">` : `<span style="display:flex;align-items:center;justify-content:center;height:100%;color:#B5B5B5">${I[c.cat] || ''}</span>` };
// 모델: 내 코디북 또는 링크로 받은 코디북 (읽기 전용)
function bkModel(sh, book) {
  if (sh) { const items = sh.items.map((c, i) => Object.assign({ id: 'sh' + i, notes: [] }, c)); return { els: sh.els.slice().sort((a, b) => a.z - b.z), bg: sh.bg, name: sh.name, bname: sh.bn || '', get: (e) => items[e.ref], items: sh.els.filter((e) => e.t === 'item').map((e) => items[e.ref]) }; }
  const bb = book || bk(), els = bb.els.filter((e) => e.t !== 'item' || S.closet.some((c) => c.id === e.ref)).sort((a, b) => a.z - b.z), get = (e) => S.closet.find((c) => c.id === e.ref);
  return { els, bg: bb.bg, name: S.user ? S.user.name : '', bname: bb.name, get, items: els.filter((e) => e.t === 'item').map(get) };
}
const bkEls = () => bkModel().els;
const bkItems = () => bkModel().items;
function bkEl(e, m, live) {
  const sel = live && bk().sel === e.id;
  let st = `left:${e.x}px;top:${e.y}px;z-index:${sel ? 9000 : e.z + 2};transform:translate(-50%,-50%) rotate(${e.r}deg);`, inner;
  if (e.t === 'item') { inner = bkPic(m.get(e)); st += `width:${e.w}px;` }
  else if (e.t === 'stk') { inner = BK_STK[e.k][0]; st += `width:${e.w}px;` }
  else { inner = esc(e.text); st += `font-size:${e.fs}px;font-family:'${e.font || 'Nanum Pen Script'}',cursive;color:${e.color || '#2B2B2B'};`; }
  return `<div class="bk-e ${e.t}${e.t === 'memo' && e.paper ? ' paper' : ''}${sel ? ' sel' : ''}" ${live ? `data-e="${e.id}"` : ''} style="${st}">${inner}${sel && !bk().view ? '<i class="bk-h" data-h="1"></i>' : ''}</div>`;
}
/* ── 코디북 템플릿: 첫 화면에서 완성된 룩(배경 · 글씨 · 스티커 포함)을 옷장 옷으로 바로 꾸며 줌 ── */
const bkAspC = {};
function bkAsp(c) { // 오려 낸 옷 그림의 세로/가로 비율 (PNG 머리글에서 읽음)
  if (bkAspC[c.id]) return bkAspC[c.id]; let a = c.cat === 'bottom' ? 2 : 1.15; const s = c.img && CUT[c.img];
  if (s && s.startsWith('data:image/png')) { try { const t = atob(s.slice(22, 58)), n = (i) => ((t.charCodeAt(i) << 24) | (t.charCodeAt(i + 1) << 16) | (t.charCodeAt(i + 2) << 8) | t.charCodeAt(i + 3)) >>> 0, w = n(16), hh = n(20); if (w && hh) a = hh / w } catch (e) {} }
  return (bkAspC[c.id] = a);
}
const bkTplDefs = [ // k 키 · n 이름 · d 설명 · bg 배경 · mk 요소 만들기 (옷은 넣지 않음. slot 은 미리보기에서만 보이는 빈 자리 표시)
  { k: 'daily', n: 'Daily Look', d: '상의와 하의를 한 화면에', bg: 'sage', mk: (tx, sk, slot) => [
    tx('Daily Look', 'Black Han Sans', '#2B2B2B', 179, 40, 32, 0), tx("TODAY'S OUTFIT", 'Caveat', '#4B5563', 179, 70, 19, 0), sk('rule', 179, 90, 300, 0),
    sk('pane', 98, 222, 156, -1), sk('pane', 260, 222, 156, 1), sk('tape', 98, 120, 56, -4), sk('tape', 260, 120, 56, 4),
    tx('TOP', 'Caveat', '#2B2B2B', 98, 348, 20, 0), tx('BOTTOM', 'Caveat', '#2B2B2B', 260, 348, 20, 0),
    tx('오늘의 선택', 'Gaegu', '#2B2B2B', 179, 401, 22, 0), ...slot([[98, 222], [260, 222]])] },
  { k: 'layer', n: '레이어드 데이', d: '아우터 위에 상의를 겹쳐서', bg: 'butter', mk: (tx, sk, slot) => [
    tx('layered', 'Caveat', '#2B2B2B', 179, 38, 40, -2), tx('아우터 · 상의 · 하의', 'Gaegu', '#6B5B2E', 179, 70, 18, 0),
    sk('pane', 108, 218, 190, 0), sk('paneS', 274, 160, 140, 0), sk('paneS', 274, 292, 140, 0), sk('tape', 108, 92, 60, -3),
    tx('OUTER', 'Caveat', '#2B2B2B', 108, 358, 20, 0), tx('TOP', 'Caveat', '#2B2B2B', 274, 232, 18, 0), tx('BOTTOM', 'Caveat', '#2B2B2B', 274, 364, 18, 0),
    tx('겹쳐 입는 순서', 'Gaegu', '#E5484D', 179, 408, 24, -2, true), ...slot([[108, 214], [274, 160], [274, 292]])] },
  { k: 'show', n: 'My Pick', d: '세 벌 나란히 표시', bg: 'paper', mk: (tx, sk, slot) => [
    tx('MY PICK', 'Caveat', '#2B2B2B', 92, 36, 38, -3), tx('this week', 'Caveat', '#2F5BEA', 292, 40, 24, 4),
    sk('polaroid', 98, 150, 150, -5), sk('tapepk', 98, 62, 56, -8), tx('OUTER', 'Caveat', '#2B2B2B', 98, 226, 18, -5),
    sk('polaroid', 262, 160, 150, 4), sk('tape', 262, 72, 56, 6), tx('TOP', 'Caveat', '#2B2B2B', 262, 236, 18, 4),
    sk('polaroid', 179, 340, 150, -1), sk('tapepk', 179, 252, 56, 3), tx('BOTTOM', 'Caveat', '#2B2B2B', 179, 416, 18, -1), ...slot([[98, 140], [262, 150], [179, 330]])] },
  { k: 'vs', n: 'A or B?', d: '두 벌 중 선택용 비교', bg: 'sky', mk: (tx, sk, slot) => [
    tx('A or B?', 'Black Han Sans', '#2B2B2B', 179, 42, 32, 0), tx('어떤 게 더 마음에 들어?', 'Gaegu', '#44506A', 179, 78, 20, 0),
    sk('pane', 98, 218, 150, 0), sk('pane', 260, 218, 150, 0), sk('bA', 36, 130, 30, 0), sk('bB', 322, 130, 30, 0), sk('vs', 179, 218, 44, 0),
    tx('투표는 댓글로!', 'Gaegu', '#2F5BEA', 179, 396, 26, -2, true), ...slot([[98, 218], [260, 218]])] },
  { k: 'night', n: 'Night Out', d: '한 벌 크게 표시', bg: 'ink', mk: (tx, sk, slot) => [
    tx('NIGHT OUT', 'Caveat', '#FFFFFF', 179, 46, 44, -2), tx('SAT · 9 PM', 'Gaegu', '#C9CED6', 179, 84, 19, 0), sk('moon', 312, 56, 34, 10), sk('star', 52, 112, 22, -8),
    sk('discDk', 179, 238, 280, 0), sk('spark', 318, 356, 26, 0), tx('오늘 밤 룩', 'Gaegu', '#FFFFFF', 179, 400, 24, -2), ...slot([[179, 238]])] },
  { k: 'pick', n: '오늘의 한 벌', d: '오늘 입을 한 벌을 크게', bg: 'blush', mk: (tx, sk, slot) => [
    tx('오늘의 한 벌', 'Jua', '#2B2B2B', 179, 40, 32, -2), tx("TODAY'S PICK", 'Caveat', '#B45F58', 179, 70, 20, 0),
    sk('arch', 179, 238, 200, 0), sk('crown', 179, 102, 34, 0), sk('tag', 280, 150, 66, 8), tx('내가 고른 옷', 'Gaegu', '#2B2B2B', 179, 404, 24, 0, true), ...slot([[179, 250]])] },
];
function bkTplBuild(def, prev) { // 템플릿을 요소 목록으로. prev 면 미리보기용 빈 자리 표시를 함께 그림
  let n = 0; const id = () => 't' + (n++);
  const tx = (text, font, color, x, y, fs, r, paper) => ({ id: id(), t: 'memo', text, font, color, paper: !!paper, x, y, fs, r, z: n });
  const sk = (k, x, y, w, r) => ({ id: id(), t: 'stk', k, x, y, w, r, z: n });
  const slot = (pts) => prev ? pts.map(([x, y]) => sk('slot', x, y, 44, 0)) : [];
  return def.mk(tx, sk, slot).map((e, i) => Object.assign(e, { z: i + 1 }));
}
function bkTplPage() { // 템플릿 고르는 화면 (큰 미리보기). 옷은 없고 틀 · 글씨 · 스티커 · 배경만
  return '<div class="bk-tp"><div class="bk-tt">템플릿 선택</div><div class="bk-tg">' + bkTplDefs.map((d) => '<button data-a="bookTpl" data-x="' + d.k + '" aria-label="' + d.n + ' 템플릿">' + bookCanvas(false, null, { els: bkTplBuild(d, true), bg: d.bg }) + '<b>' + d.n + ' (템플릿)</b><small>' + d.d + '</small></button>').join('') + '</div></div>';
}
function bookCanvas(live, sh, book) {
  const m = bkModel(sh, book);
  return `<div class="bk" ${live ? 'id="bk"' : ''} style="background-color:${BK_BG[m.bg][0]}"><div class="bk-st">${m.els.map((e) => bkEl(e, m, live)).join('')}</div></div>`;
}
function bookBanner() {
  const n = bkBooks().length, its = (S.closet.some((c) => c.fit === 'good') ? S.closet.filter((c) => c.fit === 'good') : S.closet).filter((c) => c.img).slice(0, 3), rot = [-8, 2, 10];
  return `<button class="bk-ban" data-a="bookOpen"><span class="th">${its.map((c, i) => `<span style="left:${i * 17}px;transform:rotate(${rot[i]}deg)">${bkPic(c)}</span>`).join('')}</span><span class="t"><b>내 코디북</b><small>${n ? `저장한 코디북 ${n}개 · 새로 만들기 또는 이어서 꾸미기` : '옷장 옷으로 코디 꾸미기 · 저장 · 공유'}</small></span>${I.chev}</button>`;
}
function bookPromo(pp) {
  const ids = pp.ids && pp.ids.length ? pp.ids : S.closet.slice(-pp.n).map((c) => c.id), its = ids.map((id) => S.closet.find((c) => c.id === id)).filter(Boolean).slice(0, 4);
  if (!its.length) return '';
  const step = its.length > 1 ? Math.min(24, 46 / (its.length - 1)) : 0;
  return `<div class="bk-promo"><span class="th" style="width:${Math.round(46 + step * (its.length - 1) + 6)}px">${its.map((c, i) => `<span style="left:${Math.round(i * step)}px;transform:rotate(${[-8, 3, -2, 9][i]}deg)">${bkPic(c)}</span>`).join('')}</span><div style="flex:1;min-width:0"><b>코디북에 넣기</b><small>방금 등록한 옷으로 코디 꾸미기 · 공유 가능</small><button class="btn" style="height:40px;font-size:14px;margin-top:10px" data-a="bookFrom" data-x="${its.map((c) => c.id).join(',')}">코디북 꾸미기</button></div></div>`;
}
const SIM_MIN = 70, SIM_MAX = 6; // 이 일치율(%) 이상만, 최대 이 개수까지
function bkSim(c) { // 이 옷과 실측이 가까운 상품 (같은 종류의 치수 칸끼리, 이미 가진 상품 제외). 70% 이상이 없으면 가까운 순 3개
  const have = new Set(S.closet.map((x) => x.img).filter(Boolean)), pk = c.pk || pkOf(c.cat, c.sub), names = PARTS[pk] || []; // 완료본 옷장 옷에는 pk가 없어 세부 종류로 치수 양식을 찾음
  const all = P.filter((p) => p.sizes && pkOf(p.cat, p.sub) === pk && !have.has(p.img))
    .map((p) => { let best = null; for (const k of Object.keys(p.sizes)) { const fm = fitMatch(names, p.sizes[k], c.m); if (!fm || fm.worst.r > 2 || fm.n < 3) continue; if (!best || fm.pc > best.pc) best = { p, k, pc: fm.pc, worst: fm.worst } } return best })
    .filter(Boolean).sort((a, b) => b.pc - a.pc || (b.p.rev || 0) - (a.p.rev || 0));
  const hi = all.filter((x) => x.pc >= SIM_MIN).slice(0, SIM_MAX);
  return hi.length ? hi : all.filter((x) => x.pc >= 55).slice(0, 3).map((x) => Object.assign(x, { near: true }));
}
function bookPickHtml() {
  const on = new Set(bkItems().map((c) => c.id));
  return `<div class="grab"></div><div style="font-size:19px;font-weight:800;letter-spacing:-.02em">코디북에 넣을 옷</div><div style="font-size:13px;color:var(--sub);margin-top:4px">눌러서 넣기·빼기 · ${on.size}벌 선택</div>
    <div class="bk-pick">${S.closet.map((c) => `<button class="${on.has(c.id) ? 'on' : ''}" data-a="bookToggle" data-x="${c.id}"><div class="img">${bkThumb(c)}</div>${on.has(c.id) ? '<i>✓</i>' : ''}</button>`).join('')}</div>
    <button class="btn" style="margin-top:16px" data-a="closeOv">완료</button>`;
}
const BK_HELP = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.2 1-1.2 1.8"/><circle cx="12" cy="16.8" r=".7" fill="currentColor"/></svg>';
const BK_TOUR = [ // 코디북 처음 쓰는 사람에게 4단계로 안내. sel 은 강조할 곳, at 은 말풍선 위치(up 위 · down 아래 · in 안쪽)
  { sel: ['.bk-add button:nth-child(1)'], at: 'up', t: '옷 넣기', d: '옷 아이콘을 눌러 옷장에서 옷을 골라 넣기' },
  { sel: ['#bk'], at: 'in', t: '배치와 편집', d: '옷을 끌면 이동 · 모서리 점을 끌면 크기와 각도 조절 · 한 번 누르면 메뉴' },
  { sel: ['.bk-add button:nth-child(n+2)'], at: 'up', t: '꾸미기', d: '글씨 · 스티커 · 배경 · 템플릿으로 꾸미기' },
  { sel: ['.bar .btn'], at: 'up', t: '저장', d: '완성하면 저장 · 저장한 코디북은 링크나 이미지로 공유 가능' },
];
const bkTourSeen = () => { try { return localStorage.getItem('dangjang.bktour') === '1' } catch (e) { return false } };
const bkTourMark = () => { try { localStorage.setItem('dangjang.bktour', '1') } catch (e) {} };
function bkTourDraw() { // render 가 화면을 다 그린 뒤 호출: 강조 영역과 말풍선을 얹는다
  const st = S.tour, T = BK_TOUR[st.step]; if (!T) { S.tour = null; return }
  const els = T.sel.flatMap((q) => [...view.querySelectorAll(q)]); if (!els.length) { S.tour = null; return }
  els[0].scrollIntoView({ block: 'nearest' });
  const vr = view.getBoundingClientRect(), k = vr.width / view.offsetWidth || 1, rs = els.map((e) => e.getBoundingClientRect());
  const L = Math.min(...rs.map((r) => r.left)), Tp = Math.min(...rs.map((r) => r.top)), R = Math.max(...rs.map((r) => r.right)), B = Math.max(...rs.map((r) => r.bottom));
  const x = (L - vr.left) / k, y = (Tp - vr.top) / k, w = (R - L) / k, h = (B - Tp) / k, pad = 6, last = st.step === BK_TOUR.length - 1;
  const o = document.createElement('div'); o.className = 'tour';
  const cx1 = Math.max(0, x - pad), cy1 = Math.max(0, y - pad), cx2 = Math.min(view.offsetWidth, x + w + pad), cy2 = Math.min(view.offsetHeight, y + h + pad); // 강조 자리만 뚫은 어두운 막(그림자 번짐 대신 clip-path 로 가볍게)
  o.innerHTML = '<div class="tdim" style="clip-path:polygon(evenodd,0 0,100% 0,100% 100%,0 100%,0 0,' + cx1 + 'px ' + cy1 + 'px,' + cx1 + 'px ' + cy2 + 'px,' + cx2 + 'px ' + cy2 + 'px,' + cx2 + 'px ' + cy1 + 'px,' + cx1 + 'px ' + cy1 + 'px)"></div><div class="tspot" style="left:' + (x - pad) + 'px;top:' + (y - pad) + 'px;width:' + (w + pad * 2) + 'px;height:' + (h + pad * 2) + 'px"></div>' +
    '<div class="tbub"><div class="th"><span class="tc">' + (st.step + 1) + ' / ' + BK_TOUR.length + '</span>' + (last ? '' : '<button class="tskip" data-a="tourSkip">건너뛰기</button>') + '</div><b>' + T.t + '</b><p>' + T.d + '</p>' +
    '<div class="tf"><span class="tdots">' + BK_TOUR.map((_, i) => '<i class="' + (i === st.step ? 'on' : '') + '"></i>').join('') + '</span><button class="tn" data-a="tourNext">' + (last ? '시작하기' : '다음') + '</button></div><i class="tar"></i></div>';
  view.appendChild(o);
  const bub = o.querySelector('.tbub'), ar = o.querySelector('.tar'), bh = bub.offsetHeight, vh = view.offsetHeight;
  let top, arrow = T.at !== 'in';
  if (T.at === 'in') top = y + h - bh - 14; else { top = y - pad - bh - 14; if (top < 70) { top = y + h + pad + 14; ar.dataset.p = 'top' } else ar.dataset.p = 'bottom' }
  top = Math.max(70, Math.min(top, vh - bh - 12)); bub.style.top = top + 'px';
  if (!arrow) ar.style.display = 'none'; else { const ax = Math.max(26, Math.min(x + w / 2 - 16, view.offsetWidth - 16 - 26 - 16)); ar.style.left = ax + 'px'; if (ar.dataset.p === 'top') ar.style.top = '-8px'; else ar.style.bottom = '-8px' }
}
const BK_ICO = { // 도구 아이콘 (선 아이콘, 글씨 없음)
  item: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 3L3 6l2 4 2.5-1v12h9V9l2.5 1 2-4-5.5-3a3.5 3.5 0 0 1-7 0z"/></svg>',
  text: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7V5h14v2M12 5v14M9 19h6"/></svg>',
  stk: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5h12a2.5 2.5 0 0 1 2.5 2.5v8.5L14.5 20.5H6A2.5 2.5 0 0 1 3.5 18V6A2.5 2.5 0 0 1 6 3.5z"/><path d="M20.5 14.5h-4.2a1.8 1.8 0 0 0-1.8 1.8v4.2"/><path d="M10 7.8l.9 1.9 2.1.3-1.5 1.5.4 2.1-1.9-1-1.9 1 .4-2.1L7 10l2.1-.3z"/></svg>',
  bg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.2c-5 0-9 3.7-9 8.5 0 4.7 3.9 8.3 8.4 8.3 1.4 0 2.1-.9 2.1-1.9 0-.6-.3-1.1-.6-1.5-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8H18a3 3 0 0 0 3-3C21 6.2 17 3.2 12 3.2z"/><circle cx="7.6" cy="11.2" r="1.1" fill="currentColor" stroke="none"/><circle cx="10.2" cy="7.4" r="1.1" fill="currentColor" stroke="none"/><circle cx="14.6" cy="7.6" r="1.1" fill="currentColor" stroke="none"/></svg>',
  tpl: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M3 9.5h18M10 9.5V21"/></svg>' };
SCRX.book = () => {
  const b = bk(), m = bkModel(), sel = m.els.find((e) => e.id === b.sel), its = m.items, vw = !!b.view, saved = bkSaved() && !bkDirty();
  const tb = (a, t, cls = '', x = '') => `<button class="${cls}" data-a="${a}"${x ? ` data-x="${x}"` : ''}>${t}</button>`;
  const tp = !vw && !!b.tplOpen; // 템플릿 버튼을 눌러 연 화면
  const bar = tp ? '<button class="btn line" data-a="bookTplClose">닫기</button>' : vw ? `<button class="btn line" style="flex:.9" data-a="bookSave">이미지 저장</button><button class="btn" style="flex:1.1" data-a="bookEditMode">수정하기</button>` : `<button class="btn" data-a="bookSaveBook">${saved ? '저장됨' : '저장'}</button>`;
  const row = vw ? '' : `<div class="bk-sel">${sel && b.menu === sel.id ? `${tb('bookFront', '맨 앞으로')}${tb('bookBackZ', '맨 뒤로')}${sel.t === 'memo' ? tb('bookTextEdit', '글꼴·색') : ''}${tb('bookDel', '삭제', 'del')}${tb('bookMenuOff', '닫기')}` : ''}</div>
    <div class="bk-add">${[['bookPick', 'item', '옷 넣기'], ['bookMemoOpen', 'text', '글씨 넣기'], ['bookStkOpen', 'stk', '스티커 붙이기'], ['bookBgOpen', 'bg', '배경 바꾸기'], ['bookTplOpen', 'tpl', '템플릿 고르기']].map(([a, k, l]) => `<button data-a="${a}" aria-label="${l}" title="${l}">${BK_ICO[k]}</button>`).join('')}</div>`;
  return { node: '⑤ 내 코디북 · 보기 → 이미지 저장하기 · 수정하기 → 저장 · 공유하기 · 비슷한 핏 찾기', bar, body: `<div class="hdr"><button data-a="bookBack" aria-label="닫기">${I.close}</button>${vw ? `<span class="t" style="max-width:210px;overflow:hidden;text-overflow:ellipsis">${esc(b.name)}</span>` : `<button class="t" data-a="bookRename" style="max-width:210px;overflow:hidden;text-overflow:ellipsis">${esc(b.name)} <span style="font-size:13px;color:var(--sub)">✎</span></button>`}<span class="icons">${vw ? '' : `<button data-a="bookHelp" aria-label="도움말" title="도움말">${BK_HELP}</button>`}<button data-a="bookShare" aria-label="공유하기">${BK_SHARE}</button></span></div>
    ${tp ? bkTplPage() : `<div class="pad" style="padding-top:4px">${bookCanvas(true)}</div>
    ${row}`}
    ${tp ? '' : `<div class="sec"><h3>코디북 속 옷<small>${its.length}</small></h3></div>`}
    <div class="pad">${tp ? '' : its.length ? its.map((c) => `<div class="bk-row"><div class="img">${bkThumb(c)}</div><div class="i"><b>${esc(c.name)}</b><span>${esc(c.size)} · ${CAT[c.cat]}${c.sub ? ' · ' + esc(c.sub) : ''}</span></div><button class="s" data-a="bookSim" data-x="${c.id}">비슷한 핏 찾기</button></div>`).join('') : `<div class="bk-none"><div class="ei">${BK_ICO.item}</div><b>아직 넣은 옷 없음</b><span>옷장의 옷을 넣어 코디 만들기</span>${vw ? '' : '<button data-a="bookPick">옷장에서 고르기</button>'}</div>`}</div>
    <div style="height:30px"></div>` };
};
SCRX.bookList = () => {
  const bs = bkBooks(), fmt = (t) => { const d = new Date(t); return `${d.getMonth() + 1}월 ${d.getDate()}일` }, sl = S.bsel, ids = sl ? sl.ids : [];
  const right = bs.length ? (sl ? '<button class="tx" data-a="bookSelOff">취소</button>' : '<button class="tx" data-a="bookSelOn">선택</button>') : '';
  const bar = sl ? `<button class="btn" style="${ids.length ? 'background:var(--sale)' : 'opacity:.35'}" data-a="bookDelSelAsk">${ids.length ? ids.length + '개 삭제' : '삭제할 코디북 선택'}</button>` : `<button class="btn" data-a="bookNew">＋ 새 코디북 만들기</button>`;
  return { node: '⑤ 내 코디북 모아보기 → 열기 · 공유(썸네일) · 선택해서 삭제', bar, body: `${hdrBack('내 코디북', right)}
    ${bs.length ? `<div class="bkg">${bs.map((b) => { const on = ids.includes(b.id); return `<div class="bkc${on ? ' on' : ''}"><button class="th" data-a="${sl ? 'bookPickSel' : 'bookEdit'}" data-x="${b.id}">${bookCanvas(false, null, b)}</button>${sl ? `<span class="ck">${on ? I.check : ''}</span>` : `<button class="shr" data-a="bookShareId" data-x="${b.id}" aria-label="공유하기">${BK_SHARE}</button>`}<div class="mt"><button class="nm" data-a="${sl ? 'bookPickSel' : 'bookEdit'}" data-x="${b.id}"><b>${esc(b.name)}</b><small>옷 ${b.els.filter((e) => e.t === 'item').length}벌 · ${fmt(b.up || b.at)}</small></button></div></div>`; }).join('')}</div>`
    : `<div class="empty"><div class="big">${I.hanger}</div><h4>저장한 코디북 없음</h4><p>옷장 옷으로 코디를 꾸며 저장해 두면<br>여기에 표시</p></div>`}` };
};
SCRX.bookDone = () => ({ node: '⑤ 내 코디북 · 공유하기 → 이미지 저장 · 링크 복사', bar: `<button class="btn line" style="flex:.9" data-a="bookCopy">링크 복사</button><button class="btn" style="flex:1.2" data-a="bookSave">이미지 공유</button>`, body: `${hdrBack('공유하기')}
  <div class="pad" style="padding-top:4px">${bookCanvas(false)}</div>
  <div class="pad"><div style="font-size:16px;font-weight:800;margin-top:20px;letter-spacing:-.02em">받는 사람은 링크로 열람 가능</div>
    <div style="font-size:13.5px;color:var(--ink2);margin-top:6px;line-height:1.55">링크를 열면 룩과 옷별 사이즈 확인 가능 · 받는 사람도 자기 옷장을 만들어 내 옷과 비교 가능</div>
    <button class="btn line" style="margin-top:16px;height:46px;font-size:14.5px" data-a="bookView">받는 사람 화면 미리 보기</button></div>` });
SCRX.bookView = (pp = {}) => {
  const m = bkModel(pp.shared), its = m.items;
  return { node: pp.shared ? '⑤ 링크로 받은 코디북 → 옷장 만들기 유도' : '⑤ 내 코디북 · 받는 사람이 링크로 여는 화면 → 옷장 만들기 유도', bar: `<button class="btn" data-a="bookCta">내 옷장 만들고 비교하기</button>`, body: `<div class="hdr">${pp.shared ? '<span style="width:24px"></span>' : `<button data-a="back" aria-label="뒤로">${I.back}</button>`}<span class="t">${LOGO('#06BC51', 84)}</span><span class="icons"><span style="width:24px"></span></span></div>
  <div class="pad" style="padding-top:2px"><div style="font-size:13px;color:var(--sub)">${esc(m.name)}님의 코디북</div>${m.bname ? `<div style="font-size:20px;font-weight:800;letter-spacing:-.02em;margin-top:2px">${esc(m.bname)}</div>` : ''}</div>
  <div class="pad" style="padding-top:8px">${bookCanvas(false, pp.shared)}</div>
  <div class="sec"><h3>이 룩에 쓴 옷<small>${its.length}</small></h3></div>
  <div class="pad">${its.map((c) => { const ps = PARTS[c.pk || pkOf(c.cat, c.sub)] || []; return `<div class="bk-row" style="align-items:flex-start"><div class="img" style="height:62px">${bkThumb(c)}</div><div class="i"><b>${esc(c.name)}</b><span style="display:block;margin:2px 0 6px">사이즈 ${esc(c.size)} · ${CAT[c.cat]}${c.sub ? ' · ' + esc(c.sub) : ''}</span>${ps.slice(0, 3).map((p, i) => c.m && c.m[i] > 0 ? `<span class="bk-chip">${p} ${c.m[i]}cm</span>` : '').join('')}</div></div>` }).join('')}</div><div style="height:20px"></div>` };
};
// 링크: 코디북 내용을 주소 뒤에 담음 (서버에 저장하지 않음). 사진을 직접 올린 옷은 그림 없이 이름 · 사이즈만 담김
function bkLink() {
  const m = bkModel(), idx = {}, items = [];
  m.els.forEach((e) => { if (e.t === 'item' && !(e.ref in idx)) { const c = m.get(e); idx[e.ref] = items.length; items.push(c.pid && PB[c.pid] ? { pid: c.pid, size: c.size } : { name: c.name, size: c.size, cat: c.cat, sub: c.sub || null, pk: c.pk || null, m: c.m, img: c.img && !/^data:/.test(c.img) ? c.img : null }) } });
  const data = { v: 1, name: m.name, bn: m.bname, bg: m.bg, items, els: m.els.map((e) => e.t === 'item' ? { t: 'item', ref: idx[e.ref], x: e.x, y: e.y, w: e.w, r: e.r, z: e.z } : Object.assign({}, e, { id: undefined })) };
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(data)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return location.origin + location.pathname + '#book=' + b64;
}
function bkClean(d) { // 링크로 받은 내용은 믿지 않고 허용된 값만 남김
  const num = (v, a, b, def) => { v = +v; return isFinite(v) ? Math.max(a, Math.min(b, v)) : def };
  const own = (o, k) => typeof k === 'string' && Object.prototype.hasOwnProperty.call(o, k);
  const items = d.items.slice(0, 40).map((c) => { if (c && typeof c.pid === 'string' && own(PB, c.pid)) { const p = PB[c.pid], sz = String(c.size || ''); return { name: p.name, brand: p.brand, size: sz.slice(0, 12), cat: p.cat, sub: p.sub, pk: null, m: p.sizes && p.sizes[sz] ? p.sizes[sz].slice() : [], img: p.img }; } return { name: String(c.name || '').slice(0, 60), size: String(c.size || '').slice(0, 12), cat: own(CAT, c.cat) ? c.cat : 'top', sub: typeof c.sub === 'string' ? c.sub.slice(0, 20) : null, pk: own(PARTS, c.pk) ? c.pk : null, m: Array.isArray(c.m) ? c.m.slice(0, 8).map((v) => num(v, 0, 300, 0)) : [], img: own(IMG0, c.img) || own(CUT, c.img) ? c.img : null }; });
  const els = d.els.slice(0, 80).map((e) => {
    if (!e || typeof e !== 'object') return null;
    const b = { t: e.t, x: num(e.x, -50, 420, 100), y: num(e.y, -50, 500, 100), r: num(e.r, -180, 180, 0), z: num(e.z, 0, 9999, 1) };
    if (e.t === 'item') return items[e.ref | 0] ? Object.assign(b, { ref: e.ref | 0, w: num(e.w, 30, 320, 100) }) : null;
    if (e.t === 'stk') return own(BK_STK, e.k) ? Object.assign(b, { k: e.k, w: num(e.w, 20, 320, 40) }) : null;
    if (e.t === 'memo') return Object.assign(b, { text: String(e.text || '').slice(0, 30), font: BK_FONTS.some((f) => f[0] === e.font) ? e.font : 'Nanum Pen Script', color: BK_COLORS.includes(e.color) ? e.color : '#2B2B2B', paper: !!e.paper, fs: num(e.fs, 12, 60, 26) });
    return null;
  }).filter(Boolean);
  return { v: 1, name: String(d.name || '').slice(0, 20), bn: String(d.bn || '').slice(0, 20), bg: own(BK_BG, d.bg) ? d.bg : 'paper', items, els };
}
function bkFromHash() {
  try { const m = /^#book=([\w-]+)$/.exec(location.hash); if (!m) return null; const s = decodeURIComponent(escape(atob(m[1].replace(/-/g, '+').replace(/_/g, '/')))), d = JSON.parse(s); return d && d.v === 1 && Array.isArray(d.els) && Array.isArray(d.items) && BK_BG[d.bg] ? bkClean(d) : null } catch (e) { return null }
}
async function bookPng() {
  const m = bkModel(), K = 2, cv = document.createElement('canvas'); cv.width = BK_W * K; cv.height = BK_H * K;
  const g = cv.getContext('2d'), rad = (d) => d * Math.PI / 180;
  const load = (src) => new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = src });
  const svgSrc = (s, w, h) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s.replace('<svg', `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"`));
  try { await Promise.all(m.els.filter((e) => e.t === 'memo').map((e) => document.fonts.load(`600 30px "${e.font || 'Nanum Pen Script'}"`))) } catch (x) {}
  g.fillStyle = BK_BG[m.bg][0]; g.fillRect(0, 0, cv.width, cv.height);
  for (const e of m.els) {
    g.save(); g.translate(e.x * K, e.y * K); g.rotate(rad(e.r));
    if (e.t === 'memo') {
      g.font = `600 ${e.fs * K}px "${e.font || 'Nanum Pen Script'}", cursive`; const w = g.measureText(e.text).width, h = e.fs * 1.15 * K, pw = e.paper ? 11 * K : 0, ph = e.paper ? 6 * K : 0;
      if (e.paper) { g.shadowColor = 'rgba(0,0,0,.14)'; g.shadowBlur = 6 * K; g.shadowOffsetY = 3 * K; g.fillStyle = '#FFF8C7'; g.fillRect(-(w + 2 * pw) / 2, -(h + 2 * ph) / 2, w + 2 * pw, h + 2 * ph); g.shadowColor = 'transparent' }
      g.fillStyle = e.color || '#2B2B2B'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText(e.text, 0, K);
    } else {
      let im;
      if (e.t === 'stk') { const s = BK_STK[e.k][0], vb = s.match(/viewBox="0 0 (\d+) (\d+)"/); im = await load(svgSrc(s, 160, Math.round(160 * vb[2] / vb[1]))) }
      else { const c = m.get(e), src = bkSrc(c); if (!src) { g.restore(); continue } try { im = await load(src) } catch (x) { g.restore(); continue } }
      const w = e.w * K, h = w * (im.height / im.width);
      if (e.t === 'item') { g.shadowColor = 'rgba(0,0,0,.2)'; g.shadowBlur = 7 * K; g.shadowOffsetY = 5 * K }
      g.drawImage(im, -w / 2, -h / 2, w, h);
    }
    g.restore();
  }
  return new Promise((ok) => cv.toBlob(ok, 'image/png'));
}
function bkFitH() { const cv = app.querySelector('#bk'), ba = app.querySelector('.bk-add'), bar = app.querySelector('.bar'); if (!cv || !ba || !bar) return; cv.style.width = ''; cv.style.margin = ''; const cr = cv.getBoundingClientRect(), gap = ba.getBoundingClientRect().top - cr.bottom, avail = bar.getBoundingClientRect().top - cr.top - gap - ba.offsetHeight - 6; if (avail > 240 && cv.offsetWidth * 440 / 358 > avail) { cv.style.width = Math.floor(avail * 358 / 440) + 'px'; cv.style.margin = '0 auto' } } // 폰 화면이 낮으면 판을 줄여 도구줄이 처음부터 보이게
function bkScale() { bkFitH(); app.querySelectorAll('.bk').forEach((cv) => { const st = cv.firstElementChild; if (st && cv.clientWidth) st.style.transform = `scale(${cv.clientWidth / BK_W})` }) } // 폰 폭에 맞춰 판 전체를 줄임
window.addEventListener('resize', () => setTimeout(bkScale));
function bindBook() { // 코디북 판 위에서 옷 · 메모 · 스티커를 끌어 옮김. 안 움직이고 떼면 선택
  bkScale();
  const cv = app.querySelector('#bk'); if (!cv) return;
  const b = bk();
  const fitIn = (el) => { const e = b.els.find((q) => q.id === el.dataset.e), h = el.offsetHeight, w = el.offsetWidth; if (!e || !h) return; // 판 밖으로 나간 옷은 안쪽으로
    const y = Math.round(Math.max(h / 2 + 6, Math.min(BK_H - h / 2 - 6, e.y))), x = Math.round(Math.max(Math.min(w / 2, 60) + 6, Math.min(BK_W - Math.min(w / 2, 60) - 6, e.x)));
    if (y !== e.y || x !== e.x) { e.y = y; e.x = x; el.style.top = y + 'px'; el.style.left = x + 'px' } };
  cv.querySelectorAll('.bk-e.item').forEach((el) => { const im = el.querySelector('img'); if (im && !im.complete) im.addEventListener('load', () => fitIn(el)); else fitIn(el) });
  if (b.view) return; // 보기 상태에서는 고칠 수 없음
  const fitBack = (e, el) => { // 판 밖으로 나간 요소를 안쪽으로 (이미지 저장에서도 같은 모양)
    const w = Math.min(el.offsetWidth, BK_W - 12) / 2, hh = Math.min(el.offsetHeight, BK_H - 12) / 2; if (e.t !== 'memo') e.w = Math.min(e.w, BK_W - 12);
    e.x = Math.round(Math.max(w + 4, Math.min(BK_W - w - 4, e.x))); e.y = Math.round(Math.max(hh + 4, Math.min(BK_H - hh - 4, e.y)));
  };
  cv.addEventListener('pointerdown', (ev) => {
    const el = ev.target.closest('.bk-e'); if (!el) { if (b.sel) { b.sel = null; b.menu = null; saveY(); render() } return }
    const e = b.els.find((q) => q.id === el.dataset.e); if (!e) return;
    ev.preventDefault(); try { el.setPointerCapture(ev.pointerId) } catch (x) {}
    const k = cv.getBoundingClientRect().width / BK_W, sx = ev.clientX, sy = ev.clientY, ox = e.x, oy = e.y; let moved = false, longed = false, tm = null;
    if (ev.target.dataset && ev.target.dataset.h) { // 모서리 점: 끌어서 크기 · 각도 조절
      const rc = el.getBoundingClientRect(), cx = rc.left + rc.width / 2, cy = rc.top + rc.height / 2, d0 = Math.max(10, Math.hypot(sx - cx, sy - cy)), a0 = Math.atan2(sy - cy, sx - cx), w0 = e.w, f0 = e.fs, r0 = e.r;
      const rs = (m) => { const d = Math.hypot(m.clientX - cx, m.clientY - cy), f = d / d0; b.touched = true;
        if (e.t === 'memo') { e.fs = Math.round(Math.max(14, Math.min(60, f0 * f))); el.style.fontSize = e.fs + 'px' } else { e.w = Math.round(Math.max(36, Math.min(320, w0 * f))); el.style.width = e.w + 'px' }
        let r = r0 + (Math.atan2(m.clientY - cy, m.clientX - cx) - a0) * 180 / Math.PI; r = ((r + 540) % 360) - 180; if (Math.abs(r) < 5) r = 0; e.r = Math.round(r); el.style.transform = `translate(-50%,-50%) rotate(${e.r}deg)` };
      const ru = () => { el.removeEventListener('pointermove', rs); el.removeEventListener('pointerup', ru); el.removeEventListener('pointercancel', ru); fitBack(e, el); saveY(); render() };
      el.addEventListener('pointermove', rs); el.addEventListener('pointerup', ru); el.addEventListener('pointercancel', ru); return;
    }
    tm = setTimeout(() => { if (!moved) { longed = true; b.sel = e.id; b.menu = e.id; saveY(); render() } }, 450); // 꾹 누르면 메뉴
    const mv = (m) => { const dx = (m.clientX - sx) / k, dy = (m.clientY - sy) / k; if (!moved && Math.hypot(dx, dy) < 6) return; moved = true; clearTimeout(tm); b.touched = true; e.x = Math.round(Math.max(8, Math.min(BK_W - 8, ox + dx))); e.y = Math.round(Math.max(8, Math.min(BK_H - 8, oy + dy))); el.style.left = e.x + 'px'; el.style.top = e.y + 'px' };
    const up = () => { clearTimeout(tm); el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); if (longed) return; if (moved) { fitBack(e, el); b.sel = e.id; if (b.menu !== e.id) b.menu = null } else { b.sel = e.id; b.menu = e.id } /* 끌어서 옮긴 뒤에는 메뉴 없이 선택만 */ saveY(); render() };
    el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  });
}

app.addEventListener('input', (e) => { if (e.target.dataset.in === 'search') { const p = cur().p; p.q = e.target.value; clearTimeout(A.qh); A.qh = setTimeout(() => { const pos = e.target.selectionStart; render(); const q = document.getElementById('q'); if (q) { q.focus(); q.setSelectionRange(pos, pos) } }, 250) } });
/* ── 코디북 동작 ── */
const bkDraft = () => { const el = app.querySelector('#bkMemo'); if (el) S.bkd.text = el.value; return S.bkd }; // 입력칸의 글씨를 임시 상태로 옮기고 돌려줌
function bookTextHtml() {
  const d = bkDraft();
  return `<div class="grab"></div><div style="font-size:19px;font-weight:800;letter-spacing:-.02em">${d.edit ? '글꼴 · 색 바꾸기' : '글씨 넣기'}</div>
    <input class="tin" id="bkMemo" maxlength="30" placeholder="넣을 글씨" value="${esc(d.text)}" style="margin-top:12px;font-size:19px;font-family:'${d.font}',sans-serif;color:${d.color === '#FFFFFF' ? '#999' : d.color}">
    <div class="bk-fonts">${BK_FONTS.map(([f, n]) => `<button class="${f === d.font ? 'on' : ''}" data-a="bookFont" data-x="${f}" style="font-family:'${f}',sans-serif">${n}</button>`).join('')}</div>
    <div class="bk-cols">${BK_COLORS.map((c) => `<button class="${c === d.color ? 'on' : ''}" data-a="bookColor" data-x="${c}" style="background:${c}" aria-label="색"></button>`).join('')}</div>
    <button class="bk-ptg ${d.paper ? 'on' : ''}" data-a="bookPaper"><span>메모지 바탕</span><i></i></button>
    <button class="btn" style="margin-top:10px" data-a="bookMemoAdd">${d.edit ? '적용' : '넣기'}</button>`;
}
const bkSelEl = () => { const b = bk(); return b.els.find((e) => e.id === b.sel) };
const bookBgHtml = () => `<div class="grab"></div><div style="font-size:19px;font-weight:800;letter-spacing:-.02em">배경</div><div class="bk-bgs">${Object.entries(BK_BG).map(([k, v]) => `<button class="${bk().bg === k ? 'on' : ''}" style="background:${v[0]}" data-a="bookBg" data-x="${k}" aria-label="${v[1]}"></button>`).join('')}</div><button class="btn" style="margin-top:20px" data-a="closeOv">완료</button>`;
Object.assign(AX, {
  bookOpen() { go('book') },
  bookFrom(x) { const b = bk(); x.split(',').forEach((id) => { const c = S.closet.find((q) => q.id === id); if (c) bkPut(b, c) }); go('book') },
  bookPick() { sheet(bookPickHtml()); S.ov.node = '⑤ 내 코디북 · 넣을 옷 고르기'; render() },
  bookToggle(id) {
    const b = bk(), i = b.els.findIndex((e) => e.t === 'item' && e.ref === id);
    if (i >= 0) { if (b.sel === b.els[i].id) b.sel = null; b.els.splice(i, 1); bkAuto(b) } else bkPut(b, S.closet.find((c) => c.id === id));
    S.ov.html = bookPickHtml(); render();
  },
  bookMemoOpen() { S.bkd = { text: '', font: 'Nanum Pen Script', color: '#2B2B2B', paper: false, edit: null }; sheet(bookTextHtml()); S.ov.node = '⑤ 내 코디북 · 글씨 넣기 (글꼴 · 색 · 메모지)'; render() },
  bookTextEdit() { const e = bkSelEl(); if (!e || e.t !== 'memo') return; S.bkd = { text: e.text, font: e.font || 'Nanum Pen Script', color: e.color || '#2B2B2B', paper: !!e.paper, edit: e.id }; sheet(bookTextHtml()); S.ov.node = '⑤ 내 코디북 · 글꼴 · 색 바꾸기'; render() },
  bookFont(f) { bkDraft().font = f; S.ov.html = bookTextHtml(); render() },
  bookColor(c) { bkDraft().color = c; S.ov.html = bookTextHtml(); render() },
  bookPaper() { const d = bkDraft(); d.paper = !d.paper; S.ov.html = bookTextHtml(); render() },
  bookMemoAdd() {
    const d = bkDraft(); if (!d.text.trim()) { toast('넣을 글씨 입력'); render(); return }
    const b = bk();
    if (d.edit) { const e = b.els.find((q) => q.id === d.edit); if (e) Object.assign(e, { text: d.text.trim(), font: d.font, color: d.color, paper: d.paper }); closeOv(); render(); return }
    const n = b.els.filter((e) => e.t === 'memo').length, p = [[179, 70], [112, 410], [252, 196], [92, 250]][n % 4];
    const e = { id: 'e' + b.nid++, t: 'memo', text: d.text.trim(), font: d.font, color: d.color, paper: d.paper, x: p[0], y: p[1], fs: d.paper ? 24 : 30, r: [-4, 3, -3, 5][n % 4], z: b.z++ }; b.els.push(e); b.sel = e.id; closeOv(); render();
  },
  bookStkOpen() { sheet(`<div class="grab"></div><div style="font-size:19px;font-weight:800;letter-spacing:-.02em">스티커</div><div class="bk-stks">${Object.entries(BK_STK).filter(([, v]) => !v[3]).map(([k, v]) => `<button data-a="bookStkAdd" data-x="${k}">${v[0]}${v[1]}</button>`).join('')}</div>`); S.ov.node = '⑤ 내 코디북 · 스티커'; render() },
  bookStkAdd(k) { const b = bk(), n = b.els.length, e = { id: 'e' + b.nid++, t: 'stk', k, x: 120 + (n * 47) % 150, y: 90 + (n * 61) % 200, w: BK_STK[k][2], r: [-10, 8, -4, 12][n % 4], z: b.z++ }; b.els.push(e); b.sel = e.id; closeOv(); render() },
  bookBgOpen() { sheet(bookBgHtml()); S.ov.node = '⑤ 내 코디북 · 배경'; render() },
  bookBg(k) { bk().bg = k; S.ov.html = bookBgHtml(); render() },
  bookGrow(f) { const e = bkSelEl(); if (!e) return; bk().touched = true; f = +f; if (e.t === 'memo') e.fs = Math.round(Math.max(14, Math.min(46, e.fs * f))); else e.w = Math.round(Math.max(36, Math.min(300, e.w * f))); saveY(); render() },
  bookRot() { const e = bkSelEl(); if (!e) return; bk().touched = true; e.r = ((e.r + 12 + 180) % 360) - 180; saveY(); render() },
  bookFront() { const e = bkSelEl(), b = bk(); if (!e) return; e.z = ++b.z; saveY(); render() },
  bookDel() { const b = bk(); b.els = b.els.filter((e) => e.id !== b.sel); b.sel = null; saveY(); render() },
  bookSim(id) {
    const c = S.closet.find((q) => q.id === id), list = bkSim(c);
    sheet(`<div class="grab"></div><div style="font-size:19px;font-weight:800;letter-spacing:-.02em">${esc(c.name)} ${esc(c.size)}</div><div style="font-size:13px;color:var(--sub);margin-top:4px">${list.length && list[0].near ? '70% 이상 맞는 상품이 없어 가까운 순으로 표시' : '치수가 비슷한 순서'}</div>
      ${list.length ? `<div class="bk-sim">${list.map((x) => `<button data-a="bookGoP" data-x="${x.p.id}"><div class="img"><img src="${CUT[x.p.img] || IMG[x.p.img]}" class="cut" alt=""></div><div class="br" style="margin-top:8px">${x.p.brand}</div><div class="nm">${x.p.name}</div><span class="pc">${x.pc}% 일치</span><span class="df" style="color:var(--ink);font-weight:700;font-size:12.5px">사이즈 ${x.k}</span></button>`).join('')}</div>` : `<div style="font-size:14px;color:var(--ink2);margin:18px 0 6px;line-height:1.5">비슷한 상품 아직 없음</div>`}
      <button class="btn line" style="margin-top:18px" data-a="closeOv">닫기</button>`);
    S.ov.node = '⑤ 내 코디북 · 이 옷과 비슷한 핏 상품 → 상품 상세'; render();
  },
  bookGoP(id) { closeOv(); A.detail(id) },
  bookShare() { go('bookDone') },
  bookView() { go('bookView') },
  bookCta() {
    if (cur().p && cur().p.shared) { try { history.replaceState(null, '', location.pathname) } catch (x) {} reset('guest'); nav = [{ s: 'home', p: {} }]; render(true); return }
    toast('링크를 받은 사람은 여기서 옷장 만들기 가능'); render();
  },
  async bookCopy() {
    const url = bkLink();
    try { await navigator.clipboard.writeText(url); toast('링크 복사 완료 · 열면 이 코디북 확인 가능') } catch (x) {
      const t = document.createElement('textarea'); t.value = url; t.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(t); t.select(); let ok = false; try { ok = document.execCommand('copy') } catch (y) {} t.remove();
      if (ok) toast('링크 복사 완료 · 열면 이 코디북 확인 가능');
      else { modal(`<h4>링크 복사 실패</h4><p>아래 링크를 길게 눌러 직접 복사</p><input id="lnk" readonly value="${esc(url)}" onfocus="this.select()" style="width:100%;height:44px;margin-top:12px;padding:0 12px;border:1px solid var(--line);border-radius:10px;font-size:13px"><div class="mb"><button class="btn" data-a="closeOv">확인</button></div>`); }
    }
    render();
  },
  async bookSave() {
    try {
      const blob = await bookPng(), f = new File([blob], 'my-fashionbook.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [f] })) await navigator.share({ files: [f], title: '내 코디북' });
      else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'my-fashionbook.png'; document.body.appendChild(a); a.click(); a.remove(); toast('이미지 저장 완료'); render() }
    } catch (err) { if (err && err.name === 'AbortError') return; toast('이미지 생성 실패 · 잠시 후 다시 시도'); render() }
  },
});

/* ── 코디북 여러 개: 저장 · 수정 · 모아보기 ── */
const bkRenameHtml = (name) => `<div class="grab"></div><div style="font-size:19px;font-weight:800;letter-spacing:-.02em">코디북 이름</div><input class="tin" id="bkName" maxlength="20" value="${esc(name)}" placeholder="예) 가을 출근룩" style="margin-top:14px"><button class="btn" style="margin-top:14px" data-a="bookRenameOk">저장하기</button>`;
Object.assign(AX, {
  bookOpen() { go('bookList') },
  bookNew() { S.bd = bkBlank(); S.bd0 = bkSnap(S.bd); go('book') },
  bookEdit(id) { closeOv(); const b = bkBooks().find((q) => q.id === id); if (!b) return; S.bd = JSON.parse(JSON.stringify(b)); S.bd.sel = null; S.bd0 = bkSnap(S.bd); go('book') },
  bookFrom(x) { const b = bkBlank(); S.bd = b; x.split(',').forEach((id) => { const c = S.closet.find((q) => q.id === id); if (c) bkPut(b, c) }); S.bd0 = ''; go('book'); if (!bkTourSeen()) { bkTourMark(); S.tour = { step: 0 }; render() } }, // 방금 담은 옷으로 새 코디북 (저장 전). 처음이면 사용 안내도 띄움
  bookBack() {
    if (bk().tplOpen) { bk().tplOpen = false; render(); return }
    if (!bkDirty()) { S.bd = null; back(); return }
    modal('<h4>저장하지 않고 나가기</h4><p>수정 내용 삭제</p><div class="mb"><button class="btn line" data-a="bookDiscard">나가기</button><button class="btn" data-a="bookSaveBack">저장 후 나가기</button></div>'); S.ov.node = '⑤ 내 코디북 · 저장 안 한 변경이 있나? → 예 · 저장 확인'; render();
  },
  bookDiscard() { closeOv(); S.bd = null; back() },
  bookSaveBook() { bkCommit(); toast('코디북 저장 완료'); saveY(); render() },
  bookSaveBack() { bkCommit(); closeOv(); S.bd = null; back(); toast('코디북 저장 완료') },
  bookRename() { S.bren = { id: null }; sheet(bkRenameHtml(bk().name)); S.ov.node = '⑤ 내 코디북 · 이름 바꾸기'; render() },
  bookRenameSaved(id) { const b = bkBooks().find((q) => q.id === id); if (!b) return; S.bren = { id }; sheet(bkRenameHtml(b.name)); S.ov.node = '⑤ 내 코디북 모아보기 · 이름 바꾸기'; render() },
  bookRenameOk() {
    const v = ((app.querySelector('#bkName') || {}).value || '').trim(); if (!v) { toast('이름 입력'); render(); return }
    if (S.bren && S.bren.id) { const b = bkBooks().find((q) => q.id === S.bren.id); if (b) b.name = v } else bk().name = v;
    closeOv(); saveY(); render();
  },
  bookMenu(id) {
    const b = bkBooks().find((q) => q.id === id); if (!b) return;
    const row = (a, t, red) => `<button class="opt" data-a="${a}" data-x="${id}" style="margin-bottom:8px${red ? ';color:var(--sale)' : ''}"><span style="flex:1;font-size:16px;font-weight:700">${t}</span></button>`;
    sheet(`<div class="grab"></div><div style="font-size:18px;font-weight:800;margin-bottom:14px">${esc(b.name)}</div>${row('bookEdit', '열어서 고치기')}${row('bookRenameSaved', '이름 바꾸기')}${row('bookShareId', '공유하기')}${row('bookDup', '복제하기')}${row('bookDelAsk', '삭제하기', true)}`);
    S.ov.node = '⑤ 내 코디북 모아보기 · 더 보기 (고치기 · 이름 · 공유 · 복제 · 삭제)'; render();
  },
  bookDup(id) { const b = bkBooks().find((q) => q.id === id); if (!b) return; const c = JSON.parse(JSON.stringify(b)); c.id = 'b' + (++bkN); c.name = b.name + ' 복사본'; c.at = c.up = Date.now(); bkBooks().unshift(c); closeOv(); toast('복제 완료'); render() },
  bookDelAsk(id) { const b = bkBooks().find((q) => q.id === id); if (!b) return; modal(`<h4>코디북 삭제</h4><p>${esc(b.name)} 삭제 후 복구 불가</p><div class="mb"><button class="btn line" data-a="closeOv">취소</button><button class="btn" style="background:var(--sale)" data-a="bookDelOk" data-x="${id}">삭제</button></div>`); S.ov.node = '⑤ 내 코디북 모아보기 · 삭제 확인'; render() },
  bookDelOk(id) { S.books = bkBooks().filter((q) => q.id !== id); closeOv(); toast('삭제 완료'); render() },
  bookShareId(id) { closeOv(); const b = bkBooks().find((q) => q.id === id); if (!b) return; S.bd = JSON.parse(JSON.stringify(b)); S.bd.sel = null; S.bd0 = bkSnap(S.bd); go('bookDone') },
  bookShare() { if (!bkModel().els.length) { toast('옷이나 글씨를 넣은 뒤 공유'); render(); return } bkCommit(); go('bookDone') },
});
Object.assign(AX, {
  bookNew() { S.bd = bkBlank(); S.bd0 = bkSnap(S.bd); S.bsel = null; go('book'); if (!bkTourSeen()) { bkTourMark(); S.tour = { step: 0 }; render() } },
  bookHelp() { S.tour = { step: 0 }; render() },
  tourNext() { if (!S.tour) return; if (S.tour.step >= BK_TOUR.length - 1) S.tour = null; else S.tour.step++; render() },
  tourSkip() { S.tour = null; render() },
  bookEdit(id) { closeOv(); const b = bkBooks().find((q) => q.id === id); if (!b) return; S.bd = JSON.parse(JSON.stringify(b)); S.bd.sel = null; S.bd.menu = null; S.bd.view = true; S.bd0 = bkSnap(S.bd); S.bsel = null; go('book') }, // 열면 보기 상태, 수정하기를 눌러야 고침
  bookEditMode() { const b = bk(); b.view = false; b.sel = null; b.menu = null; render() },
  bookSaveBook() { bkCommit(); const b = bk(); b.view = true; b.sel = null; b.menu = null; toast('코디북 저장 완료'); saveY(); render() },
  bookTpl(k) { // 템플릿 적용: 꾸밈(글씨 · 스티커)과 배경을 바꾸고, 이미 넣은 옷은 그대로 둔다
    const b = bk(), def = bkTplDefs.find((d) => d.k === k); if (!def) return;
    const had = b.els.some((e) => e.t !== 'item'), keep = b.els.filter((e) => e.t === 'item');
    S.undoTpl = { els: JSON.parse(JSON.stringify(b.els)), bg: b.bg, z: b.z, nid: b.nid };
    const fresh = bkTplBuild(def, false).map((e) => Object.assign(e, { id: 'e' + b.nid++, z: b.z++ })); keep.forEach((e) => { e.z = b.z++; });
    b.els = fresh.concat(keep); b.bg = def.bg; b.tplOpen = false; b.touched = true; b.sel = null; b.menu = null; saveY();
    if (had || keep.length) toast('템플릿 적용 완료', { a: 'undoTpl', label: '되돌리기' }); else toast('템플릿 적용 완료'); render();
  },
  undoTpl() { const u = S.undoTpl, b = S.bd; if (u && b) { b.els = u.els; b.bg = u.bg; b.touched = true; b.sel = null; b.menu = null; S.undoTpl = null; S.toast = null; S.toastAct = null; toast('되돌리기 완료'); } render() },
  bookTplOpen() { const b = bk(); b.tplOpen = true; b.sel = null; b.menu = null; render() },
  bookTplClose() { bk().tplOpen = false; render() },
  bookMenuOff() { const b = bk(); b.menu = null; b.sel = null; render() }, // 닫기: 선택도 풀기
  bookBackZ() { const e = bkSelEl(), b = bk(); if (!e) return; e.z = Math.min(...b.els.map((q) => q.z)) - 1; b.menu = null; b.touched = true; saveY(); render() },
  bookFront() { const e = bkSelEl(), b = bk(); if (!e) return; e.z = ++b.z; b.menu = null; b.touched = true; saveY(); render() },
  bookDel() { const b = bk(); S.undoEl = b.els.find((e) => e.id === b.sel) || null; b.els = b.els.filter((e) => e.id !== b.sel); b.sel = null; b.menu = null; b.touched = true; saveY(); if (S.undoEl) toast('삭제 완료', { a: 'undoEl', label: '되돌리기' }); render() },
  bookOpen() { S.bsel = null; go('bookList') },
  bookSelOn() { S.bsel = { ids: [] }; render() },
  bookSelOff() { S.bsel = null; render() },
  bookPickSel(id) { const s = S.bsel; if (!s) return; const i = s.ids.indexOf(id); if (i >= 0) s.ids.splice(i, 1); else s.ids.push(id); saveY(); render() },
  bookDelSelAsk() { const s = S.bsel; if (!s || !s.ids.length) return; modal(`<h4>코디북 ${s.ids.length}개 삭제</h4><p>삭제 후 몇 초간 되돌리기 가능</p><div class="mb"><button class="btn line" data-a="closeOv">취소</button><button class="btn" style="background:var(--sale)" data-a="bookDelSelOk">삭제</button></div>`); S.ov.node = '⑤ 내 코디북 모아보기 · 선택한 코디북 삭제 확인'; render() },
  bookDelSelOk() { const s = S.bsel; if (!s) return; const n = s.ids.length; S.undoBooks = bkBooks().filter((q) => s.ids.includes(q.id)); S.books = bkBooks().filter((q) => !s.ids.includes(q.id)); S.bsel = null; closeOv(); toast(n + '개 삭제 완료', { a: 'undoBooks', label: '되돌리기' }); render() },
  undoBooks() { if (S.undoBooks) { S.books = bkBooks().concat(S.undoBooks).sort((x, y) => (y.up || y.at) - (x.up || x.at)); S.undoBooks = null; S.toast = null; S.toastAct = null; toast('되돌리기 완료') } render() },
  undoEl() { const u = S.undoEl; if (u && S.bd) { S.bd.els.push(u); S.bd.sel = u.id; S.bd.touched = true; S.undoEl = null; S.toast = null; S.toastAct = null; toast('되돌리기 완료') } render() },
});
const FONTS = 'https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Nanum+Pen+Script&family=Gaegu:wght@700&family=Gamja+Flower&family=Hi+Melody&family=Single+Day&family=East+Sea+Dokdo&family=Jua&family=Do+Hyeon&family=Black+Han+Sans&family=Gowun+Batang:wght@700&family=Dongle:wght@700&display=swap';
function loadFonts() { if (document.getElementById('cbFonts')) return; const l = document.createElement('link'); l.id = 'cbFonts'; l.rel = 'stylesheet'; l.href = FONTS; document.head.appendChild(l); }
// 테스트 버튼용: 사진 있는 옷장 옷으로 코디북 n개 (옷 2~3벌씩)
function sampleBooks(n) {
  if (!S.user || S.closet.filter((c) => c.img).length < 6) reset('many');
  const its = S.closet.filter((c) => c.img), books = [];
  for (let i = 0; i < n; i++) {
    const b = bkBlank(); b.name = ['출근룩', '주말 나들이', '데이트'][i] || b.name; b.bg = ['paper', 'sage', 'sky'][i] || 'paper';
    its.slice(i * 2, i * 2 + 3).forEach((c) => bkPut(b, c)); bkAuto(b); b.at = b.up = Date.now() - i * 60000; books.push(b);
  }
  return books;
}
DJ.feature({
  id: 'codibook', issue: 15, name: '코디북', proposal: 'docs/proposals/패션북.md',
  onboard: [["나만의 코디북", "옷장 옷으로 코디하고<br>친구에게 공유해요", "등록한 옷을 골라 한 장에 놓아 보세요.<br>사려는 상품도 같이 놓아 보면<br>가진 옷과 어울리는지 미리 알 수 있어요.", 282, "features/codibook/onboard.webp"]],
  screens: SCRX, actions: AX,
  slots: {
    'closet.top': () => bookBanner(),
    'my.menu': () => `<button class="li" data-a="bookOpen"><span>내 코디북${bkBooks().length ? ` <small style="color:var(--text-tertiary);font-weight:500;margin-left:6px;font-size:14px">${bkBooks().length}개</small>` : ''}</span>${I.chev}</button>`,
    'reg.done': () => bookPromo(cur().p || {}),
  },
  start() { loadFonts(); const sh = bkFromHash(); if (sh) nav = [{ s: 'bookView', p: { shared: sh } }]; },
  after() {
    const tt = view.querySelector('.toast'), ba = view.querySelector('.bk-add'); // 코디북 편집판: 알림은 도구줄 바로 위 빈 자리에 띄움
    if (tt && S.toastAct && S.toastAct.t === S.toast) tt.insertAdjacentHTML('beforeend', `<button class="tundo" data-a="${S.toastAct.a}">${S.toastAct.label}</button>`);
    if (tt && ba && !S.ov) { const vr = view.getBoundingClientRect(), k = vr.width / view.offsetWidth || 1, top = ((ba.querySelector('button') || ba).getBoundingClientRect().top - vr.top) / k - tt.offsetHeight - 6; if (top > 70) { tt.classList.add('bkt'); tt.style.top = top + 'px'; } }
    if (S.tour && cur().s !== 'book') S.tour = null; else if (S.tour && !S.ov) bkTourDraw();
    setTimeout(bindBook);
  },
  panel: [
    ['코디북 3개 저장해 둔 상태', () => { const bs = sampleBooks(3); S.books = bs; S.bd = null; tab('closet'); go('bookList'); }], // reset()이 S를 새로 만들어서 먼저 만든 뒤 넣음
    ['링크로 받은 사람 화면', () => {
      const one = sampleBooks(1)[0]; S.bd = one; const u = bkLink(), keep = location.pathname + location.search;
      history.replaceState(null, '', u.slice(u.indexOf('#'))); const sh = bkFromHash(); history.replaceState(null, '', keep);
      S.bd = null; nav = [{ s: 'bookView', p: { shared: sh } }];
    }],
  ],
});
})();
