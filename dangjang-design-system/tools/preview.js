// 모든 컴포넌트 미리보기를 라이트·다크로 한 장씩 찍는다. 먼저 python3 tools/tokens_css.py 실행.
// 사용: node tools/preview.js  → tools/light.png, tools/dark.png
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const P=path.join(__dirname,'../design-system/project/components/');
const css=fs.readFileSync(path.join(__dirname,'tokens.css'),'utf8')+fs.readFileSync(P+'bundle.css','utf8').split('\n').slice(1).join('\n'); // 첫 줄 Google Fonts @import 제외
(async()=>{const b=await chromium.launch();
for(const th of ['light','dark']){let html=`<html data-theme="${th}"><head><style>${css}section{border-bottom:4px dashed #f0f;width:960px;overflow:hidden}</style></head><body>`;
for(const c of fs.readdirSync(P).filter(f=>!f.includes('.'))){const s=fs.readFileSync(P+c+'/preview.html','utf8');const st=(s.match(/<style>([\s\S]*?)<\/style>/)||['',''])[1];html+='<section><style>'+st.replace(/html,body\{[^}]*\}/,'')+'</style>'+s.match(/<body>([\s\S]*)<\/body>/)[1]+'</section>';}
const pg=await b.newPage({viewport:{width:960,height:800}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await pg.setContent(html+'</body></html>');await pg.screenshot({path:path.join(__dirname,th+'.png'),fullPage:true});console.log(th,errs.length?errs:'오류 없음');}
await b.close();})();
