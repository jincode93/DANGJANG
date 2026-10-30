/* ── 신기능 #20 반품 · 교환 실패 사유 활용: 주문 상세 · 반품 · 교환 신청과 반품 기록으로 추천 사이즈 ──
   제안서 docs/proposals/반품-교환-실패-활용.md (PR #10) · 이슈 https://github.com/jincode93/DANGJANG/issues/20
   원본: 팀원(juribb) 데모 claude.ai/artifact/GtepJLiQemk3t6wLya6Jx9 의 '④ 구매 후 · 반품·교환 (유저 플로우 4-6 ~ 4-12)'와
   '반품 기록으로 추천 사이즈'. 화면 · 문구 · 규칙은 그대로 옮기고, 완료본과 맞물리는 곳만 고침
     - 완료본은 구매 확정 뒤에만 옷장에 담음 → 반품 · 교환 신청은 옷장을 건드리지 않음 (원본은 옷장 옷을 빼거나 사이즈를 바꿈)
     - 원본의 '아쉬운 옷'(fit: 'bad')은 완료본에 없고 CLO-01과 부딪혀 안 가져옴. 추천에는 반품 · 교환 기록만 씀
     - 원본의 '입어 보셨나요?'(핏 알려 주기) 줄은 완료본의 구매 확정 흐름과 겹쳐 뺌. 구매 옵션 시트의 '추천' 표시는 안 가져옴
     - 반품 · 교환 신청이 있으면 완료본 o.returned도 켬 (완료본 버튼 · 홈 배송 카드가 숨음) */
(() => {
const D = { dlv: '10월 13일', due: '10월 20일', pick: '10월 15일' };
const RSN = ['사이즈가 안 맞아요', '색상·소재가 생각과 달라요', '단순 변심', '불량·오배송'];
const RPARTS = { top: ['어깨', '가슴', '총장', '소매'], outer: ['어깨', '가슴', '총장', '소매'], bottom: ['허리', '허벅지', '밑위', '총장'] };
/* 부위별 방향 단어: [지난 기록-큼, 지난 기록-작음, 작은 쪽, 큰 쪽] */
const RX_W = { 총장: ['길었던', '짧았던', '짧아요', '길어요'], 소매: ['길었던', '짧았던', '짧아요', '길어요'], 밑위: ['길었던', '짧았던', '짧아요', '길어요'],
  어깨: ['넓었던', '좁았던', '좁아요', '넓어요'], 허벅지: ['넓었던', '좁았던', '좁아요', '넓어요'], 가슴: ['컸던', '작았던', '작아요', '커요'], 허리: ['컸던', '작았던', '작아요', '커요'] };
const FB_BIG = ['길어요', '넓어요', '커요'];
const rxLog = () => S.rxLog || (S.rxLog = []); // reset()이 S를 새로 만들면 기록도 지워짐
const ORD = (id) => S.orders.find((o) => o.id === id);
const cOf = (o) => S.closet.find((c) => c.id === o.cid);
const josa = (w) => (w.charCodeAt(w.length - 1) - 0xAC00) % 28 ? '이' : '가';
const ost = (o) => o.req ? `${o.req.k} ${o.req.done ? '완료' : '신청'}` : '';
const xHdr = () => `<div class="hdr"><span></span><span class="icons"><button data-a="tab" data-x="home" aria-label="닫기">${I.close}</button></span></div>`;
const step2 = (n) => `<span class="num" style="font-size:13px;color:var(--mut)">${n} / 2</span>`;
const optOf = (o) => `${o.color ? o.color + ' / ' : '사이즈 '}${o.size}`;
const oprod = (o) => { const p = PB[o.pid]; return `<div class="oprod"><div class="img"><img src="${IMG[p.img]}" alt=""></div><div style="flex:1;min-width:0"><div class="br">${p.brand}</div><div class="on2">${p.name}</div><small>${optOf(o)} · 1개 · ${won(sale(p))}원</small></div></div>` };
const prog = (steps, n, msg) => `<div class="prog"><div class="st">${steps.map((x, i) => i === n ? `<b>${x}</b>` : `<span>${x}</span>`).join('')}</div><div class="trk"><i style="width:${(n + 1) / steps.length * 100}%"></i></div><p>${msg}</p></div>`;
const seed = (o) => Object.assign({ id: 'o' + (S.orders.length + 1), no: '20261011' + String(S.orders.length + 1).padStart(4, '0'), date: '2026.10.11', delivered: true, confirmed: false, cid: null, color: null, req: null }, o);

/* 4-6 주문 상세 */
function odetail(pp) {
  const o = ORD(pp.o), pr = PB[o.pid], r = o.req;
  const pg = r ? (r.k === '반품'
      ? prog(['반품 신청', '수거', '환불'], r.done ? 2 : 0, r.done ? `환불이 완료됐어요 · ${won(r.refund)}원` : r.how === 'visit' ? `${D.pick}에 기사님이 수거하러 가요` : `${D.due}까지 보내 주세요`)
      : prog(['교환 신청', '수거·검수', '새 상품 발송'], r.done ? 2 : 0, r.done ? `${optOf(r)} 상품을 보내 드렸어요` : `${D.pick}에 기사님이 수거하러 가요`))
    : o.delivered ? prog(['결제 완료', '배송 중', '배송 완료'], 2, `${D.dlv} 문 앞에 두었어요`) : prog(['결제 완료', '배송 중', '배송 완료'], 1, '배송 중이에요. 도착하면 알려 드릴게요');
  const can = o.delivered && !r && !o.confirmed;
  const btns = can ? `<div class="obtns"><button data-a="retGo" data-x="${o.id}">반품 신청</button><button data-a="exGo" data-x="${o.id}">교환 신청</button><button class="dead" data-a="noop">리뷰 쓰기</button></div>` : '';
  const req = !r ? '' : `<div class="lbl">${r.k} ${r.done ? '' : '신청 '}정보</div><div class="box2">${r.k === '반품'
    ? `<div class="kvr"><span>사유</span><span>${r.reason}</span></div><div class="kvr"><span>보내는 방법</span><span>${r.how === 'visit' ? '택배 기사님 방문 수거' : '직접 보내기'}</span></div><div class="kvr tot"><span>환불${r.done ? '' : ' 예정'} 금액</span><span class="num">${won(r.refund)}원</span></div>`
    : `<div class="kvr"><span>바꿀 옵션</span><span>${optOf(o)} → ${optOf(r)}</span></div>${r.size !== o.size ? `<div class="kvr"><span>사이즈</span><span>${r.parts && r.parts.length ? r.parts.join('·') + josa(r.parts.join('·')) + ' ' : ''}${r.dir === '컸' ? '컸어요' : '작았어요'}</span></div>` : ''}${r.done ? '' : `<div class="kvr"><span>수거</span><span>${D.pick}</span></div>`}`}</div>`;
  return { node: `④-6 주문 상세 · ${ordStat(o)}`, body: `${hdrBack('주문 상세')}
  <div class="pad" style="font-size:13px;color:var(--mut)">${o.date || '2026.10.11'} · 주문번호 ${o.no || '20261011000' + o.id.slice(1)}</div>
  ${pg}
  <div class="ocard">${oprod(o)}${btns}</div>
  ${can ? `<p class="pad" style="font-size:12.5px;color:var(--mut);margin-top:10px">반품·교환은 ${D.due}까지 신청할 수 있어요</p>` : ''}
  ${req}
  <div class="lbl">결제 정보</div>
  <div class="box2"><div class="kvr"><span>상품 금액</span><span class="num">${won(sale(pr))}원</span></div><div class="kvr"><span>배송비</span><span>무료</span></div><div class="kvr tot"><span>결제 금액</span><span class="num">${won(sale(pr))}원</span></div></div>
  <div style="height:28px"></div>` };
}
/* 4-7 반품 신청 · 사유 (크다·작다와 부위는 비워 두고, 누른 것만 기록) */
function ret1(pp) {
  const o = ORD(pp.o), pr = PB[o.pid], f = S.rf;
  return { node: '④-7 반품 신청 · 사유', bar: `<button class="btn" data-a="retNext" ${f.reason ? '' : 'disabled'}>다음</button>`, body: `${hdrBack('반품 신청', step2(1))}
  <div class="ocard" style="margin-top:4px">${oprod(o)}</div>
  <div class="lbl">반품 사유를 골라 주세요</div>
  ${RSN.map((x) => `<button class="radio ${f.reason === x ? 'on' : ''}" data-a="rfReason" data-x="${x}"><i></i>${x}</button>`).join('')}
  ${f.reason === RSN[0] ? `<div class="subbox"><b>어떻게 안 맞았나요?</b><small>선택 · 다음 추천에 반영돼요</small>
    <div class="pick2">${['커요', '작아요'].map((x) => `<button class="${f.dir === x ? 'on' : ''}" data-a="rfDir" data-x="${x}">${x}</button>`).join('')}</div>
    <div style="margin-top:16px"><b>어느 부위였나요?</b><small>여러 개 골라도 돼요</small></div>
    <div class="pchips">${(RPARTS[pr.cat] || RPARTS.top).map((x) => `<button class="${f.parts.includes(x) ? 'on' : ''}" data-a="rfPart" data-x="${x}">${x}</button>`).join('')}</div></div>` : ''}
  <div style="height:24px"></div>` };
}
/* 4-8 반품 신청 · 수거·환불 확인 (주소는 주문할 때 배송지로 채워 둬요) */
function ret2(pp) {
  const pr = PB[ORD(pp.o).pid], f = S.rf, fee = f.reason === '불량·오배송' ? 0 : 3000, amt = sale(pr);
  return { node: '④-8 반품 신청 · 수거 · 환불 확인', bar: `<button class="btn" data-a="retSubmit">반품 신청하기</button>`, body: `${hdrBack('반품 신청', step2(2))}
  <div class="lbl" style="padding-top:8px">어떻게 보낼까요?</div>
  ${[['visit', '택배 기사님이 방문 수거'], ['self', '직접 보낼게요']].map(([k, t]) => `<button class="radio ${f.how === k ? 'on' : ''}" data-a="rfHow" data-x="${k}"><i></i>${t}</button>`).join('')}
  <div class="lbl">${f.how === 'visit' ? '수거지' : '보낼 곳'}</div>
  <div class="box2" style="padding:14px 16px;font-size:14px;line-height:1.5">${f.how === 'visit'
    ? `<div style="display:flex;justify-content:space-between"><b>집</b><span style="font-size:13px;color:var(--mut)">변경</span></div><div style="color:var(--mut);margin-top:2px">서울시 마포구 월드컵북로 00, 101동 1001호 · 010-****-1234</div>`
    : `<b>○○ 물류센터</b><div style="color:var(--mut);margin-top:2px">경기도 ○○시 ○○로 00 · ${D.due}까지 보내 주세요</div>`}</div>
  <div class="lbl">환불 예정 금액</div>
  <div class="box2"><div class="kvr"><span>상품 금액</span><span class="num">${won(amt)}원</span></div><div class="kvr"><span>반품 배송비</span><span class="num">${fee ? '−' + won(fee) + '원' : '무료'}</span></div><div class="kvr tot"><span>환불 금액</span><span class="num">${won(amt - fee)}원</span></div></div>
  <p class="pad" style="font-size:12.5px;color:var(--mut);margin-top:8px">결제한 수단으로 환불돼요 · 검수 후 3~5일</p>
  <div style="height:24px"></div>` };
}
/* 4-9 반품 신청 완료 (사이즈 사유만 다음 추천에 써요) */
function retDone(pp) {
  const o = ORD(pp.o), pr = PB[o.pid], r = o.req, visit = r.how === 'visit';
  const past = r.dir === '커요' ? '컸' : '작았', ps = r.parts.join('·');
  const why = r.reason !== RSN[0] ? '사이즈 문제가 아니라서 핏 정보는 바꾸지 않았어요'
    : r.dir && ps ? `${ps}${josa(ps)} ${past}다는 정보는 다음 사이즈 추천에 반영해요`
    : r.dir ? `${o.size} 사이즈가 ${past}다는 정보는 다음 사이즈 추천에 반영해요`
    : ps ? `${ps}${josa(ps)} 안 맞았다는 정보는 다음 사이즈 추천에 반영해요`
    : '사이즈가 안 맞았다는 정보는 다음 사이즈 추천에 반영해요';
  return { node: '④-9 반품 신청 완료', bar: `<button class="btn line" data-a="goTab" data-x="my|orders">주문 내역 보기</button><button class="btn" data-a="tab" data-x="home">쇼핑 계속하기</button>`, body: `${xHdr()}
  <div class="donec"><div class="check">${I.check}</div><h4>반품 신청이 완료됐어요</h4><p>${visit ? `${D.pick}에 기사님이 수거하러 가요` : `${D.due}까지 보내 주세요`}</p></div>
  <div class="box2" style="margin-top:28px"><div class="kvr"><span>${visit ? '수거' : '보내기'}</span><span>${visit ? D.pick : D.due + '까지'}</span></div><div class="kvr"><span>검수</span><span>${visit ? '수거' : '도착'} 후 1~2일</span></div><div class="kvr"><span>환불</span><span>검수 후 3~5일</span></div></div>
  <div class="info"><div class="img"><img src="${IMG[pr.img]}" alt=""></div><div><b>${pr.name} ${o.size}</b><small>${why}</small></div></div>` };
}
/* 4-10 교환 신청 · 옵션 (사이즈를 바꾸면 크다·작다를 자동 기록해요) */
function exch(pp) {
  const o = ORD(pp.o), pr = PB[o.pid], e = S.ex, ks = sizeKeys(pr);
  const changed = e.size !== o.size || e.color !== o.color;
  const four = pr.sizes && pr.cat !== 'bottom' && pr.sizes[o.size] && pr.sizes[o.size].length === 4;
  let note = '';
  if (e.size !== o.size) {
    const d = four ? pr.sizes[e.size].map((v, i) => +(v - pr.sizes[o.size][i]).toFixed(1)) : null;
    note = `<div class="subbox" style="margin-top:16px"><b>${o.size} → ${e.size} 사이즈로 바꾸면</b>
      <div style="font-size:13px;color:var(--ink2);margin-top:6px;line-height:1.55">${d ? `지금 받은 옷보다 ${['총장', '어깨', '가슴', '소매'].map((n, i) => `${n} ${d[i] === 0 ? '0' : (d[i] > 0 ? '+' : '−') + Math.abs(d[i])}`).join(' · ')}cm<br>` : ''}새 옷을 받아 입어 보고 구매 확정하면 내 옷장에 담을 수 있어요</div></div>`;
  }
  return { node: '④-10 교환 신청 · 옵션', bar: `<button class="btn" data-a="exSubmit" ${changed ? '' : 'disabled'}>교환 신청하기</button>`, body: `${hdrBack('교환 신청')}
  <div class="ocard" style="margin-top:4px"><div class="oprod"><div class="img"><img src="${IMG[pr.img]}" alt=""></div><div style="flex:1;min-width:0"><div class="on2">${pr.name}</div><small>현재 옵션 · ${optOf(o)}</small></div></div></div>
  <div class="lbl">어떤 옵션으로 바꿀까요?</div>
  <div class="pad">${pr.colors ? `<div style="font-size:13px;color:var(--mut);margin-bottom:8px">색상</div>
    <div class="chips2" style="margin-bottom:18px">${pr.colors.map((x) => `<button class="${x === e.color ? 'on' : ''}" data-a="exColor" data-x="${x}">${x}</button>`).join('')}</div>` : ''}
    <div style="font-size:13px;color:var(--mut);margin-bottom:8px">사이즈</div>
    <div class="szs">${ks.map((k) => { const out = pr.out.includes(k) && k !== o.size; return `<button class="sz ${k === e.size ? 'on' : ''} ${out ? 'out' : ''}" data-a="exSize" data-x="${k}" ${out ? 'disabled' : ''}><b>${k}</b><span>${k === o.size ? '현재' : out ? '품절' : four ? `총장 ${pr.sizes[k][0]}` : ''}</span></button>` }).join('')}</div></div>
  ${note}
  ${e.size !== o.size ? `<div class="subbox" style="margin-top:10px"><b>${o.size}에서 ${ks.indexOf(e.size) < ks.indexOf(o.size) ? '컸던' : '작았던'} 부위가 있나요?</b><small>선택 · 다음 추천에 반영돼요</small>
    <div class="pchips">${(RPARTS[pr.cat] || RPARTS.top).map((x) => `<button class="${e.parts.includes(x) ? 'on' : ''}" data-a="exPart" data-x="${x}">${x}</button>`).join('')}</div></div>` : ''}
  <div style="height:24px"></div>` };
}
/* 4-11 교환 신청 완료 */
function exchDone(pp) {
  const o = ORD(pp.o), pr = PB[o.pid], r = o.req, sz = r.size !== o.size;
  return { node: '④-11 교환 신청 완료', bar: `<button class="btn line" data-a="doneOrder" data-x="${o.id}">주문 상세</button><button class="btn" data-a="tab" data-x="home">쇼핑 계속하기</button>`, body: `${xHdr()}
  <div class="donec"><div class="check">${I.check}</div><h4>교환 신청이 완료됐어요</h4><p>수거한 뒤 검수가 끝나면 ${optOf(r)}를 보내 드려요</p></div>
  <div class="box2" style="margin-top:28px"><div class="kvr"><span>수거</span><span>${D.pick}</span></div><div class="kvr"><span>검수</span><span>수거 후 1~2일</span></div><div class="kvr"><span>새 상품 발송</span><span>검수 후 1~2일</span></div></div>
  <div class="info"><div class="img"><img src="${IMG[pr.img]}" alt=""></div><div>${sz
    ? `<b>${r.size} 사이즈로 바꿔 보내 드려요</b><small>${r.parts && r.parts.length ? r.parts.join('·') + josa(r.parts.join('·')) : o.size + ' 사이즈가'} ${r.dir}다는 정보는 추천에 반영해요. 새 옷을 받으면 입어 보고 구매 확정해 주세요</small>`
    : `<b>색상만 바꿔서 사이즈 정보는 그대로예요</b><small>새 옷을 받으면 입어 보고 구매 확정해 주세요</small>`}</div></div>` };
}

/* 잘 맞는 옷이 없을 때: 반품 · 교환 기록으로 추천 사이즈만 알려 줘요. 비교 화면은 없어요
   같은 그룹에서 어디가 안 맞았는지 아는 기록 중 가장 최근 것을 써요. 안 맞았던 부위가 반대 방향으로 1cm 이상 나아지고,
   괜찮았던 부위는 크게 달라지지 않는 사이즈 중 가장 가까운 사이즈를 추천해요. 그런 사이즈가 없으면 추천하지 않아요 */
const badList = (p) => rxLog().filter((x) => ['교환', '반품'].includes(x.k) && PB[x.pid] && PB[x.pid].sizes && PB[x.pid].sizes[x.size] && grpOf(PB[x.pid]) === grpOf(p) && x.parts && x.parts.length)
  .map((x, i) => { const q = PB[x.pid]; return { id: 'rx' + i, rx: x.k, name: q.name, img: q.img, cat: q.cat, sub: q.sub, size: x.size, m: q.sizes[x.size],
    notes: x.parts.filter((n) => RX_W[n]).map((n) => `${n} ${RX_W[n][x.dir === '커요' ? 3 : 2]}`) } }).filter((x) => x.notes.length);
const badRef = (p) => badList(p)[0] || null;
function badParts(p, bb) {
  const parts = partsOf(p);
  return bb.notes.map((t) => { const [n, w] = t.split(' '); return { n, i: parts.indexOf(n), big: FB_BIG.includes(w) } }).filter((x) => x.i >= 0 && bb.m[x.i]);
}
const badFixed = (p, bb, k, bp) => bp.every((x) => p.sizes[k][x.i] && (x.big ? p.sizes[k][x.i] <= bb.m[x.i] - 1 : p.sizes[k][x.i] >= bb.m[x.i] + 1));
function badOff(p, bb, k, bp) { // 괜찮았던 부위는 그대로가 좋아요. 반대로 안 맞을 수 있는 경우:
  // 괜찮았던 부위가 TOL 넘게 달라지거나, 1.5cm 넘게 달라진 부위가 같은 방향으로 2곳 이상이거나, 안 맞았던 부위를 3cm 넘게 고친 경우
  const parts = partsOf(p), R = bb.m, rows = [];
  parts.forEach((n, i) => { const v = p.sizes[k][i], r = R[i]; if (!v || !r) return; const dv = +(v - r).toFixed(1), b = bp.find((x) => x.i === i);
    if (b) { if ((b.big ? -dv : dv) > 3) rows.push({ n, dv, hard: 1 }) } else if (Math.abs(dv) >= 1.5) rows.push({ n, dv, hard: Math.abs(dv) > TOL }) });
  const pick = (l) => l.some((x) => x.hard) || l.length >= 2;
  const small = rows.filter((x) => x.dv < 0), big = rows.filter((x) => x.dv > 0);
  const ord = (l) => l.sort((a, b) => !!bp.find((x) => x.n === a.n) - !!bp.find((x) => x.n === b.n) || Math.abs(b.dv) - Math.abs(a.dv));
  return pick(small) ? { w: '작을 수 있어요', small: 1, rows: ord(small) } : pick(big) ? { w: '클 수 있어요', rows: ord(big) } : null;
}
function badRec(p, bb) {
  const bp = badParts(p, bb), keys = sizeKeys(p).filter((k) => !p.out.includes(k)); if (!bp.length) return null;
  const sc = (k) => p.sizes[k].reduce((a, v, i) => { if (!v || !bb.m[i]) return a; const b = bp.find((x) => x.i === i); return a + (b ? Math.abs(v - (bb.m[i] + (b.big ? -2 : 2))) * 1.3 : Math.abs(v - bb.m[i])) }, 0);
  const ok = keys.filter((k) => badFixed(p, bb, k, bp)).sort((a, b) => sc(a) - sc(b)), safe = ok.filter((k) => !badOff(p, bb, k, bp));
  return safe[0] || null; // 반대로 안 맞을 수 있는 사이즈는 추천하지 않아요 (딱 맞는 사이즈가 없으면 추천 없음)
}
// 완료본 판단에서 기준 옷이 없을 때(옷장 비어 있음 · 이 종류 옷 없음 · 기준 옷 없음)만
const badOf = (p, j) => [2, 3, 4].includes(j.n) && p.sizes ? badRef(p) : null;
function sizeView(p, j, pp) {
  const bb = badOf(p, j); if (!bb) return '';
  const rec = badRec(p, bb), bp = badParts(p, bb), keys = sizeKeys(p), k = pp.sel || rec || keys.find((x) => !p.out.includes(x));
  const top = `<div class="pd-base"><div class="pd-bnote" style="border-top:0">잘 맞는 ${GROUP_N[grpOf(p)]}가 아직 없어서, 아쉬웠던 기록으로 사이즈를 추천해요. 잘 맞는 옷을 등록하면 그 옷과 겹쳐 비교해 드려요 · <button class="hit" data-a="reg" data-x="${p.cat}|${p.id}">옷 등록하기</button></div></div>`;
  const szs = `<div class="pd-szs">${keys.map((x) => { const out = p.out.includes(x);
    return `<button class="pd-sz ${x === k ? 'on' : ''} ${out ? 'out' : ''}" data-a="dsel" data-x="${x}"><span class="t"><b>${x}</b>${x === rec ? '<em>추천</em>' : ''}</span><span>${out ? '품절' : ''}</span></button>` }).join('')}</div>`;
  const why = bp.map((b) => `${b.n}${josa(b.n)} ${RX_W[b.n] ? RX_W[b.n][b.big ? 0 : 1] : '안 맞았던'}`).join(', ');
  const src = `${bb.rx}한 ${bb.name} ${bb.size}`;
  const head = rec ? `<div class="pd-txt"><div class="pd-head">${rec} 사이즈를 <em class="eq">추천해요</em></div><p class="pd-sum">${src}에서 ${why} 기록을 참고했어요.</p></div>`
    : `<div class="pd-txt"><div class="pd-head"><em class="warn">추천할 사이즈를 찾지 못했어요</em></div><p class="pd-sum">${src}에서 ${why} 기록만으로는 잘 맞을 사이즈를 고르기 어려워요. 사이즈표를 확인해 주세요.</p></div>`;
  // 실패 기록은 비교하지 않아요. 지금 고른 사이즈 도식과 사이즈표만 보여요 (사이즈표는 완료본 상세와 같은 모양)
  const parts = partsOf(p), ref = FLAT_SRC[subOf(p)].ref, gsz = (x) => gArr(p, p.sizes[x]), rows = keys.map((x) => [x, gsz(x), x === k ? 'hl' : '']);
  const keep = parts.map((_, i) => rows.some(([, v]) => v[i] != null)), cols = parts.filter((_, i) => keep[i]);
  const tbl = `<div class="pd-ta"><div class="pd-tw"><table class="pd-tbl"><tr><th>cm</th>${cols.map((x) => `<th><i>${parts.indexOf(x) + 1}</i>${PART_N[x]}</th>`).join('')}</tr>${rows.map(([h, v, cls]) => `<tr class="${cls}"><th>${h}</th>${v.filter((_, i) => keep[i]).map((x) => `<td>${x == null ? '–' : x}</td>`).join('')}</tr>`).join('')}</table></div><p class="pd-note">단면 실측(cm) 기준이에요. 재는 방법에 따라 1~2cm 차이가 날 수 있어요.</p></div>`;
  const fig = flatFig(subOf(p), [{ m: gsz(k).map((v, i) => v ?? ref[i]), role: 'prod' }], { guide: true });
  return `${top}${szs}${head}<div class="pd-stage">${fig}<div class="pd-legend"><span><i class="solid"></i>이 상품 ${k}</span></div></div>${tbl}`;
}

DJ.feature({
  id: 'retsig', issue: 20, name: '반품 · 교환 실패 사유 활용', proposal: 'docs/proposals/반품-교환-실패-활용.md',
  screens: { odetail, ret1, ret2, retDone, exch, exchDone },
  actions: {
    orderGo(x) { closeOv(); go('odetail', { o: x }) },
    doneOrder(x) { nav = [{ s: 'my', p: {} }, { s: 'orders', p: {} }, { s: 'odetail', p: { o: x } }]; render(true) },
    rxOpen(x) { saveY(); sheet(`<div class="grab"></div><div class="sh-t">어떤 신청인가요?</div>
      <button class="opt" data-a="retGo" data-x="${x}"><div><b>반품 신청</b><span>환불받을게요</span></div></button>
      <button class="opt" data-a="exGo" data-x="${x}"><div><b>교환 신청</b><span>다른 사이즈·색상으로 바꿀게요</span></div></button>`); S.ov.node = '④-12 마이 · 반품·교환 신청 · 어떤 신청인가요?'; render() },
    retGo(x) { closeOv(); S.rf = { reason: null, dir: null, parts: [], how: 'visit' }; go('ret1', { o: x }) },
    rfReason(x) { saveY(); S.rf.reason = x; render() },
    rfDir(x) { saveY(); S.rf.dir = S.rf.dir === x ? null : x; render() },
    rfPart(x) { saveY(); const a = S.rf.parts; S.rf.parts = a.includes(x) ? a.filter((v) => v !== x) : a.concat(x); render() },
    rfHow(x) { saveY(); S.rf.how = x; render() },
    retNext() { if (S.rf.reason) go('ret2', { o: cur().p.o }) },
    retSubmit() {
      const o = ORD(cur().p.o), f = S.rf, fee = f.reason === '불량·오배송' ? 0 : 3000, c = cOf(o), size = f.reason === RSN[0];
      o.req = { k: '반품', how: f.how, reason: f.reason, dir: size ? f.dir : null, parts: size ? f.parts.slice() : [], refund: sale(PB[o.pid]) - fee }; o.returned = true;
      if (size && f.dir) rxLog().unshift({ k: '반품', pid: o.pid, sub: PB[o.pid].sub, size: o.size, dir: f.dir, parts: f.parts.slice() });
      if (c) { S.closet = S.closet.filter((q) => q !== c); ensureBases() } // 반품한 옷은 옷장에서 빼요 (완료본은 구매 확정 전에 옷장에 없어 보통 해당 없음)
      nav = nav.filter((n) => !['ret1', 'ret2'].includes(n.s)); go('retDone', { o: o.id });
    },
    exGo(x) { closeOv(); const o = ORD(x); S.ex = { color: o.color || null, size: o.size, parts: [] }; go('exch', { o: x }) },
    exColor(x) { saveY(); S.ex.color = x; render() },
    exSize(x) { saveY(); if (S.ex.size !== x) S.ex.parts = []; S.ex.size = x; render() },
    exPart(x) { saveY(); const a = S.ex.parts; S.ex.parts = a.includes(x) ? a.filter((v) => v !== x) : a.concat(x); render() },
    exSubmit() {
      const o = ORD(cur().p.o), p = PB[o.pid], e = S.ex, ks = sizeKeys(p);
      if (e.size === o.size && e.color === (o.color || null)) return;
      o.req = { k: '교환', size: e.size, color: e.color, parts: e.size !== o.size ? e.parts.slice() : [], dir: ks.indexOf(e.size) < ks.indexOf(o.size) ? '컸' : '작았' }; o.returned = true;
      if (e.size !== o.size) rxLog().unshift({ k: '교환', pid: o.pid, sub: p.sub, size: o.size, dir: o.req.dir === '컸' ? '커요' : '작아요', parts: e.parts.slice() });
      nav = nav.filter((n) => n.s !== 'exch'); go('exchDone', { o: o.id });
    },
  },
  slots: {
    'order.return': (o) => { A.rxOpen(o.id); return '1' },
    'order.stat': ost,
    'order.card': (o) => `<div class="obtns"><button data-a="orderGo" data-x="${o.id}">주문 상세</button>${o.req ? `<button data-a="orderGo" data-x="${o.id}">${o.req.k} ${o.req.done ? '내역' : '진행 상황'}</button>` : ''}</div>`,
    'detail.chip': (p, j) => { const bb = badOf(p, j); if (!bb) return ''; const rec = badRec(p, bb); return rec ? `<b>${rec} 추천</b>추천 이유 보기` : '사이즈 확인하기' },
    'detail.size': sizeView,
  },
  panel: [
    ['반품 · 교환 바로 보기 (주문 상세)', () => { reset('full'); const o = seed({ pid: 'p1', size: 'M' }); S.orders.unshift(o); nav = [{ s: 'my', p: {} }, { s: 'orders', p: {} }, { s: 'odetail', p: { o: o.id } }]; }],
    // 기준 옷 없는 회원이 셔츠를 '어깨가 커요'로 반품한 상태 → 같은 긴팔 셔츠 상품 사이즈 영역
    // 원본은 M이지만 완료본 상품 치수(무신사)로는 M 기록에서 추천 사이즈가 안 나와 S로 둠
    ['반품 기록으로 추천 사이즈 보기 (상품 상세)', () => { reset('nobase'); rxLog().push({ k: '반품', pid: 'p1', sub: '긴팔 셔츠', size: 'S', dir: '커요', parts: ['어깨'] }); nav = [{ s: 'home', p: {} }, { s: 'detail', p: { id: 'p15', tab: 'size' } }]; }],
    // 원본 '옷 많음' 회원의 지난 반품 · 교환 3건 (완료)
    ['지난 반품 · 교환 3건 있는 회원', () => { reset('many');
      S.orders.push(seed({ id: 'o91', pid: 'p15', size: 'L', no: '202609240003', date: '2026.09.24', returned: true, req: { k: '교환', size: 'M', color: null, parts: ['어깨'], dir: '컸', done: true } }),
        seed({ id: 'o92', pid: 'p14', size: '32', no: '202609120002', date: '2026.09.12', returned: true, req: { k: '반품', how: 'visit', reason: '사이즈가 안 맞아요', dir: '커요', parts: ['허리'], refund: sale(PB.p14) - 3000, done: true } }),
        seed({ id: 'o93', pid: 'p16', size: 'M', no: '202609030001', date: '2026.09.03', color: '블루', returned: true, req: { k: '반품', how: 'self', reason: '단순 변심', dir: null, parts: [], refund: sale(PB.p16) - 3000, done: true } }));
      rxLog().push({ k: '교환', pid: 'p15', sub: PB.p15.sub, size: 'L', dir: '커요', parts: ['어깨'] }, { k: '반품', pid: 'p14', sub: PB.p14.sub, size: '32', dir: '커요', parts: ['허리'] });
      nav = [{ s: 'my', p: {} }, { s: 'orders', p: {} }]; }],
  ],
});
})();
