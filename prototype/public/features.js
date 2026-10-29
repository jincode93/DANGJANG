/* ── 신기능 장치: 결정 전인 신기능을 완료본 위에 켜고 끄며 보기 ──
   기능 하나 = features/기능/feature.js 한 파일(+ feature.css). index.html에 그 파일을 한 줄씩 넣는다
   DJ.feature({ id, issue, name, proposal, screens, actions, slots, after, start, panel })
     screens · actions  새 화면(SCR) · 새 동작(A). 완료본에 이미 있는 이름이면 멈춘다 (덮어쓰기 금지)
     slots              완료본이 열어 둔 자리에 끼울 HTML: 'closet.top' · 'my.menu' · 'reg.done' · 'cart.top'
     after()            화면을 다 그린 뒤 · start()  앱을 열 때 (켜져 있을 때만)
     panel              오른쪽 패널 테스트 버튼 [['이름', () => {…}], …]. 손으로 하기 번거로운 상태만
   켠 기능은 주소 ?f=id,id 에 남는다. 기본은 모두 꺼짐
   이 파일은 app.js보다 먼저, 기능 파일은 app.js 뒤에 불러온다 */
const DJ = (() => {
  const list = [], on = new Set((new URLSearchParams(location.search).get('f') || '').split(',').filter(Boolean));
  const live = () => list.filter((f) => on.has(f.id));
  const esc2 = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const REPO = 'https://github.com/jincode93/DANGJANG';
  function feature(f) {
    for (const [kind, box] of [['screens', SCR], ['actions', A]]) for (const k in f[kind] || {}) {
      if (k in box) throw new Error(`신기능 ${f.id}: ${kind}.${k} 이름이 완료본과 겹침`);
      box[k] = f[kind][k];
    }
    list.push(f);
  }
  function slot(name) { return live().map((f) => (f.slots && f.slots[name] ? f.slots[name]() : '')).join(''); }
  function after() { live().forEach((f) => f.after && f.after()); }
  function setUrl() {
    const q = new URLSearchParams(location.search); if (on.size) q.set('f', [...on].join(',')); else q.delete('f');
    history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q.toString().replace(/%2C/g, ',') : '') + location.hash);
  }
  function toggle(id) {
    const f = list.find((x) => x.id === id); if (!f) return;
    if (on.has(id)) { on.delete(id); if (Object.keys(f.screens || {}).includes(cur().s)) { S.ov = null; tab('home'); } } // 끄면 그 기능 화면에서 나옴
    else { on.add(id); f.start && f.start(); }
    setUrl(); panel(); render();
  }
  function panel() {
    const box = document.getElementById('features'); if (!box) return;
    document.body.classList.toggle('hasfeat', list.length > 0);
    document.getElementById('featCount').textContent = on.size ? `${on.size}개 켬` : '모두 꺼짐';
    box.querySelector('.flist').innerHTML = list.length ? list.map((f) => `<div class="box fcard ${on.has(f.id) ? 'on' : ''}">
      <div class="fhead"><a class="iss" href="${REPO}/issues/${f.issue}" target="_blank" rel="noopener">#${f.issue}</a><b>${esc2(f.name)}</b>
        <button class="fsw" role="switch" aria-checked="${on.has(f.id)}" aria-label="${esc2(f.name)} 켜기" data-f="t:${f.id}"><i></i></button></div>
      <div class="flinks"><a href="${REPO}/blob/main/${encodeURI(f.proposal)}" target="_blank" rel="noopener">제안서</a> · <a href="${REPO}/issues/${f.issue}" target="_blank" rel="noopener">이슈</a></div>
      ${on.has(f.id) && f.panel && f.panel.length ? `<div class="btns">${f.panel.map(([t], i) => `<button class="wide" data-f="b:${f.id}:${i}">${esc2(t)}</button>`).join('')}</div>` : ''}
    </div>`).join('') : '<div class="box"><p class="note">아직 붙은 신기능이 없어요. 제안서와 함께 features/ 폴더로 붙이면 여기에 나와요</p></div>';
  }
  function ready() {
    const box = document.getElementById('features');
    box.addEventListener('click', (e) => {
      const el = e.target.closest('[data-f]'); if (!el) return; const [k, id, i] = el.dataset.f.split(':');
      if (k === 't') toggle(id);
      if (k === 'b') { const f = list.find((x) => x.id === id); closeOv(); f.panel[+i][1](); render(); }
    });
    document.getElementById('featToggle').addEventListener('click', () => box.classList.toggle('open'));
    for (const id of [...on]) if (!list.some((f) => f.id === id)) on.delete(id); // 없는 기능 이름은 주소에서 지움
    setUrl(); panel(); live().forEach((f) => f.start && f.start()); render();
  }
  return { feature, slot, after, ready, isOn: (id) => on.has(id) };
})();
const slot = DJ.slot;
