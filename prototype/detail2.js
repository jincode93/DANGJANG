/* ── 치수 칸 · 그룹 · 기준 옷 공통 규칙 (상세 v2 기준, 2단계) ──
   세부 종류: 15종 (통합본은 한글 이름 '긴팔 셔츠'로 저장, 상세 v2 키 'shirt-l'과 1:1)
   그룹: 8개 (긴팔 상의 · 반팔 상의 · 짧은/긴 아우터 · 긴바지/반바지 · 긴치마/짧은 치마) — 재는 부위가 같은 세부 종류끼리
   치수(m): 그룹 칸(GPARTS) 순서 배열. 재지 않은 칸은 null/0 → 비교 · 사이즈표에서 뺌
   기준 옷: 그룹마다 하나 (+ 내 옷장의 세부 종류 기준은 선택). 다른 그룹 옷끼리는 비교하지 않음 */
const SUBK = Object.fromEntries(Object.entries(SUBS).map(([k, v]) => [v.n, k])); // 한글 세부 종류 → v2 키
const subOf = (x) => SUBS[x.sub] ? x.sub : SUBK[x.sub] || SUB_DEFAULT[x.cat];
const grpOf = (x) => SUBS[subOf(x)].g;
const partsOf = (x) => GPARTS[grpOf(x)];
const GN = (x) => GROUP_N[grpOf(x)]; // 그룹 이름 (기준 옷 문구용)
const famOf = (p) => ofCat(p.cat).filter((c) => grpOf(c) === grpOf(p)); // 같은 그룹의 내 옷
// 기준 옷: baseOf('top') = 그 종류의 아무 기준 옷(있는지 확인용) · baseOf(옷/상품) = 같은 그룹의 기준 옷
const baseOf = (x) => typeof x === 'string' ? S.closet.find((c) => c.cat === x && c.base) : S.closet.find((c) => c.base && c.cat === x.cat && grpOf(c) === grpOf(x));
const gArr = (x, m) => partsOf(x).map((_, i) => m && +m[i] > 0 ? +m[i] : null); // 빈 칸은 null로
const remapM = (from, m, to) => to.map((k) => { const i = from.indexOf(k); return i >= 0 && m && m[i] != null ? m[i] : ''; }); // 부위 이름으로 칸 옮기기

// 옷 등록 화면의 치수 칸 묶음(pk) = 그룹. 종류만 골랐을 땐 그 종류의 기본 그룹
const PARTS = Object.assign({}, GPARTS, { top: GPARTS['top-l'], outer: GPARTS['outer-s'], bottom: GPARTS['pants-l'], skirt: GPARTS['skirt-l'] });
const NEED = Object.fromEntries(Object.keys(PARTS).map((k) => [k, /pants|skirt|bottom/.test(k) ? ['허리', '총장'] : ['총장', '가슴']])); // 꼭 적어야 하는 칸 (나머지는 비워도 등록)
const pkOf = (cat, sub) => grpOf({ cat, sub });
function setPk(r) { // 세부 종류가 바뀌어 치수 칸이 달라지면, 이미 적은 값은 부위 이름으로 옮겨 담음
  const k = pkOf(r.cat, r.sub), was = PARTS[r.pk || r.cat], now = PARTS[k]; r.pk = k;
  if (was.join() === now.join()) return;
  r.m = r.m ? remapM(was, r.m, now) : null; r.est = null; r.full = null; r.tbl = r.srv ? srvTbl(r.srv, k) : r.tbl; regFill();
}

// 옛 형식(옷 등록 버전 칸: 상의 4 · 바지 5 · 치마 4) → 그룹 칸. est면 늘어난 칸을 상세 v2 데이터 비율의 예시 값으로 채움
const OLDP = { top: ['총장', '어깨', '가슴', '소매'], outer: ['총장', '어깨', '가슴', '소매'], bottom: ['허리', '밑위', '허벅지', '인심', '총장'], skirt: ['허리', '엉덩이', '총장', '밑단'] };
function fromLegacy(x, arr, est) {
  const skirt = x.cat === 'bottom' && /치마/.test(x.sub || ''), v = {};
  (OLDP[skirt ? 'skirt' : x.cat] || OLDP.top).forEach((k, i) => { if (arr && +arr[i] > 0) v[k] = +arr[i]; });
  if (est) {
    const g = grpOf(x);
    if (g === 'top-s') { if (v.어깨 && v.소매) v.전체소매 = Math.round((v.어깨 / 2 + v.소매) * 2) / 2; if (v.가슴) Object.assign(v, { 밑단: v.가슴 - 2, 소매부리: Math.round(v.가슴 * 0.33), 암홀: Math.round(v.가슴 * 0.4) }); }
    else if (x.cat !== 'bottom') { if (v.가슴) Object.assign(v, { 밑단: v.가슴 - 2, 소매부리: Math.round(v.가슴 * 0.21), 암홀: Math.round(v.가슴 * 0.43) }); }
    else if (!skirt) { if (v.허리) v.엉덩이 = v.허리 + 10; if (v.허벅지) v.밑단 = Math.round(v.허벅지 * 0.63); }
  }
  return partsOf(x).map((k) => v[k] ?? null);
}
function legacyOf(c) { // 내 옷장 실루엣(옛 칸 순서로 그림)용: 상의 [총장, 어깨, 가슴, 소매] · 하의 [허리, 밑위, 허벅지, -, 총장]
  const v = {}; partsOf(c).forEach((k, i) => { if (c.m && +c.m[i] > 0) v[k] = +c.m[i]; });
  if (c.cat === 'bottom') { const t = v.허벅지 || (v.엉덩이 ? v.엉덩이 * 0.62 : 0); return v.허리 && t && v.총장 ? [v.허리, v.밑위 || 28, t, 0, v.총장] : null; }
  const sh = v.어깨 || (v.가슴 ? v.가슴 * 0.9 : 0), sl = v.소매 || (v.전체소매 ? v.전체소매 - sh / 2 : 20);
  return v.총장 && v.가슴 ? [v.총장, sh, v.가슴, sl] : null;
}
function ensureBases() { // 그룹마다 기준 옷 하나: 없으면 먼저 등록한 잘 맞는 옷, 둘 이상이면 먼저 등록한 옷만 남김
  for (const c of S.closet) if (c.fit !== 'good') { c.base = false; c.subBase = false }
  const good = S.closet.filter((c) => c.fit === 'good').sort((a, b) => a.at - b.at), seen = {};
  good.forEach((c) => { if (c.base) { if (seen[grpOf(c)]) c.base = false; else seen[grpOf(c)] = c } });
  good.forEach((c) => { if (!seen[grpOf(c)]) { c.base = true; seen[grpOf(c)] = c } });
}
