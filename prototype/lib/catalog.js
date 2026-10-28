// 당장 상품 데이터 표준화 · 검증 (어느 쇼핑몰에서 온 데이터든 같은 규칙으로 걸러서 앱 형식으로 만듦)
// 입력: 쇼핑몰마다 다른 "사이즈 → { 부위이름: 값 }" 표 + 상품명 · 카테고리 글자
// 출력: 앱이 쓰는 형식(사이즈별 단면 cm 배열) + 문제 목록(issues). error 가 있으면 앱에 넣지 않음.
// 새 쇼핑몰을 붙일 때는 그 몰의 데이터를 rawTable 로 바꿔 normalizeProduct 에 넣기만 하면 됨 (어댑터는 shop.js).

export const PARTS = { top: ['총장', '어깨', '가슴', '소매'], outer: ['총장', '어깨', '가슴', '소매'], bottom: ['허리', '밑위', '허벅지', '인심', '총장'] };
export const SUBS = { top: ['긴팔 셔츠', '긴팔 티셔츠', '반팔 셔츠', '반팔 티셔츠', '후드티'], bottom: ['긴바지', '반바지'], outer: ['가디건', '점퍼/자켓', '숏코트', '롱코트', '숏패딩', '롱패딩'] };

// 부위 이름 → 앱의 부위. 위에서부터 먼저 맞는 것을 씀. circ: 이름에 '둘레'가 있으면 반으로 나눠 단면으로
const ALIASES = [
  [/소매부리|소매통|암홀|밑단|힙|엉덩이|목|넥|앞판|뒷판|손목|발목/, null], // 앱에서 쓰지 않는 부위
  [/^(소매|팔)(길이|장)?$|^소매기장$|^팔길이$/, '소매'],
  [/^(총장|총기장|전체길이|전체기장|기장|총길이|길이|전장)$/, '총장'],
  [/^어깨(너비|넓이|단면|폭)?$/, '어깨'],
  [/^(가슴|가슴단면|가슴너비|가슴둘레|가슴폭|품|겨드랑이단면)$/, '가슴'],
  [/^(허리|허리단면|허리둘레|허리폭|웨이스트)$/, '허리'],
  [/^(밑위|앞밑위|밑위길이|라이즈)$/, '밑위'],
  [/^(허벅지|허벅지단면|허벅지둘레|허벅지폭|허벅지너비)$/, '허벅지'],
  [/^(인심|안기장|인심길이|안다리길이|바지기장)$/, '인심'],
];
export function canonPart(name) {
  const n = String(name || '').replace(/[\s()\[\]·・_\-/]/g, '').replace(/cm$/i, '');
  if (!n) return null;
  const circ = /둘레/.test(n);
  for (const [re, part] of ALIASES) if (re.test(n)) return part ? { part, circ } : null;
  return null;
}

// 단면 cm 로서 있을 수 있는 값의 범위 (벗어나면 단위·둘레·오타를 의심)
const RANGE = { 총장: [35, 150], 어깨: [28, 75], 가슴: [35, 85], 소매: [10, 100], 허리: [24, 62], 밑위: [18, 48], 허벅지: [20, 48], 인심: [8, 95] };
const HALVE = new Set(['가슴', '허리', '허벅지']); // 둘레로 적는 일이 흔한 부위 (둘레 ÷ 2 = 단면)

// 사이즈 이름 정리와 정렬
const LADDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', 'XXXL', '3XL', '4XL', '5XL'];
export function normSize(label) {
  let s = String(label == null ? '' : label).trim().toUpperCase().replace(/\s+/g, '');
  if (!s) return null;
  if (/^(F|FREE|FR|ONE|ONESIZE|FREESIZE|프리|프리사이즈)$/.test(s)) return 'FREE';
  const WORD = { XSMALL: 'XS', EXTRASMALL: 'XS', SMALL: 'S', MEDIUM: 'M', LARGE: 'L', XLARGE: 'XL', EXTRALARGE: 'XL', XXLARGE: 'XXL', '2XLARGE': 'XXL', XXXLARGE: '3XL' }; if (WORD[s.replace(/-/g, '')]) return WORD[s.replace(/-/g, '')];
  s = s.replace(/\(.*?\)|\[.*?\]/g, ''); // S(95) → S
  if (/^\d+(\.\d+)?$/.test(s)) s = String(+s); // 085 → 85
  return s || null;
}
export function sizeRank(label) {
  const i = LADDER.indexOf(label); if (i >= 0) return [0, i === 7 ? 6.5 : i === 9 ? 8.5 : i];
  if (/^\d+(\.\d+)?$/.test(label)) return [1, +label];
  return [2, 0];
}
export const sortSizes = (labels) => labels.slice().sort((a, b) => { const x = sizeRank(a), y = sizeRank(b); return x[0] - y[0] || x[1] - y[1] || a.localeCompare(b); });

const num = (v) => { if (v == null) return null; const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^\d.]/g, '')); return isFinite(n) && n > 0 ? n : null; };

// "블랙 M" · "컴포트 L(50)" 처럼 색상·핏 이름이 붙은 사이즈를 { prefix, size } 로 나눔
const SIZE_TAIL = /^(.*?)(?<![A-Za-z0-9])(XXS|XS|XXL|XL|[2-5]XL|S|M|L|FREE|F|\d{1,3}(?:\.\d)?)\s*(?:\(\s*[\d.]+\s*\))?$/i;
export function splitLabel(label) { const m = String(label == null ? '' : label).trim().match(SIZE_TAIL); return m ? { prefix: m[1].replace(/[\s/·_-]+$/, '').trim(), size: m[2] } : { prefix: '', size: String(label).trim() }; }
// 같은 사이즈가 변형별로 여러 줄이면 첫 변형만 남김 (값이 모두 같으면 그대로 합침)
function pickVariant(rawTable, add) {
  const groups = new Map();
  for (const [lab, row] of Object.entries(rawTable || {})) { const { prefix, size } = splitLabel(lab); if (!groups.has(prefix)) groups.set(prefix, {}); groups.get(prefix)[size] = row; }
  if (groups.size <= 1) return [...groups.values()][0] || {};
  const same = [...groups.values()].every((g) => JSON.stringify(g) === JSON.stringify([...groups.values()][0]));
  const [firstKey, first] = [...groups.entries()][0];
  if (!same) add('info', 'variant', '변형(' + [...groups.keys()].map((k) => k || '기본').join(' · ') + ') 중 "' + (firstKey || '기본') + '" 만 씀');
  return first;
}

// 사이즈 한 줄 → 앱 부위 배열. 둘레는 단면으로 바꾸고, 바꾼 내용은 notes 에 적음
function normRow(cat, row, ctx) {
  const names = PARTS[cat], vals = {}, notes = [];
  for (const [k, raw] of Object.entries(row || {})) {
    const c = canonPart(k); if (!c) continue;
    let v = num(raw); if (v == null) continue;
    if (ctx.inch) v = +(v * 2.54).toFixed(1);
    if (c.circ) { v = +(v / 2).toFixed(1); notes.push(`${c.part}: 둘레 → 단면`); }
    else if (HALVE.has(c.part) && v > RANGE[c.part][1] && v / 2 >= RANGE[c.part][0] && v / 2 <= RANGE[c.part][1]) { v = +(v / 2).toFixed(1); notes.push(`${c.part}: 값이 커서 둘레로 보고 반으로 나눔`); }
    if (vals[c.part] != null && Math.abs(vals[c.part] - v) > 0.01) notes.push(`${c.part}: 같은 부위가 두 번 나와 앞의 값을 씀`); else vals[c.part] = v;
  }
  return { arr: names.map((n) => vals[n] ?? 0), notes };
}

// 사이즈표 전체 검사. 반환: { ok, sizes: { 사이즈: [부위 배열] }, issues: [{ level, code, msg }] }
export function normalizeSizes(cat, rawTable, opts = {}) {
  const issues = [], add = (level, code, msg) => issues.push({ level, code, msg });
  const names = PARTS[cat]; if (!names) return { ok: false, sizes: {}, issues: [{ level: 'error', code: 'cat', msg: '알 수 없는 종류 ' + cat }] };
  const byLabel = new Map();
  for (const [lab, row] of Object.entries(pickVariant(rawTable, add))) {
    const L = normSize(lab); if (!L) { add('warn', 'label', `사이즈 이름을 읽지 못해 뺌: ${lab}`); continue; }
    const r = normRow(cat, row, opts); r.notes.forEach((m) => add('info', 'fix', `${L} ${m}`));
    if (byLabel.has(L)) { add('warn', 'dup', `같은 사이즈가 두 번 나옴: ${L}`); continue; }
    byLabel.set(L, r.arr);
  }
  const labels = sortSizes([...byLabel.keys()]), sizes = {}; labels.forEach((l) => { sizes[l] = byLabel.get(l); });
  if (!labels.length) { add('error', 'empty', '읽을 수 있는 사이즈가 없음'); return { ok: false, sizes, issues }; }
  // 필수 부위: 상의 · 아우터 = 총장 · 어깨 · 가슴 중 둘 이상(가슴 포함), 하의 = 허리 + 총장 + 하나 더
  const has = (n) => labels.every((l) => sizes[l][names.indexOf(n)] > 0);
  const core = cat === 'bottom' ? ['허리', '총장'] : ['가슴', '총장'];
  for (const n of core) if (!has(n)) add('error', 'missing', `필수 부위 빠짐: ${n}`);
  if (cat !== 'bottom' && !has('어깨')) add('warn', 'missing', '어깨 실측이 없음 (어깨 비교는 빠짐)');
  if (cat === 'bottom' && !has('허벅지') && !has('밑위')) add('warn', 'missing', '허벅지 · 밑위 실측이 없음');
  if (cat === 'bottom' && !has('인심')) add('info', 'missing', '인심 실측이 없음 (인심 비교는 빠짐)');
  // 값 범위 · 사이즈 순서 · 간격
  names.forEach((n, i) => {
    const [lo, hi] = RANGE[n]; let prev = null, drops = 0;
    for (const l of labels) {
      const v = sizes[l][i]; if (!v) continue;
      const rng = n === '인심' && opts.sub === '반바지' ? [8, 40] : [lo, hi];
      if (v < rng[0] || v > rng[1]) add('error', 'range', `${l} ${n} ${v}cm 가 일반 범위(${rng[0]}~${rng[1]}) 밖`);
      if (prev != null) { if (v + 1.01 < prev) drops++; if (['어깨', '가슴', '허리', '허벅지'].includes(n) && Math.abs(v - prev) > 9) add('warn', 'step', `${n} 사이즈 간격이 큼 (${prev}→${v})`); }
      prev = v;
    }
    if (drops >= 2) add('error', 'order', `${n} 이 사이즈가 커지는데 줄어듦 (표가 잘못됐을 수 있음)`);
    else if (drops === 1) add('warn', 'order', `${n} 한 곳에서 사이즈 순서가 어긋남`);
  });
  if (labels.length === 1) add('info', 'single', '사이즈가 하나뿐');
  return { ok: !issues.some((x) => x.level === 'error'), sizes, issues };
}

// 출처 쇼핑몰의 1차 · 2차 분류 → 앱의 종류 · 세부 종류. 무신사 분류 이름을 기준으로 하고, 다른 몰도 비슷한 이름이면 같은 표를 씀
// sub 가 null 이면 이름과 실측 길이로 정함 (코트 · 패딩의 길이, 바지의 길이 등)
export const SRC_MAP = [
  [/후드\s?집업|집업|zip[\s-]?up/i, 'outer', '점퍼/자켓'], [/후드\s?티|후디|hood(ie|y)/i, 'top', '후드티'],
  [/맨투맨|스웨트|sweat/i, 'top', '긴팔 티셔츠'], [/니트|스웨터|knit/i, 'top', '긴팔 티셔츠'], [/셔츠|블라우스|shirt/i, 'top', null], [/반소매|반팔/, 'top', null], [/긴소매|긴팔/, 'top', null], [/피케|카라\s?티|폴로/, 'top', null], [/티셔츠|t-?shirt|tee/i, 'top', null],
  [/카디건|가디건|cardigan/i, 'outer', '가디건'], [/롱패딩|롱\s?헤비/, 'outer', '롱패딩'], [/숏패딩|숏\s?헤비|패딩|다운|푸퍼|puffer|down/i, 'outer', null], [/코트|coat/i, 'outer', null],
  [/블루종|ma-?1|재킷|자켓|점퍼|바람막이|아노락|야상|플리스|jacket|jumper|parka|파카/i, 'outer', '점퍼/자켓'], [/베스트|조끼|vest/i, 'outer', '점퍼/자켓'],
  [/숏\s?팬츠|반바지|쇼츠|shorts?/i, 'bottom', '반바지'], [/팬츠|바지|슬랙스|데님|조거|트레이닝|(^|\s)진(\s|$)|pants|jeans|denim|trousers/i, 'bottom', null],
];
const inLen = (sizes) => { const ks = sizes ? Object.keys(sizes) : []; return ks.length ? sizes[ks[Math.floor((ks.length - 1) / 2)]] : null; };
// 반환: { cat, sub, why: [] }. cat 은 종류를 이미 알면 넘겨서 확인용으로 씀
export function inferSub(cat0, { name = '', srcCat = '', sizes = null } = {}) {
  const why = [], mid = inLen(sizes);
  let cat = cat0, sub = null;
  for (const text of [srcCat, name]) { // 분류 이름 먼저, 없으면 상품명
    const hit = SRC_MAP.find(([re, c]) => re.test(text) && (!cat0 || c === cat0)); if (hit) { cat = hit[1]; sub = hit[2]; break; }
  }
  if (!cat) return { cat: null, sub: null, why: ['분류를 알 수 없음'] };
  const t = srcCat + ' ' + name, len = cat !== 'bottom' && mid ? mid[0] || null : null, sleeve = cat !== 'bottom' && mid ? mid[3] || 0 : 0;
  if (cat === 'top' && !sub) {
    const shirt = /셔츠|블라우스|shirt/i.test(srcCat) && !/티셔츠/.test(srcCat) || (!srcCat && /셔츠|shirt/i.test(name) && !/티셔츠|t-?shirt/i.test(name));
    const short = /반소매|반팔|1\/2|하프\s?슬리브|숏\s?슬리브|short\s?sleeve/i.test(t) && !/롱\s?슬리브|긴팔|긴소매/.test(t);
    sub = (short ? '반팔 ' : '긴팔 ') + (shirt ? '셔츠' : '티셔츠');
    if (sleeve && sleeve < 36 && !short) { sub = sub.replace('긴팔', '반팔'); why.push('소매 실측이 짧아 반팔로 정함'); }
    else if (sleeve && sleeve >= 36 && short) { sub = sub.replace('반팔', '긴팔'); why.push('소매 실측이 길어 긴팔로 정함'); }
  }
  if (cat === 'bottom') {
    const inseam = mid ? mid[3] : 0, tl = mid ? mid[4] : 0, shortBy = (inseam && inseam < 38) || (!inseam && tl && tl < 62);
    if (!sub) sub = shortBy ? '반바지' : '긴바지';
    if (shortBy && sub === '긴바지') { sub = '반바지'; why.push('인심이 짧아 반바지로 정함'); }
    else if (!shortBy && sub === '반바지' && ((inseam && inseam >= 55) || (tl && tl >= 85))) { sub = '긴바지'; why.push('길이가 길어 긴바지로 정함'); }
  }
  if (cat === 'outer' && !sub) {
    if (/패딩|다운|푸퍼|puffer|down|헤비/i.test(t)) sub = len && len >= 90 ? '롱패딩' : '숏패딩';
    else sub = len && len >= 100 ? '롱코트' : len ? '숏코트' : /롱|long/i.test(t) ? '롱코트' : '숏코트';
  } else if (cat === 'outer' && sub === '롱패딩' && len && len < 80) { sub = '숏패딩'; why.push('총장이 짧아 숏패딩으로 정함'); }
  return { cat, sub, why };
}

// 한 번에: 쇼핑몰 원본 → 앱 상품 조각. src = { name, srcCat, cat?, table, unit? }
export function normalizeProduct(src) {
  const cat = src.cat || inferSub(null, { name: src.name, srcCat: src.srcCat }).cat;
  if (!PARTS[cat]) return { ok: false, issues: [{ level: 'error', code: 'cat', msg: '종류를 알 수 없음' }] };
  let r = normalizeSizes(cat, src.table, { inch: src.unit === 'inch' });
  const { sub, why } = inferSub(cat, { name: src.name, srcCat: src.srcCat, sizes: r.sizes });
  if (cat === 'bottom' && sub === '반바지') r = normalizeSizes(cat, src.table, { inch: src.unit === 'inch', sub }); // 반바지는 인심 허용 범위가 다름
  why.forEach((m) => r.issues.push({ level: 'info', code: 'sub', msg: m }));
  return { ok: r.ok, cat, sub, sizes: r.sizes, issues: r.issues };
}
