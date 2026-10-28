"""Layr 통합 프로토타입 빌드: 팀원 4명의 프로토타입(src/*.html)에서 화면·동작 단위로 골라 layr.html 하나로 합친다.

담당 원칙
- 상세(detail): 상품 상세 · 구매 옵션 시트 · 겹쳐 보기 + 디자인 토큰(.pd-*, --g)의 기준
- 홈(home): 홈 · 카테고리 · 검색
- 내 옷장(closet): 옷장 선반 · 옷 상세 정보 · 정보 수정 · 핏 알려 주기 · 세부 종류 기준
- 옷장 등록(reg): 옷 등록 전체 + 측정 엔진 · 사진 촬영 모듈
- 나머지(장바구니 이전 공통 화면)는 등록 버전을 바탕으로 둠 (가장 최근 공통 뼈대)
실행: python3 build.py  →  layr.html (팀 통합본)
      python3 build.py --test  →  layr-test.html (Maze 유저테스트용: 가상 인물 하늘 · 무신사 기준 상품 · 테스트 모드 · 완료 코드)
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
TEST_BUILD = '--test' in sys.argv  # 유저테스트용 추가분은 이 스위치가 켜졌을 때만 들어감
SRC = {k: (ROOT / 'src' / f'{n}.html').read_text() for k, n in
       [('d', 'detail'), ('c', 'closet'), ('r', 'reg'), ('h', 'home')]}


# ── 원본 쪼개기 ──
def scripts(t):
    return [m.group(1) for m in re.finditer(r'<script>(.*?)</script>', t, re.S)]


def main_script(t):
    return next(s for s in scripts(t) if 'const SCR' in s)


def units(src):
    """최상위 문장(함수 · 상수 · SCR.x) 과 A 객체 안 동작 하나하나를 이름으로 쪼갬. 순서는 유지."""
    U, cur, buf, inA = {}, None, [], False
    tops = [r'^(SCR\.[A-Za-z0-9_]+)\s*=', r'^(?:async )?function ([A-Za-z0-9_]+)', r'^(?:const|let|var) ([A-Za-z0-9_]+)',
            r'^(Object\.assign\(IMG)', r"^(document\.addEventListener\('[a-z]+)", r"^(app\.addEventListener\('[a-z]+)",
            r"^(document\.getElementById\('page'\))", r'^(window\.addEventListener)', r'^(reset\()']

    def flush():
        if cur:
            U[cur] = '\n'.join(buf)
    for ln in src.split('\n'):
        key = None
        if re.match(r'^const A = \{', ln):
            inA, key = True, 'A{'
        elif inA and re.match(r'^\};', ln):
            inA, key = False, 'A}'
        elif inA:
            m = re.match(r'^  ([A-Za-z_][A-Za-z0-9_]*)\s*[\(:]', ln)
            key = m and 'A.' + m.group(1)
        else:
            for p in tops:
                m = re.match(p, ln)
                if m:
                    key = m.group(1)
                    break
        if key:
            flush()
            cur, n = key, 2
            while cur in U:
                cur, n = f'{key}#{n}', n + 1
            buf = [ln]
        else:
            buf.append(ln)
    flush()
    return U


U = {k: units(main_script(t)) for k, t in SRC.items()}
# 상세 담당 v2 (2026-10-22 받음): 세부 종류 15개 도식 · 그룹별 치수 칸 · 그룹별 기준 옷 시트
SRC['d2'] = (ROOT / 'src' / 'v2' / 'detail.html').read_text()
U['d2'] = units(main_script(SRC['d2']))


def u(k, name):
    s = U[k][name]
    return s.rstrip('\n')


def sub(s, old, new, count=1):
    """정확히 count번 바뀌어야 함 (원본이 바뀌면 바로 알아채도록)"""
    n = s.count(old)
    assert n >= 1 and (count == 0 or n == count), f'patch miss ({n}x): {old[:80]}'
    return s.replace(old, new)


def inseam(L, R):  # 하의 4칸(허리 · 밑위 · 허벅지 · 총장) → 등록 버전 5칸(인심 추가). 인심 ≈ 총장 − 밑위 + 2 (등록 버전 예시 값과 같은 규칙)
    return round((L - R + 2) * 2) / 2


def bottom5(text):
    """하의 치수 배열 [허리, 밑위, 허벅지, 총장] → [허리, 밑위, 허벅지, 인심, 총장]"""
    def fix(m):
        a = [float(x) for x in m.group(1).split(',')]
        if len(a) != 4:
            return m.group(0)
        v = a[:3] + [inseam(a[3], a[1])] + [a[3]]
        return '[' + ', '.join(('%g' % x) for x in v) + ']'
    return re.sub(r'\[([\d.]+(?:,\s*[\d.]+){3})\]', fix, text)


SUBMAP = {"'셔츠'": "'긴팔 셔츠'", "'티셔츠'": "'긴팔 티셔츠'", "'바지'": "'긴바지'", "'치마'": "'긴치마'"}


def subnames(text):
    for a, b in SUBMAP.items():
        text = re.sub(r"(sub: )" + re.escape(a), r'\1' + b, text)
    return text


# ── 이미지: 상품 사진은 한 표(IMG0)에, 옷장 누끼는 CUT에 ──
def img_map(t, var='IMG'):
    m = re.search(r'^(?:const |Object\.assign\()' + var + r'(?: = |, )(\{.*?\})', t, re.M | re.S)
    return dict(re.findall(r'"([A-Za-z0-9_]+)":\s*"(data:[^"]+)"', m.group(1))) if m else {}


IMGS = {}
for k, var in [('d', 'IMG'), ('d', 'IMG,'), ('c', 'IMG'), ('h', 'IMG')]:
    t = main_script(SRC[k])
    if var == 'IMG,':
        m = re.search(r'Object\.assign\(IMG, (\{.*?\})\);', t, re.S)
        part = dict(re.findall(r'"([A-Za-z0-9_]+)":\s*"(data:[^"]+)"', m.group(1)))
    else:
        part = img_map(t)
    for key, val in part.items():
        if key in ('leather', 'suede') and k == 'c':
            continue  # 홈의 상품 사진을 씀 (옷장은 CUT 누끼)
        if key == 'pdGuide':
            continue  # 실측 부위 안내는 상세 v2 도식으로 바뀜
        IMGS.setdefault(key, val)
IMG0 = 'const IMG0 = {' + ','.join(f'"{k}":"{v}"' for k, v in IMGS.items()) + '};'

# ── 데이터 ──
CATS = """const CATS = [
  { k: 'top', label: '상의', icon: 'top', parts: PARTS.top, sizes: ['S', 'M', 'L', 'XL'], shape: 'top', subs: SUB.top,
    info: ['면 100%', '릴렉스 핏 · 드롭 숄더'],
    demo: { link: ['base', '옥스퍼드 버튼다운 셔츠', 'L', [74, 50, 58, 60], '긴팔 셔츠'], cam: ['tee', '헤비웨이트 티셔츠', 'L', [71, 53, 58, 23], '반팔 티셔츠'] } },
  { k: 'bottom', label: '하의', icon: 'bottom', parts: PARTS.bottom, sizes: ['28', '29', '30', '31', '32'], shape: 'bottom', subs: SUB.bottom,
    info: ['울 70% · 폴리 30%', '와이드 · 스트레이트'],
    demo: { link: ['denim', '스트레이트 데님', '30', [40, 30, 31.5, 75.5, 103], '긴바지'], cam: ['denim', '스트레이트 데님', '30', [40, 30, 31.5, 75.5, 103], '긴바지'] } },
  { k: 'outer', label: '아우터', icon: 'outer', parts: PARTS.outer, sizes: ['S', 'M', 'L', 'XL'], shape: 'top', subs: SUB.outer,
    info: ['면 100%', '레귤러 핏'],
    demo: { link: ['jacket', '코튼 초어 재킷', 'M', [70, 48, 58, 60], '점퍼/자켓'], cam: ['jacket', '코튼 초어 재킷', 'M', [70, 48, 58, 60], '점퍼/자켓'] } },
];
const CATK = CATS.map((c) => c.k); // 홈 · 카테고리 화면용 종류 키 목록"""

# 상품: 홈 버전 15개(세부 종류 포함) + 상세 디자인 시안 상품(p16) · 하의는 인심 칸 추가
DPROD = re.search(r"\{ id: 'p1', img: 'pdHero'.*?photos: \{ hero: 'pdHero', detail: 'pdDetail' \} \}", u('d', 'P'), re.S).group(0)
DPROD = DPROD.replace("id: 'p1'", "id: 'p16'").replace("cat: 'outer', tag: '패딩'", "cat: 'outer', sub: '숏패딩', tag: '아우터'")
P = re.sub(r"(  \{ id: 'p\d+'.*?(?=\n  \{ id:|\n\];))", lambda m: bottom5(m.group(1)) if "cat: 'bottom'" in m.group(1) else m.group(1), u('h', 'P'), flags=re.S)
P = sub(P, 'const P = [\n', 'const P = [\n  ' + DPROD + ',\n')

if TEST_BUILD:
    # 유저테스트 후기 조건: p11 신상(후기 2개, 실측 추가해 비교 가능하게) · p15 후기 많음
    P = sub(P, "rate: 4.6, rev: 1532, sizes: null, list: ['S', 'M', 'L'], out: [] }", "rate: 4.5, rev: 2, sizes: { S: [64, 47, 57, 59], M: [66, 49, 59, 60], L: [68, 51, 62, 61] }, out: [] }")
    P = sub(P, "rate: 4.7, rev: 745,", "rate: 4.7, rev: 1286,")
    P = sub(P, "rate: 4.7, rev: 2876,", "rate: 4.5, rev: 2,")  # p12 오버핏 롱슬리브 티: 유저테스트 '후기 적음' 조건
    TEST_JS = (ROOT / 'testmode.js').read_text()
    # 유저테스트 '후기 많음' 기준 상품: 무신사 상품 2149254(베이식 긴소매 티셔츠 2팩)와 같은 실측 · 가격 · 후기 수.
    # 사진 · 후기 문장은 무신사 것을 쓰지 않고 기존 예시 사진(tee2)과 예시 후기로 채움. 실측 출처: musinsa.com/products/2149254 (2026-10-22 확인)
    P = sub(P, "\n];", "\n  { id: 'p17', img: 'tee2', brand: 'BRAND P', name: '베이식 긴소매 티셔츠 2팩', cat: 'top', sub: '긴팔 티셔츠', tag: '티셔츠', price: 39800, dc: 0, rate: 4.9, rev: 80881,\n"
            "    colors: ['브라운/블랙', '화이트/블랙', '화이트/멜란지 그레이', '블랙/멜란지 그레이'], spec: [['성별', '남녀공용'], ['소재', '면 100%'], ['핏', '레귤러 핏']],\n"
            "    sizes: { S: [67.5, 46.5, 51, 56], M: [69, 48.5, 53.5, 58], L: [70.5, 50, 56, 59], XL: [72, 51.5, 58.5, 60], '2XL': [73, 53, 61, 60.5], '3XL': [74, 54.5, 63.5, 61] }, out: [] },\n];")
RV_JS, RV_ACT = (ROOT / 'reviews.js').read_text().split('//@@ACTIONS')
V2P = u('d2', 'P')
V2S = {('p16' if pid == 'p1' else pid): sz for pid, sz in re.findall(r"\{ id: '(p\d+)'.*?sizes: (\{[^}]*\}|null)", V2P, re.S)}
P_CONV = ('// 상품 치수를 그룹 칸으로: 상세 v2에 실측이 있는 상품은 그 값, 나머지는 옛 4 · 5칸에서 옮기고 늘어난 칸은 예시 값\n'
          'const V2S = {' + ', '.join(f"{k}: {v}" for k, v in V2S.items() if v != 'null') + '};\n'
          "P.forEach((p) => { if (V2S[p.id]) p.sizes = V2S[p.id]; else if (p.sizes) for (const k in p.sizes) p.sizes[k] = fromLegacy(p, p.sizes[k], true); });")

ITEM = ("// 옷 한 벌. 치수는 그룹 칸 순서. 예전 형식(상의 4 · 바지 5칸) 데이터는 그룹 칸으로 옮기고 늘어난 칸은 예시 값으로 (g: true면 이미 그룹 칸)\n"
        "const item = (o) => { const x = Object.assign({ id: 'c' + (uid++), fit: null, notes: [], base: false, subBase: false, sub: null, img: null, returned: false, src: '직접 입력', at: uid }, o);\n"
        "  if (x.m && !x.g) x.m = fromLegacy(x, x.m, true); delete x.g; return x; };")

PRESETS = u('c', 'PRESETS')
PRESETS = subnames(PRESETS)
PRESETS = re.sub(r"(item\(\{[^}]*?cat: 'bottom'[^}]*?\}\))", lambda m: bottom5(m.group(1)), PRESETS)
PRESETS = re.sub(r"(item\(\{[^}]*?sub: '[^']*', [^}]*?cat: 'bottom'[^}]*?\}\))", lambda m: bottom5(m.group(1)), PRESETS)
for name, pid, brand in [('옥스퍼드 버튼다운 셔츠', 'p2', 'BRAND B'), ('코튼 릴렉스 셔츠', 'p1', 'BRAND A'), ('헤비웨이트 티셔츠', 'p7', 'BRAND G'),
                         ('청키 크루넥 니트', 'p4', 'BRAND D'), ('코튼 초어 재킷', 'p3', 'BRAND C'), ('와이드 울 슬랙스', 'p5', 'BRAND E')]:
    PRESETS = PRESETS.replace(f"name: '{name}'", f"pid: '{pid}', brand: '{brand}', name: '{name}'", 1)
# 기준 옷 없는 회원 = 옷장 0벌 (처음 담은 잘 맞는 옷이 기준 옷이 되므로) · 홈 버전 규칙
PRESETS = re.sub(r"  nobase: \(\) => .*?\n", "  nobase: () => ({ user: { name: '준성' }, closet: [] }), // 처음 담은 잘 맞는 옷이 기준 옷이 되므로, 기준 옷 없는 회원 = 옷장 0벌\n", PRESETS)
PRESETS = re.sub(r"  empty: \(\) => .*?\n", '', PRESETS)
PRESETS = sub(PRESETS, '  nobase:', "  empty: () => PRESETS.nobase(),\n  nobase:")
assert "m: [40, 30, 32, 104]" not in PRESETS
PRESETS = sub(PRESETS, "name: '코튼 초어 재킷', cat: 'outer',", "name: '코튼 초어 재킷', cat: 'outer', base: true,")
if TEST_BUILD:
    # 유저테스트 가상 인물 '하늘' (176cm · 70kg · 평소 상의 L): 기준 옷이 정해져 있어 과제마다 정답 사이즈가 있음
    PRESETS = sub(PRESETS, "  many: () =>", '''  persona: () => ({ user: { name: '하늘' }, closet: [
    item({ name: '화이트 긴팔 티셔츠', cat: 'top', sub: '긴팔 티셔츠', size: 'L', m: [70, 49, 55, 59], fit: 'good', base: true, src: '직접 입력' }),
    item({ pid: 'p2', brand: 'BRAND B', img: 'base', name: '옥스퍼드 버튼다운 셔츠', cat: 'top', sub: '긴팔 셔츠', size: 'L', m: [74, 50, 58, 60], fit: 'good', subBase: true, src: '상품 링크' }),
    item({ pid: 'p7', brand: 'BRAND G', img: 'tee', name: '헤비웨이트 티셔츠', cat: 'top', sub: '반팔 티셔츠', size: 'L', m: [71, 53, 58, 23], fit: 'good', src: '구매내역 캡처' }),
    item({ img: 'denim', name: '와이드 데님', cat: 'bottom', sub: '긴바지', size: '30', m: [40, 30, 32, 76, 104], fit: 'good', base: true, src: 'A4 촬영' }),
    item({ pid: 'p3', brand: 'BRAND C', img: 'jacket', name: '코튼 초어 재킷', cat: 'outer', sub: '점퍼/자켓', size: 'M', m: [70, 48, 58, 60], fit: 'good', base: true, src: 'Layr 구매' }),
  ] }),
  many: () =>''')  # 아우터 기준 옷 = 초어 재킷 (상세 버전 예시와 같게)

RESET = u('c', 'reset')
RESET = sub(RESET, 'S = { preset, ', "S = { preset, recent: ['셔츠', '패딩', '데님 자켓'], ")
RESET = sub(RESET, "nav = [{ s: FOCUS ? 'closet' : 'home', p: {} }];", "nav = [{ s: 'home', p: {} }];")

BASEFOR = ("// 기준 옷: 세부 종류 기준(내 옷장, 선택)이 있으면 그 옷, 없으면 그룹 기준 옷 (상세 v2)\n"
           "const baseFor = (p) => { const b = subBaseOf(p.cat, p.sub) || baseOf(p); return b && grpOf(b) === grpOf(p) ? b : null; }; // 세부 종류 기준 → 그룹 기준 옷. 다른 그룹 옷과는 비교 안 함")

RECOF = sub(u('c', 'recOf'), 'map((v, i) => +(v - base.m[i]).toFixed(1))', 'map((v, i) => v && base.m[i] ? +(v - base.m[i]).toFixed(1) : 0)')

DESCRIBE = re.sub(r"  const kind = .*?\n", "  const kind = base.sub || CAT[p.cat];\n", u('d2', 'describe'))  # 상세 v2: 그룹 칸 부위 이름

SUMMARY = u('d2', 'summaryOf')  # 상세 v2: 그룹 칸 부위 이름

DETAIL = u('d2', 'SCR.detail')
DETAIL = sub(DETAIL, '<span class="pd-bimg"><img src="${IMG[base.img]}" alt=""></span>', '<span class="pd-bimg">${cutPic(base)}</span>')  # 사진 없는 옷은 치수 실루엣 (내 옷장)
DETAIL = re.sub(r'<section class="dsec" id="s_rev">.*?</section>', '${revSection(p)}', DETAIL, count=1, flags=re.S)  # 스냅·후기 → 후기 화면 (reviews.js)
assert '${revSection(p)}' in DETAIL
if TEST_BUILD:
    DETAIL = sub(DETAIL, 'SCR.detail = (pp) => {\n', 'SCR.detail = (pp) => {\n  if (TEST && TEST.nocmp) pp.nob = true; // 유저테스트 기준 조건: 내 옷 비교 없이 사이즈표만\n')
DETAIL = sub(DETAIL, '<em>기준</em>', "<em>${base.subBase && base.sub === p.sub ? base.sub + ' 기준' : '기준'}</em>")
# 1단계 변환: 사이즈표 · 도식은 v2 그룹 칸(gArr), 문구 · 개수는 통합본 칸 그대로 (detail2.js)
i0, i1 = DETAIL.index('  const TH = PART_N;'), DETAIL.index("  let cmp = '';")
DETAIL = DETAIL[:i0] + """  const fmt = (v) => v == null ? '–' : v, gsz = (k) => gArr(p, p.sizes[k]), ref = FLAT_SRC[subOf(p)].ref;
  // 사이즈표: 통합본 데이터에 없는 부위 칸은 통째로 숨기고, 일부만 비면 '–'
  const tblFor = (rows) => {
    const keep = parts.map((_, i) => rows.some(([, v]) => v[i] != null)), cols = parts.filter((_, i) => keep[i]), pick = (v) => v.filter((_, i) => keep[i]);
    const head = `<tr><th>cm</th>${cols.map((x) => `<th><i>${parts.indexOf(x) + 1}</i>${PART_N[x]}</th>`).join('')}</tr>`;
    return `<div class="pd-ta"><div class="pd-tw"><table class="pd-tbl">${head}${rows.map(([h, v, cls, td]) => `<tr class="${cls || ''}"><th>${h}</th>${pick(v).map(td || ((x) => `<td>${fmt(x)}</td>`)).join('')}</tr>`).join('')}</table></div><p class="pd-note">단면 실측(cm) 기준이에요. 재는 방법에 따라 1~2cm 차이가 날 수 있어요.</p></div>`;
  };
""" + DETAIL[i1:]
DETAIL = sub(DETAIL, """    const d = deltaOf(p, base, view), m = p.sizes[view], sgn = (v) => v === 0 ? '0' : (v > 0 ? '+' : '-') + Math.abs(v);
    const fig = flatFig(subOf(p), [{ m: base.m, role: 'base' }, { m, role: 'prod' }], { d, parts });""",
"""    const d = deltaOf(p, base, view), sgn = (v) => v === 0 ? '0' : (v > 0 ? '+' : '-') + Math.abs(v);
    const gm = gsz(view), gb = gArr(base, base.m), gd = gm.map((v, i) => v == null || gb[i] == null ? null : +(v - gb[i]).toFixed(1));
    const fill = (a, b) => a.map((v, i) => v ?? b[i] ?? ref[i]); // 도식은 빈 부위를 반대쪽 옷 값 → 원본 기준 치수로 채워 그림 (뱃지는 안 붙음)
    const fig = flatFig(subOf(p), [{ m: fill(gb, gm), role: 'base' }, { m: fill(gm, gb), role: 'prod' }], { d: gd, parts });""")
DETAIL = re.sub(r"\$\{tbl\(row\('기준 옷', ext\(base\.m\)\).*?\)\)\}`;",
    lambda m: "${tblFor([['기준 옷', gb], [view, gm, 'hl'], ['차이', gd, '', (v) => v == null ? '<td>–</td>' : `<td class=\"${fitOf(v)}\">${v === 0 ? '같음' : sgn(v)}</td>`]])}`;", DETAIL, count=1, flags=re.S)
assert 'tblFor([[' in DETAIL
DETAIL = sub(DETAIL, "} else if (p.sizes) cmp = tbl(keys.map((k) => row(k, ext(p.sizes[k]))).join(''));", "} else if (p.sizes) cmp = tblFor(keys.map((k) => [k, gsz(k)]));")
DETAIL = sub(DETAIL, "[{ m: p.sizes[keys[Math.floor((keys.length - 1) / 2)]], role: 'prod' }]", "[{ m: gsz(keys[Math.floor((keys.length - 1) / 2)]).map((v, i) => v ?? ref[i]), role: 'prod' }]")
assert 'tbl(' not in DETAIL.replace('tblFor(', '') and 'ext(' not in DETAIL
DETAIL = sub(DETAIL, "d.filter((v) => fitOf(v) ===", "gd.filter((v) => v != null && fitOf(v) ===", 0)  # 비슷해요 · 넉넉해요 · 부족해요 개수도 도식 · 표와 같은 칸 기준
assert DETAIL.count('gd.filter((v) => v != null && fitOf(v) ===') == 3

BASESHEET = sub(u('d2', 'baseSheet'), '<span class="pd-bimg"><img src="${IMG[c.img] || \'\'}" alt=""></span>', '<span class="pd-bimg">${cutPic(c)}</span>')  # v2: 같은 그룹 옷만
FLATFIG = sub(u('d2', 'flatFig'), 'html = g.anchors.map((a, i) => `<span', 'html = g.anchors.map((a, i) => opt.d[i] == null ? \'\' : `<span')
PAY = u('d', 'A.pay')
PAY = sub(PAY, 'cat: p.cat, size: it.size,', 'cat: p.cat, sub: p.sub || null, pid: p.id, brand: p.brand, size: it.size,')
PAY = sub(PAY, '[41, 31, 33, 108]', '[41, 31, 33, 79, 108]')

RENDER = u('d', 'render')
RENDER = sub(RENDER, 'function render(fresh) {\n', 'function render(fresh) {\n  if (S.closet) ensureBases();\n')
RENDER = sub(RENDER, "const b0 = app.querySelector('.body');", "const b0 = view.querySelector('.body');")
RENDER = sub(RENDER, 'app.innerHTML = h;', 'view.innerHTML = h;')
RENDER = sub(RENDER, "const b = app.querySelector('.body');", "const b = view.querySelector('.body');")
RENDER = sub(RENDER, "document.getElementById('failBtn').classList.toggle('on', S.failNext);",
             "const fb = document.getElementById('failBtn'); if (fb) fb.classList.toggle('on', S.failNext);\n  setTimeout(bindRacks);" + ("\n  if (TEST) testAfter();" if TEST_BUILD else ""))

# 홈: 홈 밖으로 가던 버튼(데모에서는 막혀 있던 것)을 실제 화면으로 연결
HOME_FIX = [
    ('regCard', "regcard${S.user ? ' dead' : ''}", 'regcard'),
    ('tabExh', 'class="img exhimg" data-a="detail">', 'class="img exhimg" data-a="detail" data-x="${e.ids[0]}">'),
    ('RANK_MOVE', "p5: '–' };", "p5: '–', p16: 'NEW' };"),
]
HOME = {}
for name in ['regCard', 'RANK_MOVE', 'EXH', 'EVT', 'QI', 'QUICK', 'saleLeft', 'orig', 'rankCard', 'dealCard', 'saleCard', 'miniCard', 'simPct', 'simFit',
             'tabRec', 'tabRank', 'tabSale', 'tabExh', 'tabEvt', 'SCR.home', 'SCR.searchOld', 'SCR.clist', 'SCR.search', 'SORTS', 'sortBtn', 'sortBy',
             'HOT', 'KW', 'findBar', 'findHit', 'SCR.find', 'SCR.result', 'homePopupCheck', 'keepX', 'SCR.splash']:
    s = u('h', name)
    s = re.sub(r'\bCATS\b', 'CATK', s)
    s = s.replace('class="rk"', 'class="rnk"')
    HOME[name] = s
for name, a, b in HOME_FIX:
    HOME[name] = sub(HOME[name], a, b)
# 홈 작업자 요청(2026-10-22): 추천 탭 '옷장 기준 랭킹 상품' — 제목에 회원 이름, 순위 번호 빼기, 비교할 기준 옷 드롭다운
HOME['simFit'] = r"""function simFit() {
  const bases = S.closet.filter((c) => c.base); if (!bases.length) return '';
  const b = bases.find((c) => c.id === S.simB) || bases[0], open = !!S.simDD;
  const rank = P.slice().sort((x, y) => y.rev - x.rev).map((x) => x.id), owned = S.closet.map((c) => c.pid);
  const same = (x) => b.sub ? x.sub === b.sub : x.cat === b.cat; // 같은 2뎁스끼리, 기준 옷에 2뎁스가 없으면 같은 1뎁스
  const items = rank.map((id) => PB[id]).filter((x) => x.sizes && !owned.includes(x.id) && x.cat === b.cat && same(x)).map((x) => {
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
}, true);"""
HOME['simPct'] = ("const simPct = (x, b, k) => { const d = x.sizes[k].map((v, i) => v && b.m[i] ? Math.abs(v - b.m[i]) : null).filter((v) => v != null); "
                  "return d.length ? Math.round(d.reduce((a, v) => a + Math.max(0, 1 - v / 5), 0) / d.length * 100) : 0; }; // 두 옷 모두 잰 부위만")
HOME['simFit'] = sub(HOME['simFit'], 'x.cat === b.cat && same(x)', 'x.cat === b.cat && grpOf(x) === grpOf(b) && same(x)')
HOME['tabRec'] = sub(HOME['tabRec'], '${base.length ? simFit(base) : \'\'}', '${base.length ? simFit() : \'\'}')
HOME['SCR.home'] = sub(HOME['SCR.home'], "'① 홈 · 추천 · 기준 옷 있음 · 내 옷과 사이즈가 비슷한 랭킹 상품'", "'① 홈 · 추천 · 기준 옷 있음 · 옷장 기준으로 고른 랭킹 상품'")

# 내 옷장: 상품 세부 종류는 p.sub
CLOSET = {}
for name in ['ensureBases', 'subBaseOf', 'pic', 'catGrid', 'pill', 'rackCard', 'RK', 'withWa', 'rkAct', 'cutPic', 'TPL', 'tplSvg', 'dragEnd', 'bindRacks',
             'syncEdit', 'compareSheet', 'setImg', 'photoGo', 'saveFit', 'SCR.fit', 'SCR.closet', 'SCR.item', 'SCR.edit', 'SCR.regFit', 'SCR.orders',
             'scenario', 'focusGo', 'CM', 'CUT']:
    CLOSET[name] = subnames(u('c', name).replace('p.tag', 'p.sub'))
CL = CLOSET
CL['rkAct'] = CL['rkAct'].replace('${CAT[c.cat]}', '${GN(c)}')  # 기준 옷 문구는 그룹 이름(긴팔 상의 …)
CL['SCR.item'] = sub(CL['SCR.item'], 'const cb = baseOf(c.cat), L = CAT[c.cat];', 'const cb = baseOf(c), L = GN(c);')
CL['SCR.item'] = sub(CL['SCR.item'], '<div style="font-size:12.5px;color:var(--sub);margin-top:3px">${L}${c.sub', '<div style="font-size:12.5px;color:var(--sub);margin-top:3px">${CAT[c.cat]}${c.sub')
CL['SCR.item'] = sub(CL['SCR.item'], "${PARTS[c.cat].map((x, i) => `<tr><td style=\"color:var(--ink2)\">${LONG[x]}</td><td>${c.m[i]} cm</td></tr>`).join('')}",
                     "${partsOf(c).map((x, i) => `<tr><td style=\"color:var(--ink2)\">${LONG[x] || x}</td><td>${c.m[i] ? c.m[i] + ' cm' : '<span style=\"color:var(--sub)\">–</span>'}</td></tr>`).join('')}")
CL['SCR.closet'] = sub(CL['SCR.closet'], 'cb = baseOf(t), sb = sv ? subBaseOf(t, sv) : null;', 'cb = sv ? baseOf({ cat: t, sub: sv }) : baseOf(t), sb = sv ? subBaseOf(t, sv) : null;')
CL['SCR.closet'] = sub(CL['SCR.closet'], 'const isRef = (c) => sv ? c.subBase : c.base;', 'const isRef = (c) => sv ? c.subBase : c === cb; // 그룹마다 기준 옷이 있어 \'전체\'에선 첫 기준 옷만 가운데')
CL['SCR.closet'] = sub(CL['SCR.closet'], "`${CAT[t]} 기준`", "`${GN(cb)} 기준`")
CL['SCR.edit'] = sub(CL['SCR.edit'], '${cm.parts.map((x, i) => `<div class="field"><span>${x}</span>', '${partsOf(d).map((x, i) => `<div class="field"><span>${LONG[x] || x}</span>')
CL['SCR.edit'] = sub(CL['SCR.edit'], 'value="${d.m[i]}"', 'value="${d.m[i] ?? \'\'}"')
CL['syncEdit'] = sub(CL['syncEdit'], 'CM[d.cat].parts.map(', 'partsOf(d).map(')
CL['compareSheet'] = sub(CL['compareSheet'], 'const parts = PARTS[c.cat];', 'const parts = partsOf(c);')
CL['compareSheet'] = sub(CL['compareSheet'], '${parts.map((x, i) => { const dv', "${parts.map((x, i) => { if (!c.m[i] || !old.m[i]) return ''; const dv")
CL['tplSvg'] = sub(CL['tplSvg'], 'const m = (c.m || []).map(Number); if (m.length < 4 || m.some((v) => !v)) return', 'const m = legacyOf(c); if (!m) return')
CL['saveFit'] = CL['saveFit'].replace('baseOf(c.cat)', 'baseOf(c)').replace('잘 맞는 ${CAT[c.cat]}가', '잘 맞는 ${GN(c)}가').replace('`${CAT[c.cat]} 기준 옷으로 정했어요', '`${GN(c)} 기준 옷으로 정했어요')
assert 'baseOf(c.cat)' not in CL['saveFit']
CLOSET['scenario'] = re.sub(r"item\(\{[^}]*?cat: 'bottom'[^}]*?\}\)", lambda m: bottom5(m.group(0)), CLOSET['scenario'])

# 옷 등록 화면: 치수 칸은 그룹 칸, 기준 옷은 같은 그룹 (상세 v2)
REG_SCR = {
    'SCR.regMeasure': [('cur0 = baseOf(r.cat)', 'cur0 = baseOf({ cat: r.cat, sub: r.sub })'), ('이 옷을 ${CAT[r.cat]} 기준 옷으로 정하기', '이 옷을 ${GN(r)} 기준 옷으로 정하기'), ('제일 잘 맞는 ${CAT[r.cat]}를 기준 옷으로', '제일 잘 맞는 ${GN(r)}를 기준 옷으로')],
    'SCR.regLinkP': [('parts = PARTS[p.cat];', 'parts = partsOf(p);'), ('<td>${p.sizes[sz][i]} cm</td>', "<td>${p.sizes[sz][i] ? p.sizes[sz][i] + ' cm' : '–'}</td>")],
    'SCR.regLinkS': [('parts = PARTS[cat], row', 'parts = PARTS[(S.reg && S.reg.pk) || cat], row')],
}
def ureg(name):
    s = u('r', name)
    for a, b in REG_SCR.get(name, []):
        assert a in s, (name, a); s = s.replace(a, b)
    return s

# ── 메인 스크립트 조립 (등록 버전 순서를 뼈대로) ──
R = U['r']
out = []
add = out.append
for name in R:
    if name.startswith('A.') or name in ('A{', 'A}'):
        continue
    if name == 'IMG0':
        add(IMG0)
    elif name == 'IMG':
        add(u('r', 'IMG'))
        add(CLOSET['CUT'])
    elif name == 'I':
        add(u('d', 'I'))
    elif name == 'SB':
        add(u('r', 'SB'))
        add('const FOCUS = false; // 내 옷장 버전의 "옷장 집중 모드" (통합본에서는 끔)')
    elif name in ('NEED', 'pkOf', 'baseOf', 'setPk'):
        continue  # detail2.js 에서 그룹 기준으로 다시 정의
    elif name == 'PARTS':
        for n in ['SUBS', 'SUB_ORDER', 'GROUP_N', 'TOP7', 'GPARTS', 'PART_N', 'SUB_DEFAULT']:
            add(u('d2', n))
        add((ROOT / 'detail2.js').read_text().rstrip())
        add(CATS)
        add(CLOSET['CM'])
    elif name == 'P':
        add(P)
        add(P_CONV)
    elif name == 'item':
        add(ITEM)
    elif name == 'PRESETS':
        add(PRESETS)
    elif name == 'reset':
        add(RESET)
    elif name == 'baseFor':
        continue  # ofCat · subBaseOf 뒤로
    elif name == 'ofCat':
        add(u('r', 'ofCat'))
        add(CLOSET['subBaseOf'])  # ensureBases 는 detail2.js (그룹마다 기준 옷)
        add(BASEFOR)
        for n in ['pic', 'catGrid', 'pill']:
            add(CLOSET[n])
    elif name == 'need':
        add(u('h', 'need'))
    elif name == 'judge':
        add(sub(u('c', 'judge'), 'if (!ofCat(p.cat).length) return { n: 3 };', 'if (!famOf(p).length) return { n: 3 }; // 같은 그룹 옷이 없음 (상세 v2)'))
        add(RECOF)
    elif name == 'describe':
        add(DESCRIBE)
    elif name == 'deltaOf':
        add(sub(u('r', 'deltaOf'), 'map((v, i) => base.m[i] ?', 'map((v, i) => v && base.m[i] ?'))
    elif name == 'fitChip':
        add(u('h', 'fitChip'))
    elif name == 'SCR.splash':
        add(HOME['SCR.splash'])
    elif name == 'SCR.home':
        for n in ['regCard', 'RANK_MOVE', 'EXH', 'EVT', 'QI', 'QUICK', 'saleLeft', 'orig', 'rankCard', 'dealCard', 'saleCard', 'miniCard', 'simPct', 'simFit',
                  'tabRec', 'tabRank', 'tabSale', 'tabExh', 'tabEvt', 'SCR.home']:
            add(HOME[n])
    elif name == 'SCR.search':
        for n in ['SCR.searchOld', 'SCR.clist', 'SCR.search', 'SORTS', 'sortBtn', 'sortBy', 'HOT', 'KW', 'findBar', 'findHit', 'SCR.find', 'SCR.result']:
            add(HOME[n])
    elif name == 'LONG':
        for n in ['FLAT_SRC', 'lerp', 'MIR', 'flatParse', 'flatLand', 'flatTPS', 'FLAT_P', 'flatGeom']:
            add(u('d2', n))
        add(FLATFIG)
        add(u('d2', 'guideLine'))
        add(sub(u('r', 'LONG'), "인심: '인심',", "인심: '인심', 전체소매: '전체소매길이',"))
        add(u('d', 'TOL'))
        add(u('d', 'fitOf'))
    elif name == 'fitWord':
        add(u('d', 'fitWord'))
    elif name == 'summaryOf':
        add(SUMMARY)
    elif name == 'SCR.detail':
        add(DETAIL)
        add(RV_JS.rstrip())
    elif name in ('SCR.cart', 'SCR.order'):
        add(u('d', name))
    elif name in ('SCR.fit', 'SCR.closet', 'SCR.item', 'SCR.edit', 'SCR.regFit', 'SCR.orders'):
        add(CLOSET[name])
    elif name == 'render':
        add(RENDER)
        for n in ['rackCard', 'RK', 'withWa', 'rkAct', 'cutPic', 'TPL', 'tplSvg', 'dragEnd', 'bindRacks']:
            add(CLOSET[n])
    elif name == 'homePopupCheck':
        add(HOME['homePopupCheck'])
        add(HOME['keepX'])
    elif name == 'buyFlow':
        add(u('d', 'buyFlow'))
    elif name == 'sizeSheet':
        add(u('r', 'sizeSheet'))
        for n in ['syncEdit', 'compareSheet', 'setImg', 'photoGo']:
            add(CLOSET[n])
    elif name == 'saveFit':
        add(CLOSET['saveFit'])
        add(u('d', 'optSheet'))
        add(BASESHEET)
        for n in ["document.addEventListener('pointerdown", "document.addEventListener('click"]:
            add(u('d', n))
        out.append('@@A@@')
    elif name in ("document.getElementById('page')",):
        out.append('@@PAGE@@')
    elif name == "app.addEventListener('input":
        add(u('r', name))
        add(u('h', name))
        add(u('h', "app.addEventListener('keydown"))
    elif name in ('reset(',):
        out.append(CLOSET['scenario'])
        out.append(CLOSET['focusGo'])
        if TEST_BUILD:
            add(TEST_JS.rstrip())
            add('if (!testStart()) { ' + u('r', name).strip() + ' }\ntestLinks();')
        else:
            add(u('r', name))
    else:
        add(ureg(name))

# ── 동작(A) ──
A_SRC = {}
for n in U['r']:
    if n.startswith('A.'):
        A_SRC[n] = ('r', u('r', n))
for n in ['A.chip', 'A.toSize', 'A.dtab', 'A.buyOpen', 'A.optOpen', 'A.optColor', 'A.optSize', 'A.optQty', 'A.optDel', 'A.optGo',
          'A.cmpToggle', 'A.pickBase', 'A.cartOrder', 'A.homeReg', 'A.popGo']:
    A_SRC[n] = ('d', u('d', n))
for n in ['A.dpick', 'A.bpSel', 'A.bpOk', 'A.pickBase']:  # 상세 v2: 기준 옷 시트 · 정하기를 그룹 기준으로
    A_SRC[n] = ('d2', u('d2', n))
A_SRC['A.pay'] = ('d', sub(sub(PAY, 'cat: p.cat, sub: p.sub || null,', 'cat: p.cat, sub: p.sub || null, g: true,'), 'm: p.sizes ? p.sizes[it.size].slice() : [41, 31, 33, 79, 108]', 'm: p.sizes ? p.sizes[it.size].slice() : fromLegacy(p, [41, 31, 33, 79, 108], true)'))  # 산 옷 치수 = 상품 실측(그룹 칸)
def rpatch(n, pairs):
    s = A_SRC[n][1]
    for a, b in pairs:
        assert a in s, (n, a); s = s.replace(a, b)
    A_SRC[n] = ('r', s)
rpatch('A.regSrvUse', [('parts = PARTS[cat], img', 'parts = PARTS[(S.reg && S.reg.pk) || cat], img')])
rpatch('A.regSave', [('if (x.cat === c.cat) x.base = false;', 'if (x.cat === c.cat && grpOf(x) === grpOf(c)) x.base = false;'), ('${CAT[c.cat]} 기준 옷으로', '${GN(c)} 기준 옷으로')])
rpatch('A.regAdd', [('const it = item({ img: r.img, name, cat: r.cat, sub: r.sub, pk, size: r.size, m,', 'const it = item({ img: r.img, name, cat: r.cat, sub: r.sub, pk, g: true, size: r.size, m: remapM(P, m, partsOf({ cat: r.cat, sub: r.sub })),')])
rpatch('A.regCropOk', [('m: M[img],', 'm: fromLegacy({ cat }, M[img]),')])  # 시연용 캡처 치수(옛 칸) → 그룹 칸, 못 읽은 칸은 빈칸
rpatch('A.shoot', [('m: tpl[3],', 'm: fromLegacy({ cat: S.reg.cat }, tpl[3]),')])
rpatch('A.regLinkGo', [("toMeasure({ cat: p.cat, img: p.img,", "toMeasure({ cat: p.cat, sub: p.sub || null, img: p.img,"),
                       ("tbl: p.sizes ? (k) => p.sizes[k] ? p.sizes[k].slice() : null : null", "tbl: p.sizes ? (k) => p.sizes[k] ? remapM(partsOf(p), p.sizes[k], PARTS[S.reg.pk || S.reg.cat]) : null : null")])

for n in ['A.fitSave', 'A.returnStart', 'A.saveEdit', 'A.setBase', 'A.setBaseOk', 'A.delItem', 'A.delOk', 'A.rackRef', 'A.closetSub', 'A.rackTap',
          'A.editCat', 'A.editCatOk', 'A.editSub', 'A.editSize', 'A.setSubBase', 'A.setSubBaseOk', 'A.unsetSub', 'A.photoAdd', 'A.photoSrc',
          'A.photoPerm', 'A.photoPick']:
    A_SRC[n] = ('c', subnames(u('c', n).replace('p.tag', 'p.sub')))
A_SRC['A.rackRef'] = ('c', sub(A_SRC['A.rackRef'][1], 'if (card) box.rackTo(+card.dataset.i); else A.item(id)',
                              'if (card && +card.dataset.i !== S.rack[box.dataset.rack]) box.rackTo(+card.dataset.i); else A.item(id)'))  # 기준 옷이 이미 가운데면 옷 상세 정보로
# 내 옷장 동작: 기준 옷은 같은 그룹 안에서, 치수 칸은 그룹 칸, 필수 칸만 검사
def cpatch(n, pairs):
    s = A_SRC[n][1]
    for a, b in pairs:
        assert a in s, (n, a); s = s.replace(a, b)
    A_SRC[n] = ('c', s)
cpatch('A.setBase', [('old = baseOf(c.cat)', 'old = baseOf(c)'), ('${CAT[c.cat]} 기준 옷', '${GN(c)} 기준 옷'), (', CAT[c.cat]);', ', GN(c));')])
cpatch('A.setBaseOk', [('old = baseOf(c.cat)', 'old = baseOf(c)'), ('${CAT[c.cat]} 기준 옷', '${GN(c)} 기준 옷')])
cpatch('A.delOk', [('const nx = baseOf(c.cat)', 'const nx = baseOf(c)'), ('잘 맞는 ${CAT[c.cat]}가', '잘 맞는 ${GN(c)}가')])
cpatch('A.setSubBase', [('cb = baseOf(c.cat), L = CAT[c.cat]', 'cb = baseOf(c), L = GN(c)')])
cpatch('A.unsetSub', [('${CAT[c.cat]} 기준', '${GN(c)} 기준')])
cpatch('A.saveEdit', [("if (m.some((v) => !v)) { toast('치수를 모두 적어 주세요'); render(); return }",
                       "const miss = NEED[pkOf(d.cat, d.sub)].filter((k) => !m[partsOf(d).indexOf(k)]); if (miss.length) { toast(`${miss.map((k) => LONG[k] || k).join(', ')}은 꼭 적어 주세요`); render(); return }"),
                      ('m.some((v) => v < 5 || v > 200)', 'm.some((v) => v && (v < 5 || v > 200))'),
                      ('const moved = d.cat !== c.cat,', 'const moved = d.cat !== c.cat || grpOf(d) !== grpOf(c),'),
                      ('const nb = baseOf(d.cat) === c && moved;', 'const nb = baseOf(c) === c && moved;'),
                      ('처음 잘 맞는 ${CAT[c.cat]}라', '처음 잘 맞는 ${GN(c)}라'), ('${CAT[c.cat]} 탭으로 옮겼어요', '${GN(c)}로 옮겼어요')])
cpatch('A.editSub', [("editSub(x) { syncEdit().sub = x || null; render() }",
                      "editSub(x) { const d = syncEdit(), was = partsOf(d); d.sub = x || null; const now = partsOf(d); if (was.join() !== now.join()) d.m = remapM(was, d.m, now); /* 그룹이 바뀌면 같은 부위 값만 옮김 */ render() }")])
cpatch('A.editCatOk', [('m: CM[k].parts.map(() => \'\')', 'm: partsOf({ cat: k }).map(() => \'\')')])
for n in ['A.sortOpen', 'A.sortSet', 'A.findGo', 'A.findDo', 'A.findCat', 'A.findClear', 'A.recentDel', 'A.recentAll', 'A.catC', 'A.catS', 'A.catGo',
          'A.listSub', 'A.rankCat', 'A.rankSub', 'A.rankPeriod', 'A.saleMin', 'A.coupon']:
    A_SRC[n] = ('h', u('h', n))
A_SRC['A.simOpen'] = ('h', "  simOpen() { S.simDD = !S.simDD; saveY(); render() },")
A_SRC['A.simPick'] = ('h', "  simPick(id) { S.simB = id; S.simDD = false; saveY(); render() },")
A_SRC['A.go'] = ('x', "  go(s) { closeOv(); if (s === 'popular') { tab('search'); return } go(s) }, // 홈 '인기 상품 · 전체 보기'는 카테고리로")
A_SRC.pop('A._unused', None)
A_BLOCK = 'const A = {\n' + '\n'.join(v for _, v in A_SRC.values()) + '\n};'

PAGE = u('d', "document.getElementById('page')")
PAGE = sub(PAGE, "    else if (f === 'login')", "    else if (f === 'photo') { if (!S.user) reset('nobase'); tab('closet'); S.reg = { cat: 'top', from: 'closet', m: null }; go('regType'); modOpen('top') }\n    else if (f === 'login')")
PAGE = sub(PAGE, "  if (d.startsWith('f:')) {", "  if (d.startsWith('c:')) { focusGo(d.slice(2)); return }\n  if (d.startsWith('x:')) { scenario(d.slice(2)); return }\n  if (d.startsWith('f:')) {")
PAGE = sub(PAGE, "    if (!o) { toast('먼저 상품을 주문해 주세요 (③ 구매)'); render(); return }",
           "    if (!o) { // 주문이 없으면 홈 버전처럼 시연용 옷 한 벌을 배송 완료로 (홈 카드 · 알림 점 확인용)\n"
           "      if (!S.user) { toast('로그인한 상태에서 볼 수 있어요 · 위에서 회원 상태를 골라 주세요'); render(); return }\n"
           "      const c = item({ pid: 'p1', img: 'hero', brand: 'BRAND A', name: '코튼 릴렉스 셔츠', cat: 'top', sub: '긴팔 셔츠', size: 'M', m: [72.5, 51, 58, 59.5], fit: null, delivered: true, src: 'Layr 구매' });\n"
           "      S.closet.push(c); S.notis.unshift({ t: '입어 보셨나요?', b: `${c.name} ${c.size}, 핏을 알려 주면 다음 추천에 반영돼요`, cid: c.id, read: false });\n"
           "      closeOv(); tab('home'); toast('주문한 옷이 배송 완료됐어요 · 홈 카드와 알림 점을 확인해 보세요'); return;\n    }")
PAGE = sub(PAGE, "else if (f === 'detail') { tab('home'); go('detail', { id: 'p1' }) }", "else if (f === 'detail') { tab('home'); go('detail', { id: 'p16' }) }")
PAGE = sub(PAGE, "else if (f === 'order') { tab('home'); go('detail', { id: 'p1' });", "else if (f === 'order') { tab('home'); go('detail', { id: 'p16' });")

MAIN = '\n'.join(out).replace('@@A@@', A_BLOCK + '\n' + RV_ACT.strip()).replace('@@PAGE@@', PAGE)
# 구매 이후: 산 옷을 '핏 기다리는 옷'으로 옷장에 넣지 않음. 배송 완료 → 구매 확정 → 옷장에 담을지 물어봄 (orders.js)
MAIN = re.sub(r"const p = PB\[it\.pid\], c = item\(\{.*?\}\);\n\s*S\.closet\.push\(c\); S\.orders\.unshift\(\{ pid: it\.pid, size: it\.size, cid: c\.id, delivered: false \}\);",
              "S.orders.unshift({ id: 'o' + (S.orders.length + 1), pid: it.pid, size: it.size, delivered: false, confirmed: false, cid: null });", MAIN, count=1, flags=re.S)
assert "id: 'o' + (S.orders.length + 1), pid: it.pid" in MAIN
for a, b in [('<h4>배송 오면 핏 알려 드릴게요</h4><p>입어 본 느낌을 알려 주면 다음 추천이 더 정확해져요. 알림을 켜 둘까요?</p>', '<h4>배송 오면 알려 드릴게요</h4><p>배송이 완료되면 입어 보고 구매 확정할 수 있게 알려 드려요. 알림을 켜 둘까요?</p>'),
             ("  const todo = S.closet.filter((c) => c.fit === null && c.delivered).length;\n", ''),
             ("${s === 'closet' && todo ? `<span class=\"dot\">${todo}</span>` : ''}", ''),
             ("  const todo = S.closet.filter((c) => c.fit === null && c.delivered);\n", ''),
             (': tabRec(base, todo, mine);', ': tabRec(base, null, mine);'),
             (", wait = mine.filter((c) => c.fit === null);", ';'),
             ("    ${wait.length ? `<div class=\"sec\"><h3>핏 기다리는 옷<small>${wait.length}</small></h3><span>입어 보고 알려 주세요</span></div>${rack('wait', wait, () => '핏 기다림')}` : ''}\n", ''),
             ("${c.fit === 'good' ? '' : '<span class=\"chipg\">핏 기다림</span>'}", ''),
             ("bar: c.fit === 'good' ? `<button class=\"btn line\" data-a=\"editItem\" data-x=\"${c.id}\">정보 수정</button>` : `<button class=\"btn line\" style=\"flex:.7\" data-a=\"editItem\" data-x=\"${c.id}\">정보 수정</button><button class=\"btn\" data-a=\"fitStart\" data-x=\"${c.id}\">핏 알려 주기</button>`",
              "bar: `<button class=\"btn line\" data-a=\"editItem\" data-x=\"${c.id}\">정보 수정</button>`")]:
    MAIN = sub(MAIN, a, b)
MAIN = re.sub(r"  \$\{todo\.length \? `<button data-a=\"fitStart\".*?</button>` : ''\}", '  ${dlvCard()}', MAIN, count=1)
MAIN = re.sub(r"  if \(d === 'deliver'\) \{.*?render\(\); return;\n  \}\n", "  if (d === 'deliver') { demoDeliver(); return }\n", MAIN, count=1, flags=re.S)
MAIN = re.sub(r"  if \(k === 'wait'\) \{.*?\n", '', MAIN, count=1)
assert 'dlvCard()' in MAIN and 'demoDeliver()' in MAIN and "k === 'wait'" not in MAIN
MAIN = MAIN.replace(RV_ACT.strip(), RV_ACT.strip() + '\n' + (ROOT / 'orders.js').read_text().rstrip(), 1)
# DANGJANG 로그인 · 홈 디자인 (dj.js): 로고 · 스플래시 · 로그인 버튼 · 홈 헤더 · 탭 · 추천 섹션 · 맨 위로
MAIN = MAIN.replace(RV_ACT.strip(), RV_ACT.strip() + '\n' + (ROOT / 'dj.js').read_text().rstrip(), 1)
for a, b in [('<div style="position:absolute;inset:0;background:#FFFFFF;display:flex;align-items:center;justify-content:center" data-a="splashGo"><span class="wm" style="font-size:44px;line-height:1">Layr</span></div>',
              '<div style="position:absolute;inset:0;background:var(--g);display:flex;align-items:center;justify-content:center" data-a="splashGo">${LOGO(\'#FFFFFF\', 224)}</div>'),
             ('<div class="hdr"><span class="wm" style="font-size:22px">Layr</span><span class="icons"><button data-a="go" data-x="notis"',
              '<div class="hdr"><span>${LOGO()}</span><span class="icons"><button class="hsrch" data-a="findGo" aria-label="검색">${I.search}</button><button data-a="go" data-x="notis"'),
             ('<span>브랜드, 상품을 검색해 보세요</span>${I.search}</button></div>\n  <div class="tabs">', '<span>SALOMON FW 신상 발매</span>${I.search}</button></div>\n  <div class="tabs htabs">'),
             ("tabEvt() : tabRec(base, null, mine);\n  return { node, navOn: 'home', body:", "tabEvt() : tabRec(base, null, mine);\n  return { node, navOn: 'home', fab: `<button class=\"totop\" data-a=\"toTop\" aria-label=\"맨 위로\">${ICO_UP}</button>`, body:"),
             ('line-height:1.15;margin-top:6px">26 FW<br>SEASON OPEN</div></div>\n    <div class="num hpg">1 / 5</div></button>', 'line-height:1.15;margin-top:6px">MEA 26 FW<br>SEASON OPEN</div></div></button>'),
             ("['closet', 'hanger', '내 옷장']", "['closet', 'hanger', '내옷장']"),
             ('<button class="btn" style="background:#FEE500;color:rgba(0,0,0,.85)" data-a="social" data-x="kakao">카카오로 계속하기</button>\n    <button class="btn" style="background:#03C75A;color:#FFFFFF" data-a="social" data-x="naver">네이버로 계속하기</button><button class="btn" style="background:#000000;color:#FFFFFF" data-a="social" data-x="apple">Apple로 계속하기</button>',
              '<button class="btn sns" style="background:#F0F0F0;color:#121212" data-a="social" data-x="google">Google로 계속하기</button>\n    <button class="btn sns" style="background:#FFE766;color:#121212" data-a="social" data-x="kakao">카카오로 계속하기</button><button class="btn sns" style="background:#47D159;color:#FFFFFF" data-a="social" data-x="naver">네이버로 계속하기</button>'),
             ('naver: false, apple: false }', 'naver: false, google: false }')]:
    MAIN = sub(MAIN, a, b, count=0)
MAIN = MAIN.replace("const b = view.querySelector('.body'); if (b) b.scrollTop = y;", "const b = view.querySelector('.body'); if (b) b.scrollTop = y; view.classList.toggle('scrolled', y > 120);", 1)
assert "view.classList.toggle('scrolled'" in MAIN
EXTRA = [s for s in scripts(SRC['r']) if 'const SCR' not in s]  # 측정 엔진 · 사진 촬영 모듈 (그대로)


def brand(t):  # 서비스 이름: 나란 → Layr → DANGJANG (2026-10-26)
    t = t.replace('나란', 'DANGJANG').replace('Layr', 'DANGJANG')
    t = t.replace('<span class="ai">naran</span>', '<span class="ai">DANGJANG</span>')
    t = t.replace("host: 'naran.shop'", "host: 'dangjang.shop'")
    return t


MAIN = brand(MAIN)
EXTRA = [brand(s) for s in EXTRA]
EXTRA = [sub(sub(sub(s, "const parts = PARTS[st.cat], m =", "const pk = (st.merge && S.reg && S.reg.pk) || st.cat, parts = PARTS[pk], m ="),
                 "if (m.some((v) => !v)) { mToast('빈 치수를 채워 주세요'); return; }", "if (NEED[pk].some((k) => !m[parts.indexOf(k)])) { mToast(`${NEED[pk].map((k) => LONG[k] || k).join(' · ')}은 꼭 재 주세요`); return; }"),
             "const it = item({ img: t.toDataURL('image/png'), name: st.name, cat: st.cat,", "const it = item({ img: t.toDataURL('image/png'), name: st.name, cat: st.cat, g: true,")
         if "const parts = PARTS[st.cat], m =" in s else s for s in EXTRA]
# 아티팩트에서는 글자 인식 · AI 모델 파일 다운로드가 막혀 끝없이 기다림 → 서버 없는 환경(API.on=false)에서는 15초 뒤 포기하고 직접 입력 화면으로
OCR_TO = "const ocrRace = (p) => API.on ? p : Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('ocr timeout')), 15000))]);\n"
EXTRA = [sub(s, 'let OCRE = null;', OCR_TO + 'let OCRE = null;') if 'let OCRE = null;' in s else s for s in EXTRA]
EXTRA = [sub(s, 'const r = await ocrLines(textC);', 'const r = await ocrRace(ocrLines(textC));') if 'await ocrLines(textC)' in s else s for s in EXTRA]
EXTRA = [sub(s, 'pb.size = await sizeRetry(r.pc, ol).catch(() => null);', 'pb.size = await ocrRace(sizeRetry(r.pc, ol)).catch(() => null);') if 'sizeRetry(r.pc, ol)' in s else s for s in EXTRA]
EXTRA = [sub(s, 'setTimeout(() => ok(null), 60000)', 'setTimeout(() => ok(null), API.on ? 60000 : 15000)') if 'ok(null), 60000' in s else s for s in EXTRA]
assert sum('ocrRace(ocrLines' in s for s in EXTRA) == 1
EXTRA = [sub(s, '<br>${cp.reason}. 자른 사진 그대로 쓸게요', "<br>${cp.reason ? cp.reason + '. ' : ''}자른 사진 그대로 쓸게요") if '${cp.reason}. 자른' in s else s for s in EXTRA]  # 이유가 없을 때 'undefined.'가 보이던 문제


# ── CSS ──
def css_rules(t):
    out = []
    for m in re.finditer(r'<style>(.*?)</style>', t, re.S):
        s = re.sub(r'/\*.*?\*/', '', m.group(1), flags=re.S)
        depth, start = 0, 0
        for i, ch in enumerate(s):
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    out.append(s[start:i + 1].strip())
                    start = i + 1
    return out


def sel(r):
    return re.sub(r'\s+', ' ', r[:r.index('{')].strip())


def app_css(t):  # 원본 앞에 붙은 아티팩트 런타임 · 기본 리셋은 빼고 앱 스타일만
    rules = [r for r in css_rules(t[t.index('<title>'):]) if not r.startswith('@font-face')]
    if t is SRC['h']:  # 홈의 순위 배지 .rk 는 옷장 선반 .rk 와 이름이 겹쳐 .rnk 로
        rules = [re.sub(r'\.rk(?![\w-])', '.rnk', r) for r in rules]
    return rules


D_CSS = app_css(SRC['d'])
V2CSS = {'.pd-guide { display:block; width:100%; border-radius:12px }':
         '.pd-guide { position:relative; display:flex; justify-content:center; padding:38px 0 12px; background:#F7F7F5; border-radius:12px } .pd-guide > span { position:absolute; left:14px; top:12px; font-size:12px; font-weight:500; color:var(--mut) }',
         '.hit { position:relative }': ':where(.hit) { position:relative }'}
for a, b in V2CSS.items():
    assert a in D_CSS, a
    D_CSS[D_CSS.index(a)] = b
FONTS = [r for r in css_rules(SRC['d'][SRC['d'].index('<title>'):]) if r.startswith('@font-face') and 'Pretendard' in r]
seen = {sel(r) for r in D_CSS}
EXTRA_CSS = []
for k in 'crh':
    own = {}
    for r in app_css(SRC[k]):
        s = sel(r)
        own[s] = own.get(s, 0) + 1
        if k == 'r' and own[s] >= 2:  # 등록 버전이 같은 선택자를 다시 정의한 것(옷 종류 · 사이즈 고르기의 .seg 등)은 등록 버전 의도대로
            EXTRA_CSS.append(r)
            continue
        if s in seen:
            continue
        if k == 'h' and ('[data-a="detail"]' in s or '.dead' in s):
            continue
        seen.add(s)
        EXTRA_CSS.append(r)
# 홈 버전이 상세 디자인에 맞춰 덮어쓴 공통 스타일(두 번째로 나오는 같은 선택자) 가져오기
H = app_css(SRC['h'])
cnt = {}
for r in H:
    s = sel(r)
    cnt[s] = cnt.get(s, 0) + 1
    if cnt[s] >= 2 and s not in (':root', '[data-a="detail"], [data-a="go"], [data-a="item"], [data-a="fitStart"], .nav button:not(.on), .sec button'):
        EXTRA_CSS.append(r)
CSS_TXT = '\n'.join(FONTS + D_CSS + EXTRA_CSS)

TOKENS = """
/* ── 통합: 상세 페이지(디자이너 시안) 토큰을 모든 화면의 기준으로 ── */
:root { --pgAcc:#06BC51 }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --pgAcc:#4CD787 } }
:root[data-theme="dark"] { --pgAcc:#4CD787 }
#app { --ink:#121212; --gray:#F6F6F6; --mut:#979797; --ln:#E1E1E1; --g:#06BC51; --gw:#F1FEF5; --fit:#06BC51; --fitw:#F1FEF5; --sale:#F2382B; --ok:#14804A; color:#121212; letter-spacing:-.03em }
.wm, .push .ai, #demo h1 i { font-family:Pretendard,"Apple SD Gothic Neo",system-ui,sans-serif; font-weight:800; letter-spacing:-.02em }
#demo h1 i { font-size:22px }
#phone { position:relative }
.btn { background:var(--g) } /* 주 버튼은 상세 시안처럼 초록 (보조 버튼은 .btn.line) */
/* 홈 · 옷장 기준 랭킹 상품: 비교할 기준 옷 드롭다운 */
.simdd { position:relative; margin:12px 20px 0; z-index:12 }
.simbox { display:flex; align-items:center; gap:10px; width:100%; height:52px; padding:0 14px 0 10px; border:1px solid var(--ln); border-radius:12px; background:#fff; text-align:left }
.simdd.open .simbox { border-color:#121212 } .simarr { margin-left:auto; display:flex; color:#121212; transition:transform .15s } .simdd.open .simarr { transform:rotate(180deg) }
.simpic { width:32px; height:32px; border-radius:8px; overflow:hidden; flex:none; background:#F1F0EE; display:flex; align-items:center; justify-content:center }
.simpic img { width:100%; height:100%; object-fit:contain } .simpic svg.tpl { width:100%; height:100%; padding:3px } .simpic .rkno { display:flex; color:#B5B5B5 }
.simtx { display:grid; gap:2px; min-width:0; line-height:1.25 } .simtx b { font-size:14px; font-weight:600; color:#121212; white-space:nowrap; overflow:hidden; text-overflow:ellipsis } .simtx small { font-size:12px; color:var(--mut) }
.simlist { position:absolute; left:0; right:0; top:calc(100% + 4px); background:#fff; border:1px solid var(--ln); border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,.12); overflow:hidden; padding:4px 0 }
.simopt { display:flex; align-items:center; gap:10px; width:100%; height:56px; padding:0 14px 0 10px; text-align:left }
.simopt:hover { background:#F6F6F6 } .simopt.on { background:var(--gw) } .simopt.on .simtx b { color:var(--g); font-weight:700 }
.simchk { margin-left:auto; display:flex; color:var(--g) } .simchk .ic { width:20px!important; height:20px!important }
.simdd + .hscroll { margin-top:12px }
.simnone { margin:12px 20px 0; padding:18px 16px; border-radius:12px; background:#F6F6F6; text-align:center; font-size:13.5px; color:var(--mut); line-height:1.5 }
.pd-bimg img { object-fit:contain } .pd-bimg svg.tpl { width:100%; height:100%; padding:4px } .pd-bimg .rkno { display:flex; width:100%; height:100%; align-items:center; justify-content:center; color:#B5B5B5 }
"""
CSS_TXT += TOKENS + (ROOT / 'reviews.css').read_text() + (ROOT / 'dj.css').read_text()
TEST_CSS = '''
/* 유저테스트 모드 (testmode.js) */
body.testmode #demo, body.testmode #demoToggle { display:none !important }
@media (max-width:760px) { body.testmode #phoneWrap { height:100dvh } }
body.testmode.nocmp .pd-tg, body.testmode.nocmp .pd-hchip { display:none !important }
#testLinks { display:grid; gap:10px }
.tcode { display:block; width:100%; margin-top:14px; height:48px; border:1px solid var(--ln); border-radius:10px; text-align:center; font:700 17px ui-monospace,Menlo,monospace; letter-spacing:.02em; color:#121212; background:#F6F6F6 }
#testLinks .tl { display:grid; gap:4px; font-size:12.5px }
#testLinks .tlr { display:flex; gap:4px }
#testLinks input { flex:1; min-width:0; height:30px; padding:0 8px; border:1px solid var(--pgLine); border-radius:7px; background:transparent; color:var(--pgInk); font:12px ui-monospace,Menlo,monospace }
#testLinks button { flex:none; height:30px; padding:0 9px; border:1px solid var(--pgLine); border-radius:7px; font-size:12px; font-weight:600 }
'''
if TEST_BUILD:
    CSS_TXT += TEST_CSS

# ── 데모 패널 ──
SHELL_TEST_BOX = '    <div class="box"><b>유저테스트 링크</b><p class="note" style="margin-bottom:8px">아티팩트 주소 뒤에 붙여 Maze 과제 링크로 써요. 데모 패널이 숨겨지고 그 화면에서 시작해요. 미리 보기 뒤에 데모로 돌아오려면 새로고침</p><div id="testLinks"></div></div>'
SHELL_PERSONA = '\n      <button data-d="p:persona" class="wide">유저테스트 가상 인물 · 하늘</button>'
SHELL = """<div id="page">
  <button id="demoToggle" data-d="toggle"><span>데모 설정 · <span id="nowShort">홈</span></span><span>▾</span></button>
  <aside id="demo">
    <h1><i>DANGJANG</i> 데모</h1>
    <p class="lead">팀 프로토타입 4개(홈 · 상품 상세 · 옷장 등록 · 내 옷장)를 하나로 이은 시연용 앱이에요. 화면을 직접 눌러 보고, 아래에서 사용자 상태를 바꿔 갈림길을 확인해요</p>
    <div class="box"><b>지금 위치 · 흐름도</b><div class="now" id="now">-</div></div>
    <div class="box"><b>사용자 상태</b><div class="btns" id="presets">
      <button data-d="p:guest">비회원</button><button data-d="p:nobase">회원 · 기준 옷 없음</button>
      <button data-d="p:full">회원 · 기준 옷 있음</button><button data-d="p:many">회원 · 옷 많음</button>@@PERSONA_BTN@@
    </div></div>
    <div class="box"><b>상황 만들기</b><div class="btns">
      <button data-d="deliver" class="wide">주문한 옷 배송 완료 보내기</button>
      <button data-d="failpay" id="failBtn">다음 결제 실패</button><button data-d="popup">오늘 팝업 다시</button>
      <button data-d="x:nophoto" class="wide">사진 없는 옷 추가</button>
      <button data-d="restart" class="wide">처음부터 (앱 열기)</button>
    </div></div>
    <div class="box"><b>흐름 바로가기</b><div class="flows">
      <button data-d="f:home">① 홈</button><button data-d="f:detail">② 상품 상세</button><button data-d="f:order">③ 구매</button>
      <button data-d="f:reg">④ 옷 등록</button><button data-d="f:photo">④ 사진 촬영 등록</button><button data-d="f:closet">⑤ 내 옷장</button><button data-d="f:my">⑥ 마이</button><button data-d="f:login">⑦ 로그인</button>
    </div></div>
    <div class="box"><b>내 옷장 바로가기</b><div class="flows">
      <button data-d="c:item">옷 상세 정보</button><button data-d="c:baseChange">기준 옷 바꾸기</button><button data-d="c:sub">세부 종류 기준</button>
      <button data-d="c:edit">정보 수정</button><button data-d="c:editCat">종류 바꾸기</button><button data-d="c:photo">사진 추가</button><button data-d="c:del">기준 옷 삭제</button>
    </div></div>
@@TEST_BOX@@
    <p class="note">상품 사진은 AI 생성 이미지, 브랜드명 · 가격 · 치수는 예시예요. 결제 · 로그인은 흉내만 내요. 사진 촬영 등록은 앨범 사진으로 실제 측정이 돌아가요. 무신사 링크 · 구매내역 캡처 읽기는 이 데모의 서버(/api)로 실제로 돌아가요. 서버가 없는 곳(아티팩트)에서 열면 예시 값으로 채워져요</p>
  </aside>
  <div id="phoneWrap"><div id="phone"><div id="app"></div></div></div>
</div>"""
SHELL = SHELL.replace('@@PERSONA_BTN@@', SHELL_PERSONA if TEST_BUILD else '').replace('@@TEST_BOX@@', SHELL_TEST_BOX if TEST_BUILD else '')

HTML = ('<title>DANGJANG 통합 데모</title>\n<style>\n' + CSS_TXT + '\n</style>\n\n' + SHELL + '\n\n<script>\n' + MAIN + '\n</script>\n' +
        ''.join('<script>' + s + '</script>\n' for s in EXTRA))
OUT = 'layr-test' if TEST_BUILD else 'layr'
(ROOT / f'{OUT}.html').write_text(HTML)
print(f'{OUT}.html  {len(HTML.encode()) / 1e6:.2f} MB · 이미지 {len(IMGS)}장 · 동작 {len(A_SRC)}개')

# 웹 배포용: 아티팩트가 게시할 때 씌우는 기본 틀을 흉내 냄
SKEL = ('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<style>:root{color-scheme:light;box-sizing:border-box}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}'
        'img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n')
(ROOT / 'public').mkdir(exist_ok=True)  # Vercel이 올리는 폴더 (vercel.json)
(ROOT / 'public' / ('test.html' if TEST_BUILD else 'index.html')).write_text(SKEL + HTML + '</body></html>')
