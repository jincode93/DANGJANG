/* ── 유저테스트 모드 (Maze 과제 링크용) ──
   주소 끝에 #test.상태.시작[.옵션] 을 붙이면 데모 패널을 숨기고 그 상태 · 화면에서 바로 시작해요.
   상태  persona 유저테스트 가상 인물 하늘 · nobase 빈 옷장 · mine 앞 과제에서 등록한 내 옷장(없으면 빈 옷장) · guest · full · many
   시작  home · closet · reg(옷 등록) · search · my · cart · 상품 id(p17 …) · rv-상품 id(후기 목록)
   옵션  nocmp 내 옷 비교를 숨김(비교 없는 기준 조건) · pop 홈 팝업 보이기 · t과제(tB, tC1 …) 완료 코드의 과제 이름
   과제 완료 코드 (Maze 무료판은 웹사이트 테스트가 없어, 참가자가 이 코드를 Maze 질문에 붙여 넣음)
     과제-대상-값-C?R?-초   예) B-p17-L-C1R2-42
     대상 · 값: 상품 id · 고른 사이즈 | edit · 저장한 소매 길이 | reg · 등록 사이즈_허리
     C 비교 그림을 화면에서 봤나(1/0) · R 후기 0 안 봄 1 상세의 후기 영역 봄 2 후기 목록 · 상세를 엶 · 초 = 시작부터 걸린 시간
   예) #test.nobase.reg  #test.mine.p17  #test.mine.p12.nocmp
   Maze는 과제마다 링크를 새로 열어서, 등록한 옷장은 이 브라우저에 저장해 다음 과제(mine)로 이어 줘요 */
const TEST_KEY = 'layrTestCloset';
const TEST_LINKS = [ // 가상 인물 '하늘'(persona) 옷장으로 시작. t○ = 과제 이름 (완료 코드 맨 앞에 붙음)
  ['B · 후기 많음 · 긴소매 티 2팩 (정답 L)', 'test.persona.p17.tB'],
  ['C1 · 후기 적음 · 롱슬리브 티, 비교 없이 (정답 M)', 'test.persona.p12.nocmp.tC1'],
  ['C2 · 후기 적음 · 롱슬리브 티, 비교 켜고 (정답 M)', 'test.persona.p12.tC2'],
  ['D · 후기 충돌 · 데님 (정답 30)', 'test.persona.p14.tD'],
  ['E · 열린 쇼핑 · 셔츠 장바구니에 담기', 'test.persona.home.tE'],
  ['F · 옷장에서 소매 60cm로 고치기', 'test.persona.closet.tF'],
  ['G · 바지 등록 (30 · 허리 41)', 'test.persona.reg.tG'],
];
function testParse(raw) {
  const cfg = String(raw || '').split('~')[0], t = cfg.split('.');
  if (t[0] !== 'test') return null;
  return { cfg, state: t[1] || 'nobase', start: t[2] || 'home', nocmp: t.includes('nocmp'), pop: t.includes('pop'), task: (t.find((x) => /^t[A-Z]\d?$/.test(x)) || 'tX').slice(1) };
}
let TEST = (() => { try { const q = new URLSearchParams(location.search).get('test'); return testParse(decodeURIComponent(location.hash.slice(1))) || (q ? testParse('test.' + q) : null); } catch (e) { return null; } })();
function testSave() { try { localStorage.setItem(TEST_KEY, JSON.stringify({ closet: S.closet, firstReg: S.firstReg, coupons: S.coupons })); } catch (e) { } }
function testLoad() { try { return JSON.parse(localStorage.getItem(TEST_KEY) || 'null'); } catch (e) { return null; } }
const TT = { t0: Date.now(), c: 0, r: 0 }; // 과제 기록: 시작 시각 · 비교 그림을 봤나 · 후기를 봤나
function testMark() {
  const box = view.getBoundingClientRect(), vis = (sel) => { const e = view.querySelector(sel); if (!e) return false; const r = e.getBoundingClientRect(); return r.top < box.bottom - 60 && r.bottom > box.top + 60; };
  if (vis('.pd-stage') || vis('.pd-txt')) TT.c = 1;
  if (['reviews', 'review'].includes(cur().s)) TT.r = 2; else if (vis('#s_rev .rv-card') || vis('#s_rev .rv-note')) TT.r = Math.max(TT.r, 1);
}
function testDone(kind, val, msg) { // 과제 완료 코드 보여 주기
  const code = [TEST.task, kind, val, 'C' + TT.c + 'R' + TT.r, Math.round((Date.now() - TT.t0) / 1000)].join('-');
  modal(`<h4>과제를 마쳤어요</h4><p>${msg}. 아래 코드를 복사해 Maze 질문 화면에 붙여 넣어 주세요</p><input class="tcode" readonly value="${code}" aria-label="과제 완료 코드"><div class="mb"><button class="btn line" data-a="closeOv">닫기</button><button class="btn" data-a="testCopy" data-x="${code}">코드 복사</button></div>`);
  S.ov.node = '유저테스트 · 과제 완료 코드'; render();
}
function testAfter() { // render 끝에서: 옷장 저장 + 화면마다 주소 바꾸기 + 본 것 기록
  testSave(); testMark();
  const b = view.querySelector('.body'); if (b) b.addEventListener('scroll', testMark, { passive: true });
  const c = cur(), r = c.s + (c.p && c.p.id ? '-' + c.p.id : '');
  try { history.replaceState(null, '', '#' + TEST.cfg + '~' + r); } catch (e) { }
}
function testStart() {
  if (!TEST) return false;
  document.body.classList.add('testmode'); document.body.classList.toggle('nocmp', TEST.nocmp);
  reset(PRESETS[TEST.state] ? TEST.state : 'nobase');
  if (TEST.state === 'mine') {
    const sv = testLoad();
    if (sv && sv.closet) { S.closet = sv.closet; S.firstReg = sv.firstReg; if (sv.coupons) S.coupons = sv.coupons; uid = Math.max(uid, ...S.closet.map((c) => +String(c.id).slice(1) || 0)) + 1; }
  } else { try { localStorage.removeItem(TEST_KEY); } catch (e) { } }
  S.popupSeen = !TEST.pop; Object.assign(TT, { t0: Date.now(), c: 0, r: 0 });
  const s = TEST.start, pid = s.replace(/^rv-/, '');
  if (PB[pid]) { nav = [{ s: 'home', p: {} }, { s: 'detail', p: { id: pid } }]; if (s.startsWith('rv-')) nav.push({ s: 'reviews', p: { id: pid } }); }
  else if (s === 'reg') { nav = [{ s: 'closet', p: {} }]; render(true); startReg(null, 'closet'); return true; }
  else nav = [{ s: ['home', 'closet', 'search', 'my', 'cart'].includes(s) ? s : 'home', p: {} }];
  render(true); homePopupCheck(); render(); return true;
}
function testLinks() { // 데모 패널: 과제별 링크 (아티팩트 주소 뒤에 붙여 Maze 과제에 넣기)
  const el = document.getElementById('testLinks'); if (!el) return;
  el.innerHTML = TEST_LINKS.map(([t, k]) => `<div class="tl"><span>${t}</span><span class="tlr"><input readonly value="#${k}" aria-label="${t} 링크 끝부분"><button data-tl="copy" data-x="${k}">복사</button><button data-tl="try" data-x="${k}">미리 보기</button></span></div>`).join('');
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-tl]'); if (!b) return; const k = b.dataset.x;
    if (b.dataset.tl === 'try') { TEST = testParse(k); testStart(); return; }
    const inp = b.parentNode.querySelector('input'), done = () => { b.textContent = '복사됨'; setTimeout(() => { b.textContent = '복사'; }, 1500); };
    try { navigator.clipboard.writeText('#' + k).then(done, () => { inp.select(); }); } catch (err) { inp.select(); }
  });
}
// 테스트 모드에서는 결정 · 저장 · 등록 순간에 주문 · 화면 이동 대신 완료 코드를 보여 줌
const A0 = { optGo: A.optGo, saveEdit: A.saveEdit, regSave: A.regSave };
Object.assign(A, {
  optGo(mode) {
    const o = S.ov; if (!TEST || !o || !o.items || !o.items.length) return A0.optGo(mode);
    const it = o.items[o.items.length - 1], p = PB[o.pid]; closeOv();
    testDone(p.id, it.size, mode === 'cart' ? `${p.name} ${it.size} 사이즈를 장바구니에 담았어요` : `${it.size} 사이즈로 결정했어요`);
  },
  saveEdit(id) { A0.saveEdit(id); if (TEST && cur().s !== 'edit') { /* 입력 오류로 저장이 안 됐으면(수정 화면에 남음) 코드 없음 */ const c = S.closet.find((q) => q.id === id); testDone('edit', c ? c.m[3] : 'na', '정보를 저장했어요'); } },
  regSave() { A0.regSave(); if (TEST) { const c = S.closet[S.closet.length - 1]; closeOv(); testDone('reg', c ? c.size + '_' + c.m[0] : 'na', '옷장에 등록했어요'); } },
  testCopy(code) {
    const inp = app.querySelector('.tcode'), ok = () => { toast('코드를 복사했어요'); render(); };
    try { navigator.clipboard.writeText(code).then(ok, () => { inp && inp.select(); }); } catch (e) { inp && inp.select(); }
  },
});

// 유저테스트 후기 조건 (reviews.js 의 예시 후기에 덧붙임): p11 · p12 신상(후기 2개), p17 무신사 기준 상품
Object.assign(RV_FIX, {
  p11: [
    { id: 'mina***', woman: true, h: 163, w: 52, u: 'S', b: 'S', fit: 2, star: 4, len: '길어요', thick: '적당해요', text: '여자 S 기준으로는 꽤 커요. 안에 니트 입어도 여유 있고 엉덩이를 살짝 덮어요. 가볍고 따뜻해요' },
    { id: 'dw***', h: 181, w: 79, u: 'XL', b: 'L', fit: 1, star: 5, len: '적당해요', thick: '얇아요', text: 'XL가 없어서 L 샀는데 다행히 맞아요. 대신 안에 두꺼운 건 못 입겠어요' },
  ],
  p12: [ // 유저테스트 '후기 적음' 조건 (참가자가 등록한 긴팔 상의와 비교)
    { id: 'seo***', h: 174, w: 66, u: 'M', b: 'M', fit: 2, star: 5, len: '길어요', text: '오버핏이라 평소 M인데도 넉넉해요. 소매가 손등을 덮어요. 색감은 사진이랑 같아요' },
    { id: 'kj***', woman: true, h: 165, w: 55, u: 'S', b: 'M', fit: 2, star: 4, len: '길어요', text: 'S가 없어서 M 샀는데 원피스처럼 길어요. 남자분들은 정사이즈로 사도 될 것 같아요' },
  ],
});
Object.assign(RV_ONLY, { p11: true, p12: true }); RV_N.p17 = 24;
