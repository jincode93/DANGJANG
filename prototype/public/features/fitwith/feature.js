/* ── 신기능 #19 내 옷이랑 맞춰 보기: 장바구니 상품을 내 옷장 옷과 4:5 바닥에 놓아 보고 저장 ──
   제안서 docs/proposals/내-옷이랑-맞춰-보기.md · 이슈 https://github.com/jincode93/DANGJANG/issues/19
   원본: 팀원(juribb) 데모 claude.ai/artifact/UvFZFSD3wVZZjdM59qpMtR (2026-10-30 버전 8). 동작은 그대로 옮기고, 완료본과 맞물리는 곳만 고침
     - 화면 · 동작은 DJ.feature로 등록 (완료본 SCR · A를 직접 건드리지 않음)
     - 입구: 장바구니 위 바(cart.top) · 내 옷장 위(closet.top) · 마이 메뉴(my.menu) · 옷 등록 완료에서 돌아가기(reg.done)
     - 장바구니 체크박스는 붙이지 않음. 바닥에 처음 놓는 건 장바구니 첫 상품이고, 다른 상품은 바닥 아래 목록에서 고름
     - 원본의 내 옷장 "옷 / 코디" 탭 대신 저장 목록을 따로 연 화면(SCR.cody)으로
   2차(버전 8): 바닥에 놓는 옷 개수 제한 없음 · 같은 종류 여러 벌은 겹쳐 입기처럼 비켜 겹침 · 고른 옷 '맨 뒤로 · 빼기'
     · 새 코디 저장 뒤 그 화면에 머묾 · 저장 안 하고 나갈 때 확인 · 주문/장바구니 담기 때 '이 코디도 저장' · 바닥에 놓인 표시는 체크
   데이터는 열어 둔 동안만 기억 (기기 저장 없음) */
(() => {
const SCRX = {}, AX = {};
const CD = () => (S.cody = S.cody || { saved: [] }); // reset()이 S를 새로 만들어서 쓸 때 만듦
const CODY_K = 2.5; // 실측 1cm → 2.5px
const CODY_CATS = ['outer', 'top', 'bottom']; // 바닥에 놓을 수 있는 종류
// 바닥 크기: 인스타그램 피드 비율 4:5 고정. 스토리 공유는 나중에 위아래 여백을 붙여 9:16(1080 × 1920)으로 내보내요
const CODY_W = 350, CODY_H = 438;
const CODY_X = { outer: 86, top: 258, bottom: 258 }; // 종류별 첫 옷의 가운데 x
const codyLen = (cat) => ({ top: 68, outer: 70, bottom: 103 })[cat] || 70;
const jo = (w, a, b) => (w.charCodeAt(w.length - 1) - 0xAC00) % 28 ? a : b; // 받침 있으면 a
const josa = (w) => jo(w, '이', '가');
const cartOn = () => S.cart; // 완료본 장바구니에는 체크박스가 없어 전부
const inCart = (pid) => S.cart.find((c) => c.pid === pid);
const codyTagOf = (pid) => inCart(pid) ? '장바구니' : '구매 전';
const codyIt = (k, id, size) => ({ u: 'i' + (uid++), k, id, size: size || null }); // 바닥에 놓인 옷 한 벌
const codyCatOf = (x) => x.k === 'p' ? (PB[x.id] || {}).cat : (S.closet.find((c) => c.id === x.id) || {}).cat;
const codyCopyIts = (its) => JSON.parse(JSON.stringify(its || []));
// 맞춰 볼 상품 = 장바구니 상품 + (장바구니 밖에서 열었으면) 지금 바닥에 놓인 상품
const codyPend = (its) => [...new Set([...S.cart.map((c) => c.pid), ...(its || []).filter((x) => x.k === 'p').map((x) => x.id)])].filter((id) => id && PB[id]);
// ── 누끼: 바닥에는 배경을 지운 사진을 올려요
// 상품은 바닥컷(디자이너가 고른 무신사 상품 사진)이 있으면 그걸, 없으면 상품 사진을 써요. 내 옷은 옷장의 바닥컷
// 사진 가장자리에서 시작해 배경색과 이어진 부분만 투명하게 하고, 옷만 남게 잘라요(실측 비율로 그릴 때 여백이 없어야 길이가 맞아요)
// 처음 쓸 때 한 번 만들어 기억하고, 만들기 전이거나 배경이 한 가지 색이 아니라서 못 만들면 사진 박스 그대로 보여 줘요
const CODY_CUT = {}; let codyCutT = 0;
function codyKeyCut(im, tol = 12) {
  const w = im.naturalWidth, h = im.naturalHeight, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0); const D = g.getImageData(0, 0, w, h), d = D.data;
  const px = (x, y) => (y * w + x) * 4, cs = [px(0, 0), px(w - 1, 0), px(0, h - 1), px(w - 1, h - 1)], bg = [d[cs[0]], d[cs[0] + 1], d[cs[0] + 2]];
  const near = (i, t) => Math.abs(d[i] - bg[0]) <= t && Math.abs(d[i + 1] - bg[1]) <= t && Math.abs(d[i + 2] - bg[2]) <= t;
  if (!cs.every((i) => near(i, tol * 2))) return null; // 네 귀퉁이 색이 다르면 배경이 한 가지 색이 아님 (모델 착용 사진 등)
  const seen = new Uint8Array(w * h), st = []; let gone = 0;
  for (let x = 0; x < w; x++) st.push(x, (h - 1) * w + x); for (let y = 0; y < h; y++) st.push(y * w, y * w + w - 1);
  while (st.length) { const q = st.pop(); if (seen[q]) continue; seen[q] = 1; if (!near(q * 4, tol)) continue; d[q * 4 + 3] = 0; gone++;
    const x = q % w, y = (q / w) | 0; if (x > 0) st.push(q - 1); if (x < w - 1) st.push(q + 1); if (y > 0) st.push(q - w); if (y < h - 1) st.push(q + w); }
  const f = gone / (w * h); if (f < 0.12 || f > 0.92) return null; // 거의 안 지워졌거나 옷까지 지워졌으면 실패로 봄
  let x0 = w, y0 = h, x1 = 0, y1 = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[px(x, y) + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 - x0 + 1 >= w * 0.96 && y1 - y0 + 1 >= h * 0.96) return null; // 남은 부분이 사진 끝까지 꽉 차면 옷 한 벌이 아님 (모델 착용 사진 등) → 사진 박스로
  g.putImageData(D, 0, 0); const o = document.createElement('canvas'); o.width = x1 - x0 + 1; o.height = y1 - y0 + 1; o.getContext('2d').drawImage(cv, -x0, -y0);
  return o.toDataURL('image/png');
}
function codyCutOf(url) {
  if (!url) return null; const c = CODY_CUT[url]; if (c) return c.src || null;
  CODY_CUT[url] = { wait: true }; const im = new Image(); im.crossOrigin = 'anonymous';
  im.onload = () => { let r = null; try { r = codyKeyCut(im) } catch (e) {} CODY_CUT[url] = { src: r };
    if (r) { clearTimeout(codyCutT); codyCutT = setTimeout(() => { const s0 = cur() && cur().s; if (['codyMake', 'codyView', 'cody'].includes(s0) && !S.ov) render() }, 80) } };
  im.onerror = () => { CODY_CUT[url] = { src: null } }; im.src = url; return null;
}
const codyFlat = (p) => IMG['flat_' + p.id] || null; // 상품의 바닥컷 (없으면 null)
function codyRef(r) {
  if (!r) return null;
  if (r.k === 'p') {
    const p = PB[r.id]; if (!p) return null;
    const j = judge(p), ks = sizeKeys(p) || [], sz = r.size || (j.n === 5 ? j.rec : ks[0]);
    const len = p.sizes && p.sizes[sz] && +p.sizes[sz][0];
    const src = codyFlat(p) || IMG[p.img], k = CUT[p.img] || codyCutOf(src);
    return { p, name: p.name, img: k || src, cut: !!k, len: len || codyLen(p.cat), size: sz, cat: p.cat, pend: codyTagOf(p.id) };
  }
  const c = S.closet.find((x) => x.id === r.id); if (!c || !c.img) return null; // 사진 없는 옷(도식화)은 코디에 놓지 않아요
  const k = CUT[c.img] || codyCutOf(IMG[c.img]);
  return { c, name: c.name, img: k || IMG[c.img], cut: !!k, len: (c.m && +c.m[0]) || codyLen(c.cat), size: c.size, cat: c.cat };
}
const codyL = (its) => (its || []).map((x) => ({ x, r: codyRef(x) })).filter((e) => e.r); // 그릴 수 있는 옷만
const codySrc = (e) => e.r.c || e.r.p;
// 첫 배치: 장바구니 상품과 계절을 맞춰 그 그룹의 기준 옷을 놓아요
// 긴팔 계절 → 긴팔 상의 · 긴바지(긴치마) · 아우터 / 반팔 계절 → 반팔 상의 · 반바지(짧은 치마), 아우터는 비워요
const CODY_GRP = { long: { top: ['top-l'], bottom: ['pants-l', 'skirt-l'], outer: ['outer-s', 'outer-l'] }, short: { top: ['top-s'], bottom: ['pants-s', 'skirt-s'], outer: [] } };
const codySeason = (x) => /-s$/.test(grpOf(x)) && x.cat !== 'outer' ? 'short' : 'long'; // 아우터의 outer-s는 '짧은 아우터'라 계절과 무관
function codyPickC(cat, season = 'long') {
  const gs = CODY_GRP[season][cat]; if (!gs.length) return null; // 반팔 계절의 아우터는 비워요
  const all = S.closet.filter((c) => c.cat === cat && c.fit === 'good' && c.img), a = all.filter((c) => gs.includes(grpOf(c)));
  const pick = (l) => l.find((c) => c.subBase) || l.find((c) => c.base) || l[0] || null; // 세부 종류 기준 옷 → 대분류 기준 옷 → 먼저 담은 옷
  return pick(a) || pick(all); // 계절에 맞는 옷이 없으면 그 종류에서 내가 등록한 옷(기준 옷 먼저)
}
// 기본 배치(뒤 → 앞): 아우터 · 하의 · 상의
function codyDefault(season = 'long') { return ['outer', 'bottom', 'top'].map((k) => { const c = codyPickC(k, season); return c ? codyIt('c', c.id) : null }).filter(Boolean) }
// 첫 배치에 상품 하나 넣기: 같은 종류 내 옷 자리에 놓아요 (없으면 더해요)
function codyWith(its, pid, size) { const k = PB[pid].cat, i = its.findIndex((x) => codyCatOf(x) === k), it = codyIt('p', pid, size); if (i >= 0) its[i] = it; else its.push(it); return it }
// 기본 배경 5가지 (톤이 서로 다른 색). 그 밖의 색은 옆 아이콘의 '직접 고르기'로 골라 hex로 저장해요
const CODY_BG = [['warm', '웜 그레이', '#BAB4AA'], ['cream', '크림', '#EEE8DD', 1], ['sage', '세이지', '#AAB5A2'], ['rose', '더스티 로즈', '#D8B4B0'], ['char', '차콜', '#4B4845']];
const codyLt = (h) => { const n = parseInt(h.slice(1), 16); return (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255 > 0.62 };
const codyBg = (k) => k && k[0] === '#' ? [k, '고른 색', k, codyLt(k) ? 1 : 0] : CODY_BG.find((b) => b[0] === k) || CODY_BG[0];
// 바닥 그리기: live면 옷을 끌어 옮기고 눌러 맨 앞으로, 아니면(저장한 코디 썸네일) 그림만. o.pos = 옮긴 위치, o.bg = 바닥색, o.sel = 고른 옷
// 기본 자리: 아우터는 왼쪽, 상의는 오른쪽 위, 하의는 그 아래. 아우터가 없으면 가운데. 같은 종류 n번째 옷은 오른쪽 아래로 조금씩 비켜 겹쳐요
// 크기 · 회전: pos[u]에 s(배율, 1 = 실측) · r(각도)를 같이 저장해요. 글자 · 스티커(k 't' · 's')도 바닥 위 꾸미기로 its에 같이 넣어요
// 꾸미기는 codyRef가 null이라 추천 · 비슷한 상품 · 주문 · 제목 계산에는 들어가지 않아요
const CODY_XS = '<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>';
const codyTf = (p) => `--s:${(p && p.s) || 1};--r:${(p && p.r) || 0}deg`;
const codyDeco = (x) => x.k === 't' || x.k === 's';
const codyEmoji = (t) => !/[#A-Za-z0-9가-힣]/.test(t);
const CODY_TC = [['#FFFFFF', '#111111'], ['#111111', '#FFFFFF'], ['#27C45B', '#FFFFFF'], ['#FF5A5F', '#FFFFFF'], ['#FFD84D', '#111111']]; // [글자색, 상자일 때 글자색]
const codyTc = (c) => CODY_TC.find((x) => x[0] === c) || CODY_TC[0];
const codyDecoHtml = (x) => x.k === 't' ? `<span class="tx ${x.b ? 'box' : ''}" style="${x.b ? `background:${codyTc(x.c)[0]};color:${codyTc(x.c)[1]}` : `color:${codyTc(x.c)[0]}`}">${esc(x.id)}</span>`
  : codyEmoji(x.id) ? `<span class="em">${esc(x.id)}</span>` : `<span class="wd">${esc(x.id)}</span>`;
// 고른 것의 손잡이: 오른쪽 위 ×(빼기) · 오른쪽 아래 크기 · 회전
const codyHandles = (u) => `<span class="cf-x" data-a="codyRemove" data-x="${u}" role="button" aria-label="빼기">${CODY_XS}</span><span class="cf-rs" aria-label="끌어서 크기 · 회전"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg></span>`;
function codyFloor(its, live, o = {}) {
  const L = codyL(its), H = (r) => Math.round(r.len * CODY_K), IH = H; // 누끼든 사진 박스든 높이 = 총장(cm) × 2.5
  const tag = live ? 'button' : 'span', pos = o.pos || {}, bg = codyBg(o.bg), h = CODY_H, sel = live ? o.sel : null;
  const by = (k) => L.filter((e) => e.r.cat === k), cx = by('outer').length ? null : CODY_W / 2;
  const t0 = by('top')[0], tH = t0 ? IH(t0.r) : 150;
  const P0 = { outer: { x: CODY_X.outer, y: 22 }, top: { x: cx || CODY_X.top, y: 16 }, bottom: { x: cx || CODY_X.bottom, y: t0 ? 16 + tH - 26 : 60 } };
  const n = {}, ps = L.map((e) => { const k = e.r.cat, i = (n[k] = (n[k] === undefined ? -1 : n[k]) + 1), b = P0[k] || P0.top; return { e, x: b.x + 22 * i, y: b.y + 16 * i, ih: IH(e.r) } });
  const dy = Math.max(0, Math.round((h - Math.max(0, ...ps.map((q) => q.y + q.ih))) / 2) - 10);
  const at = {}, items = [], one = (q) => { const u = q.e.x.u, s = pos[u] || { x: q.x, y: q.y + dy }, y = Math.max(0, Math.min(h - q.ih, s.y)); at[u] = { x: s.x, y };
    items.push({ u, x: s.x, y, ih: q.ih, img: q.e.r.img, cut: q.e.r.cut, s: s.s || 1, r: s.r || 0 });
    const on = sel === u;
    return `<${tag} class="cf-it ${q.e.r.cut ? '' : 'ph'} ${on ? 'sel' : ''} ${(s.s || 1) !== 1 ? 'tf' : ''}" ${live ? `data-a="codyTap" data-x="${u}"` : ''} style="left:${s.x}px;top:${y}px;height:${q.ih}px;${codyTf(s)}" aria-label="${esc(q.e.r.name)}${live ? ' · 누르면 맨 앞으로' : ''}"><img src="${q.e.r.img}" alt="" draggable="false">${live && q.e.x.k === 'p' ? `<span class="cf-ptag ${q.e.r.pend === '장바구니' ? 'c' : ''}">${q.e.r.pend === '장바구니' ? '장바구니' : '구매 전'}</span>` : ''}${on ? codyHandles(u) : ''}</${tag}>` };
  const decos = (its || []).filter(codyDeco).map((x) => { const s = pos[x.u] || { x: CODY_W / 2, y: CODY_H / 2 }; at[x.u] = { x: s.x, y: s.y }; return { x, s } });
  const dh = decos.map(({ x, s }) => `<${tag} class="cf-it cf-deco ${sel === x.u ? 'sel' : ''}" ${live ? `data-a="codyTap" data-x="${x.u}"` : ''} style="left:${s.x}px;top:${s.y}px;${codyTf(s)}" aria-label="${x.k === 't' ? '글자' : '스티커'} ${esc(x.id)}">${codyDecoHtml(x)}${sel === x.u ? codyHandles(x.u) : ''}</${tag}>`).join('');
  const html = `${ps.map(one).join('')}${dh}${live && !L.length && !decos.length ? '<div class="cf-empty">아래 목록에서 옷을 눌러 바닥에 놓아 보세요</div>' : ''}`
  return { L, by, at, h, bg: bg[2], items, decos, html: `<div class="cf-floor ${live ? 'live' : ''} ${bg[3] ? 'lt' : ''}" ${live ? 'data-a="codyDesel"' : ''} style="height:${h}px;background:${bg[2]}">${html}</div>` };
}
// 끌기: 6px 넘게 움직이면 옮기기, 아니면 눌러서 고르기. 빼기는 고른 옷의 × 로
// 오른쪽 아래 손잡이를 끌거나 두 손가락이면 크기 · 회전. 100% · 0° 근처에서는 붙어서 실측으로 쉽게 돌아와요
let codyDrag = null, codySkip = false, codyUndo = null; const codyPts = new Map();
const codyGest = () => { const [a, b] = [...codyPts.values()]; return { dist: Math.hypot(b.x - a.x, b.y - a.y), ang: Math.atan2(b.y - a.y, b.x - a.x) } };
app.addEventListener('pointerdown', (e) => {
  if (!e.target.closest('.cf-floor.live')) return;
  codyPts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const pp = cur().p; if (pp && !pp.hinted) pp.hinted = true;
  const d0 = codyDrag; if (d0 && codyPts.size === 2) { Object.assign(d0, { mode: 'pinch', g0: codyGest(), s0: d0.s, r0: d0.r, moved: true }); return }
  const it = e.target.closest('.cf-floor.live .cf-it'); if (!it || e.button > 0 || e.target.closest('.cf-x')) return;
  const fl = it.parentElement, sc = fl.getBoundingClientRect().width / CODY_W, s = parseFloat(it.style.getPropertyValue('--s')) || 1, r = parseFloat(it.style.getPropertyValue('--r')) || 0;
  codyDrag = { it, fl, u: it.dataset.x, x0: e.clientX, y0: e.clientY, l: parseFloat(it.style.left), t: parseFloat(it.style.top), sc, s, r, moved: false, mode: 'move' };
  if (e.target.closest('.cf-rs')) { const b = it.getBoundingClientRect(), c = { x: b.left + b.width / 2, y: b.top + b.height / 2 };
    Object.assign(codyDrag, { mode: 'rs', c, g0: { dist: Math.hypot(e.clientX - c.x, e.clientY - c.y), ang: Math.atan2(e.clientY - c.y, e.clientX - c.x) }, s0: s, r0: r, moved: true }) }
  try { it.setPointerCapture(e.pointerId) } catch (er) {}
});
app.addEventListener('pointermove', (e) => {
  if (codyPts.has(e.pointerId)) codyPts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const d = codyDrag; if (!d) return;
  if (d.mode !== 'move') { e.preventDefault();
    const g = d.mode === 'rs' ? { dist: Math.hypot(e.clientX - d.c.x, e.clientY - d.c.y), ang: Math.atan2(e.clientY - d.c.y, e.clientX - d.c.x) } : codyPts.size > 1 ? codyGest() : null; if (!g) return;
    let s = Math.max(0.3, Math.min(3, d.s0 * g.dist / Math.max(1, d.g0.dist))), r = d.r0 + (g.ang - d.g0.ang) * 180 / Math.PI;
    r = ((r % 360) + 540) % 360 - 180; if (Math.abs(s - 1) < 0.05) s = 1; if (Math.abs(r) < 4) r = 0;
    d.s = s; d.r = r; d.it.style.setProperty('--s', s.toFixed(3)); d.it.style.setProperty('--r', r.toFixed(1) + 'deg'); d.it.classList.toggle('tf', s !== 1); return }
  const dx = (e.clientX - d.x0) / d.sc, dy = (e.clientY - d.y0) / d.sc;
  if (!d.moved && Math.hypot(dx, dy) < 6) return;
  d.moved = true; d.it.classList.add('drag'); d.fl.classList.add('dragging'); e.preventDefault();
  // 옷 전체가 바닥(350 × 438) 안에 머물도록
  const hw = Math.min(d.it.offsetWidth / 2, CODY_W / 2);
  d.it.style.left = Math.max(hw, Math.min(CODY_W - hw, d.l + dx)) + 'px';
  d.it.style.top = Math.max(0, Math.min(CODY_H - d.it.offsetHeight, d.t + dy)) + 'px';
});
const codyDrop = (e) => {
  if (e && codyPts.has(e.pointerId)) codyPts.delete(e.pointerId);
  const d = codyDrag; if (!d) return;
  if (d.mode === 'pinch' && codyPts.size) return; // 두 손가락 중 하나만 뗐으면 기다려요
  codyDrag = null; codyPts.clear(); if (!d.moved) return;
  codySkip = true; setTimeout(() => { codySkip = false }, 80);
  const pp = cur().p; pp.pos = Object.assign({}, pp.pos, { [d.u]: { x: Math.round(parseFloat(d.it.style.left)), y: Math.round(parseFloat(d.it.style.top)), s: +(+d.s).toFixed(3), r: +(+d.r).toFixed(1) } });
  codyFront(pp, d.u); pp.card = d.u; render(); // 옮기거나 크기를 바꾼 것은 맨 앞으로 오고 골라져요
};
app.addEventListener('pointerup', codyDrop); app.addEventListener('pointercancel', codyDrop);
const codyToPanel = () => setTimeout(() => { const el = document.getElementById('codyPanel'); if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' }) }, 30);
// 고른 옷을 맨 앞(목록 끝)으로 보내고, 아래 목록 탭도 그 종류로
const codyFront = (pp, u) => { const i = pp.its.findIndex((x) => x.u === u); if (i < 0) return; const [x] = pp.its.splice(i, 1); pp.its.push(x); pp.sel = u; pp.ct = codyCatOf(x) };
// 직접 고르기: 색을 고르고 창을 닫으면(change) 바닥에 반영
app.addEventListener('change', (e) => { if (e.target.id === 'codyColor' && cur() && cur().s === 'codyMake') A.codyBgSet(e.target.value.toUpperCase()) });
// ── 코디 제목: 태그(#출근 · #주말 …)와 계절, 대표 옷으로 추천해요. 사용자는 고쳐 쓸 수 있어요
const CODY_TAGS = ['출근', '주말', '약속', '여행', '데일리'];
const CODY_SW = { 봄: ['봄', '산뜻한 봄'], 여름: ['여름', '시원한 여름'], 가을: ['가을', '선선한 가을'], 늦가을: ['늦가을', '쌀쌀한 늦가을'], 겨울: ['겨울', '포근한 겨울'] };
const CODY_TT = { 출근: ['{s} 출근룩', '{s} 오피스 코디', '{i} 출근 코디'], 주말: ['{s} 주말 나들이룩', '{s} 주말 코디', '{i} 주말 코디'], 약속: ['{s} 약속룩', '{s} 데이트 코디', '{i} 약속 코디'],
  여행: ['{s} 여행룩', '{s} 여행 코디', '{i} 여행 코디'], 데일리: ['{s} 데일리룩', '{i} 데일리 코디', '{s} 기본 코디'] };
// 계절감: 옷에서 먼저(패딩 → 겨울, 코트 → 늦가을, 상의가 모두 반팔이고 아우터 없음 → 여름), 아니면 지금 달
function codySeasonWord(L) {
  const os = L.filter((e) => e.r.cat === 'outer'), ts = L.filter((e) => e.r.cat === 'top');
  if (os.some((e) => /패딩/.test(codySrc(e).sub || ''))) return '겨울';
  if (os.some((e) => /코트/.test(codySrc(e).sub || ''))) return '늦가을';
  if (ts.length && !os.length && ts.every((e) => codySeason(codySrc(e)) === 'short')) return '여름';
  const m = new Date().getMonth() + 1; return m >= 3 && m <= 5 ? '봄' : m >= 6 && m <= 8 ? '여름' : m >= 9 && m <= 11 ? '가을' : '겨울';
}
// 대표 옷 이름: 상품이 있으면 그 상품, 없으면 상의의 세부 종류 (예: 니트, 긴팔 셔츠)
function codyKeyItem(L) {
  const p = L.find((e) => e.r.p); if (p) return p.r.p.tag || p.r.p.sub || CAT[p.r.cat];
  const t = L.find((e) => e.r.cat === 'top') || L[0]; return t ? (codySrc(t).sub || CAT[t.r.cat]).replace(/^긴팔 |^반팔 /, '') : '데일리';
}
function codyTitleOf(its, tag, n = 0) {
  const L = codyL(its), sw = CODY_SW[codySeasonWord(L)], tt = CODY_TT[tag] || CODY_TT['데일리'], t = tt[n % tt.length];
  return t.replace('{s}', sw[Math.floor(n / tt.length) % sw.length]).replace('{i}', codyKeyItem(L));
}
function codySaveSheet(patch) {
  const o = S.ov, two = o.mode === 'edit' || o.mode === 'resave';
  o.html = `<div class="grab"></div><div style="font-size:18px;font-weight:800">${o.mode === 'edit' ? '수정한 코디를 저장할게요' : o.mode === 'rename' ? '이름과 태그 바꾸기' : '이 코디를 저장할게요'}</div>
    <label class="cf-lbl" for="codyTitle">제목</label>
    <div class="cf-tin"><input id="codyTitle" maxlength="24" value="${esc(o.title)}" autocomplete="off"><button data-a="codyTitleNext" aria-label="다른 제목 추천">다른 추천</button></div>
    <div class="cf-hint">계절과 고른 태그로 추천했어요. 직접 고쳐 써도 돼요</div>
    <div class="cf-lbl">태그 <small>여러 개 골라도 돼요</small></div>
    <div class="cf-tags">${CODY_TAGS.map((t) => `<button class="${o.tags.includes(t) ? 'on' : ''}" data-a="codyTag" data-x="${t}" aria-pressed="${o.tags.includes(t)}">#${t}</button>`).join('')}</div>
    ${two ? `<button class="btn" style="margin-top:18px" data-a="codySaveOk">${o.mode === 'edit' ? '이 코디에 저장' : '저장하기'}</button><button class="btn line" style="margin-top:8px" data-a="codySaveNew">새 코디로 저장</button>`
      : `<button class="btn" style="margin-top:18px" data-a="codySaveOk">${o.mode === 'rename' ? '바꾸기' : '저장하기'}</button>`}`;
  if (patch) { const sh = app.querySelector('.sheet'); if (sh) sh.innerHTML = o.html }
}
// ── 추천 상품: 바닥에 놓인 다른 종류 옷을 기준으로, 고른 종류(상의 · 하의 · 아우터)에 놓을 상품을 골라요
// 순서: ① 내 옷 기준 추천 사이즈가 있는 상품 ② 같은 세부 종류(그 종류 내 옷이 없으면 계절 그룹) ③ 계절 ④ 색 톤 ⑤ 태그 ⑥ 후기 많은 순. 점수나 %는 보여 주지 않고 이유만 보여 줘요(REC-05)
// 그 종류의 상품은 기준에서 빼요. 그래야 추천 상품을 놓았다 뺐다 해도 목록이 흔들리지 않아요
// 데모 가정: 색 계열은 사진을 보고 손으로 붙인 값, 스타일 태그는 상품 이름 · 종류의 키워드로 대신해요 (실서비스는 입점 데이터로 받아야 함)
const CODY_TONE = { hero: '무채색', base: '블루', jacket: '블루', knit: '브라운·베이지', slacks: '무채색', denim: '블루', tee: '무채색', puffer: '블루', leather: '무채색', suede: '브라운·베이지', lpuffer: '블루', tee2: '브라운·베이지', blackp: '무채색', wide: '블루', dshirt: '블루', pdHero: '블루', denim_k: '무채색', slacks_b: '브라운·베이지', denim_i: '블루', slacks_n: '블루', ltee: '브라운·베이지' };
const CODY_STYLE = { 출근: ['셔츠', '니트', '슬랙스', '코트', '재킷'], 주말: ['티셔츠', '데님', '후드', '패딩'], 약속: ['셔츠', '니트', '슬랙스', '레더', '스웨이드'], 여행: ['티셔츠', '데님', '후드', '패딩'], 데일리: ['티셔츠', '데님', '셔츠', '니트'] };
function codyRecs(its, k, tags = [], o = {}) {
  const L = codyL(its).filter((e) => !(e.r.cat === k && e.r.p)), now = L.filter((e) => e.r.cat === k).pop(), others = L.filter((e) => e.r.cat !== k);
  const sw = codySeasonWord(L), se = sw === '여름' ? 'short' : 'long';
  const nowSub = now ? codySrc(now).sub : null, nowG = now ? grpOf(codySrc(now)) : null, tones = others.map((e) => CODY_TONE[codySrc(e).img]).filter(Boolean);
  const onFloor = others.filter((e) => e.r.p).map((e) => e.x.id);
  return Object.values(PB).filter((p) => p.cat === k && !onFloor.includes(p.id) && !(o.noCart && inCart(p.id)) && !(o.skip || []).includes(p.id) && sizeKeys(p).some((z) => !p.out.includes(z))).map((p) => {
    const j = judge(p), fit = j.n === 5, g = grpOf(p);
    const subR = nowSub ? (p.sub === nowSub ? 0 : g === nowG ? 1 : 2) : ((CODY_GRP[se][k] || []).includes(g) ? 1 : 2);
    const seOk = codySeason(p) === se, t = CODY_TONE[p.img], toneOk = t === '무채색' || tones.includes(t);
    const tag = tags.find((x) => (CODY_STYLE[x] || []).some((w) => (p.name + (p.sub || '') + (p.tag || '')).includes(w)));
    const why = [fit ? `추천 ${j.rec}` : null, subR < 2 ? (p.sub || p.tag) : null, seOk ? sw : null, toneOk ? (t === '무채색' ? '무채색' : '같은 톤') : null, tag ? '#' + tag : null].filter(Boolean);
    return { p, rec: fit ? j.rec : null, why, key: [fit ? 0 : 1, subR, seOk ? 0 : 1, toneOk ? 0 : 1, tag ? 0 : 1, -(p.rev || 0)] };
  }).sort((a, b) => { for (let i = 0; i < a.key.length; i++) if (a.key[i] !== b.key[i]) return a.key[i] - b.key[i]; return 0 }).slice(0, o.n || 5);
}
// ── 비슷한 상품: 바닥에서 고른 옷(내 옷이든 상품이든)과 비슷한 상품. 옆에 놓아 견줘 보라고 보여 줘요
// 순서: ① 같은 세부 종류 ② 같은 그룹(예: 긴팔 상의) ③ 비슷한 색 ④ 내 옷 기준 추천 사이즈가 있는 상품 ⑤ 후기 많은 순. 점수나 %는 보여 주지 않고 이유만(REC-05)
// 홈 랭킹(실시간)에서 그 세부 종류 칩을 눌렀을 때의 순위: 같은 대분류 · 세부 종류 안에서 후기 많은 순 (app.js tabRank와 같은 기준)
const CODY_RANK = {};
const codyRank = (p) => { const k = p.cat + '|' + p.sub; if (!CODY_RANK[k]) { CODY_RANK[k] = {}; P.filter((x) => x.cat === p.cat && x.sub === p.sub).sort((a, b) => b.rev - a.rev).forEach((x, i) => { CODY_RANK[k][x.id] = i + 1 }) } return CODY_RANK[k][p.id] || 999 };
function codySimilar(its, u, n = 8) {
  const e = codyL(its).find((v) => v.x.u === u); if (!e) return [];
  const b = codySrc(e), k = e.r.cat, bSub = b.sub, bG = grpOf(b), bT = CODY_TONE[b.img];
  const all = Object.values(PB).filter((p) => p.cat === k && !(e.x.k === 'p' && p.id === e.x.id) && sizeKeys(p).some((z) => !p.out.includes(z))).map((p) => {
    const j = judge(p), fit = j.n === 5, subR = p.sub === bSub ? 0 : grpOf(p) === bG ? 1 : 2, toneOk = !!bT && CODY_TONE[p.img] === bT, rk = codyRank(p);
    const why = [subR === 0 ? '같은 종류' : subR === 1 ? '비슷한 종류' : null, toneOk ? '비슷한 색' : null, fit ? `추천 ${j.rec}` : null, `랭킹 ${rk}위`].filter(Boolean);
    return { p, rec: fit ? j.rec : null, why, subR, key: [subR, rk] }; // 순서는 홈 랭킹 그대로, 핏 · 색은 칩으로만
  }).sort((a, b2) => { for (let i = 0; i < a.key.length; i++) if (a.key[i] !== b2.key[i]) return a.key[i] - b2.key[i]; return 0 });
  const near = all.filter((r) => r.subR < 2); return (near.length ? near : all).slice(0, n); // 같은 · 비슷한 종류가 없으면 같은 대분류에서
}
const codyRecCard = (r, act, x) => `<button class="cf-rec" data-a="${act}" data-x="${x}"><span class="img"><img src="${IMG[r.p.img]}" alt=""></span><b>${esc(r.p.name)}</b><span class="pr num">${won(sale(r.p))}원</span><span class="why">${r.why.slice(0, 4).map((w) => `<i>${w}</i>`).join('')}</span></button>`;
const codyRecRow = (recs, act, xf, empty) => recs.length ? `<div class="cf-recs">${recs.map((r) => codyRecCard(r, act, xf(r))).join('')}</div>` : `<div class="cf-recnone">${empty}</div>`;
// 지금 화면의 옷 목록: 맞춰 보기 화면이면 그 목록, 저장한 코디 상세면 저장된 목록
const codyCurIts = () => { const c = cur(); if (c.s === 'codyView') { const q = CD().saved.find((x) => x.id === c.p.id); return q ? q.its : [] } return c.p.its };
const codyProds = (its) => [...new Set(its.filter((x) => x.k === 'p' && PB[x.id]).map((x) => x.id))];
const codySnap = (o) => JSON.stringify({ its: o.its, pos: o.pos || null, bg: o.bg || null });
const codyDirty = (pp) => pp.snap !== codySnap(pp);
// 맞춰 보기 화면 열기: 들어올 때의 배치를 기억해 두고, 바뀐 채로 나가면 확인해요
const codyGo = (pp) => { pp.snap = codySnap(pp); go('codyMake', pp) };
// 주문 전 옵션 확인: 바닥에 놓인 상품의 컬러 · 사이즈 · 수량을 한 번 더 보고 주문해요. 사이즈 칩에는 내 옷 기준 추천을 같이 보여 줘요(ORD-07)
// 맞춰 보기 화면에서 저장하지 않은 코디면 '이 코디도 저장해 둘게요'를 켜 둔 채로 보여 줘요 (주문하고 나면 꾸민 코디가 사라지지 않게)
function codyOptSheet(patch) {
  const o = S.ov, n = o.items.reduce((a, it) => a + it.qty, 0), sum = o.items.reduce((a, it) => a + sale(PB[it.pid]) * it.qty, 0);
  o.html = `<div class="grab"></div><div style="font-size:18px;font-weight:800">옵션을 확인해 주세요</div>
    <div class="cf-hint" style="margin-top:4px">${o.mode === 'cart' ? '코디에 놓인 상품을 장바구니에 담아요. 사이즈는 내 옷 기준 추천으로 골라 뒀어요' : '코디에 놓인 장바구니 상품이에요. 바꾼 옵션은 장바구니에도 반영돼요'}</div>
    ${o.items.map((it, i) => { const p = PB[it.pid], j = judge(p), base = j.n === 5 ? j.base : null;
      return `<div class="cf-os"><div class="cf-osh"><img src="${IMG[p.img]}" alt=""><div><small>${esc(p.brand)}</small><b>${esc(p.name)}</b><span class="num">${won(sale(p) * it.qty)}원</span></div></div>
        ${p.colors && p.colors.length > 1 ? `<div class="cf-osl">컬러</div><div class="cf-tags">${p.colors.map((c) => `<button class="${it.color === c ? 'on' : ''}" data-a="codyOptColor" data-x="${i}|${c}" aria-pressed="${it.color === c}">${c}</button>`).join('')}</div>` : ''}
        <div class="cf-osl">사이즈${base ? ` <small>${esc(base.name)} 기준</small>` : ''}</div>
        <div class="cf-tags cf-oss">${sizeKeys(p).map((k) => { const out = p.out.includes(k), w = !out && base && p.sizes ? fitWord(p, base, k) : '';
          return `<button class="${it.size === k ? 'on' : ''}" data-a="codyOptSize" data-x="${i}|${k}" ${out ? 'disabled' : ''} aria-pressed="${it.size === k}">${k}${out ? ' · 품절' : ''}${!out && base && k === j.rec ? '<em>추천</em>' : ''}${w ? `<small>${w}</small>` : ''}</button>` }).join('')}</div>
        <div class="cf-osq"><span>수량</span><div class="pd-qty"><button class="hit" data-a="codyOptQty" data-x="${i}|-1" aria-label="수량 줄이기" ${it.qty <= 1 ? 'disabled' : ''}>${I.minus}</button><span class="num">${it.qty}</span><button class="hit" data-a="codyOptQty" data-x="${i}|1" aria-label="수량 늘리기">${I.plus}</button></div></div></div>` }).join('')}
    <div class="cf-ost num"><span>총 ${n}개</span><b>${won(sum)}원</b></div>
    ${o.canKeep ? `<button class="cf-keep ${o.keep ? 'on' : ''}" data-a="codyOptKeep" aria-pressed="${!!o.keep}"><span class="chk ${o.keep ? 'on' : ''}">${o.keep ? '✓' : ''}</span>이 코디도 저장해 둘게요</button>` : ''}
    ${o.mode === 'cart' ? `<button class="btn" data-a="codyOptCart">${n}개 장바구니 담기</button>` : `<button class="btn" data-a="codyOptOk">${n}개 · ${won(sum)}원 주문하기</button>`}`;
  if (patch) { const sh = app.querySelector('.sheet'); if (sh) { const y = sh.scrollTop; sh.innerHTML = o.html; sh.scrollTop = y } }
}
// 옵션 시트를 연 곳이 저장 안 한 맞춰 보기 화면이면 '이 코디도 저장'을 켜 둬요
const codyKeepable = () => { const c = cur(); return c.s === 'codyMake' && (!c.p.sv || codyDirty(c.p)) };
// 조용히 저장 (주문 · 장바구니 담기와 함께). 저장한 코디면 덮어쓰고, 아니면 자동 제목으로 새로 저장
function codyQuietSave() {
  const pp = cur().p, its = codyCopyIts(pp.its), pos = pp.pos ? JSON.parse(JSON.stringify(pp.pos)) : null, bg = pp.bg || null, tags = [...(pp.tags || [])];
  let sv = pp.sv && CD().saved.find((q) => q.id === pp.sv);
  if (sv) Object.assign(sv, { its, pos, bg }); else { sv = { id: 'k' + (uid++), name: codyTitleOf(its, tags[tags.length - 1]), tags, its, pos, bg }; CD().saved.unshift(sv); pp.sv = sv.id }
  pp.snap = codySnap(pp); return sv;
}
// 제목을 직접 고치면 그대로 기억해요 (다시 그리지 않아 입력이 끊기지 않아요)
app.addEventListener('input', (e) => { if (e.target.id === 'codyTitle' && S.ov) S.ov.title = e.target.value });
// 장바구니 맨 위: 장바구니 옷을 내 옷장 옷이랑 맞춰 보는 화면으로. 옷장이 비었으면 등록부터 하자고 알려요
const codyHasMine = () => S.user && S.closet.some((c) => c.img && c.fit === 'good');
const codyCartBar = () => { if (!S.cart.length) return '';
  return `<button class="cf-cartbar" data-a="codyCartAll"><span class="cf-cbtx"><b>내 옷장 옷이랑 맞춰 볼까요?</b><small>${codyHasMine() ? (S.cart.length > 1 ? `장바구니 ${S.cart.length}개를 하나씩 가진 옷과 놓아 봐요` : '가진 옷과 같이 놓아 봐요') : '가진 옷 1벌만 등록하면 같이 놓아 볼 수 있어요'}</small></span><span class="cf-cbgo">맞춰 보기 ›</span></button>` };
// 옷장에 없는 종류는 등록하러 갔다가, 등록이 끝나면 이 화면으로 돌아와 바닥에 더해요
function codyBack() {
  const r = S.codyRet; S.codyRet = null;
  nav = nav.filter((e) => !e.s.startsWith('reg') && !['loading', 'permDenied'].includes(e.s));
  while (nav.length > 1 && cur().s !== 'codyMake') nav.pop();
  if (cur().s !== 'codyMake') { go('cody'); return }
  const k = r && r.slot, c = k && [...S.closet].reverse().find((x) => x.cat === k && x.fit === 'good' && x.img);
  if (c) { const pp = cur().p, it = codyIt('c', c.id); pp.its.push(it); codyFront(pp, it.u); toast(`방금 등록한 ${c.name}${jo(c.name, '을', '를')} 바닥에 놓았어요`) }
  else if (k) toast(`사진이 있는 ${CAT[k]}만 놓을 수 있어요 · 옷 상세에서 사진을 추가해 주세요`);
  render(true);
}
// 아래 목록: 종류 탭(상의 · 하의 · 아우터) 하나 + 두 줄. '내 옷' 줄과 '상품' 줄(장바구니 상품 → 추천 상품)
// 줄 순서는 들어온 곳을 따라요 (장바구니에서 → 상품 먼저, 내 옷장에서 → 내 옷 먼저)
// 누르면 바닥에 더하고, 바닥에 있는 걸 다시 누르면 빼요. 개수 제한은 없어요 (같은 종류 여러 벌 = 겹쳐 입기)
const codyCnt = (its, k) => its.filter((x) => codyCatOf(x) === k).length;
const codyCtOf = (pp) => { if (pp.ct) return pp.ct; const fp = pp.its.find((x) => x.k === 'p'); return fp ? codyCatOf(fp) : 'top' };
const CODY_CHK = '<span class="cf-on" aria-label="바닥에 놓임"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>';
function codyPanel(pp) {
  const ct = codyCtOf(pp), on = new Set(pp.its.map((x) => x.k + ':' + x.id)), isOn = (t, id) => on.has(t + ':' + id);
  const mine = S.closet.filter((c) => c.cat === ct && c.fit === 'good' && c.img), cartIds = [...new Set(S.cart.map((c) => c.pid))].filter((id) => PB[id] && PB[id].cat === ct);
  const recs = codyRecs(pp.its, ct, pp.tags || [], { skip: cartIds, n: 8 });
  // 장바구니 밖에서 놓은 상품(상품 상세에서 연 경우 등)이 추천 목록에 없으면 상품 줄 맨 앞에 보여 줘요
  const loose = pp.its.filter((x) => x.k === 'p' && codyCatOf(x) === ct && !inCart(x.id) && !recs.some((r) => r.p.id === x.id)).map((x) => x.id), prods = [...new Set([...loose, ...cartIds])];
  const mineRow = `<div class="cf-row"><div class="cf-rowh">내 옷 <small>${mine.length}</small></div>
    <div class="cf-mine">${mine.map((c) => `<button class="${isOn('c', c.id) ? 'on' : ''}" data-a="codyMine" data-x="${c.id}" aria-label="${esc(c.name)} ${c.size}${isOn('c', c.id) ? ' · 바닥에 놓임, 누르면 빼기' : ''}"><img src="${CUT[c.img] || IMG[c.img]}" alt="">${isOn('c', c.id) ? CODY_CHK : ''}</button>`).join('')}
      <button class="cf-mreg" data-a="codyReg" data-x="${ct}">+ ${CAT[ct]} 등록</button></div></div>`;
  const pcard = (p, tag, why) => `<button class="cf-pc ${isOn('p', p.id) ? 'on' : ''}" data-a="codyPut" data-x="${p.id}"><span class="img"><img src="${IMG[p.img]}" alt="">${isOn('p', p.id) ? CODY_CHK : ''}</span><small class="tg">${tag}</small><b>${esc(p.name)}</b><span class="pr num">${won(sale(p))}원</span>${why ? `<span class="why">${why.slice(0, 3).map((w) => `<i>${w}</i>`).join('')}</span>` : ''}</button>`;
  const prodRow = `<div class="cf-row"><div class="cf-rowh">상품 <small>장바구니 ${prods.length} · 추천 ${recs.length}</small></div>
    <div class="cf-prods">${prods.map((id) => pcard(PB[id], codyTagOf(id))).join('')}${prods.length && recs.length ? '<span class="cf-sep"><i>추천</i></span>' : ''}${recs.map((r) => pcard(r.p, '추천', r.why)).join('')}${!prods.length && !recs.length ? `<div class="cf-recnone" style="margin:0">이 종류에 놓을 상품이 없어요</div>` : ''}</div></div>`;
  const tabs = `<div class="cf-mtabs cf-ptabs">${['top', 'bottom', 'outer'].map((k) => { const n = codyCnt(pp.its, k); return `<button class="${k === ct ? 'on' : ''}" data-a="codyCt" data-x="${k}">${CAT[k]}${n ? ` <small>${n}</small>` : '<small> · 비어 있음</small>'}</button>` }).join('')}</div>`;
  // 어디서 들어와도 내 옷 줄이 먼저: 작은 사진 한 줄이라 상품 줄과 같이 한눈에 보이고, 장바구니에서 온 상품은 이미 바닥에 놓여 있어요
  return `<div class="cf-panel" id="codyPanel">${tabs}${mineRow + prodRow}
    <div class="pad" style="font-size:12.5px;color:var(--sub);margin-top:10px;line-height:1.5">누르면 바닥에 더하고, 한 번 더 누르면 빼요. 같은 종류를 여러 벌 놓으면 겹쳐 입기처럼 겹쳐 놓아요</div></div>`;
}
const CODY_CO = { outer: 0, top: 1, bottom: 2 };
const codyOrd = (its) => codyL(its).sort((p, q) => (CODY_CO[p.r.cat] ?? 3) - (CODY_CO[q.r.cat] ?? 3) || parseInt(p.x.u.slice(1)) - parseInt(q.x.u.slice(1)));
// 바닥에서 옷을 누르면 아래 목록(종류 탭 · 내 옷 · 상품) 대신 그 옷 카드가 올라와요: 정보 · 맨 뒤로 · 빼기 + 비슷한 상품. 닫으면 목록으로
// 놓인 옷 줄: 내 옷과 상품(장바구니 · 구매 전)을 나눠 보여 줘요. 상품은 초록 테두리와 장바구니 표시
const codyStrip = (pp, cu) => { const L = codyOrd(pp.its), M = L.filter((v) => v.x.k === 'c'), Pp = L.filter((v) => v.x.k === 'p');
  const th = (v) => `<button class="${v.x.u === cu ? 'on' : ''} ${v.x.k === 'p' ? 'p' : ''}" data-a="codyCardTo" data-x="${v.x.u}" aria-label="${v.x.k === 'p' ? v.r.pend + ' 상품 ' : '내 옷 '}${esc(v.r.name)}"><img src="${v.r.img}" alt="">${v.x.k === 'p' ? `<em>${v.r.pend === '장바구니' ? '장바구니' : '상품'}</em>` : ''}<span class="cf-x" data-a="codyRemove" data-x="${v.x.u}" role="button" aria-label="빼기">${CODY_XS}</span></button>`;
  return `<div class="cf-olist">${M.length ? `<small>내 옷 ${M.length}</small><div>${M.map(th).join('')}</div>` : ''}${M.length && Pp.length ? '<i class="sep"></i>' : ''}${Pp.length ? `<small class="g">상품 ${Pp.length}</small><div>${Pp.map(th).join('')}</div>` : ''}</div>` };
function codyCard(pp, e) {
  const isP = e.x.k === 'p', o = codySrc(e), sims = codySimilar(pp.its, e.x.u), on = new Set(pp.its.filter((x) => x.k === 'p').map((x) => x.id)), anim = pp.cardIn; pp.cardIn = false;
  const meta = [isP ? e.r.pend : '내 옷', o.sub || CAT[e.r.cat]].filter(Boolean).join(' · '), sub = [e.r.size, isP ? won(sale(o)) + '원' : null].filter(Boolean).join(' · ');
  // 맨 위: 바닥에 놓인 옷 전체 (아우터 · 상의 · 하의, 같은 종류는 놓은 순). 누르면 그 옷 카드로 바뀌어요 — 겹쳐서 바닥에서 누르기 어려운 옷도 여기서 골라요
  // 순서를 고정해 둬요: 누르면 바닥에서는 맨 앞으로 오지만 이 줄은 그대로라 헷갈리지 않게
  const strip = codyStrip(pp, e.x.u);
  return `<div class="cf-ocard ${anim ? 'in' : ''}">${strip}
    <div class="cf-och"><span class="th"><img src="${e.r.img}" alt=""></span><span class="nm"><small>${esc(meta)}</small><b>${esc(e.r.name)}</b>${sub ? `<span class="num">${sub}</span>` : ''}</span><button class="x" data-a="codyCardX" aria-label="카드 닫기"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
    <div class="cf-oca"><button data-a="codyToBack" data-x="${e.x.u}">맨 뒤로</button><button data-a="codyRemove" data-x="${e.x.u}">빼기</button>${isP ? `<button data-a="detail" data-x="${o.id}">상품 보기</button>` : ''}</div>
    ${sims.length ? `<div class="cf-simh"><b>비슷한 상품</b><small>눌러서 옆에 놓아 봐요 · 랭킹순</small></div>
    <div class="cf-prods cf-sims">${sims.map((r) => `<button class="cf-sc ${on.has(r.p.id) ? 'on' : ''}" data-a="codySim" data-x="${e.x.u}|${r.p.id}" aria-label="${esc(r.p.name)} · ${r.why.join(' · ')}"><span class="img"><img src="${IMG[r.p.img]}" alt=""><span class="rk num">${codyRank(r.p)}</span>${on.has(r.p.id) ? CODY_CHK : ''}</span><b>${esc(r.p.name)}</b><span class="pr num">${won(sale(r.p))}원</span>${r.rec || r.subR === 1 ? `<span class="why">${r.rec ? `<i>추천 ${r.rec}</i>` : ''}${r.subR === 1 ? '<i class="g">비슷한 종류</i>' : ''}</span>` : ''}</button>`).join('')}</div>` : '<div class="cf-recnone">비슷한 상품이 아직 없어요</div>'}
  </div>`;
}
// 편집 화면: 위 도구(배경 · 글자 · 스티커 · 공유) → 화면 폭 4:5 바닥 → 아래 서랍(놓인 옷 · 내 옷 · 상품)
// 서랍을 열거나 바닥의 옷을 누르면 바닥이 작아져 위에 남고, 서랍에 목록이나 그 옷 카드(비슷한 상품)가 나와요
const CODY_FIT = 0.9; // 바닥 표시 배율 (350 × 438 → 315 × 394)
const CODY_IC = {
  bg: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/></svg>',
  tx: '<span class="aa">Aa</span>',
  stk: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6.5z"/><path d="M12.5 20c0-4.1 3.4-7.5 7.5-7.5"/><path d="M9 10h.01M15 10h.01M9 14.5c.8.7 1.8 1 3 1"/></svg>',
  sh: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M5 11v8a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-8"/></svg>',
};
SCRX.codyMake = (pp) => {
  const F = codyFloor(pp.its, true, { pos: pp.pos, bg: pp.bg, sel: pp.card }), sv = pp.sv && CD().saved.find((q) => q.id === pp.sv), bgk = codyBg(pp.bg)[0], dirty = codyDirty(pp);
  // 아래 영역: 상품을 고르면 그 상품 카드(비슷한 상품), 내 옷을 고르면 카드 없이 종류 탭 · 내 옷 · 상품 목록을 그대로 (탭은 그 옷 종류로)
  const card = pp.card && F.L.find((e) => e.x.u === pp.card && e.x.k === 'p');
  const k = CODY_FIT, nL = F.L.length; // 바닥 크기는 늘 같아요 (서랍을 열고 닫아도 바뀌지 않게)
  // 아래 버튼: 왼쪽은 코디 저장, 오른쪽은 바닥에 놓인 상품으로 바로 이어지는 쇼핑 동작
  const ps = codyProds(pp.its), out = ps.filter((id) => !inCart(id)), its = S.cart.filter((c) => ps.includes(c.pid)), sum = its.reduce((a, c) => a + sale(PB[c.pid]) * (c.qty || 1), 0);
  const buy = out.length ? `<button class="btn" data-a="codyCart">${out.length}개 장바구니 담기</button>` : its.length ? `<button class="btn" data-a="codyOrder">${its.length}개 · ${won(sum)}원 주문하기</button>` : '';
  const sl0 = pp.edit ? '저장하기' : '코디 저장';
  const ic = (a, lbl, svg, on) => `<button class="cf-tbi ${on ? 'on' : ''}" data-a="${a}" aria-label="${lbl}" title="${lbl}">${svg}</button>`;
  const st = pp.edit && dirty ? '<span class="cf-dirty">수정 중</span>' : !pp.edit && sv && !dirty ? '<span class="cf-dirty">저장됨</span>' : '';
  return { node: pp.edit ? `#19 맞춰 보기 · 저장한 코디(${sv ? sv.name : ''}) 수정${dirty ? ' · 바뀐 내용 있음' : ''}` : `#19 맞춰 보기 · 내 옷이랑 맞춰 보기 (실측 비율 · 옷 ${F.L.length}벌${sv ? ' · 저장됨' : ''})`,
    bar: buy ? `<button class="btn line" style="flex:none;width:112px" data-a="codySave">${sl0}</button>${buy}` : `<button class="btn" data-a="codySave">${sl0}</button>`,
    body: `<div class="cf-ed">
    <div class="cf-tb"><button class="bk" data-a="codyLeave" aria-label="뒤로">${I.back}</button><span class="t">${pp.edit ? '코디 수정' : '맞춰 보기'}${st}</span>
      ${ic('codyBgOpen', '배경', CODY_IC.bg, pp.bgOpen)}${ic('codyTextAdd', '글자', CODY_IC.tx)}${ic('codyStkOpen', '스티커', CODY_IC.stk)}${ic('codyShare', '공유', CODY_IC.sh)}</div>
    ${pp.bgOpen ? `<div class="cf-bgs"><span>배경</span>${CODY_BG.map(([k, n, c]) => `<button class="${k === bgk ? 'on' : ''}" data-a="codyBgSet" data-x="${k}" style="background:${c}" aria-label="${n} 배경" title="${n}"></button>`).join('')}<label class="cf-pick ${bgk[0] === '#' ? 'on' : ''}" title="직접 고르기" style="${bgk[0] === '#' ? `--pk:${bgk}` : ''}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 4.5l4.5 4.5M17.3 2.2l4.5 4.5-2.6 2.6-4.5-4.5z"/><path d="M14.7 6.8L5 16.5 4 20l3.5-1L17.2 9.3"/></svg><input type="color" id="codyColor" value="${codyBg(pp.bg)[2].toLowerCase()}" aria-label="배경 색 직접 고르기"></label>${pp.pos ? '<button class="cf-reset" data-a="codyPosReset">배치 처음대로</button>' : ''}</div>` : ''}
    <div class="cf-stage" style="height:${Math.round(CODY_H * k)}px"><div class="cf-fw" style="transform:scale(${k})">${F.html}</div>
      </div>
    <div class="cf-dock">${pp.hinted ? '' : '<div class="cf-tip">옷을 누르면 × 로 뺄 수 있어요. 끌어서 옮기고, 모서리를 끌면 크기 · 회전을 바꿔요. 크기를 바꾸면 실측 비율과 달라져요</div>'}
      ${card ? codyCard(pp, card) : `${nL ? codyStrip(pp, null) : ''}${(() => { // 바닥에 그 종류가 없고 내 옷장에도 없으면 등록하자고 알려요 (반팔 계절의 아우터는 일부러 비워 둔 거라 빼요)
      const se = pp.season || 'long', miss = ['bottom', 'top', 'outer'].filter((k) => !F.by(k).length && CODY_GRP[se][k].length && !codyPickC(k, se));
      if (!miss.length) return ''; const L = miss.map((k) => CAT[k]).join(' · '), k = miss[0];
      return `<div class="cf-regcta"><div><b>내 옷장에 ${L}${josa(CAT[miss[miss.length - 1]])} 없어요</b><small>가진 옷을 등록하거나, 아래 추천 상품으로 채워 볼 수 있어요</small></div><span class="cf-rgb"><button data-a="codyReg" data-x="${k}">${CAT[k]} 등록하기</button><button class="ln" data-a="codyCt" data-x="${k}|go">추천 보기</button></span></div>` })()}${codyPanel(pp)}`}
    </div></div>` };
};

// ── 꾸미기: 글자 · 스티커
const CODY_STK = ['OOTD', 'NEW', 'WISH', 'PICK', '출근룩', '주말룩', '데일리', '데이트', '❤️', '✨', '⭐', '👍']; // 글자 태그 8 + 이모지 4
// 새 꾸미기는 바닥 가운데 근처에(여러 개면 조금씩 비켜) 놓고 골라 둬요
function codyDecoPut(pp, x) { const n = pp.its.filter(codyDeco).length - 1; pp.pos = Object.assign({}, pp.pos, { [x.u]: { x: CODY_W / 2 + (n % 2 ? 70 : -50), y: 90 + (n % 4) * 70, s: 1, r: 0 } }); pp.card = x.u; pp.hinted = true }
function codyTextSheet(u) { const x = u && cur().p.its.find((v) => v.u === u); S.ov = { k: 'sheet', u: u || null, t: x ? x.id : '', c: x ? x.c || CODY_TC[0][0] : CODY_TC[0][0], b: x ? !!x.b : false }; codyTextHtml() }
function codyTextHtml(patch) {
  const o = S.ov, sh = patch && app.querySelector('.sheet'), el = sh && sh.querySelector('#codyTxt'); if (el) o.t = el.value;
  o.html = `<div class="grab"></div><div style="font-size:18px;font-weight:800">${o.u ? '글자 고치기' : '글자 넣기'}</div>
    <input id="codyTxt" class="cf-tin2" maxlength="20" value="${esc(o.t)}" placeholder="예: 출근룩, 이번 주말" autocomplete="off">
    <div class="cf-lbl">색</div><div class="cf-tcs">${CODY_TC.map(([c]) => `<button class="${o.c === c ? 'on' : ''}" data-a="codyTextColor" data-x="${c}" style="background:${c}" aria-label="글자 색 ${c}" aria-pressed="${o.c === c}"></button>`).join('')}<button class="cf-tbx ${o.b ? 'on' : ''}" data-a="codyTextBox" aria-pressed="${o.b}">상자</button></div>
    <div class="cf-tprev" style="background:${codyBg(cur().p.bg)[2]}">${codyDecoHtml({ k: 't', id: o.t || '미리보기', c: o.c, b: o.b })}</div>
    <button class="btn" style="margin-top:16px" data-a="codyTextOk">${o.u ? '바꾸기' : '넣기'}</button>`;
  if (sh) { sh.innerHTML = o.html; const v = sh.querySelector('#codyTxt'); v.focus(); v.setSelectionRange(v.value.length, v.value.length) }
}
// 글자를 쓰는 동안 미리보기도 바뀌어요
app.addEventListener('input', (e) => { if (e.target.id !== 'codyTxt' || !S.ov) return; S.ov.t = e.target.value; const pv = app.querySelector('.cf-tprev'); if (pv) pv.innerHTML = codyDecoHtml({ k: 't', id: S.ov.t || '미리보기', c: S.ov.c, b: S.ov.b }) });
// ── 공유 이미지: 바닥을 1080px 폭으로 그려요. 피드 4:5(1080 × 1350) · 스토리 9:16(1080 × 1920, 위 제목 · 아래 당장 표시)
// 사이즈 · 실측 · 추천 사이즈는 그리지 않아요(공유 정책). 내 옷은 사진만
const codyIm = (src) => new Promise((ok) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => ok(im); im.onerror = () => ok(null); im.src = src });
function codyDrawDeco(g, x, k) {
  const word = x.k === 's' && !codyEmoji(x.id), fs = (x.k === 't' ? 22 : word ? 13 : 34) * k, [c, fg] = x.k === 't' ? codyTc(x.c) : ['#FFFFFF', '#111111'], box = x.k === 't' ? x.b : word;
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `800 ${fs}px "Wanted Sans", system-ui, "Apple Color Emoji", sans-serif`; const w = g.measureText(x.id).width;
  if (box) { const pw = w + 22 * k, ph = fs * 1.55; g.fillStyle = c; g.beginPath(); g.roundRect(-pw / 2, -ph / 2, pw, ph, (word ? ph / 2 : 8 * k)); g.fill(); if (word) { g.strokeStyle = 'rgba(17,17,17,.12)'; g.lineWidth = k; g.stroke() } g.fillStyle = fg }
  else { g.fillStyle = x.k === 't' ? c : '#000'; if (x.k === 't') { g.shadowColor = 'rgba(0,0,0,.25)'; g.shadowBlur = 8 } }
  g.fillText(x.id, 0, fs * 0.05);
}
async function codyShot(pp, fmt, title) {
  const F = codyFloor(pp.its, false, { pos: pp.pos, bg: pp.bg }), bg = codyBg(pp.bg), W = 1080, k = W / CODY_W, FH = Math.round(CODY_H * k), H = fmt === '916' ? 1920 : FH, oy = fmt === '916' ? Math.round((H - FH) / 2) : 0, ink = bg[3] ? '#111111' : '#FFFFFF';
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  g.fillStyle = F.bg; g.fillRect(0, 0, W, H);
  for (const it of F.items) { const im = await codyIm(it.img); if (!im) continue;
    const ih = it.ih * k, w = it.cut ? ih * im.naturalWidth / im.naturalHeight : ih * 0.8;
    g.save(); g.translate(it.x * k, oy + (it.y + it.ih / 2) * k); g.rotate(it.r * Math.PI / 180); g.scale(it.s, it.s);
    g.shadowColor = 'rgba(40,32,20,.28)'; g.shadowBlur = 20; g.shadowOffsetY = 16;
    if (it.cut) g.drawImage(im, -w / 2, -ih / 2, w, ih);
    else { const sw = Math.min(im.naturalWidth, im.naturalHeight * 0.8), sh2 = Math.min(im.naturalHeight, sw / 0.8); g.drawImage(im, (im.naturalWidth - sw) / 2, 0, sw, sh2, -w / 2, -ih / 2, w, ih) }
    g.restore() }
  for (const { x, s: p } of F.decos) { g.save(); g.translate(p.x * k, oy + p.y * k); g.rotate((p.r || 0) * Math.PI / 180); g.scale(p.s || 1, p.s || 1); codyDrawDeco(g, x, k); g.restore() }
  g.fillStyle = ink; g.textBaseline = 'middle';
  if (fmt === '916') { g.textAlign = 'center'; g.font = '800 54px "Wanted Sans", system-ui, sans-serif'; g.fillText(title, W / 2, oy / 2 + 10);
    g.globalAlpha = .7; g.font = '700 30px "Wanted Sans", system-ui, sans-serif'; g.fillText('당장 · 내 옷이랑 맞춰 보기', W / 2, H - oy / 2); g.globalAlpha = 1 }
  else { g.textAlign = 'right'; g.globalAlpha = .6; g.font = '800 30px "Wanted Sans", system-ui, sans-serif'; g.fillText('당장', W - 36, H - 40); g.globalAlpha = 1 }
  try { return cv.toDataURL('image/png') } catch (e) { return null }
}
function codyShareHtml(patch) {
  const o = S.ov, pp = cur().p, ps = codyProds(pp.its).map((id) => PB[id]), mine = codyL(pp.its).filter((e) => e.x.k === 'c').length;
  o.html = `<div class="grab"></div><div style="font-size:18px;font-weight:800">코디 공유하기</div>
    <div class="cf-seg2">${[['45', '피드 4:5'], ['916', '스토리 9:16']].map(([k, n]) => `<button class="${o.fmt === k ? 'on' : ''}" data-a="codyShareFmt" data-x="${k}" aria-pressed="${o.fmt === k}">${n}</button>`).join('')}</div>
    <div class="cf-shot ${o.fmt === '916' ? 'st' : ''}">${o.url && o.url !== 'fail' ? `<img src="${o.url}" alt="공유 이미지 미리보기">` : `<span>${o.url === 'fail' ? '이미지를 만들지 못했어요' : '이미지를 만들고 있어요…'}</span>`}</div>
    <div class="cf-shnote"><b>공유되지 않는 정보</b>사이즈 · 실측 · 체형 · 추천 사이즈는 빠져요.${mine ? ` 내 옷 ${mine}벌은 사진만 보여요.` : ''}</div>
    ${ps.length ? `<div class="cf-shps"><small>링크로 받은 사람은 상품 ${ps.length}개를 볼 수 있어요</small><div>${ps.map((p) => `<span><img src="${IMG[p.img]}" alt=""><b>${esc(p.name)}</b><em class="num">${won(sale(p))}원</em></span>`).join('')}</div></div>` : ''}
    ${!pp.sv || codyDirty(pp) ? '<div class="cf-shsv"><span>아직 저장하지 않은 코디예요</span><button data-a="codySave">저장하기</button></div>' : ''}
    <div class="cf-shbtn"><button class="btn line" data-a="codyShareSave" ${o.url && o.url !== 'fail' ? '' : 'disabled'}>이미지 저장</button><button class="btn" data-a="codyShareSend" ${o.url && o.url !== 'fail' ? '' : 'disabled'}>공유하기</button></div>
    <button class="cf-shview" data-a="codyShareView">링크로 받은 사람 화면 보기 (데모) ›</button>`;
  if (patch) { const sh = app.querySelector('.sheet'); if (sh) sh.innerHTML = o.html }
}
function codyShareMake() {
  const o = S.ov, pp = cur().p, f = o.fmt, sv = pp.sv && CD().saved.find((q) => q.id === pp.sv);
  codyShot(pp, f, sv ? sv.name : codyTitleOf(pp.its, (pp.tags || [])[0] || '데일리')).then((url) => { if (S.ov !== o || o.fmt !== f) return; o.url = url || 'fail'; codyShareHtml(true) });
}
// 공유 링크로 받은 화면 (데모): 꾸민 코디 그대로 + 상품만 목록으로. 내 옷 · 사이즈 정보는 없어요
SCRX.codyShared = (pp) => {
  const F = codyFloor(pp.its, false, { pos: pp.pos, bg: pp.bg }), ps = codyProds(pp.its).map((id) => PB[id]), mine = F.L.filter((e) => e.x.k === 'c').length;
  return { node: '#19 맞춰 보기 · 공유 링크로 받은 화면 (데모)', bar: ps.length ? '<button class="btn" data-a="codyFromShare">이 상품들 내 옷이랑 맞춰 보기</button>' : '',
    body: `${hdrBack('공유받은 코디')}
    <div class="cf-vhead"><small class="cf-shby">당장 회원님이 공유한 코디</small><b>${esc(pp.name)}</b></div>
    <div class="cf-shfl">${F.html}</div>
    <div class="sec"><h3>이 코디의 상품<small>${ps.length}</small></h3></div>
    <div class="cf-vlist">${ps.map((p) => `<button class="cf-vrow" data-a="detail" data-x="${p.id}"><span class="th"><img src="${IMG[p.img]}" alt=""></span><span class="tx"><small>${esc(p.brand)}</small><b>${esc(p.name)}</b><span class="num">${won(sale(p))}원</span></span><span class="go">›</span></button>`).join('')}</div>
    ${mine ? `<div class="pad" style="font-size:12.5px;color:var(--sub);margin-top:10px;line-height:1.5">나머지 ${mine}벌은 공유한 사람의 옷이라 상품 정보가 없어요. 사이즈 · 실측 정보는 공유되지 않아요</div>` : ''}
    <div style="height:24px"></div>` };
};
// 저장한 코디 상세: 배치 · 옷 목록 · 어울리는 상품. '수정하기'로 같은 코디를 고치고, ⋯에서 이름·태그 바꾸기 · 새 코디로 복사 · 삭제
SCRX.codyView = (pp) => {
  const q = CD().saved.find((x) => x.id === pp.id); if (!q) return SCRX.cody();
  const F = codyFloor(q.its, false, { pos: q.pos, bg: q.bg });
  const ps = codyProds(q.its), out = ps.filter((id) => !inCart(id)), its = S.cart.filter((c) => ps.includes(c.pid)), sum = its.reduce((a, c) => a + sale(PB[c.pid]) * (c.qty || 1), 0);
  const buy = out.length ? `<button class="btn" data-a="codyCart">${out.length}개 장바구니 담기</button>` : its.length ? `<button class="btn" data-a="codyOrder">${its.length}개 · ${won(sum)}원 주문하기</button>` : '';
  const rows = ['outer', 'top', 'bottom'].flatMap((k) => F.by(k).slice().reverse()).map((e) => { const isP = e.x.k === 'p';
    return `<button class="cf-vrow" data-a="${isP ? 'detail' : 'codyItem'}" data-x="${e.x.id}"><span class="th"><img src="${e.r.img}" alt=""></span><span class="tx"><small>${CAT[e.r.cat]}${isP ? ` · <em>${e.r.pend}</em>` : ''}</small><b>${esc(e.r.name)}</b><span>${e.r.size ? e.r.size + ' · ' : ''}${isP ? won(sale(e.r.p)) + '원' : '내 옷'}</span></span><span class="go">›</span></button>` }).join('');
  const rk = pp.rk || ['outer', 'top', 'bottom'].find((k) => !F.by(k).length) || 'top', recs = codyRecs(q.its, rk, q.tags || []);
  return { node: `#19 맞춰 보기 · 저장한 코디 상세 (${q.name}) → 수정하기 · 어울리는 상품 · ⋯(이름 · 복사 · 삭제)`,
    bar: buy ? `<button class="btn line" style="flex:none;width:112px" data-a="codyModify" data-x="${q.id}">수정하기</button>${buy}` : `<button class="btn" data-a="codyModify" data-x="${q.id}">수정하기</button>`,
    body: `${hdrBack('', `<button data-a="codyMore" data-x="${q.id}" aria-label="더보기">${I.more}</button>`)}
    <div class="cf-vhead"><b>${esc(q.name)}</b>${q.tags && q.tags.length ? `<div class="cf-vtags" style="padding:0;margin-top:6px">${q.tags.map((t) => `<span>#${t}</span>`).join('')}</div>` : ''}</div>
    <button class="cf-vfloor" data-a="codyModify" data-x="${q.id}" aria-label="이 코디 수정하기">${F.html}<span class="cf-vedit">✎ 눌러서 수정</span></button>
    <div class="sec" style="margin-top:18px"><h3>이 코디의 옷<small>${F.L.length}벌${ps.length ? ` · 장바구니 · 구매 전 상품 ${ps.length}개` : ''}</small></h3></div>
    <div class="cf-vlist">${rows}</div>
    <div class="sec" style="margin-top:22px"><h3>이 코디에 어울리는 상품</h3></div>
    <div class="cf-mtabs">${['top', 'bottom', 'outer'].map((k) => `<button class="${k === rk ? 'on' : ''}" data-a="codyRecTab" data-x="${k}">${CAT[k]}${F.by(k).length ? '' : ' · 비어 있음'}</button>`).join('')}</div>
    <div style="padding:0 20px">${codyRecRow(recs, 'codyRecModify', (r) => `${q.id}|${r.p.id}`, `이 종류에 추천할 상품이 없어요`)}</div>
    <div class="pad" style="font-size:12.5px;color:var(--sub);margin-top:8px;line-height:1.5">바닥의 다른 옷 기준으로 골랐어요. 누르면 이 코디에 더해 놓고 수정 화면으로 가요</div><div style="height:24px"></div>` };
};
// 저장한 코디 목록 (원본은 내 옷장의 '코디' 탭. 여기선 내 옷장 위 · 마이 메뉴에서 여는 화면)
SCRX.cody = () => {
  const pend = codyPend(), sc = 170 / CODY_W, saved = CD().saved;
  return { node: '#19 맞춰 보기 · 장바구니 상품 · 저장한 코디', body: `${hdrBack('내 옷이랑 맞춰 보기')}
    <div class="sec"><h3>장바구니 상품<small>${pend.length}</small></h3>${pend.length ? '<button data-a="go" data-x="cart">장바구니 ›</button>' : ''}</div>
    ${pend.length ? `<div class="cf-pend">${pend.map((id) => { const p = PB[id]; return `<button class="cf-pi" data-a="codyOpen" data-x="${id}"><div class="img"><img src="${IMG[p.img]}" alt=""><span>맞춰 보기</span></div><p>${p.name}</p></button>` }).join('')}</div>`
      : `<div class="pad" style="font-size:13px;color:var(--sub);line-height:1.5">장바구니에 상품을 담으면 여기서 내 옷이랑 맞춰 볼 수 있어요. 사기 전에 가진 옷과 같이 놓아 보고 정해요</div>`}
    <div class="sec"><h3>저장한 코디<small>${saved.length}</small></h3></div>
    <div class="cf-grid">${saved.map((q) => { const F = codyFloor(q.its, false, { pos: q.pos, bg: q.bg }), has = F.L.some((e) => e.r.pend === '장바구니'); // 장바구니에서 빠진 상품은 '구매 전'으로만 표시
      return `<div class="cf-card" data-a="codyEdit" data-x="${q.id}" role="button" tabindex="0"><div class="cf-mini" style="height:${Math.round(F.h * sc)}px;background:${F.bg}"><div style="transform:scale(${sc})">${F.html}</div></div><b>${esc(q.name)}</b>${q.tags && q.tags.length ? `<small class="cf-ctags">${q.tags.map((t) => '#' + t).join(' ')}</small>` : ''}<small>옷 ${F.L.length}벌 · ${F.L.slice().reverse().map((e) => e.r.name).join(' + ')}</small>${has ? '<small class="cf-incart">장바구니 상품 포함</small>' : ''}</div>` }).join('')}
      <button class="cf-add" data-a="codyNew">+ 새 코디</button></div>
    <div style="height:40px"></div>` };
};
Object.assign(AX, {
  codyHome() { need('로그인하면 내 옷장 옷이랑 맞춰 볼 수 있어요', () => { closeOv(); go('cody') }) },
  codyRegBack() { codyBack() },
  codyOpen(pid) { need('로그인하면 내 옷장 옷이랑 맞춰 볼 수 있어요', () => { closeOv(); S.toast = null; const p = PB[pid], ci = inCart(pid), its = codyDefault(codySeason(p)), it = codyWith(its, pid, ci ? ci.size : null);
    codyGo({ its, from: 'cart', season: codySeason(p), ct: p.cat }) }) },
  // 장바구니 맨 위 배너: 체크한 상품 중 첫 번째(없으면 장바구니 첫 상품) 1개를 바닥에 놓고, 나머지는 내 옷장 옷으로 채워요
  codyCartAll() { need('로그인하면 내 옷장 옷이랑 맞춰 볼 수 있어요', () => { closeOv(); S.toast = null; const ok = (x) => PB[x.pid] && CODY_CATS.includes(PB[x.pid].cat), c = cartOn().find(ok) || S.cart.find(ok), se = c ? codySeason(PB[c.pid]) : 'long', its = codyDefault(se);
    if (c) codyWith(its, c.pid, c.size); codyGo({ its, from: 'cart', season: se, ct: c ? PB[c.pid].cat : 'top' }) }) },
  codyReg(k) { closeOv(); S.codyRet = { slot: k }; startReg(k, 'cody') },
  codyBgSet(k) { cur().p.bg = k; render() },
  codyPosReset() { const pp = cur().p; pp.pos = null; pp.sel = null; pp.card = null; render() },
  // 바닥의 옷: 누르면 맨 앞으로 오고 아래 목록 대신 그 옷 카드가 올라와요. 같은 옷을 다시 누르면 카드를 닫아요. 방금 끌어 옮긴 거면 아무것도 안 해요
  // 바닥에서 누르기: 옷이면 서랍에 그 옷 카드, 글자 · 스티커면 손잡이만. 고른 글자를 한 번 더 누르면 고치기
  codyTap(u) { if (codySkip) return; const pp = cur().p, x = pp.its.find((v) => v.u === u); if (!x) return; const dc = codyDeco(x), again = pp.card === u;
    if (dc && again) { if (x.k === 't') { codyTextSheet(u); render() } return }
    codyFront(pp, u); pp.card = again ? null : u; pp.cardIn = !again && !dc; render() },
  codyDesel() { if (codySkip) return; const pp = cur().p; if (!pp.card) return; pp.card = null; pp.sel = null; render() },
  codyDesel2() { const pp = cur().p; pp.card = null; pp.sel = null; render() },
  codyBgOpen() { const pp = cur().p; pp.bgOpen = !pp.bgOpen; render() },
  // 실측으로 되돌리기: 크기만 100%로 (각도는 두어요). 글자 · 스티커는 그대로
  codyReal() { const pp = cur().p; codyL(pp.its).forEach((e) => { const q = (pp.pos || {})[e.x.u]; if (q) q.s = 1 }); toast('모든 옷을 실측 크기로 되돌렸어요'); render() },
  codyReal1(u) { const pp = cur().p, q = (pp.pos || {})[u]; if (q) q.s = 1; render() },
  codyTextAdd() { codyTextSheet(null); render() },
  codyTextEdit(u) { codyTextSheet(u); render() },
  codyTextColor(c) { S.ov.c = c; codyTextHtml(true) },
  codyTextBox() { S.ov.b = !S.ov.b; codyTextHtml(true) },
  codyTextOk() { const o = S.ov, pp = cur().p, el = app.querySelector('#codyTxt'), t = (el ? el.value : o.t).trim(); if (!t) { el && el.focus(); return }
    if (o.u) { const x = pp.its.find((v) => v.u === o.u); if (x) Object.assign(x, { id: t, c: o.c, b: o.b }); pp.card = o.u }
    else { const x = { u: 'i' + (uid++), k: 't', id: t, c: o.c, b: o.b }; pp.its.push(x); codyDecoPut(pp, x) }
    closeOv(); render() },
  codyStkOpen() { sheet(`<div class="grab"></div><div style="font-size:18px;font-weight:800">스티커</div><div class="cf-hint" style="margin-top:4px">눌러서 바닥에 붙여요. 끌어서 옮기고 모서리로 크기를 바꿔요</div>
    <div class="cf-stks">${CODY_STK.map((t) => `<button data-a="codyStkAdd" data-x="${esc(t)}">${codyDecoHtml({ k: 's', id: t })}</button>`).join('')}</div>`); render() },
  codyStkAdd(t) { const pp = cur().p, x = { u: 'i' + (uid++), k: 's', id: t }; pp.its.push(x); codyDecoPut(pp, x); closeOv(); render() },
  // 공유: 미리보기를 이미지로 만들어 보여 주고, 저장 · 기기 공유 시트 · 받는 화면(데모)으로
  codyShare() { S.ov = { k: 'sheet', fmt: '45', url: null }; codyShareHtml(); render(); codyShareMake() },
  codyShareFmt(f) { const o = S.ov; if (o.fmt === f) return; o.fmt = f; o.url = null; codyShareHtml(true); codyShareMake() },
  codyShareSave() { const o = S.ov; if (!o || !o.url || o.url === 'fail') return; const a = document.createElement('a'); a.href = o.url; a.download = `dangjang-cody-${o.fmt === '916' ? 'story' : 'feed'}.png`; document.body.appendChild(a); a.click(); a.remove(); toast('이미지를 저장했어요'); render() },
  async codyShareSend() { const o = S.ov; if (!o || !o.url || o.url === 'fail') return;
    try { const b = await (await fetch(o.url)).blob(), file = new File([b], 'dangjang-cody.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: '당장 코디' }); return } } catch (e) { if (e && e.name === 'AbortError') return }
    try { await navigator.clipboard.writeText(location.origin + '/?f=fitwith') } catch (e) {}
    toast('이 기기에서는 공유 창을 열 수 없어 링크를 복사했어요 (데모)'); render() },
  codyShareView() { const pp = cur().p, sv = pp.sv && CD().saved.find((q) => q.id === pp.sv); closeOv();
    go('codyShared', { its: codyCopyIts(pp.its), pos: pp.pos ? JSON.parse(JSON.stringify(pp.pos)) : null, bg: pp.bg, name: sv ? sv.name : codyTitleOf(pp.its, (pp.tags || [])[0] || '데일리') }) },
  codyFromShare() { const pp = cur().p; codyGo({ its: pp.its.filter((x) => x.k === 'p' && PB[x.id]).map((x) => codyIt('p', x.id)), pos: null, bg: pp.bg, from: 'cart' }) },
  codyCardTo(u) { const pp = cur().p; codyFront(pp, u); pp.card = u; render() },
  codyCardX() { const pp = cur().p; pp.card = null; pp.sel = null; render() }, // 카드를 닫으면 아래는 목록으로
  codyToBack(u) { const pp = cur().p, i = pp.its.findIndex((x) => x.u === u); if (i < 0) return; const [x] = pp.its.splice(i, 1); pp.its.unshift(x); pp.sel = null; pp.card = null; render(); toast('맨 뒤로 보냈어요') },
  // 빼기: 바닥 모서리 × · 놓인 옷 줄의 × · 카드의 '빼기' · 아래 목록에서 다시 누르기. 카드를 보던 옷이면 줄의 다음 옷 카드로 넘어가요. 토스트에서 되돌릴 수 있어요
  codyRemove(u) { const pp = cur().p, i = pp.its.findIndex((x) => x.u === u); if (i < 0) return;
    const ord = codyOrd(pp.its).map((e) => e.x.u), k = ord.indexOf(u), rest = ord.filter((v) => v !== u);
    codyUndo = { s: cur().s, it: pp.its[i], i, pos: pp.pos && pp.pos[u], card: pp.card };
    pp.its.splice(i, 1); if (pp.pos) delete pp.pos[u]; pp.sel = null;
    if (pp.card === u) pp.card = codyDeco(codyUndo.it) ? null : rest.length ? rest[Math.min(k, rest.length - 1)] : null;
    if (pp.card) codyFront(pp, pp.card);
    const r = codyRef(codyUndo.it), w = codyUndo.it.k === 't' ? '글자' : codyUndo.it.k === 's' ? '스티커' : r ? ((r.c || r.p).sub || CAT[r.cat]) : '옷'; toast(`${esc(w)}${jo(w, '을', '를')} 뺐어요<button class="cf-undo" data-a="codyUndo">되돌리기</button>`); render() },
  codyUndo() { const u = codyUndo, pp = cur().p; codyUndo = null; S.toast = null; if (!u || cur().s !== u.s) return render();
    pp.its.splice(Math.min(u.i, pp.its.length), 0, u.it); if (u.pos) pp.pos = Object.assign({}, pp.pos, { [u.it.u]: u.pos }); if (u.card) { pp.card = u.card; pp.sel = u.card } render() },
  // 비슷한 상품: 고른 옷 바로 옆(오른쪽, 자리가 없으면 왼쪽)에 놓고, 고른 옷은 그대로 고른 채로 둬요. 이미 놓였으면 빼요
  codySim(x) { const [u, pid] = x.split('|'), pp = cur().p, on = pp.its.find((v) => v.k === 'p' && v.id === pid);
    if (on) { pp.its = pp.its.filter((v) => v.u !== on.u); if (pp.pos) delete pp.pos[on.u]; render(); return }
    const F = codyFloor(pp.its, true, { pos: pp.pos, bg: pp.bg }), a = F.at[u] || { x: CODY_W / 2, y: 40 }, ci = inCart(pid), j = judge(PB[pid]);
    const side = pp.its.filter((v) => v.k === 'p' && (pp.simOf || {})[v.u] === u).length, dx = 118 + 26 * side, nx = a.x + dx <= CODY_W - 50 ? a.x + dx : Math.max(50, a.x - dx);
    const it = codyIt('p', pid, ci ? ci.size : j.n === 5 ? j.rec : null); pp.its.push(it);
    pp.pos = Object.assign({}, pp.pos, { [it.u]: { x: Math.round(nx), y: Math.round(a.y + 10 * side) } }); pp.simOf = Object.assign({}, pp.simOf, { [it.u]: u }); pp.sel = u; render() },
  codyCt(x) { const [k, go2] = x.split('|'), pp = cur().p; pp.ct = k; if (go2) pp.card = null; render() },
  // 아래 목록의 내 옷 · 상품: 바닥에 없으면 더하고(맨 앞), 있으면 빼요
  codyMine(id) { const pp = cur().p, on = pp.its.find((x) => x.k === 'c' && x.id === id);
    if (on) { A.codyRemove(on.u); return } const it = codyIt('c', id); pp.its.push(it); codyFront(pp, it.u); render() },
  codyPut(id) { const pp = cur().p, on = pp.its.find((x) => x.k === 'p' && x.id === id);
    if (on) { A.codyRemove(on.u); return } const ci = inCart(id), j = judge(PB[id]), it = codyIt('p', id, ci ? ci.size : j.n === 5 ? j.rec : null); pp.its.push(it); codyFront(pp, it.u); render() },
  codySave() {
    const pp = cur().p, sv = pp.sv && CD().saved.find((q) => q.id === pp.sv);
    if (!codyL(pp.its).length) { toast('옷을 한 벌 이상 놓아 주세요'); render(); return }
    const tags = sv && sv.tags ? [...sv.tags] : [...(pp.tags || [])];
    sheet(''); Object.assign(S.ov, { mode: pp.edit ? 'edit' : sv ? 'resave' : 'new', tags, n: 0, title: sv ? sv.name : codyTitleOf(pp.its, tags[tags.length - 1]), node: pp.edit ? '#19 맞춰 보기 · 수정 저장 → 이 코디에 저장 / 새 코디로 저장' : '#19 맞춰 보기 · 코디 저장 → 제목(자동 추천) · 태그' });
    codySaveSheet(); render();
  },
  // 태그를 누르면 넣고 빼고, 마지막에 고른 태그로 제목을 다시 추천해요
  codyTag(t) { const o = S.ov, i = o.tags.indexOf(t); if (i >= 0) o.tags.splice(i, 1); else o.tags.push(t); o.n = 0; o.title = codyTitleOf(codyCurIts(), o.tags[o.tags.length - 1], 0); codySaveSheet(true) },
  codyTitleNext() { const o = S.ov; o.n++; o.title = codyTitleOf(codyCurIts(), o.tags[o.tags.length - 1], o.n); codySaveSheet(true) },
  codySaveOk() {
    if (S.ov.mode === 'rename') { const q = CD().saved.find((x) => x.id === cur().p.id), o = S.ov; q.name = (o.title || '').trim() || q.name; q.tags = [...o.tags]; closeOv(); toast('이름과 태그를 바꿨어요'); render(); return }
    const pp = cur().p, o = S.ov, nm = (o.title || '').trim() || codyTitleOf(pp.its, o.tags[o.tags.length - 1]), tags = [...o.tags];
    const its = codyCopyIts(pp.its), pos = pp.pos ? JSON.parse(JSON.stringify(pp.pos)) : null, bg = pp.bg || null; let sv = pp.sv && CD().saved.find((q) => q.id === pp.sv);
    if (sv) Object.assign(sv, { name: nm, tags, its, pos, bg }); else { sv = { id: 'k' + (uid++), name: nm, tags, its, pos, bg }; CD().saved.unshift(sv); pp.sv = sv.id }
    pp.tags = tags; pp.snap = codySnap(pp); closeOv();
    if (pp.edit) { nav.pop(); replace('codyView', { id: sv.id }); toast('코디를 수정했어요'); return } // 상세에서 수정하러 왔으면 상세로 돌아가요
    toast(`'${esc(nm)}' 코디를 저장했어요<button class="tl" data-a="codyTab">코디 보기 ›</button>`); render(); // 새로 만든 코디는 그 화면에 머물러요
  },
  codySaveNew() { const pp = cur().p, o = S.ov, nm = (o.title || '').trim() || codyTitleOf(pp.its, o.tags[o.tags.length - 1]);
    const sv = { id: 'k' + (uid++), name: nm, tags: [...o.tags], its: codyCopyIts(pp.its), pos: pp.pos ? JSON.parse(JSON.stringify(pp.pos)) : null, bg: pp.bg || null };
    CD().saved.unshift(sv); closeOv();
    if (pp.edit) { nav.pop(); replace('codyView', { id: sv.id }); toast(`'${esc(nm)}' 새 코디로 저장했어요. 원래 코디도 그대로 있어요`); return }
    pp.sv = sv.id; pp.tags = [...o.tags]; pp.snap = codySnap(pp); toast(`'${esc(nm)}' 새 코디로 저장했어요<button class="tl" data-a="codyTab">코디 보기 ›</button>`); render() },
  // 뒤로: 저장하지 않은 바뀐 내용이 있으면 물어봐요 (새 코디도, 수정도)
  codyLeave() { const pp = cur().p; if (codyDirty(pp) && codyL(pp.its).length) { modal(`<h4>${pp.edit ? '수정한 내용을' : '꾸민 코디를'} 저장하지 않고 나갈까요?</h4><p>${pp.edit ? '나가면 바꾼 배치와 옷이 사라지고, 저장한 코디는 그대로 남아요' : '나가면 바닥에 놓은 옷과 배치가 사라져요'}</p><div class="mb"><button class="btn line" data-a="closeOv">계속 꾸미기</button><button class="btn" data-a="codyLeaveOk">나가기</button></div>`); S.ov.node = '#19 맞춰 보기 · 저장 안 하고 나가기 확인'; render(); return } back() },
  codyLeaveOk() { closeOv(); back() },
  codyCart() {
    const ps = codyProds(codyCurIts()).filter((id) => !inCart(id));
    if (!ps.length) { go('cart'); return }
    sheet(''); Object.assign(S.ov, { mode: 'cart', canKeep: codyKeepable(), keep: true, items: ps.map((id) => { const p = PB[id], r = codyCurIts().find((x) => x.k === 'p' && x.id === id), j = judge(p), ok = sizeKeys(p).filter((z) => !p.out.includes(z)); return { pid: id, size: (r && r.size) || (j.n === 5 ? j.rec : ok[0]), color: (p.colors || [])[0] || null, qty: 1 } }), node: '#19 맞춰 보기 · 장바구니 담기 → 옵션 확인 시트(추천 사이즈 미리 고름)' });
    codyOptSheet(); render();
  },
  codyOptKeep() { S.ov.keep = !S.ov.keep; codyOptSheet(true) },
  codyOptCart() {
    const o = S.ov, its = o.items.map((it) => ({ ...it })), keep = o.canKeep && o.keep;
    its.forEach((it) => S.cart.push({ pid: it.pid, size: it.size, color: it.color, qty: it.qty }));
    codyCurIts().forEach((x) => { const it = x.k === 'p' && its.find((q) => q.pid === x.id); if (it) x.size = it.size });
    closeOv(); const sv = keep ? codyQuietSave() : null;
    toast(`장바구니에 담았어요 · ${its.reduce((a, it) => a + it.qty, 0)}개${sv ? ` · '${esc(sv.name)}' 코디도 저장했어요` : ''}`); render();
  },
  // 상세에서 고른 추천 상품을 더해 놓고 수정 화면으로. 아래 목록이 그 종류로 맞춰져서 다른 추천으로 바로 바꿔 볼 수 있어요
  codyModify(id, patch) { const q = CD().saved.find((v) => v.id === id); if (!q) return;
    const pp = { its: codyCopyIts(q.its), pos: q.pos ? JSON.parse(JSON.stringify(q.pos)) : null, bg: q.bg, tags: [...(q.tags || [])], sv: id, edit: true, from: 'closet' }; pp.snap = codySnap(pp); if (patch) patch(pp); closeOv(); go('codyMake', pp) },
  codyRecModify(x) { const [id, pid] = x.split('|'), j = judge(PB[pid]); A.codyModify(id, (pp) => { const it = codyIt('p', pid, j.n === 5 ? j.rec : null); pp.its.push(it); pp.sel = it.u; pp.ct = PB[pid].cat }); codyToPanel() },
  codyMore(id) { const q = CD().saved.find((v) => v.id === id);
    sheet(`<div class="grab"></div><div style="font-size:16px;font-weight:800;margin-bottom:6px">${esc(q.name)}</div><div class="cf-menu"><button data-a="codyRename" data-x="${id}">이름 · 태그 바꾸기</button><button data-a="codyCopy" data-x="${id}">새 코디로 복사해서 맞춰 보기</button><button class="del" data-a="codyDel" data-x="${id}">삭제</button></div>`); S.ov.node = '#19 맞춰 보기 · 저장한 코디 ⋯ 메뉴'; render() },
  codyRename(id) { const q = CD().saved.find((v) => v.id === id); closeOv(); sheet(''); Object.assign(S.ov, { mode: 'rename', tags: [...(q.tags || [])], n: 0, title: q.name, node: '#19 맞춰 보기 · 이름 · 태그 바꾸기' }); codySaveSheet(); render() },
  codyItem(id) { go('item', { id }) },
  codyRecTab(k) { cur().p.rk = k; render() },
  // 바닥에 놓인 장바구니 상품 → 옵션 확인 시트 → 주문
  codyOrder() {
    const ids = codyProds(codyCurIts()), its = S.cart.filter((c) => ids.includes(c.pid));
    if (!its.length) return;
    need('로그인하면 주문하고, 산 옷이 옷장에 담겨요', () => { closeOv(); sheet(''); Object.assign(S.ov, { canKeep: codyKeepable(), keep: true, items: its.map((c) => ({ pid: c.pid, size: c.size, color: c.color || (PB[c.pid].colors || [])[0] || null, qty: c.qty || 1 })), node: '#19 맞춰 보기 · 주문하기 → 옵션 확인 시트(컬러 · 사이즈 · 수량)' }); codyOptSheet(); render() });
  },
  codyOptSize(x) { const [i, k] = x.split('|'); S.ov.items[+i].size = k; codyOptSheet(true) },
  codyOptColor(x) { const [i, c] = x.split('|'); S.ov.items[+i].color = c; codyOptSheet(true) },
  codyOptQty(x) { const [i, d] = x.split('|'), it = S.ov.items[+i]; it.qty = Math.max(1, it.qty + +d); codyOptSheet(true) },
  codyOptOk() {
    const o = S.ov, its = o.items.map((it) => ({ ...it })), keep = o.canKeep && o.keep;
    its.forEach((it) => { const c = S.cart.find((q) => q.pid === it.pid); if (c) Object.assign(c, { size: it.size, color: it.color, qty: it.qty }) }); // 바꾼 옵션은 장바구니에도
    codyCurIts().forEach((x) => { const it = x.k === 'p' && its.find((q) => q.pid === x.id); if (it) x.size = it.size });
    closeOv(); const sv = keep ? codyQuietSave() : null;
    go('order', { items: its.map((it) => ({ ...it, rec: judge(PB[it.pid]).rec === it.size })) }); if (sv) toast(`'${esc(sv.name)}' 코디도 저장했어요`);
  },
  codyTab() { closeOv(); S.toast = null; go('cody') },
  // 내 옷장에서 시작하는 코디: 내 옷으로만 채우고, 아래 목록도 내 옷이 먼저
  codyNew() { codyGo({ its: [], from: 'closet' }) }, // 새 코디는 빈 바닥에서 시작 (아래 목록에서 골라 놓아요)
  codyEdit(id) { if (CD().saved.some((x) => x.id === id)) go('codyView', { id }) },
  codyCopy(id) { closeOv(); const q = CD().saved.find((x) => x.id === id); if (q) codyGo({ its: codyCopyIts(q.its), pos: q.pos ? JSON.parse(JSON.stringify(q.pos)) : null, bg: q.bg, tags: [...(q.tags || [])], from: 'closet' }) },
  codyDel(id) { closeOv(); const q = CD().saved.find((x) => x.id === id); modal(`<h4>이 코디를 삭제할까요?</h4><p>'${esc(q.name)}'${jo(q.name, '은', '는')} 삭제하면 되돌릴 수 없어요</p><div class="mb"><button class="btn line" data-a="closeOv">취소</button><button class="btn" data-a="codyDelOk" data-x="${id}">삭제</button></div>`); S.ov.node = '#19 맞춰 보기 · 저장한 코디 삭제 확인'; render() },
  codyDelOk(id) { const s = CD(); s.saved = s.saved.filter((x) => x.id !== id); closeOv(); back(); toast('코디를 삭제했어요') },
});

// 테스트 버튼용: 사진 있는 내 옷으로 저장한 코디 n개 (상의 · 하의, 첫 번째는 아우터까지, 두 번째는 상의를 겹쳐 입기)
function sampleSaved(n) {
  const of = (cat) => S.closet.filter((c) => c.cat === cat && c.fit === 'good' && c.img), T = of('top'), B = of('bottom'), O = of('outer'), tg = ['출근', '주말', '약속'], out = [];
  for (let i = 0; i < n && T[i] && B[i % B.length]; i++) {
    const its = [i === 0 && O[0] ? codyIt('c', O[0].id) : null, codyIt('c', B[i % B.length].id), i === 1 && T[i + 1] ? codyIt('c', T[i + 1].id) : null, codyIt('c', T[i].id)].filter(Boolean);
    out.push({ id: 'k' + (uid++), name: codyTitleOf(its, tg[i]), tags: [tg[i]], its, pos: null, bg: CODY_BG[i % CODY_BG.length][0] });
  }
  return out;
}
// 장바구니에 상의 · 하의 하나씩 (재고 있는 첫 사이즈)
function sampleCart() {
  const pick = (cat) => Object.values(PB).find((p) => p.cat === cat && p.sizes && sizeKeys(p).some((z) => !p.out.includes(z)));
  return ['top', 'bottom'].map(pick).filter(Boolean).map((p) => ({ pid: p.id, size: sizeKeys(p).find((z) => !p.out.includes(z)), color: (p.colors || [])[0] || null, qty: 1 }));
}
DJ.feature({
  id: 'fitwith', issue: 19, name: '내 옷이랑 맞춰 보기', proposal: 'docs/proposals/내-옷이랑-맞춰-보기.md',
  screens: SCRX, actions: AX,
  slots: {
    'cart.top': () => codyCartBar(),
    'closet.top': () => S.user ? `<button class="cf-entry" data-a="codyHome"><span><b>내 옷이랑 맞춰 보기</b><small>${CD().saved.length ? `저장한 코디 ${CD().saved.length}개 · ` : ''}장바구니 상품을 내 옷과 같이 놓아 봐요</small></span>${I.chev}</button>` : '',
    'my.menu': () => `<button class="li" data-a="codyHome"><span>내 옷이랑 맞춰 보기${CD().saved.length ? ` <small style="color:var(--text-tertiary);font-weight:500;margin-left:6px;font-size:14px">${CD().saved.length}개</small>` : ''}</span>${I.chev}</button>`,
    'reg.done': () => S.reg && S.reg.from === 'cody' ? `<button class="btn" data-a="codyRegBack">내 옷이랑 맞춰 보기로 돌아가기</button>` : '',
  },
  panel: [
    ['장바구니 2개 담긴 회원', () => { reset('full'); S.cart = sampleCart(); go('cart'); }],
    ['코디 3개 저장해 둔 상태', () => { reset('many'); S.cart = sampleCart(); CD().saved = sampleSaved(3); tab('closet'); go('cody'); }], // reset()이 S를 새로 만들어서 그 뒤에 넣음
    ['옷장이 빈 회원 + 장바구니', () => { reset('nobase'); S.closet = []; S.cart = sampleCart(); go('cart'); }],
  ],
});
})();
