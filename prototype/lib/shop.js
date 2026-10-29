// 당장 데모 서버 공용 코드: 상품 링크 읽기(/api/product) + 상품 이미지 중계(/api/img)
import { normalizeProduct } from './catalog.js';
const UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36';
const MAX_HTML = 3_000_000, MAX_IMG = 6_000_000;
const SIZE_WORDS = /(총장|기장|어깨|가슴|소매|허리|밑위|허벅지|엉덩이|힙|밑단|암홀|인심|총길이)/;

// 호출 제한: 1분에 상품 읽기 40번 · 상품 찾기 20번 · 사진 600번까지 (데모 상품 사진도 이 중계로 보여 줌: 목록을 내리면 한 번에 수십 장) (남용 방지. 서버가 여러 대면 각 서버에서 대략적으로 막음)
const HITS = new Map();
function limited(req, kind, max) {
  const ip = String(req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'local').split(',')[0].trim(), key = kind + '|' + ip, now = Date.now();
  const a = (HITS.get(key) || []).filter((t) => now - t < 60000); a.push(now); HITS.set(key, a);
  if (HITS.size > 5000) for (const [k, v] of HITS) if (!v.length || now - v[v.length - 1] > 60000) HITS.delete(k);
  return a.length > max;
}
const tooMany = () => new Response(JSON.stringify({ ok: false, error: 'rate', message: '잠시 후 다시 시도' }), { status: 429, headers: { 'content-type': 'application/json; charset=utf-8', 'retry-after': '30' } });
export const json =(o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

function safeUrl(raw) {
  let u; try { u = new URL(String(raw || '').trim()); } catch { return null; }
  if (!/^https?:$/.test(u.protocol) || u.username || u.password) return null;
  const h = u.hostname.toLowerCase();
  if (!h.includes('.') || h === 'localhost' || /^[\d.]+$/.test(h) || h.includes(':') || /\.(local|internal|localhost|lan)$/.test(h)) return null;
  return u;
}
async function get(url, { accept = 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8', referer } = {}) {
  const headers = { 'user-agent': UA, 'accept-language': 'ko-KR,ko;q=0.9,en;q=0.6', accept };
  if (referer) headers.referer = referer;
  const r = await fetch(url, { headers, redirect: 'follow', signal: AbortSignal.timeout(9000) });
  return r;
}
async function getText(url, opt) {
  const r = await get(url, opt); if (!r.ok) throw new Error('HTTP ' + r.status);
  const len = +(r.headers.get('content-length') || 0); if (len > MAX_HTML) throw new Error('page too large');
  const t = await r.text(); return { text: t.length > MAX_HTML ? t.slice(0, MAX_HTML) : t, finalUrl: r.url };
}
const decode = (s) => String(s || '').replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
function meta(html, key) {
  const re = new RegExp(`<meta[^>]+(?:property|name|itemprop)\\s*=\\s*["']${key.replace(/[:.]/g, '\\$&')}["'][^>]*>`, 'i');
  const m = html.match(re); if (!m) return null; const c = m[0].match(/content\s*=\s*"([^"]*)"|content\s*=\s*'([^']*)'/i);
  return c ? decode(c[1] ?? c[2]).trim() || null : null;
}
const abs = (u, base) => { try { return u ? new URL(u.startsWith('//') ? 'https:' + u : u, base).href : null; } catch { return null; } };
function ldProduct(html) {
  const out = [];
  for (const m of html.matchAll(/<script[^>]+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { const j = JSON.parse(m[1].trim()); const stack = [j]; while (stack.length) { const o = stack.pop(); if (!o || typeof o !== 'object') continue; if (Array.isArray(o)) { stack.push(...o); continue; } const t = [].concat(o['@type'] || []); if (t.includes('Product')) out.push(o); if (o['@graph']) stack.push(o['@graph']); } } catch { }
  }
  const p = out[0]; if (!p) return null;
  const img = Array.isArray(p.image) ? p.image[0] : p.image && typeof p.image === 'object' ? p.image.url : p.image;
  const brand = typeof p.brand === 'string' ? p.brand : p.brand && p.brand.name;
  const offer = Array.isArray(p.offers) ? p.offers[0] : p.offers;
  return { name: p.name, image: img, brand, price: offer && (offer.price || offer.lowPrice) };
}
const strip = (s) => decode(String(s).replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
// 페이지 안의 HTML 표 중에서 사이즈표처럼 보이는 것을 {사이즈: {부위: 값}} 으로
function htmlSizeTable(html) {
  for (const m of html.matchAll(/<table[\s\S]*?<\/table>/gi)) {
    const rows = [...m[0].matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((r) => [...r[0].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((c) => strip(c[1]))).filter((r) => r.length >= 2);
    if (rows.length < 2) continue;
    const num = (s) => { const v = parseFloat(String(s).replace(/[^\d.]/g, '')); return isFinite(v) ? v : null; };
    const head = rows[0], col0 = rows.map((r) => r[0]);
    const hHits = head.filter((c) => SIZE_WORDS.test(c)).length, cHits = col0.filter((c) => SIZE_WORDS.test(c)).length;
    const tbl = {};
    if (hHits >= 2) { for (const r of rows.slice(1)) { const sz = r[0]; if (!sz || sz.length > 20) continue; const row = {}; head.forEach((h, i) => { if (i && SIZE_WORDS.test(h) && num(r[i]) != null) row[h] = num(r[i]); }); if (Object.keys(row).length >= 2) tbl[sz] = row; } }
    else if (cHits >= 2) { head.slice(1).forEach((sz, i) => { if (!sz || sz.length > 20) return; const row = {}; for (const r of rows.slice(1)) if (SIZE_WORDS.test(r[0]) && num(r[i + 1]) != null) row[r[0]] = num(r[i + 1]); if (Object.keys(row).length >= 2) tbl[sz] = row; }); }
    if (Object.keys(tbl).length) return tbl;
  }
  return null;
}
function catOf(text) {
  const t = String(text || '');
  if (/(팬츠|바지|슬랙스|데님|진$|청바지|쇼츠|반바지|조거|트레이닝 ?팬츠|스커트|pants|jeans|denim|shorts|trousers)/i.test(t)) return 'bottom';
  if (/(자켓|재킷|코트|점퍼|패딩|가디건|블루종|아우터|파카|베스트|jacket|coat|parka|cardigan)/i.test(t)) return 'outer';
  return 'top';
}

/* ── 무신사: 상품 페이지 + 판매처 실측 데이터 ── */
async function musinsa(u) {
  const id = (u.pathname.match(/\/(?:products|app\/goods|goods)\/(\d{4,10})/) || [])[1]; if (!id) return null;
  const page = `https://www.musinsa.com/products/${id}`, ref = 'https://www.musinsa.com/';
  const [pg, sz, op] = await Promise.allSettled([
    getText(page),
    get(`https://goods-detail.musinsa.com/api2/goods/${id}/actual-size`, { accept: 'application/json', referer: ref }).then((r) => r.ok ? r.json() : null),
    get(`https://goods-detail.musinsa.com/api2/goods/${id}/options`, { accept: 'application/json', referer: ref }).then((r) => r.ok ? r.json() : null),
  ]);
  const html = pg.status === 'fulfilled' ? pg.value.text : '';
  const title = meta(html, 'og:title') || '';
  const name = (html.match(/"goodsNm":"([^"]+)"/) || [])[1] || title.replace(/\s*-\s*사이즈.*$/, '').replace(/^[^)]*\)\s*/, '');
  const brand = (html.match(/"brandName":"([^"]+)"/) || [])[1] || meta(html, 'product:brand');
  const image = abs(meta(html, 'og:image'), page);
  const d1 = (html.match(/"categoryDepth1Title":"([^"]+)"/) || [])[1] || '';
  const d2c = (html.match(/"categoryDepth2Code":"([^"]+)"/) || [])[1] || null, d2t = (html.match(/"categoryDepth2Title":"([^"]+)"/) || [])[1] || null; // 무신사 세부 카테고리 (예: 003002 데님 팬츠)
  const cat = /바지|하의|스커트/.test(d1) ? 'bottom' : /아우터/.test(d1) ? 'outer' : catOf(name);
  let table = null, sizes = [];
  const sd = sz.status === 'fulfilled' && sz.value && sz.value.data;
  if (sd && Array.isArray(sd.sizes)) {
    table = {};
    for (const s of sd.sizes) { const row = {}; for (const it of s.items || []) if (it.value > 0) row[it.name] = it.value; if (Object.keys(row).length) table[s.name] = row; }
    if (!Object.keys(table).length) table = null;
  }
  const od = op.status === 'fulfilled' && op.value && op.value.data;
  if (od && Array.isArray(od.basic)) { const so = od.basic.find((o) => /사이즈|size/i.test(o.name)); if (so) sizes = so.optionValues.filter((v) => !v.isDeleted).map((v) => v.name); }
  if (!name && !image) return null;
  return { site: '무신사', name: decode(name), brand: brand && decode(brand), image, cat, mcat: d2c, mcatName: d2t && decode(d2t), srcCat: [d1, d2t && decode(d2t)].filter(Boolean).join('/'), price: +(meta(html, 'product:price:amount') || 0) || null, table, sizes: sizes.length ? sizes : table ? Object.keys(table) : [], tableSource: table ? '무신사에 판매처가 올린 실측' : null };
}

/* ── 그 밖의 쇼핑몰: 공통 규격(og 메타, 상품 구조화 데이터, HTML 표) ── */
async function generic(u) {
  const { text: html, finalUrl } = await getText(u.href);
  const ld = ldProduct(html) || {};
  const name = ld.name || meta(html, 'og:title') || strip((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
  const image = abs(ld.image || meta(html, 'og:image') || meta(html, 'twitter:image'), finalUrl);
  const brand = ld.brand || meta(html, 'product:brand') || meta(html, 'og:site_name');
  const table = htmlSizeTable(html);
  if (!name && !image) return null;
  return { site: meta(html, 'og:site_name') || new URL(finalUrl).hostname.replace(/^www\.|^m\./, ''), name: decode(name).slice(0, 120), brand: brand && decode(brand), image, cat: catOf(name), price: +(ld.price || meta(html, 'product:price:amount') || 0) || null, table, sizes: table ? Object.keys(table) : [], tableSource: table ? '상품 페이지 사이즈표' : null };
}

export async function product(req) {
  if (limited(req, 'product', 40)) return tooMany();
  const u = safeUrl(new URL(req.url).searchParams.get('url'));
  if (!u) return json({ ok: false, error: 'bad-url', message: '상품 페이지 주소 아님' }, 400);
  try {
    const host = u.hostname.replace(/^www\.|^m\./, '');
    const r = (/(^|\.)musinsa\.com$/.test(host) && await musinsa(u)) || await generic(u);
    if (!r) return json({ ok: false, error: 'no-product', message: '이 페이지에서 상품 정보 찾기 실패' }, 200);
    // 어느 쇼핑몰이든 같은 규칙으로 표준화·검사한 결과 (앱은 이 값을 믿고 쓰면 됨). 문제가 있으면 issues 에 이유가 담김
    const norm = r.table ? normalizeProduct({ cat: r.cat, name: r.name, srcCat: r.srcCat || '', table: r.table }) : null;
    return json({ ok: true, url: u.href, ...r, norm });
  } catch (e) {
    return json({ ok: false, error: 'fetch-failed', message: '쇼핑몰 페이지 열기 실패', detail: String(e && e.message || e).slice(0, 120) }, 200);
  }
}

export async function img(req) {
  if (limited(req, 'img', 600)) return new Response('too many', { status: 429 });
  const u = safeUrl(new URL(req.url).searchParams.get('url'));
  if (!u) return new Response('bad url', { status: 400 });
  const r = await get(u.href, { accept: 'image/avif,image/webp,image/*,*/*;q=0.8', referer: u.origin + '/' }).catch(() => null);
  if (!r || !r.ok) return new Response('fetch failed', { status: 502 });
  const ct = r.headers.get('content-type') || '';
  if (!/^image\/(jpeg|png|webp|gif|avif)/i.test(ct)) return new Response('not an image', { status: 415 });
  const buf = await r.arrayBuffer(); if (buf.byteLength > MAX_IMG) return new Response('too large', { status: 413 });
  return new Response(buf, { headers: { 'content-type': ct, 'cache-control': 'public, max-age=86400, s-maxage=604800', 'x-content-type-options': 'nosniff' } });
}


/* ── 상품명으로 같은 상품 찾기 (구매내역 캡처 → 실측표) ── */
const norm = (t) => String(t || '').toLowerCase().replace(/\[[^\]]*\]|\([^)]*\)/g, ' ').replace(/[^0-9a-z가-힣]+/g, '');
function sim(a, b) { // 글자 두 개씩 겹치는 비율
  const A = norm(a), B = norm(b); if (!A || !B) return 0; if (A === B) return 1;
  const bg = (s) => { const m = new Map(); for (let i = 0; i < s.length - 1; i++) { const k = s.slice(i, i + 2); m.set(k, (m.get(k) || 0) + 1); } return m; };
  const x = bg(A), y = bg(B); let hit = 0; for (const [k, v] of x) hit += Math.min(v, y.get(k) || 0);
  return (2 * hit) / Math.max(1, A.length - 1 + B.length - 1);
}
export async function find(req) {
  if (limited(req, 'find', 20)) return tooMany();
  const sp = new URL(req.url).searchParams, brand = (sp.get('brand') || '').slice(0, 40).trim(), colors = [...String(sp.get('name') || '').matchAll(/\[([^\]]{1,12})\]|\(([^)]{1,12})\)/g)].map((m) => norm(m[1] || m[2])).concat(norm(sp.get('color') || '')).filter((c) => c && c.length >= 2 && !/^(\d+|free|xl|xxl)$/.test(c)); // 상품명 괄호 속 색상 + 캡처 옵션 줄 색상
  // [2PACK] 같은 대괄호·괄호 안 글자는 빼고 검색 (글자 인식이 자주 틀리고 상품 구분에 거의 안 쓰임)
  const name = (sp.get('name') || '').slice(0, 80).replace(/\[[^\]]*\]|\([^)]*\)/g, ' ').replace(/[^0-9A-Za-z가-힣+ ]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (norm(name).length < 2) return json({ ok: false, error: 'no-name', message: '상품명이 너무 짧음' }, 400);
  try {
    const search = async (kw) => { if (!kw || norm(kw).length < 2) return []; const r = await get(`https://api.musinsa.com/api2/dp/v1/plp/goods?gf=A&keyword=${encodeURIComponent(kw)}&sortCode=POPULAR&page=1&size=30&caller=SEARCH`, { accept: 'application/json', referer: 'https://www.musinsa.com/' }).catch(() => null); if (!r || !r.ok) return []; const j = await r.json().catch(() => null); return (j && j.data && j.data.list) || []; };
    // 여러 검색어로 차례로: 브랜드+이름 → 이름 → 끝단어(색상 등) 뺀 이름 → 앞 세 단어
    const rawColor = (String(sp.get('name') || '').match(/\[([^\]]{1,12})\]\s*$/) || [])[1] || '', words = name.split(' '), tries = [...new Set([rawColor ? name + ' ' + rawColor : '', (brand ? brand + ' ' : '') + name, name, words.slice(0, -1).join(' '), words.slice(0, 3).join(' '), brand && words.slice(0, 2).join(' ') ? brand + ' ' + words.slice(0, 2).join(' ') : ''].concat(brand ? [brand] : [], words.filter((w) => norm(w).length >= 2).sort((x, y) => y.length - x.length).slice(0, 3)).filter((t) => norm(t).length >= 2))]; // 글자 인식이 한두 글자 틀려도 단어 하나·브랜드만으로 후보를 모음
    const seen = new Map();
    for (const kw of tries) { const list = await search(kw); for (const g of list) if (!seen.has(g.goodsNo)) seen.set(g.goodsNo, g); if (seen.size >= 120) break; }
    const scored = [...seen.values()].map((g) => { const s = sim(name, g.goodsName), nb = norm(brand), gb = norm(g.brandName), bOk = !brand || !g.brandName ? 0 : gb === nb ? 0.15 : sim(brand, g.brandName) > 0.95 ? 0.12 : (gb.includes(nb) || nb.includes(gb)) ? 0.03 : 0, kid = /키즈|kids|주니어|베이비|baby/i.test(g.brandName + ' ' + g.goodsName) && !/키즈|kids|주니어|베이비|baby/i.test(brand + ' ' + name) ? -0.4 : 0; const gc = [...String(g.goodsName).matchAll(/\[([^\]]{1,12})\]|\(([^)]{1,12})\)/g)].map((m) => norm(m[1] || m[2])), cOk = colors.some((c) => gc.includes(c)) ? 2 : colors.some((c) => norm(g.goodsName).includes(c)) ? 1 : 0; return { g, s: s + bOk + kid + cOk * 0.04 }; }).sort((a, b) => b.s - a.s); // 같은 색상 상품을 조금 더 우선
    const best = scored[0]; // 브랜드가 정확히 같으면 점수가 가장 높음 (무신사 스탠다드 ≠ 무신사 스탠다드 키즈)
    const cands = scored.slice(0, 5).map((x) => ({ url: x.g.goodsLinkUrl, name: x.g.goodsName, brand: x.g.brandName, image: x.g.thumbnail, price: x.g.price, score: Math.round(x.s * 100) / 100 }));
    console.log(JSON.stringify({ find: { name, brand, tries: tries.length, found: seen.size, best: best ? [best.g.goodsName, Math.round(best.s * 100) / 100] : null } }));
    if (!best || best.s < 0.6) return json({ ok: true, match: null, cands, message: '무신사에서 같은 상품 확인 실패' });
    const want = (sp.get('size') || '').toUpperCase().replace(/\s/g, ''), al = { S: ['S', 'SMALL'], M: ['M', 'MEDIUM'], L: ['L', 'LARGE'], XL: ['XL', 'XLARGE', 'X-LARGE'] }[want] || [want];
    const hasSize = (t) => !want || !t ? false : Object.keys(t).some((k) => k.toUpperCase().split(/[^0-9A-Z-]+/).some((x) => al.includes(x)) || al.includes(k.toUpperCase()));
    const near = scored.filter((x) => x.s >= best.s - 0.06).slice(0, 5);
    let pick = null;
    let first = null;
    for (const x of near) { let p = await musinsa(new URL(x.g.goodsLinkUrl)); if (p && !p.table) p = await musinsa(new URL(x.g.goodsLinkUrl)); /* 실측을 한 번 못 받으면 다시 */ if (p && !first && x === best) first = { x, p }; if (!p || !p.table) continue; if (!pick) pick = { x, p }; if (!want || hasSize(p.table)) { pick = { x, p }; break; } }
    if (!pick && first) pick = first; // 같은 상품은 찾았는데 판매처 실측표가 없으면: 사진 · 이름 · 분류는 쓰고 실측은 앱에서 채움
    const capColor = (String(sp.get('name') || '').match(/\[([^\]]{1,12})\]\s*$/) || [])[1] || '', gotColor = pick ? (String(pick.x.g.goodsName).match(/\[([^\]]{1,12})\]\s*$/) || [])[1] || '' : '';
    let colorDiff = capColor && gotColor && norm(capColor) !== norm(gotColor) ? { cap: capColor, got: gotColor } : null; // 캡처 색상이 무신사에 없어서 같은 모델 다른 색상을 쓴 경우
    if (!colorDiff && pick && pick.x !== best) { const a = String(best.g.goodsName), c = String(pick.x.g.goodsName); let i = 0; while (i < a.length && a[i] === c[i]) i++; const ta = a.slice(i).replace(/[\[\]()_\s]+/g, ' ').trim(), tc = c.slice(i).replace(/[\[\]()_\s]+/g, ' ').trim(); if (ta && tc) colorDiff = { cap: ta.slice(0, 14), got: tc.slice(0, 14) }; } // 가장 비슷한 상품에 실측이 없어 같은 모델의 다른 색상 실측을 씀
    return json({ ok: true, match: pick ? { url: pick.x.g.goodsLinkUrl, score: Math.round(pick.x.s * 100) / 100, colorDiff, ...pick.p } : null, cands });
  } catch (e) { return json({ ok: false, error: 'fetch-failed', message: '쇼핑몰 검색 실패' }, 200); }
}
