"""tokens.json → tokens.css. 디자인 시스템을 가져올 때마다 다시 돌린다. tokens.css는 손으로 고치지 않는다.
실행: python3 design-system/build_tokens.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent
T = json.loads((ROOT / 'tokens.json').read_text())


def val(v):
    return re.sub(r'\{([\w-]+)\}', r'var(--\1)', v)  # "{white-00}" → var(--white-00)


light, dark = [], []
for group in ('color', 'spacing', 'radius', 'shadow', 'size'):
    for t in T[group]['tokens']:
        v = t['value']
        if isinstance(v, dict):
            light.append(f"  --{t['name']}: {val(v['light'])};")
            if v['dark'] != v['light']:
                dark.append(f"  --{t['name']}: {val(v['dark'])};")
        else:
            light.append(f"  --{t['name']}: {val(v)};")
for k, v in T['type']['families'].items():
    light.append(f'  --font-{k}: {v};')
for g in T['type']['groups']:  # 글자 스타일: font: var(--font-body) 처럼 씀
    for s in g['styles']:
        light.append(f"  --font-{s['name']}: {s['fontWeight']} {s['fontSize']}/{s['lineHeight']} var(--font-{g['family']});")

faces = [f"@font-face {{ font-family: \"{f['family']}\"; src: url(\"{f['file']}\") format(\"woff2\"); font-weight: {f['weight']}; font-style: {f['style']}; font-display: swap; }}"
         for f in T['type']['fonts']]
css = ('/* tokens.json에서 만든 파일 (build_tokens.py). 손으로 고치지 않는다. 다크 테마는 <html data-theme="dark">일 때만 */\n'
       + '\n'.join(faces) + '\n:root {\n' + '\n'.join(light) + '\n}\n[data-theme="dark"] {\n' + '\n'.join(dark) + '\n}\n')
(ROOT / 'tokens.css').write_text(css)

# 확인: 컴포넌트가 쓰는 변수가 모두 정의돼 있다
defined = set(re.findall(r'--([\w-]+):', css))
used = set(re.findall(r'var\(--([\w-]+)', (ROOT / 'components' / 'bundle.css').read_text()))
assert used <= defined, f'tokens.css에 없는 변수: {sorted(used - defined)}'
print(f'tokens.css  변수 {len(defined)}개 · 다크 {len(dark)}개 · bundle.css가 쓰는 {len(used)}개 모두 있음')
