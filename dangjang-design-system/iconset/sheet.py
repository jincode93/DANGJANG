import sys,collections
sys.path.insert(0,'.')
from icons import ICONS
from lib import svg
names=[n for n,*_ in ICONS]; dup=[n for n,c in collections.Counter(names).items() if c>1]
print(len(ICONS),"dups",dup, collections.Counter(g for _,_,g,_ in ICONS))
cells="".join(f'<div class=c><div>{svg(e,False,uid=n+"l",size=36)}{svg(e,True,uid=n+"f",size=36)}</div><span>{n}</span></div>' for n,k,g,e in ICONS)
open("sheet.html","w").write(f'<html><body style="margin:12px;font:10px sans-serif;color:#121212"><style>.c{{display:inline-flex;flex-direction:column;align-items:center;width:104px;height:66px}}.c div{{display:flex;gap:6px}}</style>{cells}</body></html>')
