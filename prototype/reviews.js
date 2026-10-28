/* ── 스냅·후기 (시연용 예시) ──
   무신사 후기 형식(키 · 몸무게 · 평소 사이즈 · 구매 사이즈 · 사이즈 평가 · 짧은 소감)을 본떠 새로 쓴 예시예요. 실제 후기를 옮겨 오지 않았어요.
   상품마다 RV_RUNS(작게 나옴 -1 · 정사이즈 0 · 크게 나옴 +1)로 평가 경향을 정하고, 씨앗값이 고정된 난수로 매번 같은 후기를 만들어요.
   p14는 후기가 "작게 나와요" 쪽으로 쏠린 예시. 유저테스트 조건용 데이터(신상 후기 2개 등)는 testmode.js 에 있음 */
const RV_FIT = ['작아요', '딱 맞아요', '커요'];
const RV_RUNS = { p16: 1, p1: 1, p4: 1, p12: 1, p13: -1, p14: -1 };
const RV_N = { p15: 28, p14: 26 }; // 목록에 보여 줄 예시 후기 수 (기본 18). 화면의 후기 수는 상품의 rev 값
const RV_ONLY = {}; // 고정 후기만 있는 상품 (신상). 유저테스트 빌드에서 채움 (testmode.js)
const RV_FIX = { // 맨 앞에 고정하는 후기
  p15: [
    { id: 'jh***', h: 177, w: 71, u: 'L', b: 'L', fit: 1, star: 5, len: '적당해요', text: '평소 L 입는데 L 샀어요. 어깨선 딱 맞고 기장은 빼 입기 좋은 정도예요. 원단이 생각보다 두툼해서 가을에 셔츠 하나로 입기 좋아요' },
    { id: 'yoon***', h: 172, w: 64, u: 'M', b: 'M', fit: 1, star: 5, len: '적당해요', text: '사이즈표 보고 M 샀는데 정사이즈예요. 소매만 살짝 길어서 한 번 접어요. 워싱 색감이 사진이랑 거의 같아요' },
    { id: 'ks_***', h: 183, w: 82, u: 'XL', b: 'L', fit: 0, star: 4, len: '짧아요', text: 'XL를 찾다가 없어서 L 샀는데 가슴이 좀 끼어요. 단추 잠그면 당기는 느낌이라 열고 입어요. 평소 XL면 L은 비추예요' },
  ],
  p14: [
    { id: 'tae***', h: 175, w: 70, u: '30', b: '30', fit: 0, star: 4, len: '적당해요', text: '평소 30인데 30 샀더니 허리가 꽉 껴요. 한 사이즈 크게 사세요. 핏 자체는 예뻐요' },
    { id: 'sj***', h: 178, w: 73, u: '30', b: '32', fit: 1, star: 5, len: '길어요', text: '작게 나온다는 후기 보고 32 샀는데 허리는 딱 맞아요. 기장이 좀 길어서 한 번 접어 입어요' },
    { id: 'hyun***', h: 170, w: 66, u: '29', b: '30', fit: 0, star: 4, len: '적당해요', text: '평소 29라서 넉넉하게 30 샀는데도 허벅지가 좁아요. 앉으면 조금 불편해요' },
  ],
};
const RV_TXT = {
  top: [
    ['어깨가 좀 끼는 편이에요', '평소 사이즈로 샀는데 품이 생각보다 작아요', '팔 들 때 겨드랑이가 당겨요', '한 사이즈 크게 살 걸 그랬어요', '기장이 짧아서 넣어 입어야 해요'],
    ['평소 사이즈 그대로 샀는데 딱 맞아요', '어깨선이 정확히 맞아서 깔끔해요', '기장도 적당해서 빼 입어도 괜찮아요', '품이 너무 크지도 작지도 않아요', '사이즈표대로 와요'],
    ['품이 넉넉해서 오버핏으로 입어요', '소매가 길어서 한 번 접어 입어요', '기장이 길어서 엉덩이를 덮어요', '한 사이즈 내려도 될 것 같아요', '어깨가 많이 내려와요'],
  ],
  bottom: [
    ['허리가 타이트해요', '허벅지가 꽉 껴요', '평소 사이즈보다 작게 나와요', '앉을 때 허리가 불편해요', '한 사이즈 크게 사세요'],
    ['허리 딱 맞아요', '기장 수선 없이 입었어요', '허벅지 핏이 적당해요', '평소 입던 사이즈 그대로 맞아요'],
    ['허리가 남아서 벨트를 해요', '기장이 길어서 한 번 접었어요', '통이 생각보다 넓어요', '한 사이즈 내려도 될 것 같아요'],
  ],
  outer: [
    ['안에 니트 입으면 팔이 좀 끼어요', '어깨가 딱 붙는 편이에요', '기장이 짧은 편이에요', '두꺼운 옷은 안에 못 입겠어요'],
    ['안에 후드티 입어도 여유 있어요', '어깨 맞고 기장도 적당해요', '평소 사이즈로 샀는데 잘 맞아요', '정사이즈로 사면 돼요'],
    ['오버핏이라 많이 커요', '소매가 손등까지 덮어요', '한 사이즈 내려도 충분해요', '부해 보일 정도로 넉넉해요'],
  ],
  down: ['크게 나온다는 후기 보고 한 사이즈 작게 샀어요', '후기 보고 한 치수 내렸어요'],
  up: ['작게 나온다는 후기 보고 한 사이즈 올렸어요', '불안해서 한 치수 크게 샀어요'],
  etc: { top: ['색감이 사진이랑 거의 같아요', '세탁 후에도 줄지 않았어요', '원단이 탄탄해요', '가격 대비 만족해요', '재구매 의사 있어요'],
    bottom: ['색이 예뻐요', '원단이 너무 두껍지 않아서 좋아요', '세탁해도 물 빠짐이 거의 없어요', '가격 대비 만족해요'],
    outer: ['생각보다 가벼워요', '바람 잘 막아요', '배송 빨랐어요', '지퍼가 부드러워요', '보온이 좋아요'] },
};
const RV_ID = ['jh', 'mk', 'sy', 'dh', 'yj', 'hw', 'tk', 'js', 'min', 'seo', 'woo', 'ha', 'jun', 'eun', 'gy'];
function rvRand(seed) { // 씨앗값 고정 난수 (mulberry32)
  let a = 0; for (const ch of seed) a = (a * 31 + ch.charCodeAt(0)) | 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const rvDate = (i) => { const d = new Date(2026, 9, 21 - Math.floor(i * 2.3)); return { t: +d, date: `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}` }; };
const RV_CACHE = {};
function reviewsOf(p) {
  if (RV_CACHE[p.id]) return RV_CACHE[p.id];
  const fix = (RV_FIX[p.id] || []).map((r, i) => Object.assign({ i, help: 24 - i * 5, len: '적당해요' }, rvDate(i), r));
  if (RV_ONLY[p.id]) return (RV_CACHE[p.id] = fix);
  const R = rvRand(p.id), pick = (a) => a[Math.floor(R() * a.length)];
  const bot = p.cat === 'bottom', ladder = bot ? ['28', '29', '30', '31', '32', '34'] : ['S', 'M', 'L', 'XL', '2XL'];
  const usualW = bot ? [20, 15, 30, 15, 15, 5] : [15, 35, 35, 13, 2], keys = sizeKeys(p).filter((k) => ladder.includes(k));
  const H = bot ? [167, 170, 174, 177, 180, 183] : [165, 171, 176, 181, 185], Wt = bot ? [60, 64, 69, 74, 79, 86] : [57, 65, 72, 80, 88];
  const runs = RV_RUNS[p.id] || 0, n = RV_N[p.id] || 18, T = RV_TXT[p.cat], out = fix.slice();
  for (let i = out.length; i < n; i++) {
    let r = R() * 100, u = 0; while (u < usualW.length - 1 && r > usualW[u]) { r -= usualW[u]; u++; }
    const woman = p.cat === 'outer' && R() < 0.25; if (woman) u = Math.max(0, u - 1);
    // 산 사이즈: 크게 나오는 상품은 한 치수 내려 사는 사람이, 작게 나오는 상품은 올려 사는 사람이 많음
    const d0 = runs > 0 ? (R() < 0.4 ? -1 : 0) : runs < 0 ? (R() < 0.45 ? 1 : 0) : (R() < 0.12 ? (R() < 0.5 ? -1 : 1) : 0);
    const want = u + d0, b = keys.reduce((best, k) => Math.abs(ladder.indexOf(k) - want) < Math.abs(ladder.indexOf(best) - want) ? k : best, keys[0]);
    const d = ladder.indexOf(b) - u;
    let eff = runs + d; if (R() < 0.15) eff += R() < 0.5 ? -1 : 1;
    const fit = eff < 0 ? 0 : eff > 0 ? 2 : 1;
    const say = []; if (d < 0) say.push(pick(RV_TXT.down)); else if (d > 0) say.push(pick(RV_TXT.up));
    const pool = T[fit].slice(); say.push(pool.splice(Math.floor(R() * pool.length), 1)[0]); if (R() < 0.55) say.push(pool[Math.floor(R() * pool.length)]);
    if (R() < 0.7) say.push(pick(RV_TXT.etc[p.cat]));
    const len = fit === 0 ? (R() < 0.5 ? '짧아요' : '적당해요') : fit === 2 ? (R() < 0.5 ? '길어요' : '적당해요') : (R() < 0.15 ? '길어요' : '적당해요');
    out.push(Object.assign({ i, id: pick(RV_ID) + (R() < 0.3 ? '_' : '') + '***', woman, h: woman ? 158 + Math.round(R() * 10) : H[u] + Math.round(R() * 6 - 3),
      w: woman ? 48 + Math.round(R() * 10) : Wt[u] + Math.round(R() * 8 - 4), u: ladder[u], b, fit, star: R() < 0.78 ? 5 : 4, len,
      thick: R() < 0.6 ? '적당해요' : '두꺼워요', help: Math.floor(R() * 18), text: say.join('. ') }, rvDate(i)));
  }
  return (RV_CACHE[p.id] = out);
}
const rvSum = (list) => { const c = [0, 0, 0]; list.forEach((r) => c[r.fit]++); const n = list.length || 1; return c.map((v) => Math.round(v * 100 / n)); };
const rvStars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
const rvWho = (r) => `${r.woman ? '여성 · ' : ''}${r.h}cm · ${r.w}kg · 평소 ${r.u} · <b>${r.b} 구매</b>`;
const rvCard = (p, r) => `<button class="rv-card" data-a="revItem" data-x="${p.id}|${r.i}"><span class="rv-top"><span class="rv-star">${rvStars(r.star)}</span><span>${r.id} · ${r.date}</span></span><span class="rv-body">${rvWho(r)}</span><span class="rv-fit f${r.fit}">사이즈 ${RV_FIT[r.fit]}</span><span class="rv-txt clamp">${r.text}</span></button>`;
function rvBars(list) {
  const s = rvSum(list), mx = Math.max(...s);
  return `<div class="rv-bars">${RV_FIT.map((t, k) => `<div class="rv-bar f${k} ${s[k] === mx ? 'top' : ''}"><span>${t}</span><i><b style="width:${s[k]}%"></b></i><em class="num">${s[k]}%</em></div>`).join('')}</div>`;
}
const rvScore = (p) => `<div class="rv-score"><b class="num">${p.rate}</b><span>${rvStars(Math.round(p.rate))}</span><small>후기 ${won(p.rev)}개</small></div>`;
const rvBase = (p) => S.user && !(typeof TEST !== 'undefined' && TEST && TEST.nocmp) ? baseFor(p) : null; // 내 평소 사이즈 = 이 종류 기준 옷의 사이즈
function revSection(p) { // 상품 상세의 스냅·후기 영역
  const list = reviewsOf(p), b = rvBase(p), few = list.length < 5, mine = b ? list.filter((r) => r.u === b.size) : [];
  const head = `<div class="pd-title"><h2>스냅·후기<span class="rv-cnt num">${won(p.rev)}</span></h2>${list.length ? `<button class="pd-sub hit" data-a="revAll" data-x="${p.id}" style="display:flex;align-items:center">전체 보기${I.chev}</button>` : ''}</div>`;
  if (!list.length) return `<section class="pd-size rv" id="s_rev">${head}<div class="rv-note">아직 후기가 없어요. 첫 후기를 남겨 주세요</div></section>`;
  return `<section class="pd-size rv" id="s_rev">${head}
    ${few ? `<div class="rv-note">신상품이라 후기가 아직 ${list.length}개예요. 사이즈 평가는 후기가 더 모이면 보여 드려요</div>` : `<div class="rv-sum">${rvScore(p)}${rvBars(list)}</div>`}
    ${b && !few ? `<button class="rv-mine" data-a="revAll" data-x="${p.id}|mine"><span>평소 <b>${b.size}</b> 입는 사람의 후기 ${mine.length}개<small>내 ${CAT[p.cat]} 기준 옷(${b.name})이 ${b.size} 사이즈예요</small></span>${I.chev}</button>` : ''}
    <div class="rv-list">${list.slice(0, 3).map((r) => rvCard(p, r)).join('')}</div>
    ${few ? '' : `<button class="btn pd-cta line" data-a="revAll" data-x="${p.id}">후기 ${won(p.rev)}개 전체 보기</button>`}</section>`;
}
SCR.reviews = (pp) => {
  const p = PB[pp.id], all = reviewsOf(p), b = rvBase(p), sz = pp.sz || '전체', mine = !!(pp.mine && b), sort = pp.sort || '추천순', few = all.length < 5;
  const list = all.filter((r) => (sz === '전체' || r.b === sz) && (!mine || r.u === b.size)).sort(sort === '최신순' ? (x, y) => y.t - x.t : (x, y) => y.help - x.help);
  const rows = sizeKeys(p).map((k) => { const l = all.filter((r) => r.b === k); if (!l.length) return ''; const s = rvSum(l);
    return `<tr><th>${k}</th><td class="num">${l.length}명</td><td><span class="rv-stack">${s.map((v, i) => `<i class="f${i}" style="width:${v}%"></i>`).join('')}</span></td><td class="num">${s[1]}%</td></tr>`; }).join('');
  return { node: `② 상품 상세 · 스냅·후기 → 전체 후기 (구매 사이즈 · 평소 사이즈로 거르기)${few ? ' · 후기 적음' : ''}`, body: `${hdrBack('후기 ' + won(p.rev))}
    <div class="rv-pg">${few ? `<div class="rv-note">신상품이라 후기가 아직 ${all.length}개예요. 사이즈 평가는 후기가 더 모이면 보여 드려요</div>` : `<div class="rv-sum">${rvScore(p)}${rvBars(all)}</div>
      <div class="rv-tbl"><div class="rv-tt">구매 사이즈별 평가<small>오른쪽 숫자는 '딱 맞아요' 비율</small></div><table>${rows}</table>
      <div class="rv-legend">${RV_FIT.map((t, i) => `<span><i class="f${i}"></i>${t}</span>`).join('')}</div></div>`}</div>
    <div class="chips">${['전체'].concat(sizeKeys(p)).map((k) => `<button class="chip ${k === sz ? 'on' : ''}" data-a="revSz" data-x="${k}">${k === '전체' ? '전체' : k + ' 구매'}</button>`).join('')}</div>
    ${b ? `<div style="padding:0 20px"><button class="rv-toggle ${mine ? 'on' : ''}" data-a="revMine">${mine ? '✓ ' : ''}평소 ${b.size} 입는 사람만 보기</button></div>` : ''}
    <div class="lhead"><span>후기 ${list.length}개</span><button class="sortbtn" data-a="revSort">${sort}</button></div>
    <div class="rv-list">${list.length ? list.map((r) => rvCard(p, r)).join('') : '<div class="rempty">조건에 맞는 후기가 없어요</div>'}</div>
    <p class="rv-foot">시연용 예시 후기 ${all.length}개를 보여 드려요</p>` };
};
SCR.review = (pp) => {
  const p = PB[pp.id], r = reviewsOf(p).find((x) => x.i === +pp.i), key = p.id + '|' + r.i, on = !!(S.helped && S.helped[key]);
  return { node: '② 상품 상세 · 스냅·후기 → 후기 상세', body: `${hdrBack('후기')}
    <div class="rv-d"><div class="rv-prod"><span class="pd-bimg"><img src="${IMG[p.img]}" alt=""></span><span><small>${p.brand}</small><b>${p.name}</b><em>구매 옵션 · ${r.b}</em></span></div>
      <div class="rv-top"><span class="rv-star">${rvStars(r.star)}</span><span>${r.id} · ${r.date}</span></div>
      <dl class="rv-spec"><dt>체형</dt><dd>${r.woman ? '여성 · ' : ''}${r.h}cm · ${r.w}kg</dd><dt>평소 사이즈</dt><dd>${r.u}</dd><dt>구매 사이즈</dt><dd>${r.b}</dd>
        <dt>사이즈</dt><dd class="f${r.fit}">${RV_FIT[r.fit]}</dd><dt>기장</dt><dd>${r.len}</dd>${p.cat === 'outer' ? `<dt>두께</dt><dd>${r.thick || '적당해요'}</dd>` : ''}</dl>
      <p class="rv-txt">${r.text}</p>
      <button class="rv-help ${on ? 'on' : ''}" data-a="revHelp" data-x="${key}">도움돼요 <span class="num">${r.help + (on ? 1 : 0)}</span></button></div>` };
};
//@@ACTIONS
Object.assign(A, {
  revAll(x) { const [id, m] = x.split('|'); go('reviews', { id, mine: m === 'mine' }) },
  revSz(k) { keepX('.chips', () => replace('reviews', Object.assign({}, cur().p, { sz: k }))) },
  revMine() { replace('reviews', Object.assign({}, cur().p, { mine: !cur().p.mine })) },
  revSort() { replace('reviews', Object.assign({}, cur().p, { sort: (cur().p.sort || '추천순') === '추천순' ? '최신순' : '추천순' })) },
  revItem(x) { const [id, i] = x.split('|'); go('review', { id, i: +i }) },
  revHelp(x) { S.helped = S.helped || {}; S.helped[x] = !S.helped[x]; saveY(); render() },
});
