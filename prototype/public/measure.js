/* DANGJANG 옷 측정 엔진 — 브라우저 순수 JS
   사진 → A4 네 모서리 찾기 → 원근·실제 크기 보정 → 옷 한 벌 분리(투명 크롭) → 측정선 · cm 계산
   외부 라이브러리 없음. 결과는 사람이 고칠 수 있게 측정점(두 점)으로 돌려준다. */
(function () {
  'use strict';
  const A4S = 210, A4L = 297;

  /* ── 기본 도구 ── */
  function grab(src, maxSide) {
    const sw = src.naturalWidth || src.videoWidth || src.width, sh = src.naturalHeight || src.videoHeight || src.height;
    const k = Math.min(1, maxSide / Math.max(sw, sh));
    const w = Math.max(1, Math.round(sw * k)), h = Math.max(1, Math.round(sh * k));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(src, 0, 0, w, h);
    return { c, w, h, k, d: x.getImageData(0, 0, w, h).data };
  }
  function otsu(hist) {
    let total = 0, sum = 0; for (let i = 0; i < hist.length; i++) { total += hist[i]; sum += i * hist[i]; }
    let sB = 0, wB = 0, best = -1, th = 0;
    for (let i = 0; i < hist.length; i++) {
      wB += hist[i]; if (!wB) continue; const wF = total - wB; if (!wF) break;
      sB += i * hist[i]; const mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) * (mB - mF);
      if (v > best) { best = v; th = i; }
    }
    return th;
  }
  function components(mask, w, h, minArea) {
    const lab = new Int32Array(w * h), stack = new Int32Array(w * h), comps = [];
    let id = 0;
    for (let i = 0; i < w * h; i++) {
      if (!mask[i] || lab[i]) continue;
      id++; let sp = 0; stack[sp++] = i; lab[i] = id;
      let area = 0, minx = w, maxx = 0, miny = h, maxy = 0, touch = 0;
      while (sp) {
        const p = stack[--sp]; area++;
        const x = p % w, y = (p / w) | 0;
        if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y;
        if (x === 0 || y === 0 || x === w - 1 || y === h - 1) touch++;
        if (x > 0) { const q = p - 1; if (mask[q] && !lab[q]) { lab[q] = id; stack[sp++] = q; } }
        if (x < w - 1) { const q = p + 1; if (mask[q] && !lab[q]) { lab[q] = id; stack[sp++] = q; } }
        if (y > 0) { const q = p - w; if (mask[q] && !lab[q]) { lab[q] = id; stack[sp++] = q; } }
        if (y < h - 1) { const q = p + w; if (mask[q] && !lab[q]) { lab[q] = id; stack[sp++] = q; } }
      }
      if (area >= minArea) comps.push({ id, area, minx, maxx, miny, maxy, touch });
    }
    return { lab, comps };
  }
  function boxSum(src, w, h, r) { // 정사각 r 반경 안 1 개수
    const I = new Int32Array((w + 1) * (h + 1));
    for (let y = 0; y < h; y++) { let row = 0; for (let x = 0; x < w; x++) { row += src[y * w + x]; I[(y + 1) * (w + 1) + x + 1] = I[y * (w + 1) + x + 1] + row; } }
    const out = new Int32Array(w * h);
    for (let y = 0; y < h; y++) {
      const y0 = Math.max(0, y - r), y1 = Math.min(h - 1, y + r);
      for (let x = 0; x < w; x++) {
        const x0 = Math.max(0, x - r), x1 = Math.min(w - 1, x + r);
        out[y * w + x] = I[(y1 + 1) * (w + 1) + x1 + 1] - I[y0 * (w + 1) + x1 + 1] - I[(y1 + 1) * (w + 1) + x0] + I[y0 * (w + 1) + x0];
      }
    }
    return out;
  }
  const dilate = (m, w, h, r) => { const s = boxSum(m, w, h, r), o = new Uint8Array(w * h); for (let i = 0; i < o.length; i++) o[i] = s[i] > 0 ? 1 : 0; return o; };
  const erode = (m, w, h, r) => { const s = boxSum(m, w, h, r), o = new Uint8Array(w * h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = (Math.min(w - 1, x + r) - Math.max(0, x - r) + 1) * (Math.min(h - 1, y + r) - Math.max(0, y - r) + 1); o[y * w + x] = s[y * w + x] === n ? 1 : 0; } return o; };
  function hull(pts) {
    pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    up.pop(); lo.pop(); return lo.concat(up);
  }
  const polyArea = (q) => { let a = 0; for (let i = 0; i < q.length; i++) { const p = q[i], n = q[(i + 1) % q.length]; a += p[0] * n[1] - n[0] * p[1]; } return Math.abs(a) / 2; };
  function quadFromHull(H) {
    const n = H.length; if (n < 4) return null;
    let ia = 0, ib = 0, bd = -1;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const d = (H[i][0] - H[j][0]) ** 2 + (H[i][1] - H[j][1]) ** 2; if (d > bd) { bd = d; ia = i; ib = j; } }
    const far = (from, to) => { let bi = -1, bv = -1; for (let k = (from + 1) % n; k !== to; k = (k + 1) % n) { const a = H[from], b = H[to], p = H[k]; const v = Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])); if (v > bv) { bv = v; bi = k; } } return bi; };
    let idx = [ia, far(ia, ib), ib, far(ib, ia)];
    if (idx.includes(-1)) return null;
    for (let it = 0; it < 4; it++) {
      for (let s = 0; s < 4; s++) {
        const prev = idx[(s + 3) % 4], next = idx[(s + 1) % 4]; let best = idx[s], bestA = polyArea(idx.map((i) => H[i]));
        for (let k = (prev + 1) % n; k !== next; k = (k + 1) % n) { const t = idx.slice(); t[s] = k; const a = polyArea(t.map((i) => H[i])); if (a > bestA) { bestA = a; best = k; } }
        idx[s] = best;
      }
    }
    return idx.map((i) => H[i].slice());
  }
  function orderQuad(q) { // 시계 방향, 왼쪽 위부터
    const cx = q.reduce((a, p) => a + p[0], 0) / 4, cy = q.reduce((a, p) => a + p[1], 0) / 4;
    const s = q.slice().sort((a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx));
    let k = 0, best = Infinity; s.forEach((p, i) => { if (p[0] + p[1] < best) { best = p[0] + p[1]; k = i; } });
    return [0, 1, 2, 3].map((i) => s[(k + i) % 4]);
  }
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  function solve(A, b) {
    const n = b.length, M = A.map((r, i) => r.concat(b[i]));
    for (let c = 0; c < n; c++) {
      let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      [M[c], M[p]] = [M[p], M[c]]; if (Math.abs(M[c][c]) < 1e-12) return null;
      for (let r = 0; r < n; r++) { if (r === c) continue; const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
    }
    return M.map((r, i) => r[n] / r[i]);
  }
  function homography(src, dst) {
    const A = [], b = [];
    for (let i = 0; i < 4; i++) { const [x, y] = src[i], [u, v] = dst[i]; A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u); A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v); }
    const h = solve(A, b); return h ? h.concat(1) : null;
  }
  const applyH = (h, x, y) => { const w = h[6] * x + h[7] * y + h[8]; return [(h[0] * x + h[1] * y + h[2]) / w, (h[3] * x + h[4] * y + h[5]) / w]; };
  function invH(m) {
    const [a, b, c, d, e, f, g, h, i] = m, A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g, det = a * A + b * B + c * C;
    return [A / det, -(b * i - c * h) / det, (b * f - c * e) / det, B / det, (a * i - c * g) / det, -(a * f - c * d) / det, C / det, -(a * h - b * g) / det, (a * e - b * d) / det];
  }
  const mul3 = (A, B) => { const o = new Array(9); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) o[r * 3 + c] = A[r * 3] * B[c] + A[r * 3 + 1] * B[3 + c] + A[r * 3 + 2] * B[6 + c]; return o; };
  function inQuad(q, x, y) { // 볼록 사각형 안인지
    let sg = 0;
    for (let i = 0; i < 4; i++) { const a = q[i], b = q[(i + 1) % 4], c = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]); if (!c) continue; const s = c > 0 ? 1 : -1; if (!sg) sg = s; else if (s !== sg) return false; }
    return true;
  }
  function segDist(px, py, a, b) { const vx = b[0] - a[0], vy = b[1] - a[1], L2 = vx * vx + vy * vy || 1, t = Math.max(0, Math.min(1, ((px - a[0]) * vx + (py - a[1]) * vy) / L2)); return Math.hypot(px - a[0] - vx * t, py - a[1] - vy * t); }
  function lineFit(P) { // 직교 최소제곱 직선
    const n = P.length; let mx = 0, my = 0; for (const p of P) { mx += p[0]; my += p[1]; } mx /= n; my /= n;
    let sxx = 0, syy = 0, sxy = 0; for (const p of P) { const dx = p[0] - mx, dy = p[1] - my; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; }
    const th = 0.5 * Math.atan2(2 * sxy, sxx - syy); return { px: mx, py: my, dx: Math.cos(th), dy: Math.sin(th) };
  }
  const lineRes = (p, f) => Math.abs((p[0] - f.px) * -f.dy + (p[1] - f.py) * f.dx);
  function lineX(l1, l2) { const det = l1.dx * -l2.dy - l1.dy * -l2.dx; if (Math.abs(det) < 1e-6) return null; const t = ((l2.px - l1.px) * -l2.dy - (l2.py - l1.py) * -l2.dx) / det; return [l1.px + l1.dx * t, l1.py + l1.dy * t]; }
  function robustLine(P) { // 튀는 점을 덜어 내며 세 번 다시 맞춤
    let f = lineFit(P);
    for (let it = 0; it < 3; it++) {
      const r = P.map((p) => lineRes(p, f)).sort((a, b) => a - b), lim = Math.max(1.2, r[r.length >> 1] * 2.5);
      const K = P.filter((p) => lineRes(p, f) < lim); if (K.length < 6) break; f = lineFit(K);
    }
    return f;
  }
  function lab(r, g, b) {
    const f = (c) => { c /= 255; return c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92; };
    const R = f(r), G = f(g), B = f(b);
    let X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047, Y = R * 0.2126 + G * 0.7152 + B * 0.0722, Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
    const t = (v) => v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116; X = t(X); Y = t(Y); Z = t(Z);
    return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
  }

  /* ── 1. A4 찾기 ── */
  function findA4(img) {
    const { w, h, d } = img, n = w * h, wh = new Float32Array(n), hist = new Int32Array(101);
    for (let i = 0; i < n; i++) {
      const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      const v = mx / 255, s = mx ? (mx - mn) / mx : 0, val = v * (1 - 1.6 * s);
      wh[i] = val; hist[Math.max(0, Math.min(100, Math.round(val * 100)))]++;
    }
    const cands = [];
    const base = otsu(hist) / 100;
    const open = Math.max(2, Math.round(Math.max(w, h) / 300)); // 종이에 붙은 가는 선(바닥 몰딩)·옷 끝을 떼어 내는 굵기
    for (const [th, cut] of [[Math.max(0.5, base), 0], [0.62, 0], [0.72, 0], [0.8, 0], [0.72, open], [0.8, open], [0.87, open]]) {
      const m = new Uint8Array(n); for (let i = 0; i < n; i++) m[i] = wh[i] > th ? 1 : 0;
      let mm = erode(dilate(m, w, h, 1), w, h, 1);
      if (cut) mm = dilate(erode(mm, w, h, cut), w, h, cut);
      const { lab: L, comps } = components(mm, w, h, n * 0.002);
      for (const c of comps) {
        if (c.area > n * 0.35) continue;
        const pts = [];
        for (let y = c.miny; y <= c.maxy; y++) {
          let l = -1, r = -1; for (let x = c.minx; x <= c.maxx; x++) if (L[y * w + x] === c.id) { if (l < 0) l = x; r = x; }
          if (l >= 0) { pts.push([l, y]); pts.push([r + 1, y]); }
        }
        const H = hull(pts), q = quadFromHull(H); if (!q) continue;
        const qa0 = polyArea(q); if (c.area / qa0 < 0.8 || c.area / qa0 > 1.12) continue;
        // 볼록 껍질 꼭짓점은 잡티 하나에도 끌려가므로, 덩어리 테두리 점에 네 변을 다시 맞춘다
        const o = fitQuadComp(L, c, w, h, orderQuad(q)); if (!o || o.straight < 0.85) continue;
        const qa = polyArea(o);
        let inside = 0, outside = 0;
        for (let y = c.miny; y <= c.maxy; y++) for (let x = c.minx; x <= c.maxx; x++) if (L[y * w + x] === c.id) { if (inQuad(o, x + 0.5, y + 0.5)) inside++; else outside++; }
        const fill = inside / qa, outF = outside / qa;
        // 종이는 사각형을 꽉 채우고 바깥으로 삐져나온 부분이 거의 없다 (흰 옷 몸판은 소매·목이 삐져나옴)
        if (fill < 0.9 || outF > 0.06) continue;
        let okAng = true; for (let i = 0; i < 4; i++) { const p = o[(i + 3) % 4], c0 = o[i], nx = o[(i + 1) % 4]; const v1 = [p[0] - c0[0], p[1] - c0[1]], v2 = [nx[0] - c0[0], nx[1] - c0[1]]; const ang = Math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(...v1) * Math.hypot(...v2))) * 180 / Math.PI; if (ang < 55 || ang > 125) okAng = false; }
        if (!okAng) continue;
        const e = [dist(o[0], o[1]), dist(o[1], o[2]), dist(o[2], o[3]), dist(o[3], o[0])], hv = (e[0] + e[2]) / 2, vv = (e[1] + e[3]) / 2, ratio = Math.max(hv, vv) / Math.min(hv, vv);
        if (ratio < 1.12 || ratio > 2.1) continue;
        const ratioScore = 1 - Math.min(1, Math.abs(ratio - 1.414) / 0.7);
        cands.push({ quad: o, fill, outF, ratio, area: qa, th, score: Math.sqrt(qa) * Math.pow(Math.min(fill, 1), 8) * Math.max(0, 1 - outF * 8) * (0.5 + ratioScore) });
      }
    }
    if (!cands.length) return null;
    cands.sort((a, b) => b.score - a.score);
    const best = cands[0];
    best.conf = Math.min(1, (Math.min(1, best.fill) - 0.9) / 0.08) * 0.45 + (1 - Math.min(1, best.outF / 0.06)) * 0.2 + (1 - Math.min(1, Math.abs(best.ratio - 1.414) / 0.6)) * 0.35;
    return best;
  }
  function fitQuadComp(L, c, w, h, q0) {
    const minE = Math.min(...[0, 1, 2, 3].map((i) => dist(q0[i], q0[(i + 1) % 4]))), tol = Math.max(3, minE * 0.12), G = [[], [], [], []], all = []; let far = 0;
    for (let y = c.miny; y <= c.maxy; y++) for (let x = c.minx; x <= c.maxx; x++) {
      const i = y * w + x; if (L[i] !== c.id) continue;
      if (x > 0 && y > 0 && x < w - 1 && y < h - 1 && L[i - 1] === c.id && L[i + 1] === c.id && L[i - w] === c.id && L[i + w] === c.id) continue;
      // 테두리 화소의 바깥 경계(0.5칸 바깥)를 쓴다
      let ex = x + 0.5, ey = y + 0.5;
      if (x === 0 || L[i - 1] !== c.id) ex -= 0.5; else if (x === w - 1 || L[i + 1] !== c.id) ex += 0.5;
      if (y === 0 || L[i - w] !== c.id) ey -= 0.5; else if (y === h - 1 || L[i + w] !== c.id) ey += 0.5;
      let bj = -1, bd = tol;
      for (let j = 0; j < 4; j++) { const d = segDist(ex, ey, q0[j], q0[(j + 1) % 4]); if (d < bd) { bd = d; bj = j; } }
      if (bj >= 0) G[bj].push([ex, ey]); else far++;
      all.push([ex, ey]);
    }
    if (G.some((P) => P.length < 6)) return null;
    const lines = G.map(robustLine), out = [];
    for (let i = 0; i < 4; i++) { const p = lineX(lines[(i + 3) % 4], lines[i]); if (!p || dist(p, q0[i]) > tol * 2.5) return null; out.push(p); }
    // 테두리 점 중 네 직선 위(2칸 안)에 있는 비율: 종이는 거의 1, 옷은 소매·목선 때문에 낮음
    let on = 0; for (const q of all) if (Math.min(...lines.map((l) => lineRes(q, l))) < 2) on++;
    out.straight = all.length ? on / all.length : 0;
    return out;
  }

  function refineQuad(full, quad) {
    const { w, h, d } = full, gray = (x, y) => { if (x < 0 || y < 0 || x >= w - 1 || y >= h - 1) return null; const ix = x | 0, iy = y | 0, ax = x - ix, ay = y - iy, g = (i) => d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114, i00 = (iy * w + ix) * 4; return (g(i00) * (1 - ax) + g(i00 + 4) * ax) * (1 - ay) + (g(i00 + w * 4) * (1 - ax) + g(i00 + w * 4 + 4) * ax) * ay; };
    const cx = quad.reduce((a, p) => a + p[0], 0) / 4, cy = quad.reduce((a, p) => a + p[1], 0) / 4, lines = [];
    for (let e = 0; e < 4; e++) {
      const a = quad[e], b = quad[(e + 1) % 4], L = dist(a, b), tx = (b[0] - a[0]) / L, ty = (b[1] - a[1]) / L;
      let nx = -ty, ny = tx; const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; if ((mx - cx) * nx + (my - cy) * ny < 0) { nx = -nx; ny = -ny; }
      const R = Math.max(4, Math.min(14, L * 0.03)), pts = [];
      for (let k = 0; k < 48; k++) {
        const t = 0.12 + 0.76 * k / 47, px = a[0] + (b[0] - a[0]) * t, py = a[1] + (b[1] - a[1]) * t;
        let best = 0, bo = null, prev = gray(px - nx * R, py - ny * R);
        const prof = [];
        for (let o = -R; o <= R; o += 0.5) prof.push(gray(px + nx * o, py + ny * o));
        if (prof.some((v) => v == null)) continue;
        for (let j = 1; j < prof.length - 1; j++) { const gdd = prof[j - 1] - prof[j + 1]; if (gdd > best) { best = gdd; bo = j; } }
        if (bo == null || best < 12) continue;
        const g0 = prof[bo - 2] != null && bo > 1 ? prof[bo - 2] - prof[bo] : best, g2 = bo + 2 < prof.length ? prof[bo] - prof[bo + 2] : best;
        const den = g0 - 2 * best + g2, sub = den ? 0.5 * (g0 - g2) / den : 0, off = -R + (bo + Math.max(-0.5, Math.min(0.5, sub))) * 0.5;
        pts.push([px + nx * off, py + ny * off]);
      }
      if (pts.length < 10) return null;
      let f = lineFit(pts);
      const keep = pts.filter((p) => lineRes(p, f) < 1.5); if (keep.length >= 8) f = lineFit(keep);
      lines.push(f);
    }
    const out = [];
    for (let i = 0; i < 4; i++) { const p = lineX(lines[(i + 3) % 4], lines[i]); if (!p || dist(p, quad[i]) > Math.max(10, dist(quad[0], quad[2]) * 0.06)) return null; out.push(p); }
    return out;
  }

  /* ── 2. 원근 보정 (사진 → 바닥 평면 mm) ── */
  function planeOf(quad) {
    const o = quad, e = [dist(o[0], o[1]), dist(o[1], o[2]), dist(o[2], o[3]), dist(o[3], o[0])];
    const land = (e[0] + e[2]) / 2 > (e[1] + e[3]) / 2, pw = land ? A4L : A4S, ph = land ? A4S : A4L;
    const H = homography(o, [[0, 0], [pw, 0], [pw, ph], [0, ph]]);
    return { H, pw, ph, inA4: (X, Y, m) => X > -m && X < pw + m && Y > -m && Y < ph + m };
  }
  // 바닥 평면을 A4 가운데를 축으로 돌린다. 옷은 A4 방향이 아니라 화면 방향(사용자가 맞춘 가이드)에 맞춰 세운다
  function rotPlane(pl, th) {
    const c = Math.cos(th), s = Math.sin(th), cx = pl.pw / 2, cy = pl.ph / 2;
    const T = [c, -s, cx - c * cx + s * cy, s, c, cy - s * cx - c * cy, 0, 0, 1], H = mul3(T, pl.H);
    return { H, pw: pl.pw, ph: pl.ph, th, inA4: (X, Y, m) => { const dx = X - cx, dy = Y - cy, xa = cx + dx * c + dy * s, ya = cy - dx * s + dy * c; return xa > -m && xa < pl.pw + m && ya > -m && ya < pl.ph + m; } };
  }
  function rectify(full, Hm, maxPx) {
    const { w, h, d } = full, cs = [[0, 0], [w, 0], [w, h], [0, h]].map((p) => applyH(Hm, p[0], p[1]));
    const lim = 1300;
    let x0 = Math.max(-lim, Math.min(...cs.map((p) => p[0]))), x1 = Math.min(lim + A4L, Math.max(...cs.map((p) => p[0])));
    let y0 = Math.max(-lim, Math.min(...cs.map((p) => p[1]))), y1 = Math.min(lim + A4L, Math.max(...cs.map((p) => p[1])));
    if (!(x1 > x0 && y1 > y0)) return null;
    const s = Math.min(2.4, maxPx / Math.max(x1 - x0, y1 - y0)), W = Math.ceil((x1 - x0) * s), Ht = Math.ceil((y1 - y0) * s);
    const inv = invH(Hm), out = new Uint8ClampedArray(W * Ht * 4), valid = new Uint8Array(W * Ht);
    for (let v = 0; v < Ht; v++) {
      const Y = y0 + v / s;
      for (let u = 0; u < W; u++) {
        const X = x0 + u / s, q = inv[6] * X + inv[7] * Y + inv[8];
        const fx = (inv[0] * X + inv[1] * Y + inv[2]) / q, fy = (inv[3] * X + inv[4] * Y + inv[5]) / q;
        if (fx < 0 || fy < 0 || fx >= w - 1 || fy >= h - 1) continue;
        const ix = fx | 0, iy = fy | 0, ax = fx - ix, ay = fy - iy, i00 = (iy * w + ix) * 4, i10 = i00 + 4, i01 = i00 + w * 4, i11 = i01 + 4, o = (v * W + u) * 4;
        for (let c = 0; c < 3; c++) out[o + c] = (d[i00 + c] * (1 - ax) + d[i10 + c] * ax) * (1 - ay) + (d[i01 + c] * (1 - ax) + d[i11 + c] * ax) * ay;
        out[o + 3] = 255; valid[v * W + u] = 1;
      }
    }
    return { W, H: Ht, s, x0, y0, rgba: out, valid };
  }

  /* ── 2-1. 인공지능 옷 분할: 사람·배경·바닥을 빼고 옷만 (SegFormer 옷 모델, 브라우저 안에서) ── */
  let aiP = null;
  const aiState = { phase: 'idle', pct: 0, files: {} }; // 모델 받기 진행률 (화면 게이지용)
  function aiLoad() {
    if (!aiP) aiP = (async () => {
      aiState.phase = 'load';
      const T = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1');
      T.env.allowLocalModels = false;
      // 휴대폰 코어 여러 개로 계산 (서버가 교차 출처 격리 헤더를 줄 때만 가능)
      try { if (self.crossOriginIsolated) T.env.backends.onnx.wasm.numThreads = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 2) - 1)); } catch (e) { }
      const pipe = await T.pipeline('image-segmentation', 'Xenova/segformer_b2_clothes', { dtype: 'q8', progress_callback: (e) => {
        if (e && e.status === 'progress' && e.total) { aiState.files[e.file] = [e.loaded, e.total]; let a = 0, b = 0; for (const [l, t] of Object.values(aiState.files)) { a += l; b += t; } aiState.phase = 'download'; aiState.pct = b ? a / b : 0; if (window.NaranMeasure && NaranMeasure.onAi) NaranMeasure.onAi(aiState); }
      } });
      aiState.phase = 'ready'; aiState.pct = 1; if (window.NaranMeasure && NaranMeasure.onAi) NaranMeasure.onAi(aiState);
      return pipe;
    })().catch((e) => { aiP = null; aiState.phase = 'fail'; throw e; });
    return aiP;
  }
  const AI_SET = { flat: ['Upper-clothes', 'Skirt', 'Pants', 'Dress', 'Belt', 'Scarf'], top: ['Upper-clothes'], outer: ['Upper-clothes'], bottom: ['Pants', 'Skirt', 'Belt'], flatTop: ['Upper-clothes', 'Dress', 'Scarf'], flatBottom: ['Pants', 'Skirt', 'Dress', 'Belt'] };
  async function aiMask(canvas, mode) { // → { w, h, m } m: 옷이면 1
    const seg = await aiLoad(), out = await seg(canvas.toDataURL('image/jpeg', 0.92));
    if (!out || !out.length) return null;
    const w = out[0].mask.width, h = out[0].mask.height, m = new Uint8Array(w * h);
    const add = (names) => { let c = 0; for (const o of out) if (names.includes(o.label)) { const d = o.mask.data; for (let i = 0; i < d.length; i++) if (d[i] > 127 && !m[i]) { m[i] = 1; c++; } } return c; };
    let c = mode === 'all' ? add(out.map((o) => o.label).filter((l) => l !== 'Background')) : add(AI_SET[mode] || AI_SET.flat); // all: 배경만 빼고 사람까지 그대로
    if (mode !== 'flat' && mode !== 'all') { // 옷 일부를 원피스로 잘못 보는 경우
      const cnt = (names) => { let k = 0; for (const o of out) if (names.includes(o.label)) { const d = o.mask.data; for (let i = 0; i < d.length; i++) if (d[i] > 127) k++; } return k; };
      const person = cnt(['Face', 'Hair', 'Left-arm', 'Right-arm', 'Left-leg', 'Right-leg']) > w * h * 0.004;
      const D = new Uint8Array(w * h); let dn = 0; for (const o of out) if (o.label === 'Dress') { const d = o.mask.data; for (let i = 0; i < d.length; i++) if (d[i] > 127 && !m[i]) { D[i] = 1; dn++; } }
      if (mode === 'bottom' && c > 0) { // 검은 바지 일부를 상의로 잘못 보는 경우: 허리선 아래, 바지에 붙어 있고 바지 폭 안이면 바지로
        let px0 = w, px1 = -1, py0 = h, py1 = -1; for (let i = 0; i < w * h; i++) if (m[i]) { const x = i % w, y = (i / w) | 0; if (x < px0) px0 = x; if (x > px1) px1 = x; if (y < py0) py0 = y; if (y > py1) py1 = y; }
        const wy = py0 + (py1 - py0) * 0.08, Uq = new Uint8Array(w * h);
        for (const o of out) if (o.label === 'Upper-clothes') { const d = o.mask.data; for (let i = 0; i < d.length; i++) if (d[i] > 127 && !m[i] && (i / w | 0) > wy) Uq[i] = 1; }
        const { lab: LU, comps: CU } = components(Uq, w, h, 1), tU = new Set();
        for (let i = 0; i < w * h; i++) if (LU[i]) { const x = i % w; if ((x > 0 && m[i - 1]) || (x < w - 1 && m[i + 1]) || (i >= w && m[i - w]) || (i < w * h - w && m[i + w])) tU.add(LU[i]); }
        const okU = new Set(CU.filter((cc) => tU.has(cc.id) && cc.minx >= px0 - (px1 - px0) * 0.05 && cc.maxx <= px1 + (px1 - px0) * 0.05).map((cc) => cc.id));
        for (let i = 0; i < w * h; i++) if (okU.has(LU[i])) { m[i] = 1; c++; }
      }
      if (person && dn > c * 0.5) { // 사람이 입은 사진에서 상·하의를 한 벌로 본 경우: 허리(가장 좁은 줄)에서 나눔
        const U = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) U[i] = m[i] || D[i];
        let y0 = h, y1 = -1; const rw = new Int32Array(h); for (let i = 0; i < w * h; i++) if (U[i]) { const y = (i / w) | 0; rw[y]++; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        let wy = -1, wb = Infinity; for (let y = Math.round(y0 + (y1 - y0) * 0.2); y <= y0 + (y1 - y0) * 0.6; y++) if (rw[y] > 0 && rw[y] < wb) { wb = rw[y]; wy = y; }
        if (wy > 0) { m.fill(0); c = 0; for (let i = 0; i < w * h; i++) if (U[i] && (mode === 'bottom' ? (i / w | 0) >= wy : (i / w | 0) < wy)) { m[i] = 1; c++; } }
      } else {
        const { lab: LD } = components(D, w, h, 1), touch = new Set();
        for (let i = 0; i < w * h; i++) if (LD[i]) { const x = i % w; if ((x > 0 && m[i - 1]) || (x < w - 1 && m[i + 1]) || (i >= w && m[i - w]) || (i < w * h - w && m[i + w])) touch.add(LD[i]); }
        for (let i = 0; i < w * h; i++) if (LD[i] && (touch.has(LD[i]) || c < w * h * 0.02)) { m[i] = 1; c++; }
      }
    }
    if (c < w * h * 0.01 && mode !== 'flat') c += add(AI_SET.flat);
    return c ? { w, h, m, frac: c / (w * h) } : null;
  }
  // 상품 사진(모델컷 포함)에서 옷만 오려 낸 투명 그림
  async function aiCutout(src, cat) {
    const g = grab(src, 1024), am = await aiMask(g.c, cat === 'all' ? 'all' : cat === 'bottom' ? 'bottom' : 'top');
    if (!am) return null;
    const { w, h } = am; let m = am.m;
    const { lab: L, comps } = components(m, w, h, 20); if (!comps.length) return null;
    comps.sort((a, b) => b.area - a.area);
    const c0 = comps[0], gx = (c0.maxx - c0.minx) * 0.04, gy = (c0.maxy - c0.miny) * 0.04;
    const keep = new Set(comps.filter((c) => c.area >= c0.area * 0.08 && c.minx <= c0.maxx + gx && c.maxx >= c0.minx - gx && c.miny <= c0.maxy + gy && c.maxy >= c0.miny - gy).map((c) => c.id)); // 팔에 가려 나뉜 조각도 함께 (멀리 떨어진 다른 옷은 빼고)
    m = new Uint8Array(w * h); let tot = 0; for (let i = 0; i < w * h; i++) if (keep.has(L[i])) { m[i] = 1; tot++; }
    { const inv = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) inv[i] = m[i] ? 0 : 1; const { lab: LH, comps: CH } = components(inv, w, h, 1), small = new Set(CH.filter((c) => c.area < tot * 0.03 && c.minx > 0 && c.miny > 0 && c.maxx < w - 1 && c.maxy < h - 1).map((c) => c.id)); for (let i = 0; i < w * h; i++) if (small.has(LH[i])) m[i] = 1; }
    let x0 = w, x1 = 0, y0 = h, y1 = 0;
    for (let i = 0; i < w * h; i++) if (m[i]) { const x = i % w, y = (i / w) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    // 가장자리 부드럽게: 3×3 평균을 투명도로
    const mg = Math.round(Math.max(x1 - x0, y1 - y0) * 0.04), cx0 = Math.max(0, x0 - mg), cy0 = Math.max(0, y0 - mg), W = Math.min(w, x1 + mg + 1) - cx0, H = Math.min(h, y1 + mg + 1) - cy0;
    const sc = g.c.width / w, c = document.createElement('canvas'); c.width = Math.round(W * sc); c.height = Math.round(H * sc);
    const ctx = c.getContext('2d'); ctx.drawImage(g.c, cx0 * sc, cy0 * sc, W * sc, H * sc, 0, 0, c.width, c.height);
    const id = ctx.getImageData(0, 0, c.width, c.height);
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      const fx = cx0 + (x + 0.5) / sc, fy = cy0 + (y + 0.5) / sc; let s2 = 0, n2 = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = Math.round(fx - 0.5 + dx * 0.7), yy = Math.round(fy - 0.5 + dy * 0.7); if (xx < 0 || yy < 0 || xx >= w || yy >= h) { n2++; continue; } s2 += m[yy * w + xx]; n2++; }
      id.data[(y * c.width + x) * 4 + 3] = Math.round(255 * Math.min(1, Math.max(0, (s2 / n2 - 0.2) / 0.6)));
    }
    ctx.putImageData(id, 0, 0);
    return { canvas: c, frac: am.frac };
  }

  /* ── 3. 옷 분리 ── */
  function segment(R, plane, maxSeg, roiFn, seedP, ai) {
    const f = Math.min(1, maxSeg / Math.max(R.W, R.H)), w = Math.max(1, Math.round(R.W * f)), h = Math.max(1, Math.round(R.H * f)), sg = R.s * f;
    const n = w * h, L = new Float32Array(n), A = new Float32Array(n), B = new Float32Array(n), valid = new Uint8Array(n);
    // 상자 평균으로 줄이면서 Lab 변환 (나뭇결 같은 잔무늬도 같이 눌러 줌)
    const step = 1 / f;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, c = 0, vc = 0;
      const sx0 = Math.floor(x * step), sx1 = Math.min(R.W - 1, Math.floor((x + 1) * step)), sy0 = Math.floor(y * step), sy1 = Math.min(R.H - 1, Math.floor((y + 1) * step));
      for (let yy = sy0; yy <= sy1; yy++) for (let xx = sx0; xx <= sx1; xx++) { const i = yy * R.W + xx; vc++; if (!R.valid[i]) continue; const o = i * 4; r += R.rgba[o]; g += R.rgba[o + 1]; b += R.rgba[o + 2]; c++; }
      const i = y * w + x; if (c < vc * 0.9 || !c) continue;
      const lb = lab(r / c, g / c, b / c); L[i] = lb[0]; A[i] = lb[1]; B[i] = lb[2]; valid[i] = 1;
    }
    // 가벼운 흐림 (3×3)
    const bl = (src) => { const o = new Float32Array(n); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let s = 0, c = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; const j = yy * w + xx; if (!valid[j]) continue; s += src[j]; c++; } o[y * w + x] = c ? s / c : 0; } return o; };
    const Lb = bl(L), Ab = bl(A), Bb = bl(B);
    const X = (x) => R.x0 + x / sg, Y = (y) => R.y0 + y / sg;
    const inA4 = (x, y, m) => plane.inA4(X(x), Y(y), m);
    // 바닥 표본: A4 주변 띠 + 사진 가장자리 띠
    const ring = [], edge = [];
    const vEro = erode(valid, w, h, Math.max(2, Math.round(Math.max(w, h) * 0.035)));
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x; if (!valid[i]) continue;
      if (roiFn) { const rr = roiFn(X(x), Y(y)); if (rr < 0) continue; if (inA4(x, y, 34) && !inA4(x, y, 12)) ring.push(i); else if (rr < 0.05 && !inA4(x, y, 12)) edge.push(i); continue; }
      if (inA4(x, y, 34) && !inA4(x, y, 12)) ring.push(i);
      else if (!vEro[i] && !inA4(x, y, 12)) edge.push(i);
    }
    let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296;
    const pick = (arr, k) => { const o = []; for (let j = 0; j < k && arr.length; j++) o.push(arr[(rnd() * arr.length) | 0]); return o; };
    const kmeans = (idx, k) => {
      if (!idx.length) return [];
      let C = []; for (let j = 0; j < k; j++) { const i = idx[(j * 997 + 13) % idx.length]; C.push([Lb[i], Ab[i], Bb[i]]); }
      for (let it = 0; it < 12; it++) {
        const S = C.map(() => [0, 0, 0, 0]);
        for (const i of idx) { let bj = 0, bd = Infinity; for (let j = 0; j < k; j++) { const dd = (Lb[i] - C[j][0]) ** 2 + (Ab[i] - C[j][1]) ** 2 + (Bb[i] - C[j][2]) ** 2; if (dd < bd) { bd = dd; bj = j; } } const s = S[bj]; s[0] += Lb[i]; s[1] += Ab[i]; s[2] += Bb[i]; s[3]++; }
        C = C.map((c, j) => S[j][3] ? [S[j][0] / S[j][3], S[j][1] / S[j][3], S[j][2] / S[j][3]] : c);
      }
      return C;
    };
    const ringS = pick(ring, 2500), ringC = kmeans(ringS, 2);
    // 옷 지점 색: 가이드 몸판 가운데(사용자가 옷을 맞춘 곳) 주변의 중앙값
    let seedC = null, seedI = -1;
    if (seedP) { const sx = Math.round((seedP[0] - R.x0) * sg), sy = Math.round((seedP[1] - R.y0) * sg), rad = Math.max(2, Math.round(sg * 25)), Ls = [], As = [], Bs = [];
      for (let y = sy - rad; y <= sy + rad; y++) for (let x = sx - rad; x <= sx + rad; x++) { if (x < 0 || y < 0 || x >= w || y >= h) continue; const i = y * w + x; if (!valid[i] || inA4(x, y, 15)) continue; Ls.push(Lb[i]); As.push(Ab[i]); Bs.push(Bb[i]); }
      const med = (a) => a.sort((u, v) => u - v)[a.length >> 1]; if (Ls.length > 8) { seedC = [med(Ls), med(As), med(Bs)]; if (sx >= 0 && sy >= 0 && sx < w && sy < h) seedI = sy * w + sx; } }
    const nearSeed = (c) => seedC && Math.hypot(c[0] - seedC[0], c[1] - seedC[1], c[2] - seedC[2]) < 14;
    let floor = ringC.slice(), a4OnGarment = false, domC = null;
    if (edge.length) {
      const es = pick(edge, 2500), edgeC = kmeans(es, 3), cnt = edgeC.map(() => 0);
      for (const i of es) { let bj = 0, bd = Infinity; edgeC.forEach((c, j) => { const dd = (Lb[i] - c[0]) ** 2 + (Ab[i] - c[1]) ** 2 + (Bb[i] - c[2]) ** 2; if (dd < bd) { bd = dd; bj = j; } }); cnt[bj]++; }
      const share = cnt.map((v) => v / Math.max(1, es.length)), dist3 = (a, b2) => Math.hypot(a[0] - b2[0], a[1] - b2[1], a[2] - b2[2]);
      domC = edgeC[share.indexOf(Math.max(...share))]; // 테두리에서 가장 많이 보이는 색 = 바닥
      // A4 둘레 색이 사진 가장자리의 주된 색(바닥)과 같으면 A4는 바닥 위 → 둘레 색을 바닥으로
      // 다르면 A4를 옷 위에 올린 것 → 둘레 색(=옷)은 버리고 가장자리 색만 바닥으로
      const onFloor = ringC.some((r) => edgeC.some((c, j) => share[j] >= 0.2 && dist3(c, r) < 22));
      if (onFloor) { for (const c of edgeC) { const dmin = Math.min(...ringC.map((r) => dist3(c, r))); if (dmin < 22) floor.push(c); } }
      else { a4OnGarment = true; floor = edgeC.filter((c, j) => share[j] >= 0.15); }
    }
    if (seedC) { const f2 = floor.filter((c) => !nearSeed(c)); if (f2.length) floor = f2; }
    if (!floor.length) return null;
    // 옷 지점을 따로 안 받았으면: 사진 가운데에서 가장 가까운, 바닥 색과 확실히 다른 곳 (A4 제외)
    if (seedI < 0) {
      let cx0 = w >> 1, cy0 = h >> 1, rw0 = w, rh0 = h;
      if (roiFn) { let a0 = w, a1 = 0, b0 = h, b1 = 0; for (let y = 0; y < h; y += 3) for (let x = 0; x < w; x += 3) if (valid[y * w + x] && roiFn(X(x), Y(y)) >= 0) { if (x < a0) a0 = x; if (x > a1) a1 = x; if (y < b0) b0 = y; if (y > b1) b1 = y; } if (a1 > a0) { cx0 = (a0 + a1) >> 1; cy0 = (b0 + b1) >> 1; rw0 = a1 - a0; rh0 = b1 - b0; } }
      const maxR = Math.round(Math.min(rw0, rh0) * 0.45), ref = domC ? [domC] : floor, fd = (i) => Math.min(...ref.map((c) => Math.hypot(Lb[i] - c[0], (Ab[i] - c[1]) * 1.2, (Bb[i] - c[2]) * 1.2)));
      outer: for (let r = 0; r <= maxR; r += 2) for (let k = 0; k < Math.max(1, r * 4); k += 2) {
        const t = k / Math.max(1, r * 4) * Math.PI * 2, x = Math.round(cx0 + r * Math.cos(t)), y = Math.round(cy0 + r * Math.sin(t)); if (x < 2 || y < 2 || x >= w - 2 || y >= h - 2) continue;
        const i = y * w + x; if (!valid[i] || inA4(x, y, 15) || fd(i) < 28 || (roiFn && roiFn(X(x), Y(y)) < 0)) continue;
        let ok = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const j = i + dy * w + dx; if (valid[j] && fd(j) >= 22) ok++; }
        if (ok >= 20) { seedI = i; break outer; }
      }
      if (seedI >= 0) { const Ls = [], As = [], Bs = [], sx = seedI % w, sy = (seedI / w) | 0; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const j = (sy + dy) * w + sx + dx; if (j >= 0 && j < n && valid[j]) { Ls.push(Lb[j]); As.push(Ab[j]); Bs.push(Bb[j]); } } const med = (a) => a.sort((u, v) => u - v)[a.length >> 1]; seedC = [med(Ls), med(As), med(Bs)]; const f2 = floor.filter((c) => !nearSeed(c)); floor = f2.length ? f2 : domC ? [domC] : floor; }
    }
    const dmap = new Float32Array(n), hist = new Int32Array(101);
    for (let i = 0; i < n; i++) {
      if (!valid[i]) continue;
      let dm = Infinity; for (const c of floor) { const dd = Math.hypot(Lb[i] - c[0], (Ab[i] - c[1]) * 1.2, (Bb[i] - c[2]) * 1.2); if (dd < dm) dm = dd; }
      dmap[i] = dm; const x = i % w, y = (i / w) | 0; if (!inA4(x, y, 10)) hist[Math.min(100, Math.round(dm))]++;
    }
    const T = Math.max(13, Math.min(42, otsu(hist)));
    let m = new Uint8Array(n);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; m[i] = valid[i] && dmap[i] > T && !inA4(x, y, 8) && (!roiFn || roiFn(X(x), Y(y)) >= 0) ? 1 : 0; }
    // 무늬 옷(체크 등): 옷 지점 주변 지름 16cm 의 색들을 옷 색으로 배우고, 바닥보다 옷 색에 확실히 가까우면 옷으로
    let patterned = false;
    if (seedI >= 0) {
      const sx = seedI % w, sy = (seedI / w) | 0, rad = Math.max(4, Math.round(sg * 80)), gs = [];
      for (let y = sy - rad; y <= sy + rad; y += 2) for (let x = sx - rad; x <= sx + rad; x += 2) { if (x < 0 || y < 0 || x >= w || y >= h || (x - sx) ** 2 + (y - sy) ** 2 > rad * rad) continue; const i = y * w + x; if (valid[i] && !inA4(x, y, 12) && (!roiFn || roiFn(X(x), Y(y)) >= 0)) gs.push(i); }
      const GC = kmeans(pick(gs, 2000), 4).filter((c) => Math.min(...floor.map((f) => Math.hypot(c[0] - f[0], (c[1] - f[1]) * 1.2, (c[2] - f[2]) * 1.2))) > 9);
      if (GC.length) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x; if (m[i] || !valid[i] || inA4(x, y, 8) || (roiFn && roiFn(X(x), Y(y)) < 0)) continue;
        let dg = Infinity; for (const c of GC) { const d = Math.hypot(Lb[i] - c[0], (Ab[i] - c[1]) * 1.2, (Bb[i] - c[2]) * 1.2); if (d < dg) dg = d; }
        if (dg < 20 && dg < dmap[i] * 0.7) m[i] = 1;
      }
      // 옷 색이 서로 많이 다른 두 갈래 이상이면 무늬 옷 (체크·스트라이프)
      for (let a = 0; a < GC.length; a++) for (let b2 = a + 1; b2 < GC.length; b2++) if (Math.hypot(GC[a][0] - GC[b2][0], GC[a][1] - GC[b2][1], GC[a][2] - GC[b2][2]) > 14) patterned = true;
    }
    const r = Math.max(1, Math.round(sg * (patterned ? 14 : 4))); // 무늬 옷은 칸 사이 빈틈을 크게 메움
    const m0 = m;
    m = erode(dilate(m, w, h, r), w, h, r); // 닫기
    const ro = Math.max(2, Math.round(sg * 7)); m = dilate(erode(m, w, h, ro), w, h, ro); // 열기: 몰딩·끈 같은 가는 줄은 떼어 냄
    const { lab: Lc, comps } = components(m, w, h, 30);
    if (!comps.length && !ai) return null;
    comps.sort((a, b) => b.area - a.area);
    let top = comps[0] || { id: -1, area: 0 };
    if (seedI >= 0) { const sid = Lc[seedI]; let hit = sid ? comps.find((c) => c.id === sid) : null;
      if (!hit) { const sx = seedI % w, sy = (seedI / w) | 0; let bd = Infinity; for (const c of comps) { if (c.area < comps[0].area * 0.1) continue; const dx = Math.max(c.minx - sx, 0, sx - c.maxx), dy = Math.max(c.miny - sy, 0, sy - c.maxy), dd = Math.hypot(dx, dy); if (dd < bd) { bd = dd; hit = c; } } if (bd > Math.max(w, h) * 0.08) hit = null; }
      if (hit) top = hit; }
    const mask = new Uint8Array(n);
    for (let i = 0; i < n; i++) mask[i] = Lc[i] === top.id ? 1 : 0;
    // 구멍 메우기
    const bg = new Uint8Array(n), st = [];
    for (let x = 0; x < w; x++) { st.push(x, (h - 1) * w + x); } for (let y = 0; y < h; y++) { st.push(y * w, y * w + w - 1); }
    while (st.length) { const p = st.pop(); if (bg[p] || mask[p]) continue; bg[p] = 1; const x = p % w, y = (p / w) | 0; if (x > 0) st.push(p - 1); if (x < w - 1) st.push(p + 1); if (y > 0) st.push(p - w); if (y < h - 1) st.push(p + w); }
    for (let i = 0; i < n; i++) if (!bg[i]) mask[i] = 1;
    // 인공지능 옷 윤곽과 합치기: 둘이 잘 맞으면 색 경계(더 정밀)를 쓰고, 많이 다르면 인공지능 윤곽을 따름
    let mode = 'cv', iou = null, aiRaw = null, aiFill = null, judgeLog = null;
    if (ai) {
      const am = new Uint8Array(n);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x; if (!valid[i] || (roiFn && roiFn(X(x), Y(y)) < 0)) continue;
        if (inA4(x, y, 6)) { am[i] = mask[i]; continue; }
        const u = Math.floor(((x + 0.5) / f - ai.x0) * ai.k), v = Math.floor(((y + 0.5) / f - ai.y0) * ai.k);
        if (u >= 0 && v >= 0 && u < ai.w && v < ai.h && ai.m[v * ai.w + u] && (ai.pick == null || ai.lab[v * ai.w + u] === ai.pick)) am[i] = 1;
      }
      const C2 = components(am, w, h, 30);
      if (C2.comps.length) {
        C2.comps.sort((a, b) => b.area - a.area);
        const sel = C2.comps[0], A = new Uint8Array(n); aiRaw = new Uint8Array(n);
        for (let i = 0; i < n; i++) if (C2.lab[i] === sel.id) A[i] = aiRaw[i] = 1;
        const bg2 = new Uint8Array(n), st2 = []; // 구멍 메우기
        for (let x = 0; x < w; x++) { st2.push(x, (h - 1) * w + x); } for (let y = 0; y < h; y++) { st2.push(y * w, y * w + w - 1); }
        while (st2.length) { const p = st2.pop(); if (bg2[p] || A[p]) continue; bg2[p] = 1; const x = p % w, y = (p / w) | 0; if (x > 0) st2.push(p - 1); if (x < w - 1) st2.push(p + 1); if (y > 0) st2.push(p - w); if (y < h - 1) st2.push(p + w); }
        for (let i = 0; i < n; i++) if (!bg2[i]) A[i] = 1;
        let inter = 0, uni = 0, aArea = 0, cArea = 0; for (let i = 0; i < n; i++) { if (A[i]) aArea++; if (mask[i]) cArea++; if (A[i] && mask[i]) inter++; if (A[i] || mask[i]) uni++; }
        iou = uni ? inter / uni : 0;
        if (aArea >= 300 * 300 * 0.25 * sg * sg && aArea >= cArea * 0.3) {
          if (iou >= 0.88) { // 가장자리 6mm 띠 안에서만 색 경계를 쓰고, 가는 잡티(테이프·몰딩 선)는 떼어 냄
            const rb = Math.max(1, Math.round(sg * 6)), Ae = erode(A, w, h, rb), Ad = dilate(A, w, h, rb);
            for (let i = 0; i < n; i++) mask[i] = Ae[i] || (Ad[i] && mask[i]) ? 1 : 0;
            const r4 = Math.max(1, Math.round(sg * 4)), op = dilate(erode(mask, w, h, r4), w, h, r4); for (let i = 0; i < n; i++) mask[i] = op[i] || Ae[i] ? 1 : 0; mode = 'fuse';
          } else { // 많이 다르면: 윤곽선이 사진 속 경계에 잘 붙는 쪽 · 덜 들쭉날쭉한 쪽
            const judge = (M) => { let per = 0, area = 0, gs = 0; for (let y = 2; y < h - 2; y++) for (let x = 2; x < w - 2; x++) { const i = y * w + x; if (!M[i]) continue; area++; let b = 0, g = 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { if (M[i + dy * w + dx]) continue; b = 1; const j1 = i - dy * w - dx, j2 = i + 2 * (dy * w + dx); g = Math.max(g, Math.hypot(Lb[j1] - Lb[j2], Ab[j1] - Ab[j2], Bb[j1] - Bb[j2])); } if (b) { per++; gs += g; } } return { edge: per ? gs / per : 0, rag: per / Math.sqrt(Math.max(1, area)) }; };
            const jA = judge(A), jC = judge(mask), useAI = cArea < 300 * 300 * 0.25 * sg * sg || jA.edge >= jC.edge * 0.85 || jC.rag > jA.rag * 1.35;
            judgeLog = { ai: jA, cv: jC };
            if (useAI) { for (let i = 0; i < n; i++) mask[i] = A[i]; mode = 'ai'; } else mode = 'cv-checked';
          }
          aiFill = A;
        }
      }
    }
    // 닫기 전 마스크: 바지 두 다리 사이처럼 좁은 틈을 보려고 남겨 둔다 (외톨이 구멍만 메움)
    const raw = new Uint8Array(n);
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const i = y * w + x; if (!mask[i]) continue; raw[i] = mode === 'ai' ? aiRaw[i] || (mask[i] && !aiRaw[i] && inA4(x, y, 6)) : m0[i] || (m0[i - 1] + m0[i + 1] + m0[i - w] + m0[i + w] >= 3) ? 1 : 0; }
    // 사진 가장자리에 닿은 비율
    let edgeHit = 0, per = 0;
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const i = y * w + x; if (!mask[i]) continue; const nb = [i - 1, i + 1, i - w, i + w]; if (nb.some((j) => !mask[j])) { per++; if (nb.some((j) => !valid[j])) edgeHit++; } }
    for (let x = 0; x < w; x++) { if (mask[x]) edgeHit++; if (mask[(h - 1) * w + x]) edgeHit++; }
    for (let y = 0; y < h; y++) { if (mask[y * w]) edgeHit++; if (mask[y * w + w - 1]) edgeHit++; }
    let mArea = 0; for (let i = 0; i < n; i++) mArea += mask[i];
    return { w, h, sg, mask, raw, T, area: mArea / (sg * sg), edgeFrac: per ? edgeHit / per : 1, X, Y, mode, iou, judge: judgeLog, ai: mode === 'cv-checked' ? null : aiFill };
  }

  /* ── 3-1. 옷 바로 세우기: 좌우 대칭이 가장 맞는 각도를 찾아 마스크를 돌린다 ── */
  function upright(S) {
    const { w, h, mask } = S, B = [];
    let gx = 0, gy = 0, cnt = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (!mask[i]) continue; gx += x; gy += y; cnt++; if (x === 0 || y === 0 || x === w - 1 || y === h - 1 || !mask[i - 1] || !mask[i + 1] || !mask[i - w] || !mask[i + w]) B.push(x, y); }
    gx /= cnt; gy /= cnt;
    const V = Math.ceil(Math.hypot(w, h)), mn = new Float32Array(2 * V + 1), mx = new Float32Array(2 * V + 1);
    const asym = (d) => { // 줄마다 (왼끝+오른끝)/2 가 한 세로선에 모일수록 대칭
      const c = Math.cos(d), s = Math.sin(d); mn.fill(1e9); mx.fill(-1e9);
      let gmn = 1e9, gmx = -1e9;
      for (let k = 0; k < B.length; k += 2) { const dx = B[k] - gx, dy = B[k + 1] - gy, u = dx * c + dy * s, v = Math.round(-dx * s + dy * c) + V; if (u < mn[v]) mn[v] = u; if (u > mx[v]) mx[v] = u; if (u < gmn) gmn = u; if (u > gmx) gmx = u; }
      const W = gmx - gmn, mids = [];
      for (let v = 0; v < mn.length; v++) if (mx[v] - mn[v] > W * 0.12) mids.push((mn[v] + mx[v]) / 2);
      if (mids.length < 10) return 1;
      const srt = mids.slice().sort((a, b) => a - b), med = srt[srt.length >> 1], dev = mids.map((m) => Math.abs(m - med)).sort((a, b) => a - b), k8 = Math.max(1, Math.floor(dev.length * 0.8));
      let sum = 0; for (let i = 0; i < k8; i++) sum += dev[i];
      return sum / k8 / W;
    };
    // 폰을 어느 방향으로 들고 찍었든: 0° / 90° 근처에서 좌우 대칭이 가장 맞는 각도
    let best = 0, bv = asym(0);
    for (const base of [0, Math.PI / 2]) for (let a = -12; a <= 12; a++) { const d = base + a * Math.PI / 180, v = asym(d); if (v < bv - 1e-4) { bv = v; best = d; } }
    for (let a = -1; a <= 1; a += 0.2) { const d = best + a * Math.PI / 180, v = asym(d); if (v < bv - 1e-5) { bv = v; best = d; } }
    if (Math.abs(best) < 0.4 * Math.PI / 180) best = 0;
    const build = (d) => {
      const c = Math.cos(d), s = Math.sin(d);
      let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
      for (let k = 0; k < B.length; k += 2) { const dx = B[k] - gx, dy = B[k + 1] - gy, u = dx * c + dy * s, v = -dx * s + dy * c; if (u < u0) u0 = u; if (u > u1) u1 = u; if (v < v0) v0 = v; if (v > v1) v1 = v; }
      const pad = 4, ox = pad - Math.floor(u0), oy = pad - Math.floor(v0), W2 = Math.ceil(u1 - u0) + 2 * pad + 2, H2 = Math.ceil(v1 - v0) + 2 * pad + 2;
      const M2 = new Uint8Array(W2 * H2), R2 = new Uint8Array(W2 * H2), A2 = S.ai ? new Uint8Array(W2 * H2) : null;
      for (let yy = 0; yy < H2; yy++) for (let xx = 0; xx < W2; xx++) {
        const u = xx - ox, v = yy - oy, x = Math.round(gx + u * c - v * s), y = Math.round(gy + u * s + v * c);
        if (x < 0 || y < 0 || x >= w || y >= h) continue; const j = y * w + x; M2[yy * W2 + xx] = mask[j]; R2[yy * W2 + xx] = S.raw[j]; if (A2) A2[yy * W2 + xx] = S.ai[j];
      }
      return { W2, H2, M2, R2, A2, c, s, ox, oy };
    };
    // 위아래: 바지는 다리가 갈라진 쪽, 상의는 넓고 곧은 밑단 쪽이 아래
    const ends = (G) => { let y0 = -1, y1 = -1; for (let y = 0; y < G.H2; y++) { let any = 0; for (let x = 0; x < G.W2; x++) if (G.M2[y * G.W2 + x]) { any = 1; break; } if (any) { if (y0 < 0) y0 = y; y1 = y; } }
      const band = Math.max(2, Math.round((y1 - y0) * 0.05)), stat = (ya, yb) => { let wsum = 0, rsum = 0, n = 0; for (let y = ya; y <= yb; y++) { const rs = runsOf(G.M2, G.W2, y).filter((r) => r[1] - r[0] > 2); rsum += rs.length; wsum += rs.reduce((t, r) => t + r[1] - r[0] + 1, 0); n++; } return { runs: rsum / Math.max(1, n), wid: wsum / Math.max(1, n) }; };
      const H = y1 - y0, in1 = Math.round(H * 0.12), in2 = Math.round(H * 0.18);
      return { top: stat(y0 + 1, y0 + band), bot: stat(y1 - band, y1 - 1), topIn: stat(y0 + in1, y0 + in2), botIn: stat(y1 - in2, y1 - in1), y0, y1 }; };
    let G = build(best); const e = ends(G);
    const legsTop = e.topIn.runs >= 1.7 && e.botIn.runs < 1.3, legsBot = e.botIn.runs >= 1.7 && e.topIn.runs < 1.3;
    if (legsTop || (!legsBot && e.top.wid > e.bot.wid * 1.2)) { best += Math.PI; G = build(best); } // 뒤집힌 사진
    const { W2, H2, M2, R2, A2, c, s, ox, oy } = G;
    return { w: W2, h: H2, sg: S.sg, mask: M2, raw: R2, ai: A2, rot: { d: best, c, s, gx, gy, ox, oy }, asym: bv };
  }

  /* ── 4. 치수 ── */
  function runsOf(mask, w, y) { const out = []; let s = -1; for (let x = 0; x < w; x++) { const v = mask[y * w + x]; if (v && s < 0) s = x; if (!v && s >= 0) { out.push([s, x - 1]); s = -1; } } if (s >= 0) out.push([s, w - 1]); return out; }
  function measureTop(S) {
    const { w, h, mask, sg } = S, mm = (v) => v / sg;
    let y0 = -1, y1 = -1, sx = 0, c = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (mask[y * w + x]) { if (y0 < 0) y0 = y; y1 = y; sx += x; c++; }
    if (y0 < 0) return null;
    const cx = Math.round(sx / c), H = y1 - y0;
    const central = (y) => { const rs = runsOf(mask, w, y); if (!rs.length) return null; let best = rs[0], bd = Infinity; for (const r of rs) { const d = cx < r[0] ? r[0] - cx : cx > r[1] ? cx - r[1] : 0; if (d < bd) { bd = d; best = r; } } return best; };
    // 겨드랑이: 옆선이 소매 끝에서 안쪽으로 크게 들어온 뒤 거의 수직(몸판 옆선)이 되는 지점
    const XL = new Array(h).fill(null), XR = new Array(h).fill(null);
    for (let y = y0; y <= y1; y++) { const r = central(y); if (r) { XL[y] = r[0]; XR[y] = r[1]; } }
    const flags = [];
    const side = (arr, sign) => {
      let ye = -1, ext = Infinity;
      for (let y = y0 + Math.round(H * 0.04); y < y0 + H * 0.6; y++) { if (arr[y] == null) continue; const v = sign * arr[y]; if (v < ext) { ext = v; ye = y; } }
      if (ye < 0) return -1;
      const st = Math.max(2, Math.round(sg * 30));
      for (let y = ye; y < y0 + H * 0.8 - st; y++) {
        const a = arr[y], b2 = arr[y + st]; if (a == null || b2 == null) continue;
        const movedIn = sign * a - ext, more = sign * b2 - sign * a;
        if (movedIn > sg * 30 && more < sg * 8) return y;
      }
      return -1;
    };
    const aL = side(XL, 1), aR = side(XR, -1);
    let ya = Math.max(aL, aR);
    if (aL < 0 || aR < 0) { ya = aL < 0 && aR < 0 ? Math.round(y0 + H * 0.3) : Math.max(aL, aR); flags.push('armpit'); }
    const yc = Math.min(y1, ya + Math.round(sg * 25)), rc = central(yc) || [cx - 10, cx + 10];
    const rb = central(Math.min(y1, ya + Math.round(sg * 10))) || rc;
    const topAt = (x) => { x = Math.max(0, Math.min(w - 1, Math.round(x))); for (let y = y0; y <= y1; y++) if (mask[y * w + x]) return y; return y0; };
    const botAt = (x) => { for (let y = y1; y >= y0; y--) if (mask[y * w + x]) return y; return y1; };
    // 목 옆(HPS): 가운데에서 바깥으로 가며 가장 높은 지점 (양쪽)
    const span = Math.round((rc[1] - rc[0]) * 0.3);
    let hx = cx, hy = h; for (let x = cx - span; x <= cx; x++) { const t = topAt(x); if (t < hy) { hy = t; hx = x; } }
    let hxR = cx, hyR = h; for (let x = cx + span; x >= cx; x--) { const t = topAt(x); if (t < hyR) { hyR = t; hxR = x; } }
    // 어깨 끝: 윗선(목 옆 → 소매 끝)을 두 직선으로 나눠 맞췄을 때 꺾이는 곳 (어깨선 → 소매 윗선)
    let minX = w, maxX = 0; for (let y = y0; y <= y1; y++) { const rs = runsOf(mask, w, y); if (rs.length) { if (rs[0][0] < minX) minX = rs[0][0]; if (rs[rs.length - 1][1] > maxX) maxX = rs[rs.length - 1][1]; } }
    const chH = (rc[1] - rc[0]) / 2;
    const kink = (from, to) => {
      const dir = Math.sign(to - from), D = Math.abs(to - from), P = [];
      for (let t = Math.round(D * 0.03); t <= D * 0.9; t++) { const x = from + dir * t; P.push([x, topAt(x)]); }
      const N = P.length; if (N < 20) return null;
      const Sx = new Float64Array(N + 1), Sy = new Float64Array(N + 1), Sxx = new Float64Array(N + 1), Syy = new Float64Array(N + 1), Sxy = new Float64Array(N + 1);
      for (let i = 0; i < N; i++) { const [x, y] = P[i]; Sx[i + 1] = Sx[i] + x; Sy[i + 1] = Sy[i] + y; Sxx[i + 1] = Sxx[i] + x * x; Syy[i + 1] = Syy[i] + y * y; Sxy[i + 1] = Sxy[i] + x * y; }
      const seg = (a, b) => { const n = b - a, mx = (Sx[b] - Sx[a]) / n, my = (Sy[b] - Sy[a]) / n, cxx = (Sxx[b] - Sxx[a]) / n - mx * mx, cyy = (Syy[b] - Syy[a]) / n - my * my, cxy = (Sxy[b] - Sxy[a]) / n - mx * my, tr = cxx + cyy, l1 = tr / 2 - Math.sqrt(Math.max(0, tr * tr / 4 - (cxx * cyy - cxy * cxy))), th = 0.5 * Math.atan2(2 * cxy, cxx - cyy); return { e: l1 * n, px: mx, py: my, dx: Math.cos(th), dy: Math.sin(th) }; };
      let best = null;
      for (let k = Math.round(N * 0.12); k <= Math.round(N * 0.88); k++) { const A = seg(0, k), B2 = seg(k, N), e = A.e + B2.e; if (!best || e < best.e) best = { e, A, B: B2, k }; }
      const ang = Math.acos(Math.min(1, Math.abs(best.A.dx * best.B.dx + best.A.dy * best.B.dy))) * 180 / Math.PI;
      const ip = lineX(best.A, best.B), bx = ip && Math.abs(ip[0] - P[best.k][0]) < D * 0.12 ? ip[0] : P[best.k][0];
      const ratio = Math.abs(bx - cx) / Math.max(1, chH);
      if (ang < 6 || ratio < 0.7 || ratio > 1.35) return null;
      return [Math.round(bx), topAt(bx)];
    };
    let shL = kink(hx, minX), shR = kink(hxR, maxX);
    if (!shL || !shR) { flags.push('shoulder'); const o = Math.round(sg * 30); shL = shL || [rb[0] + o, topAt(rb[0] + o)]; shR = shR || [rb[1] - o, topAt(rb[1] - o)]; }
    // 목 옆: 어깨 끝에서 목 쪽으로 어깨선을 따라가다 모자처럼 가파르게 오르거나 목둘레처럼 내려가는 곳 (후드는 모자를 빼고 잼)
    {
      const step = Math.max(1, Math.round(sg * 5)); let x = Math.min(shL[0], cx - sg * 60), y = topAt(x);
      for (let k = 0; k < 400; k++) { const nx = x + step; if (nx >= cx - sg * 20) break; const ny = topAt(nx), slope = (y - ny) / step; if (slope > 1.1 || slope < -0.5) break; x = nx; y = ny; }
      if (hy < y - sg * 30) { hx = x; hy = y; flags.push('hood'); } // 목 옆이 3cm 넘게 낮으면 모자가 있는 옷
    }
    // 밑단 높이: 몸판 가운데 여러 세로줄의 아래 끝 중간값 (밑단에 붙은 조각 하나에 끌려가지 않게)
    const hemY = (() => { const xs = []; for (let x = Math.round(rc[0] + (rc[1] - rc[0]) * 0.15); x <= rc[1] - (rc[1] - rc[0]) * 0.15; x += Math.max(1, Math.round(sg * 10))) xs.push(botAt(x)); xs.sort((a2, b2) => a2 - b2); return xs.length ? xs[xs.length >> 1] : botAt(hx); })();
    const len = [[hx, hy], [hx, hemY + 1]];
    // 소매: 어깨점에서 가장 먼 소매 끝 (왼쪽)
    let far = null, fd = -Infinity;
    for (let y = y0; y <= Math.min(y1, y0 + H * 0.92); y++) {
      let lim;
      if (y <= ya) lim = rb[0] - sg * 5;
      else { const rs = runsOf(mask, w, y), cr = central(y); lim = -1; for (const r of rs) if (cr && r[1] < cr[0] - sg * 3) lim = Math.max(lim, r[1] + 1); }
      for (let x = 0; x < lim; x++) { if (!mask[y * w + x]) continue; const d = -x * 1000 - Math.hypot(x - shL[0], y - shL[1]); if (!far || d > fd) { fd = d; far = [x, y]; } break; }
    }
    const M = [
      { key: '총장', p: len, help: '목 옆 가장 높은 곳 → 밑단' },
      { key: '어깨', p: [shL, shR], help: '왼쪽 어깨 끝 → 오른쪽 어깨 끝' },
      { key: '가슴', p: [[rc[0], yc], [rc[1] + 1, yc]], help: '겨드랑이 2.5cm 아래 가로' },
      { key: '소매', p: far ? [shL, far] : null, help: '어깨 끝 → 소매 끝' },
    ];
    { const yh = Math.max(y0, hemY - Math.round(sg * 15)), bw = (rc[1] - rc[0]) * 0.15, rs = runsOf(mask, w, yh).filter((r) => r[1] > rc[0] - bw && r[0] < rc[1] + bw), rh = rs.length ? [Math.min(...rs.map((r) => r[0])), Math.max(...rs.map((r) => r[1]))] : null; /* 지퍼 등으로 갈라져도 몸판 폭 전체 */ if (rh) M.push({ key: '밑단', p: [[rh[0], yh], [rh[1] + 1, yh]], help: '밑단 1.5cm 위 가로', extra: true }); }
    return { M, flags, box: [y0, y1] };
  }
  function measureBottom(S, force) {
    const { w, h, mask, sg } = S, RM = S.raw || mask;
    let y0 = -1, y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (mask[y * w + x]) { if (y0 < 0) y0 = y; y1 = y; break; }
    if (y0 < 0) return null;
    const H = y1 - y0, flags = [];
    const yw = Math.min(y1, y0 + Math.round(sg * 15)), rw = runsOf(mask, w, yw), waistRun = rw.reduce((a, r) => (r[1] - r[0] > a[1] - a[0] ? r : a), rw[0] || [0, 0]);
    const cx = (waistRun[0] + waistRun[1] + 1) / 2, WW = waistRun[1] - waistRun[0] + 1;
    // 두 다리 사이 틈 (가운데에 가장 가까운 것): [왼다리 안쪽 경계 x, 오른다리 안쪽 경계 x]
    const gapAt = (M, y, near) => {
      const rs = runsOf(M, w, y).filter((r) => r[1] - r[0] > sg * 25); let best = null, bd = Infinity;
      for (let i = 0; i < rs.length - 1; i++) { const g = [rs[i][1] + 1, rs[i + 1][0]], d = Math.abs((g[0] + g[1]) / 2 - near); if (d < bd) { bd = d; best = g; } }
      return best && bd < WW * 0.3 ? best : null;
    };
    // 1) 밑단에서 위로 올라가며 틈이 이어지는 줄을 모은다 (닫기 전 마스크라 좁은 틈도 보임)
    const G = []; let near = cx, miss = 0, yb = -1;
    for (let y = y1; y > y0 + H * 0.1; y--) {
      const g = gapAt(RM, y, near) || gapAt(mask, y, near);
      if (g && (!G.length || Math.abs((g[0] + g[1]) / 2 - near) < sg * 20)) { if (yb < 0) yb = y; G.push([y, g[0], g[1]]); near = (g[0] + g[1]) / 2; miss = 0; }
      else if (G.length && ++miss > Math.max(3, sg * 6)) break;
    }
    // 2) 틈 위쪽 구간의 두 안쪽 선을 직선으로 맞추고 위로 이어 만나는 점 = 가랑이
    let yc, xc, inL = null, sure = false, why = 'touch';
    if (force) { yc = force[1]; xc = force[0]; sure = true; why = 'user'; }
    else if (G.length >= 8) {
      const gTop = G[G.length - 1][0], gLen = G[0][0] - gTop, use = G.filter((g) => g[0] <= gTop + Math.max(8, gLen * 0.35));
      const fit = (k) => { let n = 0, sy = 0, sx = 0, syy = 0, sxy = 0; for (const g of use) { const yy = g[0] + 0.5; n++; sy += yy; sx += g[k]; syy += yy * yy; sxy += yy * g[k]; } const b = (n * sxy - sy * sx) / ((n * syy - sy * sy) || 1); return { a: (sx - b * sy) / n, b }; };
      const L = fit(1), R = fit(2), ys = Math.abs(L.b - R.b) > 1e-4 ? (R.a - L.a) / (L.b - R.b) : null;
      if (ys != null && ys <= gTop + 1 && ys >= gTop - H * 0.15 && ys > y0 + H * 0.12) { yc = ys; xc = L.a + L.b * ys; }
      else { yc = gTop; xc = (G[G.length - 1][1] + G[G.length - 1][2]) / 2; }
      inL = (y) => Math.min(L.a + L.b * y, cx);
      // 틈 맨 위에서 2.5cm 넘게 위로 이어 붙여야 하면 두 다리가 붙어 있던 구간이 길다 → 확신 못 함
      sure = gTop - yc <= sg * 25; why = sure ? 'gap' : 'far';
    } else { yc = y0 + H * 0.27; xc = cx; }
    if (force) { const g = G.length ? G[G.length - 1] : null; inL = g && g[0] > yc ? (y) => Math.min(xc + (g[1] - xc) * (y - yc) / Math.max(1, g[0] - yc), cx) : (y) => xc; }
    if (yb < 0) yb = y1;
    const legL = (y) => { const rs = runsOf(mask, w, y).filter((r) => r[0] < cx); if (!rs.length) return null; return rs.reduce((a, r) => (r[1] > a[1] ? r : a)); };
    const yt = Math.min(y1, Math.round(yc + sg * 25)), rowT = runsOf(mask, w, yt), outT = rowT.length ? rowT[0][0] : cx - sg * 150;
    let inT = inL ? inL(yt + 0.5) : null; if (inT == null) { const g = gapAt(RM, yt, cx); inT = g ? g[0] : cx; }
    const gb = G.length ? G[0] : null, hemIn = gb ? gb[1] : cx, hemRun = legL(yb) || [waistRun[0], cx];
    const ratio = (yc - y0) / Math.max(1, yb - y0);
    if (!force && (ratio > 0.36 || ratio < 0.18)) { sure = false; why = 'ratio'; }
    if (!sure) flags.push('crotch');
    const M = [
      { key: '허리', p: [[waistRun[0], yw], [waistRun[1] + 1, yw]], help: '허리 밴드 가로' },
      { key: '밑위', p: [[cx, y0], [cx, yc]], help: '허리 위 → 가랑이' },
      { key: '허벅지', p: [[outT, yt], [inT, yt]], help: '가랑이 2.5cm 아래 한쪽 다리 가로' },
      { key: '인심', p: [[xc, yc], [hemIn, yb + 1]], help: '가랑이 → 밑단 안쪽' },
      { key: '총장', p: [[waistRun[0], y0], [hemRun[0], yb + 1]], help: '허리 위 → 밑단 바깥쪽' },
    ];
    { let hip = null; for (let y = Math.round(y0 + (yc - y0) * 0.35); y < yc - sg * 20; y++) { const rs = runsOf(mask, w, y); if (rs.length !== 1) continue; const r = rs[0]; if (!hip || r[1] - r[0] > hip[1] - hip[0]) hip = [r[0], r[1], y]; } if (hip) M.push({ key: '엉덩이', p: [[hip[0], hip[2]], [hip[1] + 1, hip[2]]], help: '허리와 가랑이 사이 가장 넓은 곳', extra: true }); }
    { const yh = Math.max(Math.round(yc), yb - Math.round(sg * 10)), rh = legL(yh), g = gapAt(RM, yh, cx); if (rh) M.push({ key: '밑단', p: [[rh[0], yh], [g ? g[0] : Math.min(rh[1] + 1, cx), yh]], help: '한쪽 다리 밑단 가로', extra: true }); }
    return { M, flags, box: [y0, y1], crotch: { x: xc, y: yc, sure, why } };
  }
  const RANGE = { top: { 총장: [35, 110], 어깨: [28, 75], 가슴: [32, 85], 소매: [8, 95], 밑단: [30, 90] }, bottom: { 허리: [24, 70], 밑위: [16, 48], 허벅지: [18, 52], 인심: [20, 100], 총장: [35, 130], 엉덩이: [30, 75], 밑단: [10, 40] } };

  /* ── 5. 투명 크롭 ── */
  function cutout(R, S, marginMm, mode) {
    let x0 = S.w, x1 = 0, y0 = S.h, y1 = 0;
    for (let y = 0; y < S.h; y++) for (let x = 0; x < S.w; x++) if (S.mask[y * S.w + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    const k = R.s / S.sg, mg = marginMm * R.s, rt = S.rot;
    const cx0 = Math.max(0, Math.floor(x0 * k - mg)), cy0 = Math.max(0, Math.floor(y0 * k - mg)), cx1 = Math.ceil((x1 + 1) * k + mg), cy1 = Math.ceil((y1 + 1) * k + mg);
    const W = cx1 - cx0, H = cy1 - cy0, c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d'), im = ctx.createImageData(W, H), d = R.rgba;
    const MK = S.ai || S.mask, mv = (xx, yy) => (xx < 0 || yy < 0 || xx >= S.w || yy >= S.h) ? 0 : MK[yy * S.w + xx];
    const cc = new Map(), cellColor = (cx, cy) => { const key = cy * S.w + cx; if (cc.has(key)) return cc.get(key); const u = cx - rt.ox, v = cy - rt.oy, sx = Math.round((rt.gx + u * rt.c - v * rt.s + 0.5) * k - 0.5), sy = Math.round((rt.gy + u * rt.s + v * rt.c + 0.5) * k - 0.5); let col = null; if (sx >= 0 && sy >= 0 && sx < R.W && sy < R.H && R.valid[sy * R.W + sx]) { const o = (sy * R.W + sx) * 4; col = [R.rgba[o], R.rgba[o + 1], R.rgba[o + 2]]; } cc.set(key, col); return col; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const di = (y * W + x) * 4;
      // 마스크는 분석 해상도라 주변 4칸 평균으로 부드럽게
      const fx = (cx0 + x + 0.5) / k - 0.5, fy = (cy0 + y + 0.5) / k - 0.5, ix = Math.floor(fx), iy = Math.floor(fy), ax = fx - ix, ay = fy - iy;
      const a = (mv(ix, iy) * (1 - ax) + mv(ix + 1, iy) * ax) * (1 - ay) + (mv(ix, iy + 1) * (1 - ax) + mv(ix + 1, iy + 1) * ax) * ay;
      // 경계 근처인지: 주변 3×3 칸에 옷·바닥이 섞여 있으면 경계
      const gx0 = Math.round(fx), gy0 = Math.round(fy); let nf = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) nf += mv(gx0 + dx, gy0 + dy);
      if (nf === 0 && a <= 0.02) continue;
      // 바로 세운 좌표 → 원래 분석 좌표 → 보정 사진 좌표
      const u = fx - rt.ox, v = fy - rt.oy, sx = (rt.gx + u * rt.c - v * rt.s + 0.5) * k - 0.5, sy = (rt.gy + u * rt.s + v * rt.c + 0.5) * k - 0.5;
      const qx = Math.floor(sx), qy = Math.floor(sy); if (qx < 0 || qy < 0 || qx >= R.W - 1 || qy >= R.H - 1) continue;
      const bx = sx - qx, by = sy - qy, i00 = (qy * R.W + qx) * 4, i10 = i00 + 4, i01 = i00 + R.W * 4, i11 = i01 + 4;
      for (let ch = 0; ch < 3; ch++) im.data[di + ch] = (d[i00 + ch] * (1 - bx) + d[i10 + ch] * bx) * (1 - by) + (d[i01 + ch] * (1 - bx) + d[i11 + ch] * bx) * by;
      let alpha = Math.min(1, Math.max(0, (a - 0.25) / 0.5));
      if (nf > 0 && nf < 9 && mode !== 'ai' && !S.ai) { // 가장자리: 주변의 확실한 옷 색 · 바닥 색 사이 어디쯤인지로 투명도 (원본 해상도)
        const fg = [0, 0, 0, 0], bg = [0, 0, 0, 0];
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
          const cx = gx0 + dx, cy = gy0 + dy; if (cx < 1 || cy < 1 || cx >= S.w - 1 || cy >= S.h - 1) continue;
          const mc = mv(cx, cy), pure = mv(cx - 1, cy) === mc && mv(cx + 1, cy) === mc && mv(cx, cy - 1) === mc && mv(cx, cy + 1) === mc; if (!pure) continue;
          const col = cellColor(cx, cy); if (!col) continue; const t = mc ? fg : bg; t[0] += col[0]; t[1] += col[1]; t[2] += col[2]; t[3]++;
        }
        if (fg[3] && bg[3]) {
          const F = [fg[0] / fg[3], fg[1] / fg[3], fg[2] / fg[3]], Bc = [bg[0] / bg[3], bg[1] / bg[3], bg[2] / bg[3]], dfb = (F[0] - Bc[0]) ** 2 + (F[1] - Bc[1]) ** 2 + (F[2] - Bc[2]) ** 2;
          if (dfb > 400) { const t = ((im.data[di] - Bc[0]) * (F[0] - Bc[0]) + (im.data[di + 1] - Bc[1]) * (F[1] - Bc[1]) + (im.data[di + 2] - Bc[2]) * (F[2] - Bc[2])) / dfb; alpha = Math.min(Math.min(1, a * 1.5 + 0.05), Math.max(0, (t - 0.15) / 0.7)); } // 윤곽 밖은 색이 비슷해도 되살리지 않음
        }
      }
      if (alpha <= 0.01) continue;
      im.data[di + 3] = Math.round(alpha * 255);
    }
    ctx.putImageData(im, 0, 0);
    return { canvas: c, ox: cx0, oy: cy0, k, W, H };
  }

  /* ── 전체 ── */
  async function analyze(src, opt = {}) {
    let cat = opt.cat === 'bottom' ? 'bottom' : 'top';
    const t0 = performance.now(), step = opt.onStep || (() => {});
    const tick = () => new Promise((r) => setTimeout(r, 0));
    step('a4'); await tick();
    const small = grab(src, 900), full = grab(src, 2000), f = full.w / small.w;
    let a4;
    if (opt.quad) a4 = { quad: opt.quad.map((p) => [p[0] / f, p[1] / f]), fill: 1, ratio: 1.414, conf: 0.8, manual: true };
    else a4 = findA4(small);
    const res = { cat, photo: { w: full.w, h: full.h, canvas: full.c }, a4: null, messages: [] };
    if (!a4) { res.status = 'fail-a4'; res.messages.push('A4 용지를 찾지 못했어요'); return res; }
    let quadFull = a4.quad.map((p) => [p[0] * f, p[1] * f]);
    if (!a4.manual) for (let it = 0; it < 2; it++) { const rq = refineQuad(full, quadFull); if (!rq) break; quadFull = rq; a4.refined = true; }
    res.a4 = { quad: quadFull, conf: a4.conf, manual: !!a4.manual, refined: !!a4.refined };
    step('warp'); await tick();
    let pl = planeOf(quadFull); if (!pl.H) { res.status = 'fail-a4'; res.messages.push('A4 모서리로 원근을 계산하지 못했어요'); return res; }
    { // 화면의 세로 방향(사진 가운데 기준)이 평면에서도 세로가 되게 돌림 → A4를 비스듬히 놓아도 됨
      const c0 = applyH(pl.H, full.w / 2, full.h / 2), c1 = applyH(pl.H, full.w / 2, full.h * 0.4);
      pl = rotPlane(pl, -Math.atan2(c1[0] - c0[0], -(c1[1] - c0[1])));
    }
    const R = rectify(full, pl.H, 1500); if (!R) { res.status = 'fail-a4'; res.messages.push('사진이 너무 비스듬해요'); return res; }
    step('seg'); await tick();
    let roiFn = null;
    if (opt.roi) { const Hi = invH(pl.H), [rx0, ry0, rx1, ry1] = opt.roi, rw = rx1 - rx0, rh = ry1 - ry0; roiFn = (X, Y) => { const [ix, iy] = applyH(Hi, X, Y); if (ix < rx0 || iy < ry0 || ix > rx1 || iy > ry1) return -1; return Math.min(ix - rx0, rx1 - ix, iy - ry0, ry1 - iy) / Math.min(rw, rh); }; }
    const seedP = opt.seed ? applyH(pl.H, opt.seed[0] * full.w, opt.seed[1] * full.h) : null;
    let ai = null;
    if (opt.ai !== false) {
      step('ai'); await tick();
      try {
        let bx0 = R.W, bx1 = 0, by0 = R.H, by1 = 0;
        for (let v = 0; v < R.H; v += 4) for (let u = 0; u < R.W; u += 4) { if (!R.valid[v * R.W + u] || (roiFn && roiFn(R.x0 + u / R.s, R.y0 + v / R.s) < 0)) continue; if (u < bx0) bx0 = u; if (u > bx1) bx1 = u; if (v < by0) by0 = v; if (v > by1) by1 = v; }
        if (bx1 > bx0 && by1 > by0) {
          const full2 = document.createElement('canvas'); full2.width = R.W; full2.height = R.H; full2.getContext('2d').putImageData(new ImageData(R.rgba, R.W, R.H), 0, 0);
          const run = async (x0, y0, x1, y1) => {
            const k2 = Math.min(1, 1024 / Math.max(x1 - x0, y1 - y0)), cv = document.createElement('canvas'); cv.width = Math.round((x1 - x0) * k2); cv.height = Math.round((y1 - y0) * k2);
            const cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); cx.drawImage(full2, x0, y0, x1 - x0, y1 - y0, 0, 0, cv.width, cv.height);
            const am = await Promise.race([aiMask(cv, cat === 'bottom' ? 'flatBottom' : 'flatTop'), new Promise((_, no) => setTimeout(() => no(new Error('timeout')), opt.aiTimeout || 90000))]);
            return am && { x0, y0, k: am.w / (x1 - x0), w: am.w, h: am.h, m: am.m };
          };
          // 1차: 고른 영역 전체. 사진·영역 가장자리에 걸친 덩어리(찍는 사람 다리 등)는 낮게 침
          const a1 = await run(bx0, by0, bx1, by1);
          if (a1) {
            const { lab: L1, comps: C1 } = components(a1.m, a1.w, a1.h, 20);
            const okAt = (u, v) => { const X0 = bx0 + u / a1.k, Y0 = by0 + v / a1.k, rx = Math.round(X0), ry = Math.round(Y0); return rx >= 0 && ry >= 0 && rx < R.W && ry < R.H && R.valid[ry * R.W + rx] && (!roiFn || roiFn(R.x0 + X0 / R.s, R.y0 + Y0 / R.s) >= 0.01); };
            let best = null, bs = 0;
            for (const c of C1) {
              let edge = 0, tot = 0; for (let y = c.miny; y <= c.maxy; y += 2) for (let x = c.minx; x <= c.maxx; x += 2) { const i = y * a1.w + x; if (L1[i] !== c.id) continue; tot++; if (!okAt(x, y) || !okAt(x - 3, y) || !okAt(x + 3, y) || !okAt(x, y - 3) || !okAt(x, y + 3)) edge++; }
              const sc = c.area * (edge > tot * 0.01 ? 0.25 : 1); if (sc > bs) { bs = sc; best = c; }
            }
            if (best) {
              // 2차: 그 옷 둘레(15% 여유)만 잘라 다시 → 더 촘촘하게
              const ex = (best.maxx - best.minx) * 0.15 + 8, ey = (best.maxy - best.miny) * 0.15 + 8;
              const qx0 = Math.max(bx0, Math.floor(bx0 + (best.minx - ex) / a1.k)), qy0 = Math.max(by0, Math.floor(by0 + (best.miny - ey) / a1.k)), qx1 = Math.min(bx1, Math.ceil(bx0 + (best.maxx + 1 + ex) / a1.k)), qy1 = Math.min(by1, Math.ceil(by0 + (best.maxy + 1 + ey) / a1.k));
              const a2 = Math.max(qx1 - qx0, qy1 - qy0) < Math.max(bx1 - bx0, by1 - by0) * 0.6 ? (step('ai2'), await run(qx0, qy0, qx1, qy1)) : null; // 옷이 작게 찍혔을 때만 옷 둘레를 한 번 더
              ai = a2 || a1; ai.pick = a2 ? null : best.id; ai.lab = a2 ? null : L1;
            }
          }
        }
      } catch (e) { res.aiErr = String(e && e.message || e); }
    }
    if (ai || res.aiErr) { step('seg'); await tick(); }
    const S0 = segment(R, pl, 820, roiFn, seedP, ai);
    if (!S0 || S0.area < 300 * 300 * 0.25) { res.status = 'fail-garment'; res.messages.push('옷을 바닥과 구분하지 못했어요'); return res; }
    step('measure'); await tick();
    const S = upright(S0);
    // 모양으로 옷 종류 확인: 아래쪽에서 두 다리가 갈라져 있으면 하의
    let legRows = 0, rows = 0, yy0 = -1, yy1 = -1;
    for (let y = 0; y < S.h; y++) for (let x = 0; x < S.w; x++) if (S.mask[y * S.w + x]) { if (yy0 < 0) yy0 = y; yy1 = y; break; }
    for (let y = Math.round(yy0 + (yy1 - yy0) * 0.62); y < yy0 + (yy1 - yy0) * 0.92; y++) { const rs = runsOf(S.mask, S.w, y).filter((r) => r[1] - r[0] > S.sg * 60); rows++; if (rs.length >= 2) legRows++; }
    const pantsLike = rows > 0 && legRows / rows > 0.6;
    if (cat === 'top' && pantsLike) res.suggest = 'bottom';
    if (cat === 'bottom' && !pantsLike) res.suggest = 'top';
    if (opt.auto && res.suggest) { cat = res.suggest; res.cat = cat; res.autoCat = true; res.suggest = null; } // 모양을 보고 종류를 알아서 바꿈
    const mr = cat === 'bottom' ? measureBottom(S) : measureTop(S);
    if (!mr) { res.status = 'fail-garment'; res.messages.push('옷 모양을 읽지 못했어요'); return res; }
    const cut = cutout(R, S, 15, S0.mode);
    const toCut = (p) => [p[0] * cut.k - cut.ox, p[1] * cut.k - cut.oy];
    const pxPerCm = R.s * 10;
    res._k = { S, cut, pxPerCm, cat, a4conf: a4.conf, edgeFrac: S0.edgeFrac, suggest: res.suggest };
    res.rect = { s: R.s };
    res.seg = { judge: S0.judge, mode: S0.mode, iou: S0.iou == null ? null : Math.round(S0.iou * 1000) / 1000, T: S0.T, area: S0.area, edgeFrac: S0.edgeFrac, asym: Math.round(S.asym * 1000) / 1000, rot: Math.round((S.rot.d + (pl.th || 0)) * 1800 / Math.PI) / 10 };
    // 시험용: A4 기준 평면 좌표(mm, 회전 전) → 잘라 낸 그림 좌표
    res._k.fromA4 = (X, Y) => { const t = pl.th || 0, c0 = Math.cos(t), s0 = Math.sin(t), ax = pl.pw / 2, ay = pl.ph / 2, Xr = ax + c0 * (X - ax) - s0 * (Y - ay), Yr = ay + s0 * (X - ax) + c0 * (Y - ay), x = (Xr - R.x0) * S0.sg, y = (Yr - R.y0) * S0.sg, rt = S.rot, dx = x - rt.gx, dy = y - rt.gy; return toCut([dx * rt.c + dy * rt.s + rt.ox, -dx * rt.s + dy * rt.c + rt.oy]); };
    res.hood = !!(mr.flags && mr.flags.includes('hood'));
    finish(res, mr);
    res.ms = Math.round(performance.now() - t0);
    return res;
  }
  function finish(res, mr) {
    const { cut, pxPerCm, cat } = res._k, toCut = (p) => [p[0] * cut.k - cut.ox, p[1] * cut.k - cut.oy], rg = RANGE[cat];
    res.crotch = mr.crotch ? { p: toCut([mr.crotch.x, mr.crotch.y]), sure: mr.crotch.sure, why: mr.crotch.why } : null;
    res.measures = mr.M.map((m) => {
      if (!m.p) return { key: m.key, help: m.help, p: null, cm: null, flag: 'missing', extra: !!m.extra };
      const p = m.p.map(toCut), cm = Math.round(dist(p[0], p[1]) / pxPerCm * 10) / 10;
      const r = rg[m.key], flag = r && (cm < r[0] || cm > r[1]) ? 'range' : ((m.key === '가슴' || m.key === '어깨' || m.key === '소매') && mr.flags.includes('armpit')) || ((m.key === '어깨' || m.key === '소매') && mr.flags.includes('shoulder')) ? 'guess' : (m.key === '밑위' || m.key === '인심' || m.key === '허벅지') && mr.flags.includes('crotch') ? 'guess' : null;
      return { key: m.key, help: m.help, p, cm, flag: m.extra && flag === 'guess' ? null : flag, extra: !!m.extra };
    });
    res.cut = { canvas: cut.canvas, w: cut.W, h: cut.H, pxPerCm };
    const issues = [];
    if (res.suggest) issues.push(res.suggest === 'bottom' ? '하의처럼 보여요. 종류를 확인해 주세요' : '상의처럼 보여요. 종류를 확인해 주세요');
    if (res._k.edgeFrac > 0.04) issues.push('옷 일부가 사진 밖으로 잘린 것 같아요');
    if (res._k.a4conf < 0.45) issues.push('A4 모서리가 또렷하지 않아요');
    if (res.crotch && !res.crotch.sure) issues.push('두 다리가 붙어 있어 가랑이 위치를 추정했어요. 가랑이를 직접 찍으면 밑위·허벅지·인심이 정확해져요');
    if (res.measures.some((m) => !m.extra && (m.flag === 'range' || m.flag === 'missing'))) issues.push('평소 옷 치수 범위를 벗어난 값이 있어요');
    if (res.measures.some((m) => m.flag === 'guess' && !(cat === 'bottom' && /밑위|인심|허벅지/.test(m.key)))) issues.push('일부 측정점은 추정했어요');
    res.messages = issues;
    res.status = issues.length ? 'check' : 'ok';
    // 신뢰도: A4가 찍힌 크기, 기울기, 두 윤곽 방식의 일치, 추정한 점
    const q = res.a4.quad, sd = (i) => Math.hypot(q[(i + 1) % 4][0] - q[i][0], q[(i + 1) % 4][1] - q[i][1]), L = [sd(0), sd(1), sd(2), sd(3)];
    const a4px = Math.min((L[0] + L[2]) / 2, (L[1] + L[3]) / 2) / 210 * (res.photo.srcScale || 1), tilt = Math.max(L[0] / L[2], L[2] / L[0], L[1] / L[3], L[3] / L[1]);
    const sg = res.seg || {}, why = []; let sc = 100;
    if (sg.mode === 'fuse') why.push(`두 방식 윤곽 일치 ${Math.round(sg.iou * 100)}%`); else if (sg.mode === 'ai') { sc -= 12; why.push('AI 윤곽 기준'); } else { sc -= 15; why.push('색 경계 윤곽만 사용'); }
    if (a4px < 0.7) { sc -= 30; why.push('A4가 작게 찍힘'); } else if (a4px < 1.0) { sc -= 12; why.push('A4가 조금 작게 찍힘'); }
    if (tilt > 1.35) { sc -= 12; why.push('비스듬히 찍힘'); }
    if (res._k.a4conf < 0.7) sc -= 10;
    if (res._k.edgeFrac > 0.04) sc -= 30;
    const nGuess = res.measures.filter((m) => !m.extra && (m.flag === 'guess' || m.flag === 'range' || m.flag === 'missing')).length; sc -= Math.min(30, nGuess * 12);
    if (res.crotch && !res.crotch.sure) sc -= 15;
    const err = Math.round((0.4 + 0.5 / Math.max(0.3, a4px) + (sg.mode === 'fuse' ? 0.2 : 0.6) + (tilt > 1.35 ? 0.3 : 0)) * 2) / 2;
    res.trust = { score: Math.max(0, sc), level: sc >= 80 ? 'high' : sc >= 60 ? 'mid' : 'low', err: sc >= 60 ? err : Math.max(err, 3), why, a4px: Math.round(a4px * 100) / 100, tilt: Math.round(tilt * 100) / 100 };
  }
  // 사용자가 잘라 낸 그림 위에서 찍은 가랑이 점으로 바지 치수 다시 계산
  function setCrotch(res, pCut) {
    const k = res._k; if (!k || k.cat !== 'bottom') return res;
    const sx = (pCut[0] + k.cut.ox) / k.cut.k, sy = (pCut[1] + k.cut.oy) / k.cut.k;
    const mr = measureBottom(k.S, [sx, sy]); if (!mr) return res;
    finish(res, mr); res.crotchManual = true; return res;
  }
  /* ── 캡처 속 상품 사진 배경 지우기 (가장자리 색을 배경으로 보고 옷만 남김) ── */
  function cutProduct(src) {
    const g = grab(src, 640), { w, h, d } = g, n = w * h;
    const L = new Float32Array(n), A = new Float32Array(n), B = new Float32Array(n);
    for (let i = 0; i < n; i++) { const lb = lab(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]); L[i] = lb[0]; A[i] = lb[1]; B[i] = lb[2]; }
    const bw = Math.max(2, Math.round(Math.min(w, h) * 0.03)), border = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (x < bw || y < bw || x >= w - bw || y >= h - bw) border.push(y * w + x);
    let C = [[L[border[0]], A[border[0]], B[border[0]]], [L[border[border.length >> 1]], A[border[border.length >> 1]], B[border[border.length >> 1]]]];
    for (let it = 0; it < 10; it++) {
      const S2 = C.map(() => [0, 0, 0, 0]);
      for (const i of border) { let bj = 0, bd = Infinity; C.forEach((c, j) => { const dd = (L[i] - c[0]) ** 2 + (A[i] - c[1]) ** 2 + (B[i] - c[2]) ** 2; if (dd < bd) { bd = dd; bj = j; } }); const t = S2[bj]; t[0] += L[i]; t[1] += A[i]; t[2] += B[i]; t[3]++; }
      C = C.map((c, j) => S2[j][3] ? [S2[j][0] / S2[j][3], S2[j][1] / S2[j][3], S2[j][2] / S2[j][3]] : c);
      if (it === 9) { // 옷이 가장자리에 걸치면 가장자리 표본에 옷 색이 섞임 → 적은 쪽이 많이 다르면 버림
        const cnt = S2.map((t) => t[3]), big = cnt[0] >= cnt[1] ? 0 : 1, sm = 1 - big, dd = Math.hypot(C[0][0] - C[1][0], C[0][1] - C[1][1], C[0][2] - C[1][2]);
        if (dd > 14 && cnt[sm] < cnt[big]) { C = [C[big]]; border.splice(0, border.length, ...border.filter((i) => Math.hypot(L[i] - C[0][0], A[i] - C[0][1], B[i] - C[0][2]) < 14)); }
      }
    }
    const dm = new Float32Array(n), hist = new Int32Array(101);
    let spread = 0;
    for (let i = 0; i < n; i++) { let m = Infinity; for (const c of C) { const dd = Math.hypot(L[i] - c[0], (A[i] - c[1]) * 1.2, (B[i] - c[2]) * 1.2); if (dd < m) m = dd; } dm[i] = m; hist[Math.min(100, Math.round(m))]++; }
    for (const i of border) spread += dm[i]; spread /= border.length;
    const T = Math.max(9, Math.min(40, otsu(hist)));
    let m = new Uint8Array(n); for (let i = 0; i < n; i++) m[i] = dm[i] > T ? 1 : 0;
    m = erode(dilate(m, w, h, 2), w, h, 2); m = dilate(erode(m, w, h, 1), w, h, 1);
    const { lab: Lc, comps } = components(m, w, h, n * 0.01);
    if (!comps.length || spread > 9) return { ok: false, reason: spread > 9 ? '배경이 한 가지 색이 아니에요' : '옷을 찾지 못했어요' };
    comps.sort((a, b) => b.area - a.area);
    const top = comps[0], mask = new Uint8Array(n); for (let i = 0; i < n; i++) mask[i] = Lc[i] === top.id ? 1 : 0;
    const bg = new Uint8Array(n), st = [];
    for (let x = 0; x < w; x++) st.push(x, (h - 1) * w + x); for (let y = 0; y < h; y++) st.push(y * w, y * w + w - 1);
    while (st.length) { const q = st.pop(); if (bg[q] || mask[q]) continue; bg[q] = 1; const x = q % w, y = (q / w) | 0; if (x > 0) st.push(q - 1); if (x < w - 1) st.push(q + 1); if (y > 0) st.push(q - w); if (y < h - 1) st.push(q + w); }
    for (let i = 0; i < n; i++) if (!bg[i]) mask[i] = 1;
    const frac = top.area / n, touch = top.touch / (2 * (w + h));
    if (frac < 0.06 || frac > 0.97) return { ok: false, reason: '옷과 배경을 나누지 못했어요' };
    const mg = Math.round(Math.min(w, h) * 0.04), x0 = Math.max(0, top.minx - mg), y0 = Math.max(0, top.miny - mg), x1 = Math.min(w, top.maxx + mg + 1), y1 = Math.min(h, top.maxy + mg + 1);
    const c = document.createElement('canvas'); c.width = x1 - x0; c.height = y1 - y0;
    const ctx = c.getContext('2d'), im = ctx.createImageData(c.width, c.height);
    const sm = boxSum(mask, w, h, 1);
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      const si = ((y + y0) * w + x + x0), di = (y * c.width + x) * 4;
      im.data[di] = d[si * 4]; im.data[di + 1] = d[si * 4 + 1]; im.data[di + 2] = d[si * 4 + 2]; im.data[di + 3] = Math.round(sm[si] / 9 * 255);
    }
    ctx.putImageData(im, 0, 0);
    return { ok: true, canvas: c, frac, partial: touch > 0.12, box: [top.minx / g.k, top.miny / g.k, (top.maxx + 1) / g.k, (top.maxy + 1) / g.k] };
  }

  // 촬영 화면용 빠른 A4 확인: 작은 그림에서 네 모서리만 찾아 0~1 좌표로
  function detectA4(src) { const g = grab(src, 420), a = findA4(g); if (!a || a.conf < 0.45) return null; return { quad: a.quad.map(([x, y]) => [x / g.w, y / g.h]), conf: a.conf, areaFrac: polyArea(a.quad) / (g.w * g.h) }; }
  // 캡처 상자 안에서 상품 사진 네모 찾기: 배경과 다른 색이 꽉 찬 덩어리 (글자는 듬성듬성해서 제외)
  function findPhoto(src) {
    const g = grab(src, 480), { w, h, d } = g, n = w * h, cnt = new Map();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (x < 2 || y < 2 || x >= w - 2 || y >= h - 2) { const i = (y * w + x) * 4, k = ((d[i] >> 4) << 8) | ((d[i + 1] >> 4) << 4) | (d[i + 2] >> 4); cnt.set(k, (cnt.get(k) || 0) + 1); }
    let bk = 0, bv = -1; for (const [k, v] of cnt) if (v > bv) { bv = v; bk = k; }
    const br = ((bk >> 8) << 4) + 8, bgc = (((bk >> 4) & 15) << 4) + 8, bb = ((bk & 15) << 4) + 8;
    let m = new Uint8Array(n); for (let i = 0; i < n; i++) { const o = i * 4; m[i] = Math.abs(d[o] - br) + Math.abs(d[o + 1] - bgc) + Math.abs(d[o + 2] - bb) > 30 ? 1 : 0; }
    m = erode(dilate(m, w, h, 1), w, h, 1);
    const { comps } = components(m, w, h, n * 0.01);
    let best = null;
    for (const c of comps) { const bw = c.maxx - c.minx + 1, bh = c.maxy - c.miny + 1, fill = c.area / (bw * bh), asp = bh / bw; if (fill < 0.55 || asp < 0.5 || asp > 2.2 || bw < w * 0.08 || bh < h * 0.25) continue; if (!best || c.area > best.area) best = c; }
    if (!best) return null;
    return [best.minx / g.k, best.miny / g.k, (best.maxx + 1) / g.k, (best.maxy + 1) / g.k];
  }
  window.NaranMeasure = { analyze, cutProduct, setCrotch, detectA4, findPhoto, aiCutout, aiLoad, aiState, version: '1.7' };
})();
