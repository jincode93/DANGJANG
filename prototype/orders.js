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
    m: p.sizes && p.sizes[o.size] ? p.sizes[o.size].slice() : partsOf(p).map(() => null), fit: 'good', src: 'Layr 구매' });
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
