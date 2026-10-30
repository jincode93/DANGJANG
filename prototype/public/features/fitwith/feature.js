/* ── 신기능 #19 내 옷이랑 맞춰 보기: 장바구니 상품을 내 옷장 옷과 4:5 바닥에 놓아 보고 저장 ──
   제안서 docs/proposals/내-옷이랑-맞춰-보기.md · 이슈 https://github.com/jincode93/DANGJANG/issues/19
   원본: 팀원(juribb) 데모 claude.ai/artifact/UvFZFSD3wVZZjdM59qpMtR (2026-10-29 버전)의 ⑧ 코디. 동작은 그대로 옮기고, 완료본과 맞물리는 곳만 고침
     - 화면 · 동작은 DJ.feature로 등록 (완료본 SCR · A를 직접 건드리지 않음)
     - 입구: 장바구니 위 바(cart.top) · 내 옷장 위(closet.top) · 마이 메뉴(my.menu) · 옷 등록 완료에서 돌아가기(reg.done)
     - 장바구니 체크박스는 붙이지 않음. 바닥에 처음 놓는 건 장바구니 첫 상품이고, 다른 상품은 바닥 아래 목록에서 고름
     - 원본의 내 옷장 "옷 / 코디" 탭 대신 저장 목록을 따로 연 화면(SCR.cody)으로
   데이터는 열어 둔 동안만 기억 (기기 저장 없음) */
(() => {
const SCRX = {}, AX = {};
const CD = () => (S.cody = S.cody || { saved: [] }); // reset()이 S를 새로 만들어서 쓸 때 만듦
const jo = (w, a, b) => (w.charCodeAt(w.length - 1) - 0xAC00) % 28 ? a : b; // 받침 있으면 a
const josa = (w) => jo(w, '이', '가');
const CODY_K = 2.5; // 실측 1cm → 2.5px
const CODY_SLOT = ['outer', 'top', 'bottom'];
// 바닥 크기: 인스타그램 피드 비율 4:5 고정. 스토리 공유는 나중에 위아래 여백을 붙여 9:16으로 내보냄
const CODY_W = 350, CODY_H = 438;
const CODY_X = { outer: 86, top: 258, bottom: 258 }; // 바닥 위 칸의 가운데 x
const codyLen = (cat) => ({ top: 68, outer: 70, bottom: 103 })[cat] || 70;
const inCart = (pid) => S.cart.find((c) => c.pid === pid);
// 맞춰 볼 상품 = 장바구니 상품 + (장바구니 밖에서 열었으면) 지금 바닥에 놓인 상품
const codyPend = (sl) => [...new Set([...S.cart.map((c) => c.pid), ...(sl ? CODY_SLOT.map((k) => sl[k] && sl[k].k === 'p' ? sl[k].id : null) : [])])].filter((id) => id && PB[id]);
const codyTagOf = (pid) => inCart(pid) ? '장바구니' : '구매 전';
function codyRef(r) {
  if (!r) return null;
  if (r.k === 'p') {
    const p = PB[r.id]; if (!p) return null;
    const j = judge(p), ks = sizeKeys(p) || [], sz = r.size || (j.n === 5 ? j.rec : ks[0]);
    const len = p.sizes && p.sizes[sz] && +p.sizes[sz][0];
    return { p, name: p.name, img: CUT[p.img] || IMG[p.img], cut: !!CUT[p.img], len: len || codyLen(p.cat), size: sz, cat: p.cat, pend: codyTagOf(p.id) };
  }
  const c = S.closet.find((x) => x.id === r.id); if (!c || !c.img) return null; // 사진 없는 옷(도식화)은 놓지 않음
  return { c, name: c.name, img: CUT[c.img] || IMG[c.img], cut: !!CUT[c.img], len: (c.m && +c.m[0]) || codyLen(c.cat), size: c.size, cat: c.cat };
}
// 첫 배치: 장바구니 상품과 계절을 맞춰 그 그룹의 기준 옷을 놓음
// 긴팔 계절 → 긴팔 상의 · 긴바지(긴치마) · 아우터 / 반팔 계절 → 반팔 상의 · 반바지(짧은 치마), 아우터는 비움
const CODY_GRP = { long: { top: ['top-l'], bottom: ['pants-l', 'skirt-l'], outer: ['outer-s', 'outer-l'] }, short: { top: ['top-s'], bottom: ['pants-s', 'skirt-s'], outer: [] } };
const codySeason = (x) => /-s$/.test(grpOf(x)) && x.cat !== 'outer' ? 'short' : 'long'; // 아우터의 outer-s는 '짧은 아우터'라 계절과 무관
function codyPickC(cat, season = 'long') {
  const gs = CODY_GRP[season][cat]; if (!gs.length) return null;
  const all = S.closet.filter((c) => c.cat === cat && c.fit === 'good' && c.img), a = all.filter((c) => gs.includes(grpOf(c)));
  const pick = (l) => l.find((c) => c.base) || l[0] || null; // 기준 옷 → 먼저 담은 옷
  return pick(a) || pick(all); // 계절에 맞는 옷이 없으면 그 종류에서 내가 등록한 옷
}
function codyDefault(season = 'long') { const sl = {}; CODY_SLOT.forEach((k) => { const c = codyPickC(k, season); sl[k] = c ? { k: 'c', id: c.id } : null }); return sl }
// 기본 배경 5가지. 그 밖의 색은 '직접 고르기'로 골라 hex로 저장 (lt: 밝은 바닥이라 빈 칸 점선을 어둡게)
const CODY_BG = [['warm', '웜 그레이', '#BAB4AA'], ['cream', '크림', '#EEE8DD', 1], ['sage', '세이지', '#AAB5A2'], ['rose', '더스티 로즈', '#D8B4B0'], ['char', '차콜', '#4B4845']];
const codyLt = (h) => { const n = parseInt(h.slice(1), 16); return (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255 > 0.62 };
const codyBg = (k) => k && k[0] === '#' ? [k, '고른 색', k, codyLt(k) ? 1 : 0] : CODY_BG.find((b) => b[0] === k) || CODY_BG[0];
// 겹침 순서: 뒤 → 앞. 기본은 아우터가 맨 뒤, 상의가 맨 앞
const CODY_ORD = ['outer', 'bottom', 'top'];
const codyOrdOf = (ord) => ord && ord.length === 3 ? ord : CODY_ORD;
// 바닥 그리기: live면 옷을 끌어 옮기고 눌러 바꿀 수 있고, 아니면(저장한 것 썸네일) 그림만. o.pos = 옮긴 위치, o.bg = 바닥색, o.ord = 겹침 순서
function codyFloor(sl, live, o = {}) {
  const R = {}; CODY_SLOT.forEach((k) => R[k] = codyRef(sl[k]));
  const H = (x) => Math.round(x.len * CODY_K), tag = live ? 'button' : 'span', pos = o.pos || {}, bg = codyBg(o.bg), h = CODY_H;
  const IH = (k) => R[k] ? (R[k].cut ? H(R[k]) : Math.round(H(R[k]) * .8)) : (k === 'bottom' ? 200 : 130);
  // 기본 자리: 왼쪽 아우터, 오른쪽 상의 · 그 아래 하의. 아우터가 없으면 상의 · 하의를 가운데에
  const cx = R.outer ? null : CODY_W / 2, shown = CODY_SLOT.filter((k) => R[k] || k !== 'outer');
  const tH = R.top ? IH('top') : 150, P0 = { outer: { x: CODY_X.outer, y: 22 }, top: { x: cx || CODY_X.top, y: 16 }, bottom: { x: cx || CODY_X.bottom, y: R.top ? 16 + tH - 26 : 60 } };
  const dy = Math.max(0, Math.round((h - Math.max(...shown.map((k) => P0[k].y + IH(k)))) / 2) - 10);
  CODY_SLOT.forEach((k) => { P0[k].y += dy });
  const pc = (k) => {
    const x = R[k], ih = IH(k), q = pos[k] || P0[k], p = { x: q.x, y: Math.max(0, Math.min(h - ih, q.y)) };
    if (!x) { if (!live || k === 'outer') return ''; return `<button class="cf-slot" data-a="codyCt" data-x="${k}|go" style="left:${p.x}px;top:${p.y}px;width:${k === 'bottom' ? 120 : 150}px;height:${ih}px">+ ${CAT[k]}</button>` }
    const sel = live && o.sel === k;
    // 한 번 누르면 맨 앞으로, 맨 앞에 있는 옷을 한 번 더 누르면 아래 목록으로
    return `<${tag} class="cf-it ${x.cut ? '' : 'ph'}" ${live ? `data-a="codyTap" data-x="${k}"` : ''} style="left:${p.x}px;top:${p.y}px;height:${ih}px" aria-label="${esc(x.name)}${live ? (sel ? ' · 한 번 더 누르면 다른 옷으로 바꾸기' : ' · 누르면 맨 앞으로') : ''}"><img src="${x.img}" alt="" draggable="false"></${tag}>`;
  };
  const html = codyOrdOf(o.ord).map(pc).join('');
  return { R, h, bg: bg[2], html: `<div class="cf-floor ${live ? 'live' : ''} ${bg[3] ? 'lt' : ''}" style="height:${h}px;background:${bg[2]}">${html}</div>` };
}
// 옷 끌어 옮기기: 6px 넘게 움직이면 옮기기, 아니면 누르기
let codyDrag = null, codySkip = false;
app.addEventListener('pointerdown', (e) => {
  const it = e.target.closest('.cf-floor.live .cf-it'); if (!it || e.button > 0) return;
  const fl = it.parentElement, sc = fl.getBoundingClientRect().width / CODY_W;
  codyDrag = { it, fl, k: it.dataset.x, x0: e.clientX, y0: e.clientY, l: parseFloat(it.style.left), t: parseFloat(it.style.top), sc, moved: false };
  try { it.setPointerCapture(e.pointerId) } catch (er) {}
});
app.addEventListener('pointermove', (e) => {
  const d = codyDrag; if (!d) return;
  const dx = (e.clientX - d.x0) / d.sc, dy = (e.clientY - d.y0) / d.sc;
  if (!d.moved && Math.hypot(dx, dy) < 6) return;
  d.moved = true; d.it.classList.add('drag'); e.preventDefault();
  const hw = Math.min(d.it.offsetWidth / 2, CODY_W / 2); // 옷 전체가 바닥 안에 머물도록
  d.it.style.left = Math.max(hw, Math.min(CODY_W - hw, d.l + dx)) + 'px';
  d.it.style.top = Math.max(0, Math.min(CODY_H - d.it.offsetHeight, d.t + dy)) + 'px';
});
const codyDrop = () => {
  const d = codyDrag; codyDrag = null; if (!d || !d.moved) return;
  codySkip = true; setTimeout(() => { codySkip = false }, 80);
  const pp = cur().p; pp.pos = Object.assign({}, pp.pos, { [d.k]: { x: Math.round(parseFloat(d.it.style.left)), y: Math.round(parseFloat(d.it.style.top)) } });
  codyFront(pp, d.k); render(); // 끌어 옮긴 옷도 맨 앞으로
};
const codyToPanel = () => setTimeout(() => { const el = document.getElementById('codyPanel'); if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' }) }, 30);
const codyFront = (pp, k) => { pp.ord = [...codyOrdOf(pp.ord).filter((x) => x !== k), k]; pp.sel = k; pp.ct = k };
app.addEventListener('pointerup', codyDrop); app.addEventListener('pointercancel', codyDrop);
app.addEventListener('change', (e) => { if (e.target.id === 'codyColor' && cur() && cur().s === 'codyMake') A.codyBgSet(e.target.value.toUpperCase()) }); // 직접 고르기: 창을 닫으면 반영
app.addEventListener('input', (e) => { if (e.target.id === 'codyTitle' && S.ov) S.ov.title = e.target.value }); // 제목을 직접 고치면 그대로 기억 (다시 그리지 않아 입력이 끊기지 않음)
// ── 제목: 태그와 계절, 대표 옷으로 추천. 사용자는 고쳐 쓸 수 있음
const CODY_TAGS = ['출근', '주말', '약속', '여행', '데일리'];
const CODY_SW = { 봄: ['봄', '산뜻한 봄'], 여름: ['여름', '시원한 여름'], 가을: ['가을', '선선한 가을'], 늦가을: ['늦가을', '쌀쌀한 늦가을'], 겨울: ['겨울', '포근한 겨울'] };
const CODY_TT = { 출근: ['{s} 출근룩', '{s} 오피스 코디', '{i} 출근 코디'], 주말: ['{s} 주말 나들이룩', '{s} 주말 코디', '{i} 주말 코디'], 약속: ['{s} 약속룩', '{s} 데이트 코디', '{i} 약속 코디'],
  여행: ['{s} 여행룩', '{s} 여행 코디', '{i} 여행 코디'], 데일리: ['{s} 데일리룩', '{i} 데일리 코디', '{s} 기본 코디'] };
// 계절감: 옷에서 먼저(패딩 → 겨울, 코트 → 늦가을, 반팔만 있고 아우터 없음 → 여름), 아니면 지금 달
function codySeasonWord(R) {
  const o = R.outer && (R.outer.c || R.outer.p), osub = (o && o.sub) || '', t = R.top && (R.top.c || R.top.p);
  if (/패딩/.test(osub)) return '겨울';
  if (/코트/.test(osub)) return '늦가을';
  if (t && codySeason(t) === 'short' && !R.outer) return '여름';
  const m = new Date().getMonth() + 1; return m >= 3 && m <= 5 ? '봄' : m >= 6 && m <= 8 ? '여름' : m >= 9 && m <= 11 ? '가을' : '겨울';
}
// 대표 옷 이름: 장바구니 상품이 있으면 그 상품, 없으면 상의의 세부 종류
function codyKeyItem(R) {
  const p = CODY_SLOT.map((k) => R[k]).find((x) => x && x.p);
  if (p) return p.p.tag || p.p.sub || CAT[p.cat];
  const t = R.top || R.bottom || R.outer; return t ? (t.c.sub || CAT[t.cat]).replace(/^긴팔 |^반팔 /, '') : '데일리';
}
function codyTitleOf(sl, tag, n = 0) {
  const R = {}; CODY_SLOT.forEach((k) => R[k] = codyRef(sl[k]));
  const sw = CODY_SW[codySeasonWord(R)], tt = CODY_TT[tag] || CODY_TT['데일리'], t = tt[n % tt.length];
  return t.replace('{s}', sw[Math.floor(n / tt.length) % sw.length]).replace('{i}', codyKeyItem(R));
}
function codySaveSheet(patch) {
  const o = S.ov;
  o.html = `<div class="grab"></div><div style="font-size:18px;font-weight:800">${o.mode === 'edit' ? '수정한 코디를 저장할게요' : o.mode === 'rename' ? '이름과 태그 바꾸기' : '이 코디를 저장할게요'}</div>
    <label class="cf-lbl" for="codyTitle">제목</label>
    <div class="cf-tin"><input id="codyTitle" maxlength="24" value="${esc(o.title)}" autocomplete="off"><button data-a="codyTitleNext" aria-label="다른 제목 추천">다른 추천</button></div>
    <div class="cf-hint">계절과 고른 태그로 추천했어요. 직접 고쳐 써도 돼요</div>
    <div class="cf-lbl">태그 <small>여러 개 골라도 돼요</small></div>
    <div class="cf-tags">${CODY_TAGS.map((t) => `<button class="${o.tags.includes(t) ? 'on' : ''}" data-a="codyTag" data-x="${t}" aria-pressed="${o.tags.includes(t)}">#${t}</button>`).join('')}</div>
    ${o.mode === 'edit' ? `<button class="btn" style="margin-top:18px" data-a="codySaveOk">이 코디에 저장</button><button class="btn line" style="margin-top:8px" data-a="codySaveNew">새 코디로 저장</button>`
      : `<button class="btn" style="margin-top:18px" data-a="codySaveOk">${o.mode === 'rename' ? '바꾸기' : '저장하기'}</button>`}`;
  if (patch) { const sh = app.querySelector('.sheet'); if (sh) sh.innerHTML = o.html }
}
// ── 추천 상품: 바닥에 놓인 다른 옷을 기준으로, 고른 자리에 놓을 상품
// 순서: ① 내 옷 기준 추천 사이즈가 있는 상품 ② 같은 세부 종류(빈 자리는 계절 그룹) ③ 계절 ④ 색 톤 ⑤ 태그 ⑥ 후기 많은 순. 점수나 %는 보여 주지 않고 이유만(REC-05)
// 데모 가정: 색 계열은 사진을 보고 손으로 붙인 값, 스타일 태그는 상품 이름 · 종류의 키워드로 대신 (실서비스는 입점 데이터로 받아야 함)
const CODY_TONE = { hero: '무채색', base: '블루', jacket: '블루', knit: '브라운·베이지', slacks: '무채색', denim: '블루', tee: '무채색', puffer: '블루', leather: '무채색', suede: '브라운·베이지', lpuffer: '블루', tee2: '브라운·베이지', blackp: '무채색', wide: '블루', dshirt: '블루', pdHero: '블루', denim_k: '무채색', slacks_b: '브라운·베이지', denim_i: '블루', slacks_n: '블루', ltee: '브라운·베이지' };
const CODY_STYLE = { 출근: ['셔츠', '니트', '슬랙스', '코트', '재킷'], 주말: ['티셔츠', '데님', '후드', '패딩'], 약속: ['셔츠', '니트', '슬랙스', '레더', '스웨이드'], 여행: ['티셔츠', '데님', '후드', '패딩'], 데일리: ['티셔츠', '데님', '셔츠', '니트'] };
function codyRecs(sl, k, tags = [], o = {}) {
  const R = {}; CODY_SLOT.forEach((x) => R[x] = codyRef(sl[x]));
  const src = (x) => x.p || x.c, now = R[k], others = CODY_SLOT.filter((x) => x !== k && R[x]).map((x) => R[x]);
  const sw = codySeasonWord(R), se = sw === '여름' ? 'short' : 'long';
  const nowSub = now ? src(now).sub : null, nowG = now ? grpOf(src(now)) : null, tones = others.map((x) => CODY_TONE[src(x).img]).filter(Boolean);
  const onFloor = CODY_SLOT.map((x) => sl[x] && sl[x].k === 'p' ? sl[x].id : null);
  return Object.values(PB).filter((p) => p.cat === k && !onFloor.includes(p.id) && !(o.noCart && inCart(p.id)) && !(o.skip || []).includes(p.id) && sizeKeys(p).some((z) => !p.out.includes(z))).map((p) => {
    const j = judge(p), fit = j.n === 5, g = grpOf(p);
    const subR = nowSub ? (p.sub === nowSub ? 0 : g === nowG ? 1 : 2) : ((CODY_GRP[se][k] || []).includes(g) ? 1 : 2);
    const seOk = codySeason(p) === se, t = CODY_TONE[p.img], toneOk = t === '무채색' || tones.includes(t);
    const tag = tags.find((x) => (CODY_STYLE[x] || []).some((w) => (p.name + (p.sub || '') + (p.tag || '')).includes(w)));
    const why = [fit ? `추천 ${j.rec}` : null, subR < 2 ? (p.sub || p.tag) : null, seOk ? sw : null, toneOk ? (t === '무채색' ? '무채색' : '같은 톤') : null, tag ? '#' + tag : null].filter(Boolean);
    return { p, rec: fit ? j.rec : null, why, key: [fit ? 0 : 1, subR, seOk ? 0 : 1, toneOk ? 0 : 1, tag ? 0 : 1, -(p.rev || 0)] };
  }).sort((a, b) => { for (let i = 0; i < a.key.length; i++) if (a.key[i] !== b.key[i]) return a.key[i] - b.key[i]; return 0 }).slice(0, o.n || 5);
}
const codyRecCard = (r, act, x) => `<button class="cf-rec" data-a="${act}" data-x="${x}"><span class="img"><img src="${IMG[r.p.img]}" alt=""></span><b>${esc(r.p.name)}</b><span class="pr num">${won(sale(r.p))}원</span><span class="why">${r.why.slice(0, 4).map((w) => `<i>${w}</i>`).join('')}</span></button>`;
const codyRecRow = (recs, act, xf, empty) => recs.length ? `<div class="cf-recs">${recs.map((r) => codyRecCard(r, act, xf(r))).join('')}</div>` : `<div class="cf-recnone">${empty}</div>`;
// 지금 화면의 배치: 맞춰 보기 화면이면 그 배치, 저장한 것 상세면 저장된 배치
const q0 = (id, k) => { const q = CD().saved.find((v) => v.id === id); return q && q.sl[k] ? JSON.parse(JSON.stringify(q.sl[k])) : null };
const codyCurSl = () => { const c = cur(); if (c.s === 'codyView') { const q = CD().saved.find((x) => x.id === c.p.id); return q ? q.sl : {} } return c.p.sl };
const codySnap = (o) => JSON.stringify({ sl: o.sl, pos: o.pos || null, bg: o.bg || null, ord: o.ord || null });
// 주문 전 옵션 확인: 바닥에 놓인 장바구니 상품의 컬러 · 사이즈 · 수량을 한 번 더 보고 주문. 사이즈 칩에는 내 옷 기준 추천을 같이(ORD-07)
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
    ${o.mode === 'cart' ? `<button class="btn" data-a="codyOptCart">${n}개 장바구니 담기</button>` : `<button class="btn" data-a="codyOptOk">${n}개 · ${won(sum)}원 주문하기</button>`}`;
  if (patch) { const sh = app.querySelector('.sheet'); if (sh) { const y = sh.scrollTop; sh.innerHTML = o.html; sh.scrollTop = y } }
}
// 장바구니 맨 위: 장바구니 옷을 내 옷장 옷이랑 맞춰 보는 화면으로. 옷장이 비었으면 등록부터 하자고 알림
const codyHasMine = () => S.user && S.closet.some((c) => c.img && c.fit === 'good');
const codyCartBar = () => { if (!S.cart.length) return '';
  return `<button class="cf-cartbar" data-a="codyCartAll"><span class="cf-cbtx"><b>내 옷장 옷이랑 맞춰 볼까요?</b><small>${codyHasMine() ? (S.cart.length > 1 ? `장바구니 ${S.cart.length}개를 하나씩 가진 옷과 놓아 봐요` : '가진 옷과 같이 놓아 봐요') : '가진 옷 1벌만 등록하면 같이 놓아 볼 수 있어요'}</small></span><span class="cf-cbgo">맞춰 보기 ›</span></button>` };
// 옷장에 없는 종류는 등록하러 갔다가, 등록이 끝나면 이 화면으로 돌아와 빈칸에 놓음
function codyBack() {
  const r = S.codyRet; S.codyRet = null;
  nav = nav.filter((e) => !e.s.startsWith('reg') && !['loading', 'permDenied'].includes(e.s));
  while (nav.length > 1 && cur().s !== 'codyMake') nav.pop();
  if (cur().s !== 'codyMake') { go('cody'); return }
  const k = r && r.slot, c = k && [...S.closet].reverse().find((x) => x.cat === k && x.fit === 'good' && x.img);
  if (c) { cur().p.sl[k] = { k: 'c', id: c.id }; toast(`방금 등록한 ${c.name}${jo(c.name, '을', '를')} 같이 놓았어요`) }
  else if (k) toast(`사진이 있는 ${CAT[k]}만 놓을 수 있어요 · 옷 상세에서 사진을 추가해 주세요`);
  render(true);
}
// 아래 목록: 자리 탭(상의 · 하의 · 아우터) 하나 + 두 줄. '내 옷' 줄과 '상품' 줄(장바구니 상품 → 추천 상품)
// 줄 순서는 들어온 곳을 따름 (장바구니에서 → 상품 먼저, 내 옷장에서 → 내 옷 먼저). 고르면 그 자리만 바뀌고 목록은 그대로
const codyCtOf = (pp) => { if (pp.ct) return pp.ct; const fp = CODY_SLOT.find((k) => pp.sl[k] && pp.sl[k].k === 'p'); return fp || 'top' };
function codyPanel(pp) {
  const ct = codyCtOf(pp), now = pp.sl[ct], isOn = (t, id) => now && now.k === t && now.id === id;
  const mine = S.closet.filter((c) => c.cat === ct && c.fit === 'good' && c.img), cartIds = [...new Set(S.cart.map((c) => c.pid))].filter((id) => PB[id] && PB[id].cat === ct);
  const base = { ...pp.sl }; if (now && now.k === 'p') base[ct] = (pp.prev && pp.prev[ct]) || null; // 추천 기준: 이 자리에 원래 있던 내 옷 (추천 상품끼리 바꿔도 목록이 흔들리지 않게)
  const recs = codyRecs(base, ct, pp.tags || [], { skip: cartIds, n: 8 });
  const loose = now && now.k === 'p' && !inCart(now.id) && !recs.some((r) => r.p.id === now.id) ? [now.id] : [], prods = [...loose, ...cartIds]; // 장바구니 밖에서 놓은 상품은 상품 줄 맨 앞에
  const on = '<span class="cf-on">놓임</span>';
  const mineRow = `<div class="cf-row"><div class="cf-rowh">내 옷 <small>${mine.length}</small></div>
    <div class="cf-mine">${mine.map((c) => `<button class="${isOn('c', c.id) ? 'on' : ''}" data-a="codyMine" data-x="${ct}|${c.id}" aria-label="${esc(c.name)} ${c.size}"><img src="${CUT[c.img] || IMG[c.img]}" alt="">${isOn('c', c.id) ? on : ''}</button>`).join('')}
      <button class="cf-mreg" data-a="codyReg" data-x="${ct}">+ ${CAT[ct]} 등록</button>${now ? `<button class="cf-mreg" data-a="codyClear" data-x="${ct}">이 자리<br>비우기</button>` : ''}</div></div>`;
  const pcard = (p, tag, why) => `<button class="cf-pc ${isOn('p', p.id) ? 'on' : ''}" data-a="codyPut" data-x="${ct}|${p.id}"><span class="img"><img src="${IMG[p.img]}" alt="">${isOn('p', p.id) ? on : ''}</span><small class="tg">${tag}</small><b>${esc(p.name)}</b><span class="pr num">${won(sale(p))}원</span>${why ? `<span class="why">${why.slice(0, 3).map((w) => `<i>${w}</i>`).join('')}</span>` : ''}</button>`;
  const prodRow = `<div class="cf-row"><div class="cf-rowh">상품 <small>장바구니 ${prods.length} · 추천 ${recs.length}</small></div>
    <div class="cf-prods">${prods.map((id) => pcard(PB[id], codyTagOf(id))).join('')}${prods.length && recs.length ? '<span class="cf-sep"><i>추천</i></span>' : ''}${recs.map((r) => pcard(r.p, '추천', r.why)).join('')}${!prods.length && !recs.length ? `<div class="cf-recnone" style="margin:0">이 자리에 놓을 상품이 없어요</div>` : ''}</div></div>`;
  const tabs = `<div class="cf-mtabs cf-ptabs">${['top', 'bottom', 'outer'].map((k) => `<button class="${k === ct ? 'on' : ''}" data-a="codyCt" data-x="${k}">${CAT[k]}${pp.sl[k] ? '' : '<small> · 비어 있음</small>'}</button>`).join('')}</div>`;
  return `<div class="cf-panel" id="codyPanel">${tabs}${pp.from === 'closet' ? mineRow + prodRow : prodRow + mineRow}</div>`;
}
SCRX.codyMake = (pp) => {
  const F = codyFloor(pp.sl, true, { pos: pp.pos, bg: pp.bg, ord: pp.ord, sel: pp.sel }), R = F.R, sv = pp.sv && CD().saved.find((q) => q.id === pp.sv), bgk = codyBg(pp.bg)[0];
  const lens = CODY_SLOT.filter((k) => R[k]).map((k) => `${CAT[k]} ${R[k].len}`).join(' · ');
  // 아래 버튼: 왼쪽은 저장, 오른쪽은 바닥에 놓인 상품으로 바로 이어지는 쇼핑 동작
  const ps = CODY_SLOT.map((k) => pp.sl[k]).filter((r) => r && r.k === 'p'), out = ps.find((r) => !inCart(r.id));
  const its = S.cart.filter((c) => ps.some((r) => r.id === c.pid)), sum = its.reduce((a, c) => a + sale(PB[c.pid]) * (c.qty || 1), 0);
  const buy = out ? `<button class="btn" data-a="codyCart">장바구니 담기</button>` : its.length ? `<button class="btn" data-a="codyOrder">${its.length}개 · ${won(sum)}원 주문하기</button>` : '';
  const sl0 = sv ? '저장하기' : '코디 저장', dirty = sv && pp.snap && pp.snap !== codySnap(pp);
  return { node: sv ? `#19 맞춰 보기 · 저장한 코디(${sv.name}) 수정${dirty ? ' · 바뀐 내용 있음' : ''}` : '#19 맞춰 보기 · 내 옷이랑 맞춰 보기 (실측 비율로 바닥에 펼쳐 놓기)',
    bar: buy ? `<button class="btn line" style="flex:none;width:112px" data-a="codySave">${sl0}</button>${buy}` : `<button class="btn" data-a="codySave">${sl0}</button>`,
    body: `${sv ? `<div class="hdr"><button data-a="codyLeave" aria-label="뒤로">${I.back}</button><span class="t">코디 수정</span><span class="icons">${dirty ? '<span class="cf-dirty">수정 중</span>' : '<span style="width:24px"></span>'}</span></div>` : hdrBack('내 옷이랑 맞춰 보기')}
    <div class="cf-bgs"><span>배경</span>${CODY_BG.map(([k, n, c]) => `<button class="${k === bgk ? 'on' : ''}" data-a="codyBgSet" data-x="${k}" style="background:${c}" aria-label="${n} 배경" title="${n}"></button>`).join('')}<label class="cf-pick ${bgk[0] === '#' ? 'on' : ''}" title="직접 고르기" style="${bgk[0] === '#' ? `--pk:${bgk}` : ''}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 4.5l4.5 4.5M17.3 2.2l4.5 4.5-2.6 2.6-4.5-4.5z"/><path d="M14.7 6.8L5 16.5 4 20l3.5-1L17.2 9.3"/></svg><input type="color" id="codyColor" value="${codyBg(pp.bg)[2].toLowerCase()}" aria-label="배경 색 직접 고르기"></label>${pp.pos || pp.ord ? '<button class="cf-reset" data-a="codyPosReset">배치 처음대로</button>' : ''}</div>
    ${F.html}
    <div class="cf-scale"><span>길이만 실제 비율이에요${R.outer ? '' : ' · <button class="cf-addouter" data-a="codyCt" data-x="outer|go">+ 아우터 놓기</button>'}</span><span class="num">${lens ? `총장 ${lens}cm` : ''}</span></div>
    ${(() => { // 빈 칸인데 내 옷장에 그 종류 옷이 없으면 등록하자고 알림 (반팔 계절의 아우터는 일부러 비워 둔 칸이라 뺌)
      const se = pp.season || 'long', miss = CODY_SLOT.filter((k) => !R[k] && CODY_GRP[se][k].length && !codyPickC(k, se)), k = miss.includes('bottom') ? 'bottom' : miss.includes('top') ? 'top' : miss[0];
      const L = k && CAT[k];
      return k ? `<div class="cf-regcta"><div><b>내 옷장에 ${L}${josa(L)} 없어요</b><small>가진 ${L} 1벌만 등록하면 같이 놓아 볼 수 있어요</small></div><span class="cf-rgb"><button data-a="codyReg" data-x="${k}">${L} 등록하기</button><button class="ln" data-a="codyCt" data-x="${k}|go">추천 보기</button></span></div>` : '' })()}
    ${codyPanel(pp)}
    <div class="pad" style="font-size:12.5px;color:var(--sub);margin-top:12px;line-height:1.5">옷을 누르면 맨 앞으로 오고, 아래 목록이 그 자리로 바뀌어요. 끌어서 위치를 옮겨요</div><div style="height:24px"></div>` };
};
// 저장한 코디 상세: 배치 · 옷 목록 · 어울리는 상품. '수정하기'로 같은 코디를 고치고, ⋯에서 이름·태그 바꾸기 · 새 코디로 복사 · 삭제
SCRX.codyView = (pp) => {
  const q = CD().saved.find((x) => x.id === pp.id); if (!q) return SCRX.cody();
  const F = codyFloor(q.sl, false, { pos: q.pos, bg: q.bg, ord: q.ord });
  const ps = CODY_SLOT.map((k) => q.sl[k]).filter((r) => r && r.k === 'p' && PB[r.id]), out = ps.filter((r) => !inCart(r.id));
  const its = S.cart.filter((c) => ps.some((r) => r.id === c.pid)), sum = its.reduce((a, c) => a + sale(PB[c.pid]) * (c.qty || 1), 0);
  const buy = out.length ? `<button class="btn" data-a="codyCart">${out.length}개 장바구니 담기</button>` : its.length ? `<button class="btn" data-a="codyOrder">${its.length}개 · ${won(sum)}원 주문하기</button>` : '';
  const rows = ['outer', 'top', 'bottom'].filter((k) => F.R[k]).map((k) => { const x = F.R[k], r = q.sl[k], isP = r.k === 'p';
    return `<button class="cf-vrow" data-a="${isP ? 'detail' : 'codyItem'}" data-x="${r.id}"><span class="th"><img src="${x.img}" alt=""></span><span class="tx"><small>${CAT[k]}${isP ? ` · <em>${x.pend}</em>` : ''}</small><b>${esc(x.name)}</b><span>${x.size ? x.size + ' · ' : ''}${isP ? won(sale(PB[r.id])) + '원' : '내 옷'}</span></span><span class="go">›</span></button>` }).join('');
  const rk = pp.rk || ['outer', 'top', 'bottom'].find((k) => !F.R[k]) || 'top', recs = codyRecs(q.sl, rk, q.tags || []);
  return { node: `#19 맞춰 보기 · 저장한 코디 상세 (${q.name}) → 수정하기 · 어울리는 상품 · ⋯(이름 · 복사 · 삭제)`,
    bar: buy ? `<button class="btn line" style="flex:none;width:112px" data-a="codyModify" data-x="${q.id}">수정하기</button>${buy}` : `<button class="btn" data-a="codyModify" data-x="${q.id}">수정하기</button>`,
    body: `${hdrBack('', `<button data-a="codyMore" data-x="${q.id}" aria-label="더보기">${I.more}</button>`)}
    <div class="cf-vhead"><b>${esc(q.name)}</b>${q.tags && q.tags.length ? `<div class="cf-vtags" style="padding:0;margin-top:6px">${q.tags.map((t) => `<span>#${t}</span>`).join('')}</div>` : ''}</div>
    <button class="cf-vfloor" data-a="codyModify" data-x="${q.id}" aria-label="이 코디 수정하기">${F.html}<span class="cf-vedit">${I.edit || '✎'} 눌러서 수정</span></button>
    <div class="sec" style="margin-top:18px"><h3>이 코디의 옷<small>${ps.length ? `장바구니 · 구매 전 상품 ${ps.length}개` : ''}</small></h3></div>
    <div class="cf-vlist">${rows}</div>
    <div class="sec" style="margin-top:22px"><h3>이 코디에 어울리는 상품</h3></div>
    <div class="cf-mtabs">${['top', 'bottom', 'outer'].map((k) => `<button class="${k === rk ? 'on' : ''}" data-a="codyRecTab" data-x="${k}">${CAT[k]}${F.R[k] ? '' : ' · 비어 있음'}</button>`).join('')}</div>
    <div style="padding:0 20px">${codyRecRow(recs, 'codyRecModify', (r) => `${q.id}|${rk}|${r.p.id}`, `이 자리에 추천할 상품이 없어요`)}</div>
    <div class="pad" style="font-size:12.5px;color:var(--sub);margin-top:8px;line-height:1.5">바닥의 다른 옷 기준으로 골랐어요. 누르면 이 코디에 놓고 수정 화면으로 가요</div><div style="height:24px"></div>` };
};
// 저장한 코디 목록 (원본은 내 옷장의 '코디' 탭. 여기선 내 옷장 위 · 마이 메뉴에서 여는 화면)
SCRX.cody = () => {
  const pend = codyPend(), sc = 170 / 350, saved = CD().saved;
  return { node: '#19 맞춰 보기 · 장바구니 상품 · 저장한 코디', body: `${hdrBack('내 옷이랑 맞춰 보기')}
    <div class="sec"><h3>장바구니 상품<small>${pend.length}</small></h3>${pend.length ? '<button data-a="go" data-x="cart">장바구니 ›</button>' : ''}</div>
    ${pend.length ? `<div class="cf-pend">${pend.map((id) => { const p = PB[id]; return `<button class="cf-pi" data-a="codyOpen" data-x="${id}"><div class="img"><img src="${IMG[p.img]}" alt=""><span>맞춰 보기</span></div><p>${p.name}</p></button>` }).join('')}</div>`
      : `<div class="pad" style="font-size:13px;color:var(--sub);line-height:1.5">장바구니에 상품을 담으면 여기서 내 옷이랑 맞춰 볼 수 있어요. 사기 전에 가진 옷과 같이 놓아 보고 정해요</div>`}
    <div class="sec"><h3>저장한 코디<small>${saved.length}</small></h3><span>최근 순</span></div>
    <div class="cf-grid">${saved.map((q) => { const F = codyFloor(q.sl, false, { pos: q.pos, bg: q.bg, ord: q.ord }), has = CODY_SLOT.some((k) => F.R[k] && F.R[k].pend === '장바구니'); // 장바구니에서 빠진 상품은 '구매 전'으로만 표시
      return `<div class="cf-card" data-a="codyEdit" data-x="${q.id}" role="button" tabindex="0"><div class="cf-mini" style="height:${Math.round(F.h * sc)}px;background:${F.bg}"><div style="transform:scale(${sc})">${F.html}</div></div><b>${esc(q.name)}</b>${q.tags && q.tags.length ? `<small class="cf-ctags">${q.tags.map((t) => '#' + t).join(' ')}</small>` : ''}<small>${CODY_SLOT.filter((k) => F.R[k]).map((k) => F.R[k].name).join(' + ')}</small>${has ? '<small class="cf-incart">장바구니 상품 포함</small>' : ''}</div>` }).join('')}
      <button class="cf-add" data-a="codyNew">+ 새 코디</button></div>
    <div style="height:40px"></div>` };
};
Object.assign(AX, {
  codyHome() { need('로그인하면 내 옷장 옷이랑 맞춰 볼 수 있어요', () => { closeOv(); go('cody') }) },
  codyOpen(pid) { need('로그인하면 내 옷장 옷이랑 맞춰 볼 수 있어요', () => { closeOv(); S.toast = null; const p = PB[pid], ci = inCart(pid); const sl = codyDefault(codySeason(p)), prev = { [p.cat]: sl[p.cat] }; sl[p.cat] = { k: 'p', id: pid, size: ci ? ci.size : null }; go('codyMake', { sl, prev, from: 'cart', season: codySeason(p) }) }) },
  // 장바구니 맨 위 바: 장바구니 첫 상품 1개만 바닥에 놓고, 나머지 칸은 내 옷장 옷으로 (새 옷 1벌 + 내 옷)
  codyCartAll() { need('로그인하면 내 옷장 옷이랑 맞춰 볼 수 있어요', () => { closeOv(); S.toast = null; const c = S.cart.find((x) => PB[x.pid] && CODY_SLOT.includes(PB[x.pid].cat)), sl = codyDefault(c ? codySeason(PB[c.pid]) : 'long'), prev = {}; if (c) { const k = PB[c.pid].cat; prev[k] = sl[k]; sl[k] = { k: 'p', id: c.pid, size: c.size } } go('codyMake', { sl, prev, from: 'cart', season: c ? codySeason(PB[c.pid]) : 'long' }) }) },
  codyReg(k) { closeOv(); S.codyRet = { slot: k }; startReg(k, 'cody') },
  codyRegBack() { codyBack() },
  codyBgSet(k) { cur().p.bg = k; render() },
  codyPosReset() { const pp = cur().p; pp.pos = null; pp.ord = null; pp.sel = null; render() },
  // 바닥의 옷: 처음 누르면 맨 앞으로, 이미 맨 앞인 옷을 다시 누르면 아래 목록으로. 방금 끌어 옮긴 거면 아무것도 안 함
  codyTap(k) { if (codySkip) return; const pp = cur().p, again = pp.sel === k; codyFront(pp, k); render(); if (again) codyToPanel() },
  codySave() {
    const pp = cur().p, sv = pp.sv && CD().saved.find((q) => q.id === pp.sv);
    if (!CODY_SLOT.some((k) => pp.sl[k])) { toast('옷을 한 벌 이상 놓아 주세요'); render(); return }
    const tags = sv && sv.tags ? [...sv.tags] : [];
    sheet(''); Object.assign(S.ov, { mode: sv ? 'edit' : 'new', tags, n: 0, title: sv ? sv.name : codyTitleOf(pp.sl, tags[tags.length - 1]), node: sv ? '#19 맞춰 보기 · 수정 저장 → 이 코디에 저장 / 새 코디로 저장' : '#19 맞춰 보기 · 코디 저장 → 제목(자동 추천) · 태그' });
    codySaveSheet(); render();
  },
  // 태그를 누르면 넣고 빼고, 마지막에 고른 태그로 제목을 다시 추천
  codyTag(t) { const o = S.ov, i = o.tags.indexOf(t); if (i >= 0) o.tags.splice(i, 1); else o.tags.push(t); o.n = 0; o.title = codyTitleOf(codyCurSl(), o.tags[o.tags.length - 1], 0); codySaveSheet(true) },
  codyTitleNext() { const o = S.ov; o.n++; o.title = codyTitleOf(codyCurSl(), o.tags[o.tags.length - 1], o.n); codySaveSheet(true) },
  codySaveOk() {
    if (S.ov.mode === 'rename') { const q = CD().saved.find((x) => x.id === cur().p.id), o = S.ov; q.name = (o.title || '').trim() || q.name; q.tags = [...o.tags]; closeOv(); toast('이름과 태그를 바꿨어요'); render(); return }
    const edit = S.ov.mode === 'edit', pp = cur().p, o = S.ov, nm = (o.title || '').trim() || codyTitleOf(pp.sl, o.tags[o.tags.length - 1]), tags = [...o.tags];
    const sl = JSON.parse(JSON.stringify(pp.sl)), pos = pp.pos ? JSON.parse(JSON.stringify(pp.pos)) : null, bg = pp.bg || null, ord = pp.ord ? [...pp.ord] : null; let sv = pp.sv && CD().saved.find((q) => q.id === pp.sv);
    if (sv) Object.assign(sv, { name: nm, tags, sl, pos, bg, ord }); else { sv = { id: 'k' + (uid++), name: nm, tags, sl, pos, bg, ord }; CD().saved.unshift(sv); pp.sv = sv.id }
    if (edit) { closeOv(); nav.pop(); replace('codyView', { id: sv.id }); toast('코디를 수정했어요'); return } // 수정이면 상세로 돌아감
    closeOv(); toast(`'${esc(nm)}' 코디를 저장했어요<button class="tl" data-a="codyTab">코디 보기 ›</button>`); render();
  },
  codyCart() {
    const pp = { sl: codyCurSl() }, ps = CODY_SLOT.map((k) => pp.sl[k]).filter((r) => r && r.k === 'p' && !inCart(r.id));
    if (!ps.length) { go('cart'); return }
    sheet(''); Object.assign(S.ov, { mode: 'cart', items: ps.map((r) => { const p = PB[r.id], j = judge(p), ok = sizeKeys(p).filter((z) => !p.out.includes(z)); return { pid: r.id, size: r.size || (j.n === 5 ? j.rec : ok[0]), color: (p.colors || [])[0] || null, qty: 1 } }), node: '#19 맞춰 보기 · 장바구니 담기 → 옵션 확인 시트(추천 사이즈 미리 고름)' });
    codyOptSheet(); render();
  },
  codyOptCart() {
    const its = S.ov.items.map((it) => ({ ...it })), pp = { sl: codyCurSl() };
    its.forEach((it) => S.cart.push({ pid: it.pid, size: it.size, color: it.color, qty: it.qty }));
    CODY_SLOT.forEach((k) => { const r = pp.sl[k], it = r && r.k === 'p' && its.find((q) => q.pid === r.id); if (it) r.size = it.size });
    closeOv(); toast(`장바구니에 담았어요 · ${its.reduce((a, it) => a + it.qty, 0)}개`); render();
  },
  // 저장한 코디 수정: 같은 코디를 맞춰 보기 화면에서 고침. 들어올 때의 배치를 기억해 두고, 바뀐 채로 나가면 확인
  codyModify(id, patch) { const q = CD().saved.find((v) => v.id === id); if (!q) return; const sl = JSON.parse(JSON.stringify(q.sl)), pos = q.pos ? JSON.parse(JSON.stringify(q.pos)) : null, ord = q.ord ? [...q.ord] : null;
    const pp = { sl, pos, bg: q.bg, ord, tags: [...(q.tags || [])], sv: id, from: 'closet' }; pp.snap = codySnap(pp); if (patch) patch(pp); closeOv(); go('codyMake', pp) },
  // 상세에서 고른 추천 상품을 놓고 수정 화면으로. 원래 그 자리 옷을 기억해 둬서 다시 누르면 돌아감
  codyRecModify(x) { const [id, k, pid] = x.split('|'), j = judge(PB[pid]); A.codyModify(id, (pp) => { pp.sl[k] = { k: 'p', id: pid, size: j.n === 5 ? j.rec : null }; pp.prev = { [k]: q0(id, k) }; pp.ord = [...codyOrdOf(pp.ord).filter((v) => v !== k), k]; pp.sel = k; pp.ct = k }); codyToPanel() },
  codyLeave() { const pp = cur().p; if (pp.sv && pp.snap && pp.snap !== codySnap(pp)) { modal(`<h4>수정한 내용을 저장하지 않고 나갈까요?</h4><p>나가면 바꾼 배치와 옷이 사라지고, 저장한 코디는 그대로 남아요</p><div class="mb"><button class="btn line" data-a="closeOv">계속 수정</button><button class="btn" data-a="codyLeaveOk">나가기</button></div>`); S.ov.node = '#19 맞춰 보기 · 수정 중 나가기 확인'; render(); return } back() },
  codyLeaveOk() { closeOv(); back() },
  codySaveNew() { const pp = cur().p, o = S.ov, nm = (o.title || '').trim() || codyTitleOf(pp.sl, o.tags[o.tags.length - 1]);
    const sv = { id: 'k' + (uid++), name: nm, tags: [...o.tags], sl: JSON.parse(JSON.stringify(pp.sl)), pos: pp.pos ? JSON.parse(JSON.stringify(pp.pos)) : null, bg: pp.bg || null, ord: pp.ord ? [...pp.ord] : null };
    CD().saved.unshift(sv); closeOv(); nav.pop(); replace('codyView', { id: sv.id }); toast(`'${esc(nm)}' 새 코디로 저장했어요. 원래 코디도 그대로 있어요`) },
  codyMore(id) { const q = CD().saved.find((v) => v.id === id);
    sheet(`<div class="grab"></div><div style="font-size:16px;font-weight:800;margin-bottom:6px">${esc(q.name)}</div><div class="cf-menu"><button data-a="codyRename" data-x="${id}">이름 · 태그 바꾸기</button><button data-a="codyCopy" data-x="${id}">새 코디로 복사해서 맞춰 보기</button><button class="del" data-a="codyDel" data-x="${id}">삭제</button></div>`); S.ov.node = '#19 맞춰 보기 · 저장한 코디 ⋯ 메뉴'; render() },
  codyRename(id) { const q = CD().saved.find((v) => v.id === id); closeOv(); sheet(''); Object.assign(S.ov, { mode: 'rename', tags: [...(q.tags || [])], n: 0, title: q.name, node: '#19 맞춰 보기 · 이름 · 태그 바꾸기' }); codySaveSheet(); render() },
  codyItem(id) { go('item', { id }) },
  codyRecTab(k) { cur().p.rk = k; render() },
  // 바닥에 놓인 장바구니 상품 → 옵션 확인 시트 → 주문
  codyOrder() {
    const pp = { sl: codyCurSl() }, ids = CODY_SLOT.map((k) => pp.sl[k]).filter((r) => r && r.k === 'p').map((r) => r.id), its = S.cart.filter((c) => ids.includes(c.pid));
    if (!its.length) return;
    need('로그인하면 주문하고, 산 옷이 옷장에 담겨요', () => { closeOv(); sheet(''); Object.assign(S.ov, { items: its.map((c) => ({ pid: c.pid, size: c.size, color: c.color || (PB[c.pid].colors || [])[0] || null, qty: c.qty || 1 })), node: '#19 맞춰 보기 · 주문하기 → 옵션 확인 시트(컬러 · 사이즈 · 수량)' }); codyOptSheet(); render() });
  },
  codyOptSize(x) { const [i, k] = x.split('|'); S.ov.items[+i].size = k; codyOptSheet(true) },
  codyOptColor(x) { const [i, c] = x.split('|'); S.ov.items[+i].color = c; codyOptSheet(true) },
  codyOptQty(x) { const [i, d] = x.split('|'), it = S.ov.items[+i]; it.qty = Math.max(1, it.qty + +d); codyOptSheet(true) },
  codyOptOk() {
    const its = S.ov.items.map((it) => ({ ...it }));
    its.forEach((it) => { const c = S.cart.find((q) => q.pid === it.pid); if (c) Object.assign(c, { size: it.size, color: it.color, qty: it.qty }) }); // 바꾼 옵션은 장바구니에도
    const pp = { sl: codyCurSl() }; CODY_SLOT.forEach((k) => { const r = pp.sl[k], it = r && r.k === 'p' && its.find((q) => q.pid === r.id); if (it) r.size = it.size });
    closeOv(); go('order', { items: its.map((it) => ({ ...it })) });
  },
  codyTab() { closeOv(); S.toast = null; go('cody') },
  // 내 옷장에서 시작하는 코디: 내 옷으로만 채우고, 아래 목록도 내 옷 먼저
  codyNew() { go('codyMake', { sl: codyDefault(), from: 'closet' }) },
  codyEdit(id) { if (CD().saved.some((x) => x.id === id)) go('codyView', { id }) },
  codyCopy(id) { closeOv(); const q = CD().saved.find((x) => x.id === id); if (q) go('codyMake', { sl: JSON.parse(JSON.stringify(q.sl)), pos: q.pos ? JSON.parse(JSON.stringify(q.pos)) : null, bg: q.bg, ord: q.ord ? [...q.ord] : null, tags: [...(q.tags || [])], from: 'closet' }) },
  codyDel(id) { closeOv(); const q = CD().saved.find((x) => x.id === id); modal(`<h4>이 코디를 삭제할까요?</h4><p>'${esc(q.name)}'${jo(q.name, '은', '는')} 삭제하면 되돌릴 수 없어요</p><div class="mb"><button class="btn line" data-a="closeOv">취소</button><button class="btn" data-a="codyDelOk" data-x="${id}">삭제</button></div>`); S.ov.node = '#19 맞춰 보기 · 저장한 코디 삭제 확인'; render() },
  codyDelOk(id) { const s = CD(); s.saved = s.saved.filter((x) => x.id !== id); closeOv(); back(); toast('코디를 삭제했어요') },
  // 아래 목록: 자리 탭 바꾸기 · 옷 누르면 그 칸만 바꾸기
  codyCt(x) { const [k, go2] = x.split('|'); cur().p.ct = k; render(); if (go2) codyToPanel() },
  codyClear(k) { const pp = cur().p; pp.sl[k] = null; pp.sel = null; render() },
  // 장바구니 상품 · 추천 상품 놓기. 같은 걸 다시 누르면 원래 놓였던 옷으로 돌아감
  codyPut(x) { const [k, id] = x.split('|'), pp = cur().p, now = pp.sl[k], ci = inCart(id), j = judge(PB[id]); pp.prev = pp.prev || {};
    if (now && now.k === 'p' && now.id === id) { pp.sl[k] = pp.prev[k] || null; codyFront(pp, k); render(); return }
    if (now && now.k === 'c') pp.prev[k] = now; else if (!now) pp.prev[k] = pp.prev[k] || null;
    pp.sl[k] = { k: 'p', id, size: ci ? ci.size : j.n === 5 ? j.rec : null }; codyFront(pp, k); render() },
  codyMine(x) { const [k, id] = x.split('|'), pp = cur().p; pp.sl[k] = { k: 'c', id }; pp.prev = pp.prev || {}; pp.prev[k] = pp.sl[k]; codyFront(pp, k); render() },
});

// 테스트 버튼용: 사진 있는 내 옷으로 저장한 코디 n개 (상의 · 하의, 첫 번째는 아우터까지)
function sampleSaved(n) {
  const of = (cat) => S.closet.filter((c) => c.cat === cat && c.fit === 'good' && c.img), T = of('top'), B = of('bottom'), O = of('outer'), tg = ['출근', '주말', '약속'], out = [];
  for (let i = 0; i < n && T[i] && B[i % B.length]; i++) {
    const sl = { outer: i === 0 && O[0] ? { k: 'c', id: O[0].id } : null, top: { k: 'c', id: T[i].id }, bottom: { k: 'c', id: B[i % B.length].id } };
    out.push({ id: 'k' + (uid++), name: codyTitleOf(sl, tg[i]), tags: [tg[i]], sl, pos: null, bg: CODY_BG[i % CODY_BG.length][0], ord: null });
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
