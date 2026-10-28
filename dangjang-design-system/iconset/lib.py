"""당장 아이콘 렌더러.

요소 종류
  S  닫힌 모양: Line에선 선, Fill에선 채움
  L  선: 두 변형 모두 선
  K  안쪽 디테일 선: Line에선 선, Fill에선 채움을 파낸다
  D  점: 두 변형 모두 채운 점
  KD 안쪽 점: Line에선 점, Fill에선 파낸다
"""
SW = 1.8


def S(d): return ("S", f'<path d="{d}"/>')
def L(d): return ("L", f'<path d="{d}"/>')
def K(d): return ("K", f'<path d="{d}"/>')
def C(cx, cy, r): return ("S", f'<circle cx="{cx}" cy="{cy}" r="{r}"/>')
def LC(cx, cy, r): return ("L", f'<circle cx="{cx}" cy="{cy}" r="{r}"/>')
def KC(cx, cy, r): return ("K", f'<circle cx="{cx}" cy="{cy}" r="{r}"/>')
def R(x, y, w, h, rx=2): return ("S", f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}"/>')
def LR(x, y, w, h, rx=2): return ("L", f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}"/>')
def KR(x, y, w, h, rx=1): return ("K", f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}"/>')
def D(cx, cy, r=1.1): return ("D", f'<circle cx="{cx}" cy="{cy}" r="{r}"/>')
def KD(cx, cy, r=1.1): return ("KD", f'<circle cx="{cx}" cy="{cy}" r="{r}"/>')


def _ink(frag, attrs):
    return frag.replace("/>", f" {attrs}/>", 1)


def body(elems, fill, ink="currentColor", uid="i"):
    """Inner SVG markup. Root carries stroke=ink, width SW, round caps/joins, fill none."""
    has_shape = any(k == "S" for k, _ in elems)
    if not fill or not has_shape:
        out = []
        for k, f in elems:
            out.append(_ink(f, f'fill="{ink}" stroke="none"') if k in ("D", "KD") else _ink(f, f'fill="{ink}"') if k == "F" else f)
        return "".join(out)
    knock = [(k, f) for k, f in elems if k in ("K", "KD")]
    shapes = "".join(_ink(f, f'fill="{ink}"') for k, f in elems if k == "S")
    rest = "".join(
        _ink(f, f'fill="{ink}" stroke="none"') if k == "D" else _ink(f, f'fill="{ink}"') if k == "F" else f
        for k, f in elems if k in ("L", "D", "F"))
    if not knock:
        return shapes + rest
    m = f"{uid}-m"
    mask = (f'<mask id="{m}" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">'
            f'<rect width="24" height="24" fill="#fff" stroke="none"/>'
            + "".join(_ink(f, 'fill="#000" stroke="none"') if k == "KD" else _ink(f, 'stroke="#000"') for k, f in knock)
            + "</mask>")
    return f'{mask}<g mask="url(#{m})">{shapes}</g>{rest}'


def svg(elems, fill, ink="currentColor", uid="i", size=24):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" '
            f'fill="none" stroke="{ink}" stroke-width="{SW}" stroke-linecap="round" stroke-linejoin="round">'
            f'{body(elems, fill, ink, uid)}</svg>')
