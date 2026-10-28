"""tokens.json → tokens.css (로컬 미리보기 전용 근사본. 실제 tokens.css는 디자인 시스템 페이지가 만든다)."""
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
t = json.load(open(os.path.join(HERE, "../design-system/project/tokens.json")))
v = lambda x: re.sub(r"\{([^}]+)\}", r"var(--\1)", x)
L, D = [], []
for k in t["color"]["tokens"] + t["shadow"]["tokens"]:
    val = k["value"]
    if isinstance(val, str): L.append(f"--{k['name']}:{v(val)}")
    else: L.append(f"--{k['name']}:{v(val['light'])}"); D.append(f"--{k['name']}:{v(val['dark'])}")
R = [f"--{k['name']}:{k['value']}" for f in ("spacing", "radius", "size") for k in t[f]["tokens"]]
R.append("--font-sans:" + t["type"]["families"]["sans"])
open(os.path.join(HERE, "tokens.css"), "w").write(
    ":root,[data-theme=light]{" + ";".join(L) + "}[data-theme=dark]{" + ";".join(D) + "}:root{" + ";".join(R) + "}")
print("tokens.css written")
