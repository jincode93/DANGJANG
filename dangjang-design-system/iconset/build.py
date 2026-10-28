import sys,os,json,re
HERE=os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
sys.path.insert(0,HERE)
from icons import ICONS
from lib import svg, body
DS="../design-system/project/"
os.makedirs("out",exist_ok=True)
for f in os.listdir("out"): os.remove("out/"+f)
for n,k,g,e in ICONS:
    open(f"out/{n}.svg","w").write(svg(e,False,"#777777",uid=n))
    open(f"out/{n}-fill.svg","w").write(svg(e,True,"#777777",uid=n+"-fill"))
# preview data
data=[[n,k,g,body(e,False,uid=n+"-l"),body(e,True,uid=n+"-f")] for n,k,g,e in ICONS]
js=json.dumps(data,ensure_ascii=False,separators=(",",":")).replace("</","<\\/")
groups=list(dict.fromkeys(g for _,_,g,_ in ICONS))
html=f'''<!-- @dsCard group="Foundations" height=1400 -->
<!doctype html>
<html lang="ko"><head><meta charset="utf-8"></head><body>
<div class="dj-stack">
  <div class="dj-icon-tools">
    <div class="dj-field" style="flex:1;min-width:0"><div class="dj-input"><svg class="dj-icon dj-icon--md" viewBox="0 0 24 24" aria-hidden="true">{body(dict((n,e) for n,_,_,e in ICONS)["search"],False)}</svg><input id="icon-q" type="search" placeholder="이름으로 찾기 (예: 찜, heart)" aria-label="아이콘 찾기"></div></div>
    <div class="dj-row" role="group" aria-label="굵기">
      <button class="dj-chip" id="v-line" aria-pressed="true">Line</button>
      <button class="dj-chip" id="v-fill" aria-pressed="false">Fill</button>
    </div>
  </div>
  <p class="dj-icon-count" id="icon-count"></p>
  <div id="icon-list"></div>
</div>
<script>
const ICONS={js};
const GROUPS={json.dumps(groups,ensure_ascii=False)};
let fill=false;
const list=document.getElementById('icon-list'),q=document.getElementById('icon-q'),count=document.getElementById('icon-count');
function render(){{
  const t=q.value.trim().toLowerCase();let shown=0;
  list.innerHTML=GROUPS.map(g=>{{
    const items=ICONS.filter(i=>i[2]===g&&(!t||i[0].includes(t)||i[1].includes(t)));
    shown+=items.length;
    if(!items.length)return'';
    return '<p class="dj-icongroup">'+g+' <span>'+items.length+'</span></p><div class="dj-icongrid">'+items.map(i=>'<figure><svg class="dj-icon" viewBox="0 0 24 24" aria-hidden="true">'+(fill?i[4]:i[3])+'</svg><figcaption>'+i[1]+'<code>'+i[0]+(fill?'-fill':'')+'</code></figcaption></figure>').join('')+'</div>';
  }}).join('');
  count.textContent=(t?'찾은 아이콘 ':'전체 ')+shown+'종 · '+(fill?'Fill':'Line');
}}
function setV(f){{fill=f;document.getElementById('v-line').setAttribute('aria-pressed',!f);document.getElementById('v-fill').setAttribute('aria-pressed',f);render();}}
document.getElementById('v-line').onclick=()=>setV(false);
document.getElementById('v-fill').onclick=()=>setV(true);
q.oninput=render;render();
</script>
</body></html>
'''
open(DS+"components/Icon/preview.html","w").write(html)
print("preview bytes",len(html.encode()))
# tab bar / fit result / reference cloth
E={n:e for n,_,_,e in ICONS}
ic=lambda n,f=False,cls="dj-icon":f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true">{body(E[n],f,uid=n+("-f" if f else "-l")+cls[-2:])}</svg>'
tb='<nav class="dj-tabbar" aria-label="주 메뉴">'+"".join(f'<button class="dj-tab"{" aria-current=\"page\"" if cur else ""}>{ic(n,cur)}{l}</button>' for n,l,cur in [("home","홈",1),("search","검색",0),("closet","옷장",0),("user","마이",0)])+'</nav>'
open(DS+"components/TabBar/preview.html","w").write(f'<!-- @dsCard group="Navigation" height=80 -->\n<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"></head><body>\n{tb}\n</body></html>\n')
rc=open(DS+"components/ReferenceCloth/preview.html").read()
rc=re.sub(r'<svg class="dj-icon"[\s\S]*?</svg>',ic("shirt"),rc,count=1)
open(DS+"components/ReferenceCloth/preview.html","w").write(rc)
print(len(os.listdir("out")))
