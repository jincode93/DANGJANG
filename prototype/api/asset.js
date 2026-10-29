// 데모 자체 사진(예시 상품 · 옷 누끼 · 촬영 견본)을 private Blob 저장소에서 꺼내 보여 줌. 사용: /api/asset?name=img/hero.jpg
// 저장소 인증은 Vercel이 자동으로 함(OIDC). 데모 화면에 공개되는 사진이라 CDN에 캐시해도 됨
import { get } from '@vercel/blob';
export async function GET(request) {
  const name = new URL(request.url).searchParams.get('name') || '';
  if (!/^(img|cut|sample)\/[a-z0-9_]+\.(jpg|png)$/i.test(name)) return new Response('bad name', { status: 400 });
  const r = await get(name, { access: 'private' }).catch(() => null);
  if (!r || r.statusCode !== 200) return new Response('not found', { status: 404 });
  return new Response(r.stream, { headers: { 'content-type': r.blob.contentType, 'cache-control': 'public, max-age=86400, s-maxage=604800', 'x-content-type-options': 'nosniff' } });
}
