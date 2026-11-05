/* ── 신기능 코디북 (코디북 #15 + 내 옷이랑 맞춰 보기 #19 통합): 내 옷 · 장바구니 · 추천상품을 한 판에 놓고 꾸미고 저장 · 담기 · 공유 ──
   원본: 디자이너 통합안 claude.ai/artifact/Rv7yjP93nyGWBqKCJ3Qp2X 의 코디북 스크립트 · CSS · 그림. 줄은 그대로 옮기고 완료본과 맞물리는 곳만 고침
     - 화면 · 동작은 DJ.feature로 등록 (SCR. → SCRX., Object.assign(A) → AX)
     - 입구: 내 옷장 배너(closet.top). 아티팩트 완료본의 cbook() 그대로
     - 판 끌기 연결(cbBind)은 아티팩트 완료본 render 끝에서 부르던 것을 after()로
     - 사진에 crossOrigin: 레포 사진은 다른 출처라 없으면 바닥컷 배경 지우기 · 공유 이미지가 조용히 실패함
     - 기존 #15 · #19 토글은 그대로 둠. 그쪽 CSS는 꺼져 있어도 불리므로 겹치는 클래스만 이름을 바꿈: cf-* → cbf-*, tour · tdim · tspot · tbub → cbtour …, simtip → cbsimtip
     - 템플릿 글꼴(Black Han Sans · Caveat · Gaegu · Jua)은 아티팩트 head에 있던 링크를 start()에서 붙임
   데이터는 열어 둔 동안만 기억 (기기 저장 없음) */
(() => {
const SCRX = {};
const CB_W = 358, CB_H = 440, cq = (v) => (v / 3.58).toFixed(2) + 'cqw';
const CB_BGS = ['#B3C4A6', '#D9B1AC', '#BCAFCB', '#EEE2C0', '#423F3D']; // 피그마 550:18057 Ellipse 22 · 23 · 27 · 21 · 24
const CB_TPL_BG = { paper: '#F4F0E6', sage: '#E6EDE0', sky: '#E3EAF3', white: '#FFFFFF', butter: '#F8EFC9', blush: '#F6E3E1', ink: '#23272C' };
const CB_STK = {
  flower: ['<svg viewBox="0 0 40 40"><g fill="#3E63D8"><circle cx="20" cy="9" r="7"/><circle cx="31" cy="17" r="7"/><circle cx="27" cy="30" r="7"/><circle cx="13" cy="30" r="7"/><circle cx="9" cy="17" r="7"/></g><circle cx="20" cy="20" r="5.5" fill="#F6D44B"/></svg>', 46],
  star: ['<svg viewBox="0 0 40 40"><path d="M20 3l5 12 13 1-10 8.5 3.2 12.5L20 29l-11.2 8L12 24.5 2 16l13-1z" fill="#F6C945"/></svg>', 40],
  heart: ['<svg viewBox="0 0 40 40"><path d="M20 35S4 26 4 14.5A8 8 0 0 1 20 11a8 8 0 0 1 16 3.5C36 26 20 35 20 35z" fill="#EF5B5B"/></svg>', 38],
  spark: ['<svg viewBox="0 0 40 40"><path d="M20 2c1.5 10 4 16 18 18-14 2-16.5 8-18 18-1.5-10-4-16-18-18 14-2 16.5-8 18-18z" fill="#2F5BEA"/></svg>', 36],
  sun: ['<svg viewBox="0 0 40 40"><g stroke="#F59E0B" stroke-width="3" stroke-linecap="round"><path d="M20 3v5M20 32v5M3 20h5M32 20h5M8 8l3.5 3.5M28.5 28.5L32 32M8 32l3.5-3.5M28.5 11.5L32 8"/></g><circle cx="20" cy="20" r="9" fill="#FBBF24"/></svg>', 44],
  cloud: ['<svg viewBox="0 0 48 32"><path d="M12 28a8 8 0 0 1-1-15.9A10 10 0 0 1 30 9a9 9 0 0 1 9 9 7 7 0 0 1-1 10z" fill="#fff" stroke="#9CA3AF" stroke-width="2" stroke-linejoin="round"/></svg>', 56],
  moon: ['<svg viewBox="0 0 40 40"><path d="M27 6a15 15 0 1 0 7 26A12 12 0 0 1 27 6z" fill="#FCD34D"/></svg>', 38],
  smile: ['<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#FDE047" stroke="#EAB308" stroke-width="2"/><circle cx="14" cy="17" r="2" fill="#422006"/><circle cx="26" cy="17" r="2" fill="#422006"/><path d="M12 24c2 5 14 5 16 0" stroke="#422006" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>', 42],
  bolt: ['<svg viewBox="0 0 40 40"><path d="M23 3L9 23h9l-3 14 16-22h-9z" fill="#FACC15" stroke="#CA8A04" stroke-width="1.5" stroke-linejoin="round"/></svg>', 36],
  crown: ['<svg viewBox="0 0 44 36"><path d="M4 30L2 10l12 9L22 4l8 15 12-9-2 20z" fill="#FBBF24" stroke="#B45309" stroke-width="2" stroke-linejoin="round"/><circle cx="2" cy="10" r="2.5" fill="#EF4444"/><circle cx="22" cy="4" r="2.5" fill="#EF4444"/><circle cx="42" cy="10" r="2.5" fill="#EF4444"/></svg>', 48],
  bow: ['<svg viewBox="0 0 48 32"><path d="M24 16L5 5v22zM24 16l19-11v22z" fill="#F472B6" stroke="#BE185D" stroke-width="2" stroke-linejoin="round"/><circle cx="24" cy="16" r="5" fill="#EC4899" stroke="#BE185D" stroke-width="2"/></svg>', 52],
  leaf: ['<svg viewBox="0 0 40 40"><path d="M6 34C6 14 18 6 34 6c0 16-8 28-28 28z" fill="#4ADE80" stroke="#15803D" stroke-width="2" stroke-linejoin="round"/><path d="M8 32C16 24 22 18 30 10" stroke="#15803D" stroke-width="2" fill="none"/></svg>', 40],
  diamond: ['<svg viewBox="0 0 40 40"><path d="M20 4l14 10-14 22L6 14z" fill="#60A5FA" stroke="#1D4ED8" stroke-width="2" stroke-linejoin="round"/><path d="M6 14h28M14 14l6 22M26 14l-6 22" stroke="#1D4ED8" stroke-width="1.5" fill="none"/></svg>', 38],
  check: ['<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="#22C55E"/><path d="M11 20.5l6.5 6.5L29 14" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>', 36],
  arrow: ['<svg viewBox="0 0 56 36"><path d="M4 28C14 6 36 4 50 16" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M40 10l11 7-12 5" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>', 60],
  ring: ['<svg viewBox="0 0 48 48"><ellipse cx="24" cy="24" rx="20" ry="16" stroke="#EF4444" stroke-width="3" fill="none"/></svg>', 64],
  line: ['<svg viewBox="0 0 60 14"><path d="M3 9C14 3 24 12 34 7S52 5 57 8" stroke="#F59E0B" stroke-width="4" fill="none" stroke-linecap="round"/></svg>', 70],
  bubble: ['<svg viewBox="0 0 56 40"><path d="M8 4h40a5 5 0 0 1 5 5v16a5 5 0 0 1-5 5H26l-9 8v-8H8a5 5 0 0 1-5-5V9a5 5 0 0 1 5-5z" fill="#fff" stroke="#111" stroke-width="2.4" stroke-linejoin="round"/></svg>', 64],
  tape: ['<svg viewBox="0 0 60 24"><rect x="1" y="2" width="58" height="20" fill="#E4D29A" opacity=".88"/></svg>', 76],
  tapepk: ['<svg viewBox="0 0 60 24"><rect x="1" y="2" width="58" height="20" fill="#F9A8D4" opacity=".85"/></svg>', 76],
  tag: ['<svg viewBox="0 0 64 28"><path d="M4 2h44l12 12-12 12H4z" fill="#111"/><circle cx="12" cy="14" r="2.5" fill="#fff"/><text x="22" y="18.5" font-size="11" font-weight="700" fill="#fff" font-family="Pretendard,sans-serif">NEW</text></svg>', 70],
  sale: ['<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="20" fill="#EF4444"/><text x="22" y="27" font-size="13" font-weight="800" fill="#fff" text-anchor="middle" font-family="Pretendard,sans-serif">SALE</text></svg>', 48],
  ootd: ['<svg viewBox="0 0 70 26"><rect x="2" y="2" width="66" height="22" rx="11" fill="#111"/><text x="35" y="18" font-size="13" font-weight="800" fill="#fff" text-anchor="middle" font-family="Pretendard,sans-serif" letter-spacing="1.5">OOTD</text></svg>', 72],
  best: ['<svg viewBox="0 0 64 28"><rect x="2" y="2" width="60" height="24" fill="#2F5BEA"/><text x="32" y="19" font-size="12" font-weight="800" fill="#fff" text-anchor="middle" font-family="Pretendard,sans-serif">BEST</text></svg>', 66],
  // 템플릿 전용 (스티커 목록에는 안 보임)
  pane: ['<svg viewBox="0 0 150 200"><rect x="1.5" y="1.5" width="147" height="197" rx="12" fill="#fff" stroke="#E2E0D8" stroke-width="1.5"/></svg>', 150, 1],
  paneS: ['<svg viewBox="0 0 150 120"><rect x="1.5" y="1.5" width="147" height="117" rx="12" fill="#fff" stroke="#E2E0D8" stroke-width="1.5"/></svg>', 140, 1],
  polaroid: ['<svg viewBox="0 0 150 186"><rect x="1" y="1" width="148" height="184" rx="3" fill="#fff" stroke="#E7E4DA"/><rect x="10" y="10" width="130" height="140" fill="#F1EFE8"/></svg>', 150, 1],
  arch: ['<svg viewBox="0 0 150 210"><path d="M1.5 75A73.5 73.5 0 0 1 148.5 75V208.5H1.5z" fill="#fff" stroke="#EBCFCB" stroke-width="1.5"/></svg>', 150, 1],
  discDk: ['<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="#343B43"/></svg>', 200, 1],
  rule: ['<svg viewBox="0 0 120 3"><rect width="120" height="2" y=".5" fill="#2B2B2B"/></svg>', 200, 1],
  bA: ['<svg viewBox="0 0 28 28"><circle cx="14" cy="14" r="14" fill="#2F5BEA"/><text x="14" y="19.5" font-size="15" font-weight="800" fill="#fff" text-anchor="middle" font-family="Pretendard,sans-serif">A</text></svg>', 30, 1],
  bB: ['<svg viewBox="0 0 28 28"><circle cx="14" cy="14" r="14" fill="#E5484D"/><text x="14" y="19.5" font-size="15" font-weight="800" fill="#fff" text-anchor="middle" font-family="Pretendard,sans-serif">B</text></svg>', 30, 1],
  vs: ['<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" fill="#2B2B2B"/><text x="22" y="27" font-size="14" font-weight="800" fill="#fff" text-anchor="middle" font-family="Pretendard,sans-serif">VS</text></svg>', 44, 1],
  slot: ['<svg viewBox="0 0 40 40"><g fill="none" stroke="#C4C8CF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a3 3 0 1 1 3 3c-2 0-3 1-3 3v1.5"/><path d="M20 19.5L5 30a2 2 0 0 0 1.2 3.6h27.6A2 2 0 0 0 35 30z"/></g></svg>', 40, 1],
};
// 레포 #15 코디북 템플릿 그대로 (옷은 넣지 않고 배경 · 글씨 · 스티커만)
const CB_TPL = [
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
function cbTplEls(def, prev) {
  let n = 0;
  const tx = (text, font, color, x, y, fs, r, paper) => ({ id: 't' + n++, t: 'memo', text, font, color, paper: !!paper, x, y, fs, r });
  const sk = (k, x, y, w, r) => ({ id: 't' + n++, t: 'stk', k, x, y, w, r });
  return def.mk(tx, sk, (pts) => prev ? pts.map(([x, y]) => sk('slot', x, y, 44, 0)) : []).map((e, i) => Object.assign(e, { z: i + 1 }));
}

/* 데이터 */
const cbList = () => S.codis || (S.codis = []);
const cbD = () => S.cd; // 지금 꾸미는 판
let cbN = 0;
const cbHasFlat = (pid) => !!IMG0['flat_' + pid];
const cbProdImg = (p) => cbHasFlat(p.id) ? IMG['flat_' + p.id] : IMG[p.img];
const cbRef = (e) => e.src === 'mine' ? S.closet.find((c) => c.id === e.ref) : PB[e.ref];
const cbItems = (b) => b.els.filter((e) => e.t === 'item' && cbRef(e));
const cbInCart = (pid) => S.cart.some((c) => c.pid === pid);
function cbRecSize(p) { const b = p.sizes && baseOf(p); const r = b && b.m ? recOf(p, b) : null; return r ? r.k : null }
function cbKind(b) { // 하단 버튼 종류: none · mine · rec · cart
  const it = cbItems(b); if (!it.length) return 'none';
  if (it.some((e) => e.src === 'rec')) return 'rec';
  if (it.some((e) => e.src === 'cart')) return 'cart';
  return 'mine';
}
const cbRecN = (b) => cbItems(b).filter((e) => e.src === 'rec').length;
const cbSrcName = { mine: '내 옷', cart: '장바구니', rec: '추천상품' };

/* 판 그리기 (live: 지금 꾸미는 판) */
const CB_CUT = {}; // 바닥컷 사진의 밝은 배경을 가장자리부터 지워 판 색이 보이게 (한 번만 계산)
function cbCut(src) {
  if (!src || /^data:image\/png/.test(src)) return src;
  if (CB_CUT[src]) return CB_CUT[src] === 1 ? src : CB_CUT[src];
  CB_CUT[src] = 1; const im = new Image(); im.crossOrigin = 'anonymous'; // 레포 사진은 Vercel Blob(다른 출처). 없으면 캔버스가 막혀 배경이 안 지워짐
  im.onload = () => { try {
    const k = Math.min(1, 700 / Math.max(im.naturalWidth, im.naturalHeight)), w = Math.round(im.naturalWidth * k), h = Math.round(im.naturalHeight * k), c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.drawImage(im, 0, 0, w, h); const d = g.getImageData(0, 0, w, h), a = d.data, seen = new Uint8Array(w * h), st = [];
    const bg = (i) => a[i * 4] > 228 && a[i * 4 + 1] > 228 && a[i * 4 + 2] > 228;
    for (let x = 0; x < w; x++) st.push(x, (h - 1) * w + x); for (let y = 0; y < h; y++) st.push(y * w, y * w + w - 1);
    while (st.length) { const i = st.pop(); if (seen[i] || !bg(i)) continue; seen[i] = 1; a[i * 4 + 3] = 0; const x = i % w; if (x > 0) st.push(i - 1); if (x < w - 1) st.push(i + 1); if (i >= w) st.push(i - w); if (i < w * (h - 1)) st.push(i + w) }
    g.putImageData(d, 0, 0); CB_CUT[src] = c.toDataURL('image/png'); if (document.querySelector('#app .cbb, #app .cbt')) render();
  } catch (x) {} };
  im.src = src; return src;
}
function cbPic(e) {
  const x = cbRef(e); if (!x) return '';
  if (e.src === 'mine') return x.img ? `<img src="${CUT[x.img] || cbCut(IMG[x.img])}" alt="">` : tplSvg(x);
  return `<img src="${cbCut(cbProdImg(x))}" alt="">`;
}
const FIG = {back: 'features/codifit/img/back.svg', chevdown: 'features/codifit/img/chevdown.svg', chevup: 'features/codifit/img/chevup.svg', chkmine: 'features/codifit/img/chkmine.svg', chkrec: 'features/codifit/img/chkrec.svg', closet: 'features/codifit/img/closet.svg', color: 'features/codifit/img/color.svg', copy: 'features/codifit/img/copy.svg', dot: 'features/codifit/img/dot.svg', info16: 'features/codifit/img/info16.svg', info20: 'features/codifit/img/info20.svg', minus: 'features/codifit/img/minus.svg', pencil: 'features/codifit/img/pencil.svg', plus: 'features/codifit/img/plus.svg', plus10: 'features/codifit/img/plus10.svg', question: 'features/codifit/img/question.svg', scale: 'features/codifit/img/scale.svg', seg: 'features/codifit/img/seg.svg', sep: 'features/codifit/img/sep.svg', share: 'features/codifit/img/share.svg', slot: 'https://twzcrq9rwh1icyxq.public.blob.vercel-storage.com/img/codifit/slot.png', sticker: 'features/codifit/img/sticker.svg', template: 'features/codifit/img/template.svg', xmark: 'features/codifit/img/xmark.svg', xmark16: 'features/codifit/img/xmark16.svg'}; // 피그마 bootcamp 코디북 섹션에서 받은 아이콘 (아티팩트에서 꺼낸 파일 그대로)
const FIG_PALSEL = "<svg width=\"36\" height=\"36\" viewBox=\"0 0 36 36\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<g id=\"Frame 268\">\n<path id=\"Ellipse 21\" d=\"M35 18C35 27.3888 27.3888 35 18 35C8.61116 35 1 27.3888 1 18C1 8.61116 8.61116 1 18 1C27.3888 1 35 8.61116 35 18Z\" fill=\"#EEE2C0\" stroke-width=\"2\" stroke=\"white\"/>\n<g id=\"icon/checkmark/small/fill\">\n<path id=\"Union\" d=\"M22.2969 13.293C22.6874 12.9026 23.3205 12.9025 23.7109 13.293C24.1012 13.6835 24.1012 14.3166 23.7109 14.707L16.708 21.71C16.6347 21.7832 16.553 21.8429 16.4658 21.8887C16.3498 21.9496 16.224 21.9859 16.0967 21.998C16.033 22.0041 15.9689 22.0041 15.9053 21.998C15.7779 21.9859 15.6522 21.9496 15.5361 21.8887C15.449 21.8429 15.3672 21.7832 15.2939 21.71C15.2909 21.7069 15.2882 21.7033 15.2852 21.7002L12.293 18.708C11.9026 18.3175 11.9025 17.6844 12.293 17.2939C12.6835 16.9037 13.3166 16.9036 13.707 17.2939L16.001 19.5879L22.2969 13.293Z\" fill=\"white\"/>\n</g>\n</g>\n</svg>\n";
const fi = (k, w, h, cls = '') => `<img class="fi ${cls}" src="${FIG[k]}" width="${w}" height="${h}" alt="">`;
function cbEl(e, live) {
  const b = cbD(), sel = live && b.sel === e.id;
  let st = `left:${cq(e.x)};top:${cq(e.y)};z-index:${sel ? 900 : e.z};transform:translate(-50%,-50%) rotate(${e.r || 0}deg);`, inner;
  if (e.t === 'item') { inner = cbPic(e); st += `width:${cq(e.w)};` }
  else if (e.t === 'stk') { inner = (CB_STK[e.k] || CB_STK.star)[0]; st += `width:${cq(e.w)};` }
  else { inner = esc(e.text); st += `font-size:${cq(e.fs)};font-family:'${e.font || 'Pretendard'}',sans-serif;color:${e.color};` }
  const lab = sel && e.t === 'item' && e.src !== 'mine' ? `<span class="cb-lab">${cbSrcName[e.src]}${e.size ? ' ' + esc(e.size) : ''}</span>` : '';
  return `<div class="cbe ${e.t}${e.paper ? ' paper' : ''}${sel ? ' sel' : ''}" ${live ? `data-e="${e.id}"` : ''} style="${st}">${inner}${sel ? `${lab}<button class="cb-x" data-del="1" aria-label="빼기">${fi('xmark', 10, 10)}</button><i class="cb-h" data-h="1">${fi('scale', 10.1, 10.1)}</i>` : ''}</div>`;
}
const cbBoard = (b, live, extra = '') => `<div class="cbb" ${live ? 'id="cbb"' : ''} style="background:${b.bg}"><div class="cbs">${b.els.filter((e) => e.t !== 'item' || cbRef(e)).slice().sort((x, y) => x.z - y.z).map((e) => cbEl(e, live)).join('')}</div>${extra}</div>`;
const CB_TIPX = '<svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></svg>';
// 빈 판: 점선으로 그린 셔츠 · 바지
const CB_EMPTY = '<img class="cb-ph" style="left:12.56%;top:24.11%;width:45.87%" src="features/codifit/img/guide1.svg" alt=""><img class="cb-ph" style="left:53.03%;top:20.88%;width:32.02%" src="features/codifit/img/guide2.svg" alt="">'; // 피그마 guide(523:10224) SVG 그대로

/* 공통 조각 */
const cbBack = `<button class="cb-back" data-a="back" aria-label="뒤로">${fi('back', 24, 24)}</button>`;
const cbHdr = (t, badge = '', help = true) => `<div class="hdr cb-hdr"><span class="l">${cbBack}${t ? `<b>${t}</b>` : ''}${badge}</span>${help === null ? '' : `<span class="icons">${help ? `<button data-a="cbHelp" aria-label="이용방법">${fi('question', 24, 24)}</button>` : ''}<button data-a="cbShare" aria-label="공유">${fi('share', 20, 20)}</button></span>`}</div>`;
function cbBar(b, edit) { // 하단 버튼 4가지 (+ 상세에서는 '수정')
  const k = cbKind(b), n = cbRecN(b), left = edit ? `<button class="cb-b1" data-a="cbSave">저장</button>` : `<button class="cb-b1" data-a="cbEdit">수정</button>`, c = edit ? ' ed' : '';
  if (k === 'none') return `<button class="cb-b${c}" disabled>코디 저장</button>`;
  if (k === 'mine') return edit ? `<button class="cb-b${c}" data-a="cbSave">코디 저장</button>` : `<button class="cb-b" data-a="cbEdit">수정</button>`;
  if (k === 'rec') return `${left}<button class="cb-b${c}" data-a="cbCartOpen">${n}개 장바구니 담기</button>`;
  return `${left}<button class="cb-b${c}" data-a="cbBuy">구매하기</button>`;
}
function cbTray(b) { // 판에 놓인 옷: 내 옷 N | 상품 N (판에서 고른 옷은 프라이머리 1px 테두리)
  const it = cbItems(b), mine = it.filter((e) => e.src === 'mine'), pr = it.filter((e) => e.src !== 'mine');
  const slot = (to) => `<button class="cbslot" data-a="cbJump" data-x="${to}" aria-label="옷 고르기"><img class="fi bg" src="${FIG.slot}" width="44" height="52" alt="">${fi('plus10', 10, 10, 'pl')}</button>`; // 피그마 546:17418
  const one = (e, lab) => `<span class="cbti"><span class="cbt${b.sel === e.id ? ' on' : ''}">${cbPic(e)}</span><button class="cbtx" data-a="cbOff" data-x="${e.id}" aria-label="빼기">${fi('xmark', 10, 10)}</button>${lab ? `<small class="${e.src === 'rec' ? 'g' : ''}">${lab}</small>` : ''}</span>`;
  return `<div class="cbtray"><div class="cbg"><b>내 옷 ${mine.length}</b><div>${mine.length ? mine.map((e) => one(e)).join('') : slot('mine')}</div></div>${fi('sep', 2, 68, 'cbsep')}
    <div class="cbg"><b>상품 ${pr.length}</b><div>${pr.length ? pr.map((e) => one(e, cbSrcName[e.src])).join('') : slot('rec')}</div></div></div>`;
}

/* ── 목록 ── */
function cbMeta(b) {
  const it = cbItems(b), mine = it.filter((e) => e.src === 'mine').length, cart = it.some((e) => e.src === 'cart'), rec = it.some((e) => e.src === 'rec');
  return [mine ? `내 옷 ${mine}벌` : '', cart ? '장바구니 상품 포함' : '', rec ? '추천상품 포함' : ''].filter(Boolean).map((t) => `<span>${t}</span>`).join(fi('dot', 2, 2));
}
SCRX.cbList = () => {
  const L = cbList();
  return { node: L.length ? '⑤ 코디북 · 등록된 코디 목록' : '⑤ 코디북 · 아무것도 없음', bar: `<button class="cb-b" data-a="cbNew">코디 등록하기</button>`,
    body: `${cbHdr('코디북', '', null)}
    ${L.length ? `<div class="cbgrid">${L.map((b) => `<button class="cbcard" data-a="cbOpen" data-x="${b.id}">${cbBoard(b, false)}<span class="tx"><b>${esc(b.name)}</b><small>${cbMeta(b)}</small></span></button>`).join('')}</div>`
      : `<div class="cbnone">${fi('closet', 100, 100)}<span class="tx"><b>아직 만든 코디가 없어요</b><small>잘 맞는 내 옷을 담으면<br>그 옷으로 코디를 짜고 저장할 수 있어요</small></span></div>`}` };
};

/* ── 상세 ── */
const cbPrice = (p) => `${p.dc ? `<em>${p.dc}%</em>` : ''}<b>${won(sale(p))}원</b>`;
const cbPrice2 = (p) => `${p.dc ? `<em>${p.dc}%</em>` : ''}<b>${won(sale(p))}<small>원</small></b>`; // 카드: 숫자 14 · '원' 13
SCRX.cbView = (pp) => {
  const b = cbList().find((q) => q.id === pp.id); if (!b) return SCR.cbList();
  const it = cbItems(b), buy = it.filter((e) => e.src !== 'mine').length, tab = pp.tab || 'top';
  const on = it.filter((e) => e.src !== 'mine').map((e) => e.ref);
  const recs = P.filter((p) => p.cat === tab && p.sizes && !on.includes(p.id)).sort((x, y) => (cbHasFlat(y.id) - cbHasFlat(x.id)) || y.rev - x.rev).slice(0, 8);
  const row = (e) => { const x = cbRef(e), p = e.src === 'mine' ? null : x, sz = e.size || x.size;
    return `<div class="cbrow"><span class="th">${cbPic(e)}</span><div><span class="nm">${esc(x.name)}</span>${p ? `<span class="pr">${cbPrice(p)}</span>` : ''}
      <span class="cbtags${p ? '' : ' mine'}"><i>${CAT[x.cat]}${sz ? `${fi('dot', 2, 2)}${esc(sz)} Size` : ''}</i><i class="${e.src === 'mine' ? '' : 'g'}">${e.src === 'rec' ? '추천 상품' : cbSrcName[e.src]}</i></span></div></div>` };
  return { node: '⑤ 코디북 · 코디 상세 → 수정 · 장바구니 담기', bar: cbBar(b, false),
    body: `${cbHdr('', '', false)}
    <div class="cbv-t"><button data-a="cbRename" data-x="${b.id}"><b>${esc(b.name)}</b>${fi('pencil', 14, 13)}</button><button class="cbcopy" data-a="cbCopy" data-x="${b.id}">${fi('copy', 14, 14)}복사</button></div>
    <div class="cbv-b">${cbBoard(b, false)}</div>
    <div class="cbsec cbused"><div class="cbh"><b>이 코디에 사용된 옷</b><span>${it.length}벌${buy ? ` · 구매 전 상품 ${buy}개` : ''}</span></div><div class="rows">${it.map(row).join('')}</div></div>
    <i class="cbgap"></i>
    <div class="cbsec cbmatch"><div class="cbh"><b>이 코디에 어울리는 상품</b><span class="cbinfow"><button class="cbbasis" data-a="cbTip" data-x="v">추천 기준${fi('info16', 16, 16)}</button>${S.cbTipV ? `<span class="cbsimtip" role="tooltip">내가 등록한 옷 사이즈와 계절 기준으로 골랐어요.<br>누르면 이 코디에 더해 놓고 수정 화면으로 가요<button data-a="cbTip" data-x="v" aria-label="닫기">${CB_TIPX}</button></span>` : ''}</span></div>
      <div class="cbpills">${['top', 'bottom', 'outer'].map((c) => `<button class="${c === tab ? 'on' : ''}" data-a="cbVTab" data-x="${c}">${CAT[c]}</button>`).join('')}</div></div>
    <div class="cbrecs">${recs.map((p) => { const r = cbRecSize(p); return `<button class="cbrc" data-a="cbAddFromView" data-x="${p.id}"><span class="im"><img src="${cbProdImg(p)}" alt=""></span><span class="tx"><small>${esc(p.brand)}</small><span class="nm">${esc(p.name)}</span><span class="pr">${cbPrice2(p)}</span>${r ? `<span class="cbtags"><i class="g">추천 ${esc(r)}</i></span>` : ''}</span></button>` }).join('')}</div>` };
};

/* ── 코디하기 ── */
function cbCard(kind, x, on) {
  const tag = kind === 'rec' ? (() => { const r = cbRecSize(x); return `<span class="cbtags">${`<i>${esc(x.sub || CAT[x.cat])}</i>`}${r ? `<i class="g">추천 ${esc(r)}</i>` : ''}</span>` })() : '';
  const img = kind === 'mine' ? (x.img ? `<img class="ct" src="${CUT[x.img] || IMG[x.img]}" alt="">` : tplSvg(x)) : `<img src="${cbProdImg(x)}" alt="">`;
  return `<span class="cbc ${kind}"><button class="im ${on ? 'on' : ''}" data-a="cbPick" data-x="${kind}|${x.id || x.pid}" aria-label="${esc(x.name)}">${img}</button>${on ? fi(kind === 'mine' ? 'chkmine' : 'chkrec', 28, 28, 'ok') : ''}${tag}</span>`;
}
const cbSwatch = (c, on) => on ? `<button class="sw on" data-a="cbBg" data-x="${c}" aria-label="배경색">${FIG_PALSEL.replace('#EEE2C0', c)}</button>` : `<button class="sw" data-a="cbBg" data-x="${c}" aria-label="배경색"><svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="13" r="13" fill="${c}"/></svg></button>`;
SCRX.cbEdit = () => {
  const b = cbD(), tab = b.tab, it = cbItems(b), empty = !b.els.length;
  const onIds = (src) => it.filter((e) => e.src === src).map((e) => e.ref);
  const mine = S.closet.filter((c) => c.cat === tab), cart = S.cart.filter((c, i, a) => PB[c.pid] && PB[c.pid].cat === tab && a.findIndex((q) => q.pid === c.pid) === i);
  const recs = P.filter((p) => p.cat === tab && cbHasFlat(p.id) && !cbInCart(p.id));
  const rail = b.pal ? '' : `${b.tools ? '<i class="cbdim" data-a="cbTools"></i>' : ''}<div class="cbrail ${b.tools ? 'open' : ''}">${[['cbPal', fi('color', 36, 37), '배경색 변경'], ['cbText', '<span class="aa">Aa</span>', '텍스트 입력'], ['cbStk', fi('sticker', 36, 36), '스티커 추가'], ['cbTpl', fi('template', 36, 36), '템플릿'], ['cbTools', fi(b.tools ? 'chevup' : 'chevdown', 24, 24), b.tools ? '닫기' : '메뉴 펼치기']].map(([a, ic, t]) => `<button data-a="${a}" aria-label="${t}">${ic}${b.tools ? `<span class="lb">${t}</span>` : ''}</button>`).join('')}</div>`;
  const pal = b.pal ? `<i class="cbpalbg"></i><div class="cbpal">${CB_BGS.map((c) => cbSwatch(c, b.bg === c)).join('')}<label class="wheel ${CB_BGS.includes(b.bg) ? '' : 'on'}" aria-label="다른 색"><input type="color" value="${b.bg}" oninput="cbBgAny(this.value)"></label><button class="x" data-a="cbPal" aria-label="닫기">${fi('xmark16', 16, 16)}</button></div>` : '';
  const sec = (t, n, body, info) => `<div class="cbsec" id="cb-${t}"><div class="cbh"><b>${t === 'rec' ? '추천상품' : t === 'mine' ? '내 옷' : '장바구니'}${info || ''}</b><span>${n}개</span></div><div class="cbline">${body}</div></div>`;
  return { node: empty ? '⑤ 코디하기 · 첫 진입 (빈 판)' : `⑤ 코디하기 · 옷 선택${b.tools ? ' · 판 옵션 펼침' : ''}${b.edit ? ' · 수정중' : ''}`, bar: cbBar(b, true),
    body: `${cbHdr('코디하기', b.edit ? '<span class="cbing">수정중</span>' : '')}
    ${empty ? '' : `<div class="cbfix"><div class="in"><button class="mini" data-a="cbTop" aria-label="판 크게 보기">${cbBoard(b, false)}</button>${cbTray(b)}</div></div>`}
    <div class="cbwrap">${empty ? `<div class="cbb" id="cbb" style="background:${b.bg}">${CB_EMPTY}<p class="cb-ph-t">옷장 혹은 장바구니에 담은 상품을 자유롭게 배치해보세요</p></div>` : cbBoard(b, true, rail + pal)}</div>
    ${empty ? '' : cbTray(b) + '<i class="cbgap"></i>'}
    <div class="cbsegw"><div class="cbseg">${fi('seg', 112, 41, 'shape s' + ['top', 'bottom', 'outer'].indexOf(tab))}${['top', 'bottom', 'outer'].map((c) => `<button class="${c === tab ? 'on' : ''}" data-a="cbTab" data-x="${c}">${CAT[c]}</button>`).join('')}</div></div>
    ${sec('mine', mine.length, mine.length ? mine.map((c) => cbCard('mine', c, onIds('mine').includes(c.id))).join('') : `<span class="cbno">등록한 ${CAT[tab]}가 없어요</span>`)}
    ${sec('cart', cart.length, cart.length ? cart.map((c) => cbCard('cart', Object.assign({ id: c.pid }, PB[c.pid]), onIds('cart').includes(c.pid))).join('') : `<span class="cbno">장바구니에 담은 ${CAT[tab]}가 없어요</span>`)}
    ${sec('rec', recs.length, recs.map((p) => cbCard('rec', p, onIds('rec').includes(p.id))).join(''), `<span class="cbinfow"><button class="cbinfo" data-a="cbTip" data-x="e" aria-label="추천 기준">${fi('info20', 20, 20)}</button>${S.cbTipE ? `<span class="cbsimtip cbtipe" role="tooltip">잘 맞는 내 옷의 치수로 상품 사이즈를 추천해요<button data-a="cbTip" data-x="e" aria-label="닫기">${CB_TIPX}</button></span>` : ''}</span>`)}
    <div style="height:24px"></div>` };
};
const CB_SPOT = { outer: [110, 165, 176], top: [250, 150, 160], bottom: [200, 300, 132] };
function cbPut(b, src, ref) {
  const x = src === 'mine' ? S.closet.find((c) => c.id === ref) : PB[ref]; if (!x) return;
  let [px, py, w] = CB_SPOT[x.cat] || CB_SPOT.top; const n = b.els.filter((e) => e.t === 'item').length;
  while (b.els.some((e) => e.t === 'item' && Math.abs(e.x - px) < 20 && Math.abs(e.y - py) < 20)) { px = Math.min(CB_W - 60, px + 22); py = Math.min(CB_H - 60, py + 18) }
  const size = src === 'mine' ? x.size : src === 'cart' ? (S.cart.find((c) => c.pid === ref) || {}).size : cbRecSize(x);
  b.els.push({ id: 'e' + b.nid++, t: 'item', src, ref, size: size || null, x: px, y: py, w, r: 0, z: b.z++ }); // 시안처럼 기울이지 않고 올림
}
function cbStart(o) { S.cd = Object.assign({ id: null, name: '', bg: '#EEE2C0', els: [], sel: null, z: 1, nid: 1, tab: 'top', tools: false, pal: false, edit: false }, o) }

/* 판 위에서 끌기 · 크기 · 빼기 */
function cbBind() {
  if (S.cbTour) { if (cur().s !== 'cbEdit' || S.ov) S.cbTour = null; else cbTourDraw() }
  const cv = document.querySelector('#app #cbb'), body = document.querySelector('#app .body');
  if (body && document.querySelector('#app .cbfix')) { const f = () => { const w = document.querySelector('#app .cbwrap'); if (w) document.querySelector('#app .cbfix').classList.toggle('on', body.scrollTop > w.offsetHeight - 40) }; body.onscroll = f; f() }
  if (!cv || !cv.querySelector('.cbs')) return;
  const b = cbD();
  cv.querySelector('.cbs').addEventListener('pointerdown', (ev) => {
    const el = ev.target.closest('.cbe'); if (!el) { if (b.sel) { b.sel = null; render() } return }
    const e = b.els.find((q) => q.id === el.dataset.e); if (!e) return;
    if (ev.target.closest('[data-del]')) { b.els = b.els.filter((q) => q !== e); b.sel = null; render(); return }
    ev.preventDefault(); try { el.setPointerCapture(ev.pointerId) } catch (x) {}
    const k = cv.getBoundingClientRect().width / CB_W, sx = ev.clientX, sy = ev.clientY, ox = e.x, oy = e.y; let moved = false;
    if (ev.target.closest('[data-h]')) { // 모서리: 끌어서 크기 · 각도
      const rc = el.getBoundingClientRect(), cx = rc.left + rc.width / 2, cy = rc.top + rc.height / 2, d0 = Math.max(10, Math.hypot(sx - cx, sy - cy)), a0 = Math.atan2(sy - cy, sx - cx), w0 = e.w, f0 = e.fs, r0 = e.r || 0;
      const rs = (m) => { const f = Math.hypot(m.clientX - cx, m.clientY - cy) / d0;
        if (e.t === 'memo') { e.fs = Math.round(Math.max(12, Math.min(64, f0 * f))); el.style.fontSize = cq(e.fs) } else { e.w = Math.round(Math.max(36, Math.min(330, w0 * f))); el.style.width = cq(e.w) }
        let r = r0 + (Math.atan2(m.clientY - cy, m.clientX - cx) - a0) * 180 / Math.PI; r = ((r + 540) % 360) - 180; if (Math.abs(r) < 5) r = 0; e.r = Math.round(r); el.style.transform = `translate(-50%,-50%) rotate(${e.r}deg)` };
      const ru = () => { el.removeEventListener('pointermove', rs); el.removeEventListener('pointerup', ru); render() };
      el.addEventListener('pointermove', rs); el.addEventListener('pointerup', ru); el.addEventListener('pointercancel', ru); return;
    }
    const mv = (m) => { const dx = (m.clientX - sx) / k, dy = (m.clientY - sy) / k; if (!moved && Math.hypot(dx, dy) < 5) return; moved = true; e.x = Math.round(Math.max(10, Math.min(CB_W - 10, ox + dx))); e.y = Math.round(Math.max(10, Math.min(CB_H - 10, oy + dy))); el.style.left = cq(e.x); el.style.top = cq(e.y) };
    const up = () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); b.sel = e.id; e.z = b.z++; render() };
    el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  });
}
function cbBgAny(v) { cbD().bg = v; const c = document.querySelector('#app #cbb'); if (c) c.style.background = v; clearTimeout(cbBgAny.h); cbBgAny.h = setTimeout(render, 250) }

/* 시트: 글자 · 스티커 · 템플릿 · 장바구니 담기 */
function cbTextHtml() {
  const d = S.cbt;
  return `<div class="grab"></div><div class="cbst">텍스트 입력</div>
    <div class="cbprev" style="background:${cbD().bg}"><span style="color:${d.color};${d.paper ? 'background:#fff;padding:4px 10px;border-radius:4px' : ''}">${esc(d.text) || '미리보기'}</span></div>
    <div class="cbsl">컬러</div><div class="cbcols">${['#121212', '#FFFFFF', '#27C45B'].map((c) => `<button class="${d.color === c ? 'on' : ''}" style="background:${c}" data-a="cbTColor" data-x="${c}" aria-label="글자색"></button>`).join('')}<label class="any ${['#121212', '#FFFFFF', '#27C45B'].includes(d.color) ? '' : 'on'}" aria-label="다른 색"><input type="color" value="${d.color}" onchange="S.cbt.text=document.getElementById('cbtx').value;A.cbTColor(this.value)"></label>
      <button class="cbpaper ${d.paper ? 'on' : ''}" data-a="cbTPaper" aria-label="글자 배경">A</button></div>
    <input class="tin cbin" id="cbtx" maxlength="30" placeholder="예: 출근룩, 이번 주말" value="${esc(d.text)}" oninput="S.cbt.text=this.value;const p=document.querySelector('.cbprev span');if(p)p.textContent=this.value||'미리보기'">
    <button class="btn fb cb-b" style="width:100%;margin-top:24px" data-a="cbTAdd">넣기</button>`;
}
function cbCartHtml() {
  const L = S.cbq;
  return `<div class="cbgrab"><i></i></div>${L.length === 1 ? '<div class="cbot"><b>옵션 선택</b><span>코디에 놓인 상품을 장바구니에 담아요</span></div>' : ''}
    ${L.map((q, i) => { const p = PB[q.pid], base = baseOf(p), rk = cbRecSize(p);
      return `<div class="cbog"><div class="cbop"><span class="th"><img src="${cbProdImg(p)}" alt=""></span><div><small>${esc(p.brand)}</small><span class="nm">${esc(p.name)}</span><span class="pr">${cbPrice(p)}</span></div></div>
        <div class="cbob"><div class="cbsz"><b>사이즈</b><div class="cbszs">${Object.keys(p.sizes).map((k) => { const out = p.out.includes(k), w = out ? '품절' : base && base.m ? fitWord(p, base, k) : '';
          return `<button class="${q.size === k ? 'on' : ''}${out ? ' out' : ''}" ${out ? 'disabled' : ''} data-a="cbQSize" data-x="${i}|${k}"><span class="k"><b>${esc(k)}</b>${k === rk ? '<em>추천</em>' : ''}</span>${w ? `<small>${w}</small>` : ''}</button>` }).join('')}</div></div>
        <div class="cbqty"><b>수량</b><span><button data-a="cbQty" data-x="${i}|-1" aria-label="빼기">${fi('minus', 20, 20)}</button><i>${q.qty}</i><button data-a="cbQty" data-x="${i}|1" aria-label="더하기">${fi('plus', 20, 20)}</button></span></div></div></div>` }).join('')}
    <div class="cbofoot"><div class="cbtot"><b>총 ${L.reduce((a, q) => a + q.qty, 0)}개</b><b>${won(L.reduce((a, q) => a + sale(PB[q.pid]) * q.qty, 0))}원</b></div>
    <button class="cb-b" ${L.every((q) => q.size) ? '' : 'disabled'} data-a="cbCartAdd">${L.length}개 장바구니 담기</button></div>`;
}
const cbCurBoard = () => cur().s === 'cbView' ? cbList().find((q) => q.id === cur().p.id) : cbD();
const cbCopyOf = (b) => JSON.parse(JSON.stringify({ name: b.name, bg: b.bg, els: b.els, z: b.z, nid: b.nid }));

/* 공유: 판을 이미지로 (피드 4:5 · 스토리 9:16). 사이즈 · 실측 · 추천 사이즈는 넣지 않음, 내 옷은 사진만 */
const cbName = (b) => b.name || (b.id && (cbList().find((q) => q.id === b.id) || {}).name) || '나의 코디';
const cbIm = (src) => new Promise((ok) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => ok(im); im.onerror = () => ok(null); im.src = src });
const cbSrcOf = (e) => { if (e.t === 'stk') return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent((CB_STK[e.k] || CB_STK.star)[0].replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')); const x = cbRef(e); return e.src === 'mine' ? (x.img ? (CUT[x.img] || cbCut(IMG[x.img])) : null) : cbCut(cbProdImg(x)) };
async function cbShot(b, fmt) {
  const W = 1080, k = W / CB_W, FH = Math.round(CB_H * k), H = fmt === '916' ? 1920 : 1350, oy = Math.round((H - FH) / 2);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d'); g.fillStyle = b.bg; g.fillRect(0, 0, W, H);
  for (const e of b.els.filter((q) => q.t !== 'item' || cbRef(q)).slice().sort((x, y) => x.z - y.z)) {
    g.save(); g.translate(e.x * k, oy + e.y * k); g.rotate((e.r || 0) * Math.PI / 180);
    if (e.t === 'memo') { const fs = e.fs * k; g.font = `700 ${fs}px '${e.font || 'Pretendard'}', sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      if (e.paper) { const w = g.measureText(e.text).width + fs; g.fillStyle = '#fff'; g.beginPath(); g.roundRect(-w / 2, -fs * .75, w, fs * 1.5, 4 * k); g.fill() }
      g.fillStyle = e.color; g.fillText(e.text, 0, 0) }
    else { const src = cbSrcOf(e), im = src && await cbIm(src); if (im) { const w = e.w * k, h = w * (im.naturalHeight || 1) / (im.naturalWidth || 1); g.drawImage(im, -w / 2, -h / 2, w, h) } }
    g.restore() }
  const lg = await cbIm('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(LOGO('#FFFFFF', 112).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')));
  if (lg) { const lw = 64 * k, lh = lw * 22 / 112; g.save(); g.shadowColor = 'rgba(0,0,0,0.16)'; g.shadowBlur = 6 * k; g.shadowOffsetX = 0; g.shadowOffsetY = 0; g.drawImage(lg, 20 * k, (fmt === '916' ? oy : 0) + 20 * k, lw, lh); g.restore() } // 흰 로고 · 그림자 X0 Y0 blur6 16%
  try { return cv.toDataURL('image/png') } catch (e) { return null }
}
function cbShareHtml(patch) {
  const o = S.ov, b = cbCurBoard(), it = cbItems(b), ps = it.filter((e) => e.src !== 'mine').map((e) => PB[e.ref]), mine = it.length - ps.length;
  const unsaved = cur().s === 'cbEdit';
  o.html = `<div class="grab"></div><div style="font-size:18px;font-weight:800">코디 공유하기</div>
    <div class="cbf-seg2">${[['45', '피드 4:5'], ['916', '스토리 9:16']].map(([k, n]) => `<button class="${o.fmt === k ? 'on' : ''}" data-a="cbShareFmt" data-x="${k}" aria-pressed="${o.fmt === k}">${n}</button>`).join('')}</div>
    <div class="cbf-shot ${o.fmt === '916' ? 'st' : ''}">${o.url && o.url !== 'fail' ? `<img src="${o.url}" alt="공유 이미지 미리보기">` : `<span>${o.url === 'fail' ? '이미지를 만들지 못했어요' : '이미지를 만들고 있어요…'}</span>`}</div>
    <div class="cbf-shnote"><b>공유되지 않는 정보</b>사이즈 · 실측 · 체형 · 추천 사이즈는 빠져요.${mine ? ` 내 옷 ${mine}벌은 사진만 보여요.` : ''}</div>
    ${ps.length ? `<div class="cbf-shps"><small>링크로 받은 사람은 상품 ${ps.length}개를 볼 수 있어요</small><div>${ps.map((p) => `<span><img src="${IMG[p.img]}" alt=""><b>${esc(p.name)}</b><em class="num">${won(sale(p))}원</em></span>`).join('')}</div></div>` : ''}
    ${unsaved && it.length ? '<div class="cbf-shsv"><span>아직 저장하지 않은 코디예요</span><button data-a="cbShareSaveNow">저장하기</button></div>' : ''}
    <div class="cbf-shbtn"><button class="btn line" data-a="cbShareSave" ${o.url && o.url !== 'fail' ? '' : 'disabled'}>이미지 저장</button><button class="btn" data-a="cbShareSend" ${o.url && o.url !== 'fail' ? '' : 'disabled'}>공유하기</button></div>
    <button class="cbf-shview" data-a="cbShareView">링크로 받은 사람 화면 보기 (데모) ›</button>`;
  if (patch) { const sh = document.querySelector('#app .sheet'); if (sh) sh.innerHTML = o.html }
}
function cbShareMake() { const o = S.ov, f = o.fmt; cbShot(cbCurBoard(), f).then((url) => { if (S.ov !== o || o.fmt !== f) return; o.url = url || 'fail'; cbShareHtml(true) }) }
// 공유 링크로 받은 화면 (데모): 꾸민 판 그대로 + 상품만 목록으로
SCRX.cbShared = (pp) => {
  const b = pp.b, ps = b.els.filter((e) => e.t === 'item' && e.src !== 'mine' && PB[e.ref]).map((e) => PB[e.ref]), mine = b.els.filter((e) => e.t === 'item' && e.src === 'mine').length;
  return { node: '⑤ 코디북 · 공유 링크로 받은 화면 (데모)', body: `${hdrBack('공유받은 코디')}
    <div class="cbf-vhead"><small class="cbf-shby">당장 회원님이 공유한 코디</small><b>${esc(b.name)}</b></div>
    <div class="cbv-b">${cbBoard(b, false)}</div>
    <div class="sec"><h3>이 코디의 상품<small>${ps.length}</small></h3></div>
    <div class="cbf-vlist">${ps.map((p) => `<button class="cbf-vrow" data-a="detail" data-x="${p.id}"><span class="th"><img src="${IMG[p.img]}" alt=""></span><span class="tx"><small>${esc(p.brand)}</small><b>${esc(p.name)}</b><span class="num">${won(sale(p))}원</span></span><span class="go">›</span></button>`).join('')}</div>
    ${mine ? `<div class="pad" style="font-size:12.5px;color:var(--sub);margin-top:10px;line-height:1.5">나머지 ${mine}벌은 공유한 사람의 옷이라 상품 정보가 없어요. 사이즈 · 실측 정보는 공유되지 않아요</div>` : ''}
    <div style="height:24px"></div>` };
};
/* 코치마크: '?'를 누르면 차례로 강조 + 말풍선 (레포 #15 코디북 코치마크와 같은 형식) */
const CB_TOUR = [
  { sel: ['.cbseg'], at: 'up', t: '옷 고르기', d: '상의 · 하의 · 아우터를 고르고, 내 옷 · 장바구니 · 추천상품을 누르면 판에 올라가요' },
  { sel: ['#cbb'], at: 'in', t: '배치와 편집', d: '옷을 끌면 이동 · 모서리를 끌면 크기와 각도 조절 · ×를 누르면 판에서 빠져요' },
  { sel: ['.cbrail'], at: 'down', t: '꾸미기', d: '배경색 · 텍스트 · 스티커 · 템플릿으로 꾸미기' },
  { sel: ['.bar .btn'], at: 'up', t: '저장', d: '완성하면 저장 · 상품은 장바구니에 담거나 바로 구매하고, 링크나 이미지로 공유할 수 있어요' },
];
function cbTourDraw() {
  const st = S.cbTour; let T, els = [];
  while ((T = CB_TOUR[st.step]) && !(els = T.sel.flatMap((q) => [...view.querySelectorAll(q)])).length) st.step++; // 지금 화면에 없는 곳(빈 판의 꾸미기 메뉴 등)은 건너뜀
  if (!T) { S.cbTour = null; return }
  const bd = view.querySelector('.body'); // 판 안쪽(판 · 꾸미기 메뉴)은 맨 위로, 나머지는 화면 가운데로 (바깥 페이지는 움직이지 않음)
  if (bd) { if (els[0].closest('#cbb')) bd.scrollTop = 0; else { const r0 = els[0].getBoundingClientRect(), rb = bd.getBoundingClientRect(); bd.scrollTop += r0.top - rb.top - (rb.height - r0.height) / 2 } bd.dispatchEvent(new Event('scroll')) }
  const n = CB_TOUR.length, vr = view.getBoundingClientRect(), k = vr.width / view.offsetWidth || 1, rs = els.map((e) => e.getBoundingClientRect());
  const L = Math.min(...rs.map((r) => r.left)), Tp = Math.min(...rs.map((r) => r.top)), R = Math.max(...rs.map((r) => r.right)), B = Math.max(...rs.map((r) => r.bottom));
  const x = (L - vr.left) / k, y = (Tp - vr.top) / k, w = (R - L) / k, h = (B - Tp) / k, pad = 6, last = st.step === n - 1;
  const o = document.createElement('div'); o.className = 'cbtour';
  const cx1 = Math.max(0, x - pad), cy1 = Math.max(0, y - pad), cx2 = Math.min(view.offsetWidth, x + w + pad), cy2 = Math.min(view.offsetHeight, y + h + pad);
  o.innerHTML = '<div class="cbtdim" style="clip-path:polygon(evenodd,0 0,100% 0,100% 100%,0 100%,0 0,' + cx1 + 'px ' + cy1 + 'px,' + cx1 + 'px ' + cy2 + 'px,' + cx2 + 'px ' + cy2 + 'px,' + cx2 + 'px ' + cy1 + 'px,' + cx1 + 'px ' + cy1 + 'px)"></div><div class="cbtspot" style="left:' + (x - pad) + 'px;top:' + (y - pad) + 'px;width:' + (w + pad * 2) + 'px;height:' + (h + pad * 2) + 'px"></div>' +
    '<div class="cbtbub"><div class="th"><span class="tc">' + (st.step + 1) + ' / ' + n + '</span>' + (last ? '' : '<button class="tskip" data-a="cbTourSkip">건너뛰기</button>') + '</div><b>' + T.t + '</b><p>' + T.d + '</p>' +
    '<div class="tf"><span class="tdots">' + CB_TOUR.map((_, i) => '<i class="' + (i === st.step ? 'on' : '') + '"></i>').join('') + '</span><button class="tn" data-a="' + (last ? 'cbTourSkip' : 'cbTourNext') + '">' + (last ? '시작하기' : '다음') + '</button></div><i class="tar"></i></div>';
  view.appendChild(o);
  const bub = o.querySelector('.cbtbub'), ar = o.querySelector('.tar'), bh = bub.offsetHeight, vh = view.offsetHeight;
  let top; const arrow = T.at !== 'in';
  if (T.at === 'in') top = y + h - bh - 14;
  else if (T.at === 'down') { top = y + h + pad + 14; ar.dataset.p = 'top' }
  else { top = y - pad - bh - 14; if (top < 70) { top = y + h + pad + 14; ar.dataset.p = 'top' } else ar.dataset.p = 'bottom' }
  top = Math.max(70, Math.min(top, vh - bh - 12)); bub.style.top = top + 'px';
  if (!arrow) ar.style.display = 'none'; else { const ax = Math.max(26, Math.min(x + w / 2 - 16, view.offsetWidth - 16 - 26 - 16)); ar.style.left = ax + 'px'; if (ar.dataset.p === 'top') ar.style.top = '-8px'; else ar.style.bottom = '-8px' }
}

const AX = {
  cbook() { need('로그인하고 내 옷으로 코디해 보세요', () => { closeOv(); go('cbList') }) },
  cbNew() { if (!S.user) { AX.cbook(); return } cbStart({}); go('cbEdit') },
  cbOpen(id) { go('cbView', { id }) },
  cbEdit() { const b = cbList().find((q) => q.id === cur().p.id); cbStart(Object.assign(cbCopyOf(b), { id: b.id, edit: true })); go('cbEdit') },
  cbTab(c) { cbD().tab = c; render() },
  cbVTab(c) { cur().p.tab = c; render() },
  cbTip(k) { const key = k === 'v' ? 'cbTipV' : 'cbTipE'; S[key] = !S[key]; render() },
  cbTools() { const b = cbD(); b.tools = !b.tools; b.pal = false; render() },
  cbPal() { const b = cbD(); b.pal = !b.pal; b.tools = false; render() },
  cbBg(c) { cbD().bg = c; render() },
  cbTop() { const bd = document.querySelector('#app .body'); if (bd) bd.scrollTo({ top: 0, behavior: 'smooth' }) },
  cbJump(k) { const el = document.getElementById('cb-' + k), bd = document.querySelector('#app .body'); if (el && bd) bd.scrollTo({ top: el.offsetTop - 200, behavior: 'smooth' }) },
  cbPick(x) { const [src, ref] = x.split('|'), b = cbD(), on = b.els.find((e) => e.t === 'item' && e.src === src && e.ref === ref);
    if (on) b.els = b.els.filter((e) => e !== on); else cbPut(b, src, ref); b.sel = null; render() },
  cbOff(id) { const b = cbD(); b.els = b.els.filter((e) => e.id !== id); b.sel = null; render() },
  cbText() { S.cbt = { text: '', color: '#121212', paper: false }; sheet(cbTextHtml()); S.ov.node = '⑤ 코디하기 · 텍스트 입력'; render() },
  cbTColor(c) { const t = document.getElementById('cbtx'); if (t) S.cbt.text = t.value; S.cbt.color = c; S.ov.html = cbTextHtml(); render() },
  cbTPaper() { const t = document.getElementById('cbtx'); if (t) S.cbt.text = t.value; S.cbt.paper = !S.cbt.paper; S.ov.html = cbTextHtml(); render() },
  cbTAdd() { const t = (document.getElementById('cbtx') || {}).value || ''; if (!t.trim()) { toast('넣을 글자를 적어 주세요'); return }
    const b = cbD(); b.els.push({ id: 'e' + b.nid++, t: 'memo', text: t.trim(), color: S.cbt.color, paper: S.cbt.paper, font: 'Pretendard', fs: 26, x: 179, y: 60 + (b.els.length * 37) % 300, r: 0, z: b.z++ }); b.tools = false; closeOv(); render() },
  cbStk() { sheet(`<div class="grab"></div><div class="cbst">스티커 추가</div><div class="cbstks">${Object.entries(CB_STK).filter(([, v]) => !v[2]).map(([k, v]) => `<button data-a="cbStkAdd" data-x="${k}" aria-label="스티커">${v[0]}</button>`).join('')}</div>`); S.ov.node = '⑤ 코디하기 · 스티커 추가'; render() },
  cbStkAdd(k) { const b = cbD(), n = b.els.length; b.els.push({ id: 'e' + b.nid++, t: 'stk', k, x: 90 + (n * 47) % 180, y: 80 + (n * 61) % 260, w: CB_STK[k][1], r: 0, z: b.z++ }); b.tools = false; closeOv(); render() },
  cbTpl() { sheet(`<div class="grab"></div><div class="cbst">템플릿</div><div class="cbss">배경 · 글자 · 스티커가 바뀌고, 올린 옷은 그대로예요</div><div class="cbtpls">${CB_TPL.map((d) => `<button data-a="cbTplUse" data-x="${d.k}">${`<div class="cbb" style="background:${CB_TPL_BG[d.bg]}"><div class="cbs">${cbTplEls(d, true).map((e) => cbEl(e, false)).join('')}</div></div>`}<b>${d.n}</b><small>${d.d}</small></button>`).join('')}</div>`); S.ov.node = '⑤ 코디하기 · 템플릿'; render() },
  cbTplUse(k) { const b = cbD(), d = CB_TPL.find((q) => q.k === k), keep = b.els.filter((e) => e.t === 'item');
    b.els = cbTplEls(d, false).map((e) => Object.assign(e, { id: 'e' + b.nid++, z: b.z++ })).concat(keep.map((e) => Object.assign(e, { z: b.z++ }))); b.bg = CB_TPL_BG[d.bg]; b.tools = false; b.sel = null; closeOv(); toast('템플릿을 적용했어요'); render() },
  cbSave() { const b = cbD(), L = cbList(); if (!cbItems(b).length && !b.els.length) return;
    const data = { name: b.name || '코디 ' + (L.length + 1), bg: b.bg, els: b.els.map((e) => Object.assign({}, e)), z: b.z, nid: b.nid };
    let id = b.id; if (id) Object.assign(L.find((q) => q.id === id), data); else { id = 'cb' + (++cbN); L.unshift(Object.assign({ id }, data)) }
    S.cd = null; toast(b.id ? '코디를 고쳤어요' : '코디북에 저장했어요'); nav = nav.filter((e) => e.s !== 'cbEdit' && !(e.s === 'cbView' && e.p.id === id)); go('cbView', { id }) },
  cbRename(id) { const b = cbList().find((q) => q.id === id); modal(`<h4>코디 이름</h4><input class="tin" id="cbnm" maxlength="20" value="${esc(b.name)}" style="margin-top:12px"><div class="mb"><button class="btn line" data-a="closeOv">취소</button><button class="btn" data-a="cbRenameOk" data-x="${id}">저장</button></div>`); S.ov.k += ' cbmd'; S.ov.node = '⑤ 코디북 · 코디 이름 바꾸기'; render() }, // cbmd: 버튼을 아티팩트 값으로 (feature.css)
  cbRenameOk(id) { const v = (document.getElementById('cbnm').value || '').trim(); if (v) cbList().find((q) => q.id === id).name = v; closeOv(); render() },
  cbCopy(id) { const b = cbList().find((q) => q.id === id), nid = 'cb' + (++cbN); cbList().unshift(Object.assign(cbCopyOf(b), { id: nid, name: b.name + ' 복사본' }));
    cbStart(Object.assign(cbCopyOf(b), { id: nid, name: b.name + ' 복사본', edit: true })); toast('코디를 복사했어요'); go('cbEdit') },
  cbAddFromView(pid) { const b = cbList().find((q) => q.id === cur().p.id); cbStart(Object.assign(cbCopyOf(b), { id: b.id, edit: true, tab: PB[pid].cat })); cbPut(cbD(), cbInCart(pid) ? 'cart' : 'rec', pid); go('cbEdit') },
  cbHelp() { S.cbTour = { step: 0 }; render() },
  cbTourNext() { if (!S.cbTour) return; S.cbTour.step++; render() },
  cbTourSkip() { S.cbTour = null; render() },
  cbShare() { S.ov = { k: 'sheet', cb: true, fmt: '45', url: null, node: '⑤ 코디북 · 코디 공유하기' }; cbShareHtml(); render(); cbShareMake() },
  cbShareFmt(f) { const o = S.ov; if (o.fmt === f) return; o.fmt = f; o.url = null; cbShareHtml(true); cbShareMake() },
  async cbShareSave() { const o = S.ov; if (!o || !o.url || o.url === 'fail') return; const name = `dangjang-codi-${o.fmt === '916' ? 'story' : 'feed'}.png`;
    const dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null; // 아티팩트 화면에서는 downloads 기능으로 저장 (확인 창이 뜸)
    if (dl) { try { await dl.save({ filename: name, data: await (await fetch(o.url)).blob() }); toast('이미지를 저장했어요'); render() } catch (e) { if (e && e.code !== 'declined') { toast('이 화면에서는 이미지를 저장할 수 없어요'); render() } } return }
    const a = document.createElement('a'); a.href = o.url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); toast('이미지를 저장했어요'); render() },
  async cbShareSend() { const o = S.ov; if (!o || !o.url || o.url === 'fail') return;
    try { const bl = await (await fetch(o.url)).blob(), file = new File([bl], 'dangjang-codi.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: '당장 코디' }); return } } catch (e) { if (e && e.name === 'AbortError') return }
    toast('이 기기에서는 공유 창을 열 수 없어 링크를 복사했어요 (데모)'); render() },
  cbShareView() { const b = cbCurBoard(); closeOv(); go('cbShared', { b: JSON.parse(JSON.stringify({ name: cbName(b), bg: b.bg, els: b.els })) }) },
  cbShareSaveNow() { closeOv(); A.cbSave() },
  cbCartOpen() { const b = cbCurBoard(); S.cbq = cbItems(b).filter((e) => e.src === 'rec').map((e) => ({ id: e.id, pid: e.ref, size: e.size && !PB[e.ref].out.includes(e.size) ? e.size : null, qty: 1 }));
    sheet(cbCartHtml()); S.ov.k = 'sheet cbsh'; S.ov.node = '⑤ 코디북 · 옵션 선택 → 장바구니 담기'; render() },
  cbQSize(x) { const [i, k] = x.split('|'); S.cbq[+i].size = k; S.ov.html = cbCartHtml(); render() },
  cbQty(x) { const [i, d] = x.split('|'), q = S.cbq[+i]; q.qty = Math.max(1, q.qty + +d); S.ov.html = cbCartHtml(); render() },
  cbCartAdd() { const b = cbCurBoard();
    S.cbq.forEach((q) => { S.cart.push({ pid: q.pid, size: q.size, qty: q.qty }); const e = b.els.find((x) => x.id === q.id); if (e) { e.src = 'cart'; e.size = q.size } });
    const n = S.cbq.reduce((a, q) => a + q.qty, 0); closeOv(); toast(`장바구니에 담았어요 · ${n}개`); render() },
  cbBuy() { const b = cbCurBoard(), items = cbItems(b).filter((e) => e.src === 'cart').map((e) => { const c = S.cart.find((q) => q.pid === e.ref); return { pid: e.ref, size: (c && c.size) || e.size, qty: (c && c.qty) || 1 } });
    need('로그인하면 주문하고, 산 옷이 옷장에 담겨요', () => { closeOv(); go('order', { items }) }) },
};

/* 입구: 내 옷장 배너 (아티팩트 완료본 cbook) */
const CB = [1, 2, 3, 4].map((n) => `https://twzcrq9rwh1icyxq.public.blob.vercel-storage.com/img/codifit/banner${n}.png`); // 사진은 레포에 두지 않고 Vercel Blob (prototype/README.md "사진")
const cbook = () => `<button class="cbook" data-a="cbook"><b>나만의 코디북 만들기${I.chev}</b><small>등록한 옷으로 코디하고 공유해요!</small><img src="${CB[0]}" alt="" style="right:29px;top:12px;width:72px;height:86px"><img src="${CB[1]}" alt="" style="right:46px;top:0;width:70px;height:70px"><img src="${CB[2]}" alt="" style="right:99px;top:25px;width:45px;height:55px"><img src="${CB[3]}" alt="" style="right:19px;top:3px;width:43px;height:52px"></button>`;
window.cbBgAny = cbBgAny; // 배경 색상환 oninput이 부름

DJ.feature({
  id: 'codifit', issue: 15, name: '코디북 (맞춰 보기 통합)', proposal: 'docs/proposals/패션북.md',
  screens: SCRX, actions: AX,
  slots: { 'closet.top': () => cbook() },
  // 아티팩트 온보딩 3 · 4장. 같은 장을 가진 #17(basefit) · #15(codibook)를 함께 켜면 그쪽 장이 이미 나오므로 빼서 겹치지 않게
  get onboard() {
    const B = 'https://twzcrq9rwh1icyxq.public.blob.vercel-storage.com/img/codifit/';
    return [
      DJ.isOn('basefit') ? null : ["홈에서 바로 추천", "내 옷과 실측이 가까운<br>랭킹 상품을 골라드려요", "비교할 내 옷을 바꾸면 상품도 바로 바뀌어요.<br>품절 사이즈는 빼고 보여 드려요.", 282, B + 'onboard3.webp'],
      DJ.isOn('codibook') ? null : ["나만의 코디북", "옷장 옷으로 코디하고<br>친구에게 공유해요", "등록한 옷을 골라 한 장에 놓아 보세요.<br>사려는 상품도 같이 놓아 보면<br>가진 옷과 어울리는지 미리 알 수 있어요.", 282, B + 'onboard4-v2.png'],
    ].filter(Boolean);
  },
  start() { if (!document.getElementById('cbFontsX')) document.head.insertAdjacentHTML('beforeend', '<link id="cbFontsX" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Caveat:wght@600&family=Gaegu:wght@700&family=Jua&display=swap">') }, // 템플릿 글꼴 (아티팩트 head에 있던 것)
  after() { cbBind() },
});
})();
