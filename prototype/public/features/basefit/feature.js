/* ── 신기능 #17 내 옷 기준 추천: 홈 추천 섹션 · 랭킹 "기준 옷" 필터 ──
   제안서 docs/proposals/내-옷-기준-추천.md (PR #7) · 이슈 https://github.com/jincode93/DANGJANG/issues/17
   원본: 팀원(juribb) 데모 claude.ai/artifact/SQxjvVpb7hYjDT2DcxTcYu (통합 데모 v14 복제본). 규칙은 그대로 옮기고, 완료본과 맞물리는 곳만 고침
     - 홈 추천과 랭킹 필터는 토글 하나. 고른 기준 옷(S.simB)은 둘이 같이 씀
     - 홈 섹션 모양은 완료본 v15(피그마 home_01 · home_02)에 있던 것을 그대로 옮김. 그 섹션은 완료본에서 뺐음
     - 공통 규칙: 상세와 같은 계산(recOf, 품절 사이즈 빼고)의 추천 사이즈 판정이 '비슷해요'인 상품만, 퍼센트 없음(REC-05)
     - 랭킹 순위 숫자는 필터 전 그 목록의 순위 (데모는 전체 상품 순위)
     - 비회원이 칩을 누르면 로그인, 기준 옷이 없으면 옷 등록 (제안서 가안. 데모에는 없음)
     - 데모의 랭킹 기간 칩 · 시트, 스크롤하면 접히는 필터 줄은 #17 범위 밖이라 안 가져옴 */
(() => {
const SIM_MAX = 6; // 홈에서 가로로 보여 줄 최대 개수, 넘으면 전체보기
const bases = () => S.closet.filter((c) => c.base);
// 상품 x가 기준 옷 b와 맞나: 같은 세부 종류 · 옷장에 없는 상품 · 추천 사이즈 판정이 '비슷해요'면 { k: 추천 사이즈 }
const simOf = (x, b) => {
  if (!x.sizes || x.cat !== b.cat || subOf(x) !== subOf(b) || S.closet.some((c) => c.pid === x.id)) return null;
  const best = recOf(x, b); if (!best) return null; // 모든 사이즈 품절
  return fitWord(x, b, best.k) === '비슷해요' ? { k: best.k } : null;
};
const row = (c) => `<span class="simpic">${cutPic(c)}</span><span class="simtx"><b>${c.name}</b><small>${CAT[c.cat]} · ${c.size} Size</small></span>`;
const ICO_INFO = '<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#C4C4C4"/><path d="M8 4v5" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><circle cx="8" cy="11.6" r="1" fill="#fff"/></svg>';

/* 홈 추천 탭: ○○님 옷장 기준으로 골랐어요 */
function homeRec() {
  const bs = bases(); if (!S.user || !bs.length) return '';
  const b = bs.find((c) => c.id === S.simB) || bs[0], open = !!S.simDD;
  const items = P.slice().sort((x, y) => y.rev - x.rev).map((x) => ({ x, s: simOf(x, b) })).filter((e) => e.s); // 랭킹 순서 그대로
  return `<div class="sec simsec"><h3>${S.user.name}님 옷장 기준으로 골랐어요</h3><button class="simi" data-a="simTip">랭킹 상품 기준${ICO_INFO}</button>
    ${S.simTip ? `<div class="simtip" role="tooltip">기준 옷을 고르면 랭킹 상품 중<br>실측이 가까운 상품을 보여드려요.<button data-a="simTip" aria-label="닫기">${I.close}</button></div>` : ''}</div>
  <div class="simdd ${open ? 'open' : ''}"><button class="simbox" data-a="simOpen" aria-expanded="${open}">${row(b)}<span class="simarr">${I.down}</span></button>
    ${open ? `<div class="simlist" role="listbox">${bs.map((c) => `<button class="simopt ${c.id === b.id ? 'on' : ''}" role="option" aria-selected="${c.id === b.id}" data-a="simPick" data-x="${c.id}">${row(c)}${c.id === b.id ? `<span class="simchk">${I.check}</span>` : ''}</button>`).join('')}</div>` : ''}</div>
  ${items.length ? `<div class="hscroll">${items.slice(0, SIM_MAX).map(({ x, s }) => `<button class="card pcard" data-a="detail" data-x="${x.id}"><div class="img"><img src="${IMG[x.img]}" alt=""></div>${cardBody(x)}<span class="szchip">추천 사이즈 ${s.k}</span><div class="pfit">비슷해요</div></button>`).join('')}${items.length > SIM_MAX ? `<button class="pmore" data-a="simAll" data-x="${b.id}">전체보기${I.chev}</button>` : ''}</div>`
    : '<div class="simnone">지금 맞는 상품이 없어요</div>'}`;
}
// 드롭다운이 펼쳐진 동안 바깥을 누르면 목록만 닫음 (다른 버튼은 눌리지 않음)
document.getElementById('app').addEventListener('click', (e) => {
  if (!S.simDD || e.target.closest('.simdd')) return;
  e.stopPropagation(); e.preventDefault(); S.simDD = false; saveY(); render();
}, true);

/* 랭킹 탭: 기준 옷 칩 · 시트. p.rm = 켬, 비교할 옷은 rankBase */
// 홈 · 시트에서 고른 옷이 지금 1 · 2뎁스와 맞으면 그 옷, 아니면 그 종류 기준 옷 중 맞는 상품이 가장 많은 옷. 없으면 필터가 풀림
function rankBase(list, p) {
  const ck = CATK.find((c) => CAT[c] === p.rc), rs = p.rs || '전체'; if (!p.rm || !ck) return null;
  const bs = bases().filter((c) => c.cat === ck && (rs === '전체' || c.sub === rs));
  const hit = (b) => list.filter((x) => simOf(x, b)).length;
  return bs.find((c) => c.id === S.simB) || bs.sort((a, b) => hit(b) - hit(a))[0] || null;
}
DJ.feature({
  id: 'basefit', issue: 17, name: '내 옷 기준 추천', proposal: 'docs/proposals/내-옷-기준-추천.md',
  onboard: [["홈에서 바로 추천", "내 옷과 실측이 가까운<br>랭킹 상품을 골라드려요", "비교할 내 옷을 바꾸면 상품도 바로 바뀌어요.<br>품절 사이즈는 빼고 보여 드려요.", 282, "features/basefit/onboard.webp"]],
  actions: {
    simOpen() { S.simDD = !S.simDD; saveY(); render() },
    simPick(id) { S.simB = id; S.simDD = false; saveY(); render() },
    simTip() { S.simTip = !S.simTip; render() },
    simAll(id) { const b = S.closet.find((c) => c.id === id); S.simB = id; replace('home', { t: '랭킹', rc: CAT[b.cat], rs: SUB[b.cat].includes(b.sub) ? b.sub : '전체', rm: 1 }) }, // 그 옷이 선택된 랭킹
    rankBaseOpen() {
      if (!S.user) { need('로그인하면 내 기준 옷과 맞는 상품만 볼 수 있어요', () => { closeOv(); A.rankBaseOpen() }); return }
      const p = cur().p, ck = CATK.find((c) => CAT[c] === p.rc);
      if (!bases().length) { startReg(ck || null, 'home'); return }
      const on = p.rm && S.closet.find((c) => c.id === S.rankB);
      sheet(`<div class="grab"></div><div class="sh-t">기준 옷 선택</div><div class="rsh-d">고른 옷과 실측이 비슷한 상품만 랭킹에서 보여드려요</div>
        <button class="rro ${on ? '' : 'on'}" role="radio" aria-checked="${!on}" data-a="rankAll"><b>선택 안 함 · 전체 상품</b><span class="rrad"></span></button>
        ${bases().map((c) => `<button class="rro ${on && on.id === c.id ? 'on' : ''}" role="radio" aria-checked="${!!on && on.id === c.id}" data-a="rankBasePick" data-x="${c.id}"><span class="simpic">${cutPic(c)}</span><span><b>${c.name}</b><small>${CAT[c.cat]} · ${c.size} Size</small></span><span class="rrad"></span></button>`).join('')}
        <button class="rsh-add" data-a="rankReg" data-x="${ck || ''}">+ 옷 등록하기</button>`); render();
    },
    rankBasePick(id) { closeOv(); const c = S.closet.find((x) => x.id === id); S.simB = id; replace('home', Object.assign({}, cur().p, { rm: 1, rc: CAT[c.cat], rs: SUB[c.cat].includes(c.sub) ? c.sub : '전체' })) }, // 고른 옷의 대분류 · 세부 종류까지 함께 선택
    rankAll() { closeOv(); replace('home', Object.assign({}, cur().p, { rm: 0 })) },
    rankReg(ck) { closeOv(); startReg(ck || null, 'home') },
  },
  slots: {
    'home.rec': homeRec,
    'rank.filter': (list, p) => {
      const b = rankBase(list, p); S.rankB = b && b.id; // 시트에서 선택 표시용
      return `<div class="rsel">${b ? `<span class="fchip on"><button class="fct" data-a="rankBaseOpen"><span class="simpic">${cutPic(b)}</span><span>${b.name}</span></button><button class="fchx" data-a="rankAll" aria-label="기준 옷 해제">${I.close}</button></span>`
        : `<button class="fchip" data-a="rankBaseOpen">기준 옷${I.down}</button>`}</div>`;
    },
    'rank.list': (list, p) => {
      const b = rankBase(list, p); if (!b) return '';
      const rows = list.map((x, i) => ({ x, n: i + 1, s: simOf(x, b) })).filter((r) => r.s);
      if (!rows.length) return `<div class="rempty">지금 이 옷과 맞는 ${p.rs === '전체' ? p.rc : p.rs} 상품이 없어요<button class="rall" data-a="rankAll">전체 상품 보기</button></div>`;
      return lazyGrid(`rankfit:${b.id}:${p.rs}:${p.rp}`, rows, (r) => rankCard(r.x, r.n).replace(/<\/button>$/, `<div class="pfit">추천 ${r.s.k} · 비슷해요</div></button>`), 'grid3r');
    },
  },
});
})();
