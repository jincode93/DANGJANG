# 프로토타입

## 통합 데모

- 주소: https://dangjang-prototype.vercel.app (`main`에 합치면 자동 배포, PR마다 미리보기 주소가 생김)
- 예전 아티팩트(https://claude.ai/artifact/Tky3xmqceQXmTaQdB9Byq4)는 v13에서 멈춤. 서버 기능이 없어 링크 읽기·캡처 찾기가 예시 값으로만 동작한다
- 원본은 `public/`의 화면 코드다. 디자이너가 디자인 시스템으로 고친 통합 데모(아티팩트 Rv7yjP93nyGWBqKCJ3Qp2X, 2026-10-29)를 파일로 나눠 들여왔다. 팀 프로토타입 4개를 합치던 `build.py`와 `src/`는 내렸다(git 기록에 남음).
- 화면은 `public/`을 PR로 직접 고친다. 디자이너도 아티팩트가 아니라 레포에서 고친다. 그래야 버전이 갈라지지 않는다.
- 서버(`api/`, `lib/`)는 옷장 등록 담당 팀원의 데모(Artemis-ignis/dangjang-demo, 2026-10-28 `fe2cb70`)에서 가져왔다. 우리 Vercel에서 돌아가고, 다른 사람의 서버나 계정에 기대지 않는다. 환경 변수와 API 키는 없다.
- 디자인은 `design-system/`을 따른다. 토큰과 글꼴은 `design-system/tokens.css`에서 오고(배포 때 `public/design-system/`으로 복사), `app.css`에서는 데모의 옛 변수 이름(`--g`, `--ink` 등)을 토큰에 잇기만 한다.

## 폴더

| 경로 | 내용 |
|---|---|
| `public/index.html` | 데모 패널과 폰 화면 틀 |
| `public/app.css` | 화면 스타일. 색·간격은 토큰(`var(--…)`)으로 |
| `public/app.js` | 화면과 동작 전부 (홈, 상품 상세, 구매, 옷장, 옷 등록, 마이) |
| `public/measure.js`, `module.js` | 사진 측정 엔진과 사진 촬영·캡처 등록 창 |
| `public/ms-images.js` | 무신사 상품 사진 주소 목록 (썸네일 229 · 상세 26 · 옷장 바닥컷 16) |
| `api/` | 서버 기능 5개. `ping` 서버 확인, `product` 상품 링크 읽기, `find` 구매내역 캡처로 상품 찾기, `img` 쇼핑몰 사진 중계, `asset` 데모 자체 사진 |
| `lib/` | 서버 공용 코드 (쇼핑몰 읽기, 상품 표준화·검사) |
| `test/` | `lib/catalog.js` 시험 |
| `dev.mjs` | 로컬 시험 서버 (화면 + 서버 기능) |
| `vercel.json` | 빌드 명령, 올릴 폴더(`public/`), 카메라·AI 옷 분할에 필요한 헤더 |

`public/design-system/`만 배포 때 만들어지고 레포에는 없다(`vercel.json` 빌드 명령, 로컬은 `dev.mjs`가 복사).

## 고치고 확인하기

```bash
cd prototype
npm install
npx vercel link --project dangjang-prototype   # 처음 한 번
npx vercel env pull .env.local                # 사진 저장소 인증. 레포에 안 올라감
node dev.mjs            # http://127.0.0.1:8792
node test/catalog.test.mjs
```

- 휴대폰 카메라 촬영은 https에서만 열리므로 실제 촬영은 배포 주소(PR 미리보기 포함)에서 확인한다.

## 신기능 (결정 전)

데모 오른쪽 "신기능" 패널에서 기능마다 `#이슈 번호 · 이름 · 토글`로 켜고 끈다. 기본은 꺼짐이고, 켠 상태는 주소 `?f=기능`에 남는다. 켜면 그 아래에 손으로 만들기 번거로운 상태를 바로 만드는 테스트 버튼이 열린다.

- 기능 하나 = `public/features/기능/feature.js`(+ `feature.css`) 폴더 하나 + `public/index.html`의 한 줄
- 쓰는 법은 `public/features.js` 맨 위 주석. 새 화면 · 새 동작 · 완료본이 열어 둔 자리(`closet.top`, `my.menu`, `reg.done`) · 테스트 버튼을 등록한다. 완료본에 있는 이름을 쓰면 멈춘다
- 끄면 입구가 사라지고, 그 기능 화면에 있었다면 홈으로 간다
- 기각되면 폴더와 `index.html`의 한 줄을 지운다. 채택되면 관리자가 정책으로 옮기고 완료본으로 흡수한다

## 사진

레포에는 사진 파일을 두지 않는다.

| 사진 | 어디에 | 화면이 받는 길 |
|---|---|---|
| 무신사 상품 사진 | 무신사 (`public/ms-images.js`에 주소만) | `/api/img?url=…` 중계 |
| 데모 자체 사진 43장: 예시 상품 · 코디북 배너(`img/`), 옷 누끼(`cut/`), 촬영 견본(`sample/`) | Vercel Blob private 저장소 `dangjang-prototype-blob` | `/api/asset?name=img/hero.jpg` |

데모 사진을 더하거나 바꿀 때: `npx vercel blob put 파일 --pathname img/이름.jpg --access private --force` 로 올리고, `public/app.js`의 `IMG0`·`CUT`·`SAMPLE`에 `/api/asset?name=…` 주소를 적는다. 저장소는 Development · Preview · Production 세 환경 모두에 연결되어 있어야 로컬에서도 읽고 올릴 수 있다.

## Vercel 설정 (처음 한 번)

Vercel → Add New → Project → `jincode93/DANGJANG` Import → Root Directory `prototype` → Framework Preset `Other` → 나머지는 비워 둠 → Deploy. 나온 주소 뒤에 `/api/ping`을 붙여 `{"ok":true,"v":1}`이 나오면 서버까지 정상이다. 이후 `main`에 합치면 자동 배포되고, PR마다 미리보기 주소가 생긴다.

## 주의할 점

- 무신사 상품 읽기·검색은 비공식 내부 주소를 쓴다. 데모·시연용이다. 요청을 몰아 보내면 잠시 막힌다 (IP당 1분: 읽기 40, 찾기 20, 사진 600).
- AI 옷 분할 모델(`Xenova/segformer_b2_clothes`)은 사용 허가가 분명하지 않다. 시연용으로만 쓴다.
- 옷장은 그 기기 브라우저에만 저장된다. 서버 저장은 없다.
- 옷 등록 동작은 팀원 데모의 2026-10-22 버전이다. 그 뒤에 바뀐 옷장 등록(사이즈표 사진으로 재기, 캡처 옵션 줄에서 사이즈 찾기, 치수 범위 검사 등)은 아직 반영하지 않았다.
- 상품 이름·브랜드·가격·사진은 무신사 랭킹 상품(2026-10-29)을 시연용으로 쓴다. 사진 파일은 레포에 두지 않는다. `public/ms-images.js`에 무신사 사진 주소만 두고, 화면은 우리 서버 `/api/img`가 무신사에서 받아 중계한다(Vercel CDN이 7일 캐시). 무신사가 주소를 바꾸면 그 사진이 안 나온다. 치수는 같은 종류 상품을 견본으로 만든 예시 값이다.
- 정책과 아직 다른 것: 추천 상태(REC-06: 맞는 사이즈 없음, 두 사이즈 사이 등)는 없고 점수 1위를 추천한다. 추천 점수 가중치는 칸 순서에 붙어 있다(REC-03은 부위 이름). 옷 등록의 "자사몰 구매 내역 불러오기"는 REG-02 등록 경로에 아직 없다.

## 버전 기록

| 날짜 | 버전 | 바뀐 것 |
|---|---|---|
| 2026-10-22 | v1 | 팀 프로토타입 4개(홈, 상품 상세, 옷장 등록, 내 옷장)를 하나로 합침 |
| 2026-10-26 | v12 | '핏 기다리는 옷' 삭제. 구매 확정 뒤 "옷장에 담을까요?" 흐름 추가 |
| 2026-10-26 | v13 | 서비스 이름 DANGJANG. 스플래시, 로그인 시트, 홈 헤더, 추천 섹션을 피그마 시안으로 반영 |
| 2026-10-28 | v14 | 원본을 레포로 옮김. Maze 유저테스트 모드(`--test`)를 뺌. 서버를 붙여 상품 링크 읽기·구매내역 캡처 찾기가 실제로 동작. Vercel 배포 준비 |
| 2026-10-29 | v15 | 디자이너 버전(디자인 시스템, 10/28 댓글, 피그마 앱 흐름 시안, 무신사 상품 데이터)을 새 원본으로. 코디북 카드 뺌. 토큰을 `design-system/tokens.css`로, 버튼을 디자인 시스템 값으로, 판정 낱말을 정책(REC-04, 04-1, 05)대로 |
