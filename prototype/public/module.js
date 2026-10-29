/* ── 사진 촬영 등록 (촬영 → A4 보정 → 옷 분리 → 치수 → 수정 → 저장) ── */
const MOD = { st: null };
const MCOL = ['#06BC51']; // 시안: 측정선은 모두 초록
const modEl = () => document.getElementById('mod');
const liveOK = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && !(document.featurePolicy && document.featurePolicy.allowsFeature && !document.featurePolicy.allowsFeature('camera'));
function modOpen(cat, opt = {}) {
  MOD.st = { scr: 'guide', cat: cat || 'top', zoom: 1, merge: !!opt.merge };
  modEl().style.display = 'block'; modRender();
  if (window.NaranMeasure && NaranMeasure.aiLoad) setTimeout(() => NaranMeasure.aiLoad().catch(() => { }), 300); // 찍는 동안 AI 모델을 미리 받아 둠
}
function modOpenCap(cat) {
  MOD.st = { mode: 'cap', scr: 'capPick', cat: cat || 'top' };
  modEl().style.display = 'block'; modRender();
}
function modClose() { camStop(); modEl().style.cssText = 'position:absolute;inset:0;z-index:90;background:#fff;display:none;overflow:hidden'; modEl().innerHTML = ''; MOD.st = null; }
// 촬영 화면은 전체 화면으로 (주소창 숨김) · 전체 화면에서는 가로/세로 방향 고정 가능
async function fullOn(orient) {
  try { if (!document.fullscreenElement && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen({ navigationUI: 'hide' }); } catch (e) { }
  try { if (screen.orientation && screen.orientation.lock) await screen.orientation.lock(orient); } catch (e) { }
}
function fullOff() { try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) { } try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => { }); } catch (e) { } }
function camStopOnly() { const st = MOD.st; if (st && st.stream) { st.stream.getTracks().forEach((t) => t.stop()); st.stream = null; } }
function camStop() { clearTimeout(camDetect.h); fullOff(); const st = MOD.st; if (st && st.stream) { st.stream.getTracks().forEach((t) => t.stop()); st.stream = null; } window.removeEventListener('deviceorientation', onTilt); }
window.addEventListener('resize', () => { if (MOD.st && MOD.st.scr === 'live') { clearTimeout(onTilt.rz); onTilt.rz = setTimeout(modRender, 150); } });
function onTilt(e) {
  const b = e.beta || 0, g = e.gamma || 0, el = document.getElementById('lvl'), dot = document.getElementById('lvlDot');
  if (!el || !dot) return; el.hidden = false;
  const flat = Math.abs(b) < 6 && Math.abs(g) < 6; dot.style.transform = `translate(${Math.max(-22, Math.min(22, g * 1.2))}px,${Math.max(-22, Math.min(22, b * 1.2))}px)`;
  dot.style.background = flat ? '#2BD17E' : '#FFB020'; document.getElementById('lvlTxt').textContent = flat ? '바닥과 평행해요' : '휴대폰을 바닥과 평행하게';
}
const GUIDE_TOP = 'M30 8 L42 4 Q50 12 58 4 L70 8 L94 26 L84 42 L74 36 L74 120 L26 120 L26 36 L16 42 L6 26 Z';
const GUIDE_BOT = 'M24 4 L76 4 L82 120 L56 120 L50 40 L44 120 L18 120 Z';
const modBar = (t, white) => `<div class="sb ${white ? 'w' : ''}" style="position:absolute"><span>9:41</span><span class="r">${SB(white ? '#fff' : '#111')}</span></div><div class="hdr" style="position:absolute;top:47px;left:0;right:0;background:${white ? 'transparent' : '#fff'};color:${white ? '#fff' : '#111'}"><button data-m="close" aria-label="뒤로" style="color:inherit">${white ? I.close : I.back}</button><span class="t">${t}</span><span style="width:24px"></span></div>`;

function labPos(m, k) { // 가로 선은 위, 세로 선은 오른쪽 옆(62% 지점)
  const [a, b] = m.p, dx = b[0] - a[0], dy = b[1] - a[1];
  if (Math.abs(dx) >= Math.abs(dy)) { const y = (a[1] + b[1]) / 2 - 9 / k; return [(a[0] + b[0]) / 2, y < 16 / k ? (a[1] + b[1]) / 2 + 20 / k : y, 'middle']; }
  const t = 0.62; return [a[0] + dx * t + 9 / k, a[1] + dy * t, 'start'];
}
function guideShapes(cat, land) {
  const key = cat + (land ? 'L' : 'P'), VW = land ? 400 : 300, VH = land ? 300 : 400;
  if (guideShapes[key]) return guideShapes[key];
  let P, A, W, H;
  if (cat === 'bottom') { // 허리 40 · 밑위 29 · 인심 76 · 허벅지 30cm 일자 바지, A4는 오른쪽 옆
    const w = 200, rise = 290, ins = 760, th = 300, hem = 205;
    P = [[-w, 0], [w, 0], [w + 40, rise * 0.55], [6 + th, rise], [24 + hem, rise + ins], [24, rise + ins], [0, rise + 8], [-24, rise + ins], [-24 - hem, rise + ins], [-6 - th, rise], [-w - 40, rise * 0.55]];
    A = [6 + th + 50, 380]; H = [-30, rise + ins + 30];
  } else { // 총장 72 · 가슴 54 · 어깨 47cm 반팔, A4는 밑단 아래
    const a = 45 * Math.PI / 180, sh = 235, ch = 268, nk = 90, drop = 34, SL = 190, open = 130, L = 720;
    const shL = [-sh, drop], tT = [shL[0] - SL * Math.cos(a), shL[1] + SL * Math.sin(a)], tB = [tT[0] + open * Math.sin(a), tT[1] + open * Math.cos(a)];
    const left = [[-nk, 0], shL, tT, tB, [-ch, drop + 190], [-ch, L]], right = left.slice().reverse().map(([x, y]) => [-x, y]), neck = [];
    for (let i = 1; i < 16; i++) { const t = i / 16; neck.push([nk * Math.cos(Math.PI * t), 70 * Math.sin(Math.PI * t)]); }
    P = left.concat(right, neck); A = [ch + 30, 300]; // 오른팔(소매) 아래, 몸판 옆 빈 바닥 W = [tT[0] - 25, -tT[0] + 25]; H = [-30, L + 70 + 297 + 30];
  }
  { const xs = P.map((q) => q[0]).concat([A[0], A[0] + 210]), ys = P.map((q) => q[1]).concat([A[1], A[1] + 297]); W = [Math.min(...xs) - 30, Math.max(...xs) + 30]; H = [Math.min(...ys) - 30, Math.max(...ys) + 30]; }
  const k = Math.min(VW / (W[1] - W[0]), VH / (H[1] - H[0])), ox = (VW - (W[1] - W[0]) * k) / 2 - W[0] * k, oy = (VH - (H[1] - H[0]) * k) / 2 - H[0] * k;
  const g = 'M' + P.map(([x, y]) => (x * k + ox).toFixed(1) + ' ' + (y * k + oy).toFixed(1)).join(' L') + ' Z';
  return (guideShapes[key] = { g, a: [A[0] * k + ox, A[1] * k + oy, 210 * k, 297 * k], VW, VH });
}
// 무신사에서 같은 상품 찾기: 확실하면 바로 실측 화면, 아니면 후보를 보여 줘서 한 번 누르게
async function capFind(name, brand) {
  const st = MOD.st; if (!st || typeof API === 'undefined' || !API.on) return false;
  st.scr = 'capBusy'; st.capStep = 2; modRender();
  const j = await fetch('/api/find?name=' + encodeURIComponent(name) + '&brand=' + encodeURIComponent(brand || '') + '&size=' + encodeURIComponent(st.size || '') + '&color=' + encodeURIComponent(st.color || '')).then((x) => x.json()).catch(() => null);
  if (!MOD.st) return true;
  if (j && j.ok && j.match) { capGo(j.match); return true; } // 실측표가 없어도 같은 상품이면 사진 · 이름 · 분류는 가져옴
  st.cands = j && j.ok ? (j.cands || []).filter((c) => c.score >= 0.12) : []; st.found = j && j.ok ? 'none' : 'error';
  return false;
}
async function capBg(c) { // 상품 사진의 배경만 투명하게 (사람 · 옷은 남김). 실패하면 null → 원래 사진 사용
  try {
    const o = await Promise.race([NaranMeasure.aiCutout(c, 'all'), new Promise((ok) => setTimeout(() => ok(null), API.on ? 60000 : 15000))]);
    if (!o || o.frac < 0.04) return null;
    return o.canvas.toDataURL('image/png');
  } catch (e) { return null; }
}
function optSize(keys, opt) { // 옵션 줄(예: '블랙 / 05(100) / 1개')에서 이 상품의 실제 사이즈 이름 찾기
  if (!opt || !keys.length) return null;
  const N = (x) => String(x).normalize('NFKC').toUpperCase().replace(/[\s()\[\]\/·|_\-]+/g, ''), whole = N(opt), toks = opt.split(/\s*[\/|·]\s*/).map(N).filter((t) => t && !/^\d+(개|7H|H)$/.test(t)); // 수량(1개, 글자 인식이 17H로 읽은 것)은 빼고
  for (const k of keys) if (toks.includes(N(k))) return k; // 그대로 같은 것
  const long = keys.slice().sort((a, b) => N(b).length - N(a).length);
  for (const k of long) { const nk = N(k); if (nk.length >= 2 && whole.includes(nk)) return k; } // 'BLACK / M' · '브라운 S' 처럼 색상이 붙은 사이즈 이름
  const lev = (a, b) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };
  const near = []; for (const k of keys) { const nk = N(k); if (nk.length < 2) continue; for (const t of toks) if (t && Math.abs(t.length - nk.length) <= 1 && lev(t, nk) <= 1) near.push(k); }
  if (new Set(near).size === 1) return near[0]; // 글자 인식이 한 글자 틀린 경우 (2(L) → 2(|))
  for (const t of toks) { const z = sizeOK(t.replace(/^SIZE/, '')) || sizeOK((t.match(/(XXS|XS|XXL|2XL|3XL|XL|FREE|ONESIZE|OS|S|M|L|\d{2,3})/) || [])[1] || ''); if (z) { const k = matchSize(keys, z); if (k) return k; } }
  return null;
}
function capGo(m) { // 찾은 상품의 실측표 화면으로 (캡처에서 읽은 사이즈가 있으면 미리 고름)
  const st = MOD.st, img = st.useCut ? st.cap.cut : st.cap.rect, keys = [...new Set(Object.keys(m.table || {}).concat(m.sizes || []))], cs = st.size, sz = optSize(keys, st.opt) || (cs ? matchSize(keys, String(cs).normalize('NFKC').toUpperCase()) : null) || (!keys.length && cs ? String(cs) : null); // 무신사에 사이즈 목록이 없으면 읽은 사이즈 그대로
  modClose(); S.reg.cat = m.cat || S.reg.cat;
  const cat = S.reg.cat || 'top';
  toMeasure({ cat, srv: m, mcat: m.mcat || null, mcatName: m.mcatName || null, pk: cat, img, capImg: true, name: m.name || st.name || '', size: sz, sizeList: keys.length ? keys : (m.sizes || []), tbl: srvTbl(m, cat), src: '구매내역 캡처 + ' + (m.site || '쇼핑몰') + ' 실측표', note: m.table ? (m.tableSource || '판매처 실측') : '실측표를 찾지 못했어요', noteOk: !!m.table, info: { site: m.site, brand: m.brand }, capMsg: `캡처에서 읽은 상품명으로 <b>${esc(m.site || '무신사')}에서 같은 상품</b>을 찾았어요${m.colorDiff ? ` · 캡처의 [${esc(m.colorDiff.cap)}] 색상은 없어서 같은 모델 [${esc(m.colorDiff.got)}]의 실측이에요` : ''}${cs ? (sz ? ` · 산 사이즈 <b>${esc(sz)}</b>도 읽었어요` : ` · 읽은 사이즈(${esc(cs)})가 실측표에 없어서 골라 주세요`) : ' · 산 사이즈를 골라 주세요'}` });
}
const ocrRace = (p) => API.on ? p : Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('ocr timeout')), 15000))]);
let OCRE = null;
async function sizeRetry(pc, line) { // 옵션 한 줄만 영문·숫자로 다시 읽기 (M, L 같은 한 글자 사이즈를 놓칠 때)
  if (!OCRE) { OCRE = await Tesseract.createWorker('eng'); await OCRE.setParameters({ tessedit_char_whitelist: 'SMLXFREO0123456789/ ', tessedit_pageseg_mode: '7' }); }
  const b = line.b, pad = (b.y1 - b.y0) * 0.4, c = document.createElement('canvas'); c.width = Math.round(b.x1 - b.x0 + pad * 2); c.height = Math.round(b.y1 - b.y0 + pad * 2);
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(pc, b.x0 - pad, b.y0 - pad, c.width, c.height, 0, 0, c.width, c.height);
  const { data } = await OCRE.recognize(c); const parts = String(data.text || '').split('/').map((t) => t.trim()).filter(Boolean);
  for (const t of parts) { const z = sizeOK(t.split(/\s+/)[0] || ''); if (z) return z; }
  return null;
}
let OCRW = null;
async function ocrText(canvas) { // tesseract.js: 휴대폰 안에서 한글·영문 글자 읽기 (처음에 인식 파일을 받음)
  if (!window.Tesseract) await new Promise((ok, no) => { const sc = document.createElement('script'); sc.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js'; sc.onload = ok; sc.onerror = no; document.head.appendChild(sc); });
  if (!OCRW) OCRW = await Tesseract.createWorker(['kor', 'eng']);
  const { data } = await OCRW.recognize(canvas); return data.text || '';
}
async function ocrLines(canvas) {
  if (!window.Tesseract) await new Promise((ok, no) => { const sc = document.createElement('script'); sc.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js'; sc.onload = ok; sc.onerror = no; document.head.appendChild(sc); });
  if (!OCRW) OCRW = await Tesseract.createWorker(['kor', 'eng']);
  // 글자 읽기 전 손질: 키우고 흑백으로 (연한 회색 옵션 글씨·어두운 화면 모드도 읽히게)
  const sc = Math.min(2.2, Math.max(1, 1400 / canvas.width)), pc = document.createElement('canvas'); pc.width = Math.round(canvas.width * sc); pc.height = Math.round(canvas.height * sc);
  const px = pc.getContext('2d', { willReadFrequently: true }); px.imageSmoothingQuality = 'high'; px.drawImage(canvas, 0, 0, pc.width, pc.height);
  const im = px.getImageData(0, 0, pc.width, pc.height), dd = im.data; let sum = 0; for (let i = 0; i < dd.length; i += 4) sum += dd[i] * 0.3 + dd[i + 1] * 0.59 + dd[i + 2] * 0.11;
  const dark = sum / (dd.length / 4) < 110;
  for (let i = 0; i < dd.length; i += 4) { let g = dd[i] * 0.3 + dd[i + 1] * 0.59 + dd[i + 2] * 0.11; if (dark) g = 255 - g; const v = g < 205 ? Math.max(0, (g - 30) * 0.6) : 255; dd[i] = dd[i + 1] = dd[i + 2] = v; }
  px.putImageData(im, 0, 0);
  const { data } = await OCRW.recognize(pc, {}, { text: true, blocks: true });
  const L = []; (data.blocks || []).forEach((b) => (b.paragraphs || []).forEach((p) => (p.lines || []).forEach((l) => { const t = (l.text || '').replace(/\s+/g, ' ').trim(); if (t) L.push({ t, b: l.bbox }); })));
  L.sort((a, b) => a.b.y0 - b.b.y0);
  return { text: data.text || '', lines: L, pc };
}
const PRICE = /^\s*\d{1,3}(?:[,.]\d{3})+/; // 줄이 가격으로 시작 ('원'을 8로 읽거나 옆 버튼 글자가 붙어도)
function findProducts(lines, W) { // 쇼핑앱 주문 내역: 상품마다 [브랜드 / 상품명 / 옵션] 아래에 가격 줄 → 가격 줄을 기준으로 위 줄들을 한 상품으로
  const out = [];
  lines.forEach((l, i) => {
    if (!PRICE.test(l.t) || l.b.x0 < W * 0.08) return; // 왼쪽 끝 가격(합계 등)은 상품 줄이 아님
    const x0 = l.b.x0, lh = l.b.y1 - l.b.y0, blk = [];
    for (let j = i - 1; j >= 0 && blk.length < 4; j--) {
      const q = lines[j]; if (q.b.x0 > x0 + W * 0.05 || q.b.x0 < x0 - W * 0.22) { if (q.b.y1 < (blk[0] || l).b.y0 - lh * 2.5) break; continue; }
      if ((blk[0] || l).b.y0 - q.b.y1 > lh * 2.5) break; if (PRICE.test(q.t)) break; blk.unshift(q);
    }
    if (!blk.length) return;
    const info = parseBlock(blk.map((q) => q.t)); if (!info.name) return;
    const y0 = blk[0].b.y0, y1 = l.b.y1, h = y1 - y0, pad = h * 0.12;
    out.push({ ...info, price: (l.t.match(/\d{1,3}(?:[,.]\d{3})+/) || [''])[0] + '원', box: [Math.max(0, Math.round(x0 - h * 1.35 - W * 0.02)), Math.max(0, Math.round(y0 - pad)), Math.round(x0 - W * 0.012), Math.round(y1 + pad)] });
  });
  return out;
}
const SIZE1 = /^(XXS|XS|S|M|L|XL|XXL|2XL|3XL|4XL|FREE|F|ONE ?SIZE|ONE|OS|SMALL|MEDIUM|LARGE|X-?LARGE|\d{2,3})$/i;
const sizeOK = (t) => { t = t.toUpperCase().replace(/\s/g, ''); if (/^\d+$/.test(t)) { const v = +t; return (v >= 22 && v <= 44) || (v >= 80 && v <= 130) ? t : null; } return SIZE1.test(t) ? t.replace('-', '') : null; };
function parseBlock(ls) { // 한 상품의 글자 줄들 → 브랜드 · 상품명 · 사이즈
  let size = null, si = -1;
  ls.forEach((l, i) => { if (size || /원\s*$|\d{1,3},\d{3}/.test(l)) return; // 가격 줄(103,550원)을 사이즈로 읽지 않음
    const parts = l.replace(/^(옵션|사이즈|size)\s*[:：]?\s*/i, '').split(/\s*[\/|,·ㆍ]\s*/).map((x) => x.trim()).filter(Boolean);
    if ((parts.length >= 2 && parts.every((x) => x.length <= 14)) || /옵션|사이즈|개$/.test(l)) for (const x of parts) { const z = sizeOK(x.split(/[\s\-·ㆍ]+/)[0] || ''); if (z) { size = z; si = i; break; } } });
  const BAD = /(점$|매장|주문|배송|구매 ?완료|구매확정|교환|반품|리뷰|결제|번호|상세|신청|도착|쿠폰|적립|스냅|보기|원$|\d+\s*개$)/;
  let oi = si; if (oi < 0) oi = ls.findIndex((l) => /\d\s*개\s*$|\/\s*\d+\s*개|옵션/.test(l)); if (oi < 0) oi = ls.findIndex((l) => (l.match(/\//g) || []).length >= 1 && l.split('/').every((x) => x.trim().length <= 14) && !/원$/.test(l));
  // 글자 인식이 옵션 줄을 '블랙' · 'L' · '17H' 처럼 조각내면: 셋째 줄부터 처음 나오는 짧은 줄(색상·사이즈 조각)이나 가격 줄을 옵션 시작으로
  if (oi < 0) oi = ls.findIndex((l, i) => i >= 2 && (l.replace(/\s/g, '').length <= 6 || /원$|\d{1,3},\d{3}/.test(l)));
  const optLine = oi >= 0 ? ls.slice(oi, oi + 4).filter((l) => !/원$|\d{1,3},\d{3}/.test(l)).join(' / ') : '';
  const rest = ls.filter((l, i) => i !== si && !BAD.test(l) && /[가-힣A-Za-z]{2,}/.test(l));
  // 주문내역 구조: 브랜드 → 상품명(두 줄로 꺾일 수 있음) → 옵션(사이즈) 줄. 구조가 보이면 그대로 쓰고, 아니면 한글이 가장 많은 줄
  const pre = oi >= 0 ? ls.slice(0, oi).filter((l) => !BAD.test(l) && /[가-힣A-Za-z]{2,}/.test(l)) : [];
  let name, brand;
  if (pre.length >= 2 && pre[0].length <= 24) { brand = pre[0]; name = pre.slice(1).join(' '); }
  else if (pre.length === 1) { brand = ''; name = pre[0]; }
  else { name = rest.slice().sort((a, b) => (b.match(/[가-힣]/g) || []).length - (a.match(/[가-힣]/g) || []).length || b.length - a.length)[0] || ''; const ni = rest.indexOf(name); brand = ni > 0 ? rest[ni - 1] : ''; }
  return { opt: optLine, color:(optLine.split(/\s*[\/|]\s*/)[0] || '').replace(/^(옵션|색상|컬러)\s*[:：]?\s*/, '').trim().slice(0, 12), name: name.slice(0, 80), brand: brand.replace(/^([^0-9A-Za-z가-힣\[]+|[가-힣A-Za-z]{1,2}\s+(?=[가-힣A-Za-z]{2,}))/, '').trim().slice(0, 30), size, cat: catGuess(name) };
}
const SZW = '(XXS|XS|S|M|L|XL|XXL|2XL|3XL|4XL|FREE|F|SMALL|MEDIUM|LARGE|X-?LARGE|\\d{2,3})';
function parseOrder(text) { // 주문 내역 글자 → 상품명 · 브랜드 · 산 사이즈
  const lines = text.split('\n').map((l) => l.replace(/[|]/g, ' ').replace(/\s+/g, ' ').trim()).filter((l) => l.length > 1);
  let size = null;
  for (const l of lines) {
    // 사이즈 뒤에는 · ㆍ - , | / 개수(1개) 같은 것이 오거나 줄이 끝남 (글자 인식이 '·1개'를 '- 174'처럼 읽기도 함)
    const END = '(?=\\s*(?:[·ㆍ•.,|/\\-]|\\d|$))';
    const m = l.match(new RegExp('(?:옵션|사이즈|size)[^\\n]*?[/:,]\\s*' + SZW + END, 'i')) || l.match(new RegExp('/\\s*' + SZW + END, 'i'));
    if (m) { size = m[1].toUpperCase().replace('-', ''); break; }
  }
  const BAD = /(주문|배송|옵션|사이즈|교환|반품|리뷰|결제|번호|완료|상세|신청|도착|확정|장바구니|쿠폰|적립|원$|\d{1,3},\d{3})/;
  const cand = lines.filter((l) => !BAD.test(l) && /[가-힣A-Za-z]{2,}/.test(l));
  const name = cand.find((l) => (l.match(/[가-힣]/g) || []).length >= 4) || cand.slice().sort((x, y) => y.length - x.length)[0] || '';
  const ni = cand.indexOf(name), brand = ni > 0 && cand[ni - 1].length <= 24 ? cand[ni - 1].replace(/^[^0-9A-Za-z가-힣\[]+/, '') : '';
  if (!name && !size) return null;
  return { name: name.slice(0, 60), brand, size, raw: text.slice(0, 400) };
}
function catGuess(n) { const t = String(n || ''); if (/(팬츠|바지|슬랙스|데님|진$|청바지|쇼츠|반바지|조거|스커트)/.test(t)) return 'bottom'; if (/(자켓|재킷|코트|점퍼|패딩|가디건|블루종|아우터|파카)/.test(t)) return 'outer'; if (/(티셔츠|셔츠|니트|맨투맨|후드|스웨트|블라우스|탑|나시)/.test(t)) return 'top'; return null; }
function matchSize(keys, s) { // 캡처 사이즈(L) ↔ 실측표 사이즈 이름(LARGE, WHITE/BLACK L, 95(L) …)
  const FR = ['FREE', 'F', 'ONE', 'ONESIZE', 'OS', 'ONE SIZE'], al = { S: ['S', 'SMALL'], M: ['M', 'MEDIUM'], L: ['L', 'LARGE'], XL: ['XL', 'XLARGE', 'X-LARGE'], SMALL: ['S', 'SMALL'], MEDIUM: ['M', 'MEDIUM'], LARGE: ['L', 'LARGE'], XLARGE: ['XL', 'XLARGE', 'X-LARGE'], FREE: FR, F: FR, ONE: FR, ONESIZE: FR, OS: FR }[s] || [s];
  for (const k of keys) if (al.includes(k.toUpperCase())) return k;
  for (const k of keys) { const toks = k.toUpperCase().split(/[^0-9A-Z-]+/); if (toks.some((t) => al.includes(t))) return k; }
  return null;
}
function modRender() {
  const st = MOD.st; if (!st) return; const el = modEl();
  el.style.cssText = st.scr === 'live' ? 'position:fixed;inset:0;z-index:999;background:#000;display:block;overflow:hidden' : 'position:absolute;inset:0;z-index:90;background:#fff;display:block;overflow:hidden';
  let h = '';
  if (st.scr === 'guide') {
    const g = st.cat === 'bottom' ? GUIDE_BOT : GUIDE_TOP;
    h = `${modBar('사진 촬영 등록')}<div class="body" style="top:99px;bottom:92px;padding-bottom:20px">
      <div class="fex"><b>예시 이미지</b>${st.cat === 'bottom' ? `<svg viewBox="0 0 120 150" width="104" height="130" fill="none" stroke="#979797" stroke-width="1.5" stroke-linejoin="round"><g transform="translate(6 6) scale(1.2)"><path d="${g}"/></g></svg>` : '<svg width="153.5" height="149.5" viewBox="0 0 153.5 149.5" fill="none" xmlns="http://www.w3.org/2000/svg"> <g> <path d="M54.7445 12.9478L61.2646 0.750035C71.5881 2.37641 81.9116 2.37641 92.2351 0.750035L98.7552 12.9478C111.524 17.2848 121.576 23.1127 128.911 30.4314C140.049 57.2665 147.928 90.0651 152.546 128.827C153.361 133.435 151.731 136.281 147.656 137.365L146.026 147.124C139.778 149.292 133.257 149.292 126.466 147.124L124.836 137.365L115.729 78.8474L115.056 143.058C89.5184 147.395 63.9814 147.395 38.4443 143.058L39.1173 78.8474L28.6641 137.365L27.0341 147.124C20.2423 149.292 13.7222 149.292 7.47375 147.124L5.84373 137.365C1.76866 136.281 0.138634 133.435 0.953647 128.827C5.57206 90.0651 13.4505 57.2665 24.589 30.4314C31.9242 23.1127 41.976 17.2848 54.7445 12.9478Z" fill="white"/> <path d="M98.7552 12.9478L92.2351 0.750035C81.9116 2.37641 71.5881 2.37641 61.2646 0.750035L54.7445 12.9478M28.6641 137.365C21.0573 140.076 13.4505 140.076 5.84373 137.365C1.76866 136.281 0.138634 133.435 0.953647 128.827C5.57206 90.065 13.4505 57.2665 24.589 30.4314C31.9242 23.1127 41.976 17.2848 54.7445 12.9478M54.7445 12.9478C56.9179 25.1456 64.253 31.2445 76.7499 31.2445M61.2646 0.750035L76.7499 31.2445M92.2351 0.750035L76.7499 31.2445M124.836 137.365C132.442 140.076 140.049 140.076 147.656 137.365C151.731 136.281 153.361 133.435 152.546 128.827C147.928 90.065 140.049 57.2665 128.911 30.4314C121.576 23.1127 111.524 17.2848 98.7552 12.9478M98.7552 12.9478C96.5819 25.1456 89.2468 31.2445 76.7499 31.2445M128.911 30.4314C119.402 49.9478 115.457 58.5178 115.729 78.8474M115.729 78.8474L124.836 137.365L126.466 147.124C133.257 149.292 139.778 149.292 146.026 147.124L147.656 137.365M115.729 78.8474L115.056 143.058C89.5184 147.395 63.9814 147.395 38.4443 143.058L39.1173 78.8474M39.1173 78.8474L28.6641 137.365M39.1173 78.8474C39.389 58.5178 34.0975 49.9478 24.589 30.4314M28.6641 137.365L27.0341 147.124C20.2423 149.292 13.7222 149.292 7.47375 147.124L5.84373 137.365M76.7499 31.2445V146.31" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke="#979797"/> </g> </svg>'}<span class="fa4">A4</span></div>
      <div class="pad" style="margin-top:18px">
        ${(st.cat === 'bottom' ? [['바지를 바닥에 펴고, 옆에 A4 한 장', '두 다리 사이는 조금 벌리고, A4는 바지에 닿지 않게'], ['서서 위에서 찍기', '바지 전체와 A4가 다 보이면 돼요']] : [['옷을 바닥에 펴고, 옆에 A4 한 장', '소매는 옆으로 펴고, A4는 옷에 닿지 않게'], ['서서 위에서 찍기', '옷 전체와 A4가 다 보이면 돼요 · 폰은 가로·세로 아무렇게나']]).map(([a, b], i) => `<div class="fguide"><span class="fn">${i + 1}</span><span><b>${a}</b><small>${b.replace(' · ', '<br>')}</small></span></div>`).join('<i class="rsep" style="margin:0"></i>')}
      </div>
      <div class="pad" style="margin-top:20px"><div class="fdemo" style="margin:0 0 8px">시연용 사진</div><div style="display:flex;gap:8px">${[['tee', '티셔츠', 'top'], ['jeans', '청바지', 'bottom'], ['noa4', 'A4 없는 사진', 'top']].map(([k, t, c]) => `<button data-m="sample" data-x="${k}|${c}" style="flex:1;border:1px solid var(--line-ds);border-radius:10px;overflow:hidden;text-align:left"><div class="img" style="height:86px"><img src="${SAMPLE[k]}"></div><div style="font-size:12.5px;font-weight:600;padding:6px 8px">${t}</div></button>`).join('')}</div></div>
      <input type="file" accept="image/*" capture="environment" id="mCam" hidden><input type="file" accept="image/*" id="mAlb" hidden>
    </div>
    <div class="bar"><button class="btn fb line" data-m="album">앨범에서 선택</button><button class="btn fb" data-m="${liveOK() ? 'live' : 'native'}">사진 촬영</button></div>`;
  } else if (st.scr === 'live') {
    const det = st.det, zc = st.zoomCap && st.zoomCap.min < st.zoomCap.max, land = innerWidth > innerHeight, VW = innerWidth, VH = innerHeight;
    st.vb = [VW, VH];
    const msg = det && det.ok ? (det.small ? ['조금 더 가까이 찍어 주세요', '#FFB020'] : ['A4를 찾았어요 · 이대로 찍으면 돼요', '#2BD17E']) : ['A4가 다 보이게 같이 찍어 주세요', '#FFFFFF'];
    const hint = st.cat === 'bottom' ? '바지 전체와 A4가 다 보이게, 위에서 찍어 주세요 · 다리 사이는 조금 벌려서' : '옷 전체와 A4가 다 보이게, 위에서 찍어 주세요 · 폰은 가로·세로 아무렇게나';
    const lensBtn = st.lenses && st.lenses.length > 1 ? `<button data-m="lens" style="height:36px;padding:0 14px;border-radius:18px;background:rgba(0,0,0,.55);color:#fff;font-size:13px;font-weight:700;border:1px solid rgba(255,255,255,.35)">렌즈 바꾸기 ${st.lensIdx + 1}/${st.lenses.length}</button>` : '';
    const zoomBar = zc ? `<div style="display:flex;align-items:center;gap:8px;color:#fff;font-size:12px;font-weight:700;width:${land ? 160 : 240}px"><span>${st.zoomCap.min.toFixed(1)}×</span><input id="mZoom" type="range" min="${st.zoomCap.min}" max="${st.zoomCap.max}" step="0.1" value="${st.zoom}" style="flex:1;accent-color:#fff"><span id="mZoomV">${st.zoom.toFixed(1)}×</span></div>` : '';
    const shutter = `<button data-m="shoot" aria-label="촬영" style="width:74px;height:74px;border-radius:50%;border:5px solid #fff;background:rgba(255,255,255,.3);flex:none"></button>`;
    h = `<div style="position:absolute;inset:0;background:#000;overflow:hidden">
      <video id="mVid" playsinline muted autoplay style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain"></video>
      <svg viewBox="0 0 ${VW} ${VH}" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none"><polygon id="mDet" points="${det && det.ok ? det.pts : ''}" fill="rgba(43,209,126,.28)" stroke="#2BD17E" stroke-width="3" stroke-linejoin="round"/></svg>
      <div style="position:absolute;left:0;right:0;top:0;padding:calc(10px + env(safe-area-inset-top,0px)) 12px 10px;display:flex;align-items:center;gap:10px;background:linear-gradient(rgba(0,0,0,.55),transparent)">
        <button data-m="close" style="color:#fff;flex:none">${I.close}</button>
        <div style="flex:1;min-width:0;text-align:center"><span id="mDetT" style="display:inline-block;padding:7px 12px;border-radius:16px;background:rgba(0,0,0,.55);color:${msg[1]};font-size:14px;font-weight:700">${msg[0]}</span><div style="color:rgba(255,255,255,.85);font-size:12px;margin-top:5px;text-shadow:0 1px 3px rgba(0,0,0,.8)">${hint}</div></div>
        <span style="width:24px;flex:none"></span></div>
      ${land
        ? `<div style="position:absolute;right:14px;top:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px">${lensBtn}${shutter}${zoomBar}</div>`
        : `<div style="position:absolute;left:0;right:0;bottom:0;padding:12px 16px calc(18px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;align-items:center;gap:12px;background:linear-gradient(transparent,rgba(0,0,0,.55))">${zoomBar}<div style="display:flex;align-items:center;gap:18px">${lensBtn}${shutter}</div></div>`}
      <div id="lvl" hidden style="position:absolute;left:14px;bottom:${land ? 14 : 26}px;width:60px;text-align:center;color:#fff;font-size:10px;text-shadow:0 1px 3px rgba(0,0,0,.8)"><div style="width:38px;height:38px;margin:0 auto;border-radius:50%;border:2px solid rgba(255,255,255,.8);position:relative"><i id="lvlDot" style="position:absolute;left:12px;top:12px;width:10px;height:10px;border-radius:50%;background:#FFB020"></i></div><span id="lvlTxt">수평 확인</span></div></div>`;
  } else if (st.scr === 'busy') {
    const ai = window.NaranMeasure && NaranMeasure.aiState, dl = st.step === 'ai' && ai && ai.phase === 'download' && ai.pct < 1;
    const steps = [['a4', 'A4 네 모서리 찾기'], ['warp', '원근 · 실제 크기 보정'], ['ai', dl ? `AI 모델 받는 중 ${Math.round(ai.pct * 100)}% · 처음 한 번만` : 'AI로 옷 윤곽 찾기'], ['seg', '옷 한 벌 분리'], ['measure', '측정선 · cm 계산']], cur = steps.findIndex((s) => s[0] === (st.step === 'ai2' ? 'ai' : st.step));
    h = `${modBar('분석 중')}<div class="body" style="top:99px;bottom:0"><div style="margin:8px 16px 0;border-radius:12px;overflow:hidden;background:#000;height:300px;position:relative">${st.thumb ? `<img src="${st.thumb}" style="width:100%;height:100%;object-fit:contain;opacity:.85">` : ''}<div class="spin" style="position:absolute;left:50%;top:50%;margin:-18px 0 0 -18px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div></div>
      <div class="pad" style="margin-top:16px"><div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700"><span id="mGT">${dl ? 'AI 모델 받는 중' : '치수 재는 중'}</span><span id="mGP" style="font-variant-numeric:tabular-nums">${Math.round(busyPct(st) * 100)}%</span></div>
      <div style="height:8px;border-radius:4px;background:var(--line-ds);margin-top:7px;overflow:hidden"><div id="mGB" style="height:100%;width:${busyPct(st) * 100}%;background:var(--ink);border-radius:4px;transition:width .25s linear"></div></div>
      <div style="font-size:12px;color:var(--sub);margin-top:6px">${ai && ai.phase !== 'ready' && ai.phase !== 'fail' ? '처음에는 AI 모델(약 30MB)을 받느라 조금 더 걸려요. 다음부터는 빨라요' : '사진은 휴대폰 밖으로 나가지 않아요'}</div></div>
      <div class="pad" style="margin-top:8px">${steps.map((s, i) => `<div style="display:flex;align-items:center;gap:10px;height:38px;font-size:15px;${i > cur ? 'color:var(--text-tertiary)' : ''}"><span style="width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;${i < cur ? 'background:var(--primary);color:var(--on-primary)' : i === cur ? 'border:1px solid var(--primary);background:var(--primary-subtle)' : 'border:1.5px solid var(--line-ds)'}">${i < cur ? '✓' : ''}</span>${s[1]}</div>`).join('')}</div></div>`;
  } else if (st.scr === 'fail') {
    const a4 = st.res.status === 'fail-a4';
    h = `${modBar('다시 확인이 필요해요')}<div class="body" style="top:99px;bottom:0">
      <div style="margin:8px 16px 0;border-radius:12px;overflow:hidden;background:#000;height:250px"><img src="${st.thumb}" style="width:100%;height:100%;object-fit:contain"></div>
      <div class="pad" style="margin-top:18px"><div style="font-size:20px;font-weight:800;letter-spacing:-.02em">${a4 ? 'A4 용지를 찾지 못했어요' : '옷을 바닥과 구분하지 못했어요'}</div>
      <div style="font-size:14px;color:var(--ink2);margin-top:6px;line-height:1.55">치수를 정확히 재려면 ${a4 ? 'A4가 실제 크기 기준이 돼야 해서, 찾지 못한 채로 숫자를 만들지 않았어요' : '옷 윤곽이 필요해서, 추측한 숫자를 보여 드리지 않았어요'}</div>
      <div style="margin-top:14px;border-radius:10px;background:var(--gray);padding:12px 14px;font-size:13.5px;line-height:1.7">${(a4 ? ['A4 네 모서리가 모두 사진 안에 있나요?', '종이가 옷이나 그림자에 가리지 않았나요?', '흰 바닥이면 A4가 잘 안 보여요. 어두운 바닥에서 찍어 주세요'] : ['옷 전체가 사진 안에 들어왔나요?', '바닥과 옷 색이 비슷하지 않나요?', '진한 그림자가 옷에 걸치지 않았나요?']).map((t) => '· ' + t).join('<br>')}</div></div>
      <div class="pad" style="margin-top:18px;display:grid;gap:8px;padding-bottom:30px"><button class="btn" data-m="retake">다시 찍기</button>${a4 ? '<button class="btn line" data-m="fixa4">A4 모서리 직접 찍기</button>' : '<button class="btn line" data-m="roi">옷 영역 직접 지정하기</button><button class="btn line" data-m="manual">치수 직접 입력하기</button>'}</div></div>`;
  } else if (st.scr === 'fixa4') {
    const ph = st.res.photo, k = Math.min(358 / ph.w, 470 / ph.h), W = ph.w * k, H = ph.h * k, q = st.quad;
    h = `${modBar('A4 모서리 맞추기')}<div class="body" style="top:99px;bottom:92px"><div class="p" style="padding-top:0">파란 점 네 개를 A4 종이의 네 모서리에 끌어다 맞춰 주세요</div>
      <div style="display:flex;justify-content:center;margin-top:10px"><svg id="mSvg" viewBox="0 0 ${ph.w} ${ph.h}" style="width:${W}px;height:${H}px;touch-action:none;border-radius:8px;background:#000"><image href="${st.photoURL}" width="${ph.w}" height="${ph.h}"/>
        <polygon id="mQ" points="${q.map((p) => p.join(',')).join(' ')}" fill="rgba(47,91,234,.18)" stroke="#06BC51" stroke-width="${2.5 / k}"/>
        ${q.map((p, j) => `<circle data-h="q|${j}" cx="${p[0]}" cy="${p[1]}" r="${16 / k}" fill="rgba(47,91,234,.25)" stroke="#fff" stroke-width="${2.5 / k}"/><circle cx="${p[0]}" cy="${p[1]}" r="${4 / k}" fill="#fff" pointer-events="none" id="mQd${j}"/>`).join('')}</svg></div></div>
      <div class="bar"><button class="btn line" style="flex:.6" data-m="retake">다시 찍기</button><button class="btn" data-m="rerun">이 모서리로 다시 계산</button></div>`;
  } else if (st.scr === 'capPick') {
    h = `${modBar('구매내역 캡처 등록')}<div class="body" style="top:99px;bottom:92px">
      <div class="ftitle">산 옷이 보이는 캡처를<br>골라 주세요</div>
      <div class="fdesc">쇼핑앱 주문 내역이나 상품 페이지 캡처면 돼요.<br>옷 한 벌만 잘라서 배경을 지운 이미지로 등록해요</div>
      <div class="pad"><div class="fdemo">발표 시연용 캡처로 해 보기</div>
        <button data-m="capSample" style="margin-top:8px;width:120px;border:1px solid var(--line-ds);border-radius:8px;overflow:hidden;text-align:left"><div class="img" style="height:128px"><img src="${SAMPLE.cap}" style="object-position:top"></div><div style="font-size:12px;font-weight:500;padding:6px 8px">주문 상세 캡처</div></button></div>
      <input type="file" accept="image/*" id="mCap" hidden></div>
      <div class="bar"><button class="btn fb" data-m="capAlbum">앨범에서 고르기</button></div>`;
  } else if (st.scr === 'capCrop' || st.scr === 'area') {
    const area = st.scr === 'area', R0 = modEl().getBoundingClientRect(), ph = st.res.photo, W = area ? Math.min(R0.width - 24, 520, (R0.height - 99 - 92 - 70) * ph.w / ph.h) : Math.min(R0.width - 24, 520), k = W / ph.w, H = ph.h * k, r = st.roi;
    st.cropK = k;
    h = `${modBar(area ? '잴 옷 고르기' : '등록할 옷 고르기')}<div class="body" id="mCropBody" style="top:99px;bottom:92px"><div class="finfo">${area ? '네모를 옷에 맞게 줄여 주세요. 옷이 있는 곳을 누르면 네모가 옮겨 가요. 네모 밖(다리·발 등)은 재지 않아요' : '등록할 옷이 있는 곳을 한 번 누르면 네모가 옮겨 가요. 옷 사진과 상품명·사이즈가 네모 안에 들어오게 맞춰 주세요'}</div>
      <div id="mCrop" style="position:relative;width:${W}px;height:${H}px;margin:16px auto 24px;overflow:hidden;border-radius:11px;touch-action:pan-y">
        <img src="${st.photoURL}" style="position:absolute;inset:0;width:100%;height:100%;max-width:none;pointer-events:none;user-select:none">
        <div id="mBoxR" data-cb="1" style="position:absolute;left:${r[0] * k}px;top:${r[1] * k}px;width:${(r[2] - r[0]) * k}px;height:${(r[3] - r[1]) * k}px;border:2px solid #06BC51;box-shadow:0 0 0 9999px rgba(0,0,0,.2);touch-action:none;cursor:move">
          ${[[0, 0], [1, 0], [1, 1], [0, 1]].map(([cx, cy], j) => `<div data-cc="${j}" style="position:absolute;${cx ? 'right' : 'left'}:-22px;${cy ? 'bottom' : 'top'}:-22px;width:44px;height:44px;touch-action:none;display:flex;align-items:center;justify-content:center"><i style="width:20px;height:20px;border-radius:50%;background:#fff;border:3px solid #06BC51;box-shadow:0 1px 4px rgba(0,0,0,.3)"></i></div>`).join('')}
        </div></div></div>
      <div class="bar">${area ? '<button class="btn fb line" data-m="retake">다시 찍기</button><button class="btn fb" data-m="areaGo">이 옷 재기</button>' : '<button class="btn fb line" data-m="capBack">다시 선택</button><button class="btn fb" data-m="capCut">선택 부분 읽기</button>'}</div>`;
  } else if (st.scr === 'capScan') {
    h = `${modBar('캡처 읽는 중')}<div class="body" style="top:99px;bottom:0"><div style="margin:8px 16px 0;border-radius:12px;overflow:hidden;background:var(--bg-subtle);height:300px;position:relative"><img src="${st.photoURL}" style="width:100%;height:100%;object-fit:contain;opacity:.6"><div class="spin" style="position:absolute;left:50%;top:50%;margin:-18px 0 0 -18px"></div></div><div class="pad" style="margin-top:16px;font-size:15px;font-weight:700">캡처에서 상품을 찾는 중이에요</div><div class="pad" style="font-size:13px;color:var(--sub);margin-top:4px">상품명·사이즈 글자를 읽고 있어요. 처음 한 번은 글자 인식 파일을 받느라 조금 걸려요</div></div>`;
  } else if (st.scr === 'capList') {
    h = `${modBar('어떤 옷을 등록할까요?')}<div class="body" style="top:99px;bottom:92px"><div class="p" style="padding-top:0">캡처에서 상품 ${st.prods.length}개를 찾았어요. 등록할 옷을 눌러 주세요</div>
      <div class="pad" style="display:grid;gap:10px;margin-top:6px">${st.prods.map((q, i) => `<button data-m="capProd" data-x="${i}" style="display:flex;gap:12px;align-items:center;text-align:left;border:1px solid var(--line-ds);border-radius:12px;padding:10px"><img src="${q.thumbURL}" style="width:64px;height:78px;object-fit:cover;border-radius:8px;background:var(--bg-subtle);flex:none"><span style="min-width:0;flex:1"><span style="display:block;font-size:12.5px;color:var(--sub)">${esc(q.brand || '')}</span><span style="display:block;font-size:14.5px;line-height:1.35;font-weight:600">${esc(q.name)}</span><span style="display:block;font-size:12.5px;color:var(--ink2);margin-top:3px">${q.size ? '사이즈 ' + esc(q.size) : '사이즈 못 읽음'}${q.price ? ' · ' + esc(q.price) : ''}</span></span></button>`).join('')}</div>
      <div style="text-align:center;margin:14px 0 20px"><button data-m="capManual" style="font-size:13px;color:var(--ink2);text-decoration:underline">찾은 목록에 없으면 직접 상자로 고르기</button></div></div>
      <div class="bar"><button class="btn line" data-m="capBack">다른 캡처</button></div>`;
  } else if (st.scr === 'capBusy') {
    const steps = ['상품 사진 오려내기', '상품명 · 사이즈 글자 읽기', '무신사에서 같은 상품 찾기'];
    h = `${modBar('캡처 읽는 중')}<div class="body" style="top:99px;bottom:0"><div class="fsteps">${steps.map((t, i) => `<div class="fstep ${i < st.capStep ? 'done' : i === st.capStep ? 'on' : ''}"><span>${i < st.capStep ? '✓' : i + 1}</span>${t}</div>`).join('')}<div class="fdemo" style="margin-top:20px">처음 한 번은 글자 인식 파일을 받느라 조금 걸려요</div></div></div>`;
  } else if (st.scr === 'capResult') {
    const cp = st.cap, sizes0 = st.cat === 'bottom' ? ['26', '28', '29', '30', '31', '32', '34'] : ['XS', 'S', 'M', 'L', 'XL', '2XL'], sizes = st.size && !sizes0.includes(st.size) ? sizes0.concat(st.size) : sizes0;
    h = `${modBar('잘라 낸 이미지')}<div class="body" style="top:99px;bottom:92px">
      ${cp.cut ? `<div style="display:flex;gap:10px;align-items:center;margin:4px 16px 0;padding:11px 14px;border-radius:10px;background:var(--fitw);font-size:13.5px"><span class="chipf">배경 지움</span><span>옷만 남기고 배경을 지웠어요</span></div>` : `<div style="margin:4px 16px 0;padding:11px 14px;border-radius:10px;background:#FFF6E0;font-size:13.5px;line-height:1.5"><b style="color:#9A6400">배경을 지우지 못했어요</b><br>${cp.reason ? cp.reason + '. ' : ''}자른 사진 그대로 쓸게요</div>`}
      <div style="display:flex;gap:10px;justify-content:center;margin-top:14px">
        ${cp.cut ? `<button data-m="capUse" data-x="cut" style="width:160px;border-radius:12px;padding:6px;${st.useCut ? 'border:1px solid var(--primary);background:var(--primary-subtle)' : 'border:1px solid var(--line-ds)'}"><div style="height:180px;border-radius:8px;background:repeating-conic-gradient(#F1F0EE 0 25%,#FAFAF9 0 50%) 0 0/16px 16px;display:flex;align-items:center;justify-content:center"><img src="${cp.cut}" style="max-width:100%;max-height:100%"></div><div style="font-size:12.5px;font-weight:600;margin-top:6px">배경 지운 이미지</div></button>` : ''}
        <button data-m="capUse" data-x="rect" style="width:160px;border-radius:12px;padding:6px;${!st.useCut ? 'border:1px solid var(--primary);background:var(--primary-subtle)' : 'border:1px solid var(--line-ds)'}"><div style="height:180px;border-radius:8px;background:var(--bg-subtle);display:flex;align-items:center;justify-content:center"><img src="${cp.rect}" style="max-width:100%;max-height:100%"></div><div style="font-size:12.5px;font-weight:600;margin-top:6px">자른 그대로</div></button></div>
      ${st.cands && st.cands.length ? `<div class="pad" style="margin-top:18px"><div style="font-size:15px;font-weight:800">이 중에 산 상품이 있나요?</div><div style="font-size:12.5px;color:var(--sub);margin-top:2px">누르면 무신사 판매처 실측을 가져와요</div><div style="display:grid;gap:8px;margin-top:10px">${st.cands.map((c, i) => `<button data-m="capCand" data-x="${i}" style="display:flex;gap:10px;align-items:center;text-align:left;border:1px solid var(--line-ds);border-radius:10px;padding:8px"><img src="/api/img?url=${encodeURIComponent(c.image)}" style="width:52px;height:62px;object-fit:cover;border-radius:6px;background:var(--bg-subtle);flex:none"><span style="min-width:0"><span style="display:block;font-size:12px;color:var(--sub)">${esc(c.brand || '')}</span><span style="display:block;font-size:14px;line-height:1.35">${esc(c.name)}</span></span></button>`).join('')}</div></div>` : ''}
      <div class="pad" style="margin-top:18px"><div style="font-size:14px;font-weight:700;margin-bottom:8px">옷 이름 ${typeof API !== 'undefined' && API.on ? '<span style="font-weight:400;color:var(--sub);font-size:12.5px">틀렸으면 고치고 다시 찾기</span>' : ''}</div><div style="display:flex;gap:6px"><input class="tin" id="mName" value="${esc(st.name || '')}" placeholder="예: 카펜터 데님 팬츠" style="flex:1;min-width:0">${typeof API !== 'undefined' && API.on ? '<button data-m="capRefind" style="flex:none;padding:0 14px;border-radius:8px;background:var(--primary);color:var(--on-primary);font-size:13.5px;font-weight:700">다시 찾기</button>' : ''}</div>
        <div style="font-size:14px;font-weight:700;margin:14px 0 8px">산 사이즈</div><div style="display:flex;gap:6px;flex-wrap:wrap">${sizes.map((s2) => `<button data-m="size" data-x="${s2}" style="height:36px;min-width:46px;padding:0 12px;border-radius:18px;font-size:14px;${st.size === s2 ? 'background:var(--primary);color:var(--on-primary);font-weight:700' : 'border:1px solid var(--line-ds)'}">${s2}</button>`).join('')}</div></div>
      <div class="p" style="font-size:12.5px;color:var(--sub);padding-bottom:20px">${st.ocr && st.ocr.fail ? '캡처 글자를 읽지 못했어요. 이름과 사이즈를 직접 넣어 주세요. ' : st.ocr ? '캡처에서 읽은 이름과 사이즈를 넣어 두었어요. ' : ''}${st.found === 'none' ? (st.cands && st.cands.length ? '위 후보에 없으면, 다음 화면에서 실측을 채워 주세요' : '무신사에서 찾지 못했어요. 오프라인이나 다른 쇼핑몰에서 산 옷이면 다음 화면에서 실측을 채워 주세요') : '다음 화면에서 실측을 채워요'}</div></div>
      <div class="bar"><button class="btn" data-m="capNext">다음: 실측 채우기</button></div>`;
  } else if (st.scr === 'roi') {
    const ph = st.res.photo, k = Math.min(358 / ph.w, 470 / ph.h), W = ph.w * k, H = ph.h * k, r = st.roi;
    const cs = [[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]];
    h = `${modBar('옷 영역 자르기')}<div class="body" style="top:99px;bottom:92px"><div class="p" style="padding-top:0">옷 한 벌만 상자 안에 들어오게 모서리를 끌어 주세요. 상자 밖은 분석하지 않아요</div>
      <div style="display:flex;justify-content:center;margin-top:10px"><svg id="mSvg" viewBox="0 0 ${ph.w} ${ph.h}" style="width:${W}px;height:${H}px;touch-action:none;border-radius:8px;background:#000"><image href="${st.photoURL}" width="${ph.w}" height="${ph.h}"/>
        <path id="mR" d="M0 0H${ph.w}V${ph.h}H0Z M${r[0]} ${r[1]}V${r[3]}H${r[2]}V${r[1]}Z" fill="rgba(0,0,0,.45)" fill-rule="evenodd"/>
        <rect id="mRr" x="${r[0]}" y="${r[1]}" width="${r[2] - r[0]}" height="${r[3] - r[1]}" fill="none" stroke="#F08C00" stroke-width="${2.5 / k}"/>
        ${cs.map((p, j) => `<circle data-h="r|${j}" cx="${p[0]}" cy="${p[1]}" r="${16 / k}" fill="rgba(240,140,0,.3)" stroke="#fff" stroke-width="${2.5 / k}"/>`).join('')}</svg></div></div>
      <div class="bar"><button class="btn line" style="flex:.6" data-m="back">취소</button><button class="btn" data-m="roiRun">이 영역에서 다시 분석</button></div>`;
  } else if (st.scr === 'crotch') {
    const r = st.res, c = r.cut, cp = st.cpt, c0 = st.cview || (st.cview = [cp[0], cp[1]]), ww = c.w * 0.62, hh = Math.min(c.h, ww * 1.35), vx = Math.max(0, Math.min(c.w - ww, c0[0] - ww / 2)), vy = Math.max(0, Math.min(c.h - hh, c0[1] - hh * 0.62)), W = 358, H = W * hh / ww, k = W / ww;
    h = `${modBar('가랑이 위치 찍기')}<div class="body" style="top:99px;bottom:92px"><div class="p" style="padding-top:0"><b style="font-size:17px">가랑이를 눌러 주세요</b><br>두 다리 안쪽 솔기가 만나는 곳이에요. 이 한 번으로 밑위·인심이 정확해져요</div>
      <div style="display:flex;justify-content:center;margin-top:8px"><svg id="mSvg" viewBox="${vx} ${vy} ${ww} ${hh}" style="width:${W}px;height:${H}px;touch-action:none;border-radius:10px;background:repeating-conic-gradient(#F1F0EE 0 25%,#FAFAF9 0 50%) 0 0/20px 20px"><image href="${st.cutURL}" width="${c.w}" height="${c.h}"/>
        <line id="mCh" x1="${cp[0] - 26 / k}" y1="${cp[1]}" x2="${cp[0] + 26 / k}" y2="${cp[1]}" stroke="#F2382B" stroke-width="${1.5 / k}"/><line id="mCv" x1="${cp[0]}" y1="${cp[1] - 26 / k}" x2="${cp[0]}" y2="${cp[1] + 26 / k}" stroke="#F2382B" stroke-width="${1.5 / k}"/>
        <circle id="mCc" data-h="c|0" cx="${cp[0]}" cy="${cp[1]}" r="${16 / k}" fill="rgba(242,56,43,.18)" stroke="#fff" stroke-width="${2 / k}"/></svg></div>
</div>
      <div class="bar"><button class="btn" data-m="crotchOk">확인</button></div>`;
  } else if (st.scr === 'result') {
    const r = st.res, c = r.cut, k = Math.min(358 / c.w, 400 / c.h), W = c.w * k, H = c.h * k, view = st.view || 'cut';
    const msgs = r.messages.filter((t) => !/가랑이/.test(t));
    const banner = r.status === 'ok' || (!msgs.length && !r.suggest) ? `<div style="display:flex;gap:10px;align-items:center;margin:4px 16px 0;padding:11px 14px;border-radius:10px;background:var(--fitw);font-size:13.5px"><span class="chipf" style="flex:none">${r.trust ? (r.trust.level === 'high' ? '신뢰도 높음' : r.trust.level === 'mid' ? '신뢰도 보통' : '신뢰도 낮음') : '자동 측정'}</span><span>${r.trust ? `예상 오차 ±${r.trust.err}cm 안팎 · ${r.trust.why.join(' · ')}` : 'A4 기준으로 원근을 보정하고 치수를 쟀어요'}</span></div>`
      : `<div style="margin:4px 16px 0;padding:11px 14px;border-radius:10px;background:#FFF6E0;font-size:13.5px;line-height:1.55"><b style="color:#9A6400">확인이 필요해요</b><br>${msgs.map((t) => '· ' + t).join('<br>')}<br><span style="color:var(--ink2)">점을 끌어서 맞추거나 숫자를 직접 고쳐 주세요</span>${r.suggest ? `<button class="btn" style="height:42px;font-size:14px;margin-top:10px" data-m="recat" data-x="${r.suggest}">${r.suggest === 'bottom' ? '하의' : '상의'}로 다시 재기</button>` : ''}</div>`;
    const needC = r.crotch && !r.crotch.sure && !r.crotchManual;
    const crotchCard = false ? `<div style="margin:10px 16px 0;padding:13px 14px;border-radius:12px;border:1.5px solid var(--fit);background:var(--fitw)"><div style="font-size:15px;font-weight:800">가랑이 위치를 한 번 찍어 주세요</div><div style="font-size:13px;color:var(--ink2);line-height:1.55;margin-top:4px">두 다리가 붙어 있으면 사진만으로는 가랑이를 정확히 찾기 어려워요. 한 번 찍으면 밑위·허벅지·인심이 1cm 안쪽으로 맞아요</div><div style="display:flex;gap:8px;margin-top:10px"><button class="btn" style="height:42px;font-size:14px" data-m="crotch">가랑이 찍기</button><button class="btn line" style="height:42px;font-size:14px;flex:.7" data-m="retake">다리 벌려 다시 찍기</button></div></div>` : r.crotchManual ? `<div style="margin:10px 16px 0;padding:10px 14px;border-radius:10px;background:var(--gray);font-size:13px;color:var(--ink2)">찍어 준 가랑이 위치로 밑위·허벅지·인심을 쟀어요 <button data-m="crotch" style="color:var(--fit);font-weight:700;font-size:13px;margin-left:4px">다시 찍기</button></div>` : '';
    const sizes = st.cat === 'bottom' ? ['26', '28', '29', '30', '31', '32', '34'] : ['XS', 'S', 'M', 'L', 'XL', '2XL'];
    const col = (i) => MCOL[i % MCOL.length];
    const row = (m, i) => `<div class="frow" data-m="sel" data-x="${i}"><span style="flex:1;min-width:0"><b>${m.custom ? m.key : LONG[m.key] || m.key + ' 단면'}</b>${m.flag ? `<span class="${m.flag === 'guess' ? 'chipg' : 'chipr'}" style="margin-left:6px">${m.flag === 'guess' ? '추정' : m.flag === 'missing' ? '못 찾음' : '확인 필요'}</span>` : m.manual ? '<span class="chipg" style="margin-left:6px">직접 입력</span>' : ''}<small>${m.help}</small></span><span class="fcm"><input id="mi${i}" data-in="mcm" data-x="${i}" inputmode="decimal" value="${m.cm ?? ''}"><span>cm</span></span></div>`;
    const ph = r.photo, kp = Math.min(358 / ph.w, 400 / ph.h);
    const stage = view === 'orig'
      ? `<svg viewBox="0 0 ${ph.w} ${ph.h}" style="width:${ph.w * kp}px;height:${ph.h * kp}px;border-radius:10px;background:#000"><image href="${st.photoURL}" width="${ph.w}" height="${ph.h}"/><polygon points="${r.a4.quad.map((p) => p.join(',')).join(' ')}" fill="rgba(20,180,90,.2)" stroke="#14B45A" stroke-width="${3 / kp}"/>${r.a4.quad.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="${5 / kp}" fill="#14B45A" stroke="#fff" stroke-width="${1.5 / kp}"/>`).join('')}<text x="${r.a4.quad[0][0]}" y="${r.a4.quad[0][1] - 10 / kp}" font-size="${13 / kp}" font-weight="800" fill="#14B45A" stroke="#fff" stroke-width="${4 / kp}" paint-order="stroke" font-family="Pretendard">A4 ${r.a4.manual ? '직접 지정' : '인식 ' + Math.round(r.a4.conf * 100) + '%'}</text></svg>`
      : `<svg id="mSvg" viewBox="0 0 ${c.w} ${c.h}" style="width:${W}px;height:${H}px;touch-action:none;border-radius:10px;background:repeating-conic-gradient(#F1F0EE 0 25%,#FAFAF9 0 50%) 0 0/20px 20px"><image href="${st.cutURL}" width="${c.w}" height="${c.h}"/>
        ${r.measures.map((m, i) => m.p ? `<g id="mg${i}" opacity="${st.sel == null || st.sel === i ? 1 : .3}" ${m.extra && !m.custom && st.sel !== i ? 'display="none"' : ''}><line id="ml${i}" x1="${m.p[0][0]}" y1="${m.p[0][1]}" x2="${m.p[1][0]}" y2="${m.p[1][1]}" stroke="${col(i)}" stroke-width="${3 / k}" stroke-linecap="round"/>
          <text id="mt${i}" x="${labPos(m, k)[0]}" y="${labPos(m, k)[1]}" font-size="${13 / k}" font-weight="800" fill="${col(i)}" stroke="#fff" stroke-width="${4 / k}" paint-order="stroke" text-anchor="${labPos(m, k)[2]}" font-family="Pretendard">${m.custom ? '두 점' : m.key} ${m.cm}</text>
          ${m.p.map((p, j) => `<circle id="mh${i}_${j}" data-h="${i}|${j}" cx="${p[0]}" cy="${p[1]}" r="${13 / k}" fill="${col(i)}" fill-opacity=".22" stroke="#fff" stroke-width="${2 / k}"/><circle id="md${i}_${j}" cx="${p[0]}" cy="${p[1]}" r="${4.5 / k}" fill="${col(i)}" stroke="#fff" stroke-width="${1.5 / k}" pointer-events="none"/>`).join('')}</g>` : '').join('')}
      </svg>`;
    const core = r.measures.map((m, i) => [m, i]).filter(([m]) => !m.extra), extra = r.measures.map((m, i) => [m, i]).filter(([m]) => m.extra);
    h = `${modBar('치수 확인')}<div class="body" style="top:99px;bottom:92px">${banner}${crotchCard}
      <div class="fstage"><div style="display:flex;justify-content:center">${stage}</div><p>${view === 'orig' ? '초록 테두리가 기준으로 쓴 A4예요.' : '선 끝의 점을 끌면 위치를 고칠 수 있어요.'}</p></div>
      <div class="ftools ${st.tools ? 'open' : ''}"><button data-m="tools" aria-expanded="${!!st.tools}"><span>측정이 이상해요</span>${I.down}</button>${st.tools ? `<div>${[['fixa4', 'A4 위치 변경'], ['roi', '옷 다시 고르기'], ['view', view === 'orig' ? '측정선 보기' : '원본 사진 보기']].map(([k2, t]) => `<button data-m="${k2}" ${k2 === 'view' ? `data-x="${view === 'orig' ? 'cut' : 'orig'}"` : ''}>${t}</button>`).join('')}</div>` : ''}</div>
      <div class="frows">${core.map(([m, i]) => row(m, i)).join('')}</div><div class="pd-gap"></div>
      <div class="pad" style="padding-top:20px"><div class="flabel">옷 이름</div><input class="tin fin" id="mName" value="${st.name || ''}" placeholder="촬영한 의류의 이름을 작성해주세요.">
        <div class="flabel" style="margin-top:20px">라벨 사이즈</div><div class="fsizes">${sizes.concat(st.cat === 'bottom' ? [] : ['3XL']).map((s2) => `<button data-m="size" data-x="${s2}" class="${st.size === s2 ? 'on' : ''}">${s2}</button>`).join('')}</div></div>
      <div style="height:24px"></div></div>
      <div class="bar"><button class="btn fb line" data-m="retake">다시 찍기</button><button class="btn fb" data-m="save">등록</button></div>`;
  }
  const NODE = { guide: '④ 옷 등록 · 사진 촬영 안내 (옷은 펴서, A4는 옆 바닥에)', live: '④ 옷 등록 · 가이드 카메라 (배율 · 수평)', busy: '④ 옷 등록 · 자동 분석 (A4 → 원근 보정 → 옷 분리 → 치수)', fail: '④ 옷 등록 · A4나 옷을 못 찾음 → 재촬영 · 수동 보정', fixa4: '④ 옷 등록 · A4 모서리 직접 맞추기', capPick: '④ 옷 등록 · 구매내역 캡처 고르기', capCrop: '④ 옷 등록 · 캡처에서 옷 한 벌만 자르기', capResult: '④ 옷 등록 · 배경 지운 상품 이미지 확인', roi: '④ 옷 등록 · 옷 영역 직접 지정', area: '④ 옷 등록 · 찍은 사진에서 잴 옷 영역 고르기', capScan: '④ 옷 등록 · 캡처 전체 글자 읽기 → 상품 나누기', capList: '④ 옷 등록 · 캡처 속 상품 목록 → 하나 고르기', capBusy: '④ 옷 등록 · 캡처 읽기 (사진 오려내기 → 글자 읽기 → 무신사에서 같은 상품 찾기)', capResult2: '', crotch: '④ 옷 등록 · 바지 가랑이 위치 직접 찍기 → 밑위·허벅지·인심 다시 재기', result: '④ 옷 등록 · 결과 확인 · 수정 → 저장' }[st.scr];
  const nw = document.getElementById('now'); if (nw) nw.innerHTML = NODE.replace(' · ', '<small>') + '</small>';
  el.innerHTML = h + (st.scr === 'live' ? '' : '<div class="hi"></div>') + (MOD.toast ? `<div class="toast">${MOD.toast}</div>` : '');
  if (st.scr === 'live') camAttach();
}
function modKeepY(fn) { const b0 = modEl() && modEl().querySelector('.body'), y = b0 ? b0.scrollTop : 0; fn(); const b1 = modEl() && modEl().querySelector('.body'); if (b1) b1.scrollTop = y; }
function mToast(t) { MOD.toast = t; modKeepY(modRender); clearTimeout(mToast.h); mToast.h = setTimeout(() => { MOD.toast = null; const t = modEl() && modEl().querySelector('.toast'); if (t) t.remove(); }, 2400); }

// 찍기 전에 A4가 잡히는지 0.5초마다 확인해서 화면에 초록 테두리로 보여 줌
function camDetect() {
  clearTimeout(camDetect.h);
  const st = MOD.st, v = document.getElementById('mVid'); if (!st || st.scr !== 'live' || !v) return;
  if (v.videoWidth && window.NaranMeasure && NaranMeasure.detectA4) {
    const d = NaranMeasure.detectA4(v), box = true;
    if (box) {
      const bw = (st.vb || [300, 400])[0], bh = (st.vb || [300, 400])[1], vw = v.videoWidth, vh = v.videoHeight, sc = Math.min(bw / vw, bh / vh), ox = (bw - vw * sc) / 2, oy = (bh - vh * sc) / 2;
      st.det = d ? { ok: true, small: d.areaFrac < 0.012, pts: d.quad.map(([x, y]) => (x * vw * sc + ox).toFixed(1) + ',' + (y * vh * sc + oy).toFixed(1)).join(' ') } : { ok: false };
      const pg = document.getElementById('mDet'), t = document.getElementById('mDetT');
      if (pg) pg.setAttribute('points', st.det.ok ? st.det.pts : '');
      if (t) { const m = st.det.ok ? (st.det.small ? ['조금 더 가까이 찍어 주세요', '#FFB020'] : ['A4를 찾았어요 · 이대로 찍으면 돼요', '#2BD17E']) : ['A4 네 모서리가 다 보이게 놓아 주세요', '#FFFFFF']; t.textContent = m[0]; t.style.color = m[1]; }
    }
  }
  camDetect.h = setTimeout(camDetect, 450);
}
async function camOpen(st) {
  let saved = null; try { saved = localStorage.getItem('naranLens'); } catch (e) { }
  const base = { width: { ideal: 2560 }, height: { ideal: 1920 }, aspectRatio: { ideal: 4 / 3 } }, want = st.lensId || saved;
  const tryOpen = () => navigator.mediaDevices.getUserMedia({ video: want ? { ...base, deviceId: { exact: want } } : { ...base, facingMode: { ideal: 'environment' } }, audio: false })
    .catch(() => navigator.mediaDevices.getUserMedia({ video: { ...base, facingMode: { ideal: 'environment' } }, audio: false }));
  let stream; try { stream = await tryOpen(); } catch (e) { await new Promise((r) => setTimeout(r, 600)); stream = await tryOpen(); }
  st.stream = stream;
  try { // 후면 렌즈 목록 (갤럭시 등은 0.6배 초광각을 따로 열 수 있음)
    const all = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput');
    let backs = all.filter((d) => /back|rear|environment|후면/i.test(d.label)); if (!backs.length) backs = all.filter((d) => !/front|user|전면/i.test(d.label));
    st.lenses = backs.map((d) => d.deviceId); const cur = stream.getVideoTracks()[0].getSettings().deviceId; st.lensId = cur; st.lensIdx = Math.max(0, st.lenses.indexOf(cur));
  } catch (e) { st.lenses = []; }
  const tr = stream.getVideoTracks()[0], caps = tr.getCapabilities ? tr.getCapabilities() : {};
  st.zoomCap = caps.zoom ? { min: caps.zoom.min, max: Math.min(caps.zoom.max, 5) } : null;
  st.zoom = st.zoomCap ? st.zoomCap.min : 1; // 폰이 1배보다 넓은 배율을 주면 가장 넓게 시작
  if (st.zoomCap && st.zoomCap.min < 1) await tr.applyConstraints({ advanced: [{ zoom: st.zoomCap.min }] }).catch(() => { });
}
async function camAttach() {
  const st = MOD.st;
  try {
    if (!st.stream) {
      const first = !st.opening; if (first) st.opening = camOpen(st).finally(() => { st.opening = null; });
      await st.opening; if (MOD.st !== st || st.scr !== 'live') return;
      if (first && (st.zoomCap || (st.lenses && st.lenses.length > 1))) { modRender(); return; } // 렌즈·배율 버튼 그리기
      if (!first) return;
    }
    const v = document.getElementById('mVid'); if (!v) return;
    if (v.srcObject !== st.stream) { v.srcObject = st.stream; await v.play().catch(() => { }); }
    window.addEventListener('deviceorientation', onTilt);
    camDetect();
  } catch (e) { if (MOD.st !== st) return; camStop(); st.scr = 'guide'; modRender(); mToast('카메라를 열지 못했어요 · 앨범에서 고르기를 써 주세요'); }
}
// 분석 진행률: 단계별 구간 + 구간 안에서는 시간에 따라 천천히 차오름 (모델 받기는 실제 % 사용)
const BUSY = { a4: [0, .08], warp: [.08, .16], ai: [.16, .78], ai2: [.6, .8], seg: [.8, .9], measure: [.9, .99] };
function busyPct(st) {
  const r = BUSY[st.step] || [0, .05], ai = window.NaranMeasure && NaranMeasure.aiState;
  if (st.step === 'ai' && ai && ai.phase === 'download' && ai.pct < 1) return r[0] + (r[1] - r[0]) * 0.75 * ai.pct;
  const t = (performance.now() - (st.stepT || performance.now())) / 1000, k = st.step === 'ai' || st.step === 'ai2' ? 6 : 1.2;
  const base = st.step === 'ai' && st.aiFrom != null ? st.aiFrom : r[0];
  return base + (r[1] - base) * (1 - Math.exp(-t / k)) * 0.95;
}
function busyTick() { const st = MOD.st; if (!st || st.scr !== 'busy') return; const p = busyPct(st), b = document.getElementById('mGB'), t = document.getElementById('mGP'); if (b) b.style.width = (p * 100).toFixed(1) + '%'; if (t) t.textContent = Math.round(p * 100) + '%'; requestAnimationFrame(() => setTimeout(busyTick, 200)); }
const onAiProg = (a) => { const st = MOD.st; if (!st || st.scr !== 'busy' || st.step !== 'ai') return; if (a.phase === 'ready') { st.stepT = performance.now(); st.aiFrom = busyPct(st); } const now = performance.now(); if (now - (st.aiR || 0) > 400 || a.phase === 'ready') { st.aiR = now; modRender(); } };
async function runAnalyze(img, quad, roi) {
  const st = MOD.st; st.img = img; st.scr = 'busy'; st.step = 'a4'; st.stepT = performance.now(); setTimeout(busyTick, 200); if (window.NaranMeasure) NaranMeasure.onAi = onAiProg;
  if (!st.thumb) { const c = document.createElement('canvas'), k = Math.min(1, 700 / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height)); c.width = (img.naturalWidth || img.width) * k; c.height = (img.naturalHeight || img.height) * k; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); st.thumb = c.toDataURL('image/jpeg', 0.8); }
  modRender();
  const res = await NaranMeasure.analyze(img, { cat: st.cat === 'bottom' ? 'bottom' : 'top', auto: true, quad, roi, onStep: (s) => { st.step = s; st.stepT = performance.now(); st.aiFrom = null; modRender(); } });
  await new Promise((r) => setTimeout(r, 250));
  if (!MOD.st) return;
  st.res = res;
  const pc = res.photo.canvas, k = Math.min(1, 1000 / Math.max(pc.width, pc.height)), c2 = document.createElement('canvas'); c2.width = pc.width * k; c2.height = pc.height * k; c2.getContext('2d').drawImage(pc, 0, 0, c2.width, c2.height);
  st.photoURL = c2.toDataURL('image/jpeg', 0.85);
  if (res.status === 'fail-a4' || res.status === 'fail-garment') { st.scr = 'fail'; modRender(); return; }
  if (res.autoCat) { st.cat = res.cat; if (S.reg) S.reg.cat = st.cat; st.name = null; MOD.toast = st.cat === 'bottom' ? '바지로 보여서 바지로 쟀어요' : '상의로 보여서 상의로 쟀어요'; setTimeout(() => { MOD.toast = null; const t = modEl() && modEl().querySelector('.toast'); if (t) t.remove(); }, 2400); }
  st.cutURL = res.cut.canvas.toDataURL('image/png');
  st.name = st.name || { top: '촬영한 상의', bottom: '촬영한 하의', outer: '촬영한 아우터' }[st.cat];
  st.scr = 'result'; st.sel = null; st.view = 'cut'; st.tools = false;
  if (res.crotch && !res.crotch.sure) { MA.crotch(); return; }
  modRender();
}
function capLoaded(img, sample) {
  const st = MOD.st, w0 = img.naturalWidth || img.width, h0 = img.naturalHeight || img.height, k = Math.min(1, 1200 / Math.max(w0, h0));
  const c = document.createElement('canvas'); c.width = Math.round(w0 * k); c.height = Math.round(h0 * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  st.capImg = img; st.photoURL = c.toDataURL('image/jpeg', 0.9); st.res = { photo: { w: c.width, h: c.height } };
  const bh = Math.min(c.height * 0.45, c.width * 0.42); // 상품 한 줄 정도
  st.roi = [c.width * 0.02, c.height * 0.2, c.width * 0.98, c.height * 0.2 + bh];
  st.name = ''; st.size = null; st.ocr = null; st.found = null; st.cands = [];
  st.scr = 'capCrop'; modRender();
}
function areaStart(img) { // 찍은 사진 위에 네모를 띄워 잴 옷만 고르게
  const st = MOD.st, w0 = img.naturalWidth || img.videoWidth || img.width, h0 = img.naturalHeight || img.videoHeight || img.height, k = Math.min(1, 2000 / Math.max(w0, h0)), w = Math.round(w0 * k), h = Math.round(h0 * k);
  const kd = Math.min(1, 1200 / Math.max(w0, h0)), c = document.createElement('canvas'); c.width = Math.round(w0 * kd); c.height = Math.round(h0 * kd); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  st.img = img; st.photoURL = c.toDataURL('image/jpeg', 0.88); st.res = { photo: { w, h } };
  st.roi = [w * 0.01, h * 0.01, w * 0.99, h * 0.99]; st.scr = 'area'; modRender();
}
function loadFile(f) {
  if (!f) return;
  const url = URL.createObjectURL(f), img = new Image();
  img.onload = () => { MOD.st.thumb = null; areaStart(img); };
  img.onerror = () => mToast('사진을 열 수 없어요');
  img.src = url;
}
const MA = {
  gcat(c) { MOD.st.cat = c; if (S.reg) S.reg.cat = c; modRender(); },
  close() { modClose(); },
  native() { document.getElementById('mCam').click(); },
  album() { document.getElementById('mAlb').click(); },
  portrait() { MOD.st.forcePortrait = true; modRender(); },
  async orient(x) { MOD.st.forcePortrait = x === 'p'; await fullOn(x === 'p' ? 'portrait' : 'landscape'); modRender(); },
  async lens() {
    const st = MOD.st; if (!st.lenses || st.lenses.length < 2) return;
    const next = st.lenses[(st.lensIdx + 1) % st.lenses.length]; camStopOnly();
    st.lensId = next; st.lensIdx = (st.lensIdx + 1) % st.lenses.length; try { localStorage.setItem('naranLens', next); } catch (e) { }
    st.zoomCap = null; st.det = null; modRender();
  },
  async live() {
    try { if (window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) await DeviceOrientationEvent.requestPermission(); } catch (e) { }
    const st = MOD.st; st.scr = 'live'; modRender();
  },
  sample(x) { const [k, c] = x.split('|'); const st = MOD.st; if (c === 'bottom') st.cat = 'bottom'; else if (st.cat === 'bottom') st.cat = 'top'; if (S.reg) S.reg.cat = st.cat; const img = new Image(); img.onload = () => { MOD.st.thumb = null; runAnalyze(img); }; img.src = SAMPLE[k]; },
  shoot() {
    const st = MOD.st, v = document.getElementById('mVid'); if (!v || !v.videoWidth) return;
    const sw = v.videoWidth, sh = v.videoHeight, c = document.createElement('canvas'); c.width = sw; c.height = sh;
    c.getContext('2d').drawImage(v, 0, 0);
    camStop(); st.thumb = null; areaStart(c);
  },
  retake() { const st = MOD.st; st.res = null; st.thumb = null; st.scr = 'guide'; modRender(); },
  fixa4() {
    const st = MOD.st, ph = st.res.photo;
    st.quad = st.res.a4 ? st.res.a4.quad.map((p) => p.slice()) : [[ph.w * 0.62, ph.h * 0.4], [ph.w * 0.82, ph.h * 0.4], [ph.w * 0.82, ph.h * 0.66], [ph.w * 0.62, ph.h * 0.66]];
    st.scr = 'fixa4'; modRender();
  },
  capAlbum() { document.getElementById('mCap').click(); },
  capSample() { const img = new Image(); img.onload = () => capLoaded(img, true); img.src = SAMPLE.cap; },
  capBack() { MOD.st.scr = 'capPick'; modRender(); },
  async capCut() {
    const st = MOD.st, r = st.roi, x0 = Math.max(0, Math.min(r[0], r[2])), y0 = Math.max(0, Math.min(r[1], r[3])), x1 = Math.min(st.res.photo.w, Math.max(r[0], r[2])), y1 = Math.min(st.res.photo.h, Math.max(r[1], r[3]));
    if (x1 - x0 < 30 || y1 - y0 < 30) { mToast('상자를 조금 더 크게 잡아 주세요'); return; }
    const src = st.capImg, sw = src.naturalWidth || src.width, f = sw / st.res.photo.w;
    const crop = (sx, sy, sw2, sh2, maxPx) => { const c = document.createElement('canvas'), k = Math.min(maxPx / Math.max(sw2, sh2), 2); c.width = Math.round(sw2 * k); c.height = Math.round(sh2 * k); c.getContext('2d').drawImage(src, sx, sy, sw2, sh2, 0, 0, c.width, c.height); return c; };
    const full = crop(x0 * f, y0 * f, (x1 - x0) * f, (y1 - y0) * f, 1400);
    st.scr = 'capBusy'; st.capStep = 0; modRender(); await new Promise((ok) => setTimeout(ok, 30));
    // 상품 사진: 상자 안에서 꽉 찬 사진 네모를 찾아 그 사진에서만 옷을 오려냄
    const pb = NaranMeasure.findPhoto(full);
    let rectC = full, textC = full;
    if (pb) {
      const [px0, py0, px1, py1] = pb, m = 2; rectC = document.createElement('canvas'); rectC.width = Math.max(1, Math.round(px1 - px0 + 2 * m)); rectC.height = Math.max(1, Math.round(py1 - py0 + 2 * m)); rectC.getContext('2d').drawImage(full, px0 - m, py0 - m, rectC.width, rectC.height, 0, 0, rectC.width, rectC.height);
      // 글자는 사진 오른쪽만 (사진 무늬를 글자로 읽지 않게). 사진이 오른쪽에 있으면 왼쪽만
      const right = full.width - px1 > px0; textC = document.createElement('canvas'); const tx0 = right ? Math.round(px1 + 4) : 0, tx1 = right ? full.width : Math.round(px0 - 4); textC.width = Math.max(1, tx1 - tx0); textC.height = full.height; textC.getContext('2d').drawImage(full, tx0, 0, textC.width, full.height, 0, 0, textC.width, full.height);
    }
    // 배경만 지우기 (모델이 입은 사진이면 사람은 그대로 둠) · AI는 글자 읽기와 동시에 돌림
    st.cap = { rect: rectC.toDataURL('image/jpeg', 0.9), cut: null }; st.useCut = false;
    const bgP = capBg(rectC).then((u) => { if (u && st.cap) { st.cap.cut = u; st.useCut = true; } });
    // 글자 읽기 (휴대폰 안에서, 무료 글자 인식)
    st.capStep = 1; modRender();
    let info = null; try { const r = await ocrRace(ocrLines(textC)); st.ocrRaw = r.lines.map((l) => l.t); const texts = r.lines.map((l) => l.t).filter((t) => !PRICE.test(t)), pb = parseBlock(texts); if (pb.name && !pb.size) { const ol = r.lines.find((l) => /\/|개|옵션|사이즈/.test(l.t) && !PRICE.test(l.t)); if (ol) pb.size = await ocrRace(sizeRetry(r.pc, ol)).catch(() => null); } info = pb.name ? { name: pb.name, brand: pb.brand, size: pb.size, opt: pb.opt, color:pb.color } : parseOrder(r.text); } catch (e) { info = null; }
    if (!MOD.st) return;
    st.ocr = info ? info : { fail: true };
    if (info) { if (info.name) st.name = info.name; if (info.size) st.size = info.size; st.brand = info.brand || ''; st.opt = info.opt || ''; st.color = info.color || ''; st.cat = catGuess(info.name) || st.cat; }
    await bgP;
    if (info && info.name) { const done = await capFind(info.name, info.brand || ''); if (done) return; }
    st.scr = 'capResult'; modRender();
  },
  async capProd(i) {
    const st = MOD.st, q = st.prods[+i]; if (!q) return;
    st.scr = 'capBusy'; st.capStep = 0; modRender(); await new Promise((ok) => setTimeout(ok, 30));
    let cut = NaranMeasure.cutProduct(q.thumb), rectC = q.thumb;
    if (cut.ok && cut.box) { const [bx0, by0, bx1, by1] = cut.box; if ((bx1 - bx0) * (by1 - by0) < q.thumb.width * q.thumb.height * 0.8) { const c2 = document.createElement('canvas'), m = 3; c2.width = Math.max(1, bx1 - bx0 + 2 * m); c2.height = Math.max(1, by1 - by0 + 2 * m); c2.getContext('2d').drawImage(q.thumb, bx0 - m, by0 - m, c2.width, c2.height, 0, 0, c2.width, c2.height); rectC = c2; const k2 = NaranMeasure.cutProduct(c2); cut = k2.ok ? k2 : { ok: false, reason: '상품 사진 배경을 지우지 못했어요' }; } }
    st.cap = { rect: rectC.toDataURL('image/jpeg', 0.88), cut: cut.ok ? cut.canvas.toDataURL('image/png') : null, reason: cut.reason }; st.useCut = !!cut.ok;
    st.name = q.name; st.size = q.size; st.brand = q.brand; st.cat = q.cat || st.cat; st.ocr = q; st.cands = []; st.found = null;
    const done = await capFind(q.name, q.brand || ''); if (done || !MOD.st) return;
    st.scr = 'capResult'; modRender();
  },
  capManual() { MOD.st.scr = 'capCrop'; modRender(); },
  async capCand(i) {
    const st = MOD.st, c = st.cands[+i]; if (!c) return; st.name = document.getElementById('mName').value; st.scr = 'capBusy'; st.capStep = 2; modRender();
    const j = await fetch('/api/product?url=' + encodeURIComponent(c.url)).then((x) => x.json()).catch(() => null);
    if (!MOD.st) return;
    if (j && j.ok && j.table) { capGo(j); return; }
    st.scr = 'capResult'; modRender(); mToast(j && j.ok ? '이 상품은 판매처 실측표가 없어요' : '상품 정보를 가져오지 못했어요');
  },
  async capRefind() {
    const st = MOD.st, n = document.getElementById('mName').value.trim(); if (n.length < 2) { mToast('상품명을 넣어 주세요'); return; }
    st.name = n; const done = await capFind(n, st.brand || ''); if (done || !MOD.st) return;
    st.scr = 'capResult'; modRender(); if (!st.cands || !st.cands.length) mToast('무신사에서 찾지 못했어요');
  },
  capUse(x) { const st = MOD.st; st.name = document.getElementById('mName').value; st.useCut = x === 'cut'; modRender(); },
  capNext() {
    const st = MOD.st, name = document.getElementById('mName').value.trim(), cat = st.cat;
    const img = st.useCut && st.cap.cut ? st.cap.cut : st.cap.rect;
    modClose();
    Object.assign(S.reg, { cat, img, name, size: st.size || null, m: null, src: '구매내역 캡처', note: st.useCut ? '배경 지운 상품 이미지 · 실측을 채워 주세요' : '캡처 이미지 · 실측을 채워 주세요', noteOk: !!st.useCut, ask: true });
    go('regMeasure');
  },
  recat(c) { const st = MOD.st; st.cat = c; if (S.reg) S.reg.cat = c; st.name = null; runAnalyze(st.img, st.res && st.res.a4 && st.res.a4.manual ? st.res.a4.quad : undefined); },
  view(v) { MOD.st.view = v; modRender(); },
  back() { MOD.st.scr = MOD.st.res && MOD.st.res.cut ? 'result' : 'fail'; modRender(); },
  crotch() { const st = MOD.st; st.cview = null; st.cpt = (st.res.crotch && st.res.crotch.p || [st.res.cut.w / 2, st.res.cut.h * 0.3]).slice(); st.scr = 'crotch'; modRender(); },
  crotchOk() { const st = MOD.st; NaranMeasure.setCrotch(st.res, st.cpt); st.scr = 'result'; st.sel = null; modRender(); },
  tools() { MOD.st.tools = !MOD.st.tools; modKeepY(modRender); },
  roi() { const st = MOD.st, ph = st.res.photo; st.roi = st.roi || [ph.w * 0.04, ph.h * 0.08, ph.w * 0.72, ph.h * 0.92]; st.scr = 'roi'; modRender(); },
  areaGo() { const st = MOD.st, r = st.roi; st.thumb = null; runAnalyze(st.img, undefined, [Math.min(r[0], r[2]), Math.min(r[1], r[3]), Math.max(r[0], r[2]), Math.max(r[1], r[3])]); },
  roiRun() { const st = MOD.st, r = st.roi; runAnalyze(st.img, st.res && st.res.a4 && st.res.a4.manual ? st.res.a4.quad : undefined, [Math.min(r[0], r[2]), Math.min(r[1], r[3]), Math.max(r[0], r[2]), Math.max(r[1], r[3])]); },
  two() {
    const st = MOD.st, c = st.res.cut, n = st.res.measures.filter((m) => m.custom).length + 1;
    const m = { key: '두 점 측정 ' + n, help: '직접 고른 두 점 사이 거리', p: [[c.w * 0.3, c.h * 0.55], [c.w * 0.7, c.h * 0.55]], extra: true, custom: true };
    m.cm = Math.round(Math.hypot(m.p[0][0] - m.p[1][0], m.p[0][1] - m.p[1][1]) / c.pxPerCm * 10) / 10;
    st.res.measures.push(m); st.sel = st.res.measures.length - 1; st.view = 'cut'; modRender(); mToast('두 점을 원하는 곳으로 끌어 주세요');
  },
  rerun() { const st = MOD.st; st.thumb = st.thumb; runAnalyze(st.img, st.quad.map((p) => p.slice())); },
  manual() { const st = MOD.st, cat = st.cat; modClose(); Object.assign(S.reg, { cat, img: null, name: '', size: null, m: null, src: '직접 입력', note: '사진에서 옷을 못 찾아 직접 입력' }); go('regMeasure'); },
  sel(i) { const st = MOD.st; st.sel = st.sel === +i ? null : +i; st.view = 'cut'; const y = modEl().querySelector('.body').scrollTop; modRender(); modEl().querySelector('.body').scrollTop = y; },
  size(s) { const st = MOD.st; st.name = document.getElementById('mName').value; st.size = s; const y = modEl().querySelector('.body').scrollTop; modRender(); modEl().querySelector('.body').scrollTop = y; },
  save() {
    const st = MOD.st, r = st.res; st.name = document.getElementById('mName').value.trim() || st.name;
    const pk = (st.merge && S.reg && S.reg.pk) || st.cat, parts = PARTS[pk], m = parts.map((p) => { const x = r.measures.find((q) => q.key === p); return x && x.cm ? x.cm : 0; });
    if (NEED[pk].some((k) => !m[parts.indexOf(k)])) { mToast(`${NEED[pk].map((k) => LONG[k] || k).join(' · ')}은 꼭 재 주세요`); return; }
    const c = r.cut.canvas, k = Math.min(1, 640 / Math.max(c.width, c.height)), t = document.createElement('canvas'); t.width = c.width * k; t.height = c.height * k; t.getContext('2d').drawImage(c, 0, 0, t.width, t.height);
    const extra = {}; r.measures.filter((q) => q.extra && q.cm).forEach((q) => { extra[q.key] = q.cm; });
    const it = item({ img: t.toDataURL('image/png'), name: st.name, cat: st.cat, g: true, size: st.size || '', m, extra, src: '사진 촬영(A4 자동 측정)' });
    if (st.merge) { modClose(); S.reg.m = m; S.reg.extra = extra; S.reg.tbl = null; S.reg.est = null; S.reg.hood = !!r.hood; S.reg.note = '사진으로 잰 실측 (A4 기준)'; S.reg.noteOk = true; if (!S.reg.img) S.reg.img = it.img; if (!S.reg.size) S.reg.size = st.size; replace('regMeasure'); toast('사진으로 잰 실측을 채웠어요'); return; }
    modClose(); S.reg = Object.assign(S.reg || {}, { cat: st.cat }); toMeasure({ cat: st.cat, img: it.img, capImg: true, name: st.name, size: st.size || null, sizeList: null, m, extra, hood: !!r.hood, src: '사진 촬영(A4 자동 측정)', note: '사진으로 잰 실측 (A4 기준)', noteOk: true });
  },
};
document.getElementById('app').addEventListener('click', (e) => { if (!MOD.st || e.target.tagName === 'INPUT') return; const el = e.target.closest('[data-m]'); if (!el || !modEl().contains(el)) return; const f = MA[el.dataset.m]; if (f) f(el.dataset.x); });
document.getElementById('app').addEventListener('change', (e) => { if (!MOD.st) return; if (e.target.id === 'mCam' || e.target.id === 'mAlb') loadFile(e.target.files[0]); if (e.target.id === 'mCap' && e.target.files[0]) { const im = new Image(); im.onload = () => capLoaded(im, false); im.onerror = () => mToast('사진을 열 수 없어요'); im.src = URL.createObjectURL(e.target.files[0]); } if (e.target.dataset.in === 'mcm') { const i = +e.target.dataset.x, m = MOD.st.res.measures[i], v = parseFloat(e.target.value); if (v > 0) { m.cm = Math.round(v * 10) / 10; m.manual = true; m.flag = null; const t = document.getElementById('mt' + i); if (t) t.textContent = m.key + ' ' + m.cm; } } });
document.getElementById('app').addEventListener('input', (e) => { if (!MOD.st || e.target.id !== 'mZoom') return; const st = MOD.st, z = parseFloat(e.target.value); st.zoom = z; document.getElementById('mZoomV').textContent = z.toFixed(1) + '×'; if (st.zoomCap && st.stream) st.stream.getVideoTracks()[0].applyConstraints({ advanced: [{ zoom: z }] }).catch(() => { }); });
/* 캡처 상자 끌기 */
let cDrag = null;
function cropApply() { const st = MOD.st, k = st.cropK, r = st.roi, el = document.getElementById('mBoxR'); if (!el) return; el.style.left = r[0] * k + 'px'; el.style.top = r[1] * k + 'px'; el.style.width = (r[2] - r[0]) * k + 'px'; el.style.height = (r[3] - r[1]) * k + 'px'; }
document.getElementById('app').addEventListener('pointerdown', (e) => {
  const st = MOD.st; if (!st || (st.scr !== 'capCrop' && st.scr !== 'area')) return;
  const cc = e.target.closest('[data-cc]'), cb = e.target.closest('[data-cb]'), wrap = document.getElementById('mCrop'); if (!wrap || !wrap.contains(e.target)) return;
  if (cc || cb) { e.preventDefault(); e.stopPropagation(); cDrag = { mode: cc ? +cc.dataset.cc : 'move', x: e.clientX, y: e.clientY, r: st.roi.slice() }; (cc || cb).setPointerCapture && (cc || cb).setPointerCapture(e.pointerId); return; }
  cDrag = { mode: 'tap', x: e.clientX, y: e.clientY };
}, true);
document.getElementById('app').addEventListener('pointermove', (e) => {
  const st = MOD.st; if (!cDrag || !st || (st.scr !== 'capCrop' && st.scr !== 'area') || cDrag.mode === 'tap') return;
  const k = st.cropK, ph = st.res.photo, dx = (e.clientX - cDrag.x) / k, dy = (e.clientY - cDrag.y) / k, r0 = cDrag.r, r = st.roi, min = 40;
  if (cDrag.mode === 'move') { const w = r0[2] - r0[0], hh = r0[3] - r0[1], x = Math.max(0, Math.min(ph.w - w, r0[0] + dx)), y = Math.max(0, Math.min(ph.h - hh, r0[1] + dy)); r[0] = x; r[1] = y; r[2] = x + w; r[3] = y + hh; }
  else { const j = cDrag.mode; if (j === 0 || j === 3) r[0] = Math.max(0, Math.min(r0[2] - min, r0[0] + dx)); else r[2] = Math.min(ph.w, Math.max(r0[0] + min, r0[2] + dx)); if (j === 0 || j === 1) r[1] = Math.max(0, Math.min(r0[3] - min, r0[1] + dy)); else r[3] = Math.min(ph.h, Math.max(r0[1] + min, r0[3] + dy)); }
  cropApply();
}, true);
document.getElementById('app').addEventListener('pointerup', (e) => {
  const st = MOD.st, d = cDrag; cDrag = null; if (!d || !st || (st.scr !== 'capCrop' && st.scr !== 'area') || d.mode !== 'tap') return;
  if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8) return; // 스크롤이면 무시
  const wrap = document.getElementById('mCrop'); if (!wrap) return; const b = wrap.getBoundingClientRect(), k = st.cropK, ph = st.res.photo, r = st.roi, w = r[2] - r[0], hh = r[3] - r[1];
  const cx = (e.clientX - b.left) / k, cy = (e.clientY - b.top) / k, x = Math.max(0, Math.min(ph.w - w, cx - w * (st.scr === 'area' ? 0.5 : 0.3))), y = Math.max(0, Math.min(ph.h - hh, cy - hh / 2));
  r[0] = x; r[1] = y; r[2] = x + w; r[3] = y + hh; cropApply();
}, true);
/* 점 끌기 */
let mDrag = null;
document.getElementById('app').addEventListener('pointerdown', (e) => {
  if (!MOD.st) return; const svg0 = document.getElementById('mSvg');
  if (MOD.st.scr === 'crotch' && svg0 && e.target.closest('#mSvg')) { e.preventDefault(); mDrag = { a: 'c', b: 0, svg: svg0 }; svg0.setPointerCapture && svg0.setPointerCapture(e.pointerId); mMoveC(e); return; }
  const h = e.target.closest('[data-h]'); if (!h) return; const svg = document.getElementById('mSvg'); if (!svg) return;
  e.preventDefault(); const [a, b] = h.dataset.h.split('|'); mDrag = { a, b: +b, svg }; svg.setPointerCapture && svg.setPointerCapture(e.pointerId);
});
document.getElementById('app').addEventListener('pointermove', (e) => {
  if (!mDrag || !MOD.st) return; const { a, b, svg } = mDrag, pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const q = pt.matrixTransform(svg.getScreenCTM().inverse());
  const st = MOD.st;
  if (a === 'c') { mMoveC(e); return; }
  if (a === 'q') {
    st.quad[b] = [q.x, q.y];
    document.getElementById('mQ').setAttribute('points', st.quad.map((p) => p.join(',')).join(' '));
    const c1 = svg.querySelector(`[data-h="q|${b}"]`), c2 = document.getElementById('mQd' + b); [c1, c2].forEach((c) => { c.setAttribute('cx', q.x); c.setAttribute('cy', q.y); });
    return;
  }
  if (a === 'r') {
    const r = st.roi, cx = [0, 2, 2, 0][b], cy = [1, 1, 3, 3][b], ph0 = st.res.photo; r[cx] = Math.max(0, Math.min(ph0.w, q.x)); r[cy] = Math.max(0, Math.min(ph0.h, q.y));
    const x0 = Math.min(r[0], r[2]), x1 = Math.max(r[0], r[2]), y0 = Math.min(r[1], r[3]), y1 = Math.max(r[1], r[3]), ph = st.res.photo;
    document.getElementById('mR').setAttribute('d', `M0 0H${ph.w}V${ph.h}H0Z M${x0} ${y0}V${y1}H${x1}V${y0}Z`);
    const rr = document.getElementById('mRr'); rr.setAttribute('x', x0); rr.setAttribute('y', y0); rr.setAttribute('width', x1 - x0); rr.setAttribute('height', y1 - y0);
    [[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]].forEach((p, j) => { const cc = svg.querySelector(`[data-h="r|${j}"]`); cc.setAttribute('cx', p[0]); cc.setAttribute('cy', p[1]); });
    return;
  }
  const i = +a, m = st.res.measures[i]; m.p[b] = [q.x, q.y]; m.cm = Math.round(Math.hypot(m.p[0][0] - m.p[1][0], m.p[0][1] - m.p[1][1]) / st.res.cut.pxPerCm * 10) / 10; m.flag = null; m.manual = false; m.moved = true;
  const L = document.getElementById('ml' + i); L.setAttribute('x' + (b + 1), q.x); L.setAttribute('y' + (b + 1), q.y);
  ['mh', 'md'].forEach((p) => { const c = document.getElementById(p + i + '_' + b); c.setAttribute('cx', q.x); c.setAttribute('cy', q.y); });
  const t = document.getElementById('mt' + i), kk = svg.getBoundingClientRect().width / st.res.cut.w, lp = labPos(m, kk); t.setAttribute('x', lp[0]); t.setAttribute('y', lp[1]); t.setAttribute('text-anchor', lp[2]); t.textContent = (m.custom ? '두 점' : m.key) + ' ' + m.cm;
  const inp = document.getElementById('mi' + i); if (inp) inp.value = m.cm;
});
function mMoveC(e) {
  const svg = document.getElementById('mSvg'); if (!svg) return; const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const q = pt.matrixTransform(svg.getScreenCTM().inverse());
  const st = MOD.st; st.cpt = [q.x, q.y]; const k = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
  const c = document.getElementById('mCc'); c.setAttribute('cx', q.x); c.setAttribute('cy', q.y);
  const lh = document.getElementById('mCh'), lv = document.getElementById('mCv'); lh.setAttribute('x1', q.x - 26 / k); lh.setAttribute('x2', q.x + 26 / k); lh.setAttribute('y1', q.y); lh.setAttribute('y2', q.y); lv.setAttribute('x1', q.x); lv.setAttribute('x2', q.x); lv.setAttribute('y1', q.y - 26 / k); lv.setAttribute('y2', q.y + 26 / k);
}
const mEnd = () => { mDrag = null; };
document.getElementById('app').addEventListener('pointerup', mEnd); document.getElementById('app').addEventListener('pointercancel', mEnd);


document.addEventListener('input', (e) => { if (e.target && e.target.id === 'link') { const b = document.querySelector('#app [data-a="regLinkGo"]'); if (b) b.disabled = !e.target.value.trim(); } });
