# 프로토타입

## 통합 데모

- 주소: https://dangjang-prototype.vercel.app (`main`에 합치면 자동 배포, PR마다 미리보기 주소가 생김)
- 예전 아티팩트(https://claude.ai/artifact/Tky3xmqceQXmTaQdB9Byq4)는 v13에서 멈춤. 서버 기능이 없어 링크 읽기·캡처 찾기가 예시 값으로만 동작한다
- 팀 프로토타입 4개(`src/home.html`, `detail.html`, `reg.html`, `closet.html`)를 `build.py`로 합쳐서 만든다.
- 서버(`api/`, `lib/`)는 옷장 등록 담당 팀원의 데모(Artemis-ignis/dangjang-demo, 2026-10-28 `fe2cb70`)에서 가져왔다. 우리 Vercel에서 돌아가고, 다른 사람의 서버나 계정에 기대지 않는다. 환경 변수와 API 키는 없다.

## 폴더

| 경로 | 내용 |
|---|---|
| `src/*.html` | 팀 프로토타입 원본. `build.py`가 화면·동작 단위로 골라 합친다 |
| `build.py` | 합치기. `public/index.html`(웹), `layr.html`(아티팩트용)을 만든다 |
| `*.js`, `*.css` | 합칠 때 더하는 공통 코드 (후기, 주문, 상세 v2, DANGJANG 디자인) |
| `api/` | 서버 기능 4개. `ping` 서버 확인, `product` 상품 링크 읽기, `find` 구매내역 캡처로 상품 찾기, `img` 상품 사진 중계 |
| `lib/` | 서버 공용 코드 (쇼핑몰 읽기, 상품 표준화·검사) |
| `test/` | `lib/catalog.js` 시험 |
| `dev.mjs` | 로컬 시험 서버 (화면 + 서버 기능) |
| `vercel.json` | 빌드 명령, 올릴 폴더(`public/`), 카메라·AI 옷 분할에 필요한 헤더 |

`public/`, `layr*.html`은 빌드 결과라 레포에 올리지 않는다. Vercel이 배포할 때 `build.py`를 돌려 만든다.

## 고치고 확인하기

```bash
cd prototype
python3 build.py
node dev.mjs            # http://127.0.0.1:8792
node test/catalog.test.mjs
```

- 휴대폰 카메라 촬영은 https에서만 열리므로 실제 촬영은 배포 주소(PR 미리보기 포함)에서 확인한다.

## Vercel 설정 (처음 한 번)

Vercel → Add New → Project → `jincode93/DANGJANG` Import → Root Directory `prototype` → Framework Preset `Other` → 나머지는 비워 둠 → Deploy. 나온 주소 뒤에 `/api/ping`을 붙여 `{"ok":true,"v":1}`이 나오면 서버까지 정상이다. 이후 `main`에 합치면 자동 배포되고, PR마다 미리보기 주소가 생긴다.

## 주의할 점

- 무신사 상품 읽기·검색은 비공식 내부 주소를 쓴다. 데모·시연용이다. 요청을 몰아 보내면 잠시 막힌다 (IP당 1분: 읽기 40, 찾기 20, 사진 120).
- AI 옷 분할 모델(`Xenova/segformer_b2_clothes`)은 사용 허가가 분명하지 않다. 시연용으로만 쓴다.
- 옷장은 그 기기 브라우저에만 저장된다. 서버 저장은 없다.
- `src/reg.html`은 팀원 데모의 2026-10-22 버전이다. 그 뒤에 바뀐 옷장 등록(사이즈표 사진으로 재기, 캡처 옵션 줄에서 사이즈 찾기, 치수 범위 검사 등)은 아직 반영하지 않았다.

## 버전 기록

| 날짜 | 버전 | 바뀐 것 |
|---|---|---|
| 2026-10-22 | v1 | 팀 프로토타입 4개(홈, 상품 상세, 옷장 등록, 내 옷장)를 하나로 합침 |
| 2026-10-26 | v12 | '핏 기다리는 옷' 삭제. 구매 확정 뒤 "옷장에 담을까요?" 흐름 추가 |
| 2026-10-26 | v13 | 서비스 이름 DANGJANG. 스플래시, 로그인 시트, 홈 헤더, 추천 섹션을 피그마 시안으로 반영 |
| 2026-10-28 | v14 | 원본을 레포로 옮김. Maze 유저테스트 모드(`--test`)를 뺌. 서버를 붙여 상품 링크 읽기·구매내역 캡처 찾기가 실제로 동작. Vercel 배포 준비 |
