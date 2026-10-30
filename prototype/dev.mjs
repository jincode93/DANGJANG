// 배포 전 로컬 확인용: public/ 정적 파일 + api/*.js (Vercel 과 같은 구조). Vercel 로그인 없이 돌아감
// 사용: node dev.mjs [포트]   → http://127.0.0.1:8792
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.dirname(fileURLToPath(import.meta.url)), PUB = path.join(ROOT, 'public');
const port = +process.argv[2] || +process.env.PORT || 8792;
try { process.loadEnvFile(path.join(ROOT, '.env.local')); } catch { } // 사진 저장소(Blob) 인증: vercel env pull .env.local 로 받음
// vercel.json 빌드와 같게: 디자인 시스템(토큰 · 글꼴)을 public/design-system으로 복사
fs.rmSync(path.join(PUB, 'design-system'), { recursive: true, force: true }); fs.cpSync(path.join(ROOT, '..', 'design-system'), path.join(PUB, 'design-system'), { recursive: true });
// vercel.json 과 같은 헤더 (카메라 허용 + 교차 출처 격리: AI 옷 분할이 여러 코어를 씀)
const HEAD = { 'permissions-policy': 'camera=(self)', 'cross-origin-opener-policy': 'same-origin', 'cross-origin-embedder-policy': 'credentialless' };
const TYPE = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.css': 'text/css' };
http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://127.0.0.1:${port}`);
  try {
    if (u.pathname.startsWith('/api/')) {
      const name = u.pathname.slice(5).replace(/\/$/, '');
      const f = path.join(ROOT, 'api', name + '.js');
      if (!/^[a-z0-9-]+$/i.test(name) || !fs.existsSync(f)) { res.writeHead(404); return res.end('{}'); }
      const mod = await import(pathToFileURL(f).href);
      const r = await mod.GET(new Request(u.href, { headers: { 'x-forwarded-for': req.socket.remoteAddress || 'local' } }));
      res.writeHead(r.status, Object.fromEntries(r.headers)); return res.end(Buffer.from(await r.arrayBuffer()));
    }
    const f = path.join(PUB, u.pathname === '/' ? 'index.html' : decodeURIComponent(u.pathname));
    if (!f.startsWith(PUB) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'content-type': TYPE[path.extname(f)] || 'application/octet-stream', ...HEAD }); res.end(fs.readFileSync(f));
  } catch (e) { res.writeHead(500); res.end(String(e)); }
}).listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}`));
