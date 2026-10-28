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
    ${S.simTip ? `<div class="simtip" role="tooltip">비교할 내 옷을 고르면 랭킹 상품 중<br>실측이 가까운 상품을 보여드려요.<button data-a="simTip" aria-label="닫기">${I.close}</button></div>` : ''}</div>
  <div class="simdd ${open ? 'open' : ''}"><button class="simbox" data-a="simOpen" aria-expanded="${open}">${row(b)}<span class="simarr">${I.down}</span></button>
    ${open ? `<div class="simlist" role="listbox">${bases.map((c) => `<button class="simopt ${c.id === b.id ? 'on' : ''}" role="option" aria-selected="${c.id === b.id}" data-a="simPick" data-x="${c.id}">${row(c)}${c.id === b.id ? `<span class="simchk">${I.check}</span>` : ''}</button>`).join('')}</div>` : ''}</div>
  ${items.length ? `<div class="hscroll">${items.map(({ x, k, pct }) => `<button class="card pcard" data-a="detail" data-x="${x.id}"><div class="img"><img src="${IMG[x.img]}" alt=""></div><div class="br" style="margin-top:8px">${x.brand}</div><div class="nm">${x.name}</div><div class="price">${x.dc ? `<em>${x.dc}%</em>` : ''}${won(sale(x))}원</div><span class="szchip">${CAT[x.cat]} · ${k} Size</span><div class="pfit">${pct}% 비슷해요</div></button>`).join('')}<button class="pmore" data-a="homeTab" data-x="랭킹">전체보기${I.chev}</button></div>`
    : `<div class="simnone">아직 이 옷과 실측이 가까운 ${b.sub || CAT[b.cat]} 랭킹 상품이 없어요</div>`}`;
}
// 홈을 내리면 검색창 대신 헤더 돋보기 · 맨 위로 버튼 (home_02)
document.addEventListener('scroll', (e) => { const b = e.target; if (b.classList && b.classList.contains('body')) b.parentElement.classList.toggle('scrolled', b.scrollTop > 120) }, true);
Object.assign(A, {
  simTip() { S.simTip = !S.simTip; render() },
  toTop() { const b = document.querySelector('#view .body'); if (b) b.scrollTo({ top: 0, behavior: 'smooth' }) },
});
