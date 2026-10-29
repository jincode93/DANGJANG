const IMG0 = {"hero":"/api/asset?name=img/hero.jpg","base":"/api/asset?name=img/base.jpg","jacket":"/api/asset?name=img/jacket.jpg","slacks":"/api/asset?name=img/slacks.jpg","denim":"/api/asset?name=img/denim.jpg","knit":"/api/asset?name=img/knit.jpg","tee":"/api/asset?name=img/tee.jpg","pdHero":"/api/asset?name=img/pdHero.jpg","pdDetail":"/api/asset?name=img/pdDetail.jpg","ltee":"/api/asset?name=img/ltee.jpg","puffer":"/api/asset?name=img/puffer.jpg","leather":"/api/asset?name=img/leather.jpg","suede":"/api/asset?name=img/suede.jpg","lpuffer":"/api/asset?name=img/lpuffer.jpg","tee2":"/api/asset?name=img/tee2.jpg","blackp":"/api/asset?name=img/blackp.jpg","wide":"/api/asset?name=img/wide.jpg","m1":"/api/asset?name=img/m1.jpg","m2":"/api/asset?name=img/m2.jpg","oxford":"/api/asset?name=img/oxford.jpg","dshirt":"/api/asset?name=img/dshirt.jpg"};
const IMG = new Proxy(IMG0, { get: (t, k) => typeof k === 'string' && /^(data:|blob:|https?:|\/api\/)/.test(k) ? k : t[k] });
// 서버가 붙은 주소(일반 웹)에서만 켜짐. 아티팩트 안에서는 꺼진 채로 예전 흐름
const CUT = {"hero":"/api/asset?name=cut/hero.png","base":"/api/asset?name=cut/base.png","jacket":"/api/asset?name=cut/jacket.png","slacks":"/api/asset?name=cut/slacks.png","denim":"/api/asset?name=cut/denim.png","knit":"/api/asset?name=cut/knit.png","tee":"/api/asset?name=cut/tee.png","leather":"/api/asset?name=cut/leather.png","suede":"/api/asset?name=cut/suede.png","ltee":"/api/asset?name=cut/ltee.png","denim_k":"/api/asset?name=cut/denim_k.png","denim_i":"/api/asset?name=cut/denim_i.png","slacks_b":"/api/asset?name=cut/slacks_b.png","slacks_n":"/api/asset?name=cut/slacks_n.png"};
// 큰 data URI 사진은 blob URL로 바꿔 둠: 상품 카드 수백 개가 같은 사진을 써도 화면 문자열이 가벼워요
const toBlobUrl = (d) => { try { const c = d.indexOf(','), bin = atob(d.slice(c + 1)), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return URL.createObjectURL(new Blob([u], { type: d.slice(5, d.indexOf(';')) })) } catch (e) { return d } };
for (const o of [IMG0, CUT]) for (const k in o) if (typeof o[k] === 'string' && o[k].startsWith('data:image')) o[k] = toBlobUrl(o[k]);
/* ── 아이콘 ── */
const API = { on: false };
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
try { fetch('/api/ping', { cache: 'no-store' }).then((r) => r.ok ? r.json() : null).then((j) => { API.on = !!(j && j.ok); if (API.on && nav.length && nav[nav.length - 1].s === 'regLink') render(); }).catch(() => {}); } catch (e) {}
const SAMPLE = {"tee":"/api/asset?name=sample/tee.jpg","jeans":"/api/asset?name=sample/jeans.jpg","cap":"/api/asset?name=sample/cap.jpg","noa4":"/api/asset?name=sample/noa4.jpg"};
/* ── 아이콘 ── */
const sv = (d, s = 24, sw = 1.8) => `<svg class="ic" viewBox="0 0 24 24" width="${s}" height="${s}" style="width:${s}px;height:${s}px" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const I = {
  search: sv('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>'),
  bell: sv('<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'),
  bag: sv('<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>'),
  back: sv('<path d="M15 5l-7 7 7 7"/>'),
  home: sv('<path d="M4 11l8-6.5 8 6.5V20H4z"/>'),
  heart: sv('<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>'),
  heartF: `<svg class="ic" viewBox="0 0 24 24" width="24" height="24"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" fill="#F2382B"/></svg>`,
  close: sv('<path d="M6 6l12 12M18 6L6 18"/>'),
  more: sv('<circle cx="5.5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18.5" cy="12" r="1.2" fill="currentColor"/>'),
  grid: sv('<rect x="4.5" y="4.5" width="6" height="6" rx="1"/><rect x="13.5" y="4.5" width="6" height="6" rx="1"/><rect x="4.5" y="13.5" width="6" height="6" rx="1"/><rect x="13.5" y="13.5" width="6" height="6" rx="1"/>'),
  hanger: sv('<path d="M12 8.5a2 2 0 1 1 2-2"/><path d="M12 8.5v1L3.5 16.5h17L12 9.5"/>'),
  user: sv('<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>'),
  chev: sv('<path d="M9 5l7 7-7 7"/>', 18),
  link: sv('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  photo: sv('<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M20.5 16l-5-5-8.5 8"/>'),
  camera: sv('<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
  pen: sv('<path d="M15 5l4 4L8 20H4v-4z"/>'),
  check: sv('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 28, 2.4),
  plus: sv('<path d="M12 5v14M5 12h14"/>', 18, 2),
  top: sv('<path d="M8 4l-4.5 3 2 4 2-1V20h9V10l2 1 2-4L16 4c-.5 1.5-2 2.5-4 2.5S8.5 5.5 8 4z"/>', 26, 1.6),
  bottom: sv('<path d="M6.5 4h11l1.5 16h-5l-2-10-2 10H5z"/>', 26, 1.6),
  outer: sv('<path d="M8 4l-4.5 3 1 13h4V9M16 4l4.5 3-1 13h-4V9M8 4l4 6 4-6M12 10v10"/>', 26, 1.6),
  coupon: sv('<path d="M3.5 7.5h17v3a2 2 0 0 0 0 3v3h-17v-3a2 2 0 0 0 0-3z"/><path d="M14 8v8" stroke-dasharray="1.5 2"/>'),
  box: sv('<path d="M4 8l8-4 8 4v9l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v9"/>'),
  minus: sv('<path d="M6 12h12"/>', 20, 2),
  down: sv('<path d="M6 9.5l6 6 6-6"/>'),
  cart: sv('<circle cx="9" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/><path d="M2.5 3.5h3l2.2 11.5h11l2-8.5H6.4"/>'),
  gear: sv('<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6L18 18M6 18l1.4-1.4M16.6 7.4L18 6"/>'),
};
const SB = (c) => `<svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="${c}"/><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="${c}"/><rect x="10" y="3" width="3" height="9" rx="1" fill="${c}"/><rect x="15" y="0" width="3" height="12" rx="1" fill="${c}"/></svg><svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 11.5l2.2-2.6a3.2 3.2 0 0 0-4.4 0zM3.4 6.4a6.8 6.8 0 0 1 9.2 0l1.5-1.7a9.2 9.2 0 0 0-12.2 0zM.4 3.1a11 11 0 0 1 15.2 0L16 2.6" fill="${c}"/></svg><svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="22" height="12" rx="3.5" fill="none" stroke="${c}" opacity=".4"/><rect x="2" y="2" width="19" height="9" rx="2" fill="${c}"/></svg>`;

/* ── 데이터 ── */
const FOCUS = false; // 내 옷장 버전의 "옷장 집중 모드" (통합본에서는 끔)
const CAT = { top: '상의', bottom: '하의', outer: '아우터' };
const SUB = { top: ['긴팔 셔츠', '긴팔 티셔츠', '반팔 셔츠', '반팔 티셔츠', '후드티'], bottom: ['긴바지', '반바지', '긴치마', '짧은 치마'], outer: ['가디건', '점퍼/자켓', '숏코트', '롱코트', '숏패딩', '롱패딩'] };
// 무신사 세부 카테고리(판매처가 직접 고른 분류) → 우리 종류. 같은 분류 안에서 갈리는 것(셔츠 반팔/긴팔, 코트 숏/롱)은 이름 · 치수로
const MUSCAT = { '001001': ['top', '반팔 티셔츠'], '001010': ['top', '긴팔 티셔츠'], '001004': ['top', '후드티'], '001005': ['top', '긴팔 티셔츠'], '001006': ['top', 'KNIT'], '001003': ['top', 'PIQUE'], '001011': ['top', '반팔 티셔츠'], '001002': ['top', 'SHIRT'],
  '002020': ['outer', '가디건'], '002012': ['outer', '숏패딩'], '002013': ['outer', '롱패딩'], '002027': ['outer', '숏패딩'], '002007': ['outer', 'COAT'], '002024': ['outer', 'COAT'], '002008': ['outer', 'COAT'], '002009': ['outer', 'COAT'],
  '002001': ['outer', '점퍼/자켓'], '002002': ['outer', '점퍼/자켓'], '002003': ['outer', '점퍼/자켓'], '002004': ['outer', '점퍼/자켓'], '002014': ['outer', '점퍼/자켓'], '002017': ['outer', '점퍼/자켓'], '002018': ['outer', '점퍼/자켓'], '002019': ['outer', '점퍼/자켓'], '002022': ['outer', '점퍼/자켓'], '002023': ['outer', '점퍼/자켓'], '002025': ['outer', '점퍼/자켓'],
  '003002': ['bottom', 'PANTS'], '003004': ['bottom', 'PANTS'], '003007': ['bottom', 'PANTS'], '003008': ['bottom', 'PANTS'], '003009': ['bottom', '반바지'], '100004': ['bottom', '짧은 치마'], '100005': ['bottom', '긴치마'], '100006': ['bottom', '긴치마'] };
const SHORT_RE = /반팔|반소매|하프 ?슬리브|숏 ?슬리브|short ?sleeve|s\/s|\bhalf\b|하프 ?티|hf-t/, LONG_RE = /긴팔|긴소매|롱 ?슬리브|long ?sleeve|l\/s|\bls\b/;
const coatLen = (t, len, cat) => /하프|크롭|숏|쇼트|short|half|crop|카 ?코트|car ?coat|피 ?코트|pea ?coat|케이프|cape/.test(t) ? '숏코트' : /롱|long|맥시|maxi|로브|robe|발마칸|balmacaan/.test(t) ? '롱코트' : len && cat !== 'bottom' ? (len >= 90 ? '롱코트' : '숏코트') : null;
// 상품명 · 치수 · 사진 모양으로 세부 종류 고르기. 확실하지 않으면 sub 는 null (사용자가 고름)
function subGuess(name, cat, m, hood, mcat, pk) {
  const t = String(name || '').toLowerCase(), P = PARTS[pk || cat] || [], v = (k) => { const i = P.indexOf(k); const x = m && i >= 0 ? parseFloat(m[i]) : NaN; return x > 0 ? x : null; };
  const sleeve = v('소매'), len = v('총장'), inseam = v('인심');
  const mc = mcat && MUSCAT[mcat];
  if (mc) { // 무신사가 정한 분류가 있으면 그것을 따름
    const [c, x] = mc;
    if (x === 'SHIRT') return { cat: c, sub: SHORT_RE.test(t) || (sleeve && sleeve < 40) ? '반팔 셔츠' : '긴팔 셔츠' };
    if (x === 'KNIT') return { cat: c, sub: SHORT_RE.test(t) || (sleeve && sleeve < 40) ? '반팔 티셔츠' : '긴팔 티셔츠' };
    if (x === 'PIQUE') return { cat: c, sub: LONG_RE.test(t) || (sleeve && sleeve >= 40) ? '긴팔 티셔츠' : '반팔 티셔츠' };
    if (x === 'COAT') return { cat: c, sub: coatLen(t, len, cat) };
    if (x === 'PANTS') return { cat: c, sub: /쇼츠|숏츠|shorts|short ?pants|micro ?pants|bermuda|버뮤다|반바지|하프.*팬츠|half.*pants/.test(t) || (cat === 'bottom' && ((len && len < 75) || (inseam && inseam < 40))) ? '반바지' : '긴바지' };
    return { cat: c, sub: x };
  }
  if (/스커트|치마|skirt|스코츠|skort/.test(t)) return { cat: 'bottom', sub: /미니|숏|마이크로|mini|micro|short|스코츠|skort/.test(t) ? '짧은 치마' : /롱|미디|맥시|니 ?렝스|long|midi|maxi|knee/.test(t) ? '긴치마' : len && cat === 'bottom' ? (len >= 60 ? '긴치마' : '짧은 치마') : null };
  if (/가디건|카디건|cardigan/.test(t) || /(집업|zip-?up).*(니트|스웨터|sweater|knit)|(니트|스웨터|sweater|knit).*(집업|zip-?up)/.test(t)) return { cat: 'outer', sub: '가디건' };
  if (/패딩|패디드|padded|padding|puffer|푸퍼|insulat|다운 ?(자켓|재킷|점퍼|파카|코트)|down ?(jacket|parka|coat)|구스 ?다운|덕 ?다운|duck ?down|goose ?down/.test(t)) return { cat: 'outer', sub: /롱|long|벤치|bench|맥시|코트|coat|피쉬테일|fishtail/.test(t) || (len && cat !== 'bottom' && len >= 90) ? '롱패딩' : '숏패딩' };
  if (/코트|coat/.test(t) && !/코티드|coated/.test(t)) return { cat: 'outer', sub: coatLen(t, len, cat) };
  if (/자켓|재킷|점퍼|블루종|봄버|bomber|아노락|바람막이|윈드브레이커|파카|야상|블레이저|무스탕|트러커|jacket|jumper|blouson|windbreaker|anorak|parka|blazer/.test(t)) return { cat: 'outer', sub: '점퍼/자켓' };
  if (/후드|후디|hood/.test(t)) return { cat: 'top', sub: '후드티' };
  if (/반바지|쇼츠|숏츠|숏 ?팬츠|하프.*팬츠|버뮤다|bermuda|shorts|short ?pants|micro ?pants|half.*pants|[2-5]부/.test(t)) return { cat: 'bottom', sub: '반바지' };
  const topWord = /셔츠|shirt|티|tee|맨투맨|스웻|스웨트|sweat|니트|knit|스웨터|sweater|후드|자켓|재킷|jacket/;
  if (/팬츠|바지|슬랙스|청바지|조거|트라우저|카고|pants|jeans|trousers|slacks|진$/.test(t) || (/데님|denim/.test(t) && !topWord.test(t))) return { cat: 'bottom', sub: cat === 'bottom' && ((len && len < 75) || (inseam && inseam < 40)) ? '반바지' : '긴바지' };
  if (/티셔츠|티 ?셔츠|반팔티|긴팔티|티$|\btee\b|t-?shirts?|맨투맨|스웻|스웨트|sweat|니트|스웨터|롱 ?슬리브|long ?sleeve|knit|크루넥|crewneck|풀오버|pullover/.test(t)) return { cat: 'top', sub: SHORT_RE.test(t) ? '반팔 티셔츠' : LONG_RE.test(t) || /맨투맨|스웻|스웨트|sweat|니트|스웨터|knit|풀오버|pullover|롱 ?슬리브/.test(t) ? '긴팔 티셔츠' : sleeve ? (sleeve < 40 ? '반팔 티셔츠' : '긴팔 티셔츠') : null };
  if (/셔츠|남방|블라우스|shirt|blouse/.test(t)) return { cat: 'top', sub: SHORT_RE.test(t) || (sleeve && sleeve < 40) ? '반팔 셔츠' : '긴팔 셔츠' };
  // 이름으로 모르면 사진 모양 · 치수로
  if (cat === 'top' && hood) return { cat: 'top', sub: '후드티' };
  if (cat === 'top' && sleeve && /티|tee/.test(t)) return { cat: 'top', sub: sleeve < 40 ? '반팔 티셔츠' : '긴팔 티셔츠' };
  if (cat === 'bottom' && (len || inseam)) return { cat: 'bottom', sub: (len && len < 75) || (inseam && inseam < 40) ? '반바지' : '긴바지' };
  return null;
}
function subAuto(r, allowCat) { // 사용자가 직접 고르지 않았으면 자동으로
  if (r.subUser) return;
  const g = subGuess(r.name, r.cat, r.m, r.hood, r.mcat, r.pk); if (!g) return;
  if (g.cat !== r.cat) { if (!allowCat && PARTS[g.cat].join() !== PARTS[r.cat].join()) return; r.cat = g.cat; }
  if (g.sub) { r.sub = g.sub; r.subWhy = true; }
  setPk(r);
}
const SUBS = {
  'shirt-l': { n: '긴팔 셔츠', cat: 'top', g: 'top-l' }, 'tee-l': { n: '긴팔 티셔츠', cat: 'top', g: 'top-l' },
  'shirt-s': { n: '반팔 셔츠', cat: 'top', g: 'top-s' }, 'tee-s': { n: '반팔 티셔츠', cat: 'top', g: 'top-s' }, hoodie: { n: '후드티', cat: 'top', g: 'top-l' },
  'pants-l': { n: '긴바지', cat: 'bottom', g: 'pants-l' }, 'pants-s': { n: '반바지', cat: 'bottom', g: 'pants-s' },
  'skirt-l': { n: '긴치마', cat: 'bottom', g: 'skirt-l' }, 'skirt-s': { n: '짧은 치마', cat: 'bottom', g: 'skirt-s' },
  cardigan: { n: '가디건', cat: 'outer', g: 'outer-s' }, jacket: { n: '점퍼/자켓', cat: 'outer', g: 'outer-s' }, 'coat-s': { n: '숏코트', cat: 'outer', g: 'outer-s' },
  'coat-l': { n: '롱코트', cat: 'outer', g: 'outer-l' }, 'pad-s': { n: '숏패딩', cat: 'outer', g: 'outer-s' }, 'pad-l': { n: '롱패딩', cat: 'outer', g: 'outer-l' },
};
const SUB_ORDER = { top: ['shirt-l', 'tee-l', 'shirt-s', 'tee-s', 'hoodie'], bottom: ['pants-l', 'pants-s', 'skirt-l', 'skirt-s'], outer: ['cardigan', 'jacket', 'coat-s', 'coat-l', 'pad-s', 'pad-l'] };
const GROUP_N = { 'top-l': '긴팔 상의', 'top-s': '반팔 상의', 'outer-s': '짧은 아우터', 'outer-l': '긴 아우터', 'pants-l': '긴바지', 'pants-s': '반바지', 'skirt-l': '긴치마', 'skirt-s': '짧은 치마' };
// 사이즈표 · 비교 부위 (그룹별, 표 번호 순서)
const TOP7 = ['총장', '어깨', '가슴', '소매', '밑단', '소매부리', '암홀'], PANTS6 = ['총장', '허리', '엉덩이', '허벅지', '밑위', '밑단'], SKIRT4 = ['총장', '허리', '엉덩이', '밑단'];
const GPARTS = { 'top-l': TOP7, 'outer-s': TOP7, 'outer-l': TOP7, 'top-s': ['총장', '가슴', '소매부리', '전체소매', '밑단', '암홀'], 'pants-l': PANTS6, 'pants-s': PANTS6, 'skirt-l': SKIRT4, 'skirt-s': SKIRT4 };
const PART_N = { 총장: '총장', 어깨: '어깨너비', 가슴: '가슴단면', 소매: '소매길이', 밑단: '밑단단면', 소매부리: '소매부리단면', 암홀: '암홀', 전체소매: '전체소매길이', 허리: '허리단면', 엉덩이: '엉덩이단면', 허벅지: '허벅지단면', 밑위: '밑위' };
const SUB_DEFAULT = { top: 'tee-l', outer: 'jacket', bottom: 'pants-l' };
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
const CATS = [
  { k: 'top', label: '상의', icon: 'top', parts: PARTS.top, sizes: ['S', 'M', 'L', 'XL'], shape: 'top', subs: SUB.top,
    info: ['면 100%', '릴렉스 핏 · 드롭 숄더'],
    demo: { link: ['base', '크롭 옥스포드 셔츠 [화이트]', 'L', [74, 50, 58, 60], '긴팔 셔츠'], cam: ['tee', '릴렉스 핏 크루 넥 티셔츠', 'L', [71, 53, 58, 23], '반팔 티셔츠'] } },
  { k: 'bottom', label: '하의', icon: 'bottom', parts: PARTS.bottom, sizes: ['28', '29', '30', '31', '32'], shape: 'bottom', subs: SUB.bottom,
    info: ['울 70% · 폴리 30%', '와이드 · 스트레이트'],
    demo: { link: ['denim', '우먼즈 에센셜 와이드 데님 팬츠', '30', [40, 30, 31.5, 75.5, 103], '긴바지'], cam: ['denim', '우먼즈 에센셜 와이드 데님 팬츠', '30', [40, 30, 31.5, 75.5, 103], '긴바지'] } },
  { k: 'outer', label: '아우터', icon: 'outer', parts: PARTS.outer, sizes: ['S', 'M', 'L', 'XL'], shape: 'top', subs: SUB.outer,
    info: ['면 100%', '레귤러 핏'],
    demo: { link: ['jacket', '[씬라이트] 후드 재킷', 'M', [70, 48, 58, 60], '점퍼/자켓'], cam: ['jacket', '[씬라이트] 후드 재킷', 'M', [70, 48, 58, 60], '점퍼/자켓'] } },
];
const CATK = CATS.map((c) => c.k); // 홈 · 카테고리 화면용 종류 키 목록
const CM = Object.fromEntries(CATS.map((c) => [c.k, c]));
const P = [
  { id: 'p16', sp: 59520, img: 'pdHero', brand: '세컨드솔트', name: '[에어클라우드]사선지퍼 경량 패딩 자켓 (라이트블루)', cat: 'outer', sub: '숏패딩', tag: '아우터', price: 108200, dc: 45, rate: 4.8, rev: 1204,
    colors: ['블루', '블랙', '차콜', '크림'], spec: [['성별', '남녀공용'], ['소재', '겉감 나일론 100% · 충전재 덕다운 80%, 깃털 20%'], ['핏', '오버핏 · 하이넥']],
    sizes: { S: [68, 52, 62, 60], M: [70, 54, 64, 61], L: [72, 56, 66, 62], XL: [74, 58, 68, 63], '2XL': [76, 60, 70, 64] }, out: ['2XL'] },
  { id: 'p1', sp: 55890, img: 'hero', brand: '무신사 스탠다드', name: '[플러스] 릴렉스드 타입라이터 셔츠 [화이트]', cat: 'top', sub: '긴팔 셔츠', tag: '셔츠', price: 69900, dc: 20, rate: 4.8, rev: 1204,
    sizes: { S: [70, 48, 55, 58], M: [72.5, 51, 58, 59.5], L: [75, 53, 61, 61], XL: [77.5, 55, 63, 62.5] }, out: ['XL'] },
  { id: 'p2', sp: 33890, img: 'base', brand: '무신사 스탠다드', name: '크롭 옥스포드 셔츠 [화이트]', cat: 'top', sub: '긴팔 셔츠', tag: '셔츠', price: 39900, dc: 15, rate: 4.7, rev: 3311,
    sizes: { S: [70, 46, 54, 58], M: [72, 48, 56, 59], L: [74, 50, 58, 60], XL: [76, 52, 61, 61] }, out: [] },
  { id: 'p3', sp: 48520, img: 'jacket', brand: '스파오', name: '[씬라이트] 후드 재킷_SPJPG4TC24', cat: 'outer', sub: '점퍼/자켓', tag: '아우터', price: 59900, dc: 19, rate: 4.9, rev: 512,
    sizes: { S: [68, 46, 56, 59], M: [70, 48, 58, 60], L: [72, 50, 61, 61] }, out: [] },
  { id: 'p4', sp: 119400, img: 'knit', brand: '더니트컴퍼니', name: '파인 캐시미어 100 크루넥 10color', cat: 'top', tag: '니트', price: 199000, dc: 40, rate: 4.8, rev: 655,
    sizes: { M: [66, 52, 60, 57], L: [68, 54, 63, 58] }, out: [] },
  { id: 'p5', sp: 50890, img: 'slacks', brand: '무신사 스탠다드', name: '헤비웨이트 속기모 세미 와이드 히든 밴딩 슬랙스 [블랙]', cat: 'bottom', sub: '긴바지', tag: '팬츠', price: 59900, dc: 15, rate: 4.6, rev: 287,
    sizes: null, list: ['28', '30', '32'], out: [] },
  { id: 'p6', sp: 37390, img: 'denim', brand: '무신사 스탠다드 우먼', name: '우먼즈 에센셜 와이드 데님 팬츠 [미디엄 인디고]', cat: 'bottom', sub: '긴바지', tag: '팬츠', price: 49900, dc: 25, rate: 4.7, rev: 1890,
    sizes: { 28: [38, 29, 30, 75, 102], 30: [40, 30, 31.5, 75, 103], 32: [42, 31, 33, 75, 104] }, out: ['32'] },
  { id: 'p7', sp: 28290, img: 'tee', brand: '무신사 스탠다드', name: '릴렉스 핏 크루 넥 티셔츠 2팩', cat: 'top', sub: '반팔 티셔츠', tag: '티셔츠', price: 31800, dc: 11, rate: 4.8, rev: 4022,
    sizes: { M: [69, 50, 55, 22], L: [71, 53, 58, 23], XL: [73, 56, 61, 24] }, out: [] },
  { id: 'p8', sp: 238000, img: 'puffer', brand: '노스페이스', name: 'WAJ3NS301A 벤투스 27 온볼 패딩 자켓 BLACK', cat: 'outer', sub: '숏패딩', tag: '아우터', price: 238000, dc: 0, rate: 4.8, rev: 2140, sizes: null, list: ['M', 'L', 'XL'], out: [] },
  { id: 'p9', sp: 268200, img: 'leather', brand: '미세키서울', name: 'Diagonal reversible shearing jacket BLACK', cat: 'outer', sub: '점퍼/자켓', tag: '아우터', price: 298000, dc: 10, rate: 4.7, rev: 834, sizes: null, list: ['M', 'L'], out: [] },
  { id: 'p10', sp: 320000, img: 'suede', brand: '살로몬', name: '크로스 인슐레이션 자켓_LD0274500', cat: 'outer', sub: '점퍼/자켓', tag: '아우터', price: 320000, dc: 0, rate: 4.9, rev: 403, sizes: null, list: ['M', 'L'], out: [] },
  { id: 'p11', sp: 118990, img: 'lpuffer', brand: '무신사 스탠다드', name: '[시티 레저] 시어 후디드 라이트 다운 재킷 (9 colors)', cat: 'outer', sub: '숏패딩', tag: '아우터', price: 140000, dc: 15, rate: 4.6, rev: 1532, sizes: null, list: ['S', 'M', 'L'], out: [] },
  { id: 'p12', sp: 23290, img: 'tee2', brand: '무신사 스탠다드', name: '레귤러 크루 넥 긴소매 니트 티셔츠 [토프]', cat: 'top', sub: '긴팔 티셔츠', tag: '티셔츠', price: 25900, dc: 10, rate: 4.7, rev: 2876, sizes: { M: [70, 52, 57, 59], L: [72, 54, 60, 60] }, out: [] },
  { id: 'p13', sp: 189000, img: 'blackp', brand: '랜 아카이브', name: '[HD003] 왁스 코팅 부츠컷 카고 데님 팬츠 - 블랙', cat: 'bottom', sub: '긴바지', tag: '팬츠', price: 210000, dc: 10, rate: 4.5, rev: 968, sizes: { 28: [37, 27, 29, 75, 100], 30: [39, 28.5, 30.5, 75.5, 102], 32: [41, 30, 32, 76, 104] }, out: [] },
  { id: 'p14', sp: 34900, img: 'wide', brand: '디미트리블랙', name: '[10주년기획] © 모두의 에센셜 데님 팬츠_(커브드 핏) 4 COLOR', cat: 'bottom', sub: '긴바지', tag: '팬츠', price: 49900, dc: 30, rate: 4.8, rev: 1711, sizes: { 28: [38, 28, 30, 75, 101], 30: [40, 29.5, 31.5, 75.5, 103], 32: [42, 31, 33, 76, 105] }, out: [] },
  { id: 'p15', sp: 39800, img: 'dshirt', brand: '트릴리온', name: '빈티지 우드 버튼 데님 긴팔 셔츠_4color', cat: 'top', sub: '긴팔 셔츠', tag: '셔츠', price: 57700, dc: 31, rate: 4.7, rev: 745, sizes: { S: [70, 46, 54, 58], M: [72, 48, 56, 59.5], L: [74.5, 50.5, 58.5, 61] }, out: [] },
];
// 상품 치수를 그룹 칸으로: 상세 v2에 실측이 있는 상품은 그 값, 나머지는 옛 4 · 5칸에서 옮기고 늘어난 칸은 예시 값
const V2S = {p16: { S: [68, 52, 62, 60, 60, 13, 26], M: [70, 54, 64, 61, 62, 13, 27], L: [72, 56, 66, 62, 64, 14, 28], XL: [74, 58, 68, 63, 66, 14, 29], '2XL': [76, 60, 70, 64, 68, 15, 30] }, p2: { S: [70, 46, 54, 58, 52, 11, 23], M: [72, 48, 56, 59, 54, 12, 24], L: [74, 50, 58, 60, 56, 12, 25], XL: [76, 52, 61, 61, 59, 13, 26] }, p3: { S: [68, 46, 56, 59, 54, 12, 24], M: [70, 48, 58, 60, 56, 12, 25], L: [72, 50, 61, 61, 59, 13, 26] }, p4: { M: [66, 52, 60, 57, 58, 13, 26], L: [68, 54, 63, 58, 61, 13, 27] }, p6: { 28: [102, 38, 48, 30, 29, 19], 30: [103, 40, 50, 31.5, 30, 20], 32: [104, 42, 52, 33, 31, 20] }, p7: { M: [69, 55, 18, 47, 53, 22], L: [71, 58, 19, 49.5, 56, 23], XL: [73, 61, 20, 52, 59, 24] }};
P.forEach((p) => { if (V2S[p.id]) p.sizes = V2S[p.id]; else if (p.sizes) for (const k in p.sizes) p.sizes[k] = fromLegacy(p, p.sizes[k], true); });
// 무신사 랭킹(2026-10-29, 세부 종류별 상위) 상품: [무신사 분류, 브랜드, 상품명, 할인율, 판매가]. 사진은 데모 사진을 세부 종류별로 돌려 써요
const MSRAW = [["긴소매 티셔츠", "데우스 엑스 마키나", "Roar Ls Tee_Black", 0, 108000], ["긴소매 티셔츠", "데우스 엑스 마키나", "Seoul College Address Ls Tee_Black", 0, 78000], ["긴소매 티셔츠", "데우스 엑스 마키나", "Seoul College Address Ls Tee_White", 0, 78000], ["긴소매 티셔츠", "트릴리온", "[기획] 에센셜 CP 이중지 크롭 긴팔티_7color", 39, 23900], ["긴소매 티셔츠", "데우스 엑스 마키나", "Seoul College Address Ls Tee_M/Grey", 0, 78000], ["긴소매 티셔츠", "무신사 스탠다드", "레귤러 긴소매 크롭 티셔츠 [화이트]", 5, 24590], ["긴소매 티셔츠", "무신사 스탠다드", "레귤러 긴소매 크롭 티셔츠 [블랙]", 10, 23290], ["긴소매 티셔츠", "데우스 엑스 마키나", "Seoul Ceramic Ls Tee_Charcoal", 0, 108000], ["긴소매 티셔츠", "잇자바이브", "CHOCOCAT RAGLAN T SHIRT - BROWN", 28, 54000], ["긴소매 티셔츠", "소버먼트", "[태양xSOVERMENT]워셔블 골지 니트 2버튼 헨리넥 롱슬리브_5colors", 30, 29300], ["긴소매 티셔츠", "데우스 엑스 마키나", "Smile Os Ls Tee_Black", 0, 88000], ["셔츠/블라우스", "힐다", "Silky Swan Blouse II [White]", 0, 98000], ["셔츠/블라우스", "트릴리온", "빈티지 우드 버튼 데님 긴팔 셔츠_4color", 31, 39800], ["셔츠/블라우스", "웬즈데이오아시스", "[젠플록스x웬즈데이오아시스] (크롭) 퓨어 코튼 웨스턴 데님 셔츠_3COLOR", 10, 62100], ["셔츠/블라우스", "폴로 랄프 로렌", "남성 클래식핏 코듀로이 셔츠(MNPOWOV16824497101)", 0, 269000], ["셔츠/블라우스", "커스텀어클락", "[COCLX삭형] 세미 크롭 코듀로이 셔츠 6 COLOR COOSSH206", 25, 46500], ["셔츠/블라우스", "에잇세컨즈", "레드 브러쉬 체크 셔츠  레드", 19, 48520], ["셔츠/블라우스", "지오송지오", "셈블런스 코듀로이 집업 셔츠 브라운 ZI5SH809BR", 40, 253310], ["셔츠/블라우스", "에드워드맥스", "면 벨벳  웨스턴 셔츠 ESH-SEDONA.V-MU", 0, 199000], ["셔츠/블라우스", "무신사 스탠다드", "[플러스] 릴렉스드 타입라이터 셔츠 [화이트]", 20, 55890], ["셔츠/블라우스", "드로우핏", "[오정규X드로우핏] 애프터 세미 크롭 데님 셔츠 [3color]", 10, 55800], ["셔츠/블라우스", "미나브", "플루이드 셔츠 [네이비]", 20, 55200], ["반소매 티셔츠", "무신사 스탠다드", "릴렉스 핏 크루 넥 티셔츠 2 2팩", 11, 28290], ["반소매 티셔츠", "노스페이스", "NT7UT98A 한글 반팔 티셔츠 2 BLACK", 5, 42750], ["반소매 티셔츠", "토런스", "멀티 라인 링거 머슬핏 숏 슬리브  - Black", 50, 37400], ["반소매 티셔츠", "버클다운", "오버핏 BD_LOGO 프린티드 피그먼트 워시드 티셔츠(GREY)", 32, 34600], ["반소매 티셔츠", "아디다스", "3-스트라이프 티셔츠 - 클라우드화이트:블루 / KZ1212", 40, 29460], ["반소매 티셔츠", "키티포터리", "클래식 소프트 딥 스퀘어넥 티셔츠 (화이트)", 24, 25090], ["반소매 티셔츠", "젝시믹스", "아이스페더 숏슬리브 2.0 XWFST01H2", 50, 14370], ["반소매 티셔츠", "마뗑킴", "PIGMENT GRAFFITI LOGO TOP IN CHARCOAL", 0, 68000], ["반소매 티셔츠", "배드블러드", "H.B.B. 펜타 스컬 와플 1/2 티셔츠 - 차콜", 14, 59000], ["반소매 티셔츠", "본투윈", "DAMAGED SYMBOL B LOGO T-SHIRTS [BLACK]", 0, 65000], ["반소매 티셔츠", "무신사 스탠다드", "[쿨탠다드] 레귤러 크롭 티셔츠 [화이트]", 0, 19900], ["니트/스웨터", "더니트컴퍼니", "파인 캐시미어 100 크루넥 10color", 40, 119400], ["니트/스웨터", "수아레", "파인 메리노 울 100 니트 (2종)", 38, 59310], ["니트/스웨터", "트릴리온", "[너드킹 X 트릴리온] 드라이어블 모크넥 니트 티셔츠_5color", 30, 27900], ["니트/스웨터", "미세키서울 맨", "High neck side button knit CHARCOAL", 15, 117300], ["니트/스웨터", "무신사 스탠다드 우먼", "[빅토리아 울] 우먼즈 미니멀 리브드 후디드 니트 집업 [헤더 그레이]", 5, 75890], ["니트/스웨터", "더니트컴퍼니", "[스토커즈 콜라보] 워셔블 에센셜 크루넥 니트 10color", 40, 35940], ["니트/스웨터", "알리스", "데님 레이어드 크롭 니트 풀오버 [블랙]", 10, 66600], ["니트/스웨터", "무신사 스탠다드", "[빅토리아 울] 미니멀 리브드 크롭 니트 [블랙]", 5, 56890], ["니트/스웨터", "언탭트 스튜디오", "오버핏 케이블 반집업 카라 니트 3Color", 30, 35840], ["니트/스웨터", "데이", "트랙 에어울 니트 자켓_3 COLOR", 30, 49500], ["니트/스웨터", "트릴리온", "워셔블 브이넥 레이어드 긴팔 니트_4color", 30, 39900], ["후드 티셔츠", "데우스 엑스 마키나", "Quick Strike Hoodie_Black", 0, 178000], ["후드 티셔츠", "언탭트 스튜디오", "340G 에센셜 벌룬 오버핏 후드 티셔츠 3Color", 30, 35840], ["후드 티셔츠", "스파오", "와플 후드 바라클라바 긴팔티_SPFWG4TC10", 19, 32320], ["후드 티셔츠", "엄브로", "기모 아플리케 후드 티셔츠 블랙 UR421CHDO4", 0, 119000], ["후드 티셔츠", "르아브", "토마스 후디드 버튼 헨리넥 탑 (2col)", 10, 80100], ["후드 티셔츠", "아이돈워너셀", "Wave Cross Hoodie Multi", 15, 75650], ["후드 티셔츠", "고스트리퍼블릭", "V가젯 세미크롭 후드티 4Color GHT-486", 30, 34900], ["후드 티셔츠", "무신사 스탠다드", "[리뉴얼] 기모 후디드 스웨트셔츠 [블랙]", 15, 42390], ["후드 티셔츠", "엠엘비", "베이직 스몰로고 기모 후드티 NY (Black)", 0, 129000], ["후드 티셔츠", "아이필블루씨에스엠", "CSM Denim Patch Hoodie [4color]", 30, 69000], ["후드 티셔츠", "데우스 엑스 마키나", "Quick Strike Hoodie_Beige", 0, 178000], ["맨투맨/스웨트", "빈웨드", "Navajo Pattern 나바호 패턴 빈티지 멜란지 헤비웨이트 스웻셔츠", 46, 59800], ["맨투맨/스웨트", "무드인사이드 우먼", "(woman) 스웻 크롭 반집업_6Color", 42, 69900], ["맨투맨/스웨트", "노앙", "[기모] LONELY/LOVELY CRACK SWEATSHIRT NAVY", 0, 168000], ["맨투맨/스웨트", "무신사 스탠다드", "[리뉴얼] 오버사이즈 스웨트셔츠 [블랙]", 10, 35890], ["맨투맨/스웨트", "원헌드레드퍼센트", "OHPxMOAI b캠핑 피그먼트 맨투맨", 35, 53300], ["맨투맨/스웨트", "247시리즈", "POLARTEC 플리스 크루넥 MELANGE GRAY", 10, 89100], ["맨투맨/스웨트", "고스트리퍼블릭", "코듀로이 하프버튼 세미크롭 맨투맨 3Color GMT-163", 30, 34900], ["맨투맨/스웨트", "드릭스", "빈티지 벨벳 로고 맨투맨_3color", 22, 39000], ["맨투맨/스웨트", "무신사 스탠다드", "[리뉴얼] 기모 스웨트셔츠 [미디엄 그레이]", 15, 33890], ["맨투맨/스웨트", "코닥", "에센셜 헨리넥 니트 맨투맨 M.GREY", 10, 107100], ["맨투맨/스웨트", "고스트리퍼블릭", "헨리넥 세미크롭 맨투맨 3Color GMT-165", 30, 34900], ["숏패딩/헤비 아우터", "살로몬", "크로스 인슐레이션 자켓_LD0274200", 0, 320000], ["숏패딩/헤비 아우터", "살로몬", "엑스 퓨즈 후디드 다운 자켓 V2_LD0275400", 0, 400000], ["숏패딩/헤비 아우터", "블랙야크", "공용 클라이밍 스톤마스터 라이트 다운자켓#3_DY", 20, 239000], ["숏패딩/헤비 아우터", "노스페이스", "NJ3NS85A 여성 알토르 온볼 패딩 자켓 BLACK", 0, 249000], ["숏패딩/헤비 아우터", "노스페이스", "NJ3NS55A 남성 알토르 온볼 패딩 자켓 BLACK", 0, 249000], ["숏패딩/헤비 아우터", "노스페이스", "NJ3NS66K 벡트 온볼 패딩 EX 자켓 DARK SLATE", 5, 283100], ["숏패딩/헤비 아우터", "헬리녹스 웨어", "ZERO 솔라 다운_Cinder", 10, 648000], ["숏패딩/헤비 아우터", "후브스", "시어쉘 인시전 패딩 자켓-7Color", 20, 79200], ["숏패딩/헤비 아우터", "노스페이스", "NJ3NS83A 여성 눕시 온볼 패딩 자켓 BLACK", 5, 265050], ["숏패딩/헤비 아우터", "노스페이스", "NJ3NS50A 남성 눕시 온볼 패딩 자켓 BLACK", 5, 265050], ["숏패딩/헤비 아우터", "파타고니아", "멘즈 피츠 로이 다운 후디 / 85501R7", 0, 699000], ["롱패딩/헤비 아우터", "디스커버리 익스페디션", "여성 켈리 글로시 구스다운 롱패딩 (BLACK)", 5, 598500], ["롱패딩/헤비 아우터", "허그유어스킨", "패디드 피쉬테일 더플 파카 (차콜)", 15, 271150], ["롱패딩/헤비 아우터", "비터셀즈", "퍼 디테쳐블 피쉬테일 파카-블랙", 7, 184140], ["롱패딩/헤비 아우터", "허그유어스킨", "패디드 피쉬테일 더플 파카 (블랙)", 15, 271150], ["롱패딩/헤비 아우터", "아이더", "La Reine (라헨느) 여성 캐시미어 블렌드 W/S 롱 다운 자켓_Black", 13, 694000], ["롱패딩/헤비 아우터", "허그유어스킨", "패디드 피쉬테일 더플 파카 (카키)", 15, 271150], ["롱패딩/헤비 아우터", "오헤시오", "TEDDY FUR HOODED LONG PARKA, DUSTY BLUE", 0, 278000], ["롱패딩/헤비 아우터", "룰루레몬", "우먼스 워터 리지스턴트 플리스 라인드 재킷", 0, 355000], ["롱패딩/헤비 아우터", "아이더", "MONGLIT FOX (몽글릿 폭스) 여성 롱 구스 다운 자켓_OATMEAL", 13, 524000], ["롱패딩/헤비 아우터", "커버낫", "씨빅 RDS 롱 다운 자켓 블랙", 10, 278100], ["롱패딩/헤비 아우터", "오헤시오", "TEDDY FUR HOODED LONG PARKA, KHAKI", 0, 278000], ["블루종/MA-1", "무신사 스탠다드", "G-8 웹 플라이트 재킷 [블랙]", 15, 135890], ["블루종/MA-1", "유희", "MA-1 FUR HOOD JUMPER_KHAKI", 36, 159940], ["블루종/MA-1", "유희", "MA-1 FUR HOOD JUMPER_BLACK", 36, 159940], ["블루종/MA-1", "무신사 스탠다드", "G-8 웹 플라이트 재킷 [올리브]", 15, 135890], ["블루종/MA-1", "쿠어", "워시드 소프트 필 덱 후크 보머 자켓 (워시드브라운)", 10, 405000], ["블루종/MA-1", "미세키서울 맨", "Diagonal panel padding jacket BLACK", 15, 219300], ["블루종/MA-1", "스파오", "(후드탈착) 오버핏 MA-1 항공 점퍼_SPJAG4TC01", 0, 89900], ["블루종/MA-1", "알에스에스씨", "FUR LINE HOODIED PARKA - GRAY", 0, 339000], ["블루종/MA-1", "데프가먼츠", "MA-1 HOOK FUR JACKET [BLACK]", 10, 178200], ["블루종/MA-1", "쿠어", "워시드 코튼 M-51 필드 자켓 (블랙)", 10, 324000], ["블루종/MA-1", "러프넥", "MA-1 Snap Jacket Black", 0, 198000], ["레더/라이더스 재킷", "데우스 엑스 마키나", "Riders Friends Faux Leather Jacket_Brown", 0, 368000], ["레더/라이더스 재킷", "아워데이즈", "노마드 크롭 바이커 레더 자켓 [BLACK]", 28, 106560], ["레더/라이더스 재킷", "데이", "스웨이드 바이커 패딩 자켓_BROWN", 35, 86500], ["레더/라이더스 재킷", "아캄", "Slant Studded Leather Jacket (Burgundy)", 20, 183200], ["레더/라이더스 재킷", "데이", "스웨이드 바이커 패딩 자켓_BLACK", 35, 86500], ["레더/라이더스 재킷", "인사일런스", "카프 스킨 카코트 BLACK", 10, 609000], ["레더/라이더스 재킷", "무신사 스탠다드", "신세틱 스웨이드 후디드 재킷 [브라운]", 6, 131490], ["레더/라이더스 재킷", "쿠어", "베지터블 스윙탑 플리츠 워시 점퍼 (블랙)", 10, 540000], ["레더/라이더스 재킷", "데우스 엑스 마키나", "Faux Leather Track Jacket_Black", 0, 348000], ["레더/라이더스 재킷", "쿠어", "카우 스킨 A-2 레더 자켓 (다크브라운)", 10, 486000], ["레더/라이더스 재킷", "데우스 엑스 마키나", "Suede Roar Work Jacket_D/Brown", 0, 318000], ["후드 집업", "데우스 엑스 마키나", "Custom Zip Hoodie_Dark Navy", 0, 198000], ["후드 집업", "데우스 엑스 마키나", "Seoul College Address Zip Hoodie_Black", 0, 178000], ["후드 집업", "잇자바이브", "CHOCOCAT STRIPE HOODIE ZIP UP - CHARCOAL", 28, 77760], ["후드 집업", "데우스 엑스 마키나", "Seoul College Address Zip Hoodie_Charcoal", 0, 178000], ["후드 집업", "데우스 엑스 마키나", "Seoul College Address Zip Hoodie_Olive", 0, 178000], ["후드 집업", "아디다스", "워시드 후드 집업 - 미디엄그레이헤더 / LC8294", 0, 139000], ["후드 집업", "잇자바이브", "CHOCOCAT STRIPE HOODIE ZIP UP - BROWN", 28, 77760], ["후드 집업", "무신사 스탠다드 우먼", "[시티 레저] 우먼즈 그리드 폴라 플리스 바라클라바 후디드 집업 [머드 그레이]", 20, 55890], ["후드 집업", "아디다스", "워시드 후드 집업 - 나이트인디고 / LC8292", 0, 139000], ["후드 집업", "무신사 스탠다드 우먼", "[시티 레저] 우먼즈 그리드 폴라 플리스 바라클라바 후디드 집업 [블랙]", 0, 69900], ["후드 집업", "뉴발란스", "NBMDG41003 / UNI 에센셜 클래식 기모 후드집업 (M/GRAY)", 0, 109000], ["카디건", "수아레", "[젠플록스X수아레] 데일리 라운드 크롭 가디건 - 5 COLOR", 32, 39900], ["카디건", "타입서비스", "Double Breasted Knit Cardigan [Black]", 0, 165000], ["카디건", "펜필드", "[PF]빈티지 윈터 노르딕 패턴 가디건_FS3NJ04U", 0, 219000], ["카디건", "허그유어스킨", "더블 버튼 후드 가디건 (핑크 그레이)", 15, 135150], ["카디건", "수아레", "파인 메리노 울 100 라운드 가디건 - 5 COLOR", 37, 62910], ["카디건", "마리끌레르", "하트 아가일 가디건(MAGCKC01MCH)", 43, 62400], ["카디건", "무신사 스탠다드", "[빅토리아 울] 라운드 넥 크롭 가디건 (4 colors)", 15, 67890], ["카디건", "프리즘웍스", "HUNTER HEAVY COWICHAN JACKET _ FOREST", 0, 189000], ["카디건", "인세인개러지", "INSANE WOOL ROUND KNIT CARDIGAN_TEAL", 0, 158000], ["카디건", "마리끌레르", "베이직 로고 자수 케이블 가디건(MAGCKC13MLV)", 56, 39200], ["카디건", "브랜디드", "ETERNAL CROP FULL ZIP-UP KNIT [BLACK]", 10, 151200], ["겨울 싱글 코트", "미쏘", "버클 변형 하이넥 숏코트_MIWJHGV42B", 20, 103200], ["겨울 싱글 코트", "오픈야드(오와이)", "WRAP SHORT COAT - BLACK", 15, 177650], ["겨울 싱글 코트", "유젠", "후드 하프 코트_2 COLOR", 19, 89900], ["겨울 싱글 코트", "미쏘", "울블렌디드 반더블 스탠카라 숏코트_MIWJHGV32B", 20, 103200], ["겨울 싱글 코트", "무신사 스탠다드 우먼", "우먼즈 멜로우 울 블렌드 퍼넬 넥 쇼트 코트 [미디엄 그레이]", 15, 169890], ["겨울 싱글 코트", "무신사 스탠다드 우먼", "우먼즈 캐시미어 블렌드 하프 발마칸 코트 [네이비]", 10, 179890], ["겨울 싱글 코트", "일리고", "리버시블 무스탕 하프 코트 베이지", 9, 258000], ["겨울 싱글 코트", "무신사 스탠다드 우먼", "우먼즈 캐시미어 블렌드 핸드메이드 하프 발마칸 로브 코트 [차콜 그레이]", 15, 169890], ["겨울 싱글 코트", "아수라", "WOOL HANDMADE HALF COAT (BLACK)", 20, 238400], ["겨울 싱글 코트", "알리스", "애스터 캐시미어 싱글 하이넥 코트 [멜란지그레이]", 20, 246400], ["겨울 싱글 코트", "무신사 스탠다드 우먼", "우먼즈 캐시미어 블렌드 코쿤 발마칸 코트 [블랙]", 15, 195390], ["환절기 코트", "비터셀즈", "러비 울 하이넥 하프 코트-블랙", 7, 194370], ["환절기 코트", "에트오소메", "Contrast Panel Buckle Short Coat (Black)", 10, 233100], ["환절기 코트", "기준", "[예린 PICK] SHEARING FUR HALF COAT_CHARCOAL GREY", 20, 215200], ["환절기 코트", "쎄무아듀", "Cest_Vintage peplum jacket", 5, 155800], ["환절기 코트", "쎄무아듀", "Cest_Ribbon button duffle coat", 5, 227050], ["환절기 코트", "쎄무아듀", "Cest_Rose detail wool coat", 5, 241300], ["환절기 코트", "파렌하이트", "울 캐시미어 혼방 블루종 점퍼 (FPMAX6305)", 30, 419300], ["환절기 코트", "피그먼트", "[WOOL]헤비울스트링코트 (QYJP260221)", 35, 143000], ["환절기 코트", "송지오", "송지오옴므 슬릿 싱글 브레스트 코트 블랙 SI6CT600BK", 5, 1510500], ["환절기 코트", "미쏘", "하프 트렌치_MIWJTGT01B", 0, 129000], ["환절기 코트", "피그먼트", "[WOOL]벌룬나그랑버튼코트 (QYJP260120)", 35, 123500], ["트러커 재킷", "디키즈", "덕 캔버스 페인터 재킷 Black", 0, 149000], ["트러커 재킷", "아웃스탠딩", "SELVEDGE DENIM 2ND JACKET_MEDIUM BLUE", 10, 170100], ["트러커 재킷", "낫포너드", "After Aware Bleach Washed Trucker Jacket - Beige", 10, 139000], ["트러커 재킷", "아웃스탠딩", "[MUT lab] 60S ROUGHOUT TRUCKER JACKET_BROWN", 0, 548000], ["트러커 재킷", "아웃스탠딩", "[MUT lab] 60S ROUGHOUT TRUCKER JACKET_TOBACCO", 0, 548000], ["트러커 재킷", "무신사 스탠다드", "벨벳 데님 트러커 재킷 [블랙]", 20, 103890], ["트러커 재킷", "엘무드", "비셰 벨벳 자켓 다크 브라운", 10, 268200], ["트러커 재킷", "도그마 엑스", "HAND WAXED DENIM JACKET", 0, 279000], ["트러커 재킷", "아크메드라비", "DENIM CORDUROY FLEECE HOODIE JACKET", 0, 239000], ["트러커 재킷", "트릴리온", "50’s 워시드 크롭 트러커 자켓_3color", 38, 47990], ["트러커 재킷", "디키즈", "벨벳 데님 트러커 재킷 Olive", 0, 219000], ["데님 팬츠", "디미트리블랙", "[10주년기획] © 모두의 에센셜 데님 팬츠_(커브드 핏) 4 COLOR", 30, 34900], ["데님 팬츠", "해칭룸", "Regular Selvedge Jeans Dark Grey", 0, 278000], ["데님 팬츠", "무신사 스탠다드 우먼", "우먼즈 에센셜 와이드 데님 팬츠 [미디엄 인디고]", 25, 37390], ["데님 팬츠", "무신사 스탠다드 우먼", "우먼즈 에센셜 커브드 데님 팬츠 [미디엄 인디고]", 5, 47390], ["데님 팬츠", "무신사 스탠다드 우먼", "우먼즈 에센셜 커브드 데님 팬츠 [딥 인디고]", 5, 47390], ["데님 팬츠", "무신사 스탠다드 우먼", "우먼즈 에센셜 와이드 데님 팬츠 [딥 인디고]", 5, 47390], ["데님 팬츠", "아워데이즈", "[젠플록스X아워데이즈] 세미 커브드 데님 팬츠 [3COLORS]", 31, 45400], ["데님 팬츠", "랜 아카이브", "[HD003] 왁스 코팅 부츠컷 카고 데님 팬츠 - 블랙", 10, 189000], ["데님 팬츠", "이투둘", "LAYERED DENIM 003 (BLACK)", 0, 159000], ["데님 팬츠", "리바이스", "502™ 테이퍼 진 29507-1481", 10, 143100], ["데님 팬츠", "무신사 스탠다드", "[이도현 PICK] [챔피온 컬래버] 가먼트 다이드 커브드 데님 팬츠 [차콜 그레이]", 5, 75890], ["코튼 팬츠", "라이즈앤빌로우", "[라이즈앤빌로우X말바지] HBT 302 와이드 스트레이트 치노팬츠 WASHED KHAKI", 0, 169000], ["코튼 팬츠", "알리스", "[NERDKING x ALYSS] 슬릭 세미와이드 코튼 치노 팬츠_3COLOR", 20, 59200], ["코튼 팬츠", "에스파이", "BAKER PANTS (CHARCOAL)", 25, 87750], ["코튼 팬츠", "무신사 스탠다드 우먼", "우먼즈 기모 커브드 스웨트 팬츠 [블랙]", 15, 42390], ["코튼 팬츠", "트릴리온", "워시드 파라슈트 밴딩 카고 팬츠_3color", 20, 39900], ["코튼 팬츠", "디미트리블랙", "에센셜 코듀로이 커브드 팬츠_2 COLOR", 30, 34900], ["코튼 팬츠", "무신사 스탠다드 우먼", "우먼즈 스트레이트 코듀로이 팬츠 [다크 네이비]", 15, 42390], ["코튼 팬츠", "비긴202", "엣지 워크 라보 팬츠 [카키 올리브]", 10, 134100], ["코튼 팬츠", "무신사 스탠다드", "[시티 레저] 벨티드 커브드 팬츠 [블랙]", 11, 79990], ["코튼 팬츠", "셔터", "CORD 5P PANTS (KHAKI)", 0, 188000], ["코튼 팬츠", "어나더 오피스", "Santiago Officer Corduroy Pants (Brown)", 0, 185000], ["슈트 팬츠/슬랙스", "무신사 스탠다드", "헤비웨이트 속기모 세미 와이드 히든 밴딩 슬랙스 [블랙]", 15, 50890], ["슈트 팬츠/슬랙스", "무신사 스탠다드", "헤비웨이트 속기모 세미 와이드 히든 밴딩 슬랙스 [반다이크 브라운]", 15, 50890], ["슈트 팬츠/슬랙스", "런던다다", "[SET-UP] Essential Tailored One-Tuck Straight Slacks, CHARCOAL", 5, 141550], ["슈트 팬츠/슬랙스", "프렌치시크", "[인생360] [3단기장] 벨에포크 폴딩핀턱 스트라이프 와이드 슬랙스_F6S238SL", 0, 59800], ["슈트 팬츠/슬랙스", "바이모노", "[빅사이즈 32-46] 모노 편안한 히든밴딩 원핀턱 슬랙스", 0, 42900], ["슈트 팬츠/슬랙스", "무신사 스탠다드 우먼", "우먼즈 헤비웨이트 속기모 플레어 히든 밴딩 슬랙스 [다크 브라운]", 0, 59900], ["슈트 팬츠/슬랙스", "아날로그무드", "플레인 뒷밴딩 커브드 슬랙스 (블랙)", 30, 57400], ["슈트 팬츠/슬랙스", "미세키서울", "Multi pleats wide pants BLACK", 10, 151200], ["슈트 팬츠/슬랙스", "건지 울른스", "[건지울른스X아브라함문] 헤링본 울 클래식 트라우저 - 웜 그레이", 0, 259000], ["슈트 팬츠/슬랙스", "무신사 스탠다드", "헤비웨이트 속기모 세미 와이드 히든 밴딩 슬랙스 [차콜 그레이]", 15, 50890], ["슈트 팬츠/슬랙스", "네이비얼", "투턱 퓨어 울 슬랙스", 18, 180400], ["숏 팬츠", "하츠코시", "DOUBLE ZIP CORDUROY SHORTS", 39, 59080], ["숏 팬츠", "쿄이", "TRIPLE ZIP FOIL SHORTS (BLACK)", 30, 110600], ["숏 팬츠", "사일프레이", "41 Graphic Pocket Shorts / Black", 5, 75050], ["숏 팬츠", "사일프레이", "Folded Snap Shorts / Black", 5, 65550], ["숏 팬츠", "에잇세컨즈", "코듀로이 쇼츠  브라운", 19, 32320], ["숏 팬츠", "윌슨", "써모플레이 피키 쇼츠 W (3color)", 0, 100000], ["숏 팬츠", "푸마", "[헬로 선라이즈 컬래버] 쇼츠 - 초콜릿 브라운 / 611924-01", 25, 58990], ["숏 팬츠", "아수라", "WOOL MICRO PANTS (GREY)", 20, 71200], ["숏 팬츠", "락케이크", "Damage Denim Shorts - Ash Blue", 10, 107100], ["숏 팬츠", "애즈유아", "폴딩 히든 스커트 팬츠 블랙", 10, 94000], ["숏 팬츠", "무신사 스탠다드 우먼", "우먼즈 폴라 플리스 밴딩 쇼츠 [그레이]", 15, 25390], ["트레이닝/조거 팬츠", "디미트리블랙", "VLAD 원턱 커브드 트랙 스웻 팬츠_(3심볼) 3 COLOR", 31, 33900], ["트레이닝/조거 팬츠", "무신사 스탠다드 우먼", "우먼즈 더블 니트 커브드 스웨트 팬츠 [블랙]", 5, 43590], ["트레이닝/조거 팬츠", "무신사 스탠다드", "기모 라운지 스웨트 팬츠 [블랙]", 15, 38990], ["트레이닝/조거 팬츠", "무신사 스탠다드 우먼", "우먼즈 폴라 플리스 커브드 밴딩 팬츠 [그레이]", 15, 33890], ["트레이닝/조거 팬츠", "엠아이엠", "MOVE FLEECE PANTS_Charcoal Grey", 0, 159000], ["트레이닝/조거 팬츠", "무신사 스탠다드", "더블 니트 커브드 스웨트 팬츠 (4 colors)", 9, 41690], ["트레이닝/조거 팬츠", "디미트리블랙", "SORONA® 유틸리티 패딩 카고 팬츠_2 COLOR", 20, 49900], ["트레이닝/조거 팬츠", "무신사 스탠다드 우먼", "우먼즈 폴라 플리스 커브드 밴딩 팬츠 [블랙]", 15, 33890], ["트레이닝/조거 팬츠", "무신사 스탠다드 우먼", "우먼즈 기모 릴렉스드 라운지 스웨트 팬츠 [건메탈]", 15, 38990], ["트레이닝/조거 팬츠", "잇자바이브", "CHOCOCAT STAR POCKET PANTS - BLACK", 28, 70560], ["트레이닝/조거 팬츠", "디미트리블랙", "[10주년기획] © 오블리크 인시전 스웻 팬츠_3 COLOR", 20, 33900]];
// 무신사 분류 → [종류, 세부 종류, 태그, 데모 사진, 치수 견본 그룹, 총장 보정 cm]
const MSMAP = {
  '긴소매 티셔츠': ['top', '긴팔 티셔츠', '티셔츠', ['ltee', 'tee2']], '셔츠/블라우스': ['top', '긴팔 셔츠', '셔츠', ['hero', 'base', 'oxford', 'dshirt']],
  '반소매 티셔츠': ['top', '반팔 티셔츠', '티셔츠', ['tee']], '니트/스웨터': ['top', '긴팔 티셔츠', '니트', ['knit']],
  '후드 티셔츠': ['top', '후드티', '티셔츠', ['tee2', 'ltee']], '맨투맨/스웨트': ['top', '긴팔 티셔츠', '티셔츠', ['ltee', 'knit']],
  '숏패딩/헤비 아우터': ['outer', '숏패딩', '아우터', ['puffer', 'lpuffer', 'pdHero']], '롱패딩/헤비 아우터': ['outer', '롱패딩', '아우터', ['puffer', 'lpuffer'], 'outer-s', 30],
  '블루종/MA-1': ['outer', '점퍼/자켓', '아우터', ['jacket', 'suede']], '레더/라이더스 재킷': ['outer', '점퍼/자켓', '아우터', ['leather', 'suede']],
  '후드 집업': ['outer', '점퍼/자켓', '아우터', ['jacket', 'leather']], '카디건': ['outer', '가디건', '아우터', ['knit']],
  '겨울 싱글 코트': ['outer', '숏코트', '아우터', ['jacket', 'suede', 'leather']], '환절기 코트': ['outer', '롱코트', '아우터', ['jacket', 'suede'], 'outer-s', 30],
  '트러커 재킷': ['outer', '점퍼/자켓', '아우터', ['jacket', 'leather', 'suede']], '데님 팬츠': ['bottom', '긴바지', '팬츠', ['denim', 'wide', 'blackp']],
  '코튼 팬츠': ['bottom', '긴바지', '팬츠', ['slacks', 'wide']], '슈트 팬츠/슬랙스': ['bottom', '긴바지', '팬츠', ['slacks']],
  '숏 팬츠': ['bottom', '반바지', '팬츠', ['denim', 'slacks'], 'pants-l', -50], '트레이닝/조거 팬츠': ['bottom', '긴바지', '팬츠', ['slacks', 'blackp']],
};
{ // 치수는 같은 그룹 상품의 사이즈표를 견본으로 ±1cm 안에서 흔들어 만든 예시 값
  const tplOf = (g) => P.find((x) => x.sizes && grpOf(x) === g), rk = {};
  MSRAW.forEach(([k, brand, name, dc, sp], i) => {
    const r = rk[k] = (rk[k] || 0) + 1; if (P.some((x) => x.brand === brand && x.name === name)) return;
    const [cat, sub, tag, imgs, tg, dl] = MSMAP[k], t = tplOf(tg || grpOf({ cat, sub }));
    const sizes = t ? Object.fromEntries(Object.entries(t.sizes).map(([z, a]) => [z, a.map((v, j) => v ? Math.round((v + (j === 0 && dl ? dl : 0) + ((i * 7 + j * 3) % 5 - 2) * .5) * 2) / 2 : v)])) : null;
    P.push({ id: 'r' + (i + 1), sp, img: imgs[r % imgs.length], brand, name, cat, sub, tag, price: dc ? Math.round(sp / (1 - dc / 100) / 100) * 100 : sp, dc, rate: +(4.5 + (i * 13 % 5) / 10).toFixed(1), rev: 4200 - r * 310 + (i * 37 % 250), sizes, list: sizes ? null : ['S', 'M', 'L', 'XL'], out: [] });
  });
}
// 무신사 상품 썸네일 (개인 데모용). 검색으로 못 찾은 상품은 찾은 상품 정보로 바꿈
const MSFIX = {"p8": ["WAJ3NS301B 벤투스 27 온볼 패딩 자켓 SILVER"], "p9": ["[송이송이x미세키서울] Diagonal reversible shearing jacket BLACK"], "p10": ["모디세이 윈드쉘_LD0274700", 0, 270000], "p11": ["[리얼덕다운] [시티 레저] 시어 후디드 라이트 다운 재킷 (9 colors)"], "p13": ["[후디진호 콜라보] [HD003] 왁스 코팅 부츠컷 카고 데님 팬츠 - 블랙"], "r2": ["Dyed Seoul College Address Ls Tee _Charcoal"], "r6": ["[이도현 PICK] 레귤러 긴소매 크롭 티셔츠 [화이트]"], "r7": ["[이도현 PICK] 레귤러 긴소매 크롭 티셔츠 [블랙]"], "r35": ["[패션플래닛×수아레] 파인 메리노 울 100 니트 (2종)"], "r37": ["[임서진×미세키서울 맨] High neck side button knit CHARCOAL"], "r41": ["[이도현 PICK][스토커즈 컬래버] [빅토리아 울] 미니멀 리브드 크롭 니트 [블랙]"], "r57": ["[한빛 PICK] (woman) 스웻 크롭 반집업_6Color"], "r67": ["피크 고어텍스 자켓_LD0277600", 0, 470000], "r78": ["여성 켈리 구스다운 롱패딩 (BLACK)", 40, 354000], "r90": ["[아네딘, 임데이, 츄르희 PICK] MA-1 FUR HOOD JUMPER_KHAKI"], "r91": ["[아네딘, 임데이 PICK] MA-1 FUR HOOD JUMPER_BLACK"], "r92": ["[이도현 PICK] G-8 웹 플라이트 재킷 [올리브]"], "r94": ["[임서진×미세키서울 맨] Diagonal panel padding jacket BLACK"], "r111": ["Custom Zip Hoodie_Black"], "r116": ["[RIIZE 은석 착용] 워시드 후드 집업 - 미디엄그레이헤더 / LC8294"], "r119": ["[RIIZE 은석 착용] 워시드 후드 집업 - 나이트인디고 / LC8292"], "r126": ["[패션플래닛×수아레] 파인 메리노 울 100 라운드 가디건 - 5 COLOR"], "r127": ["[슬기 PICK] 하트 아가일 가디건(MAGCKC01MCH)"], "r128": ["[스토커즈 컬래버] [빅토리아 울] 라운드 넥 크롭 가디건 (4 colors)"], "r160": ["[이도현 PICK] 벨벳 데님 트러커 재킷 [블랙]"], "r169": ["[한소희 PICK] 우먼즈 에센셜 커브드 데님 팬츠 [미디엄 인디고]"], "r195": ["[송이송이x미세키서울] Multi pleats wide pants BLACK"]};
for (const p of P) { const d = MSIMG[p.id]; if (d) { IMG0['ms_' + p.id] = msImg(d); p.img = 'ms_' + p.id; }
  const f = MSFIX[p.id]; if (f) { p.name = f[0]; if (f.length > 1) { p.dc = f[1]; p.sp = f[2]; p.price = f[1] ? Math.round(f[2] / (1 - f[1] / 100) / 100) * 100 : f[2]; } } }
// 무신사 상세 이미지 (앞쪽 2장) · 옷장용 바닥컷 (누끼, 배경 #f6f6f6)
for (const p of P) { const d = MSDET[p.id]; if (d) p.det = d.map((u, i) => { const k = 'det_' + p.id + '_' + i; IMG0[k] = msImg(u); return k; }); }
for (const k in MSFLAT) IMG0['flat_' + k] = `/api/asset?name=img/flat_${k}.jpg`; // 디자이너가 손본 바닥컷 (배경 #f6f6f6, 색상 칩 지움). 원본 주소는 MSFLAT
const FLAT_SWAP = {"p4": "r44", "p2": "r15", "p1": "r16", "r22": "r21", "r101": "r100", "r172": "r167", "r197": "r196", "r39": "r36"}; // 바닥컷이 없는 옷은 바닥컷 있는 같은 종류 상품으로
const PB = Object.fromEntries(P.map((p) => [p.id, p]));
const won = (n) => n.toLocaleString('ko-KR');
const sale = (p) => p.sp || Math.round(p.price * (100 - p.dc) / 100 / 100) * 100;
const sizeKeys = (p) => p.sizes ? Object.keys(p.sizes) : p.list;
let uid = 1;
// 옷 한 벌. 치수는 그룹 칸 순서. 예전 형식(상의 4 · 바지 5칸) 데이터는 그룹 칸으로 옮기고 늘어난 칸은 예시 값으로 (g: true면 이미 그룹 칸)
const item = (o) => { const x = Object.assign({ id: 'c' + (uid++), fit: null, notes: [], base: false, subBase: false, sub: null, img: null, returned: false, src: '직접 입력', at: uid }, o);
  if (x.m && !x.g) x.m = fromLegacy(x, x.m, true); delete x.g;
  if (x.img && x.brand && !/^(data:|blob:|ms_|flat_)/.test(x.img)) { let p = (x.pid && PB[x.pid]) || P.find((q) => q.brand === x.brand && (q.name === x.name || q.name.includes(x.name) || x.name.includes(q.name)));
    if (p && FLAT_SWAP[p.id]) { p = PB[FLAT_SWAP[p.id]]; x.brand = p.brand; x.name = p.name; if (x.pid) x.pid = p.id; }
    if (p) x.img = IMG0['flat_' + p.id] ? 'flat_' + p.id : p.img; } // 옷장 옷은 무신사 바닥컷
  return x; };
const PRESETS = {
  guest: () => ({ user: null, closet: [] }),
  empty: () => PRESETS.nobase(),
  nobase: () => ({ user: { name: '준성' }, closet: [] }), // 처음 담은 잘 맞는 옷이 기준 옷이 되므로, 기준 옷 없는 회원 = 옷장 0벌
  full: () => ({ user: { name: '준성' }, closet: [
    item({ img: 'base', sub: '긴팔 셔츠', pid: 'p2', brand: '무신사 스탠다드', name: '크롭 옥스포드 셔츠 [화이트]', cat: 'top', size: 'L', m: [74, 50, 58, 60], fit: 'good', base: true, src: '상품 링크' }),
    item({ img: 'hero', sub: '긴팔 셔츠', pid: 'p1', brand: '무신사 스탠다드', name: '[플러스] 릴렉스드 타입라이터 셔츠 [화이트]', cat: 'top', size: 'M', m: [72.5, 51, 58, 59.5], fit: 'good', src: 'DANGJANG 구매' }),
    item({ img: 'tee', sub: '반팔 티셔츠', pid: 'p7', brand: '무신사 스탠다드', name: '릴렉스 핏 크루 넥 티셔츠 2팩', cat: 'top', size: 'L', m: [71, 53, 58, 23], fit: 'good', src: '구매내역 캡처' }),
    item({ img: 'knit', sub: '긴팔 티셔츠', pid: 'p4', brand: '더니트컴퍼니', name: '파인 캐시미어 100 크루넥 10color', cat: 'top', size: 'L', m: [68, 54, 63, 58], fit: 'good', src: '상품 링크' }),
    item({ img: 'denim', sub: '긴바지', brand: '아워데이즈', name: '[젠플록스X아워데이즈] 세미 커브드 데님 팬츠', cat: 'bottom', size: '30', m: [40, 30, 32, 76, 104], fit: 'good', base: true, src: 'A4 촬영' }),
    item({ img: 'slacks', sub: '긴바지', brand: '무신사 스탠다드', name: '헤비웨이트 속기모 세미 와이드 히든 밴딩 슬랙스 [차콜 그레이]', cat: 'bottom', size: '30', m: [41, 31, 33, 77, 106], fit: 'good', src: '상품 링크' }),
    item({ img: 'denim_k', sub: '긴바지', brand: '이투둘', name: 'LAYERED DENIM 003 (BLACK)', cat: 'bottom', size: '30', m: [40, 29, 31, 75, 102], fit: 'good', src: '구매내역 캡처' }),
    item({ img: 'slacks_b', sub: '긴바지', brand: '라이즈앤빌로우', name: 'HBT 302 와이드 스트레이트 치노팬츠 WASHED KHAKI', cat: 'bottom', size: '31', m: [42, 30, 32, 73, 101], fit: 'good', src: 'A4 촬영' }),
    item({ brand: '사일프레이', name: 'Folded Snap Shorts / Black', cat: 'bottom', sub: '반바지', size: '30', m: [40, 30, 33, 18, 46], fit: 'good', src: '직접 입력' }),
    item({ brand: '아수라', name: 'WOOL HANDMADE HALF COAT (BLACK)', cat: 'outer', sub: '롱코트', size: 'L', m: [104, 49, 60, 63], fit: 'good', src: '직접 입력' }),
    item({ img: 'jacket', sub: '점퍼/자켓', pid: 'p3', brand: '스파오', name: '[씬라이트] 후드 재킷_SPJPG4TC24', cat: 'outer', base: true, size: 'M', m: [70, 48, 58, 60], fit: 'good', src: 'DANGJANG 구매' }),
    item({ img: 'leather', sub: '점퍼/자켓', brand: '아워데이즈', name: '노마드 크롭 바이커 레더 자켓 [BLACK]', cat: 'outer', size: 'L', m: [66, 52, 62, 61], fit: 'good', src: '상품 링크' }),
    item({ img: 'suede', sub: '점퍼/자켓', brand: '데이', name: '스웨이드 바이커 패딩 자켓_BROWN', cat: 'outer', size: 'L', m: [64, 50, 60, 62], fit: 'good', src: '구매내역 캡처' }),
  ] }),
  many: () => { const f = PRESETS.full(); f.closet.push(
    item({ img: 'hero', sub: '긴팔 셔츠', brand: '미나브', name: '플루이드 셔츠 [네이비]', cat: 'top', size: 'L', m: [75, 53, 61, 61], fit: 'good', src: '상품 링크' }),
    item({ img: 'ltee', sub: '긴팔 티셔츠', brand: '잇자바이브', name: 'CHOCOCAT RAGLAN T SHIRT - BROWN', cat: 'top', size: 'L', m: [71, 52, 57, 61], fit: 'good', src: '상품 링크' }),
    item({ brand: '에잇세컨즈', name: '스트라이프 셔츠 스카이 블루', cat: 'top', sub: '긴팔 셔츠', size: 'L', m: [74, 50, 58, 60], fit: 'good', src: '직접 입력' }),
    item({ img: 'denim_i', sub: '긴바지', brand: '무신사 스탠다드 우먼', name: '우먼즈 에센셜 커브드 데님 팬츠 [딥 인디고]', cat: 'bottom', size: '30', m: [40, 30, 31.5, 75, 103], fit: 'good', src: '상품 링크' }),
    item({ img: 'slacks_n', sub: '긴바지', brand: '네이비얼', name: '투턱 퓨어 울 슬랙스', cat: 'bottom', size: '30', m: [41, 30, 32, 76, 104], fit: 'good', src: 'A4 촬영' }),
    item({ brand: '노스페이스', name: 'NJ3NS50A 남성 눕시 온볼 패딩 자켓 BLACK', cat: 'outer', sub: '숏패딩', size: 'L', m: [68, 54, 66, 64], fit: 'good', src: '직접 입력' }),
    // 사진 없는 옷: 세부 종류 15종 × 색 케이스 (이름에 색이 없으면 기본 #979797)
    item({ name: '베이직 롱슬리브 티셔츠', cat: 'top', sub: '긴팔 티셔츠', g: true, size: 'L', m: [72, 50, 57, 60, 54, 11, 25], fit: 'good', src: '직접 입력' }),
    item({ name: '린넨 셔츠 화이트', cat: 'top', sub: '긴팔 셔츠', g: true, size: 'L', m: [74, 50, 58, 60, 56, 12, 25], fit: 'good', src: '직접 입력' }),
    item({ name: '오버핏 반팔 티셔츠 옐로우', cat: 'top', sub: '반팔 티셔츠', g: true, size: 'L', m: [71, 55, 19, 23, 54, 25], fit: 'good', src: '직접 입력' }),
    item({ name: '하와이안 반팔 셔츠 그린', cat: 'top', sub: '반팔 셔츠', g: true, size: 'L', m: [73, 56, 20, 24, 55, 25], fit: 'good', src: '직접 입력' }),
    item({ name: '기모 후드티 핑크', cat: 'top', sub: '후드티', g: true, size: 'L', m: [70, 54, 60, 58, 50, 11, 27], fit: 'good', src: '직접 입력' }),
    item({ name: '울 브이넥 가디건 버건디', cat: 'outer', sub: '가디건', g: true, size: 'L', m: [66, 50, 56, 60, 52, 11, 25], fit: 'good', src: '직접 입력' }),
    item({ name: '나일론 블루종 네이비', cat: 'outer', sub: '점퍼/자켓', g: true, size: 'L', m: [68, 52, 60, 62, 58, 13, 27], fit: 'good', src: '직접 입력' }),
    item({ name: '울 숏코트 카멜', cat: 'outer', sub: '숏코트', g: true, size: 'L', m: [80, 49, 59, 62, 58, 14, 28], fit: 'good', src: '직접 입력' }),
    item({ name: '캐시미어 롱코트 차콜', cat: 'outer', sub: '롱코트', g: true, size: 'L', m: [110, 49, 60, 63, 62, 15, 28], fit: 'good', src: '직접 입력' }),
    item({ name: '크롭 숏패딩 라벤더', cat: 'outer', sub: '숏패딩', g: true, size: 'L', m: [62, 54, 64, 62, 62, 14, 29], fit: 'good', src: '직접 입력' }),
    item({ name: '구스다운 롱패딩 카키', cat: 'outer', sub: '롱패딩', g: true, size: 'L', m: [112, 55, 66, 64, 66, 15, 30], fit: 'good', src: '직접 입력' }),
    item({ name: '와이드 코듀로이 팬츠 브라운', cat: 'bottom', sub: '긴바지', g: true, size: '30', m: [104, 40, 52, 32, 30, 22], fit: 'good', src: '직접 입력' }),
    item({ name: '데님 쇼츠 블루', cat: 'bottom', sub: '반바지', g: true, size: '30', m: [46, 40, 53, 32, 30, 29], fit: 'good', src: '직접 입력' }),
    item({ name: '플리츠 롱스커트 베이지', cat: 'bottom', sub: '긴치마', g: true, size: 'M', m: [85, 35, 50, 65], fit: 'good', src: '직접 입력' }),
    item({ name: '울 미니스커트 레드', cat: 'bottom', sub: '짧은 치마', g: true, size: 'M', m: [45, 35, 48, 55], fit: 'good', src: '직접 입력' })); return f },
};
/* ── 상태 ── */
let S;
function reset(preset) {
  const p = PRESETS[preset]();
  S = { preset, recent: ['셔츠', '패딩', '데님 자켓'], user: p.user, closet: p.closet, accounts: { kakao: !!p.user, naver: false, google: false }, pending: [], orders: [], cart: [],
    coupons: p.user ? [{ t: '신규 가입 10% 쿠폰', d: '3만 원 이상 · 10월 31일까지', used: false }] : [], likes: {}, popupSeen: false, notifAsked: false, notifOn: false,
    firstReg: p.closet.length > 0, rack: {}, failNext: false, photoPerm: null, camPerm: null, after: null, ov: null, toast: null, push: null, notis: [], fitTodo: [] };
  nav = [{ s: 'home', p: {} }];
}
let nav = [];
const cur = () => nav[nav.length - 1];
function go(s, p = {}) { saveY(); nav.push({ s, p }); render(true) }
function replace(s, p = {}) { nav[nav.length - 1] = { s, p }; render(true) }
function back() { if (nav.length > 1) { nav.pop(); render() } }
function tab(s) { nav = [{ s, p: {} }]; render(true) }
function saveY() { const b = document.querySelector('#view .body'); if (b && cur()) cur().y = b.scrollTop }
function toast(t) { S.toast = t; clearTimeout(toast.h); toast.h = setTimeout(() => { S.toast = null; render() }, 2600) }
function sheet(html) { S.ov = { k: 'sheet', html } } function modal(html) { S.ov = { k: 'modal', html } } function closeOv() { S.ov = null }
const ofCat = (cat) => S.closet.filter((c) => c.cat === cat);
/* ── 로그인 게이트 (B) ── */
const subBaseOf = (cat, sub) => sub ? S.closet.find((c) => c.cat === cat && c.sub === sub && c.subBase) : null;
// 기준 옷: 세부 종류 기준(내 옷장, 선택)이 있으면 그 옷, 없으면 그룹 기준 옷 (상세 v2)
const baseFor = (p) => { const b = subBaseOf(p.cat, p.sub) || baseOf(p); return b && grpOf(b) === grpOf(p) ? b : null; }; // 세부 종류 기준 → 그룹 기준 옷. 다른 그룹 옷과는 비교 안 함
const pic = (c, st = '') => c.img ? `<img src="${IMG[c.img] || CUT[c.img]}" style="${st}">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#B5B5B5;background:var(--gray);padding:12%">${tplSvg(c)}</div>`;
const catGrid = (on, a) => `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${CATS.map((c) => `<button data-a="${a}" data-x="${c.k}" style="height:72px;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:14px;${c.k === on ? 'border:1px solid var(--primary);background:var(--primary-subtle);font-weight:700' : 'border:1px solid var(--line);color:var(--ink2)'}">${I[c.icon]}${c.label}</button>`).join('')}</div>`;
const pill = (on, a, x, t) => `<button data-a="${a}" data-x="${x}" style="height:36px;min-width:48px;padding:0 12px;border-radius:18px;font-size:14px;flex:none;${on ? 'background:var(--primary);color:var(--on-primary);font-weight:700' : 'border:1px solid var(--line)'}">${t}</button>`;
/* ── 로그인 게이트 (B) ── */
function need(reason, then) {
  if (S.user) return then();
  S.after = then;
  sheet(`<button class="lgx" data-a="closeOv" aria-label="닫기">${I.close}</button><div class="lglogo">${LOGO('#FFFFFF', 224)}</div><p class="lgwhy">${reason}</p>
    <div class="lgbtns"><button class="lgb" style="background:#F1F1F1;color:#1E1E1E" data-a="social" data-x="google">Google로 계속하기</button>
    <button class="lgb" style="background:#FFEA64;color:#1E1E1E" data-a="social" data-x="kakao">카카오로 계속하기</button><button class="lgb" style="background:#47CC54;color:#FFFFFF" data-a="social" data-x="naver">네이버로 계속하기</button></div>`);
  S.ov.k = 'sheet lgfull';
  S.ov.node = '⑦ 로그인 게이트 · 로그인 했나? → 아니오 · 로그인 안내 시트';
  render();
}
function afterLogin() { const f = S.after; S.after = null; if (f) f(); else render() }

/* ── 사이즈 판단 (F) ── */
function judge(p) {
  if (!S.user) return { n: 1 };
  if (!S.closet.length) return { n: 2 };
  if (!famOf(p).length) return { n: 3 }; // 같은 그룹 옷이 없음 (상세 v2)
  const base = baseFor(p);
  if (!base) return { n: 4 };
  if (!p.sizes) return { n: 'x', base };
  const best = recOf(p, base);
  return { n: 5, base, rec: best.k, d: best.d };
}
function recOf(p, base) {
  let best = null;
  for (const k of Object.keys(p.sizes).filter((k) => !p.out.includes(k))) { const d = p.sizes[k].map((v, i) => v && base.m[i] ? +(v - base.m[i]).toFixed(1) : 0); const sc = d.reduce((a, v, i) => a + Math.abs(v) * (i === 0 || i === 1 ? 1.3 : 1), 0); if (!best || sc < best.sc) best = { k, d, sc } }
  return best;
}
const deltaOf = (p, base, k) => p.sizes[k].map((v, i) => v && base.m[i] ? +(v - base.m[i]).toFixed(1) : 0); // 기준 옷에 없는 칸은 비교에서 뺌
function describe(p, base, k) {
  const kind = base.sub || CAT[p.cat], s = partLine(p, deltaOf(p, base, k));
  return s ? `${k} 사이즈는 내 ${kind}와 비교하면<br>${s}` : `${k} 사이즈는 내 ${kind}와 비슷해요`;
}
const fmtD = (v) => v === 0 ? '0' : (v > 0 ? '+' : '−') + Math.abs(v);

/* ── 화면 조각 ── */
const sbar = (white) => `<div class="sb ${white ? 'w' : ''}"><span>9:41</span><span class="r">${SB(white ? '#fff' : '#111')}</span></div>`;
const hdrBack = (t, right = '') => `<div class="hdr"><button data-a="back" aria-label="뒤로">${I.back}</button>${t ? `<span class="t">${t}</span>` : ''}<span class="icons">${right || '<span style="width:24px"></span>'}</span></div>`;
const cartBtn = () => `<button data-a="go" data-x="cart" aria-label="장바구니">${I.bag}${S.cart.length ? `<span class="cnt">${S.cart.length}</span>` : ''}</button>`;
function fitChip() { return '' } /* 홈 상품 카드에는 사이즈 배지를 붙이지 않아요. 사이즈는 상품 상세에서 보여줘요 */
// 상품 카드 (모든 상품 리스트 공통 · 피그마 home_01): 이미지 · 브랜드 · 상품명(최대 2줄) · 할인율+가격
const cardBody = (p) => `<div class="br">${p.brand}</div><div class="nm">${p.name}</div><div class="price">${p.dc ? `<em>${p.dc}%</em>` : ''}${won(sale(p))}원</div>`;
const card = (p) => `<button class="card" data-a="detail" data-x="${p.id}"><div class="img"><img src="${IMG[p.img]}" alt="">${fitChip(p)}</div>${cardBody(p)}</button>`;
function navBar(on) {
  return `<div class="nav">${[['home', 'home', '홈'], ['search', 'grid', '카테고리'], ['closet', 'hanger', '내옷장'], ['my', 'user', '마이']].map(([s, i, t]) => `<button class="${on === s ? 'on' : ''}" data-a="tab" data-x="${s}">${I[i]}<span>${t}</span></button>`).join('')}</div>`;
}

/* ── 화면 ── */
const SCR = {};
SCR.splash = () => ({ node: '앱 실행 · 스플래시 → 업데이트 · 연결 · 로그인 확인', full: true, body: `
  <div style="position:absolute;inset:0;background:var(--g);display:flex;align-items:center;justify-content:center" data-a="splashGo">${LOGO('#FFFFFF', 224)}</div>` });
function regCard() {
  const t = '사이즈 고민, 내 옷으로 풀어요';
  const d = '자주 입는 옷과 비교해서 상품마다 어디가 크고 작은지 알려 드려요';
  return `<button class="regcard" data-a="homeReg"><span class="ri">${I.top}</span><span class="rt"><b>${t}</b><small>${d}</small></span>${I.chev}</button>`;
}
const RANK_MOVE = { p7: '▲ 2', p2: '–', p12: 'NEW', p8: '▼ 1', p6: '▲ 4', p14: 'NEW', p11: '▲ 1', p1: '▼ 2', p13: '–', p9: '▲ 3', p15: '▼ 1', p4: '–', p3: '▲ 1', p10: '▼ 3', p5: '–', p16: 'NEW' };
const EXH = [
  { img: 'm1', tag: '기획전', t: '26 FW 아우터 위크', d: '최대 35% 할인 · 10.20 – 10.31', ids: ['p8', 'p11', 'p10', 'p9', 'p3'] },
  { img: 'm2', tag: '신상', t: '이번 주 신상 셋업', d: '사이즈 비교가 되는 상품만 모았어요', ids: ['p12', 'p14', 'p13', 'p6'] },
  { img: 'oxford', tag: '테마', t: '출근룩 셔츠 모음', d: '옥스퍼드부터 데님 셔츠까지', ids: ['p2', 'p1', 'p15', 'p4'] },
];
const EVT = [
  { img: 'puffer', t: '옷 1벌 등록하면 10% 쿠폰', d: '옷장에 첫 옷을 등록하면 바로 받아요', dd: 'D-10' },
  { img: 'tee2', t: '첫 구매 무료 배송', d: '가입 후 첫 주문은 배송비 0원', dd: '상시' },
  { img: 'wide', t: '리뷰 쓰면 적립금 2,000원', d: '사진 리뷰는 3,000원을 드려요', dd: 'D-3' },
];
/* 카테고리: 지금은 상의 · 하의 · 아우터 3개. 늘릴 때는 CAT과 CATS에 한 줄씩 추가하면 홈 바로가기와 랭킹 칩에 같이 반영돼요 */
const QI = {
  all: sv('<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>', 28, 1.6),
  top: I.top, bottom: I.bottom,
  outer: sv('<path d="M9 3.5h6l4.6 2.6 1.6 13.4h-3.1l-.9-8.2V20.5H6.8V11.3l-.9 8.2H2.8L4.4 6.1z"/><path d="M9 3.5l3 3.2 3-3.2"/><path d="M12 6.7v13.8"/><path d="M8.3 14.5h1.9M13.8 14.5h1.9"/>', 28, 1.6),
  newin: sv('<path d="M12 3.5l1.9 4.6 4.6 1.9-4.6 1.9L12 16.5l-1.9-4.6L5.5 10l4.6-1.9z"/><path d="M18.5 15.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z"/>', 28, 1.6),
  rank: sv('<path d="M4.5 8l3.8 3.2L12 5l3.7 6.2L19.5 8l-1.6 10.5H6.1z"/><path d="M7 21h10"/>', 28, 1.6),
  sale: sv('<path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1 1 0 0 1 0 1.4l-7.4 7.4a1 1 0 0 1-1.4 0z"/><circle cx="8.3" cy="8.3" r="1.5"/>', 28, 1.6),
  closet: sv('<path d="M12 8.5a2 2 0 1 1 2-2"/><path d="M12 8.5v1L3.5 16.5h17L12 9.5"/>', 28, 1.6),
};
const QUICK = [['all', '전체', 'go'], ...CATK.map((c) => [c, CAT[c], 'go'])];
function saleLeft() { const n = new Date(), e = new Date(n); e.setHours(24, 0, 0, 0); let t = Math.max(0, Math.floor((e - n) / 1000)); const h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), x = t % 60; return [h, m, x].map((v) => String(v).padStart(2, '0')).join(':') }
setInterval(() => { const el = document.getElementById('saleT'); if (el) el.textContent = saleLeft() }, 1000);
const orig = (p) => p.dc ? `<span class="orig">${won(p.price)}원</span>` : '';
const rankCard = (p, n) => `<button class="card rcard" data-a="detail" data-x="${p.id}"><div class="img"><img src="${IMG[p.img]}" alt=""><span class="rnk">${n}</span>${fitChip(p)}</div>${cardBody(p)}</button>`;
const dealCard = (p) => card(p);
// 레이지 로딩: 처음 20개, 목록 끝(회색 스켈레톤)이 보이면 잠깐 뒤 20개씩 더. 새로 붙은 카드 사진은 흑백에서 컬러로 바뀌어요
const LZ = {};
function lazyGrid(key, items, fn, cls = 'grid2') {
  const lz = S.lz || (S.lz = {}), n = Math.min(items.length, lz[key] || 20); LZ[key] = { items, fn };
  return `<div class="${cls} lzg" data-lz="${key}">${items.slice(0, n).map(fn).join('')}</div>${n < items.length ? `<div class="${cls} lzs" data-lz="${key}">${'<div class="skel"><i></i><b></b><b></b><b></b></div>'.repeat(2)}</div>` : ''}`;
}
function lazyBind() {
  app.querySelectorAll('.lzs').forEach((sk) => {
    const key = sk.dataset.lz, g = [...app.querySelectorAll('.lzg')].find((e) => e.dataset.lz === key);
    const io = new IntersectionObserver((es) => {
      if (!es[0].isIntersecting || sk.busy) return; sk.busy = true;
      setTimeout(() => {
        const L = LZ[key], n0 = S.lz[key] || 20, n = Math.min(L.items.length, n0 + 20);
        g.insertAdjacentHTML('beforeend', L.items.slice(n0, n).map((x, i) => L.fn(x, n0 + i)).join('').replace(/class="card/g, 'class="lzn card'));
        S.lz[key] = n; sk.busy = false;
        if (n >= L.items.length) { io.disconnect(); sk.remove() } else { io.unobserve(sk); io.observe(sk) }
      }, 700);
    }, { root: sk.closest('.body'), rootMargin: '0px 0px 160px 0px' });
    io.observe(sk);
  });
}
const saleCard = (p) => card(p);
const miniCard = (p) => card(p);

/* ── 개인화: 랭킹 상품 중 내 기준 옷과 실측이 비슷한 상품 ──
   부위별 차이 0cm = 100%, 5cm 이상 = 0%로 바꿔 평균 낸 값. 가장 비슷한 사이즈 기준, 70% 이상만 보여줘요.
   회원 데이터 없이 상품 사이즈표만으로 계산해요. 이미 옷장에 있는 상품은 빼요 */
const simPct = (x, b, k) => { const d = x.sizes[k].map((v, i) => v && b.m[i] ? Math.abs(v - b.m[i]) : null).filter((v) => v != null); return d.length ? Math.round(d.reduce((a, v) => a + Math.max(0, 1 - v / 5), 0) / d.length * 100) : 0; }; // 두 옷 모두 잰 부위만
function simFit() {
  const bases = S.closet.filter((c) => c.base); if (!bases.length) return '';
  const b = bases.find((c) => c.id === S.simB) || bases[0], open = !!S.simDD;
  const rank = P.slice().sort((x, y) => y.rev - x.rev).map((x) => x.id), owned = S.closet.map((c) => c.pid);
  const same = (x) => b.sub ? x.sub === b.sub : x.cat === b.cat; // 같은 2뎁스끼리, 기준 옷에 2뎁스가 없으면 같은 1뎁스
  const items = rank.map((id) => PB[id]).filter((x) => x.sizes && !owned.includes(x.id) && x.cat === b.cat && grpOf(x) === grpOf(b) && same(x)).map((x) => {
    const best = Object.keys(x.sizes).map((k) => ({ k, pct: simPct(x, b, k) })).sort((m, n) => n.pct - m.pct)[0];
    return { x, k: best.k, pct: best.pct };
  }).filter((e) => e.pct >= 70);
  const row = (c) => `<span class="simpic">${cutPic(c)}</span><span class="simtx"><b>${c.name} ${c.size}</b><small>${c.sub || CAT[c.cat]}</small></span>`;
  return `<div class="sec"><h3>${S.user.name}님 옷장 기준으로 골랐어요</h3></div>
  <p class="psub">비교할 내 옷을 고르면, 랭킹 상품 중 실측이 가까운 상품을 보여 드려요</p>
  <div class="simdd ${open ? 'open' : ''}"><button class="simbox" data-a="simOpen" aria-expanded="${open}">${row(b)}<span class="simarr">${I.down}</span></button>
    ${open ? `<div class="simlist" role="listbox">${bases.map((c) => `<button class="simopt ${c.id === b.id ? 'on' : ''}" role="option" aria-selected="${c.id === b.id}" data-a="simPick" data-x="${c.id}">${row(c)}${c.id === b.id ? `<span class="simchk">${I.check}</span>` : ''}</button>`).join('')}</div>` : ''}</div>
  ${items.length ? `<div class="hscroll">${items.map(({ x, k, pct }) => `<button class="card pcard" data-a="detail" data-x="${x.id}"><div class="img"><img src="${IMG[x.img]}" alt=""></div><div class="br" style="margin-top:8px">${x.brand}</div><div class="nm">${x.name}</div><div class="price">${x.dc ? `<em>${x.dc}%</em>` : ''}${won(sale(x))}원</div><div class="pfit"><b>${pct}%</b> 비슷해요<span>${k} 사이즈 · 내 ${b.name.split(' ').pop()} 기준</span></div></button>`).join('')}</div>`
    : `<div class="simnone">아직 이 옷과 실측이 가까운 ${b.sub || CAT[b.cat]} 랭킹 상품이 없어요</div>`}`;
}
// 목록이 펼쳐진 동안 바깥을 누르면 목록만 닫음 (다른 버튼은 눌리지 않음)
document.getElementById('app').addEventListener('click', (e) => {
  if (!S.simDD || e.target.closest('.simdd')) return;
  e.stopPropagation(); e.preventDefault(); S.simDD = false; saveY(); render();
}, true);
function tabRec(base, todo, mine) {
  return `<button class="img" style="position:relative;height:250px;width:100%;display:block" data-a="detail" data-x="p3"><img src="${IMG.jacket}" style="object-position:50% 40%"><div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.45),rgba(0,0,0,0) 65%)"></div>
    <div style="position:absolute;left:20px;bottom:24px;color:#FFFFFF;text-align:left"><div style="font-size:11px;font-weight:700;letter-spacing:.12em">COLLECTION</div><div style="font-size:26px;font-weight:800;letter-spacing:-.02em;line-height:1.15;margin-top:6px">MEA 26 FW<br>SEASON OPEN</div></div></button>
  ${base.length ? '' : regCard()}
  ${dlvCard()}
  ${base.length ? simFit() : ''}
  <div class="sec"><h3>인기 상품</h3></div>
  ${lazyGrid('pop', P.slice().sort((a, b) => b.rate * b.rev - a.rate * a.rev).slice(0, 100), (x) => card(x))}
  <div style="height:16px"></div>`;
}
function tabRank(p) {
  const rc = p.rc || '전체', rp = p.rp || '실시간', rs = p.rs || '전체';
  const ck = CATK.find((c) => CAT[c] === rc);
  let list = P.filter((x) => (rc === '전체' || CAT[x.cat] === rc) && (rs === '전체' || x.sub === rs));
  if (rp === '실시간') list.sort((a, b) => b.rev - a.rev); else if (rp === '일간') list.sort((a, b) => b.dc * 100 + b.rev / 100 - (a.dc * 100 + a.rev / 100)); else list.sort((a, b) => b.rate - a.rate || b.rev - a.rev);
  return `<div class="tabs ctabs rtabs">${['전체'].concat(CATK.map((c) => CAT[c])).map((x) => `<button class="${x === rc ? 'on' : ''}" data-a="rankCat" data-x="${x}">${x}</button>`).join('')}</div>
  ${ck ? `<div class="chips">${['전체'].concat(SUB[ck]).map((x) => `<button class="chip ${x === rs ? 'on' : ''}" data-a="rankSub" data-x="${x}">${x}</button>`).join('')}</div>` : ''}
  <div class="rhead"><div class="seg2">${['실시간', '일간', '주간'].map((x) => `<button class="${x === rp ? 'on' : ''}" data-a="rankPeriod" data-x="${x}">${x}</button>`).join('')}</div><span class="rtime">10월 21일 14:00 기준</span></div>
  ${list.length ? `${lazyGrid(`rank:${rc}:${rs}:${rp}`, list.slice(0, 200), (x, i) => rankCard(x, i + 1), 'grid3r')}` : `<div class="rempty">아직 ${rs} 상품이 없어요</div>`}`;
}
function tabSale(p) {
  const min = +(p.sm || 0);
  const deals = P.filter((x) => x.dc > 0).sort((a, b) => b.dc - a.dc).slice(0, 4);
  const list = P.filter((x) => x.dc > 0 && x.dc >= min).sort((a, b) => b.dc - a.dc);
  return `<div class="tbanner"><div><small>TIME SALE</small><b>오늘만 특가</b></div><div class="timer"><small>남은 시간</small><b id="saleT">${saleLeft()}</b></div></div>
  <div class="sec"><h3>타임 특가</h3><span>${deals.length}개 상품</span></div>
  <div class="hscroll">${deals.map(dealCard).join('')}</div>
  <div class="sec" style="margin-bottom:0"><h3>할인 상품<small>${list.length}</small></h3></div>
  <div class="chips">${[[0, '전체'], [20, '20% 이상'], [30, '30% 이상']].map(([v, n]) => `<button class="chip ${v === min ? 'on' : ''}" data-a="saleMin" data-x="${v}">${n}</button>`).join('')}</div>
  <div class="grid2" style="padding:6px 16px 24px">${list.map(saleCard).join('')}</div>`;
}
function tabExh() {
  return EXH.map((e) => `<div class="exh"><button class="img exhimg" data-a="detail" data-x="${e.ids[0]}"><img src="${IMG[e.img]}" alt="" style="object-position:50% 25%"><div class="shade"></div><div class="et"><span class="etag">${e.tag}</span><b>${e.t}</b><small>${e.d}</small></div></button>
    <div class="exhrow">${e.ids.map((id) => miniCard(PB[id])).join('')}</div></div>`).join('') + '<div style="height:24px"></div>';
}
function tabEvt() {
  const got = S.cpGot;
  return `<div class="cpn"><div><small>COUPON</small><b>신규 가입 10% 쿠폰</b><span>3만 원 이상 구매 시 · 10월 31일까지</span></div><button class="cbtn ${got ? 'got' : ''}" data-a="coupon">${got ? '받았어요' : '쿠폰 받기'}</button></div>
  <div class="sec"><h3>진행 중인 이벤트</h3><span>${EVT.length}개</span></div>
  ${EVT.map((e) => `<div class="evt"><div class="img evimg"><img src="${IMG[e.img]}" alt=""></div><div class="ev"><span class="dd">${e.dd}</span><b>${e.t}</b><small>${e.d}</small></div></div>`).join('')}
  <div style="height:24px"></div>`;
}
SCR.home = (p) => {
  const t = p.t || '추천';
  const base = ['top', 'bottom', 'outer'].map((c) => baseOf(c)).filter(Boolean);
  const mine = base.length ? P.filter((x) => judge(x).n === 5) : [];
  const st = S.user ? (base.length ? '기준 옷 있음' : '기준 옷 없음') : '비회원';
  const node = t === '추천' ? (base.length ? '① 홈 · 추천 · 기준 옷 있음 · 옷장 기준으로 고른 랭킹 상품' : `① 홈 · 추천 · ${st} · 슬라이드 아래 등록 카드`) : `① 홈 · ${t} 탭`;
  const body = t === '랭킹' ? tabRank(p) : t === '세일' ? tabSale(p) : t === '기획전' ? tabExh() : t === '이벤트' ? tabEvt() : tabRec(base, null, mine);
  return { node, navOn: 'home', fab: `<button class="totop" data-a="toTop" aria-label="맨 위로">${ICO_UP}</button>`, body: `
  <div class="hdr"><span>${LOGO()}</span><span class="icons"><button class="hsrch" data-a="findGo" aria-label="검색">${I.search}</button><button data-a="go" data-x="notis" aria-label="알림">${I.bell}${S.notis.some((n) => !n.read) ? '<span class="cnt" style="background:var(--sale);min-width:8px;height:8px;top:0;right:0;padding:0"></span>' : ''}</button>${cartBtn()}</span></div>
  <div class="pad" style="padding-bottom:6px"><button class="search" data-a="findGo"><span>SALOMON FW 신상 발매</span>${I.search}</button></div>
  <div class="tabs htabs">${['추천', '랭킹', '세일', '기획전', '이벤트'].map((x) => `<button class="${x === t ? 'on' : ''}" data-a="homeTab" data-x="${x}">${x}</button>`).join('')}</div>
  ${body}` };
};

/* ── 카테고리 (1뎁스 → 2뎁스) ── */
SCR.searchOld = () => ({ node: '카테고리 · 상의 · 하의 · 아우터 → 2뎁스', navOn: 'search', body: `
  <div class="hdr"><span style="font-size:20px;font-weight:700">카테고리</span><span class="icons"><button data-a="findGo" aria-label="검색">${I.search}</button>${cartBtn()}</span></div>
  ${CATK.map((c) => `<div class="csec"><div class="chead"><b>${CAT[c]}</b><button data-a="catGo" data-x="${c}|전체">전체 보기${I.chev}</button></div>
    <div class="cgrid">${SUB[c].map((x) => `<button data-a="catGo" data-x="${c}|${x}">${x}</button>`).join('')}</div></div>`).join('')}
  <div style="height:24px"></div>` });
SCR.clist = (p) => {
  const c = p.c, sub = p.s || '전체';
  const list = sortBy(P.filter((x) => x.cat === c && (sub === '전체' || x.sub === sub)), p.o);
  return { node: `카테고리 · ${CAT[c]} > ${sub} · 상품 목록`, navOn: 'search', body: `
  ${hdrBack(CAT[c], cartBtn())}
  <div class="subs" style="border-bottom:1px solid var(--line);padding-bottom:6px">${['전체'].concat(SUB[c]).map((x) => `<button class="${x === sub ? 'on' : ''}" data-a="listSub" data-x="${x}">${x}</button>`).join('')}</div>
  <div class="lhead"><span>상품 ${list.length}개</span>${sortBtn(p)}</div>
  ${list.length ? `<div class="grid2" style="padding-bottom:24px">${list.map(card).join('')}</div>` : `<div class="rempty">아직 ${sub} 상품이 없어요</div>`}` };
};

/* 카테고리 · 랭킹형 (A: 1뎁스 칩 + 2뎁스 글자 / B: 1뎁스 탭 + 2뎁스 칩) */
SCR.search = (p) => {
  const c = p.c || 'top', sub = p.s || '전체', v = S.catV || 'B';
  const list = sortBy(P.filter((x) => x.cat === c && (sub === '전체' || x.sub === sub)), p.o);
  const subs = ['전체'].concat(SUB[c]);
  const top = v === 'A'
    ? `<div class="chips">${CATK.map((k) => `<button class="chip ${k === c ? 'on' : ''}" data-a="catC" data-x="${k}">${CAT[k]}</button>`).join('')}</div>
       <div class="subs">${subs.map((x) => `<button class="${x === sub ? 'on' : ''}" data-a="catS" data-x="${x}">${x}</button>`).join('')}</div>`
    : `<div class="tabs ctabs">${CATK.map((k) => `<button class="${k === c ? 'on' : ''}" data-a="catC" data-x="${k}">${CAT[k]}</button>`).join('')}</div>
       <div class="chips">${subs.map((x) => `<button class="chip ${x === sub ? 'on' : ''}" data-a="catS" data-x="${x}">${x}</button>`).join('')}</div>`;
  return { node: `카테고리 · ${CAT[c]} > ${sub}`, navOn: 'search', body: `
  <div class="hdr"><span style="font-size:20px;font-weight:700">카테고리</span><span class="icons"><button data-a="findGo" aria-label="검색">${I.search}</button>${cartBtn()}</span></div>
  ${top}
  <div class="lhead"><span>상품 ${list.length}개</span>${sortBtn(p)}</div>
  ${list.length ? `<div class="grid2" style="padding-bottom:24px">${list.map(card).join('')}</div>` : `<div class="rempty">아직 ${sub} 상품이 없어요</div>`}` };
};

/* ── 정렬 (기본 인기순) ── */
const SORTS = ['인기순', '최신순'];
const sortBtn = (p) => `<button class="sortbtn" data-a="sortOpen">${p.o || '인기순'}<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>`;
const sortBy = (list, o) => list.sort(o === '최신순' ? (a, b) => +b.id.slice(1) - +a.id.slice(1) : (a, b) => b.rate * b.rev - a.rate * a.rev);

/* ── 검색 · 검색 결과 ── */
const HOT = ['숏패딩', '셔츠', '데님', '레더 자켓', '티셔츠', '블루종', '니트', '롱슬리브', '슬랙스', '후드 자켓'];
const KW = [...new Set(P.flatMap((x) => [x.name, x.sub, CAT[x.cat], x.brand]).filter(Boolean).concat(HOT))];
const findBar = (q, back) => `<div class="hdr fhdr">${back ? `<button data-a="back" aria-label="뒤로">${I.back}</button>` : ''}<label class="fbox">${I.search}<input class="fin" type="search" enterkeyhint="search" placeholder="브랜드, 상품을 검색해 보세요" value="${esc(q || '')}"><button class="fx" data-a="findClear" aria-label="지우기" ${q ? '' : 'hidden'}>×</button></label>${back ? '' : '<button class="fcancel" data-a="back">취소</button>'}</div>`;
const findHit = (q) => { const t = q.replace(/\s/g, ''); return P.filter((x) => [x.name, x.brand, x.sub, CAT[x.cat], x.tag].some((v) => v && v.replace(/\s/g, '').includes(t))) };
SCR.find = () => ({ node: '검색 · 최근 검색어 · 인기 검색어', body: `
  ${findBar('', false)}
  <div id="sugg"></div>
  <div id="fhome">
  ${S.recent.length ? `<div class="fsec"><div class="fh"><b>최근 검색어</b><button data-a="recentAll">전체 삭제</button></div><div class="rchips">${S.recent.map((k) => `<span class="rchip"><button data-a="findDo" data-x="${esc(k)}">${esc(k)}</button><button class="rdel" data-a="recentDel" data-x="${esc(k)}" aria-label="삭제">×</button></span>`).join('')}</div></div>` : ''}
  <div class="fsec"><div class="fh"><b>인기 검색어</b><span>10월 22일 14:00 기준</span></div>
    <ol class="hot">${HOT.map((k, i) => `<li><button data-a="findDo" data-x="${k}"><em>${i + 1}</em>${k}</button></li>`).join('')}</ol></div>
  </div>` });
SCR.result = (p) => {
  const raw = p.q, q = esc(raw), c = p.c || '전체';
  const all = sortBy(findHit(raw), p.o);
  const list = all.filter((x) => c === '전체' || CAT[x.cat] === c);
  const cats = ['전체'].concat(CATK.map((k) => CAT[k]).filter((n) => all.some((x) => CAT[x.cat] === n)));
  return { node: `검색 결과 · '${q}' ${all.length}개`, body: `
  ${findBar(raw, true)}
  ${all.length ? `<div class="chips fchips">${cats.map((x) => `<button class="chip ${x === c ? 'on' : ''}" data-a="findCat" data-x="${x}">${x}</button>`).join('')}</div>
  <div class="lhead"><span>상품 ${list.length}개</span>${sortBtn(p)}</div>
  <div class="grid2" style="padding-bottom:24px">${list.map(card).join('')}</div>`
  : `<div class="fnone"><b>'${q}' 검색 결과가 없어요</b><p>다른 검색어로 찾아보세요</p></div>
  <div class="fsec"><div class="fh"><b>인기 검색어</b></div><div class="rchips">${HOT.slice(0, 6).map((k) => `<span class="rchip"><button data-a="findDo" data-x="${k}">${k}</button></span>`).join('')}</div></div>`}` };
};

/* ── 렌더 ── */
function shapeTop(m) {
  const k = 2.35, cx = 170, top = 10, sy = top + 8, sh = m[1] / 2 * k, ch = m[2] / 2 * k, hh = (m[2] - 2) / 2 * k, sl = m[3] * k, cuff = 9 * k, arm = 21 * k, len = m[0] * k;
  const orx = cx + sh + sl * .5, ory = sy + sl * .866, irx = orx - cuff * .866, iry = ory + cuff * .5, olx = cx - sh - sl * .5, ilx = olx + cuff * .866;
  const P2 = [cx - 20, top, cx, top + 22, cx + 20, top, cx + sh, sy, orx, ory, irx, iry, cx + ch, sy + arm, cx + hh, top + len, cx - hh, top + len, cx - ch, sy + arm, ilx, iry, olx, ory, cx - sh, sy];
  const r = (i) => P2[i].toFixed(1) + ' ' + P2[i + 1].toFixed(1);
  let d = 'M' + r(0) + 'Q' + r(2) + ' ' + r(4); for (let i = 6; i < P2.length; i += 2) d += 'L' + r(i); return d + 'Z';
}
function shapeBot(m) {
  const k = 1.95, cx = 170, top = 8, w = m[0] * k, rise = m[1] * k, th = m[2] * k, len = m[4] * k, hem = th * .74;
  const pts = [[cx - w / 2, top], [cx + w / 2, top], [cx + th, top + rise], [cx + th - 3, top + len], [cx + th - 3 - hem, top + len], [cx, top + rise + 4], [cx - th + 3 + hem, top + len], [cx - th + 3, top + len], [cx - th, top + rise]];
  return 'M' + pts.map((q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L') + 'Z';
}
const shapeOf = (cat, m) => cat === 'bottom' ? shapeBot(m) : shapeTop(m);
const FLAT_SRC = {"shirt-l": {"t": "top", "o": "M594 215 C514 240 402 286 350 327 C284 480 243 712 218 1192 L209 1282 Q271 1308 351 1296 L432 923 L410 1299 Q750 1366 1090 1299 L1068 923 L1149 1296 Q1229 1308 1291 1282 L1282 1192 C1257 712 1216 480 1150 327 C1098 286 986 240 906 215 L860 148 Q750 176 640 148 Z", "ds": ["M218 1192 Q291 1215 364 1207", "M1136 1207 Q1209 1215 1282 1192", "M350 327 C390 420 430 545 435 632 V923", "M1150 327 C1110 420 1070 545 1065 632 V923", "M435 923 L410 1299", "M1065 923 L1090 1299", "M640 148 C651 210 689 254 750 286 C811 254 849 210 860 148", "M594 215 C610 277 633 329 659 361 Q666 368 676 356 C699 329 725 303 750 286", "M906 215 C890 277 867 329 841 361 Q834 368 824 356 C801 329 775 303 750 286", "M665 211 H835", "M750 286 V1334"], "np": [906, 215], "sp": [1150, 327], "ap": [[1065, 632], [1068, 923], [1065, 923]], "hem": [[1090, 1299], [750, 1366], [750, 1334]], "cuff": [[1291, 1282], [1149, 1296], [1229, 1308], [1282, 1192], [1136, 1207], [1209, 1215]], "fixed": [[860, 148], [835, 211], [750, 286], [841, 361]], "ref": [74, 47, 56, 61, 54, 12, 24], "u": 14.64864864864865}, "tee-l": {"t": "top", "o": "M594 179 C512 205 397 275 345 326 C278 483 233 690 216 854 C204 1003 208 1142 237 1228 L249 1290 Q312 1307 379 1290 L410 952 V1301 Q750 1344 1090 1301 V952 L1121 1290 Q1188 1307 1251 1290 L1263 1228 C1292 1142 1296 1003 1284 854 C1267 690 1222 483 1155 326 C1103 275 988 205 906 179 Q750 211 594 179 Z", "ds": ["M237 1228 Q312 1244 390 1229", "M1110 1229 Q1188 1244 1263 1228", "M345 326 C389 436 410 548 410 659 V952", "M1155 326 C1111 436 1090 548 1090 659 V952", "M558 192 C574 266 620 329 696 351 Q750 368 804 351 C880 329 926 266 942 192", "M594 179 C608 247 650 292 705 310 Q750 327 795 310 C850 292 892 247 906 179", "M603 213 Q750 245 897 213"], "np": [906, 179], "sp": [1155, 326], "ap": [[1090, 659], [1090, 952]], "hem": [[1090, 1301], [750, 1344]], "cuff": [[1251, 1290], [1121, 1290], [1188, 1307], [1263, 1228], [1110, 1229], [1188, 1244]], "fixed": [[942, 192], [897, 213], [750, 368], [750, 327], [750, 211]], "ref": [70, 50, 56, 60, 54, 10, 24], "u": 16.02857142857143}, "shirt-s": {"t": "top", "o": "M594 215 C515 239 426 277 350 327 L245 606 Q317 672 407 669 L449 520 L430 1240 Q750 1300 1070 1240 L1051 520 L1093 669 Q1183 672 1255 606 L1150 327 C1074 277 985 239 906 215 L860 148 Q750 176 640 148 Z", "ds": ["M245 606 Q317 660 407 657", "M1093 657 Q1183 660 1255 606", "M350 327 C396 390 429 449 449 520", "M1150 327 C1104 390 1071 449 1051 520", "M640 148 C651 210 689 254 750 286 C811 254 849 210 860 148", "M594 215 C610 277 633 329 659 361 Q666 368 676 356 C699 329 725 303 750 286", "M906 215 C890 277 867 329 841 361 Q834 368 824 356 C801 329 775 303 750 286", "M665 211 H835", "M750 286 V1270"], "np": [906, 215], "sp": [1150, 327], "ap": [[1051, 520]], "hem": [[1070, 1240], [750, 1300], [750, 1270]], "cuff": [[1255, 606], [1093, 669], [1183, 672], [1093, 657], [1183, 660]], "fixed": [[860, 148], [835, 211], [750, 286], [841, 361]], "ref": [72, 56, 18, 48, 54, 23], "u": 14.23611111111111}, "tee-s": {"t": "top", "o": "M594 179 C512 205 397 275 345 326 L232 598 Q308 664 398 660 L410 505 V1301 Q750 1344 1090 1301 V505 L1102 660 Q1192 664 1268 598 L1155 326 C1103 275 988 205 906 179 Q750 211 594 179 Z", "ds": ["M247 563 Q318 626 401 622", "M1253 563 Q1182 626 1099 622", "M345 326 C383 392 404 448 410 505", "M1155 326 C1117 392 1096 448 1090 505", "M558 192 C574 266 620 329 696 351 Q750 368 804 351 C880 329 926 266 942 192", "M594 179 C608 247 650 292 705 310 Q750 327 795 310 C850 292 892 247 906 179", "M603 213 Q750 245 897 213"], "np": [906, 179], "sp": [1155, 326], "ap": [[1090, 505]], "hem": [[1090, 1301], [750, 1344]], "cuff": [[1268, 598], [1102, 660], [1192, 664], [1253, 563], [1099, 622], [1182, 626]], "fixed": [[942, 192], [897, 213], [750, 368], [750, 327], [750, 211]], "ref": [70, 57, 19, 48, 55, 24], "u": 16.02857142857143}, "hoodie": {"t": "top", "o": "M628 252 C545 270 412 339 350 411 C284 565 236 760 215 949 C200 1080 205 1210 237 1287 L248 1345 Q318 1364 390 1345 L412 951 V1300 Q750 1350 1088 1300 V951 L1110 1345 Q1182 1364 1252 1345 L1263 1287 C1295 1210 1300 1080 1285 949 C1264 760 1216 565 1150 411 C1088 339 955 270 872 252 C865 188 817 165 750 162 C683 165 635 188 628 252 Z", "ds": ["M237 1287 Q316 1306 397 1288", "M1103 1288 Q1184 1306 1263 1287", "M350 411 C391 507 415 603 412 704 V951", "M1150 411 C1109 507 1085 603 1088 704 V951", "M628 252 C632 339 675 395 750 421 C825 395 868 339 872 252", "M661 252 C673 307 708 345 750 355 C792 345 827 307 839 252", "M661 252 Q750 282 839 252", "M716 360 V545", "M784 360 V545", "M705 545 H727", "M773 545 H795", "M560 864 Q750 902 940 864 L970 1102 Q750 1140 530 1102 Z", "M560 864 C600 963 635 996 685 999", "M940 864 C900 963 865 996 815 999", "M412 1245 Q750 1292 1088 1245"], "np": [872, 252], "sp": [1150, 411], "ap": [[1088, 704], [1088, 951]], "hem": [[1088, 1300], [750, 1350], [1088, 1245], [750, 1292]], "cuff": [[1252, 1345], [1110, 1345], [1182, 1364], [1263, 1287], [1103, 1288], [1184, 1306]], "fixed": [[750, 162], [817, 165], [865, 188], [839, 252], [750, 421], [750, 355], [784, 360], [784, 545], [750, 282]], "ref": [70, 55, 62, 60, 50, 10, 27], "u": 14.971428571428572}, "cardigan": {"t": "top", "o": "M598 235 C507 260 401 320 349 391 C285 550 241 760 220 943 C207 1084 209 1210 240 1280 L250 1340 Q318 1357 390 1340 L415 950 V1290 Q750 1342 1085 1290 V950 L1110 1340 Q1182 1357 1250 1340 L1260 1280 C1291 1210 1293 1084 1280 943 C1259 760 1215 550 1151 391 C1099 320 993 260 902 235 L843 180 Q750 199 657 180 Z", "ds": ["M240 1280 Q316 1300 398 1281", "M1102 1281 Q1184 1300 1260 1280", "M349 391 C392 487 416 573 415 682 V950", "M1151 391 C1108 487 1084 573 1085 682 V950", "M657 180 C666 279 699 343 750 400 C801 343 834 279 843 180", "M598 235 C629 320 675 374 735 419 V1305", "M902 235 C871 320 825 374 765 419 V1305", "M735 419 H765", "M415 1245 Q750 1294 1085 1245", "M525 956 L655 967 V1124 Q590 1143 525 1124 Z", "M845 967 L975 956 V1124 Q910 1143 845 1124 Z", "M749 510 A8 8 0 1 0 765 510 A8 8 0 1 0 749 510 Z", "M749 654 A8 8 0 1 0 765 654 A8 8 0 1 0 749 654 Z", "M749 798 A8 8 0 1 0 765 798 A8 8 0 1 0 749 798 Z", "M749 942 A8 8 0 1 0 765 942 A8 8 0 1 0 749 942 Z", "M749 1086 A8 8 0 1 0 765 1086 A8 8 0 1 0 749 1086 Z"], "np": [902, 235], "sp": [1151, 391], "ap": [[1085, 682], [1085, 950]], "hem": [[1085, 1290], [750, 1342], [1085, 1245], [750, 1294], [765, 1305]], "cuff": [[1250, 1340], [1110, 1340], [1182, 1357], [1260, 1280], [1102, 1281], [1184, 1300]], "fixed": [[843, 180], [750, 400], [765, 419], [750, 199]], "ref": [66, 46, 54, 60, 48, 10, 23], "u": 15.984848484848484}, "jacket": {"t": "top", "o": "M576 257 C489 281 397 339 345 394 C282 551 233 740 215 926 C202 1086 209 1218 237 1294 L249 1353 Q312 1370 378 1353 L409 926 V1261 Q750 1322 1091 1261 V926 L1122 1353 Q1188 1370 1251 1353 L1263 1294 C1292 1218 1298 1086 1285 926 C1267 740 1218 551 1155 394 C1103 339 1011 281 924 257 L868 189 Q750 203 632 189 Z", "ds": ["M237 1294 Q312 1317 390 1294", "M1110 1294 Q1188 1317 1263 1294", "M345 394 C388 479 410 576 409 673 V926", "M1155 394 C1112 479 1090 576 1091 673 V926", "M632 189 L750 379 L868 189", "M576 257 C595 321 660 372 750 379 C840 372 905 321 924 257", "M681 263 H819", "M750 379 V1290"], "np": [924, 257], "sp": [1155, 394], "ap": [[1091, 673], [1091, 926]], "hem": [[1091, 1261], [750, 1322], [750, 1290]], "cuff": [[1251, 1353], [1122, 1353], [1188, 1370], [1263, 1294], [1110, 1294], [1188, 1317]], "fixed": [[868, 189], [750, 379], [819, 263], [750, 203]], "ref": [70, 52, 62, 61, 56, 13, 27], "u": 14.342857142857143}, "coat-l": {"t": "top", "o": "M617 202 L679 150 Q750 163 821 150 L883 202 C930 222 969 252 1001 289 C1049 427 1073 633 1085 886 Q1039 905 981 889 L952 534 L971 1325 Q750 1367 529 1325 L548 534 L519 889 Q461 905 415 886 C426 637 450 432 499 289 C532 252 570 222 617 202 Z", "ds": ["M499 289 C520 346 545 424 548 534", "M1001 289 C980 346 955 424 952 534", "M617 202 L601 313 Q627 317 661 313 L702 289", "M883 202 L899 313 Q873 317 839 313 L798 289", "M678 150 C677 242 710 350 750 435 C790 350 823 242 821 150", "M702 289 L600 351 Q650 434 703 490 L750 435", "M798 289 L900 351 Q850 434 797 490 L750 435", "M750 435 L670 658 V1343", "M592 681 L624 684 L612 839 L576 837 Z", "M876 684 L908 681 L924 837 L888 839 Z"], "np": [883, 202], "sp": [1001, 289], "ap": [[952, 534]], "hem": [[971, 1325], [750, 1367], [670, 1343]], "cuff": [[1085, 886], [981, 889], [1039, 905]], "fixed": [[821, 150], [899, 313], [873, 317], [839, 313], [798, 289], [900, 351], [850, 434], [797, 490], [750, 435], [750, 163]], "ref": [112, 48, 60, 63, 64, 15, 27], "u": 10.026785714285714}, "coat-s": {"t": "top", "o": "M617 202 L679 150 Q750 163 821 150 L883 202 C930 222 969 252 1001 289 C1049 427 1073 633 1085 886 Q1039 905 981 889 L952 534 L965 1075 Q750 1117 535 1075 L548 534 L519 889 Q461 905 415 886 C426 637 450 432 499 289 C532 252 570 222 617 202 Z", "ds": ["M499 289 C520 346 545 424 548 534", "M1001 289 C980 346 955 424 952 534", "M617 202 L601 313 Q627 317 661 313 L702 289", "M883 202 L899 313 Q873 317 839 313 L798 289", "M678 150 C677 242 710 350 750 435 C790 350 823 242 821 150", "M702 289 L600 351 Q650 434 703 490 L750 435", "M798 289 L900 351 Q850 434 797 490 L750 435", "M750 435 L670 658 V1093", "M592 681 L624 684 L612 839 L576 837 Z", "M876 684 L908 681 L924 837 L888 839 Z"], "np": [883, 202], "sp": [1001, 289], "ap": [[952, 534]], "hem": [[965, 1075], [750, 1117], [670, 1093]], "cuff": [[1085, 886], [981, 889], [1039, 905]], "fixed": [[821, 150], [899, 313], [873, 317], [839, 313], [798, 289], [900, 351], [850, 434], [797, 490], [750, 435], [750, 163]], "ref": [88, 48, 58, 62, 58, 15, 26], "u": 9.920454545454545}, "pad-s": {"t": "top", "o": "M575 257 C520 275 450 310 405 348 C330 420 290 520 253 635 C220 735 202 847 196 958 C189 1070 205 1183 244 1267 L244 1318 Q302 1332 361 1318 L362 1268 C393 1190 407 1088 407 979 C408 833 420 716 450 610 C444 835 436 1048 430 1174 L430 1238 Q750 1260 1070 1238 L1070 1174 C1064 1048 1056 835 1050 610 C1080 716 1092 833 1093 979 C1093 1088 1107 1190 1138 1268 L1139 1318 Q1198 1332 1256 1318 L1256 1267 C1295 1183 1311 1070 1304 958 C1298 847 1280 735 1247 635 C1210 520 1170 420 1095 348 C1050 310 980 275 925 257 C920 199 899 162 870 145 Q750 115 630 145 C601 162 580 199 575 257 Z", "ds": ["M405 348 C444 420 454 506 450 610", "M1095 348 C1056 420 1046 506 1050 610", "M628 165 Q750 140 872 165 C860 240 815 295 750 295 C685 295 640 240 628 165 Z", "M645 180 Q750 164 855 180 C837 232 800 277 750 277 C700 277 663 232 645 180", "M575 257 C600 306 647 352 750 380 C853 352 900 306 925 257", "M750 295 V1247", "M294 522 C345 548 398 571 450 585", "M1206 522 C1155 548 1102 571 1050 585", "M236 700 Q331 739 423 741", "M1264 700 Q1169 739 1077 741", "M201 885 Q305 919 410 900", "M1299 885 Q1195 919 1090 900", "M195 1060 Q300 1090 402 1080", "M1305 1060 Q1200 1090 1098 1080", "M244 1267 Q303 1278 362 1268", "M1138 1268 Q1197 1278 1256 1267", "M450 610 H1050", "M441 824 H1059", "M434 1033 H1066", "M430 1174 Q750 1190 1070 1174"], "np": [925, 257], "sp": [1095, 348], "ap": [[1050, 610], [1059, 824], [1066, 1033]], "hem": [[1070, 1238], [1070, 1174], [750, 1260], [750, 1190], [750, 1247]], "cuff": [[1256, 1318], [1139, 1318], [1198, 1332], [1256, 1267], [1138, 1268], [1197, 1278]], "fixed": [[870, 145], [899, 162], [872, 165], [855, 180], [750, 295], [750, 380], [750, 277], [750, 140], [750, 115]], "ref": [70, 56, 66, 62, 60, 14, 30], "u": 14.014285714285714}, "pad-l": {"t": "top", "o": "M575 252 C510 276 445 315 405 348 C335 430 295 520 260 630 C225 730 205 840 198 950 C187 1040 204 1176 250 1245 L251 1295 Q308 1310 365 1295 L365 1245 C390 1190 405 1090 406 990 C408 830 425 715 458 610 C449 880 443 1165 438 1440 Q750 1480 1062 1440 C1057 1165 1051 880 1042 610 C1075 715 1092 830 1094 990 C1095 1090 1110 1190 1135 1245 L1135 1295 Q1192 1310 1249 1295 L1250 1245 C1296 1176 1313 1040 1302 950 C1295 840 1275 730 1240 630 C1205 520 1165 430 1095 348 C1055 315 990 276 925 252 C920 205 902 181 871 177 Q750 162 629 177 C598 181 580 205 575 252 Z", "ds": ["M405 348 C446 420 462 507 458 610", "M1095 348 C1054 420 1038 507 1042 610", "M629 203 C655 225 670 248 673 271 Q750 251 827 271 C830 248 845 225 871 203", "M673 254 H827", "M575 252 C590 325 654 365 750 379 C846 365 910 325 925 252", "M750 278 V1460", "M260 630 C320 665 380 705 429 735", "M1240 630 C1180 665 1120 705 1071 735", "M205 930 Q305 965 407 990", "M1295 930 Q1195 965 1093 990", "M250 1245 H365", "M1135 1245 H1250", "M458 610 H1042", "M449 820 H1051", "M444 1030 H1056", "M440 1245 H1060", "M438 1380 Q750 1417 1062 1380", "M500 850 L550 850 L550 985 L500 985 Z", "M950 850 L1000 850 L1000 985 L950 985 Z"], "np": [925, 252], "sp": [1095, 348], "ap": [[1042, 610], [1051, 820], [1056, 1030]], "hem": [[1062, 1440], [750, 1480], [1062, 1380], [750, 1417], [750, 1460]], "cuff": [[1249, 1295], [1135, 1295], [1192, 1310], [1250, 1245], [1135, 1245]], "fixed": [[871, 177], [902, 181], [871, 203], [827, 271], [827, 254], [750, 379], [750, 251], [750, 162]], "ref": [110, 56, 66, 63, 64, 14, 30], "u": 10.8}, "pants-l": {"t": "pants", "hip": [[1038.26, 358.14]], "o": "M503 150 Q750 140 997 150 L1011 216 C1021.96 266.43 1031.39 313.78 1038.26 358.14 C1047.06 414.94 1051.68 466.83 1050 514 L1042 1341 Q930 1361 794 1342 C789 1028 777 768 750 585 C723 768 711 1028 706 1342 Q570 1361 458 1341 L450 514 C448.32 466.83 452.94 414.94 461.74 358.14 C468.61 313.78 478.04 266.43 489 216 Z", "ds": ["M503 150 Q750 178 997 150", "M489 216 Q750 256 1011 216", "M489 216 L597 230 C581 281 562 320 528 322 L475 316", "M1011 216 L903 230 C919 281 938 320 972 322 L1025 316", "M750 165 V585", "M806 236 V448 C806 477 790 494 750 505", "M764 199 A17 17 0 1 0 798 199 A17 17 0 1 0 764 199 Z"], "waist": [[997, 150], [1011, 216], [750, 140], [750, 178], [750, 256]], "crotch": [[750, 585], [750, 505]], "thigh": [[1050, 514]], "hem": [[1042, 1341], [794, 1342], [930, 1361]], "fixed": [], "ref": [103, 40, 50, 32, 30, 20], "u": 11.563106796116505}, "pants-s": {"t": "pants", "hip": [[1183.69, 605.0]], "o": "M393 248 Q750 241 1107 248 L1131 339 C1149.28 412.38 1166.84 501.04 1183.69 605 C1195 674.78 1205.98 751.44 1216.64 835 C1230.65 944.78 1244.1 1066.44 1257 1200 Q1029 1238 779 1221 C777 1056 775 919 750 835 C725 919 723 1056 721 1221 Q471 1238 243 1200 C255.9 1066.44 269.35 944.78 283.36 835 C294.02 751.44 305 674.78 316.31 605 C333.16 501.04 350.72 412.38 369 339 Z", "ds": ["M393 248 Q750 280 1107 248", "M369 339 Q750 410 1131 339", "M750 267 V835", "M369 339 L515 361 C493 412 484 462 439 467 L342 460", "M1131 339 L985 361 C1007 412 1016 462 1061 467 L1158 460", "M822 372 V669 C822 728 800 766 750 786", "M769 319 A20 20 0 1 0 809 319 A20 20 0 1 0 769 319 Z"], "waist": [[1107, 248], [1131, 339], [750, 241], [750, 280], [750, 410]], "crotch": [[750, 835], [750, 786]], "thigh": [[1216.64, 835.0]], "hem": [[1257, 1200], [779, 1221], [1029, 1238]], "fixed": [], "ref": [48, 40, 50, 32, 29, 29], "u": 19.833333333333332}, "skirt-l": {"t": "skirt", "o": "M455 248 Q750 236 1045 248 L1061 352 C1066.46 387.76 1073.32 431.58 1081.52 481.12 C1119.89 712.81 1187.73 1069.44 1280 1310 Q750 1390 220 1310 C312.27 1069.44 380.11 712.81 418.48 481.12 C426.68 431.58 433.54 387.76 439 352 Z", "ds": ["M455 248 Q750 285 1045 248", "M439 352 Q750 398 1061 352", "M750 383 V1335"], "waist": [[1045, 248], [1061, 352], [750, 236], [750, 285.0], [750, 398.0]], "hip": [[1081.52, 481.12]], "hem": [[1280, 1310], [750, 1390], [750, 1335]], "fixed": [], "ref": [82, 34, 48, 62], "u": 12.951219512195122}, "skirt-s": {"t": "skirt", "o": "M405 328 Q750 316 1095 328 L1101 447 C1118.33 512.22 1133.77 579.04 1147.99 646 C1178.89 791.55 1203.97 937.81 1230 1070 Q750 1210 270 1070 C296.03 937.81 321.11 791.55 352.01 646 C366.23 579.04 381.67 512.22 399 447 Z", "ds": ["M405 328 Q750 375 1095 328", "M399 447 Q750 515 1101 447"], "waist": [[1095, 328], [1101, 447], [750, 316], [750, 375.0], [750, 515.0]], "hip": [[1147.99, 646.0]], "hem": [[1230, 1070], [750, 1210]], "fixed": [], "ref": [42, 34, 46, 50], "u": 17.666666666666668}};
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const MIR = (p) => [1500 - p[0], p[1]];
function flatParse(d) {
  const tk = d.match(/[MLHVCQAZ]|-?\d*\.?\d+/g), out = []; let i = 0, cmd = null, cur = [0, 0];
  const N = { M: 2, L: 2, H: 1, V: 1, C: 6, Q: 4, A: 7 };
  while (i < tk.length) {
    if (/[A-Z]/.test(tk[i])) cmd = tk[i++];
    if (cmd === 'Z') { out.push({ c: 'Z', p: [] }); continue; }
    const v = tk.slice(i, i + N[cmd]).map(Number); i += N[cmd];
    if (cmd === 'H') { cur = [v[0], cur[1]]; out.push({ c: 'L', p: [cur] }); }
    else if (cmd === 'V') { cur = [cur[0], v[0]]; out.push({ c: 'L', p: [cur] }); }
    else if (cmd === 'A') { cur = [v[5], v[6]]; out.push({ c: 'A', p: [cur], a: v.slice(0, 5) }); }
    else { const p = []; for (let j = 0; j < v.length; j += 2) p.push([v[j], v[j + 1]]); cur = p[p.length - 1]; out.push({ c: cmd, p }); if (cmd === 'M') cmd = 'L'; }
  }
  return out;
}
// 기준점 → 목표 위치 (원본 단위). 오른쪽 기준점은 왼쪽으로 대칭 복제
function flatLand(sub, m) {
  const s = FLAT_SRC[sub], parts = GPARTS[SUBS[sub].g], D = {}, L = [];
  parts.forEach((k, i) => { D[k] = (m[i] - s.ref[i]) * s.u; }); const g = (k) => D[k] || 0;
  const add = (p, d) => { L.push([p, d]); if (p[0] > 750.001) L.push([MIR(p), [-d[0], d[1]]]); };
  const hx = (pts, dx0, dy) => pts.forEach((p) => add(p, [dx0 * (p[0] - 750) / (pts[0][0] - 750), dy]));
  (s.fixed || []).forEach((p) => add(p, [0, 0]));
  if (s.t === 'top') {
    const spD = [g('어깨') / 2, 0], SP = [s.sp[0] + spD[0], s.sp[1]];
    add(s.np, [0, 0]); add(s.sp, spD);
    // 가슴: 겨드랑이 x · 암홀: 어깨 끝 → 겨드랑이 직선 길이
    const a0 = s.ap[0], ax = a0[0] + g('가슴') / 2, al = Math.hypot(a0[0] - s.sp[0], a0[1] - s.sp[1]) + g('암홀'), ay = s.sp[1] + Math.sqrt(Math.max(al * al - (ax - SP[0]) ** 2, 0));
    add(a0, [ax - a0[0], ay - a0[1]]); s.ap.slice(1).forEach((p) => add(p, [g('가슴') / 2, 0]));
    hx(s.hem, g('밑단') / 2, g('총장'));
    // 소매: 어깨 끝 → 소매 끝 길이 · 소매부리: 소매 끝 바깥 → 안쪽 길이
    const CO = s.cuff[0], CI = s.cuff[1], v = [CO[0] - s.sp[0], CO[1] - s.sp[1]], len = Math.hypot(v[0], v[1]), r = (len + g('소매') + g('전체소매')) / len;
    const T = [SP[0] + v[0] * r - CO[0], SP[1] + v[1] * r - CO[1]], w = [CI[0] - CO[0], CI[1] - CO[1]], lw = Math.hypot(w[0], w[1]);
    s.cuff.forEach((p) => { const tt = ((p[0] - CO[0]) * w[0] + (p[1] - CO[1]) * w[1]) / (lw * lw); add(p, [T[0] + w[0] / lw * tt * g('소매부리'), T[1] + w[1] / lw * tt * g('소매부리')]); });
  } else {
    s.waist.forEach((p) => add(p, [p[0] === 750 ? 0 : g('허리') / 2, 0]));
    s.hip.forEach((p) => add(p, [g('엉덩이') / 2, 0]));
    if (s.t === 'pants') {
      s.crotch.forEach((p) => add(p, [0, g('밑위')])); s.thigh.forEach((p) => add(p, [g('허벅지'), g('밑위')]));
      const h0 = s.hem[0], h1 = s.hem[1], c = (h0[0] + h1[0]) / 2, half = (h0[0] - h1[0]) / 2, sh = g('허벅지') * (c - 750) / (s.thigh[0][0] - 750);
      s.hem.forEach((p) => add(p, [sh + (p[0] - c) / half * g('밑단') / 2, g('총장')]));
    } else hx(s.hem, g('밑단') / 2, g('총장'));
  }
  return L;
}
// thin-plate spline: 기준점은 정확히 목표로, 나머지는 매끄럽게
function flatTPS(L) {
  const n = L.length, N = n + 3, P = L.map(([p]) => [(p[0] - 750) / 1000, (p[1] - 700) / 1000]);
  const U = (a, b) => { const r2 = (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2; return r2 ? r2 * Math.log(r2) / 2 : 0; };
  const A = Array.from({ length: N }, () => new Array(N + 2).fill(0));
  for (let i = 0; i < n; i++) { for (let j = 0; j < n; j++) A[i][j] = U(P[i], P[j]); A[i][n] = 1; A[i][n + 1] = P[i][0]; A[i][n + 2] = P[i][1]; A[n][i] = 1; A[n + 1][i] = P[i][0]; A[n + 2][i] = P[i][1]; A[i][N] = L[i][1][0]; A[i][N + 1] = L[i][1][1]; }
  for (let c = 0; c < N; c++) { let b = c; for (let r = c + 1; r < N; r++) if (Math.abs(A[r][c]) > Math.abs(A[b][c])) b = r; [A[c], A[b]] = [A[b], A[c]];
    for (let r = 0; r < N; r++) if (r !== c) { const f = A[r][c] / A[c][c]; if (f) for (let k = c; k < N + 2; k++) A[r][k] -= f * A[c][k]; } }
  const W = A.map((row, i) => [row[N] / row[i], row[N + 1] / row[i]]);
  return (q) => { const x = [(q[0] - 750) / 1000, (q[1] - 700) / 1000]; let dx = W[n][0] + W[n + 1][0] * x[0] + W[n + 2][0] * x[1], dy = W[n][1] + W[n + 1][1] * x[0] + W[n + 2][1] * x[1];
    for (let i = 0; i < n; i++) { const k = U(x, P[i]); dx += W[i][0] * k; dy += W[i][1] * k; } return [q[0] + dx, q[1] + dy]; };
}
const FLAT_P = {};
function flatGeom(sub, m, f) {
  const s = FLAT_SRC[sub], pp = FLAT_P[sub] || (FLAT_P[sub] = { o: flatParse(s.o), ds: s.ds.map(flatParse) });
  const L = flatLand(sub, m), warp = flatTPS(L), W = (p) => { const e = L.find(([q]) => Math.abs(q[0] - p[0]) < 1e-6 && Math.abs(q[1] - p[1]) < 1e-6); return e ? [p[0] + e[1][0], p[1] + e[1][1]] : warp(p); };
  const verts = [], all = [];
  const draw = (segs) => segs.map((g) => { if (g.c === 'Z') return 'Z'; const q = g.p.map(W); all.push(...q); verts.push(q[q.length - 1]);
    return g.c === 'A' ? `A${g.a[0] * f.s} ${g.a[1] * f.s} ${g.a[2]} ${g.a[3]} ${g.a[4]} ${f(q[0])}` : g.c + q.map(f).join(' '); }).join('');
  const outline = [draw(pp.o)], details = pp.ds.map(draw), T = (p) => W(p);
  const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]), minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys), G = 70;
  const parts = GPARTS[SUBS[sub].g], M = {}, A = {}, mid = (p, q) => lerp(p, q, 0.5);
  // 측정선 오프셋 방향: want 쪽으로
  const off = (a, b, want, o = G * 0.8) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return (dy / l * want[0] - dx / l * want[1]) >= 0 ? o : -o; };
  if (s.t === 'top') {
    const np = T(s.np), sp = T(s.sp), ap = T(s.ap[0]), hm = T(s.hem[0]), cf = T(s.cuff[0]), npL = T(MIR(s.np)), hmL = T(MIR(s.hem[0])), spL = T(MIR(s.sp)), apL = T(MIR(s.ap[0])), cfL = T(MIR(s.cuff[0])), ciL = T(MIR(s.cuff[1]));
    const dv = [cf[1] - sp[1], -(cf[0] - sp[0])], dl = Math.hypot(dv[0], dv[1]), sleeve = [mid(sp, cf)[0] - dv[0] / dl * G, mid(sp, cf)[1] - dv[1] / dl * G];
    const up = [ciL[0] - cfL[0], ciL[1] - cfL[1]], cdir = [spL[0] - cfL[0], spL[1] - cfL[1]], cl = Math.hypot(cdir[0], cdir[1]);
    M.총장 = { t: 'dy', a: npL, b: hmL, at: minX - G }; A.총장 = [750, maxY];
    M.어깨 = { t: 'dx', a: spL, b: sp, at: minY - G * 0.8 }; A.어깨 = [sp[0], sp[1] - G];
    M.가슴 = { t: 'dx', a: apL, b: ap, at: ap[1] }; A.가슴 = [750, ap[1]];
    M.소매 = { t: 'len', a: sp, b: cf, off: off(sp, cf, [1, -0.3]) }; A.소매 = sleeve;
    M.전체소매 = { t: 'poly', pts: [[750, np[1]], sp, cf], offs: [off([750, np[1]], sp, [0.3, -1]), off(sp, cf, [1, -0.3])] }; A.전체소매 = sleeve;
    M.밑단 = { t: 'dx', a: hmL, b: hm, at: maxY + G }; A.밑단 = [hm[0] - G * 1.7, hm[1] - G * 0.9];
    M.소매부리 = { t: 'len', a: cfL, b: ciL, off: off(cfL, ciL, [-cdir[0], -cdir[1]], G * 0.6) }; A.소매부리 = [mid(cfL, ciL)[0] + cdir[0] / cl * G * 1.3, mid(cfL, ciL)[1] + cdir[1] / cl * G * 1.3];
    M.암홀 = { t: 'len', a: spL, b: apL, off: off(spL, apL, [1, 0], G * 0.5) }; A.암홀 = [mid(spL, apL)[0] + G * 1.2, mid(spL, apL)[1]];
  } else {
    const w = T(s.waist[0]), wL = T(MIR(s.waist[0])), hm = T(s.hem[0]), hp = T(s.hip[0]), hpL = T(MIR(s.hip[0]));
    M.총장 = { t: 'dy', a: w, b: hm, at: maxX + G }; M.허리 = { t: 'dx', a: wL, b: w, at: minY - G }; M.엉덩이 = { t: 'dx', a: hpL, b: hp, at: hp[1], lx: 750 + (hp[0] - 750) * 0.55 };
    A.허리 = [750, w[1]]; A.엉덩이 = [hpL[0] + G * 1.3, hpL[1]];
    if (s.t === 'pants') { const cr = T(s.crotch[0]), th = T(s.thigh[0]), hi = T(s.hem[1]), hiL = T(MIR(s.hem[1])), hmL = T(MIR(s.hem[0]));
      M.허벅지 = { t: 'dx', a: cr, b: th, at: cr[1] + G }; M.밑위 = { t: 'dy', a: w, b: cr, at: 750 }; M.밑단 = { t: 'dx', a: hi, b: hm, at: maxY + G };
      A.총장 = [hm[0], (cr[1] + hm[1]) / 2 + G * 2]; A.허벅지 = [(cr[0] + th[0]) / 2 + G * 0.4, cr[1] + G]; A.밑위 = [750, cr[1] - G * 0.9]; A.밑단 = [mid(hmL, hiL)[0], hm[1]];
    } else { M.밑단 = { t: 'dx', a: T(MIR(s.hem[0])), b: hm, at: maxY + G }; A.총장 = [lerp(hp, hm, 0.5)[0] + 20, lerp(hp, hm, 0.5)[1]]; A.밑단 = [750, maxY]; }
  }
  const meas = parts.map((k, i) => ({ ...M[k], i, k })), anchors = parts.map((k) => A[k]);
  return { outline, details, verts, meas, anchors, u: s.u };
}

// list: [{ m, role: 'base' | 'prod' }] — base는 외곽선만(초록 점선), prod는 외곽선 + 디테일(검정)
// opt.guide: 측정선 + 번호 · opt.d/parts: 비교 뱃지
function flatFig(sub, list, opt = {}) {
  const VW = 300, VH = opt.guide ? 260 : 240, PAD = opt.guide ? 12 : 14, u = FLAT_SRC[sub].u;
  const pts = [], rec = (p) => { pts.push(p); return '0 0'; }; rec.s = 1;
  const G0 = list.map((it) => flatGeom(sub, it.m, rec));
  if (opt.guide) G0.forEach((g) => g.meas.forEach((ms) => guideLine(ms).slice(0, 3).forEach((p) => pts.push(p))));
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const s = Math.min((VW - PAD * 2) / (maxX - minX), (VH - PAD * 2) / (maxY - minY)), k = s * u;
  const ox = (VW - (maxX - minX) * s) / 2 - minX * s, oy = (VH - (maxY - minY) * s) / 2 - minY * s;
  const X = (x) => +(ox + x * s).toFixed(2), Y = (y) => +(oy + y * s).toFixed(2), f = ([x, y]) => `${X(x)} ${Y(y)}`; f.s = s;
  let svg = '';
  const order = list.map((it, i) => [it, i]).sort((a, b) => (a[0].role === 'base') - (b[0].role === 'base'));
  for (const [it] of order) {
    const g = flatGeom(sub, it.m, f), base = it.role === 'base';
    svg += g.outline.map((dd, j) => `<path data-role="${it.role}" data-part="${j}" d="${dd}" ${base ? 'fill="rgba(6,188,81,.08)" stroke="#06BC51" stroke-dasharray="5 4"' : 'fill="#fff" stroke="#111"'} stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>`).join('');
    if (!base) svg += `<g fill="none" stroke="#111" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">${g.details.map((dd) => `<path d="${dd}"/>`).join('')}</g>`;
  }
  let html = '';
  if (opt.guide) {
    const g = flatGeom(sub, list[0].m, f);
    svg += '<g stroke="#8A8A8A" stroke-width="1" fill="none">' + g.meas.map((ms) => { const [p1, p2, , lead] = guideLine(ms); const q = guideLine(ms)[4]; return (lead ? `<path d="M${f(lead[0])}L${f(lead[1])}" stroke-dasharray="3 3"/>` : '') + `<path d="M${q ? q.map(f).join('L') : f(p1) + 'L' + f(p2)}" marker-start="url(#fa)" marker-end="url(#fa)"/>`; }).join('') + '</g>';
    svg += g.meas.map((ms) => { const c = guideLine(ms)[2]; return `<g transform="translate(${X(c[0])} ${Y(c[1])})"><rect x="-8" y="-8" width="16" height="16" rx="2" fill="#121212"/><text y="4" text-anchor="middle" font-size="11" font-weight="700" fill="#fff" font-family="inherit">${ms.i + 1}</text></g>`; }).join('');
    svg = `<defs><marker id="fa" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1L6 4L0 7" fill="none" stroke="#8A8A8A" stroke-width="1.2"/></marker></defs>` + svg;
  } else if (opt.d) {
    const g = flatGeom(sub, list[list.length - 1].m, f), sgn = (v) => v === 0 ? '0' : (v > 0 ? '+' : '-') + Math.abs(v), CL = { eq: 'var(--g, #06BC51)', big: '#121212', small: '#C62E2E' };
    html = g.anchors.map((a, i) => opt.d[i] == null ? '' : `<span class="pd-co" style="left:${X(a[0])}px;top:${Y(a[1])}px;background:${CL[fitOf(opt.d[i])]}">${opt.parts[i]} ${sgn(opt.d[i])}</span>`).join('');
  }
  return `<div class="pd-fig" data-k="${k}" data-s="${s}" data-ox="${ox}" data-oy="${oy}" style="width:${VW}px;height:${VH}px"><svg viewBox="0 0 ${VW} ${VH}" width="${VW}" height="${VH}" role="img" aria-label="${SUBS[sub].n} 도식화">${svg}</svg>${html}</div>`;
}
// 측정선: [시작, 끝, 번호 위치, 점선 보조선?]
function guideLine(ms) {
  if (ms.t === 'poly') { const P = ms.pts, nrm = (a, b, o) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return [dy / l * o, -dx / l * o]; };
    const n1 = nrm(P[0], P[1], ms.offs[0]), n2 = nrm(P[1], P[2], ms.offs[1]), q = [[P[0][0] + n1[0], P[0][1] + n1[1]], [P[1][0] + (n1[0] + n2[0]) / 2, P[1][1] + (n1[1] + n2[1]) / 2], [P[2][0] + n2[0], P[2][1] + n2[1]]];
    return [q[0], q[2], lerp(q[1], q[2], 0.5), null, q]; }
  if (ms.t === 'dx') { const y = ms.at; return [[ms.a[0], y], [ms.b[0], y], [ms.lx ?? (ms.a[0] + ms.b[0]) / 2, y]]; }
  if (ms.t === 'dy') { const x = ms.at, lead = Math.abs(ms.a[0] - x) > 0.5 ? [[ms.a[0], ms.a[1]], [x, ms.a[1]]] : null; return [[x, ms.a[1]], [x, ms.b[1]], [x, (ms.a[1] + ms.b[1]) / 2], lead]; }
  const dx = ms.b[0] - ms.a[0], dy = ms.b[1] - ms.a[1], l = Math.hypot(dx, dy), nx = dy / l, ny = -dx / l, o = ms.off;
  const p1 = [ms.a[0] + nx * o, ms.a[1] + ny * o], p2 = [ms.b[0] + nx * o, ms.b[1] + ny * o]; return [p1, p2, lerp(p1, p2, 0.5)];
}
const LONG = { 엉덩이: '엉덩이단면', 밑단: '밑단단면', 암홀: '암홀', 소매부리: '소매부리단면', 인심: '인심', 전체소매: '전체소매길이', 총장: '총기장', 어깨: '어깨단면', 가슴: '가슴단면', 소매: '소매길이', 허리: '허리단면', 밑위: '밑위', 허벅지: '허벅지단면' };
const TOL = 2;
const fitOf = (v) => Math.abs(v) <= TOL ? 'eq' : v > 0 ? 'big' : 'small';
const WIDE = new Set(['가슴', '어깨', '암홀', '밑단', '소매부리', '허리', '엉덩이', '허벅지']); // 품 부위 (CAT-06). 사이즈 판정은 이 부위로만 (REC-04-1)
const FIT_W = { big: '넉넉해요', small: '부족해요' }; // 부위별 판정 (REC-04)
const partLine = (p, d) => d.map((v, i) => [Math.abs(v), i]).filter(([a]) => a > TOL).sort((a, b) => b[0] - a[0]).slice(0, 2).map(([a, i]) => `${partsOf(p)[i]} ${d[i] > 0 ? '+' : '\u2212'}${a}cm ${FIT_W[fitOf(d[i])]}`).join(', ');
function fitWord(p, base, k) {
  const parts = partsOf(p), out = deltaOf(p, base, k).filter((v, i) => WIDE.has(parts[i]) && fitOf(v) !== 'eq'); if (!out.length) return '비슷해요';
  const big = out.some((v) => v > 0), small = out.some((v) => v < 0), mx = Math.max(...out.map(Math.abs));
  if (big && small) return '부위별로 달라요';
  return small ? (mx > TOL * 2 ? '작아요' : '살짝 작아요') : (mx > TOL * 2 ? '커요' : '살짝 커요');
}
function summaryOf(p, base, k) {
  return `${k} · ${partLine(p, deltaOf(p, base, k)) || '모든 부위가 비슷해요'}`;
}
SCR.detail = (pp) => {
  const p = PB[pp.id], j = judge(p), keys = sizeKeys(p), parts = partsOf(p), ph = p.photos || { hero: p.img };
  const base = j.n === 5 && !pp.nob ? j.base : null, sel = pp.sel, view = sel || (base ? j.rec : null);
  const L = { 1: '로그인 안 함', 2: '옷장 비어 있음', 3: '이 종류 옷 없음', 4: '기준 옷 없음', x: '실측 없음 (사이즈표만)', 5: pp.nob ? '비교 끔 (사이즈표만)' : '비교 완료' }[j.n];
  let node = `② 상품 상세 · 상황: ${L}`;
  if (sel && p.out.includes(sel)) node = '② 상품 상세 · 그 사이즈 재고 있나? → 아니오 · 품절 안내';
  const chip = { 1: '로그인하고 내 옷과 비교하기', 2: '기준 옷 등록하고 비교하기', 3: '기준 옷 등록하고 비교하기', 4: '기준 옷 정하고 비교하기', 5: `<b>${j.rec} 추천</b>기준 옷과 비교하기`, x: '' }[j.n];
  const hintCard = (txt, link, a, ill) => `<div class="pd-hint"><p>${txt}</p>${link ? `<button class="pd-link hit" data-a="${a}" data-x="${p.id}">${link}${I.chev}</button>` : ''}${ill || ''}</div>`;
  const glass = '<span class="pd-glass"><i></i><b></b></span>', tee = `<img class="pd-tee" src="${IMG.pdTee}" alt="">`;
  let top = '';
  if (base) top = `<div class="pd-base"><div class="pd-brow"><span class="pd-bimg">${cutPic(base)}</span><span class="pd-bw"><em>${base.subBase && base.sub === p.sub ? base.sub + ' 기준' : '기준'}</em><b>${base.name}</b><small>내 옷장 · ${SUBS[subOf(base)].n} · ${base.size} Size</small></span><button class="pd-swap hit" data-a="dpick">교체하기${I.chev}</button></div></div>`;
  else if (j.n === 1) top = hintCard('로그인하면 내 옷장 옷과 겹쳐서<br>크기를 비교해 드려요.', '로그인하기', 'chip', glass);
  else if (j.n === 2 || j.n === 3) top = hintCard('기준 옷 한 벌만 등록하면<br>이 상품과 겹쳐서 비교해 드려요.', '기준 옷 등록하기', 'chip', tee);
  else if (j.n === 4) top = hintCard('내 옷장에서 기준 옷을 정하면<br>이 상품과 겹쳐서 비교해 드려요.', '기준 옷 정하기', 'dpick', tee);
  else if (j.n === 'x') top = hintCard('판매처가 실측 치수를 올리지 않아<br>내 옷과 비교하기 어려워요.', '');
  const szs = `<div class="pd-szs">${keys.map((k) => { const out = p.out.includes(k), rec = base && k === j.rec;
      const w = out ? '품절' : base && p.sizes ? fitWord(p, base, k) : p.sizes ? p.sizes[k][0] + 'cm' : '';
      return `<button class="pd-sz ${k === view ? 'on' : ''} ${out ? 'out' : ''}" data-a="dsel" data-x="${k}"><span class="t"><b>${k}</b>${rec ? '<em>추천</em>' : ''}</span><span>${w}</span></button>` }).join('')}</div>`;
  const fmt = (v) => v == null ? '–' : v, gsz = (k) => gArr(p, p.sizes[k]), ref = FLAT_SRC[subOf(p)].ref;
  // 사이즈표: 통합본 데이터에 없는 부위 칸은 통째로 숨기고, 일부만 비면 '–'
  const tblFor = (rows) => {
    const keep = parts.map((_, i) => rows.some(([, v]) => v[i] != null)), cols = parts.filter((_, i) => keep[i]), pick = (v) => v.filter((_, i) => keep[i]);
    const head = `<tr><th>cm</th>${cols.map((x) => `<th><i>${parts.indexOf(x) + 1}</i>${PART_N[x]}</th>`).join('')}</tr>`;
    return `<div class="pd-ta"><div class="pd-tw"><table class="pd-tbl">${head}${rows.map(([h, v, cls, td]) => `<tr class="${cls || ''}"><th>${h}</th>${pick(v).map(td || ((x) => `<td>${fmt(x)}</td>`)).join('')}</tr>`).join('')}</table></div><p class="pd-note">단면 실측(cm) 기준이에요. 재는 방법에 따라 1~2cm 차이가 날 수 있어요.</p></div>`;
  };
  let cmp = '';
  if (base && p.sizes) {
    const d = deltaOf(p, base, view), sgn = (v) => v === 0 ? '0' : (v > 0 ? '+' : '-') + Math.abs(v);
    const gm = gsz(view), gb = gArr(base, base.m), gd = gm.map((v, i) => v == null || gb[i] == null ? null : +(v - gb[i]).toFixed(1));
    const fill = (a, b) => a.map((v, i) => v ?? b[i] ?? ref[i]); // 도식은 빈 부위를 반대쪽 옷 값 → 원본 기준 치수로 채워 그림 (뱃지는 안 붙음)
    const fig = flatFig(subOf(p), [{ m: fill(gb, gm), role: 'base' }, { m: fill(gm, gb), role: 'prod' }], { d: gd, parts });
    const s = summaryOf(p, base, view), cut = s.indexOf(' · ');
    cmp = `<div class="pd-txt"><div class="pd-head">${view} 사이즈는 ${((w) => w === '비슷해요' ? '내 기준 옷과 <em class="eq">비슷해요</em>' : w === '부위별로 달라요' ? `내 기준 옷과 <em>${w}</em>` : `내 기준 옷보다 <em>${w}</em>`)(fitWord(p, base, view))}</div>
      <p class="pd-sum">${s.slice(cut + 3)}.</p>
      <div class="pd-cnt">${[['비슷해요', gd.filter((v) => v != null && fitOf(v) === 'eq').length, 'eq'], ['넉넉해요', gd.filter((v) => v != null && fitOf(v) === 'big').length, ''], ['부족해요', gd.filter((v) => v != null && fitOf(v) === 'small').length, 'lack']].map(([l, n, c]) => `<span class="${c}"><b>${n}<small>곳</small></b>${l}</span>`).join('')}</div></div>
      <div class="pd-stage">${fig}<div class="pd-legend"><span><i class="dash"></i>내 기준 옷 · ${base.name} ${base.size}</span><span><i class="solid"></i>이 상품 ${view}</span></div></div>
      ${tblFor([['기준 옷', gb], [view, gm, 'hl'], ['차이', gd, '', (v) => v == null ? '<td>–</td>' : `<td class="${fitOf(v)}">${v === 0 ? '같음' : sgn(v)}</td>`]])}`;
  } else if (p.sizes) cmp = tblFor(keys.map((k) => [k, gsz(k)]));
  const out = sel && p.out.includes(sel);
  const cta = `<button class="btn pd-cta" data-a="buyOpen">구매하기</button>`;
  const others = P.filter((x) => x.cat === p.cat && x.id !== p.id);
  return { node, bar: `<button class="pd-like hit" data-a="like" data-x="${p.id}">${S.likes[p.id] ? I.heartF : I.heart}<span class="num">${S.likes[p.id] ? 118 : 117}</span></button>${cta}`,
    body: `<div class="pd"><div class="hdr pd-hdr"><button class="hit" data-a="back" aria-label="뒤로">${I.back}</button><span class="icons"><button class="hit" data-a="tab" data-x="home" aria-label="홈">${I.home}</button><button class="hit" data-a="tab" data-x="search" aria-label="검색">${I.search}</button><button class="hit" data-a="go" data-x="cart" aria-label="장바구니">${I.cart}${S.cart.length ? `<span class="cnt">${S.cart.length}</span>` : ''}</button></span></div>
  <div class="img pd-hero"><img src="${IMG[ph.hero]}" style="object-position:50% ${p.photos ? 50 : 40}%" alt="">${chip ? `<button class="pd-hchip hit" data-a="toSize">${chip}${I.chev}</button>` : ''}<div class="pd-pg num">1 / 5</div></div>
  <div class="pd-info"><div class="b">${p.brand} ›</div><div class="n">${p.name}</div><div class="pr">${p.dc ? `<em>${p.dc}%</em>` : ''}<span>${won(sale(p))}원</span>${p.dc ? `<s>${won(p.price)}원</s>` : ''}</div><button class="rt hit" data-a="dtab" data-x="rev">★ ${p.rate} · 후기 ${won(p.rev)}</button></div>
  <div class="pd-gap"></div>
  <div class="dtabs">${[['info', '정보'], ['size', '사이즈'], ['rec', '추천'], ['rev', '스냅·후기'], ['qna', '문의']].map(([k, t]) => `<button class="${(pp.tab || 'info') === k ? 'on' : ''}" data-a="dtab" data-x="${k}">${t}</button>`).join('')}</div>
  <section id="s_info"><dl class="pd-spec">${[['품번', `NR-${p.id.toUpperCase()}-0241`], ['시즌', '2026 FW']].concat(p.spec || [['소재', p.cat === 'bottom' ? '울 70% · 폴리 30%' : '면 100%'], ['핏', p.cat === 'bottom' ? '와이드 · 스트레이트' : '릴렉스 핏 · 드롭 숄더']]).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
    ${p.det ? p.det.map((k) => `<img class="pd-detail" src="${IMG[k]}" alt="">`).join('') : `<img class="pd-detail ${p.photos ? '' : 'crop'}" src="${IMG[ph.detail || p.img]}" alt="">`}</section>
  <section class="pd-size" id="s_size"><div class="pd-title"><h2>사이즈</h2>${j.n === 5 ? `<button class="pd-tg hit" data-a="cmpToggle"><span>내 옷과 비교</span><i class="${pp.nob ? '' : 'on'}"></i></button>` : '<span class="pd-sub">단면 실측 cm</span>'}</div>${top}${base ? szs : p.sizes ? `<div class="pd-guide">${flatFig(subOf(p), [{ m: gsz(keys[Math.floor((keys.length - 1) / 2)]).map((v, i) => v ?? ref[i]), role: 'prod' }], { guide: true })}<span>${SUBS[subOf(p)].n} 실측 부위</span></div>` : ''}${cmp}</section>
  <section class="dsec" id="s_rec"><div class="dhead"><h2>이 상품과 비슷한 ${CAT[p.cat]}</h2><span>${others.length}개</span></div><div class="hscroll" style="padding:0">${others.map(card).join('')}</div><div style="height:12px"></div></section>
  ${revSection(p)}
  <section class="dsec" id="s_qna" style="border-bottom:0"><div class="dhead"><h2>문의</h2><span>32건</span></div>${qnaList(p)}<div style="height:24px"></div></section></div>` };
};
/* ── 문의 (시연용 예시) ── */
function qnaList(p) {
  const s0 = sizeKeys(p), mid = s0[Math.floor((s0.length - 1) / 2)] || 'M', up = s0[s0.indexOf(mid) + 1] || mid;
  const Q = [
    ['사이즈', 'kim**', '10.27', true, `평소 ${mid} 입는데 ${mid}로 사도 될까요? 어깨가 넓은 편이에요.`, `${mid} 사이즈 어깨너비는 실측표를 참고해 주세요. 어깨가 넓으시면 ${up}도 함께 비교해 보시길 권해 드려요. 상품 상세 '사이즈'에서 내 옷과 겹쳐 볼 수 있어요.`],
    ['배송', 'park***', '10.26', true, '오늘 주문하면 언제 받을 수 있나요?', '평일 오후 2시 전 주문은 당일 출고돼요. 보통 1~2일 안에 받으실 수 있어요.'],
    ['재입고', 'lee*', '10.25', false, `${s0[s0.length - 1] || 'XL'} 사이즈 재입고 예정 있나요?`, ''],
    ['상품', 'choi**', '10.23', true, null, ''],
  ];
  const top = (t, id, d, done) => `<span class="qa-top"><span class="qa-st ${done ? 'done' : ''}">${done ? '답변완료' : '답변대기'}</span>${t} · ${id} · ${d}</span>`;
  return `<div class="qa-list">${Q.map(([t, id, d, done, q, a]) => q
    ? `<details class="qa"><summary>${top(t, id, d, done)}<span class="qa-q">${q}</span><span class="qa-tg"><em class="o">열기</em><em class="c">닫기</em>${I.down}</span></summary><div class="qa-a">${a ? `<b>판매자 답변</b>${a}` : '아직 답변을 기다리고 있어요'}</div></details>`
    : `<div class="qa">${top(t, id, d, done)}<span class="qa-q qa-lock">비밀글이에요</span></div>`).join('')}</div>`;
}
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
const RV_POS = ['50% 30%', '50% 60%', '30% 45%', '70% 40%', '50% 85%', '45% 20%'];
const rvPh = (r) => r.i % 3 === 0; // 시연용: 3개 중 1개꼴로 사진 후기
const rvImg = (p, r, k = 0) => { const ph = p.photos || {}, src = [ph.hero || p.img, p.img, ph.detail || p.img][(r.i + k) % 3]; return `<img src="${IMG[src]}" style="object-position:${RV_POS[(r.i + k * 2) % RV_POS.length]};transform:scale(${1.15 + ((r.i + k) % 3) * 0.2})" alt="">`; };
function rvSnaps(p, list) {
  const ph = list.filter(rvPh); if (!ph.length) return '';
  const n = Math.round(p.rev / 3), show = ph.slice(0, 8);
  return `<div class="rv-snaps">${show.map((r, k) => `<button class="rv-snap ${k === show.length - 1 && n > show.length ? 'more' : ''}" data-n="+${won(n - show.length + 1)}" data-a="${k === show.length - 1 && n > show.length ? 'revAll' : 'revItem'}" data-x="${k === show.length - 1 && n > show.length ? p.id : p.id + '|' + r.i}" aria-label="사진 후기">${rvImg(p, r)}</button>`).join('')}</div>`;
}
const rvCard = (p, r) => `<button class="rv-card" data-a="revItem" data-x="${p.id}|${r.i}"><span class="rv-top"><span class="rv-star">${rvStars(r.star)}</span><span>${r.id} · ${r.date}</span></span><span class="rv-body">${rvWho(r)}</span><span class="rv-fit f${r.fit}">사이즈 ${RV_FIT[r.fit]}</span><span class="rv-txt clamp">${r.text}</span>${rvPh(r) ? `<span class="rv-ph">${rvImg(p, r)}</span>` : ''}</button>`;
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
    ${rvSnaps(p, list)}
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
      ${rvPh(r) ? `<div class="rv-dph">${[0, 1].map((k) => `<span>${rvImg(p, r, k)}</span>`).join('')}</div>` : ''}
      <button class="rv-help ${on ? 'on' : ''}" data-a="revHelp" data-x="${key}">도움돼요 <span class="num">${r.help + (on ? 1 : 0)}</span></button></div>` };
};
SCR.cart = () => ({ node: '② 장바구니', bar: S.cart.length ? `<button class="btn" data-a="cartOrder">${won(S.cart.reduce((a, c) => a + sale(PB[c.pid]) * (c.qty || 1), 0))}원 주문하기</button>` : '', body: `${hdrBack('장바구니')}${S.cart.length ? slot('cart.top') : ''}
  ${S.cart.length ? S.cart.map((c, i) => { const p = PB[c.pid]; return `<div style="display:flex;gap:12px;padding:14px 16px;border-bottom:1px solid var(--line)"><div class="img" style="width:76px;height:92px;border-radius:6px;flex:none"><img src="${IMG[p.img]}"></div><div style="flex:1;min-width:0"><div class="br">${p.brand}</div><div class="nm">${p.name}</div><div style="font-size:13px;color:var(--sub);margin-top:3px">${c.color ? c.color + ' / ' : '사이즈 '}${c.size} · ${c.qty || 1}개</div><div class="price" style="margin-top:6px">${won(sale(p) * (c.qty || 1))}원</div></div><button data-a="cartDel" data-x="${i}" style="align-self:flex-start;color:var(--sub)">${I.close}</button></div>` }).join('')
    : `<div class="empty"><div class="big">${I.bag}</div><h4>장바구니가 비어 있어요</h4><p>마음에 드는 옷을 담아 보세요</p></div>`}
  ${S.cart.length && !S.user ? '<div class="p" style="font-size:12.5px;color:var(--sub)">비회원 장바구니는 이 기기에만 저장돼요. 가입하면 계정으로 합쳐져요</div>' : ''}` });
SCR.order = (pp) => {
  const its = pp.items, total = its.reduce((a, c) => a + sale(PB[c.pid]) * (c.qty || 1), 0), cp = S.coupons.find((c) => !c.used), off = cp ? Math.round(total * 0.1 / 100) * 100 : 0;
  return { node: '③ 구매 · 주문 · 결제 (고른 사이즈 · 쿠폰 적용)', bar: `<button class="btn" data-a="pay">${won(total - off)}원 결제하기</button>`, body: `${hdrBack('주문서')}
    <div class="sec" style="margin-top:10px"><h3>주문 상품 <small>${its.length}</small></h3></div>
    ${its.map((c) => { const p = PB[c.pid]; return `<div style="display:flex;gap:12px;padding:0 16px 12px"><div class="img" style="width:60px;height:72px;border-radius:6px;flex:none"><img src="${IMG[p.img]}"></div><div style="min-width:0"><div class="nm">${p.name}</div><div style="font-size:13px;color:var(--sub);margin-top:2px">${c.color ? c.color + ' / ' : '사이즈 '}${c.size}${(c.qty || 1) > 1 ? ' · ' + c.qty + '개' : ''}${c.rec ? ` · <span style="color:var(--fit);font-weight:700">내 기준 추천</span>` : ''}</div><div class="price" style="margin-top:4px">${won(sale(p) * (c.qty || 1))}원</div></div></div>` }).join('')}
    <div style="height:8px;background:var(--gray)"></div>
    <div class="sec" style="margin-top:18px"><h3>배송지</h3><span>변경</span></div><div class="pad" style="font-size:14px;line-height:1.6"><b>${S.user ? S.user.name : ''} · 010-****-1234</b><br><span style="color:var(--ink2)">서울시 마포구 월드컵북로 00, 101동 1001호</span></div>
    <div class="sec"><h3>쿠폰</h3></div><div class="pad"><div class="row" style="border:1px solid var(--line);border-radius:8px;padding:0 14px"><span style="font-size:14px">${cp ? cp.t : '사용할 쿠폰이 없어요'}</span><b style="color:var(--sale)">${off ? '−' + won(off) + '원' : ''}</b></div></div>
    <div class="sec"><h3>결제 수단</h3></div><div class="pad" style="display:flex;gap:8px"><span style="flex:1;height:46px;border:1px solid var(--primary);background:var(--primary-subtle);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px">카카오페이</span><span style="flex:1;height:46px;border:1px solid var(--line);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--ink2)">카드</span><span style="flex:1;height:46px;border:1px solid var(--line);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--ink2)">토스페이</span></div>
    <div class="pad" style="margin:22px 0 20px;font-size:14px;line-height:2"><div style="display:flex;justify-content:space-between"><span style="color:var(--ink2)">상품 금액</span><span class="num">${won(total)}원</span></div><div style="display:flex;justify-content:space-between"><span style="color:var(--ink2)">쿠폰 할인</span><span class="num" style="color:var(--sale)">−${won(off)}원</span></div><div style="display:flex;justify-content:space-between"><span style="color:var(--ink2)">배송비</span><span>무료</span></div><div style="display:flex;justify-content:space-between;font-size:17px;font-weight:800;margin-top:6px"><span>결제 금액</span><span class="num">${won(total - off)}원</span></div></div>` };
};
SCR.payfail = () => ({ node: '③ 구매 · 결제 성공? → 아니오 · 실패 안내', bar: `<button class="btn" data-a="back">다시 결제하기</button>`, body: `${hdrBack('')}<div class="empty" style="padding-top:120px"><div class="big" style="background:#FFF0EF;color:var(--sale)">${I.close}</div><h4>결제가 완료되지 않았어요</h4><p>카드사 승인이 거절됐어요.<br>다른 결제 수단으로 다시 시도해 주세요</p></div>` });
SCR.ordered = (pp) => ({ node: '③ 구매 · 주문 완료 → 옷장 대기 목록 자동 추가', body: `<div class="hdr"><span></span><button data-a="tab" data-x="home">${I.close}</button></div>
  <div style="text-align:center;padding-top:60px"><div class="check">${I.check}</div><div style="font-size:23px;font-weight:800;letter-spacing:-.03em;margin-top:20px">주문이 완료됐어요</div><div style="font-size:14px;color:var(--ink2);margin-top:8px;line-height:1.55">주문한 옷은 내 옷장 대기 목록에 담겼어요.<br>배송 오면 입어 보고 핏을 알려 주세요</div></div>
  <div style="margin:28px 16px 0;border:1px solid var(--line);border-radius:10px;padding:12px;display:flex;gap:12px;align-items:center"><div class="img" style="width:52px;height:62px;border-radius:6px;flex:none"><img src="${IMG[PB[pp.items[0].pid].img]}"></div><div style="min-width:0"><span class="chipg">옷장 대기 목록</span><div class="nm" style="margin-top:6px;font-weight:700;color:var(--ink)">${PB[pp.items[0].pid].name} ${pp.items[0].size}${pp.items.length > 1 ? ` 외 ${pp.items.length - 1}벌` : ''}</div></div></div>
  <div style="position:absolute;left:16px;right:16px;bottom:34px;display:grid;gap:8px"><button class="btn" data-a="tab" data-x="home">쇼핑 계속하기</button><button class="btn line" data-a="goTab" data-x="my|orders">주문 내역 보기</button></div>` });
SCR.fit = (pp) => {
  const c = S.closet.find((x) => x.id === pp.id); if (!c) return SCR.closet();
  const st = pp.st || {}, ans = st.ans || null;
  const ret = st.ret;
  const ok = ans === 'good' || (ans === 'bad' && (!c.delivered || ret != null));
  return { node: ans === 'bad' ? '⑤ 핏 알려 주기 · 잘 맞나? → 안 맞아요 · 옷장에서 뺌 (구매한 옷은 반품 · 교환)' : '⑤ 핏 알려 주기 · 잘 맞나? (배송 알림 · 옷 상세 정보에서 열림)', bar: `<button class="btn" ${ok ? '' : 'disabled'} data-a="fitSave" data-x="${c.id}">${ret ? '반품 신청하고 옷장에서 빼기' : ans === 'bad' ? '옷장에서 빼기' : '저장하고 옷장에 담기'}</button>`, body: `${hdrBack('핏 알려 주기')}
    <div style="margin:6px 16px 0;display:flex;gap:12px;align-items:center"><div class="img" style="width:56px;height:68px;border-radius:6px;flex:none">${pic(c)}</div><div><div style="font-size:14px;font-weight:700">${c.name} · ${c.size}</div><div class="meta" style="font-size:12px">${c.delivered ? '10월 13일 배송 완료' : c.src}</div></div></div>
    <div style="font-size:22px;font-weight:800;letter-spacing:-.03em;padding:26px 16px 0">입어 보니 어땠어요?</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 16px 0">${[['good', '잘 맞아요'], ['bad', '안 맞아요']].map(([k, t]) => `<button data-a="fitAns" data-x="${c.id}|${k}" style="height:52px;border-radius:6px;font-size:15px;${ans === k ? 'border:1px solid var(--primary);background:var(--primary-subtle);font-weight:700' : 'border:1px solid var(--line);font-weight:600'}">${t}</button>`).join('')}</div>
    ${ans === 'bad' ? `
      ${c.delivered ? `<div style="font-size:16px;font-weight:700;padding:24px 16px 10px">반품 · 교환할 건가요?</div><div class="pad" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${[[1, '반품 · 교환 신청'], [0, '그냥 둘게요']].map(([k, t]) => `<button data-a="fitRet" data-x="${c.id}|${k}" style="height:46px;border-radius:6px;font-size:14px;${ret === k ? 'border:1px solid var(--primary);background:var(--primary-subtle);font-weight:700' : 'border:1px solid var(--line)'}">${t}</button>`).join('')}</div>` : ''}
      <div style="margin:16px 16px 20px;font-size:13px;color:var(--ink2);background:var(--gray);border-radius:8px;padding:11px 12px">옷장에는 잘 맞는 옷만 담겨요. 안 맞는 옷은 옷장에서 빠져요${c.base ? '. 지금 기준 옷이라 같은 종류의 다른 잘 맞는 옷이 기준을 이어받아요' : ''}</div>` : ''}` };
};

/* 옷장 (E) */
const HOOK = '<svg width="26" height="22" viewBox="0 0 26 22" fill="none" stroke="#8C8880" stroke-width="1.8" stroke-linecap="round"><path d="M13 9.5a3 3 0 1 0-3-3"/><path d="M13 9.5V12L3 20.5h20L13 12"/></svg>';
SCR.closet = (pp = {}) => {
  if (!S.user) return { node: '⑤ 내 옷장 · 로그인? → 아니오', navOn: 'closet', body: `<div class="hdr"><span style="font-size:22px;font-weight:800;letter-spacing:-.03em">내 옷장</span></div><div class="empty"><div class="big">${I.hanger}</div><h4>로그인하고 내 옷장 만들기</h4><p>가진 옷을 등록하면 새 옷과 겹쳐서 비교해 드려요</p><button class="btn" style="margin-top:22px" data-a="closetLogin">로그인하기</button></div>` };
  const waitReg = S.pending.length;
  if (!S.closet.length && !waitReg) return { node: '⑤ 내 옷장 · 옷이 있나? → 아니오 · 빈 옷장', navOn: 'closet', body: `<div class="hdr"><span style="font-size:22px;font-weight:800;letter-spacing:-.03em">내 옷장</span></div><div class="empty"><div class="big">${I.hanger}</div><h4>첫 옷을 등록해 보세요</h4><p>지금 제일 잘 맞는 옷 한 벌이면 충분해요.<br>첫 등록하면 10% 쿠폰을 드려요</p><button class="btn" style="margin-top:22px" data-a="reg" data-x="|closet">첫 옷 등록하기</button></div>` };
  const t = pp.t || (CATS.find((c) => ofCat(c.k).length) || CATS[0]).k, all = ofCat(t), subs = CM[t].subs.filter((x) => all.some((c) => c.sub === x));
  const sv = subs.includes(pp.s) ? pp.s : '', mine = sv ? all.filter((c) => c.sub === sv) : all, cb = sv ? baseOf({ cat: t, sub: sv }) : baseOf(t), sb = sv ? subBaseOf(t, sv) : null;
  const isRef = (c) => sv ? c.subBase : c === cb; // 그룹마다 기준 옷이 있어 '전체'에선 첫 기준 옷만 가운데 // 이 범위의 기준 옷
  const good = mine.filter((c) => c.fit === 'good' && !isRef(c));
  const b0 = mine.find((c) => isRef(c) && c.fit === 'good') || (sv && !sb ? mine.find((c) => c.base) : null); // 기준 옷을 선반 가운데에 걸어 양옆이 보이게
  if (b0) { good.splice(good.indexOf(b0) >= 0 ? good.indexOf(b0) : good.length, good.indexOf(b0) >= 0 ? 1 : 0); good.splice(good.length >> 1, 0, b0) }
  // 선반: 가운데 옷을 크게, 양옆 2벌씩 겹쳐 보임. 옆 옷을 누르거나 끌면 가운데로, 가운데 옷을 누르면 옷 상세 정보
  const rack = (key, arr, cap) => {
    const k = t + ':' + sv + ':' + key, bi = b0 ? arr.indexOf(b0) : -1;
    let c = S.rack[k]; if (c == null || c >= arr.length) c = S.rack[k] = bi >= 0 ? bi : (arr.length - 1) >> 1;
    const cen = arr[c];
    return `<div class="rkbox ${rackCard ? 'boxed' : ''}" data-rack="${k}" data-s="${sv}" data-n="${arr.length}" data-c="${c}"><div class="rkrod"></div><div class="rkmv">
      ${arr.map((x, i) => { const L = RK(i - c); return `<span class="rkh" data-i="${i}" style="transform:translateX(${L.x}px);opacity:${L.o};z-index:${L.z + 1}">${HOOK}</span>` }).join('')}
      ${arr.map((x, i) => { const L = RK(i - c); return `<button class="rk" data-i="${i}" data-cn="${x.name}" data-cs="${cap(x)}" data-a="rackTap" data-x="${k}|${i}|${x.id}" data-id="${x.id}" style="transform:${L.t};z-index:${L.z};opacity:${L.o};--dm:${L.d}">${cutPic(x)}</button>` }).join('')}</div>
      <div class="rkf l"></div><div class="rkf r"></div>
      <div class="rkcap"><b>${cen.name}</b><span>${cap(cen)}</span><div class="rkact">${rkAct(cen, sv)}</div></div></div>`;
  };
  return { node: mine.length ? (sv ? `⑤ 내 옷장 · 세부 종류 칩(${sv}) → ${sv} 기준 옷 보기 · 정하기` : '⑤ 내 옷장 · 종류 탭 · 세부 종류 칩(전체) · 잘 맞는 옷 선반') : '⑤ 내 옷장 · 빈 종류 탭', navOn: 'closet', fab: `<button class="fab" data-a="reg" data-x="${mine.length ? '' : t}|closet">${I.plus} 옷 등록</button>`, body: `
    <div class="hdr"><span class="t">내 옷장</span></div>
    <div class="ctabs">${CATS.map((c) => `<button class="${c.k === t ? 'on' : ''}" data-a="closetTab" data-x="${c.k}">${c.label} ${ofCat(c.k).length}</button>`).join('')}</div>
    ${waitReg ? `<button data-a="go" data-x="regFit" style="margin:14px 16px 0;width:calc(100% - 32px);display:flex;justify-content:space-between;align-items:center;border-radius:10px;background:var(--fitw);padding:12px 14px;font-size:14px"><span><b>등록 대기 ${waitReg}벌</b> · 확인하면 옷장에 담겨요</span>${I.chev}</button>` : ''}
    ${!mine.length ? `<div class="empty" style="padding-top:60px"><div class="big">${I[CM[t].icon]}</div><h4>${CAT[t]}가 아직 없어요</h4><p>처음 등록한 잘 맞는 ${CAT[t]}가 기준 옷이 되고,<br>${CAT[t]} 상품마다 추천 사이즈가 나와요</p><button class="btn" style="margin-top:22px" data-a="reg" data-x="${t}|closet">${CAT[t]} 한 벌 등록</button></div>` : `
    ${subs.length ? `<div class="cchips">${['', ...subs].map((x) => `<button class="${x === sv ? 'on' : ''}" data-a="closetSub" data-x="${x}">${x || '전체'}</button>`).join('')}</div>` : ''}${slot('closet.top') || cbook()}
    ${!baseOf(t) ? `<div style="margin:14px 16px 0;font-size:13px;color:var(--ink2);background:var(--gray);border-radius:8px;padding:11px 12px">잘 맞는 ${CAT[t]}가 아직 없어서 기준 옷이 없어요. 잘 맞는 옷을 등록하면 자동으로 기준 옷이 돼요</div>` : ''}
    ${good.length ? rack('good', good, (c) => `${!sv && c.subBase ? c.sub + ' 기준 옷' : c.sub || CAT[c.cat]} · ${c.size} Size`) : '<div class="pad" style="font-size:13px;color:var(--sub)">입어 보고 잘 맞으면 여기에 걸려요</div>'}
    <div style="height:90px"></div>`}` };
};
SCR.item = (pp) => {
  const c = S.closet.find((x) => x.id === pp.id); if (!c) return SCR.closet();
  const cb = baseOf(c), L = GN(c), sb = c.sub ? subBaseOf(c.cat, c.sub) : null, ye = (w) => { const k = w.charCodeAt(w.length - 1) - 0xAC00; return k >= 0 && k < 11172 && k % 28 ? '이에요' : '예요' };
  // 기준 옷 설정: 종류 기준 + 세부 종류만 따로 기준. 한 줄에 제목 · 설명 · 버튼 (시안 475:1045)
  const row = (title, desc, right) => `<div class="it-row"><div><b>${title}</b><small>${desc}</small></div>${right}</div>`;
  const act = (a, t) => `<button class="it-btn" data-a="${a}" data-x="${c.id}">${t}</button>`;
  const baseSec = c.fit !== 'good' ? '<div class="it-note">입어 보기 전인 옷은 기준 옷이 될 수 없어요. 핏을 알려 주고 잘 맞으면 기준 옷으로 정할 수 있어요</div>'
    : row(c.base ? `${L} 기준 옷` : `${L} 기준 옷으로 변경하기`, c.base ? `${L} 상품의 추천 사이즈를 이 옷으로 계산해요` : `지금은 ${cb.name}${ye(cb.name)}`, c.base ? `<span class="it-now">${I.check}지금 기준</span>` : act('setBase', '변경하기'))
    + (c.sub && !c.base ? row(c.subBase ? `${c.sub} 기준 옷` : `${c.sub} 기준 옷으로 변경하기`, c.subBase ? `${c.sub} 상품은 ${L} 기준 옷 대신 이 옷과 비교해요` : `${c.sub}만 핏이 달라 따로 비교하고 싶을 때 지정${sb ? ` · 지금은 ${sb.name}` : ''}`, c.subBase ? act('unsetSub', '해제') : act('setSubBase', sb ? '변경하기' : '지정하기')) : '');
  return { node: '⑤ 내 옷장 · 옷 상세 정보 → 기준 옷 바꾸기 · 세부 종류 기준 · 정보 수정 · 삭제', bar: `<button class="btn" data-a="editItem" data-x="${c.id}">수정하기</button>`, body: `${hdrBack('옷 상세 정보', `<button class="it-del" data-a="delItem" data-x="${c.id}">삭제</button>`)}
    <div class="it-img">${c.img ? `<img src="${CUT[c.img] || IMG[c.img]}" alt="">`
      : `<div style="display:flex;flex-direction:column;align-items:center;gap:12px"><div style="width:200px;height:200px">${tplSvg(c)}</div><span style="font-size:13px;color:var(--text-tertiary)">사진이 없어 치수로 그린 모양이에요</span><button class="it-btn" data-a="photoAdd" data-x="${c.id}|item" style="display:flex;align-items:center;gap:4px">${I.plus} 사진 추가</button></div>`}</div>
    <div class="it-info"><div class="it-nm">${c.name}</div><div class="it-meta">${CAT[c.cat]}${c.sub ? ' · ' + c.sub : ''} · ${c.size} 사이즈 · 등록 경로 ${c.src}</div>
      <div class="it-ms">${partsOf(c).map((x, i) => c.m[i] ? `<div><small>${LONG[x] || x}</small><b>${c.m[i]}cm</b></div>` : '').join('')}</div></div>
    <div class="it-gap"></div><div class="it-base">${baseSec}</div><div style="height:24px"></div>` };
};
SCR.edit = (pp) => {
  const c = S.closet.find((x) => x.id === pp.id); if (!c) return SCR.closet();
  if (!pp.d) pp.d = { img: c.img, name: c.name, cat: c.cat, sub: c.sub, size: c.size, m: c.m.slice(), base: !!c.base };
  const d = pp.d, cm = CM[d.cat], need = NEED[pkOf(d.cat, d.sub)] || [], cb = baseOf(c), h = (t, r = '') => `<div class="ed-h"><b>${t}</b>${r}</div>`;
  const chips = (list, on, a) => `<div class="cchips ed-chips">${list.map((x) => `<button class="${on === x ? 'on' : ''}" data-a="${a}" data-x="${x}">${x}</button>`).join('')}</div>`;
  return { node: d.cat !== c.cat ? '⑤ 정보 수정 · 종류 바꿈 → 치수 다시 입력' : '⑤ 옷 상세 정보 · 정보 수정 (사진 · 이름 · 종류 · 사이즈 · 치수 · 기준 옷) → 추천 사이즈 다시 계산', bar: `<button class="btn" data-a="saveEdit" data-x="${c.id}">저장하기</button>`, body: `${hdrBack('옷 정보 수정')}
    <div class="ed-top"><button class="ed-pic" data-a="photoAdd" data-x="${c.id}|edit" aria-label="${d.img ? '사진 바꾸기' : '사진 추가'}">${d.img ? `<img src="${CUT[d.img] || IMG[d.img]}" alt="">` : tplSvg(d)}<span class="ed-cam">${I.camera}</span></button><label class="ed-name"><input id="ename" class="tin" value="${esc(d.name)}" placeholder="옷 이름"><button class="ed-x" data-a="editClear" aria-label="지우기">×</button></label></div>
    <div class="it-gap"></div>
    <div class="ed-sec">${h('옷 종류')}<div class="ed-seg">${CATS.map((k) => `<button class="${k.k === d.cat ? 'on' : ''}" data-a="editCat" data-x="${k.k}">${k.label} ${ofCat(k.k).length}</button>`).join('')}</div>${chips(cm.subs, d.sub, 'editSub')}</div>
    <div class="it-gap"></div>
    <div class="ed-sec">${h('사이즈')}${chips(cm.sizes, d.size, 'editSize').replace('cchips ed-chips', 'cchips ed-chips ed-sz')}</div>
    <div class="it-gap"></div>
    <div class="ed-sec">${h('실측', '<span>단면 · cm</span>')}${partsOf(d).map((x, i) => `<div class="ed-m"><span>${LONG[x] || x}${need.includes(x) ? '' : '<small>선택</small>'}</span><label><input inputmode="decimal" id="m${i}" value="${d.m[i] ?? ''}" placeholder="0">cm</label></div>`).join('')}
      <div class="ed-tools"><button data-a="edTool" data-x="paste">${I.pen}사이즈표 붙여넣기</button><button data-a="edTool" data-x="cam">${I.camera}직접 촬영으로 측정하기</button></div></div>
    ${c.fit === 'good' ? `<div class="it-gap"></div><div class="ed-sec">${h('기준 옷 정하기')}<button class="ed-chk ${d.base ? 'on' : ''}" data-a="editBase">${CHK(d.base)}<span><b>이 옷을 ${GN(d)} 기준 옷으로 정하기</b><small>${c.base ? `지금 ${GN(c)} 기준 옷이에요. 다른 옷을 기준으로 정하면 바뀌어요` : cb ? `지금 기준 옷은 ${cb.name} ${cb.size}. 체크하면 이 옷으로 바뀌어요` : '체크하면 이 옷이 기준 옷이 돼요'}</small></span></button></div>` : ''}
    <div style="height:24px"></div>` };
};

/* 옷 등록 (D) */
const REG_IC = { cap: '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"> <g> <path d="M7.33333 2.75H14.6667C15.6792 2.75 16.5 3.57081 16.5 4.58333V17.4167C16.5 18.4292 15.6792 19.25 14.6667 19.25H7.33333C6.32081 19.25 5.5 18.4292 5.5 17.4167V4.58333C5.5 3.57081 6.32081 2.75 7.33333 2.75Z" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" stroke="#121212"/> <path d="M9.16667 6.41667H12.8333M9.16667 10.0833H12.8333" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" stroke="#121212"/> </g> </svg>', link: '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"> <g> <path d="M9.16667 12.8333C9.85207 13.5052 10.7736 13.8815 11.7333 13.8815C12.6931 13.8815 13.6146 13.5052 14.3 12.8333L17.05 10.0833C17.5796 9.37724 17.8367 8.50381 17.7741 7.62341C17.7115 6.743 17.3335 5.91472 16.7094 5.29061C16.0853 4.6665 15.257 4.28846 14.3766 4.22589C13.4962 4.16332 12.6228 4.42043 11.9167 4.95L11 5.86667" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" stroke="#121212"/> <path d="M12.8333 9.16667C12.1479 8.49483 11.2264 8.11852 10.2667 8.11852C9.30691 8.11852 8.38541 8.49483 7.7 9.16667L4.95 11.9167C4.42043 12.6228 4.16332 13.4962 4.22589 14.3766C4.28846 15.257 4.6665 16.0853 5.29061 16.7094C5.91472 17.3335 6.743 17.7115 7.62341 17.7741C8.50381 17.8367 9.37724 17.5796 10.0833 17.05L11 16.1333" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" stroke="#121212"/> </g> </svg>', cam: '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"> <g> <path d="M3.66667 7.33333H6.41667L8.25 4.58333H13.75L15.5833 7.33333H18.3333V17.4167H3.66667V7.33333Z" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" stroke="#121212"/> <path d="M14.2083 11.9167C14.2083 13.6886 12.7719 15.125 11 15.125C9.22809 15.125 7.79167 13.6886 7.79167 11.9167C7.79167 10.1448 9.22809 8.70833 11 8.70833C12.7719 8.70833 14.2083 10.1448 14.2083 11.9167Z" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" stroke="#121212"/> </g> </svg>' };
SCR.regType = () => {
  const rows = [['capture', REG_IC.cap, '구매내역 캡처 등록', '타사 구매내역 스크린샷에서 자동으로 등록'], ['link', REG_IC.link, '상품 링크로 등록', '쇼핑몰 상품 링크를 붙여넣기'], ['camera', REG_IC.cam, '사진 촬영으로 등록', 'A4 용지와 함께 찍으면 치수를 추정'], ['orders', I.bag, '자사몰 구매 내역 불러오기', '당장에서 구매한 내역으로 등록'], ['manual', I.pen, '수치 직접 입력하기', '알고 있는 실측을 직접 입력']];
  return { node: '④ 옷 등록 · 방법 고르기 (캡처 · 링크 · 촬영 · 당장 구매 내역 · 직접 입력)', body: `${hdrBack('옷 등록')}
  <div class="rlist">${rows.map(([k, ic, t, d], i) => `${i ? '<i class="rsep"></i>' : ''}<button class="rrow" data-a="regM" data-x="${k}"><span class="rbox">${ic}</span><span class="rtx"><b>${t}</b><small>${d}</small></span></button>`).join('')}</div>` };
};
SCR.regMethod = SCR.regType;
const PARTNER = { host: 'dangjang.shop', name: 'DANGJANG 제휴 브랜드' };
SCR.regLink = (pp) => ({ node: pp.err ? '④ 옷 등록 · 상품 링크 → 주소가 잘못됨 · 다시 입력' : '④ 옷 등록 · 상품 링크 붙여넣기', bar: `<button class="btn fb" data-a="regLinkGo" ${pp.v && !pp.err ? '' : 'disabled'}>다음</button>`, body: `${hdrBack('상품 링크 등록')}<div class="ftitle">산 옷의 상품 링크를<br>붙여 넣어 주세요</div>
  <div class="pad" style="margin-top:16px"><input class="tin fin ${pp.err ? 'err' : ''}" id="link" value="${pp.v || ''}" placeholder="https://" inputmode="url">
  ${pp.err ? `<div class="ferr">${pp.err}</div>` : ''}
  <div class="fdemo">시연용 예시 링크</div><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">${[['p2', '제휴 브랜드 셔츠'], ['p6', '제휴 브랜드 데님']].concat(API.on ? [['ms1', '쇼핑몰 실제 티셔츠'], ['ms2', '쇼핑몰 실제 바지']] : [['other', '다른 쇼핑몰 상품']], [['broken', '잘못된 주소']]).map(([k, t]) => `<button data-a="regLinkEx" data-x="${k}" class="fchip">${t}</button>`).join('')}</div></div>` });
SCR.regLinkP = (pp) => {
  const p = PB[pp.pid], keys = sizeKeys(p), sz = pp.size, parts = partsOf(p);
  return { node: '④ 옷 등록 · 상품 링크 → 제휴 브랜드 → 사진 · 공개 실측 자동 입력', bar: p.sizes ? `<button class="btn" ${sz ? '' : 'disabled'} data-a="regLinkUse">${sz ? sz + ' 사이즈로 등록' : '산 사이즈를 골라 주세요'}</button>` : `<button class="btn line" style="flex:.8" data-a="regLinkManual">직접 입력</button><button class="btn" data-a="regLinkPhoto">사진으로 재기</button>`, body: `${hdrBack('상품 정보')}
    <div style="display:flex;gap:14px;padding:6px 16px 0"><div style="flex:none;width:110px"><div class="img" style="width:110px;height:132px;border-radius:8px"><img src="${pp.img || IMG[p.img]}" style="object-fit:${pp.own ? 'contain' : 'cover'}"></div>${picBtn(pp)}</div><div style="min-width:0"><div style="font-size:15px">${p.name}</div><div style="font-size:12px;color:var(--sub);margin-top:6px;word-break:break-all">${PARTNER.host}/goods/${p.id}</div></div></div>
    <div class="pad" style="margin-top:18px"><div style="font-size:14px;font-weight:700;margin-bottom:8px">산 사이즈</div><div class="szs">${keys.map((k) => `<button class="sz ${k === sz ? 'on' : ''}" data-a="regLinkSize" data-x="${k}"><b>${k}</b><span>${p.out.includes(k) ? '품절' : ''}</span></button>`).join('')}</div></div>
    ${p.sizes ? (sz ? `<div class="pad" style="margin-top:16px"><div style="font-size:14px;font-weight:700">판매처가 공개한 ${sz} 실측</div><table class="mtable" style="margin-top:6px">${parts.map((x, i) => `<tr><td style="color:var(--ink2)">${LONG[x]}</td><td>${p.sizes[sz][i] ? p.sizes[sz][i] + ' cm' : '–'}</td></tr>`).join('')}</table><div class="note2">다음 화면에서 고칠 수 있어요</div></div>` : '')
      : `<div style="margin:16px 16px 0;padding:12px 14px;border-radius:10px;background:#FFF6E0;font-size:13.5px;line-height:1.55"><b style="color:#9A6400">이 상품은 판매처가 실측을 공개하지 않았어요</b><br>사진은 가져왔어요. 핏 예측은 실측이 중요해서, 내 옷을 사진으로 재거나 직접 입력해 주세요</div>`}` };
};
function srvRow(row, cat) { // 판매처 실측표 한 줄 → 우리 부위 순서 (둘레는 반으로)
  const out = {}; for (const [name, v] of Object.entries(row || {})) { const hit = partsIn(name)[0]; if (!hit || out[hit[0]] != null) continue; out[hit[0]] = hit[1] ? Math.round(v / 2 * 10) / 10 : v; }
  if (cat === 'bottom' && out.인심 == null && out.총장 != null && out.밑위 != null) { out.인심 = Math.round((out.총장 - out.밑위) * 10) / 10; out._est = '인심'; }
  for (const [name, v] of Object.entries(row || {})) { if (/전체 ?소매/.test(name)) out._full = '소매'; if (/소매 ?부리/.test(name) && out.소매부리 == null) out.소매부리 = v; if (/암홀/.test(name) && out.암홀 == null) out.암홀 = v; }
  return out;
}
const CB = ['/api/asset?name=img/cbook_0.png', '/api/asset?name=img/cbook_1.png', '/api/asset?name=img/cbook_2.png', '/api/asset?name=img/cbook_3.png']; // 내 옷장 위 코디북 배너 옷 그림
const cbook = () => `<button class="cbook" data-a="cbook"><b>나만의 코디북 만들기${I.chev}</b><small>등록한 옷으로 코디하고 공유해요!</small><img src="${CB[0]}" alt="" style="right:29px;top:12px;width:72px;height:86px"><img src="${CB[1]}" alt="" style="right:46px;top:0;width:70px;height:70px"><img src="${CB[2]}" alt="" style="right:99px;top:25px;width:45px;height:55px"><img src="${CB[3]}" alt="" style="right:19px;top:3px;width:43px;height:52px"></button>`;
const picBtn = (pp) => `<label style="display:block;margin-top:6px;height:30px;line-height:28px;border:1px solid var(--line);border-radius:15px;text-align:center;font-size:12.5px;font-weight:600">${pp.own ? '다른 사진으로' : pp.noPic ? '사진 올리기' : '사진 바꾸기'}<input type="file" accept="image/*" hidden onchange="linkImg(this)"></label>`;
function linkImg(inp) { // 상품 사진 대신 내가 고른 사진을 옷장 그림으로 (모델컷 대신 옷만 나온 사진 등)
  const f = inp.files && inp.files[0]; if (!f) return; const pp = cur().p, im = new Image(), u = URL.createObjectURL(f);
  im.onload = () => { const k = Math.min(1, 1000 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); pp.img = c.toDataURL('image/jpeg', 0.88); pp.own = true; render(); };
  im.onerror = () => URL.revokeObjectURL(u); im.src = u;
}
SCR.regLinkS = (pp) => {
  const r = pp.r, cat = r.cat || 'top', keys = r.table ? Object.keys(r.table) : (r.sizes || []), sz = pp.size, parts = PARTS[(S.reg && S.reg.pk) || cat], row = sz && r.table && r.table[sz] ? srvRow(r.table[sz], cat) : null;
  const img = pp.img || (r.image ? '/api/img?url=' + encodeURIComponent(r.image) : null), cap = pp.from === 'cap';
  return { node: cap ? '④ 옷 등록 · 구매내역 캡처 → 글자 읽기 → 무신사에서 같은 상품 → 실측표' : '④ 옷 등록 · 상품 링크 → 서버가 쇼핑몰 페이지 읽음 → 사진 · 실측표', bar: r.table ? `<button class="btn" ${sz ? '' : 'disabled'} data-a="regSrvUse">${sz ? esc(sz) + ' 사이즈로 등록' : '산 사이즈를 골라 주세요'}</button>` : `<button class="btn line" style="flex:.8" data-a="regSrvAlt" data-x="manual">직접 입력</button><button class="btn" data-a="regSrvAlt" data-x="photo">사진으로 재기</button>`,
    body: `${hdrBack(cap ? '구매내역 캡처' : '상품 링크')}${cap ? `<div style="margin:0 16px 10px;padding:11px 14px;border-radius:10px;background:var(--fitw);font-size:13.5px;line-height:1.5">캡처에서 읽은 상품명으로 <b>무신사에서 같은 상품</b>을 찾았어요${r.colorDiff ? ` · 캡처의 [${esc(r.colorDiff.cap)}] 색상은 무신사에 없어서 같은 모델 [${esc(r.colorDiff.got)}]의 실측이에요` : ''}${pp.capSize ? (sz ? ` · 산 사이즈 <b>${esc(sz)}</b>도 읽었어요` : ` · 읽은 사이즈(${esc(pp.capSize)})가 실측표에 없어서 골라 주세요`) : ' · 산 사이즈를 골라 주세요'}</div>` : ''}<div style="display:flex;gap:14px;padding:6px 16px 0"><div style="flex:none;width:110px"><div class="img" style="width:110px;height:132px;border-radius:8px;background:${cap ? 'repeating-conic-gradient(#F1F0EE 0 25%,#FAFAF9 0 50%) 0 0/14px 14px' : '#F2F2F2'}">${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:${cap || pp.own ? 'contain' : 'cover'}">` : ''}</div>${cap ? '' : picBtn(pp)}</div><div style="min-width:0"><span class="chipf">${esc(r.site || '쇼핑몰')}</span>${r.brand ? `<div class="br" style="margin-top:8px">${esc(r.brand)}</div>` : ''}<div style="font-size:15px;margin-top:2px;line-height:1.4">${esc(r.name || '')}</div>${r.price ? `<div style="font-size:13px;color:var(--sub);margin-top:4px">${Number(r.price).toLocaleString('ko-KR')}원</div>` : ''}</div></div>
    ${keys.length ? `<div class="pad" style="margin-top:18px"><div style="font-size:14px;font-weight:700;margin-bottom:8px">산 사이즈</div><div class="szs" style="flex-wrap:wrap">${keys.map((k) => `<button class="sz ${k === sz ? 'on' : ''}" data-a="regSrvSize" data-x="${esc(k)}"><b style="font-size:${k.length > 4 ? 12 : 15}px">${esc(k)}</b></button>`).join('')}</div></div>` : ''}
    ${r.table ? (row ? `<div class="pad" style="margin-top:16px"><div style="font-size:14px;font-weight:700">${esc(r.tableSource || '판매처 실측')} · ${esc(sz)}</div><table class="mtable" style="margin-top:6px">${parts.map((x) => `<tr><td style="color:var(--ink2)">${LONG[x]}${row._est === x ? ' (총장−밑위 추정)' : ''}</td><td>${row[x] != null ? row[x] + ' cm' : '<span style="color:var(--sub)">없음 · 다음 화면에서 입력</span>'}</td></tr>`).join('')}</table><div class="note2">다음 화면에서 고칠 수 있어요</div></div>` : '')
      : `<div style="margin:16px 16px 0;padding:12px 14px;border-radius:10px;background:#FFF6E0;font-size:13.5px;line-height:1.55"><b style="color:#9A6400">이 상품 페이지에서 실측표를 찾지 못했어요</b><br>사진과 상품 이름은 가져왔어요. 실측은 내 옷을 사진으로 재거나, 사이즈표를 붙여 넣거나, 직접 입력해 주세요</div><div class="pad" style="margin-top:10px"><button class="opt" data-a="regSrvAlt" data-x="paste"><span class="oi">${I.pen}</span><span style="flex:1"><b>사이즈표 붙여넣기</b><span>상품 페이지 사이즈표를 복사해 붙여 넣기</span></span>${I.chev}</button></div>`}` };
};
SCR.regLinkO = (pp) => ({ node: '④ 옷 등록 · 상품 링크 → 제휴 아님 → 실측 먼저 채우기', body: `${hdrBack('상품 링크')}
  <div class="pad" style="padding-top:6px;display:flex;gap:12px;align-items:flex-start"><div style="flex:none;width:84px"><div class="img" style="width:84px;height:100px;border-radius:8px;background:var(--bg-subtle);display:flex;align-items:center;justify-content:center;color:var(--sub);font-size:11.5px">${pp.img ? `<img src="${pp.img}" style="object-fit:contain">` : '사진 없음'}</div>${picBtn(Object.assign(pp, { noPic: !pp.img }))}</div><div style="min-width:0;flex:1"><div style="font-size:12.5px;color:var(--sub);word-break:break-all">${pp.url}</div>
  <div style="font-size:21px;font-weight:800;letter-spacing:-.03em;margin-top:10px;line-height:1.35">이 쇼핑몰 정보는<br>자동으로 가져오지 못했어요</div>
  <div style="font-size:14px;color:var(--ink2);margin-top:8px;line-height:1.55">${pp.why ? esc(pp.why) + '. ' : API.on ? '' : '이 화면(아티팩트)에서는 다른 사이트를 읽을 수 없어요. '}핏 예측에는 사진보다 실측이 중요해서, 아래 방법으로 실측부터 채워 주세요</div></div></div>
  <div class="pad" style="margin-top:18px">
    <button class="opt" data-a="regLinkPaste"><span class="oi">${I.pen}</span><span style="flex:1"><b>사이즈표 붙여넣기</b><span>상품 페이지 사이즈표를 복사해 붙여 넣으면 자동으로 읽어요</span></span>${I.chev}</button>
    <button class="opt" data-a="regLinkPhoto"><span class="oi">${I.camera}</span><span style="flex:1"><b>내 옷 사진으로 재기</b><span>A4와 함께 찍으면 실측을 재요</span></span>${I.chev}</button>
    <button class="opt" data-a="regLinkManual"><span class="oi">${I.photo}</span><span style="flex:1"><b>직접 입력</b><span>줄자로 잰 치수를 알고 있다면</span></span>${I.chev}</button>
  </div>
  <div class="p" style="font-size:12.5px;color:var(--sub)">옷장에 넣을 옷 사진은 왼쪽 위 '사진 올리기'로 넣을 수 있어요</div>` });
SCR.loading = (pp) => ({ node: pp.node || '④ 옷 등록 · 처리 중', body: `<div style="padding-top:300px;text-align:center"><div class="spin"></div><div style="font-size:15px;font-weight:700;margin-top:18px">${pp.t}</div></div>` });
SCR.permDenied = (pp) => ({ node: `④ 옷 등록 · ${pp.k === 'photo' ? '사진첩' : '카메라'} 권한? → 거부 · 권한 안내`, body: `${hdrBack('')}<div class="empty" style="padding-top:110px"><div class="big">${pp.k === 'photo' ? I.photo : I.camera}</div><h4>${pp.k === 'photo' ? '사진' : '카메라'} 접근이 꺼져 있어요</h4><p>설정에서 DANGJANG의 ${pp.k === 'photo' ? '사진' : '카메라'} 접근을 켜거나<br>다른 방법으로 등록해 주세요</p>
  <div style="display:grid;gap:8px;margin-top:24px"><button class="btn" data-a="permSettings" data-x="${pp.k}">설정 열기</button><button class="btn line" data-a="back">다른 방법으로 등록</button></div></div>` });
const SHOTS = [['hero', '[플러스] 릴렉스드 타입라이터 셔츠', 'M'], ['tee', '릴렉스 핏 크루 넥 티셔츠', 'L'], ['jacket', '[씬라이트] 후드 재킷', 'M'], ['denim', '우먼즈 에센셜 와이드 데님 팬츠', '30'], ['knit', '파인 캐시미어 100 크루넥', 'L'], ['slacks', '세미 와이드 히든 밴딩 슬랙스', '30']];
SCR.regCapture = () => ({ node: '④ 옷 등록 · 구매내역 캡처 고르기', body: `${hdrBack('최근 항목')}<div class="p" style="padding-top:0">주문 내역을 캡처한 사진을 골라 주세요</div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-top:12px">${SHOTS.map(([img, n, s], i) => `<button data-a="regShot" data-x="${i}" style="aspect-ratio:9/16;background:#fff;border:1px solid var(--line);padding:8px 6px;text-align:left;display:flex;flex-direction:column;gap:5px;${i === 5 ? 'filter:blur(1.4px)' : ''}"><div style="font-size:8px;color:var(--text-tertiary)">주문 상세</div><div class="img" style="height:62%;border-radius:2px"><img src="${IMG[img]}"></div><div style="font-size:8.5px;font-weight:700;line-height:1.25">${n}</div><div style="font-size:8px;color:var(--text-tertiary)">사이즈 ${s} · 1개</div><div style="height:4px;background:var(--line);border-radius:2px;width:80%"></div></button>`).join('')}</div>
  <div class="p" style="font-size:12px;color:var(--sub)">시연: 마지막 사진은 흐려서 치수를 못 읽는 경우</div>` });
SCR.regCrop = (pp) => { const [img, n, s] = SHOTS[pp.i]; return { node: '④ 옷 등록 · 옷 하나만 자르기', bar: `<button class="btn" data-a="regCropOk" data-x="${pp.i}">이 옷으로 등록</button>`, body: `${hdrBack('옷 하나만 골라 주세요')}<div style="margin:10px 40px 0;background:#fff;border:1px solid var(--line);border-radius:8px;padding:18px 16px;position:relative">
  <div style="font-size:12px;color:var(--text-tertiary)">주문 상세 · 2026.09.28</div><div style="display:flex;gap:12px;margin-top:12px"><div class="img" style="width:96px;height:118px;border-radius:4px"><img src="${IMG[img]}"></div><div style="font-size:13px;line-height:1.55"><b>${n}</b><br>사이즈 ${s} · 1개<br><span style="color:var(--text-tertiary)">배송 완료</span></div></div>
  <div style="height:1px;background:var(--line);margin:14px 0"></div><div style="display:flex;gap:12px;opacity:.5"><div style="width:96px;height:60px;border-radius:4px;background:var(--line)"></div><div style="font-size:12px;color:var(--text-tertiary)">다른 상품 · 1개</div></div>
  <div style="position:absolute;left:8px;right:8px;top:30px;height:142px;border:2.5px solid var(--fit);border-radius:6px;box-shadow:0 0 0 999px rgba(0,0,0,.25)"></div></div>
  <div class="p" style="text-align:center;margin-top:14px">파란 상자를 움직여 등록할 옷만 남겨 주세요</div>` } };
SCR.regCamera = () => ({ node: '④ 옷 등록 · A4 가이드 촬영', white: true, full: true, body: `<div class="cam"><div style="position:absolute;top:47px;left:0;right:0;height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 16px"><button data-a="back" style="color:#fff">${I.close}</button><span style="font-size:15px;font-weight:700">A4와 함께 촬영</span><span style="width:24px"></span></div>
  <div style="position:absolute;top:120px;left:0;right:0;bottom:200px;background:#CDBFA9;overflow:hidden"><img src="${IMG[S.reg.cat === 'bottom' ? 'denim' : S.reg.cat === 'outer' ? 'jacket' : 'tee']}" style="position:absolute;left:24px;top:40px;width:220px;height:270px;object-fit:cover;mix-blend-mode:multiply;opacity:.95;transform:rotate(-2deg)">
  <div style="position:absolute;right:26px;bottom:40px;width:92px;height:130px;background:#FBFBF8;transform:rotate(6deg);box-shadow:0 2px 6px rgba(0,0,0,.2)"></div>
  <div style="position:absolute;right:20px;bottom:30px;width:106px;height:150px;border:2.5px dashed #fff;border-radius:4px;transform:rotate(6deg)"></div></div>
  <div style="position:absolute;left:0;right:0;bottom:200px;text-align:center;padding:10px;font-size:13.5px;background:rgba(0,0,0,.5)">옷을 바닥에 펼치고, A4 종이를 점선 안에 맞춰 주세요</div>
  <button data-a="shoot" aria-label="촬영" style="position:absolute;left:50%;bottom:70px;transform:translateX(-50%);width:76px;height:76px;border-radius:50%;border:5px solid #fff;background:rgba(255,255,255,.25)"></button></div>` });
SCR.regMeasure = () => {
  subAuto(S.reg, false);
  const r = S.reg, parts = PARTS[r.pk || r.cat], need = NEED[r.pk || r.cat], cur0 = baseOf({ cat: r.cat, sub: r.sub }), sizes = (r.sizeList && r.sizeList.length ? r.sizeList : (r.cat === 'bottom' ? ['28', '29', '30', '31', '32'] : ['S', 'M', 'L', 'XL'])), list = sizes.concat(r.size && !sizes.includes(r.size) ? [r.size] : []);
  const hh = (t, rt = '') => `<div class="ed-h"><b>${t}</b>${rt}</div>`; // 옷 정보 수정(489:1359)과 같은 UI
  return { node: '④ 옷 등록 · 치수 확인 (링크 · 캡처 · 사진 · 직접 입력 모두 여기서) → 기준 옷? → 옷장에 넣기', bar: `<button class="btn" data-a="regAdd">옷장에 넣기</button>`, body: `${hdrBack('치수 확인')}
    ${r.capMsg ? `<div class="it-note" style="margin:0 20px 12px">${r.capMsg}</div>` : ''}
    <div class="ed-top"><label class="ed-pic" style="${r.own || r.capImg ? 'background:repeating-conic-gradient(#F1F0EE 0 25%,#FAFAF9 0 50%) 0 0/14px 14px' : ''}">${r.img ? `<img src="${IMG[r.img]}" alt="">` : `<span style="color:var(--text-tertiary)">${I[r.cat]}</span>`}<span class="ed-cam">${I.camera}</span><input type="file" accept="image/*" hidden onchange="regImg(this)"></label><label class="ed-name"><input id="rname" class="tin" value="${esc(r.name || '')}" placeholder="옷 이름 (예: 옥스퍼드 셔츠)"><button class="ed-x" data-a="regClear" aria-label="지우기">×</button></label></div>
    <div class="it-gap"></div>
    <div class="ed-sec">${hh('옷 종류', r.sub ? (r.subWhy ? `<span>${r.mcat && MUSCAT[r.mcat] && r.mcatName ? `무신사 분류 '${esc(r.mcatName)}' 기준` : '자동으로 골랐어요'} · 다르면 바꿔 주세요</span>` : '') : '<span style="color:var(--danger)">골라 주세요</span>')}<div class="ed-seg">${Object.keys(SUB).map((c) => `<button data-a="regCat" data-x="${c}" class="${r.cat === c ? 'on' : ''}">${CAT[c]}</button>`).join('')}</div><div class="cchips ed-chips">${SUB[r.cat].map((x) => `<button data-a="regSub" data-x="${r.cat}|${x}" class="${r.sub === x ? 'on' : ''}">${x}</button>`).join('')}</div></div>
    <div class="it-gap"></div>
    <div class="ed-sec">${hh('사이즈', r.size ? '' : '<span style="color:var(--danger)">산 사이즈를 골라 주세요</span>')}<div class="cchips ed-chips ed-sz">${list.map((x) => `<button data-a="regSize" data-x="${esc(x)}" class="${r.size === x ? 'on' : ''}">${esc(x)}</button>`).join('')}</div></div>
    <div class="it-gap"></div>
    <div class="ed-sec">${hh('실측', '<span>단면 · cm</span>')}${parts.map((x, i) => `<div class="ed-m"><span>${LONG[x] || x}${r.est === x ? '<small>총장−밑위 추정</small>' : r.full === x ? '<small>목에서 잰 전체 소매</small>' : ''}${need.includes(x) ? '' : '<small>선택</small>'}</span><label><input inputmode="decimal" id="m${i}" value="${r.m ? (r.m[i] ?? '') : ''}" placeholder="0">cm</label></div>`).join('')}
      ${r.extra && Object.keys(r.extra).length ? `<div style="font-size:12.5px;color:var(--text-tertiary);margin-top:10px">참고 치수 · ${Object.entries(r.extra).map(([k, v]) => `${LONG[k] || k + ' 단면'} ${v}`).join(' · ')}</div>` : ''}
      <div class="ed-tools"><button data-a="regPaste">${I.pen}사이즈표 붙여넣기</button><button data-a="regPhotoMeasure">${I.camera}직접 촬영으로 측정하기</button></div></div>
    <div class="it-gap"></div>
    <div class="ed-sec">${hh('기준 옷 정하기')}<button class="ed-chk ${r.base ? 'on' : ''}" data-a="regBase">${CHK(r.base)}<span><b>이 옷을 ${GN(r)} 기준 옷으로 정하기</b><small>${cur0 ? `지금 기준 옷은 ${esc(cur0.name)} ${esc(cur0.size)}이에요. 체크하면 이 옷으로 바뀌어요` : `제일 잘 맞는 ${GN(r)}를 기준 옷으로 정하면 상품마다 추천 사이즈가 나와요`}</small></span></button></div>
    <div style="height:24px"></div>` };
};
SCR.regFit = () => ({ node: '④ 옷 등록 · 대기 목록 확인 → 옷장에 담기 (잘 맞는 옷만)', bar: `<button class="btn line" style="flex:.7" data-a="regLater">나중에</button><button class="btn" data-a="regSave">옷장에 담기</button>`, body: `${hdrBack('옷장에 담기')}
  <div class="p" style="padding-top:0">대기 목록 ${S.pending.length}벌 · 옷장에는 잘 맞는 옷만 담겨요. 잘 안 맞는 옷이면 빼 주세요</div>
  <div class="pad" style="margin-top:14px">${S.pending.map((c) => `<div style="border:1px solid var(--line);border-radius:10px;padding:12px;margin-bottom:10px"><div style="display:flex;gap:12px;align-items:center"><div class="img" style="width:52px;height:62px;border-radius:6px;flex:none">${pic(c)}</div><div style="flex:1;min-width:0"><div style="font-size:14.5px;font-weight:700">${c.name} ${c.size}</div><div class="meta">${CAT[c.cat]}${c.sub ? ' · ' + c.sub : ''} · ${c.src}</div></div><button data-a="regDel" data-x="${c.id}" style="color:var(--sub)" aria-label="빼기">${I.close}</button></div></div>`).join('')}
  <button data-a="regMore" style="width:100%;height:48px;border:1px dashed #C9C9C9;border-radius:10px;font-size:14px;font-weight:600;margin-bottom:20px">＋ 다른 옷 더 등록</button></div>` });
SCR.regDone = (pp) => ({ node: '④ 옷 등록 · 옷장에 담기 완료 → 어디서 시작했나?', body: `<div class="hdr"><span></span><button data-a="regExit">${I.close}</button></div>
  <div style="text-align:center;padding-top:70px"><div class="check">${I.check}</div><div style="font-size:23px;font-weight:800;letter-spacing:-.03em;margin-top:20px">옷장에 ${pp.n}벌 담았어요</div><div style="font-size:14px;color:var(--ink2);margin-top:8px;line-height:1.55;padding:0 28px;word-break:keep-all">${pp.baseMsg || '이제 상품마다 내 옷 기준 사이즈가 보여요'}</div></div>
  <div style="position:absolute;left:16px;right:16px;bottom:34px;display:grid;gap:8px">${S.reg && S.reg.from && S.reg.from.startsWith('p') ? `<button class="btn" data-a="regExit">보던 상품으로 돌아가기</button><button class="btn line" data-a="goTab" data-x="closet">내 옷장 보기</button>` : `<button class="btn" data-a="goTab" data-x="closet">내 옷장 보기</button><button class="btn line" data-a="goTab" data-x="home">홈으로</button>`}${slot('reg.done')}</div>` });

/* 마이 (H) */
SCR.my = () => {
  if (!S.user) return { node: '⑥ 마이 · 로그인? → 아니오 · 로그인 · 가입 버튼', navOn: 'my', body: `<div class="hdr"><span style="font-size:22px;font-weight:800;letter-spacing:-.03em">마이</span>${cartBtn()}</div>
    <div style="margin:10px 16px 0;border-radius:12px;background:var(--gray);padding:22px 18px"><div style="font-size:18px;font-weight:800;letter-spacing:-.02em">로그인하고 내 옷장 만들기</div><div style="font-size:13.5px;color:var(--ink2);margin-top:4px">가입하면 10% 쿠폰을 드려요</div><button class="btn" style="margin-top:16px;height:48px" data-a="myLogin">로그인 · 가입</button></div>
    <div class="list" style="margin-top:14px"><button class="li">고객센터${I.chev}</button><button class="li">공지사항${I.chev}</button></div>` };
  return { node: '⑥ 마이 · 주문 내역 · 쿠폰함 · 계정', navOn: 'my', body: `<div class="hdr"><span style="font-size:22px;font-weight:800;letter-spacing:-.03em">마이</span><span class="icons">${cartBtn()}</span></div>
    <div class="pad" style="padding-top:6px"><div style="font-size:21px;font-weight:800;letter-spacing:-.02em">${S.user.name}님</div><div style="font-size:13px;color:var(--sub);margin-top:2px">카카오 계정으로 로그인</div></div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);margin:18px 16px 0;border:1px solid var(--line);border-radius:10px">${[['closet', '내 옷장', S.closet.length + '벌'], ['coupons', '쿠폰', S.coupons.filter((c) => !c.used).length + '장'], ['orders', '주문', S.orders.length + '건']].map(([s, t, v], i) => `<button data-a="${s === 'closet' ? 'tab' : 'go'}" data-x="${s}" style="padding:14px 0;${i ? 'border-left:1px solid var(--line)' : ''}"><div style="font-size:12.5px;color:var(--sub)">${t}</div><div class="num" style="font-size:18px;font-weight:800;margin-top:2px">${v}</div></button>`).join('')}</div>
    <div class="list" style="margin-top:14px"><button class="li" data-a="go" data-x="orders">주문 내역 · 반품 · 교환${I.chev}</button><button class="li" data-a="go" data-x="coupons">쿠폰함${I.chev}</button><button class="li" data-a="go" data-x="notis">알림${I.chev}</button>${slot('my.menu')}<button class="li" data-a="logout">로그아웃${I.chev}</button><button class="li" data-a="go" data-x="leave" style="color:var(--sub)">탈퇴하기${I.chev}</button></div>` };
};
SCR.orders = () => ({ node: '⑥ 마이 · 주문 내역 → 반품 · 교환', body: `${hdrBack('주문 내역')}${S.orders.length ? S.orders.map((o) => { const c = S.closet.find((x) => x.id === o.cid), p = PB[o.pid]; return `<div style="padding:16px;border-bottom:8px solid var(--gray)"><div style="font-size:13px;color:var(--sub)">2026.10.11 주문</div><div style="font-weight:800;font-size:15px;margin-top:4px">${o.returned ? '반품 신청됨' : o.delivered ? '배송 완료' : '배송 중'}</div><div style="display:flex;gap:12px;margin-top:10px"><div class="img" style="width:60px;height:72px;border-radius:6px;flex:none"><img src="${IMG[p.img]}"></div><div style="min-width:0"><div class="nm">${p.name}</div><div style="font-size:13px;color:var(--sub)">사이즈 ${o.size}</div><div class="price" style="margin-top:4px">${won(sale(p))}원</div></div></div>
    ${o.delivered && c ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:12px"><button class="btn line" style="height:42px;font-size:13.5px" data-a="fitStart" data-x="${c.id}">${c.fit ? '핏 다시 알려 주기' : '핏 알려 주기'}</button><button class="btn line" style="height:42px;font-size:13.5px" data-a="returnStart" data-x="${c.id}">반품 · 교환</button></div>` : ''}</div>` }).join('') : `<div class="empty"><div class="big">${I.box}</div><h4>주문 내역이 없어요</h4></div>`}` });
SCR.coupons = () => ({ node: '⑥ 마이 · 쿠폰함', body: `${hdrBack('쿠폰함')}<div class="pad" style="padding-top:8px">${S.coupons.length ? S.coupons.map((c) => `<div style="display:flex;border:1px solid ${c.used ? '#EEE' : '#DADADA'};border-radius:10px;margin-bottom:10px;overflow:hidden;${c.used ? 'opacity:.5' : ''}"><div style="width:84px;background:var(--fitw);color:var(--fit);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800">10%</div><div style="padding:14px"><div style="font-weight:700">${c.t}</div><div style="font-size:12.5px;color:var(--sub);margin-top:3px">${c.used ? '사용 완료' : c.d}</div></div></div>`).join('') : '<div class="empty"><div class="big">' + I.coupon + '</div><h4>받은 쿠폰이 없어요</h4></div>'}</div>` });
SCR.notis = () => { S.notis.forEach((n) => n.read = true); return { node: '알림 목록', body: `${hdrBack('알림')}${S.notis.length ? S.notis.map((n) => `<button class="li" style="height:auto;padding:14px 16px;align-items:flex-start;gap:12px" data-a="fitStart" data-x="${n.cid}"><div style="flex:1"><div style="font-size:14.5px;font-weight:700">${n.t}</div><div style="font-size:13px;color:var(--ink2);margin-top:2px">${n.b}</div><div class="meta">방금</div></div></button>`).join('') : `<div class="empty"><div class="big">${I.bell}</div><h4>새 알림이 없어요</h4></div>`}` } };
SCR.leave = () => ({ node: '⑥ 마이 · 탈퇴 확인 → 계정 · 옷장 데이터 삭제', bar: `<button class="btn" style="background:var(--sale)" data-a="leaveGo">탈퇴하기</button>`, body: `${hdrBack('탈퇴하기')}<div class="h1" style="padding-top:8px">정말 탈퇴할까요?</div><div class="p">탈퇴하면 아래 정보가 모두 지워지고 되돌릴 수 없어요</div><div class="pad" style="margin-top:16px;font-size:14.5px;line-height:2.1"><div>· 내 옷장 ${S.closet.length}벌과 치수 정보</div><div>· 기준 옷과 핏 기록</div><div>· 쿠폰 ${S.coupons.length}장</div></div>` });
SCR.terms = (pp) => { const t = pp.t || {}; const req = t.a && t.b; return { node: '⑦ 로그인 게이트 · 약관 · 개인정보 동의 (옷 치수는 선택)', bar: `<button class="btn" ${req ? '' : 'disabled'} data-a="termsOk">동의하고 시작하기</button>`, body: `${hdrBack('약관 동의')}<div class="h1" style="padding-top:8px">DANGJANG 시작하기</div><div class="p">서비스 이용을 위해 동의가 필요해요</div>
  <div class="pad" style="margin-top:22px"><button class="row" style="width:100%;font-weight:800;font-size:16px;border-bottom:1px solid var(--line)" data-a="term" data-x="all"><span style="display:flex;gap:10px;align-items:center"><span class="chk ${t.a && t.b && t.c && t.d ? 'on' : ''}">${t.a && t.b && t.c && t.d ? '✓' : ''}</span>전체 동의</span></button>
  ${[['a', '[필수] 서비스 이용약관'], ['b', '[필수] 개인정보 수집 · 이용'], ['c', '[선택] 옷 치수 정보 수집 · 이용'], ['d', '[선택] 혜택 · 이벤트 알림']].map(([k, l]) => `<button class="row" style="width:100%;font-size:14.5px" data-a="term" data-x="${k}"><span style="display:flex;gap:10px;align-items:center"><span class="chk ${t[k] ? 'on' : ''}">${t[k] ? '✓' : ''}</span>${l}</span><span style="color:var(--sub);font-size:12.5px">보기</span></button>`).join('')}
  ${!req ? '<div style="font-size:12.5px;color:var(--sale);margin-top:10px">필수 항목에 모두 동의해야 시작할 수 있어요</div>' : ''}</div>` } };
SCR.joined = () => ({ node: '⑦ 로그인 게이트 · 가입 완료 → 비회원 때 담은 것 합치기', body: `<div style="text-align:center;padding-top:150px"><div class="check">${I.check}</div><div style="font-size:23px;font-weight:800;letter-spacing:-.03em;margin-top:20px">가입이 끝났어요</div><div style="font-size:14px;color:var(--ink2);margin-top:8px;line-height:1.55">신규 가입 10% 쿠폰을 넣어 드렸어요${S.cart.length ? `<br>비회원 때 담은 장바구니 ${S.cart.length}개도 합쳤어요` : ''}</div></div>
  <div style="position:absolute;left:16px;right:16px;bottom:34px"><button class="btn" data-a="joinedGo">하려던 것 이어서 하기</button></div>` });

/* ── 렌더 ── */
const app = document.getElementById('app');
app.innerHTML = '<div id="view" style="position:absolute;inset:0"></div><div id="mod" style="position:absolute;inset:0;z-index:90;background:#fff;display:none;overflow:hidden"></div>';
const view = document.getElementById('view');
function render(fresh) {
  if (S.closet) ensureBases();
  const c = cur();
  let r = SCR[c.s](c.p || {});
  S.node = r.node;
  const white = r.white;
  let h = sbar(white);
  h += `<div class="body ${r.full ? 'full' : ''} ${r.navOn ? 'hasnav' : ''} ${r.bar ? 'hasbar' : ''}">${r.body}</div>`;
  if (r.fab) h += r.fab;
  if (r.bar) h += `<div class="bar">${r.bar}</div>`;
  if (r.navOn) h += navBar(r.navOn);
  if (S.push) h += `<button class="push" data-a="pushOpen">${'<span class="ai">DANGJANG</span>'}<span style="flex:1;min-width:0"><span style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-tertiary)"><b style="color:var(--ink)">DANGJANG</b>지금</span><span style="display:block;font-size:14px;font-weight:700;margin-top:2px">${S.push.t}</span><span style="display:block;font-size:13px;color:var(--text-secondary)">${S.push.b}</span></span></button>`;
  if (S.ov) { const st = S.ov.shown ? ' still' : ''; h += `<div class="dim${st}" data-a="${S.ov.lock ? 'noop' : 'closeOv'}"></div><div class="${S.ov.k}${st}">${S.ov.html}</div>`; }
  if (S.toast) h += `<div class="toast">${S.toast}</div>`;
  h += `<div class="hi ${white ? 'w' : ''}"></div>`;
  const b0 = view.querySelector('.body'); if (!fresh && b0 && render.last === c) c.y = b0.scrollTop; render.last = c;
  const y = fresh ? 0 : (c.y || 0);
  view.innerHTML = h; if (S.ov) S.ov.shown = true;
  const b = view.querySelector('.body'); if (b) b.scrollTop = y; view.classList.toggle('scrolled', y > 120);
  document.getElementById('now').innerHTML = (S.ov && S.ov.node ? S.ov.node : S.node).replace(' · ', '<small>') + '</small>';
  document.getElementById('nowShort').textContent = (S.ov && S.ov.node ? S.ov.node : S.node).split(' · ')[0];
  document.querySelectorAll('#presets button').forEach((x) => x.classList.toggle('on', x.dataset.d === 'p:' + S.preset));
  const fb = document.getElementById('failBtn'); if (fb) fb.classList.toggle('on', S.failNext);
  setTimeout(bindRacks);
  DJ.after(); // 신기능 (features.js)
}

/* ── 동작 ── */
let rackCard = false; // 데모 패널 비교용: true면 옷마다 흰 카드
function RK(d) { // 시안: 가운데 150×180, 옆 120×144(0.8), 끝 100×120(0.667), 기울임 없음
  const a = Math.abs(d), s = Math.sign(d), seg = [0, 96, 155, 200, 230], i = Math.min(Math.floor(a), 3), f = Math.min(a, 4) - i;
  const x = s * (seg[i] + (seg[i + 1] - seg[i]) * f), sc = a >= 2 ? .667 : a >= 1 ? .8 - (a - 1) * .133 : 1 - a * .2;
  return { x, t: `translateX(${x.toFixed(1)}px) scale(${sc.toFixed(3)})`, z: 100 - Math.round(a * 10), o: a > 2.5 ? Math.max(0, 1 - (a - 2.5) * 2) : 1, d: (Math.min(a, 1) * .06).toFixed(3) };
}
const withWa = (w) => { const k = w.charCodeAt(w.length - 1) - 0xAC00; return w + (k >= 0 && k < 11172 && k % 28 ? '과' : '와') };
const rkAct = (c, sv) => !c || c.fit !== 'good' ? '' : sv ? (c.subBase ? `<span class="now">${I.check}${sv} 기준</span>` : `<button data-a="setSubBase" data-x="${c.id}">${sv} 기준으로 정하기${I.chev}</button>`)
  : c.base ? `<span class="now">${I.check}${GN(c)} 기준</span>` : `<button data-a="setBase" data-x="${c.id}">${GN(c)} 기준으로 정하기${I.chev}</button>`;
const CHK = (on) => on ? '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0ZM13.7305 7.46973C13.4377 7.17692 12.9628 7.17708 12.6699 7.46973L8.7998 11.3389L7.33008 9.86914C7.03729 9.57652 6.5624 9.57665 6.26953 9.86914C5.97669 10.162 5.97679 10.6368 6.26953 10.9297L8.26953 12.9307C8.2878 12.9489 8.30658 12.9665 8.32617 12.9824C8.38501 13.0303 8.44997 13.0673 8.51758 13.0947C8.69816 13.1679 8.90148 13.168 9.08203 13.0947C9.14961 13.0673 9.21463 13.0304 9.27344 12.9824C9.29302 12.9664 9.31182 12.9489 9.33008 12.9307L13.7305 8.53027C14.023 8.2375 14.0229 7.76257 13.7305 7.46973Z" fill="#06BC51"/></svg>'
  : '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M19.5 10C19.5 15.2467 15.2467 19.5 10 19.5C4.75329 19.5 0.5 15.2467 0.5 10C0.5 4.75329 4.75329 0.5 10 0.5C15.2467 0.5 19.5 4.75329 19.5 10Z" fill="white" stroke="#E1E1E1"/></svg>';
const cutPic = (c) => c.img ? `<img src="${CUT[c.img] || IMG[c.img]}" alt="">` : tplSvg(c);
// 사진 없는 옷: 세부 종류별 면 그래픽 (둥근 실루엣 + 한 가지 색, 디테일은 같은 색을 어둡게)
const TB = { // 몸판 실루엣 (긴팔 · 반팔 · 아우터 · 긴 아우터)
  l: 'M39 20Q50 25 61 20L75 23Q83 38 88 60L78 64L69 44V82H31V44L22 64L12 60Q17 38 25 23Z',
  s: 'M39 22Q50 27 61 22L75 25L86 40L76 47L69 40V80H31V40L24 47L14 40L25 25Z',
  o: 'M39 18Q50 23 61 18L76 21Q84 38 89 62L78 66L70 44V84H30V44L22 66L11 62Q16 38 24 21Z',
  ol: 'M39 12Q50 17 61 12L74 15Q81 32 86 56L76 60L69 38V92H31V38L24 60L14 56Q19 32 26 15Z',
};
const dot = (x, ys) => ys.map((y) => `<circle cx="${x}" cy="${y}" r="1.8"/>`).join('');
// [색, 실루엣 path들, 디테일 선, 디테일 점]
const TPL_ICON = {
  'tee-l': [TB.l, 'M42 22Q50 28 58 22'],
  'shirt-l': [TB.l, 'M39 20L44 30L50 24L56 30L61 20M50 24V82', dot(50, [40, 54, 68])],
  'tee-s': [TB.s, 'M42 24Q50 30 58 24'],
  'shirt-s': [TB.s, 'M39 22L44 32L50 26L56 32L61 22M50 26V80', dot(50, [42, 55, 68])],
  hoodie: [TB.l + 'M35 24Q34 8 50 8Q66 8 65 24Q58 30 50 30Q42 30 35 24Z', 'M43 21Q50 26 57 21M38 70L41 61H59L62 70'],
  cardigan: [TB.o, 'M39 18L50 46L61 18M50 46V84', dot(50, [54, 64, 74])],
  jacket: [TB.o + 'M39 21V12H61V21Z', 'M50 12V84M30 77H70'],
  'coat-s': [TB.o, 'M39 18L35 28L41 30L50 50M61 18L65 28L59 30L50 50M50 50V84', dot(54, [58, 70])],
  'coat-l': [TB.ol, 'M39 12L35 22L41 24L50 46M61 12L65 22L59 24L50 46M50 46V92', dot(54, [54, 66, 78])],
  'pad-s': ['M37 18V10H63V18L78 22Q87 40 91 64L79 69L71 46V84H29V46L21 69L9 64Q13 40 22 22Z', 'M50 10V84M29 34H71M29 50H71M29 66H71M15 46L24 44M85 46L76 44'],
  'pad-l': ['M37 10V4H63V10L76 14Q84 32 88 56L77 60L70 36V94H30V36L23 60L12 56Q16 32 24 14Z', 'M50 4V94M30 26H70M30 42H70M30 58H70M30 74H70'],
  'pants-l': ['M30 10H70V18L78 90H58L50 42L42 90H22L30 18Z', 'M30 18H70M50 18V34'],
  'pants-s': ['M30 24H70V32L80 72H58L50 50L42 72H20L30 32Z', 'M30 32H70M50 32V46'],
  'skirt-l': ['M34 10H66V18L78 92H22L34 18Z', 'M34 18H66M44 18L40 92M56 18L60 92'],
  'skirt-s': ['M33 26H67V34L78 74H22L33 34Z', 'M33 34H67M44 34L41 74M56 34L59 74'],
};
// 상품명에 색 이름이 있으면 그 색, 없으면 기본 #979797 (앞에 있는 규칙이 먼저)
const NAME_COL = [[/스카이\s*블루|sky\s*blue|라이트\s*블루|light\s*blue/i, '#A9CBEA'], [/차콜|charcoal|건메탈|gunmetal/i, '#4A4A4D'], [/블랙|black|흑청/i, '#2B2B2B'],
  [/화이트|white|아이보리|ivory|크림|cream|오프\s*화이트/i, '#E6E3DC'], [/네이비|navy|인디고|indigo/i, '#2E3A5C'], [/그레이|grey|gray|회색|멜란지|melange/i, '#9A9CA0'],
  [/버건디|burgundy|와인|wine/i, '#7C1A2B'], [/레드|red(?!uce)|빨강/i, '#D9261C'], [/핑크|pink/i, '#EDB3C3'], [/브라운|brown|초콜릿|chocolate|반다이크|tobacco|타바코|모카/i, '#7A5236'],
  [/베이지|beige|오트밀|oatmeal|카멜|camel|샌드|sand|토프|taupe|탄\b/i, '#D3BF9C'], [/카키|khaki|올리브|olive|mud|머드/i, '#7C7A4C'], [/그린|green|forest|포레스트|틸|teal/i, '#3F7A5A'],
  [/블루|blue|데님|denim/i, '#5B83B8'], [/옐로우|yellow|머스타드|mustard|버터/i, '#E8C860'], [/퍼플|purple|라벤더|lavender|바이올렛/i, '#B9A3E3']];
const nameCol = (c) => (NAME_COL.find(([r]) => r.test(c.name || '')) || [])[1] || '#979797';
function tplSvg(c) {
  const [sil, det = '', dots = ''] = TPL_ICON[subOf(c)] || TPL_ICON['tee-l'], col = nameCol(c);
  const dark = parseInt(col.slice(1, 3), 16) * .3 + parseInt(col.slice(3, 5), 16) * .59 + parseInt(col.slice(5, 7), 16) * .11 < 110, ink = dark ? '#fff' : '#000', op = dark ? .28 : .16;
  return `<svg class="tpl" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="${sil}" fill="${col}" stroke="${col}" stroke-width="5" stroke-linejoin="round"/><g fill="none" stroke="${ink}" stroke-opacity="${op}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="${det}"/></g><g fill="${ink}" fill-opacity="${op + .04}">${dots}</g></svg>`;
}
let dragEnd = 0;
function bindRacks() {
  lazyBind();
  app.querySelectorAll('.rkbox').forEach((box) => {
    const k = box.dataset.rack, n = +box.dataset.n, els = [...box.querySelectorAll('[data-i]')], cards = els.filter((e) => e.classList.contains('rk'));
    const capB = box.querySelector('.rkcap b'), capS = box.querySelector('.rkcap span'), capA = box.querySelector('.rkact');
    let pos = +box.dataset.c, x0 = null, p0 = pos, trail = [], moved = false;
    const place = (p, anim) => {
      for (const el of els) { const L = RK(+el.dataset.i - p); el.style.transition = anim ? '' : 'none'; el.style.opacity = L.o;
        if (el.classList.contains('rk')) { el.style.transform = L.t; el.style.zIndex = L.z; el.style.setProperty('--dm', L.d) } else { el.style.transform = `translateX(${L.x}px)`; el.style.zIndex = L.z + 1 } }
      const ci = cards[Math.max(0, Math.min(n - 1, Math.round(p)))]; if (capB.textContent !== ci.dataset.cn) { capB.textContent = ci.dataset.cn; capS.innerHTML = ci.dataset.cs; capA.innerHTML = rkAct(S.closet.find((q) => q.id === ci.dataset.id), box.dataset.s) }
    };
    const settle = (t) => { pos = t; S.rack[k] = t; place(t, true); clearTimeout(box.h); box.h = setTimeout(() => { saveY(); render() }, 340) };
    box.rackTo = settle;
    box.onpointerdown = (e) => { x0 = e.clientX; p0 = pos; trail = [[e.clientX, e.timeStamp]]; moved = false };
    box.onpointermove = (e) => {
      if (x0 == null) return; const dx = e.clientX - x0;
      if (!moved && Math.abs(dx) > 6) { moved = true; clearTimeout(box.h); box.setPointerCapture(e.pointerId) }
      if (!moved) return; pos = Math.max(-.4, Math.min(n - .6, p0 - dx / 86)); trail.push([e.clientX, e.timeStamp]); if (trail.length > 5) trail.shift(); place(pos, false);
    };
    const end = () => {
      if (x0 == null) return; x0 = null; if (!moved) return; dragEnd = Date.now();
      const a = trail[0], b = trail[trail.length - 1], v = (b[0] - a[0]) / Math.max(1, b[1] - a[1]); // px/ms, 빠르게 밀면 더 넘어감
      settle(Math.max(0, Math.min(n - 1, Math.round(pos - Math.max(-2, Math.min(2, v * 1.5))))));
    };
    box.onpointerup = end; box.onpointercancel = end;
  });
}

/* ── 동작 ── */
function homePopupCheck() {
  if (cur().s === 'home' && !S.popupSeen && !['top', 'bottom', 'outer'].some((c) => baseOf(c)) && !S.ov) {
    S.popupSeen = true;
    S.ov = { k: 'sheet hpop', pop: true, node: '① 홈 · 기준 옷 없음 · 오늘 팝업을 봤나? → 아니오 · 옷장 유도 팝업', html: `<div class="grab"></div>
      <h3>옷 등록하고 10% 쿠폰받자!</h3><p>등록한 옷 기준으로 상품마다 맞는 사이즈를 알려 드려요</p>
      <div class="hcpn"><span>옷장 첫 등록 기념<br>첫구매 할인 쿠폰 발급</span><b>10<small>%</small></b></div>
      <button data-a="popGo" class="btn fb">옷장 등록하기${I.chev}</button>
      <button class="hskip" data-a="popToday">오늘 하루 보지 않기</button>` };
  }
}
/* 가로로 민 메뉴 위치는 다시 그려도 그대로 둬요 */
function keepX(sel, f) { const el = app.querySelector(sel); const x = el ? el.scrollLeft : 0; f(); const n = app.querySelector(sel); if (n) n.scrollLeft = x }
function startReg(cat, from) {
  need('옷장은 로그인하면 쓸 수 있어요', () => {
    S.reg = { cat: cat || null, from: from || 'closet', m: null };
    go('regType');
  });
}
function finishLoading(next, t, node, ms = 900) { go('loading', { t, node }); setTimeout(() => { nav.pop(); next() }, ms) }
function buyFlow(items, mode) {
  if (mode === 'cart') { items.forEach((it) => S.cart.push(it)); toast(`장바구니에 담았어요 · ${items.reduce((a, it) => a + it.qty, 0)}개`); render(); return }
  need('로그인하면 주문하고, 산 옷이 옷장에 담겨요', () => { closeOv(); go('order', { items: items.map((it) => ({ ...it, rec: judge(PB[it.pid]).rec === it.size })) }) });
}
function sizeSheet(pid, mode) {
  const p = PB[pid], j = judge(p), keys = sizeKeys(p);
  S.selSize = S.selSize && S.selSize.pid === pid ? S.selSize : { pid, k: j.n === 5 ? j.rec : null };
  const k = S.selSize.k, out = k && p.out.includes(k);
  sheet(`<div class="grab"></div><div style="font-size:17px;font-weight:800">사이즈 선택</div>${j.n === 5 ? `<div style="font-size:13px;color:var(--fit);font-weight:700;margin-top:4px">내 ${j.base.name} ${j.base.size} 기준 ${j.rec} 추천</div>` : '<div style="font-size:13px;color:var(--sub);margin-top:4px">사이즈를 골라 주세요</div>'}
    <div class="szs" style="margin-top:14px">${keys.map((x) => `<button class="sz ${j.n === 5 && x === j.rec ? 'rec' : ''} ${x === k ? 'on' : ''} ${p.out.includes(x) ? 'out' : ''}" data-a="sheetSize" data-x="${pid}|${x}|${mode}"><b>${x}</b><span>${p.out.includes(x) ? '품절' : j.n === 5 && x === j.rec ? '추천' : ''}</span></button>`).join('')}</div>
    ${out ? `<div style="margin-top:14px;font-size:13.5px;color:var(--ink2)">${k} 사이즈는 품절이에요</div><button class="btn line" style="margin-top:10px" data-a="restock" data-x="${k}">재입고 알림 신청</button>` : `<button class="btn" style="margin-top:16px" ${k ? '' : 'disabled'} data-a="sheetGo" data-x="${pid}|${mode}">${mode === 'cart' ? '장바구니 담기' : '구매하기'}</button>`}`);
  S.ov.node = out ? '② 상품 상세 · 그 사이즈 재고 있나? → 아니오 · 품절 안내' : k ? '② 상품 상세 · 사이즈 골랐나? → 예 · 재고 확인' : '② 상품 상세 · 사이즈 골랐나? → 아니오 · 사이즈 영역';
  render();
}
function syncEdit() {
  const d = cur().p.d, n = document.getElementById('ename'); if (n) d.name = n.value;
  d.m = partsOf(d).map((_, i) => { const el = document.getElementById('m' + i); return el ? el.value : d.m[i] });
  return d;
}
function compareSheet(c, old, ok, title, who) {
  const parts = partsOf(c);
  sheet(`<div class="grab"></div><div class="csh-t">${title}</div><div class="csh-d">${who} 상품 추천 사이즈를 이 옷 기준으로 재계산</div>
    <div class="csh-box"><span><small>현재 기준 옷</small><b>${old.name}</b></span>${I.chev}<span><small class="g">바꿀 옷</small><b>${c.name}</b></span></div>
    <div class="csh-tbl"><div class="h"><span>부위</span><span>지금 기준 ${old.size}</span><span>바뀔 기준 ${c.size}</span><span>차이</span></div>${parts.map((x, i) => { if (!c.m[i] || !old.m[i]) return ''; const dv = +(c.m[i] - old.m[i]).toFixed(1); return `<div><span>${LONG[x]}</span><span>${old.m[i]}</span><span>${c.m[i]}</span><span class="${dv === 0 ? '' : 'g'}">${dv === 0 ? '같음' : fmtD(dv)}</span></div>` }).join('')}</div>
    <div class="mb" style="margin-top:20px"><button class="btn line" data-a="closeOv">취소</button><button class="btn" data-a="${ok}" data-x="${c.id}">변경</button></div>`);
}
function setImg(id, ctx, key) { (ctx === 'edit' ? cur().p.d : S.closet.find((q) => q.id === id)).img = key; closeOv(); toast(ctx === 'edit' ? '사진을 골랐어요 · 저장하면 반영돼요' : '사진을 넣었어요'); render() }
function photoGo(x) {
  const [id, ctx, k] = x.split('|'), cat = ctx === 'edit' ? cur().p.d.cat : S.closet.find((q) => q.id === id).cat;
  if (k === 'cam') { setImg(id, ctx, CM[cat].demo.cam[0]); return }
  sheet(`<div class="grab"></div><div style="font-size:18px;font-weight:800">사진 고르기</div><div style="font-size:12.5px;color:var(--sub);margin-top:4px">시연용 사진첩</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:12px">${Object.keys(IMG).map((key) => `<button data-a="photoPick" data-x="${id}|${ctx}|${key}" class="img" style="aspect-ratio:1;border-radius:4px"><img src="${IMG[key]}"></button>`).join('')}</div>`);
  S.ov.node = '⑤ 사진 추가 · 사진첩에서 고르기'; render();
}
const ALIAS = [['총장', ['총기장', '전체길이', '총장', '기장', '길이']], ['어깨', ['어깨너비', '어깨넓이', '어깨단면', '어깨']], ['가슴', ['가슴단면', '가슴너비', '가슴둘레', '가슴', '품']], ['소매', ['소매길이', '소매기장', '팔길이', '소매']], ['허리', ['허리단면', '허리둘레', '허리']], ['밑위', ['앞밑위', '밑위']], ['허벅지', ['허벅지단면', '허벅지너비', '허벅지']], ['인심', ['인심길이', '안쪽기장', '인심']], ['엉덩이', ['엉덩이단면', '엉덩이', '힙']], ['밑단', ['밑단단면', '밑단너비', '밑단']]];
const SIZE_RE = /^(XXS|XS|S|M|L|XL|XXL|2XL|3XL|4XL|FREE|F|\d{2,3}|[0-9]?X?L)$/i;
function partsIn(line) { // 줄 안의 부위 이름을 왼쪽부터 순서대로
  const t = line.replace(/\s+/g, ''), out = []; let i = 0;
  while (i < t.length) { let hit = null; for (const [key, al] of ALIAS) for (const w of al) if (t.startsWith(w, i) && (!hit || w.length > hit[1].length)) hit = [key, w]; if (hit) { out.push([hit[0], /둘레/.test(hit[1])]); i += hit[1].length; } else i++; }
  return out;
}
function parseSizeTable(text) {
  const lines = text.replace(/\r/g, '').split('\n').map((l) => l.replace(/cm|CM|\(|\)|\||,|\/|:/g, ' ').trim()).filter(Boolean);
  const out = {};
  for (let li = 0; li < lines.length; li++) {
    const hp = partsIn(lines[li]);
    if (hp.length >= 2) { // 가로: 부위가 열
      for (let j = li + 1; j < lines.length; j++) {
        const tk = lines[j].split(/\s+/); if (!SIZE_RE.test(tk[0])) { if (partsIn(lines[j]).length >= 2) break; continue; }
        const nums = tk.slice(1).map(parseFloat).filter((v) => !isNaN(v));
        if (nums.length < hp.length) continue;
        const row = {}; hp.forEach(([k, circ], c) => { row[k] = circ ? Math.round(nums[c] / 2 * 10) / 10 : nums[c]; }); out[tk[0].toUpperCase()] = row;
      }
      if (Object.keys(out).length) return out;
    }
    const tk = lines[li].split(/\s+/).filter((x) => x && !/^(사이즈|size|구분|단위)$/i.test(x));
    if (tk.length >= 2 && tk.every((x) => SIZE_RE.test(x)) && !tk.every((x) => /^\d+(\.\d+)?$/.test(x) && +x < 25)) { // 세로: 사이즈가 열
      const sizes = tk.map((x) => x.toUpperCase());
      for (let j = li + 1; j < lines.length; j++) {
        const p2 = partsIn(lines[j].replace(/[\d.]+/g, ' ')); if (!p2.length) continue;
        const nums = (lines[j].match(/\d+(\.\d+)?/g) || []).map(parseFloat); if (nums.length < sizes.length) continue;
        sizes.forEach((sz, c) => { out[sz] = out[sz] || {}; out[sz][p2[0][0]] = p2[0][1] ? Math.round(nums[c] / 2 * 10) / 10 : nums[c]; });
      }
      if (Object.keys(out).length) return out;
    }
  }
  return out;
}
function pasteSheet() {
  sheet(`<div class="grab"></div><div style="font-size:19px;font-weight:800;letter-spacing:-.02em">사이즈표 붙여넣기</div><div style="font-size:13.5px;color:var(--ink2);margin-top:4px">상품 페이지의 사이즈표를 길게 눌러 복사한 뒤 아래에 붙여 넣어 주세요</div>
    <textarea id="stxt" style="width:100%;height:150px;margin-top:12px;border:1px solid var(--line);border-radius:8px;padding:10px;font:inherit;font-size:14px;resize:none" placeholder="사이즈  총장  어깨너비  가슴단면  소매길이\nS  70  46  54  58\nM  72  48  56  59\nL  74  50  58  60"></textarea>
    <button data-a="stExample" style="font-size:12.5px;color:var(--fit);font-weight:700;margin-top:6px">예시 사이즈표 넣어 보기</button>
    <div id="stOut"></div><button class="btn" style="margin-top:12px" data-a="stParse">읽어서 채우기</button>`);
  S.ov.node = '④ 옷 등록 · 사이즈표 붙여넣기 → 자동으로 읽기'; render();
}
function srvCutImg() {
  const r = S.reg, src = r.img; if (!src || !/^\/api\/img/.test(src) || !window.NaranMeasure) return;
  const im = new Image(); im.onload = () => { try { const c = NaranMeasure.cutProduct(im); if (c.ok && !c.partial && S.reg === r && r.img === src) { r.img = c.canvas.toDataURL('image/png'); r.imgCut = true; render(); } } catch (e) {} }; im.src = src;
}
function regKeep() { const n = document.getElementById('rname'); if (!n) return; S.reg.name = n.value; S.reg.m = PARTS[S.reg.pk || S.reg.cat].map((_, i) => { const e = document.getElementById('m' + i); return e ? e.value : ''; }); }
function regFill() { // 고른 사이즈의 실측표 값 → 치수 칸
  const r = S.reg; if (!r.size || !r.tbl) return;
  const row = r.tbl(r.size); if (!row) return;
  r.m = PARTS[r.pk || r.cat].map((x, i) => row[i] != null && row[i] !== '' ? row[i] : (r.m && r.m[i]) || '');
  r.est = row.est || null; r.full = row.full || null; if (row.extra && Object.keys(row.extra).length) r.extra = row.extra;
}
function toMeasure(o) { // 링크 · 캡처에서 찾은 정보로 바로 '치수 확인' (중간 화면 없음)
  Object.assign(S.reg, { m: null, extra: null, base: false, est: null, tbl: null, info: null, sub: null, subUser: false, subWhy: false, hood: false, srv: null, mcat: null, mcatName: null, pk: null, full: null }, o);
  const r = S.reg, c0 = r.cat; r.pk = r.cat; subAuto(r, true);
  if (r.cat !== c0 && r.srv) { r.pk = pkOf(r.cat, r.sub); r.tbl = srvTbl(r.srv, r.pk); }
  if (!r.size && r.sizeList && r.sizeList.length === 1) r.size = r.sizeList[0];
  regFill(); subAuto(r, false);
  nav = nav.filter((e) => !['loading', 'regLinkS', 'regLinkP', 'regLinkO'].includes(e.s));
  go('regMeasure');
}
function srvTbl(r, pk) { return r.table ? (k) => { if (!r.table[k]) return null; const row = srvRow(r.table[k], pk === 'skirt' ? 'bottom' : pk), P = PARTS[pk], a = P.map((x) => row[x] != null ? row[x] : ''); a.est = row._est || null; a.full = row._full || null; a.extra = Object.fromEntries(Object.entries(row).filter(([x, v]) => !x.startsWith('_') && !P.includes(x) && v != null)); return a; } : null; }
function regImg(inp) { // 치수 확인 화면: 옷장에 넣을 사진을 내가 고르기
  const f = inp.files && inp.files[0]; if (!f) return; regKeep(); const im = new Image(), u = URL.createObjectURL(f);
  im.onload = () => { const k = Math.min(1, 1000 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); S.reg.img = c.toDataURL('image/jpeg', 0.88); S.reg.own = true; render(); };
  im.onerror = () => URL.revokeObjectURL(u); im.src = u;
}
function pendingAdded(it) { // 묻지 않고 바로 옷장에 등록 (핏 확인 · 더 등록 단계 없음)
  it.fit = it.fit || 'good'; S.pending = [it];
  nav = nav.filter((e) => !e.s.startsWith('reg') && !['loading', 'permDenied'].includes(e.s));
  A.regSave();
}
function saveFit(c, good) {
  if (!good) { S.closet = S.closet.filter((q) => q !== c); if (!c.base) return '안 맞는 옷은 옷장에서 뺐어요'; ensureBases(); const nx = baseOf(c); return `안 맞는 옷은 옷장에서 뺐어요 · ${nx ? `기준 옷은 ${nx.name} ${nx.size}이 이어받았어요` : `잘 맞는 ${GN(c)}가 없어서 기준 옷이 없어졌어요`}` }
  c.fit = 'good'; c.delivered = false;
  if (!baseOf(c)) { c.base = true; return `${GN(c)} 기준 옷으로 정했어요 · 옷 상세 정보에서 바꿀 수 있어요` }
  return '잘 맞는 옷으로 저장했어요';
}
function optSheet(patch) {
  const o = S.ov, p = PB[o.pid], j = judge(p), base = j.n === 5 && !cur().p.nob ? j.base : null;
  const dd = (key, label, rows) => `<div class="pd-dd ${o.open === key ? 'open' : ''}"><button class="hd" data-a="optOpen" data-x="${key}" aria-expanded="${o.open === key}"><span>${key === 'color' && o.color ? o.color:label}</span>${I.down}</button>${o.open === key ? `<ul>${rows}</ul>` : ''}</div>`;
  const colors = (p.colors || ['단일 색상']).map((c) => `<li><button data-a="optColor" data-x="${c}"><b>${c}</b></button></li>`).join('');
  const sizes = sizeKeys(p).map((k) => { const out = p.out.includes(k), w = !out && base && p.sizes ? fitWord(p, base, k) : '';
    return `<li><button data-a="optSize" data-x="${k}" ${out ? 'disabled' : ''}><b>${k}</b>${out ? '<span>품절</span>' : w ? `<span>${w}</span>` : ''}${!out && base && k === j.rec ? '<em class="rec">추천</em>' : ''}</button></li>`; }).join('');
  const n = o.items.reduce((a, it) => a + it.qty, 0);
  o.html = `<button class="pd-grab" aria-label="닫기"></button><h3>옵션 선택</h3>
    <div class="pd-opts">${dd('color', '컬러', colors)}${dd('size', '사이즈', sizes)}
    ${o.items.length ? `<div class="pd-items">${o.items.map((it, i) => `<div class="pd-item"><b>${it.color} / ${it.size}</b><button class="x hit" data-a="optDel" data-x="${i}" aria-label="${it.color} ${it.size} 빼기">${I.close}</button>
      <div class="pd-qty"><button class="hit" data-a="optQty" data-x="${i}|-1" aria-label="수량 줄이기" ${it.qty <= 1 ? 'disabled' : ''}>${I.minus}</button><span class="num">${it.qty}</span><button class="hit" data-a="optQty" data-x="${i}|1" aria-label="수량 늘리기">${I.plus}</button></div><span class="pr num">${won(sale(p) * it.qty)}원</span></div>`).join('')}</div>` : ''}</div>
    <div class="pd-sf">${n ? `<div class="pd-total num"><span>총 ${n}개</span><span>${won(sale(p) * n)}원</span></div>` : ''}<div class="pd-two"><button class="btn pd-cta line" data-a="optGo" data-x="cart">장바구니</button><button class="btn pd-cta" data-a="optGo" data-x="buy">구매하기</button></div></div>`;
  if (patch) { const sh = app.querySelector('.sheet'); if (sh) { sh.innerHTML = o.html; const od = sh.querySelector('.pd-dd.open'); if (od) od.scrollIntoView({ block: 'nearest' }); } }
}
function baseSheet(p, sel) {
  const cat = p.cat, list = famOf(p), i = list.findIndex((c) => c.id === sel), swap = !!baseFor(p);
  sheet(`<button class="pd-grab" aria-label="닫기"></button><h3>${GROUP_N[grpOf(p)]} 기준 옷 ${swap ? '교체' : '선택'}</h3><div class="pd-bl">${list.map((c, k) => `<button class="pd-bi ${k === i ? 'on' : ''} ${k === i - 1 ? 'nb' : ''}" data-a="bpSel" data-x="${c.id}"><span class="pd-bimg">${cutPic(c)}</span><span class="pd-bw">${c.base ? '<em>기준</em>' : ''}<b>${c.name}</b><small>내 옷장 · ${CAT[cat]} · ${c.size} Size</small></span><span class="pd-rd"></span></button>`).join('')}</div>
    <div class="pd-sf fade"><button class="btn pd-cta" data-a="bpOk" ${sel ? '' : 'disabled'}>${swap ? '교체하기' : '선택'}</button></div>`);
  Object.assign(S.ov, { k: 'sheet pd-sheet', cat, pid: p.id, sel, node: '② 상품 상세 · 사이즈 영역 → 내 옷 목록에서 기준 옷 고르기' });
}
// 시트 손잡이: 눌러서 닫기, 아래로 80px 이상 끌면 닫기 (U-06)
document.addEventListener('pointerdown', (e) => {
  const g = e.target.closest && e.target.closest('.pd-grab'); if (!g) return;
  const sh = g.closest('.sheet'), y0 = e.clientY; let dy = 0;
  const mv = (ev) => { dy = Math.max(0, ev.clientY - y0); sh.style.transition = 'none'; sh.style.transform = `translateY(${dy}px)`; };
  const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); sh.style.transition = ''; if (dy < 6 || dy > 80) { closeOv(); render(); } else sh.style.transform = ''; };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
});
document.addEventListener('click', (e) => { if (e.detail === 0 && e.target.closest && e.target.closest('.pd-grab')) { closeOv(); render(); } });
const A = {
  noop() {}, back, closeOv() { closeOv(); S.after = null; render() },
  splashGo() { replace('home'); homePopupCheck(); render() },
  tab(s) {
    if (s === 'closet' && !S.user) { tab('closet'); need('옷장은 로그인하면 쓸 수 있어요', () => { closeOv(); tab('closet') }); return }
    tab(s); if (s === 'home') { homePopupCheck(); render() }
  },
  goTab(x) { const [t, s] = x.split('|'); tab(t); if (s) go(s) },
  go(s) { closeOv(); if (s === 'popular') { tab('search'); return } go(s) }, // 홈 '인기 상품 · 전체 보기'는 카테고리로
  homeTab(x) { replace('home', { t: x }) },
  homeReg() { need('옷장은 로그인하면 쓸 수 있어요', () => { closeOv(); if (S.closet.length) tab('closet'); else startReg(null, 'home') }) },
  popToday() { closeOv(); toast('오늘은 다시 안 보여 드릴게요'); render() },
  popGo() { closeOv(); need('옷장은 로그인하면 쓸 수 있어요', () => { closeOv(); if (!S.closet.length) startReg(null, 'home'); else tab('closet') }) },
  cat(x) { replace('search', { c: x, q: (cur().p || {}).q }) },
  detail(id) { S.selSize = null; go('detail', { id }) },
  like(id) { need('로그인하면 좋아요를 모아 볼 수 있어요', () => { closeOv(); S.likes[id] = !S.likes[id]; toast(S.likes[id] ? '좋아요 목록에 담았어요' : '좋아요를 취소했어요'); render() }) },
  chip(id) { // 사이즈 영역 안내 카드의 링크
    const p = PB[id], j = judge(p);
    if (j.n === 1) need('로그인하면 가진 옷과 비교해 드려요', () => { closeOv(); toast('로그인했어요 · 사이즈를 처음부터 다시 판단해요'); render() });
    else if (j.n === 2 || j.n === 3) startReg(p.cat, id);
    else if (j.n === 4) A.dpick();
    else A.toSize();
  },
  toSize() { const b = app.querySelector('.body'), sec = document.getElementById('s_size'); if (b && sec) { b.scrollTo({ top: sec.offsetTop - 103, behavior: 'smooth' }); cur().p.tab = 'size'; setTimeout(() => { cur().y = b.scrollTop; document.querySelectorAll('.dtabs button').forEach((x) => x.classList.toggle('on', x.dataset.x === 'size')) }, 30) } },
  dtab(k) { const b = app.querySelector('.body'), sec = document.getElementById('s_' + k); cur().p.tab = k; document.querySelectorAll('.dtabs button').forEach((x) => x.classList.toggle('on', x.dataset.x === k)); if (b && sec) b.scrollTo({ top: sec.offsetTop - 103, behavior: 'smooth' }) },
  dsel(k) { saveY(); cur().p.sel = k; render() },
  dpick() { const p = PB[cur().p.id], b = baseFor(p); saveY(); baseSheet(p, b ? b.id : null); render() },
  noBase() { saveY(); Object.assign(cur().p, { nob: true, pick: false }); render() },
  pickBase(cid) {
    const c = S.closet.find((q) => q.id === cid);
    S.closet.forEach((q) => { if (q.cat === c.cat && grpOf(q) === grpOf(c)) q.base = false }); c.base = true; saveY(); Object.assign(cur().p, { nob: false, sel: null }); render(); toast(`${c.name} ${c.size}을 기준 옷으로 정했어요 · 실측 확인부터 다시 판단했어요`);
  },
  dbuy(mode) { const pp = cur().p; buyFlow(pp.id, pp.sel, mode) },
  restock(k) { toast(`${k} 사이즈 재입고되면 알려 드릴게요`); render() },
  cartDel(i) { S.cart.splice(+i, 1); render() },
  cartOrder() { need('로그인하면 주문하고, 산 옷이 옷장에 담겨요', () => { closeOv(); go('order', { items: S.cart.map((c) => ({ ...c })) }) }) },
  pay() {
    if (S.failNext) { S.failNext = false; finishLoading(() => go('payfail'), '결제하는 중', '③ 구매 · 결제 성공?', 1000); return }
    finishLoading(() => {
      const its = cur().p.items, cp = S.coupons.find((c) => !c.used); if (cp) cp.used = true;
      for (const it of its) {
        S.orders.unshift({ id: 'o' + (S.orders.length + 1), pid: it.pid, size: it.size, delivered: false, confirmed: false, cid: null });
        S.cart = S.cart.filter((x) => !(x.pid === it.pid && x.size === it.size));
      }
      nav = [{ s: 'home', p: {} }, { s: 'ordered', p: { items: its } }]; render(true);
      if (!S.notifAsked) {
        S.notifAsked = true;
        S.ov = { k: 'modal', lock: true, node: '③ 구매 · 알림 권한을 물어본 적 있나? → 아니오 · 권한 요청', html: `<h4>배송 오면 알려 드릴게요</h4><p>배송이 완료되면 입어 보고 구매 확정할 수 있게 알려 드려요. 알림을 켜 둘까요?</p><div class="mb"><button class="btn line" data-a="notif" data-x="0">나중에</button><button class="btn" data-a="notif" data-x="1">알림 받기</button></div>` };
        render();
      }
    }, '결제하는 중', '③ 구매 · 결제 진행', 1100);
  },
  notif(x) { S.notifOn = x === '1'; closeOv(); toast(S.notifOn ? '배송 오면 알림으로 알려 드릴게요' : '알림 대신 앱 안에서 알려 드릴게요'); render() },
  pushOpen() {
    const cid = S.push.cid; S.push = null;
    // 핏 알림으로 열림 → 로그인 살아 있나?
    need('로그인이 만료됐어요. 다시 로그인하면 이어서 해요', () => { closeOv(); go('fit', { id: cid }) });
  },
  fitStart(id) { closeOv(); go('fit', { id }) },
  fitAns(x) { const [id, k] = x.split('|'); const st = Object.assign({}, cur().p.st, { ans: k }); cur().p = { id, st }; render() },
  fitPart(x) { const [id, part, o] = x.split('|'); const st = Object.assign({}, cur().p.st); st.pv = Object.assign({}, st.pv, { [part]: o }); cur().p = { id, st }; render() },
  fitRet(x) { const [id, k] = x.split('|'); const st = Object.assign({}, cur().p.st, { ret: +k }); cur().p = { id, st }; render() },
  fitSave(id) {
    const c = S.closet.find((q) => q.id === id), st = cur().p.st || {};
    const msg = saveFit(c, st.ans === 'good');
    const o = S.orders.find((q) => q.cid === id); if (o) { o.fit = true; if (st.ret === 1) o.returned = true }
    tab('closet'); replace('closet', { t: c.cat }); toast(msg + (st.ret === 1 ? ' · 반품 신청 완료' : ''));
  },
  returnStart(id) { go('fit', { id, st: { ans: 'bad', ret: 1 } }) },
  closetTab(k) { replace('closet', { t: k }) },
  closetLogin() { need('옷장은 로그인하면 쓸 수 있어요', () => { closeOv(); tab('closet') }) },
  item(id) { go('item', { id }) },
  editItem(id) { go('edit', { id }) },
  editClear() { const i = document.getElementById('ename'); i.value = ''; i.focus() },
  editBase() { const d = syncEdit(), c = S.closet.find((q) => q.id === cur().p.id); if (c.base) { toast('다른 옷을 기준으로 정하면 바뀌어요'); return } d.base = !d.base; render() },
  edTool(x) { toast(x === 'paste' ? '시연에서는 옷 등록 › 캡처 · 링크에서 사이즈표를 읽어요' : '시연에서는 옷 등록 › 사진 촬영에서 측정해요') },
  saveEdit(id) {
    const c = S.closet.find((q) => q.id === id), d = syncEdit(), m = d.m.map((v) => +v || 0);
    if (!d.size) { toast('사이즈를 골라 주세요'); render(); return }
    const miss = NEED[pkOf(d.cat, d.sub)].filter((k) => !m[partsOf(d).indexOf(k)]); if (miss.length) { toast(`${miss.map((k) => LONG[k] || k).join(', ')}은 꼭 적어 주세요`); render(); return }
    if (m.some((v) => v && (v < 5 || v > 200))) { toast('치수가 너무 작거나 커요 · 단면 실측 cm로 적어 주세요'); render(); return }
    const moved = d.cat !== c.cat || grpOf(d) !== grpOf(c), wasBase = c.base || c.subBase;
    if (moved) { c.base = false; c.subBase = false } else if (d.sub !== c.sub) c.subBase = false;
    Object.assign(c, { img: d.img, name: d.name.trim() || c.name, cat: d.cat, sub: d.sub, size: d.size, m });
    ensureBases(); const nb = baseOf(c) === c && moved;
    if (d.base && !c.base && c.fit === 'good') { const o = baseOf(c); if (o) o.base = false; c.base = true; c.subBase = false; Object.keys(S.rack).forEach((k) => k.startsWith(c.cat + ':') && delete S.rack[k]) }
    toast(moved ? `${GN(c)}로 옮겼어요${nb ? ` · 처음 잘 맞는 ${GN(c)}라 기준 옷이 됐어요` : ''}${wasBase && c.base === false ? ' · 원래 종류의 기준 옷은 다른 옷이 이어받았어요' : ''}` : '정보를 고쳤어요 · 추천 사이즈를 다시 계산했어요'); back();
  },
  setBase(id) {
    const c = S.closet.find((q) => q.id === id), old = baseOf(c);
    if (old === c) { closeOv(); render(); return }
    if (!old) { c.base = true; closeOv(); toast(`${c.name} ${c.size}을 ${GN(c)} 기준 옷으로 정했어요`); render(); return }
    compareSheet(c, old, 'setBaseOk', `${GN(c)} 기준 옷 변경`, GN(c));
    S.ov.node = '⑤ 기준 옷 바꾸기 (옷장 선반 · 옷 상세 정보) → 정말 바꿀까요? · 지금 기준과 비교 · 바뀌는 추천 사이즈'; render();
  },
  setBaseOk(id) { const c = S.closet.find((q) => q.id === id), old = baseOf(c); if (old) old.base = false; c.base = true; c.subBase = false; Object.keys(S.rack).forEach((k) => k.startsWith(c.cat + ':') && delete S.rack[k]); closeOv(); toast(`${GN(c)} 기준 옷을 바꿨어요 · 추천 사이즈를 다시 계산했어요`); render() },
  delItem(id) { const c = S.closet.find((q) => q.id === id); modal(`<h4>이 옷을 삭제할까요?</h4><p>${c.name} ${c.size}${c.base ? '은 지금 기준 옷이에요. 같은 종류의 다른 옷으로 기준이 바뀌어요' : '의 치수와 핏 기록이 지워져요'}</p><div class="mb"><button class="btn line" data-a="closeOv">취소</button><button class="btn" style="background:var(--sale)" data-a="delOk" data-x="${id}">삭제</button></div>`); S.ov.node = '⑤ 옷 상세 정보 · 삭제 확인 → 기준 옷이었나?'; render() },
  delOk(id) {
    const c = S.closet.find((q) => q.id === id); S.closet = S.closet.filter((q) => q.id !== id); closeOv(); back();
    if (c.base) { ensureBases(); const nx = baseOf(c); toast(nx ? `${nx.name} ${nx.size}이 기준 옷을 이어받았어요` : `잘 맞는 ${GN(c)}가 없어서 기준 옷이 없어졌어요`) }
    else toast('삭제했어요');
  },
  reg(x) { const [cat, from] = x.split('|'); startReg(cat || null, from) },
  regPickType(k) { S.reg.cat = k; render() },
  regM(k) {
    if (!S.reg.cat) S.reg.cat = 'top';
    if (k === 'camera') { modOpen(S.reg.cat); return }
    if (k === 'capture') { modOpenCap(S.reg.cat); return }
    if (k === 'orders') { go('orders'); return }
    if (k === 'link') go('regLink', {});
    else if (k === 'manual') { Object.assign(S.reg, { img: null, name: '', size: null, m: null, src: '직접 입력', note: '' }); go('regMeasure') }
    else {
      const key = k === 'capture' ? 'photoPerm' : 'camPerm', label = k === 'capture' ? '사진' : '카메라';
      if (S[key] === true) { go(k === 'capture' ? 'regCapture' : 'regCamera'); return }
      if (S[key] === false) { go('permDenied', { k: k === 'capture' ? 'photo' : 'cam' }); return }
      modal(`<div style="text-align:center"><div style="width:56px;height:56px;border-radius:14px;background:var(--gray);margin:0 auto 14px;display:flex;align-items:center;justify-content:center">${k === 'capture' ? I.photo : I.camera}</div><h4>'DANGJANG'에서 ${label}에 접근하려고 해요</h4><p>${k === 'capture' ? '구매내역 캡처를 고르려면 사진 접근이 필요해요' : '옷과 A4를 찍어 치수를 추정해요'}</p></div><div class="mb"><button class="btn line" data-a="perm" data-x="${k}|0">허용 안 함</button><button class="btn" data-a="perm" data-x="${k}|1">허용</button></div>`);
      S.ov.node = `④ 옷 등록 · ${label} 권한?`; render();
    }
  },
  perm(x) { const [k, v] = x.split('|'), key = k === 'capture' ? 'photoPerm' : 'camPerm'; S[key] = v === '1'; closeOv(); if (S[key]) go(k === 'capture' ? 'regCapture' : 'regCamera'); else go('permDenied', { k: k === 'capture' ? 'photo' : 'cam' }) },
  permSettings(k) { if (k === 'photo') S.photoPerm = true; else S.camPerm = true; replace(k === 'photo' ? 'regCapture' : 'regCamera'); toast('설정에서 접근을 켰어요 (시연)') },
  regLinkEx(k) { const v = { p2: `https://${PARTNER.host}/goods/p2?utm=app`, p6: `https://${PARTNER.host}/goods/p6`, other: 'https://www.example-shop.co.kr/product/88213', ms1: 'https://www.musinsa.com/products/2479911', ms2: 'https://www.musinsa.com/products/3048710', broken: 'shop example/??' }[k]; cur().p = { v }; render() },
  regLinkGo() {
    const v = document.getElementById('link').value.trim(); let u = null;
    try { u = new URL(/^https?:\/\//i.test(v) ? v : 'https://' + v); if (!/\./.test(u.hostname) || /\s/.test(v)) u = null; } catch (e) { u = null; }
    if (!u) { replace('regLink', { v, err: '올바른 주소를 입력해주세요.' }); return; }
    finishLoading(() => {
      const m = u.hostname.replace(/^www\./, '') === PARTNER.host && u.pathname.match(/\/goods\/(p\d+)/);
      if (m && PB[m[1]]) { const p = PB[m[1]]; toMeasure({ cat: p.cat, sub: p.sub || null, img: p.img, name: p.name, size: null, sizeList: sizeKeys(p), tbl: p.sizes ? (k) => p.sizes[k] ? remapM(partsOf(p), p.sizes[k], PARTS[S.reg.pk || S.reg.cat]) : null : null, src: '상품 링크(제휴)', note: p.sizes ? '제휴 브랜드 · 판매처 공개 실측' : '판매처가 실측을 공개하지 않았어요 · 사진으로 재거나 입력해 주세요', noteOk: !!p.sizes, info: { site: '제휴 브랜드', brand: p.brand } }); }
      else if (API.on) {
        go('loading', { t: '쇼핑몰 페이지를 읽는 중', node: '④ 옷 등록 · 상품 링크 → 서버가 쇼핑몰 페이지 읽는 중' });
        fetch('/api/product?url=' + encodeURIComponent(u.href)).then((r) => r.json()).catch(() => ({ ok: false, message: '서버에 연결하지 못했어요' })).then((j) => {
          nav.pop();
          if (j.ok) { const cat = j.cat || S.reg.cat || 'top'; toMeasure({ cat, srv: j, mcat: j.mcat || null, mcatName: j.mcatName || null, pk: cat, img: j.image ? '/api/img?url=' + encodeURIComponent(j.image) : null, name: j.name || '', size: null, sizeList: j.table ? Object.keys(j.table) : (j.sizes || []), tbl: srvTbl(j, cat), src: '상품 링크(' + (j.site || '쇼핑몰') + ')', note: j.table ? (j.tableSource || '판매처 실측') : '실측표를 찾지 못했어요 · 사이즈표 붙여넣기나 사진으로 재기', noteOk: !!j.table, info: { site: j.site, brand: j.brand, price: j.price } }); }
          else toMeasure({ cat: S.reg.cat || 'top', img: null, name: '', size: null, sizeList: null, src: '상품 링크', linkUrl: u.href, note: (j.message ? j.message + ' · ' : '') + '이 쇼핑몰 정보는 가져오지 못했어요', noteOk: false });
        });
      }
      else toMeasure({ cat: S.reg.cat || 'top', img: null, name: '', size: null, sizeList: null, src: '상품 링크', linkUrl: u.href, note: '이 화면에서는 다른 쇼핑몰을 읽을 수 없어요', noteOk: false });
    }, '링크를 확인하는 중', '④ 옷 등록 · 상품 링크 → 제휴 브랜드인가?', 700);
  },
  regLinkSize(k) { cur().p.size = k; render(); },
  regSrvSize(k) { cur().p.size = k; render(); },
  regSrvUse() {
    const pp = cur().p, r = pp.r, cat = r.cat || 'top', row = srvRow(r.table[pp.size], cat), parts = PARTS[(S.reg && S.reg.pk) || cat], img = pp.img || (r.image ? '/api/img?url=' + encodeURIComponent(r.image) : null);
    Object.assign(S.reg, { cat, img, name: r.name || '', size: pp.size, m: parts.map((x) => row[x] != null ? row[x] : ''), sizeList: r.table ? Object.keys(r.table) : (r.sizes || []), src: pp.from === 'cap' ? '구매내역 캡처 + ' + (r.site || '쇼핑몰') + ' 실측표' : '상품 링크(' + (r.site || '쇼핑몰') + ')', note: (r.tableSource || '판매처 실측') + (row._est ? ' · 인심은 총장−밑위로 추정' : ''), noteOk: true });
    go('regMeasure');
  },
  regSrvAlt(x) {
    const pp = cur().p, r = pp.r, img = pp.img || (r.image ? '/api/img?url=' + encodeURIComponent(r.image) : null);
    Object.assign(S.reg, { cat: r.cat || S.reg.cat, img, name: r.name || '', size: pp.size || null, sizeList: r.sizes || [], m: null, src: '상품 링크(' + (r.site || '쇼핑몰') + ')', note: x === 'photo' ? '실측은 사진으로' : x === 'paste' ? '사이즈표로 실측 입력' : '실측 직접 입력', noteOk: false });
    if (x === 'photo') { go('regMeasure'); regKeep(); modOpen(S.reg.cat, { merge: true }); } else { go('regMeasure'); if (x === 'paste') pasteSheet(); }
  },
  regLinkUse() { const p = PB[cur().p.pid], sz = cur().p.size; Object.assign(S.reg, { cat: p.cat, img: cur().p.img || p.img, name: p.name, size: sz, m: p.sizes[sz].slice(), src: '상품 링크(제휴)', note: '제휴 브랜드 · 판매처 공개 실측', noteOk: true }); go('regMeasure'); },
  regLinkPhoto() { const pp = cur().p; if (pp.pid) { const p = PB[pp.pid]; Object.assign(S.reg, { cat: p.cat, img: pp.img || p.img, name: p.name, size: pp.size || null, m: null, src: '상품 링크(제휴)', note: '실측은 사진으로', noteOk: false }); } else Object.assign(S.reg, { img: pp.img || null, name: '', size: null, m: null, src: '상품 링크', note: '실측은 사진으로', noteOk: false }); go('regMeasure'); modOpen(S.reg.cat, { merge: true }); },
  regLinkManual() { const pp = cur().p; if (pp.pid) { const p = PB[pp.pid]; Object.assign(S.reg, { cat: p.cat, img: pp.img || p.img, name: p.name, size: pp.size || null, m: null, src: '상품 링크(제휴)', note: '실측 직접 입력', noteOk: false }); } else Object.assign(S.reg, { img: pp.img || null, name: '', size: null, m: null, src: '상품 링크', note: '실측 직접 입력', noteOk: false }); go('regMeasure'); },
  regLinkPaste() { Object.assign(S.reg, { img: cur().p.img || null, name: '', size: null, m: null, src: '상품 링크', note: '사이즈표로 실측 입력', noteOk: false }); go('regMeasure'); pasteSheet(); },
  regPaste() { regKeep(); pasteSheet(); },
  regPhotoMeasure() { regKeep(); modOpen(S.reg.cat, { merge: true }); },
  regAddImg() { regKeep(); modOpenCap(S.reg.cat); },
  stExample() { document.getElementById('stxt').value = S.reg.cat === 'bottom' ? '사이즈\t허리단면\t밑위\t허벅지단면\t밑단단면\t총장\n28\t38\t29\t30\t20\t102\n30\t40\t30\t31.5\t21\t103\n32\t42\t31\t33\t22\t104' : '사이즈\t총장\t어깨너비\t가슴단면\t소매길이\nS\t70\t46\t54\t58\nM\t72\t48\t56\t59\nL\t74\t50\t58\t60\nXL\t76\t52\t61\t61'; },
  stParse() {
    const t = document.getElementById('stxt').value, tb = parseSizeTable(t), sizes = Object.keys(tb);
    S.stTable = tb;
    if (!sizes.length) { document.getElementById('stOut').innerHTML = '<div style="font-size:13px;color:var(--sale);margin-top:10px">사이즈표를 읽지 못했어요. 첫 줄에 부위 이름(총장, 어깨, 가슴 …), 아래 줄마다 사이즈와 숫자가 있는지 확인해 주세요</div>'; return; }
    const r = S.reg, want = r.size && tb[String(r.size).toUpperCase()] ? String(r.size).toUpperCase() : null;
    if (want) { A.stPick(want); return; }
    document.getElementById('stOut').innerHTML = `<div style="font-size:13.5px;font-weight:700;margin-top:12px">${sizes.length}개 사이즈를 읽었어요. 산 사이즈를 골라 주세요</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${sizes.map((z) => `<button data-a="stPick" data-x="${z}" style="height:36px;min-width:46px;padding:0 12px;border-radius:18px;font-size:14px;border:1px solid var(--ink);font-weight:700">${z}</button>`).join('')}</div>`;
  },
  stPick(z) {
    const row = S.stTable[z], r = S.reg, parts = PARTS[r.pk || r.cat], got = parts.filter((p) => row[p] != null).length;
    r.m = parts.map((p) => row[p] != null ? row[p] : ''); r.size = z; const T0 = S.stTable; r.sizeList = Object.keys(T0); r.est = null; r.tbl = (k) => T0[k] ? parts.map((p) => T0[k][p] != null ? T0[k][p] : '') : null; // 붙여 넣은 사이즈표로 다른 사이즈도 바로 채움 r.extra = Object.assign({}, r.extra, Object.fromEntries(Object.entries(row).filter(([k]) => !parts.includes(k))));
    let est = ''; if (r.cat === 'bottom') { const iI = parts.indexOf('인심'), iT = parts.indexOf('총장'), iR = parts.indexOf('밑위'); if (iI >= 0 && r.m[iI] === '' && r.m[iT] !== '' && r.m[iR] !== '') { r.m[iI] = Math.round((r.m[iT] - r.m[iR]) * 10) / 10; est = ' · 인심은 총장−밑위로 추정'; } }
    r.note = '사이즈표에서 읽은 실측' + est; r.noteOk = true; closeOv(); replace('regMeasure'); toast(`사이즈표에서 ${z} 실측 ${got}개를 채웠어요${got < parts.length ? ' · 빈 칸은 직접 채워 주세요' : ''}`);
  },
  regShot(i) { go('regCrop', { i: +i }) },
  regCropOk(i) {
    const [img, n, s] = SHOTS[+i], cat = { hero: 'top', tee: 'top', knit: 'top', jacket: 'outer', denim: 'bottom', slacks: 'bottom' }[img];
    finishLoading(() => {
      const M = { hero: [72.5, 51, 58, 59.5], tee: [71, 53, 58, 23], knit: [68, 54, 63, 58], jacket: [70, 48, 58, 60], denim: [40, 30, 31.5, 75.5, 103], slacks: [41, 31, 33, 79, 108] };
      S.reg.cat = cat;
      Object.assign(S.reg, { img, name: n, size: s, m: fromLegacy({ cat }, M[img]), src: '구매내역 캡처', note: +i === 5 ? '치수를 못 읽어 비슷한 옷 치수로 채움' : '캡처에서 치수 읽음', noteOk: +i !== 5 });
      nav.pop(); replace('regMeasure');
    }, '캡처에서 치수를 읽는 중', '④ 옷 등록 · 치수가 읽혔나?');
  },
  shoot() {
    finishLoading(() => {
      const tpl = { top: ['tee', '릴렉스 핏 크루 넥 티셔츠', 'L', [71, 53, 58, 23]], bottom: ['denim', '우먼즈 에센셜 와이드 데님 팬츠', '30', [40, 30, 31.5, 75.5, 103]], outer: ['jacket', '[씬라이트] 후드 재킷', 'M', [70, 48, 58, 60]] }[S.reg.cat];
      Object.assign(S.reg, { img: tpl[0], name: tpl[1], size: tpl[2], m: fromLegacy({ cat: S.reg.cat }, tpl[3]), src: 'A4 촬영', note: 'A4 기준 치수 추정 · 1~2cm 차이 가능', noteOk: true });
      replace('regMeasure');
    }, 'A4와 옷을 찾는 중', '④ 옷 등록 · A4와 옷이 인식됐나? → 치수 추정', 1200);
  },
  regSize(s) { regKeep(); S.reg.size = s; regFill(); subAuto(S.reg, false); render() },
  regCat(c) { const r = S.reg; if (c === r.cat) return; A.regSub(c + '|'); r.sub = null; render() },
  regSub(x) { regKeep(); const r = S.reg, [c, sub] = x.split('|'); r.cat = c; r.sub = sub || null; r.subUser = true; r.subWhy = false; setPk(r); render() },
  regBase() { regKeep(); S.reg.base = !S.reg.base; render() },
  regClear() { const i = document.getElementById('rname'); i.value = ''; i.focus() },
  regAdd() {
    const r = S.reg, pk = r.pk || r.cat, P = PARTS[pk], name = document.getElementById('rname').value.trim() || `내 ${CAT[r.cat]}`, m = P.map((_, i) => +document.getElementById('m' + i).value || 0);
    if (!r.sub) { regKeep(); toast('옷 종류를 골라 주세요'); render(); return }
    if (!r.size) { toast('사이즈를 골라 주세요'); render(); return }
    const miss = NEED[pk].filter((x) => !m[P.indexOf(x)]); if (miss.length) { regKeep(); toast(`${miss.map((x) => LONG[x] || x).join(', ')}은 꼭 적어 주세요`); render(); return }
    const it = item({ img: r.img, name, cat: r.cat, sub: r.sub, pk, g: true, size: r.size, m: remapM(P, m, partsOf({ cat: r.cat, sub: r.sub })), extra: r.extra, full: r.full, src: r.src || '직접 입력' }); it.base = !!r.base; pendingAdded(it);
  },
  regMoreOk() { closeOv(); nav = nav.filter((e) => !e.s.startsWith('reg') && !['loading', 'permDenied'].includes(e.s)); S.reg = { cat: null, from: S.reg.from }; nav.push({ s: 'regType', p: {} }); render(true) },
  regMore() { S.reg = { cat: null, from: (S.reg || {}).from || 'closet' }; go('regType') },
  regToFit() { closeOv(); nav = nav.filter((e) => !e.s.startsWith('reg') && !['loading', 'permDenied'].includes(e.s)); go('regFit') },
  regFitAns(x) { const [id, k] = x.split('|'), c = S.pending.find((q) => q.id === id); c.fit = k; if (k === 'good') c.notes = []; render() },
  regNote(x) { const [id, n] = x.split('|'), c = S.pending.find((q) => q.id === id); c.notes = c.notes.includes(n) ? c.notes.filter((q) => q !== n) : c.notes.concat(n); render() },
  regDel(id) { S.pending = S.pending.filter((q) => q.id !== id); if (!S.pending.length) back(); else render() },
  regLater() { const from = (S.reg || {}).from; nav = nav.filter((e) => e.s !== 'regFit'); toast(`대기 목록에 ${S.pending.length}벌 남겨 둘게요 · 다음에 이어서 해요`); if (!nav.length) nav = [{ s: 'closet', p: {} }]; render(true) },
  regSave() {
    const n = S.pending.length; let baseMsg = '';
    for (const c of S.pending) { if (c.base) { S.closet.forEach((x) => { if (x.cat === c.cat && grpOf(x) === grpOf(c)) x.base = false; }); baseMsg = `${c.name} ${c.size}을 ${GN(c)} 기준 옷으로 정했어요. 옷 보기에서 바꿀 수 있어요` } S.closet.push(c) }
    S.pending = [];
    nav = nav.filter((e) => e.s !== 'regFit'); go('regDone', { n, baseMsg });
    if (!S.firstReg) { S.firstReg = true; S.coupons.unshift({ t: '첫 옷 등록 10% 쿠폰', d: '모든 상품 · 11월 15일까지', used: false }); modal(`<div style="text-align:center"><div style="width:64px;height:64px;border-radius:50%;background:var(--fitw);color:var(--fit);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800">10%</div><h4>첫 등록 쿠폰을 받았어요</h4><p>쿠폰함에서 확인할 수 있어요</p></div><div class="mb"><button class="btn" data-a="closeOv">확인</button></div>`); S.ov.node = '④ 옷 등록 · 첫 등록? → 예 · 첫 등록 쿠폰 지급'; render() }
  },
  regExit() { const from = S.reg && S.reg.from; if (from && from.startsWith('p')) { nav = nav.filter((e) => !e.s.startsWith('reg')); while (nav.length > 1 && !(cur().s === 'detail' && cur().p.id === from)) nav.pop(); if (cur().s !== 'detail') nav.push({ s: 'detail', p: { id: from } }); render(true); toast('기준 옷으로 사이즈를 다시 판단했어요') } else tab('closet') },
  myLogin() { need('가입하면 10% 쿠폰을 드려요', () => { closeOv(); tab('my') }) },
  logout() { modal(`<h4>로그아웃할까요?</h4><p>옷장 정보는 계정에 그대로 남아요</p><div class="mb"><button class="btn line" data-a="closeOv">취소</button><button class="btn" data-a="logoutOk">로그아웃</button></div>`); S.ov.node = '⑥ 마이 · 로그아웃 → 로그인 정보 지우기'; render() },
  logoutOk() { S.saved = { closet: S.closet, coupons: S.coupons, orders: S.orders, user: S.user }; S.user = null; S.closet = []; S.coupons = []; S.orders = []; closeOv(); tab('home'); toast('로그아웃했어요 · 비회원으로 둘러보는 중') },
  leaveGo() { S.user = null; S.closet = []; S.coupons = []; S.orders = []; S.pending = []; S.saved = null; S.accounts = { kakao: false, naver: false, google: false }; tab('home'); toast('탈퇴했어요 · 계정과 옷장 데이터를 지웠어요') },
  social(k) {
    if (S.accounts[k]) { // 이미 가입한 계정
      S.user = S.saved ? S.saved.user : { name: '준성' }; if (S.saved) { S.closet = S.saved.closet; S.coupons = S.saved.coupons; S.orders = S.saved.orders; S.saved = null }
      closeOv(); toast('로그인했어요'); afterLogin(); return;
    }
    if (k !== 'kakao' && S.accounts.kakao) { closeOv(); modal(`<h4>카카오로 가입한 계정이에요</h4><p>같은 이메일로 가입된 계정이 있어요. 카카오로 로그인해 주세요</p><div class="mb"><button class="btn" style="background:#FEE500;color:#191919" data-a="social" data-x="kakao">카카오로 로그인</button></div>`); S.ov.node = '⑦ 로그인 게이트 · 같은 이메일이 다른 방법으로 가입됨 → 안내'; render(); return }
    S.joining = k; closeOv(); go('terms', { t: {} });
  },
  term(k) { const t = Object.assign({}, cur().p.t); if (k === 'all') { const on = !(t.a && t.b && t.c && t.d); t.a = t.b = t.c = t.d = on } else t[k] = !t[k]; cur().p.t = t; render() },
  termsOk() { S.accounts[S.joining] = true; S.user = { name: '준성' }; S.coupons.unshift({ t: '신규 가입 10% 쿠폰', d: '3만 원 이상 · 10월 31일까지', used: false }); replace('joined') },
  joinedGo() { nav = nav.filter((e) => !['terms', 'joined'].includes(e.s)); if (!nav.length) nav = [{ s: 'home', p: {} }]; render(true); afterLogin() },
  buyOpen() {
    const pp = cur().p; sheet('');
    Object.assign(S.ov, { k: 'sheet pd-sheet', node: '② 상품 상세 · 구매하기 → 옵션(컬러 · 사이즈) 선택', pid: pp.id, open: 'color', color:null, items: [] });
    optSheet(); render();
  },
  optOpen(k) { const o = S.ov; o.open = o.open === k ? null : (k === 'size' && !o.color ? 'color' : k); optSheet(true) },
  optColor(c) { Object.assign(S.ov, { color:c, open: 'size' }); optSheet(true) },
  optSize(k) { const o = S.ov, ex = o.items.find((it) => it.color === o.color && it.size === k); if (ex) ex.qty++; else o.items.push({ color:o.color, size: k, qty: 1 }); Object.assign(o, { color:null, open: null }); optSheet(true) },
  optQty(x) { const [i, d] = x.split('|').map(Number), it = S.ov.items[i]; it.qty = Math.max(1, it.qty + d); optSheet(true) },
  optDel(i) { S.ov.items.splice(+i, 1); optSheet(true) },
  optGo(mode) {
    const o = S.ov; if (!o.items.length) { toast('컬러와 사이즈를 선택해 주세요'); render(); return }
    const items = o.items.map((it) => ({ pid: o.pid, ...it })); cur().p.sel = items[items.length - 1].size; closeOv(); buyFlow(items, mode);
  },
  cmpToggle() { saveY(); cur().p.nob = !cur().p.nob; render() },
  bpSel(cid) {
    const shown = S.ov.shown; baseSheet(PB[S.ov.pid], cid); S.ov.shown = shown; // 상태만 갱신, 화면은 아래에서 부분 변경
    const items = [...app.querySelectorAll('.pd-bi')], i = items.findIndex((b) => b.dataset.x === cid);
    items.forEach((b, k) => { b.classList.toggle('on', k === i); b.classList.toggle('nb', k === i - 1) });
    app.querySelector('.pd-sf .btn').disabled = false;
  },
  bpOk() { const c = S.ov.sel, b = baseFor(PB[S.ov.pid]); closeOv(); if (b && b.id === c) render(); else A.pickBase(c) },
  rackRef(id) { const box = app.querySelector('.rkbox[data-rack$=":good"]'), card = box && box.querySelector(`.rk[data-id="${id}"]`); if (card && +card.dataset.i !== S.rack[box.dataset.rack]) box.rackTo(+card.dataset.i); else A.item(id) },
  cbook() { toast('코디북은 준비 중이에요') },
  closetSub(x) { replace('closet', { t: cur().p.t, s: x }) },
  rackTap(x) { if (Date.now() - dragEnd < 300) return; const [k, i, id] = x.split('|'), box = app.querySelector(`.rkbox[data-rack="${k}"]`); if (+i === S.rack[k]) A.item(id); else box.rackTo(+i) },
  editCat(k) {
    const d = syncEdit(), c = S.closet.find((q) => q.id === cur().p.id); if (k === d.cat) { render(); return }
    modal(`<h4>종류를 바꿀까요?</h4><p>${CAT[d.cat]} → ${CAT[k]}. 치수 항목이 달라져서 치수를 다시 적어야 해요${c.base ? `. 지금 ${CAT[c.cat]} 기준 옷이라 저장하면 같은 종류의 다른 잘 맞는 옷이 기준을 이어받아요` : c.subBase ? `. ${c.sub} 따로 기준에서도 빠져요` : ''}</p><div class="mb"><button class="btn line" data-a="closeOv">취소</button><button class="btn" data-a="editCatOk" data-x="${k}">바꾸기</button></div>`);
    S.ov.node = '⑤ 정보 수정 · 종류를 바꾸나? → 치수 항목 바뀜 · 기준 옷이면 해제 안내'; render();
  },
  editCatOk(k) { const d = cur().p.d; Object.assign(d, { cat: k, sub: null, size: null, m: partsOf({ cat: k }).map(() => '') }); closeOv(); render() },
  editSub(x) { const d = syncEdit(), was = partsOf(d); d.sub = x || null; const now = partsOf(d); if (was.join() !== now.join()) d.m = remapM(was, d.m, now); /* 그룹이 바뀌면 같은 부위 값만 옮김 */ render() },
  editSize(x) { syncEdit().size = x; render() },
  setSubBase(id) {
    const c = S.closet.find((q) => q.id === id), old = subBaseOf(c.cat, c.sub), cb = baseOf(c), L = GN(c);
    if (old) { // 이미 있는 세부 기준을 바꿀 때만 비교표
      compareSheet(c, old, 'setSubBaseOk', `${c.sub} 기준 옷 변경`, c.sub);
      S.ov.node = '⑤ 세부 종류 기준 옷 바꾸기 → 정말 바꿀까요? · 지금 세부 기준과 비교'; render(); return;
    }
    // 처음 정할 때: 비교표 없이 이 옷(새 세부 기준)과 그대로인 종류 기준 옷을 카드로 (시안 477:1169)
    const card = (item, who, on) => `<div class="csh-card ${on ? 'on' : ''}"><div class="ci">${cutPic(item)}</div><small>${who}</small><b>${item.name}</b></div>`;
    sheet(`<div class="grab"></div><div class="csh-t">${c.sub} 기준 옷을 따로 정할까요?</div>
      <div class="csh-d">${c.sub} 상품만 이 옷과 비교해서 사이즈를 추천해요.<br>${L} 기준 옷은 바뀌지 않아요</div>
      <div class="csh-cards">${card(c, `${c.sub} 기준 옷`, true)}${cb ? card(cb, `다른 ${L} 상품`, false) : ''}</div>
      <div class="mb" style="margin-top:20px"><button class="btn line" data-a="closeOv">취소</button><button class="btn" data-a="setSubBaseOk" data-x="${c.id}">정하기</button></div>`);
    S.ov.node = '⑤ 세부 종류 기준 옷 처음 정하기 → 이 세부 종류만 따로 · 종류 기준 옷은 그대로'; render();
  },
  setSubBaseOk(id) { const c = S.closet.find((q) => q.id === id), old = subBaseOf(c.cat, c.sub); if (old) old.subBase = false; c.subBase = true; Object.keys(S.rack).forEach((k) => k.startsWith(c.cat + ':') && delete S.rack[k]); closeOv(); toast(`${c.sub} 상품은 이제 ${c.name} ${c.size}과 비교해요`); render() },
  unsetSub(id) { const c = S.closet.find((q) => q.id === id); c.subBase = false; Object.keys(S.rack).forEach((k) => k.startsWith(c.cat + ':') && delete S.rack[k]); toast(`${GN(c)} 기준으로 되돌렸어요 · ${c.sub}도 ${GN(c)} 기준 옷과 비교해요`); render() },
  photoAdd(x) {
    const [id, ctx] = x.split('|'), has = ctx === 'edit' ? syncEdit().img : S.closet.find((q) => q.id === id).img;
    sheet(`<div class="grab"></div><div style="font-size:18px;font-weight:800">사진 ${has ? '바꾸기' : '추가'}</div><div style="font-size:13px;color:var(--sub);margin-top:4px">사진이 없어도 치수 비교는 그대로 돼요</div><div style="margin-top:14px">
      <button class="opt" data-a="photoSrc" data-x="${id}|${ctx}|photo"><span class="oi">${I.photo}</span><span style="flex:1"><b>사진첩에서 고르기</b><span>찍어 둔 옷 사진을 골라요</span></span>${I.chev}</button>
      <button class="opt" data-a="photoSrc" data-x="${id}|${ctx}|cam"><span class="oi">${I.camera}</span><span style="flex:1"><b>지금 찍기</b><span>옷을 펼쳐 놓고 찍어 주세요</span></span>${I.chev}</button></div>`);
    S.ov.node = '⑤ 옷 상세 정보 · 사진 없는 옷 → 사진 추가 (사진첩 · 촬영)'; render();
  },
  photoSrc(x) {
    const k = x.split('|')[2], key = k === 'photo' ? 'photoPerm' : 'camPerm', label = k === 'photo' ? '사진' : '카메라';
    if (S[key] === true) { photoGo(x); return }
    if (S[key] === false) { modal(`<h4>${label} 접근이 꺼져 있어요</h4><p>설정에서 DANGJANG의 ${label} 접근을 켜 주세요</p><div class="mb"><button class="btn line" data-a="closeOv">취소</button><button class="btn" data-a="photoPerm" data-x="${x}|1">설정 열기</button></div>`); S.ov.node = `⑤ 사진 추가 · ${label} 권한? → 거부 · 설정 안내`; render(); return }
    modal(`<div style="text-align:center"><div style="width:56px;height:56px;border-radius:14px;background:var(--gray);margin:0 auto 14px;display:flex;align-items:center;justify-content:center">${k === 'photo' ? I.photo : I.camera}</div><h4>'DANGJANG'에서 ${label}에 접근하려고 해요</h4><p>옷 사진을 넣으려면 ${label} 접근이 필요해요</p></div><div class="mb"><button class="btn line" data-a="photoPerm" data-x="${x}|0">허용 안 함</button><button class="btn" data-a="photoPerm" data-x="${x}|1">허용</button></div>`);
    S.ov.node = `⑤ 사진 추가 · ${label} 권한?`; render();
  },
  photoPerm(x) { const [id, ctx, k, v] = x.split('|'); S[k === 'photo' ? 'photoPerm' : 'camPerm'] = v === '1'; if (v === '1') photoGo(`${id}|${ctx}|${k}`); else { closeOv(); toast('사진 없이도 치수 비교는 그대로 돼요'); render() } },
  photoPick(x) { const [id, ctx, key] = x.split('|'); setImg(id, ctx, key) },
  sortOpen() { const o = cur().p.o || '인기순'; sheet(`<div class="grab"></div><div class="sh-t">정렬</div>${SORTS.map((x) => `<button class="sopt ${x === o ? 'on' : ''}" data-a="sortSet" data-x="${x}">${x}${x === o ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' : ''}</button>`).join('')}`); render() },
  sortSet(x) { closeOv(); replace(cur().s, Object.assign({}, cur().p, { o: x })) },
  findGo() { go('find'); const i = app.querySelector('.fin'); if (i) i.focus() },
  findDo(x) { const q = (x || '').trim(); if (!q) return; S.recent = [q].concat(S.recent.filter((k) => k !== q)).slice(0, 8); if (cur().s === 'result') replace('result', { q }); else go('result', { q }) },
  findCat(x) { keepX('.chips', () => replace('result', Object.assign({}, cur().p, { c: x }))) },
  findClear() { const i = app.querySelector('.fin'); i.value = ''; i.focus(); i.dispatchEvent(new Event('input', { bubbles: true })) },
  recentDel(x) { S.recent = S.recent.filter((k) => k !== x); render() },
  recentAll() { S.recent = []; render() },
  catC(x) { replace('search', { c: x, s: '전체', o: cur().p.o }) },
  catS(x) { keepX('.chips', () => replace('search', Object.assign({}, cur().p, { s: x }))) },
  catGo(x) { const [c, sub] = x.split('|'); go('clist', { c, s: sub }) },
  listSub(x) { replace('clist', Object.assign({}, cur().p, { s: x })) },
  rankCat(x) { replace('home', Object.assign({}, cur().p, { rc: x, rs: '전체' })) },
  rankSub(x) { keepX('.chips', () => replace('home', Object.assign({}, cur().p, { rs: x }))) },
  rankPeriod(x) { replace('home', Object.assign({}, cur().p, { rp: x })) },
  saleMin(x) { saveY(); cur().p.sm = +x; render() },
  coupon() { if (S.cpGot) return; const give = () => { closeOv(); S.cpGot = true; toast('쿠폰을 받았어요'); render() }; if (!S.user) { need('로그인하면 쿠폰을 받을 수 있어요', give); return } give() },
  simOpen() { S.simDD = !S.simDD; saveY(); render() },
  simPick(id) { S.simB = id; S.simDD = false; saveY(); render() },
};
Object.assign(A, {
  revAll(x) { const [id, m] = x.split('|'); go('reviews', { id, mine: m === 'mine' }) },
  revSz(k) { keepX('.chips', () => replace('reviews', Object.assign({}, cur().p, { sz: k }))) },
  revMine() { replace('reviews', Object.assign({}, cur().p, { mine: !cur().p.mine })) },
  revSort() { replace('reviews', Object.assign({}, cur().p, { sort: (cur().p.sort || '추천순') === '추천순' ? '최신순' : '추천순' })) },
  revItem(x) { const [id, i] = x.split('|'); go('review', { id, i: +i }) },
  revHelp(x) { S.helped = S.helped || {}; S.helped[x] = !S.helped[x]; saveY(); render() },
});
/* ── DANGJANG 브랜드 · 홈 디자인 (2026-10-26 피그마 login · home_01 · home_02) ── */
const LOGO = (c = '#06BC51', w = 112) => `<svg class="logo" width="${w}" height="${w * 22 / 112}" viewBox="0 0 112 22" fill="${c}" role="img" aria-label="DANGJANG"><path d="M107.213 14.0809H105.625V10.2151H112V17.1267C112 20.7114 109.081 22 105.509 22C101.936 22 98.9003 20.7114 98.9003 17.1267V4.87327C98.9003 1.28861 101.819 0 105.392 0C108.964 0 111.883 1.28861 111.883 4.87327V7.28648H106.98V5.64643C106.98 4.7327 106.302 4.24068 105.392 4.24068C104.481 4.24068 103.804 4.7327 103.804 5.64643V16.3536C103.804 17.2673 104.598 17.7593 105.509 17.7593C106.419 17.7593 107.213 17.2673 107.213 16.3536V14.0809Z"/><path d="M92.8378 0.468583H97.5079V21.5314H92.8378L89.0783 10.8711V21.5314H84.4082V0.468583H89.0783L92.8378 11.2226V0.468583Z"/><path d="M78.4728 17.9936H74.9469L74.5032 21.5314H69.6229L72.5884 0.468583H80.8546L83.8668 21.5314H78.9398L78.4728 17.9936ZM77.9358 13.7764L76.7215 4.14697L75.4839 13.7764H77.9358Z"/><path d="M64.1814 16.3067V0.468583H69.085V17.1267C69.085 20.7114 66.2829 22 62.7103 22C59.161 22 56.6858 20.7114 56.6858 17.1267V13.9638H61.7062V16.3067C61.7062 17.2204 62.0331 17.7593 62.9438 17.7593C63.8544 17.7593 64.1814 17.2204 64.1814 16.3067Z"/><path d="M50.9907 14.0809H49.4029V10.2151H55.7776V17.1267C55.7776 20.7114 52.8588 22 49.2861 22C45.7135 22 42.6779 20.7114 42.6779 17.1267V4.87327C42.6779 1.2886 45.5967 0 49.1694 0C52.742 0 55.6609 1.2886 55.6609 4.87327V7.28647H50.7572V5.64643C50.7572 4.73269 50.0801 4.24068 49.1694 4.24068C48.2587 4.24068 47.5815 4.73269 47.5815 5.64643V16.3536C47.5815 17.2673 48.3755 17.7593 49.2861 17.7593C50.1968 17.7593 50.9907 17.2673 50.9907 16.3536V14.0809Z"/><path d="M36.6155 0.468583H41.2856V21.5314H36.6155L32.856 10.8711V21.5314H28.1859V0.468583H32.856L36.6155 11.2226V0.468583Z"/><path d="M22.2499 17.9936H18.7239L18.2803 21.5314H13.4L16.3655 0.468583H24.6317L27.6439 21.5314H22.7169L22.2499 17.9936ZM21.7128 13.7764L20.4986 4.14696L19.261 13.7764H21.7128Z"/><path d="M12.983 5.15442V16.8456C12.983 20.0554 11.3718 21.5314 8.31284 21.5314H0V0.468583H8.31284C11.3718 0.468583 12.983 1.94462 12.983 5.15442ZM8.19608 15.6038V6.41959C8.19608 5.41214 7.89252 4.80298 6.77169 4.80298H4.90364V17.2204H6.77169C7.89252 17.2204 8.19608 16.6113 8.19608 15.6038Z"/></svg>`;
const ICO_INFO = '<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#C4C4C4"/><path d="M8 4v5" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><circle cx="8" cy="11.6" r="1" fill="#fff"/></svg>';
const ICO_UP = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>';
// 홈 추천: 내 옷장 기준 옷과 실측이 가까운 랭킹 상품 (home_01 · home_02)
function simFit() {
  const bases = S.closet.filter((c) => c.base); if (!bases.length) return '';
  const b = bases.find((c) => c.id === S.simB) || bases[0], open = !!S.simDD;
  const rank = P.slice().sort((x, y) => y.rev - x.rev).map((x) => x.id), owned = S.closet.map((c) => c.pid);
  const same = (x) => b.sub ? x.sub === b.sub : x.cat === b.cat; // 같은 2뎁스끼리, 기준 옷에 2뎁스가 없으면 같은 1뎁스
  const items = rank.map((id) => PB[id]).filter((x) => x.sizes && !owned.includes(x.id) && x.cat === b.cat && grpOf(x) === grpOf(b) && same(x)).map((x) => {
    const best = Object.keys(x.sizes).map((k) => ({ k, pct: simPct(x, b, k) })).sort((m, n) => n.pct - m.pct)[0];
    return { x, k: best.k, pct: best.pct };
  }).filter((e) => e.pct >= 70);
  const row = (c) => `<span class="simpic">${cutPic(c)}</span><span class="simtx"><b>${c.name}</b><small>${CAT[c.cat]} · ${c.size} Size</small></span>`;
  return `<div class="sec simsec"><h3>${S.user.name}님 옷장 기준으로 골랐어요</h3><button class="simi" data-a="simTip">랭킹 상품 기준${ICO_INFO}</button>
    ${S.simTip ? `<div class="simtip" role="tooltip">비교할 내 옷을 고르면 랭킹 상품 중<br>실측이 가까운 상품을 보여드려요.<button data-a="simTip" aria-label="닫기"><svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.8 8L0 7.2L3.2 4L0 0.8L0.8 0L4 3.2L7.2 0L8 0.8L4.8 4L8 7.2L7.2 8L4 4.8L0.8 8Z" fill="white"/></svg></button></div>` : ''}</div>
  <div class="simdd ${open ? 'open' : ''}"><button class="simbox" data-a="simOpen" aria-expanded="${open}">${row(b)}<span class="simarr">${I.down}</span></button>
    ${open ? `<div class="simlist" role="listbox">${bases.map((c) => `<button class="simopt ${c.id === b.id ? 'on' : ''}" role="option" aria-selected="${c.id === b.id}" data-a="simPick" data-x="${c.id}">${row(c)}${c.id === b.id ? `<span class="simchk">${I.check}</span>` : ''}</button>`).join('')}</div>` : ''}</div>
  ${items.length ? `<div class="hscroll">${items.map(({ x, k, pct }) => `<button class="card pcard" data-a="detail" data-x="${x.id}"><div class="img"><img src="${IMG[x.img]}" alt=""></div>${cardBody(x)}<span class="szchip">${CAT[x.cat]} · ${k} Size</span><div class="pfit">${pct}% 비슷해요</div></button>`).join('')}${items.length > 6 ? `<button class="pmore" data-a="homeTab" data-x="랭킹">전체보기${I.chev}</button>` : ''}</div>`
    : `<div class="simnone">아직 이 옷과 실측이 가까운 ${b.sub || CAT[b.cat]} 랭킹 상품이 없어요</div>`}`;
}
// 홈을 내리면 검색창 대신 헤더 돋보기 · 맨 위로 버튼 (home_02)
document.addEventListener('scroll', (e) => { const b = e.target; if (b.classList && b.classList.contains('body')) b.parentElement.classList.toggle('scrolled', b.scrollTop > 120) }, true);
Object.assign(A, {
  simTip() { S.simTip = !S.simTip; render() },
  toTop() { const b = document.querySelector('#view .body'); if (b) b.scrollTo({ top: 0, behavior: 'smooth' }) },
});
/* ── 구매 이후 (2026-10-26 팀 결정) ──
   옷장에는 본인에게 잘 맞는 옷만 등록해요. 그래서 산 옷을 '핏 기다리는 옷'으로 옷장에 미리 담지 않아요.
   주문 → 배송 완료 → 입어 보고 구매 확정 → "옷장에 담을까요?" (담지 않았으면 구매 내역에서 나중에 담기) */
const ordOf = (id) => S.orders.find((o) => o.id === id);
const ordStat = (o) => o.returned ? '반품 신청됨' : o.confirmed ? '구매 확정' : o.delivered ? '배송 완료' : '배송 중';
const inCloset = (o) => o.cid && S.closet.some((c) => c.id === o.cid);
function dlvCard() { // 홈 추천 탭: 배송 완료됐지만 아직 구매 확정 안 한 주문
  const o = S.orders.find((q) => q.delivered && !q.confirmed && !q.returned); if (!o) return '';
  const p = PB[o.pid];
  return `<button data-a="confirmStart" data-x="${o.id}" class="dlv"><div class="img"><img src="${IMG[p.img]}"></div><div style="flex:1;min-width:0"><em>배송 완료 · 구매 확정하기</em><b>${p.name} ${o.size}, 입어 보셨나요?</b></div>${I.chev}</button>`;
}
function demoDeliver() { // 데모 패널 '주문한 옷 배송 완료 보내기'
  if (!S.user) { toast('로그인한 상태에서 볼 수 있어요 · 위에서 회원 상태를 골라 주세요'); render(); return }
  let o = S.orders.find((q) => !q.delivered);
  if (!o) { o = { id: 'o' + (S.orders.length + 1), pid: 'p1', size: 'M', demo: true, delivered: false, confirmed: false, cid: null }; S.orders.unshift(o) } // 주문이 없으면 시연용 주문 하나
  o.delivered = true;
  const p = PB[o.pid], n = { t: '배송 완료 · 입어 보셨나요?', b: `${p.name} ${o.size}, 입어 보고 구매 확정해 주세요`, oid: o.id, read: false }; S.notis.unshift(n);
  closeOv(); tab('home');
  if (S.notifOn) { S.push = n; clearTimeout(A.ph); A.ph = setTimeout(() => { S.push = null; render() }, 6000) } else toast('배송이 완료됐어요 · 홈 카드와 알림을 확인해 보세요');
  render();
}
function addToCloset(o) { // 구매한 상품 실측 그대로 잘 맞는 옷으로 담음. 그 그룹에 기준 옷이 없으면 기준 옷이 됨
  const p = PB[o.pid], c = item({ img: p.img, name: p.name.replace(/ (아이보리|네이비|오트밀|차콜|라이트블루|블랙|브라운|미디엄블루|블루)$/, ''), cat: p.cat, sub: p.sub || null, g: true, pid: p.id, brand: p.brand, size: o.size,
    m: p.sizes && p.sizes[o.size] ? p.sizes[o.size].slice() : partsOf(p).map(() => null), fit: 'good', src: 'DANGJANG 구매' });
  const first = !baseOf(c); S.closet.push(c); o.cid = c.id; ensureBases();
  return `내 옷장에 담았어요${first ? ` · ${GN(c)} 기준 옷이 됐어요` : ''}`;
}
SCR.ordered = (pp) => ({ node: '③ 구매 · 주문 완료 → 배송 오면 입어 보고 구매 확정', body: `<div class="hdr"><span></span><button data-a="tab" data-x="home">${I.close}</button></div>
  <div style="text-align:center;padding-top:60px"><div class="check">${I.check}</div><div style="font-size:23px;font-weight:800;letter-spacing:-.03em;margin-top:20px">주문이 완료됐어요</div><div style="font-size:14px;color:var(--ink2);margin-top:8px;line-height:1.55">배송 오면 입어 보고 구매 확정해 주세요.<br>잘 맞으면 내 옷장에 담아 사이즈 비교에 쓸 수 있어요</div></div>
  <div style="margin:28px 16px 0;border:1px solid var(--line);border-radius:10px;padding:12px;display:flex;gap:12px;align-items:center"><div class="img" style="width:52px;height:62px;border-radius:6px;flex:none"><img src="${IMG[PB[pp.items[0].pid].img]}"></div><div style="min-width:0"><span class="chipg">배송 준비 중</span><div class="nm" style="margin-top:6px;font-weight:700;color:var(--ink)">${PB[pp.items[0].pid].name} ${pp.items[0].size}${pp.items.length > 1 ? ` 외 ${pp.items.length - 1}벌` : ''}</div></div></div>
  <div style="position:absolute;left:16px;right:16px;bottom:34px;display:grid;gap:8px"><button class="btn" data-a="tab" data-x="home">쇼핑 계속하기</button><button class="btn line" data-a="goTab" data-x="my|orders">주문 내역 보기</button></div>` });
SCR.orders = () => ({ node: '⑥ 마이 · 주문 내역 → 구매 확정 · 반품 · 교환 · 내 옷장에 담기', body: `${hdrBack('주문 내역')}${S.orders.length ? S.orders.map((o) => {
    const p = PB[o.pid], b = (a, t, strong) => `<button class="btn ${strong ? '' : 'line'}" style="height:42px;font-size:13.5px" data-a="${a}" data-x="${o.id}">${t}</button>`;
    const acts = o.returned ? '' : !o.delivered ? '' : !o.confirmed ? b('orderReturn', '반품 · 교환') + b('confirmStart', '구매 확정', true)
      : inCloset(o) ? `<button class="btn line" style="height:42px;font-size:13.5px;grid-column:1/-1" data-a="item" data-x="${o.cid}">내 옷장에서 보기</button>` : `<button class="btn" style="height:42px;font-size:13.5px;grid-column:1/-1" data-a="ordAdd" data-x="${o.id}">${I.plus} 내 옷장에 담기</button>`;
    return `<div style="padding:16px;border-bottom:8px solid var(--gray)"><div style="font-size:13px;color:var(--sub)">2026.10.11 주문</div><div style="font-weight:800;font-size:15px;margin-top:4px">${ordStat(o)}</div><div style="display:flex;gap:12px;margin-top:10px"><div class="img" style="width:60px;height:72px;border-radius:6px;flex:none"><img src="${IMG[p.img]}"></div><div style="min-width:0"><div class="nm">${p.name}</div><div style="font-size:13px;color:var(--sub)">${o.color ? o.color + ' / ' : '사이즈 '}${o.size}</div><div class="price" style="margin-top:4px">${won(sale(p))}원</div></div></div>
    ${o.confirmed && !inCloset(o) ? '<div style="font-size:12.5px;color:var(--sub);margin-top:10px">잘 맞는 옷만 옷장에 담아 두면 다른 상품을 볼 때 이 옷과 사이즈를 비교해요</div>' : ''}
    ${acts ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:12px">${acts}</div>` : ''}</div>` }).join('') : `<div class="empty"><div class="big">${I.box}</div><h4>주문 내역이 없어요</h4></div>`}` });
SCR.notis = () => { S.notis.forEach((n) => n.read = true); return { node: '알림 목록', body: `${hdrBack('알림')}${S.notis.length ? S.notis.map((n) => `<button class="li" style="height:auto;padding:14px 16px;align-items:flex-start;gap:12px" data-a="confirmStart" data-x="${n.oid}"><div style="flex:1"><div style="font-size:14.5px;font-weight:700">${n.t}</div><div style="font-size:13px;color:var(--ink2);margin-top:2px">${n.b}</div><div class="meta">방금</div></div></button>`).join('') : `<div class="empty"><div class="big">${I.bell}</div><h4>새 알림이 없어요</h4></div>`}` } };
Object.assign(A, {
  confirmStart(id) { // 홈 카드 · 알림 · 주문 내역에서
    const o = ordOf(id); closeOv(); if (!o) { render(); return }
    if (o.confirmed) { go('orders'); return }
    const p = PB[o.pid];
    modal(`<h4>구매를 확정할까요?</h4><p>${p.name} ${o.size}. 확정하면 반품 · 교환은 고객센터로 문의해야 해요</p><div class="mb"><button class="btn line" data-a="closeOv">취소</button><button class="btn" data-a="confirmOk" data-x="${o.id}">구매 확정</button></div>`);
    S.ov.node = '③ 구매 이후 · 입어 봤나? → 구매 확정'; render();
  },
  confirmOk(id) {
    const o = ordOf(id), p = PB[o.pid]; o.confirmed = true; closeOv();
    modal(`<h4>내 옷장에 담아 둘까요?</h4><p>${p.name} ${o.size}이 잘 맞았다면 옷장에 담아 두세요. 다른 상품을 볼 때 이 옷과 겹쳐서 사이즈를 비교해요</p><div class="mb"><button class="btn line" data-a="ordLater" data-x="${o.id}">나중에</button><button class="btn" data-a="ordAdd" data-x="${o.id}">옷장에 담기</button></div>`);
    S.ov.node = '③ 구매 확정 → 잘 맞는 옷인가? → 내 옷장에 담을까?'; render();
  },
  ordLater() { closeOv(); toast('구매를 확정했어요 · 주문 내역에서 언제든 옷장에 담을 수 있어요'); render() },
  ordAdd(id) { const o = ordOf(id); closeOv(); if (!o || inCloset(o)) { render(); return } toast(addToCloset(o)); render() },
  orderReturn(id) {
    const o = ordOf(id); closeOv();
    modal(`<h4>반품 · 교환을 신청할까요?</h4><p>${PB[o.pid].name} ${o.size}. 회수 기사님이 방문해요</p><div class="mb"><button class="btn line" data-a="closeOv">취소</button><button class="btn" data-a="orderReturnOk" data-x="${o.id}">신청하기</button></div>`);
    S.ov.node = '⑥ 주문 내역 · 반품 · 교환 신청'; render();
  },
  orderReturnOk(id) { ordOf(id).returned = true; closeOv(); toast('반품 · 교환 신청을 접수했어요'); render() },
  pushOpen() { const oid = S.push.oid; S.push = null; need('로그인이 만료됐어요. 다시 로그인하면 이어서 해요', () => { closeOv(); A.confirmStart(oid) }) },
});
app.addEventListener('click', (e) => { const el = e.target.closest('[data-a]'); if (!el || !app.contains(el)) return; const f = A[el.dataset.a]; if (f) { f(el.dataset.x); } });
app.addEventListener('input', (e) => { if (e.target.dataset.in === 'search') { const p = cur().p; p.q = e.target.value; clearTimeout(A.qh); A.qh = setTimeout(() => { const pos = e.target.selectionStart; render(); const q = document.getElementById('q'); if (q) { q.focus(); q.setSelectionRange(pos, pos) } }, 250) } });
/* 데모 패널 */
app.addEventListener('input', (e) => {
  if (!e.target.classList.contains('fin')) return;
  const q = e.target.value.trim(), x = app.querySelector('.fx'); if (x) x.hidden = !q;
  const sg = app.querySelector('#sugg'), fh = app.querySelector('#fhome'); if (!sg) return;
  const t = q.replace(/\s/g, '');
  const hits = t ? KW.filter((k) => k.replace(/\s/g, '').includes(t)).slice(0, 8) : [];
  sg.innerHTML = hits.map((k) => `<button class="sg" data-a="findDo" data-x="${k}">${I.search}<span>${k.replace(q, `<b>${q}</b>`)}</span></button>`).join('') + (t && !hits.length ? `<button class="sg" data-a="findDo" data-x="${esc(q)}">${I.search}<span>'<b>${esc(q)}</b>' 검색</span></button>` : '');
  if (fh) fh.hidden = !!t;
});
/* 데모 패널 */
app.addEventListener('keydown', (e) => { if (e.target.classList.contains('fin') && e.key === 'Enter') { e.preventDefault(); A.findDo(e.target.value) } });
document.getElementById('page').addEventListener('click', (e) => {
  const el = e.target.closest('[data-d]'); if (!el) return; const d = el.dataset.d;
  if (d === 'toggle') { document.getElementById('demo').classList.toggle('open'); return }
  if (d.startsWith('p:')) { reset(d.slice(2)); render(true); homePopupCheck(); render(); return }
  if (d === 'restart') { reset(S.preset); nav = [{ s: 'splash', p: {} }]; render(true); setTimeout(() => { if (cur().s === 'splash') A.splashGo() }, 1600); return }
  if (d === 'failpay') { S.failNext = !S.failNext; render(); return }
  if (d === 'popup') { S.popupSeen = false; tab('home'); homePopupCheck(); render(); return }
  if (d === 'deliver') { demoDeliver(); return }
  if (d.startsWith('c:')) { focusGo(d.slice(2)); return }
  if (d.startsWith('x:')) { scenario(d.slice(2)); return }
  if (d.startsWith('f:')) {
    const f = d.slice(2); closeOv();
    if (f === 'home') tab('home');
    else if (f === 'detail') { tab('home'); go('detail', { id: 'p16' }) }
    else if (f === 'order') { tab('home'); go('detail', { id: 'p16' }); setTimeout(() => A.toSize(), 60) }
    else if (f === 'reg') { tab('closet'); startReg(null, 'closet') }
    else if (f === 'closet') A.tab('closet');
    else if (f === 'my') tab('my');
    else if (f === 'photo') { if (!S.user) reset('nobase'); tab('closet'); S.reg = { cat: 'top', from: 'closet', m: null }; go('regType'); modOpen('top') }
    else if (f === 'login') { if (S.user) { toast('비회원 상태에서 볼 수 있어요 · 위에서 "비회원"을 눌러 주세요'); render() } else need('로그인이 필요한 기능을 누르면 이 시트가 떠요', () => { closeOv(); render() }) }
  }
});
function fit() { const k = Math.min(1, (window.innerHeight - 40) / 844); document.documentElement.style.setProperty('--k', k.toFixed(3)) }
window.addEventListener('resize', fit); fit();
function scenario(k) {
  if (!S.user) reset('full');
  closeOv(); let c = null;
  if (k === 'nophoto') { c = item({ name: '린넨 셔츠', cat: 'top', sub: '긴팔 셔츠', size: 'L', m: [73, 50, 57, 60], fit: 'good', src: '직접 입력' }); S.closet.push(c); tab('closet'); toast('사진 없는 옷을 상의에 추가했어요') }
  if (k === 'pending') { S.pending.push(item({ img: 'knit', brand: '더니트컴퍼니', name: '[스토커즈 콜라보] 워셔블 에센셜 크루넥 니트', cat: 'top', sub: '긴팔 티셔츠', size: 'L', m: [68, 54, 63, 58], src: '상품 링크' }), item({ img: 'denim', brand: '아워데이즈', name: '[젠플록스X아워데이즈] 세미 커브드 데님 팬츠', cat: 'bottom', sub: '긴바지', size: '31', m: [42, 31, 33, 76, 105], src: '구매내역 캡처' })); tab('closet'); toast('등록 대기 2벌 · 위 배너를 눌러 핏을 알려 주세요') }
  render(); return c;
}
function focusGo(f) {
  closeOv();
  if (!S.user || (!['home', 'reg'].includes(f) && !baseOf('top'))) reset('full');
  const b = baseOf('top'), at = (c) => { tab('closet'); replace('closet', { t: c.cat }); go('item', { id: c.id }) };
  const other = S.closet.find((c) => c.cat === 'top' && c.fit === 'good' && !c.base);
  if (f === 'home') tab('closet');
  else if (f === 'item') at(b);
  else if (f === 'baseChange') { at(other); A.setBase(other.id) }
  else if (f === 'sub') { const k = S.closet.find((c) => c.cat === 'top' && c.fit === 'good' && !c.base && c.sub && !c.subBase) || other; at(k); A.setSubBase(k.id) }
  else if (f === 'edit') { at(b); go('edit', { id: b.id }) }
  else if (f === 'editCat') { at(b); go('edit', { id: b.id }); A.editCat('bottom') }
  else if (f === 'photo') { let c = S.closet.find((q) => !q.img); if (!c) { c = scenario('nophoto') } at(c); A.photoAdd(c.id + '|item') }
  else if (f === 'del') { at(b); A.delItem(b.id) }
  else if (f === 'reg') { tab('closet'); startReg(null, 'closet') }
}
reset('guest'); nav = [{ s: 'splash', p: {} }]; render(true); setTimeout(() => { if (cur().s === 'splash') A.splashGo() }, 1600);
