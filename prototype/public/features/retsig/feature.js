/* ── 신기능 #20 반품 · 교환 실패 사유 활용: 사이즈 사유의 부위 신호 → 자동 비교 알림 ──
   제안서 docs/proposals/반품-교환-실패-활용.md (PR #10) · 이슈 https://github.com/jincode93/DANGJANG/issues/20
   제안서의 안 A만 옮김. 추천 사이즈 · 비교 순서는 그대로 두고 알림만 붙임
     - 반품 · 교환 신청 모달에서 사유 "사이즈가 안 맞아요"를 고르면, 따로 동의(PRIV-01)를 받은 뒤 부위 하나와 컸어요/작았어요를 고름
     - 남기는 것은 세부 종류 · 사이즈 · 부위 · 방향뿐. 옷장에 옷으로 담지 않음(CLO-01, CLO-04)
     - 상품 상세에서 지금 보는 상품의 세부 종류와 신호의 세부 종류가 같고, 기준 옷이 다른 세부 종류일 때(데모에서 자동 비교에 해당)만 알림
     - 같은 세부 종류 신호가 여러 건이면 가장 최근 것 (제안서 '아직 모르는 것')
     - 원본 데모(claude.ai/artifact/GtepJLiQemk3t6wLya6Jx9)의 '아쉬운 옷' 비교는 CLO-01과 부딪혀 제안서처럼 안 가져옴 */
(() => {
const WHY = [['size', '사이즈가 안 맞아요'], ['mind', '단순 변심'], ['bad', '상품 불량 · 오배송']];
const sigs = () => S.retSig || (S.retSig = []); // reset()이 S를 새로 만들면 신호도 지워짐
const rs = (o) => (S.rs && S.rs.oid === o.id ? S.rs : (S.rs = { oid: o.id }));
const chips = (a, list, on) => `<div class="cchips rs-chips">${list.map(([k, t]) => `<button class="${k === on ? 'on' : ''}" data-a="${a}" data-x="${k}">${t}</button>`).join('')}</div>`;
const sub = (p) => p.sub || SUBS[subOf(p)].n;

function form(o) {
  const p = PB[o.pid], r = rs(o);
  let h = `<div class="rs-q">반품 · 교환 사유</div>${chips('rsWhy', WHY, r.why)}`;
  if (r.why !== 'size') return h;
  if (r.ok == null) return h + `<div class="rs-ok"><b>어느 부위가 안 맞았는지 남길까요?</b><p>다음에 ${sub(p)} 상품을 볼 때 알려 드려요. 남기지 않아도 신청은 그대로 돼요</p>
    <div class="rs-okb"><button data-a="rsOk" data-x="0">남기지 않을게요</button><button class="on" data-a="rsOk" data-x="1">동의하고 남기기</button></div></div>`;
  if (!r.ok) return h + '<p class="rs-note">부위는 남기지 않아요</p>';
  return h + `<div class="rs-q">어느 부위가 안 맞았나요?</div>${chips('rsPart', partsOf(p).map((k) => [k, PART_N[k]]), r.part)}
    ${r.part ? `<div class="rs-q">${PART_N[r.part]}가</div>${chips('rsDir', [['big', '컸어요'], ['small', '작았어요']], r.dir)}` : ''}`;
}
const pick = (k, v) => { const o = ordOf(S.rs.oid); S.rs[k] = v; A.orderReturn(o.id) }; // 모달을 다시 그림

function alert(p, base) {
  if (!base || base.sub === p.sub) return '';
  const s = sigs().find((x) => x.cat === p.cat && x.sub === sub(p)); if (!s) return '';
  return `<div class="rs-alert"><b>${s.sub}에서 반품 · 교환한 적이 있어요</b>
    <p>그때 ${s.size} 사이즈는 ${PART_N[s.part]}가 ${s.dir === 'big' ? '컸어요' : '작았어요'}. 지금은 ${sub(base)} 기준 옷과 비교한 결과예요</p>
    <button class="pd-link hit" data-a="reg" data-x="${p.cat}|${p.id}">${s.sub} 기준 옷 등록하기${I.chev}</button></div>`;
}
// 시연용: 배송 완료된 주문 하나 (긴팔 티셔츠 p12)
const order = () => { const o = { id: 'o' + (S.orders.length + 1), pid: 'p12', size: 'L', delivered: true, confirmed: false, cid: null }; S.orders.unshift(o); return o };

DJ.feature({
  id: 'retsig', issue: 20, name: '반품 · 교환 실패 사유 활용', proposal: 'docs/proposals/반품-교환-실패-활용.md',
  actions: {
    rsWhy(k) { pick('why', k) },
    rsOk(k) { pick('ok', k === '1') },
    rsPart(k) { S.rs.dir = null; pick('part', k) },
    rsDir(k) { pick('dir', k) },
  },
  slots: {
    'order.return': form,
    'order.returned': (o) => {
      const r = S.rs && S.rs.oid === o.id ? S.rs : {}, p = PB[o.pid]; S.rs = null;
      if (r.why !== 'size' || !r.ok || !r.part || !r.dir) return '';
      sigs().unshift({ cat: p.cat, sub: sub(p), size: o.size, part: r.part, dir: r.dir });
      return ' · 안 맞은 부위를 남겼어요';
    },
    'detail.size': alert,
  },
  panel: [
    ['배송 완료 주문 → 반품 · 교환 신청', () => { reset('full'); const o = order(); tab('my'); go('orders'); A.orderReturn(o.id) }],
    ['어깨가 컸던 신호 남긴 뒤 같은 종류 상품', () => { reset('full'); order().returned = true; sigs().push({ cat: 'top', sub: '긴팔 티셔츠', size: 'L', part: '어깨', dir: 'big' }); tab('home'); go('detail', { id: 'p12', tab: 'size' }) }],
  ],
});
})();
