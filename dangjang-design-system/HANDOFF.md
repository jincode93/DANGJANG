# 당장 디자인 시스템 — 인수인계

마지막 작업: 2026-10-28 · 작업자: 이다영 (Claude 앱 대화에서 진행)

이 폴더 하나로 디자인 시스템을 다시 만들고, 고치고, 검사할 수 있다. 처음이면 1~3장만 읽고 시작해도 된다.

---

## 1. 프로젝트 한눈에

- **서비스:** 당장(DANGJANG). '당신의 옷장'의 줄임말. "내 옷장의 잘 맞는 옷 한 벌이 사이즈표가 되는 Gen Z 패션몰". 팀 프로젝트(부트캠프)이고, 디자인 시스템은 포트폴리오로도 쓴다.
- **핵심 기능:** 내 기준 옷과 상품 실측을 부위별로 비교해 **비슷해요 / 넉넉해요 / 부족해요**로 판정한다.
- **기획 문서 위치 (사용자 컴퓨터):** `~/Desktop/dangjang/`
  - `00-project-context.md`, `03-prd.md`, `04-decisions.md` — 서비스 맥락, PRD, 결정 기록
  - `10-추가기능/` — 병렬 작업용 공통 계약(`00_공통계약.md`), `결정기록.md`, `변경요청.md`, `작업/A~I_*.md`, `데모/`
  - 추가 기능 작업은 Claude 스킬 `dangjang-feature-task`로 시작한다 ("A 작업 진행해 줘").
- **문구 규칙:** 해요체. 버튼은 "~하기"(내 옷과 비교하기, 구매하기, 로그인하기, 교체하기). 이모지 없음. 품번 접두어 `DJ-`. 이전 작업명(Layr, 나란)은 쓰지 않는다.

## 2. 결과물 위치

| 무엇 | 위치 |
| --- | --- |
| **디자인 시스템 (게시본)** | https://claude.ai/artifact/MYCBSxu8TBYQeEFBcS1Myt — Claude의 "Design System" 아티팩트 타입. 지금은 비공개(본인만). 포트폴리오에 걸려면 페이지의 Share 메뉴에서 공개 |
| 디자인 시스템 소스 | 이 폴더 `design-system/project/` (게시본과 같은 파일) |
| 아이콘 원본과 빌드 스크립트 | 이 폴더 `iconset/` |
| 아이콘 SVG 406개 | `iconset/out/` (Figma로 가져가기용) |
| 로고 시안 5종 (A~E) | https://claude.ai/code/artifact/8eb39a27-018c-45bb-9558-af722508fd4f — 아직 하나도 고르지 않음 |
| 쓰지 않는 빈 아티팩트 | https://claude.ai/artifact/KURw7n2dZq5RawEEJPf78y — 이름이 "Design System"인 빈 시스템. 손대지 않았다. 필요 없으면 지워도 된다 |

## 3. 폴더 구조

```
dangjang-design-system/
├─ HANDOFF.md                  ← 이 문서
├─ CLAUDE.md                   ← Claude Code가 자동으로 읽는 짧은 안내
├─ design-system/project/      ← 게시되는 파일 전부 (이 경로 그대로 올린다)
│  ├─ design-system.json       ← 인덱스. 제목, 아이콘 업로드 기록(406개) 포함
│  ├─ tokens.json              ← 토큰 원본 (색·서체·간격·모서리·그림자·크기)
│  ├─ README.md                ← 브랜드 북 (페이지 Overview에 보임)
│  ├─ assets/Icons/README.md   ← 아이콘 묶음 설명
│  └─ components/
│     ├─ bundle.css            ← 모든 컴포넌트 스타일 (.dj-*)
│     ├─ Cover/preview.html    ← 표지 (README 없음 = 표지로 인식)
│     ├─ SystemMap·Anatomy·ProductDetail/preview.html ← 쇼케이스 페이지 (README 없음, 마커에 `page`)
│     └─ <컴포넌트>/README.md, preview.html   ← 11종
├─ iconset/
│  ├─ lib.py      ← 아이콘 렌더러 (Line/Fill 규칙)
│  ├─ icons.py    ← 아이콘 203종 정의 (이름, 한국어, 묶음, 모양)
│  ├─ build.py    ← SVG 406개 + Icon/TabBar/ReferenceCloth 미리보기 생성
│  ├─ sheet.py    ← 전체 아이콘 확인용 시트(sheet.html) 생성
│  ├─ ids.json    ← 파일명 → 업로드된 asset id (게시본과 일치)
│  └─ out/        ← build.py 결과 SVG
└─ tools/
   ├─ tokens_css.py  ← tokens.json → tokens.css (로컬 미리보기용 근사본)
   └─ preview.js     ← 모든 컴포넌트를 라이트·다크로 찍어 light.png / dark.png 생성
```

## 4. 결정한 것

### 컬러
- 사용자가 준 팔레트 이미지가 기준. **Primary #06BC51**, white 스케일(`white-00`~`white-70`: FFFFFF→C5C5C5), black 스케일(`black-00`~`black-70`: 121212→979797).
- Primary 틴트 `primary-10`~`primary-70`은 **이미지 스크린샷에서 뽑은 추정값**. Figma 원본 hex를 받으면 바꿔야 한다.
- #06BC51은 흰 바탕에서 글자 대비 2.5:1이라 **면으로만** 쓴다. 그래서 진한 단계를 추가했다: `primary-strong` #047A36(5.5:1), `primary-deep` #02662C.
- 주 버튼 글자는 흰색이 아니라 검정(`on-primary` = `black-00`, 7.4:1).
- 역할 토큰(라이트 / 다크): `bg`, `bg-subtle`, `surface-raised`, `line`, `line-strong`, `text-primary`, `text-secondary`, `text-tertiary`, `text-disabled`, `primary`, `on-primary`, `primary-text`, `primary-subtle`, `fit-match`, `fit-loose`, `fit-tight`, `danger`, `inverse-bg`, `inverse-text`, `focus-ring`, `dim`. 글자 토큰은 두 테마 모두 4.5:1 이상인지 계산으로 확인했다.
- **판정 색은 브랜드 초록과 분리**했다(`fit-match` 등). 초록·빨강은 밝기가 비슷해 색각 이상 사용자가 구분하기 어려우므로 판정은 항상 낱말 + 아이콘(✓ + −)을 함께 쓴다.

### 서체
- **Wanted Sans** (사용자 지정). `font-sans` = `"Wanted Sans", "Wanted Sans Variable", "Noto Sans KR", system-ui, sans-serif`.
- **폰트 파일은 아직 없다.** 클라우드 작업 환경에서 내려받기가 막혔고, 맥 폰트 폴더 접근도 거절됐다. 그래서 Wanted Sans가 설치되지 않은 컴퓨터에서는 Noto Sans KR(`bundle.css` 첫 줄에서 Google Fonts로 불러옴)로 보인다.
- 텍스트 스타일 8개: `display` 28/38 · `title-1` 22/30 · `title-2` 18/26 · `headline` 16/24 · `body` 15/22 · `body-strong` 15/22 · `caption` 13/18 · `label` 12/16. 굵기는 400·600·700만.

### 간격·모서리·크기 (기존 데모 값 유지)
- 간격 4·8·12·16·**20(좌우 여백)**·24·32, 섹션 구분 띠 7px
- 모서리 4·8·12·20·full
- 터치 44px, 헤더·탭바 56px, 주 버튼 52px, 상세 대표 이미지 468px, 바텀시트 최대 600px(배경 dim 80%)
- 아이콘 16·20·24px

### 컴포넌트 (11종)
Button, Chip, SizeChip, TextField, FitResult, ReferenceCloth, ProductCard('판매 상품'·'당장 구매 인증' 라벨), BottomSheet, Toast, TabBar, Icon. 표지(Cover) 별도. 모두 정적 HTML 미리보기 + `bundle.css`이고, JS 번들(`bundle.js`)은 없다. Icon 미리보기에만 검색·Line/Fill 전환 스크립트가 있다.

### 쇼케이스 페이지 (3장, 그룹 Showcase)
Behance 디자인 시스템 레퍼런스 두 개를 참고해 2026-10-28에 넣었다. `SystemMap`(규모 숫자, 아토믹 구조, 라이트·다크 비교), `Anatomy`(버튼·사이즈 칩·기준 옷·판정의 치수와 토큰 표시), `ProductDetail`(컴포넌트로 조립한 상품 상세 템플릿). 마커에 `page`를 붙여 컴포넌트가 아닌 쇼케이스로 표시된다. `SystemMap`의 숫자(컬러 토큰 49, 텍스트 스타일 8, 컴포넌트 11, 아이콘 203)는 손으로 적은 값이라, 토큰이나 컴포넌트를 더하면 함께 고친다.

### 로고
- 아직 미정. 로고 자리에는 '당장'을 Wanted Sans 700으로 쓴다(README에 명시).

### 아이콘
- **203종 × Line·Fill = SVG 406개.** 묶음: 방향 32, 행동 50, 상태 25, 미디어·문서 21, 장소 15, 소통 14, 커머스 13, 사람 12, 사물 12, 기기 4, 핏(당장 전용) 5.
- 규칙: 24×24, 바깥 여백 2px, 선 1.8px, round cap/join. 점은 지름 2.2~3.2px 채운 원.
- Fill은 닫힌 모양을 채우고 안쪽 디테일을 1.8px로 파낸다(SVG `mask`). 닫힌 모양이 없는 아이콘(화살표, 꺾쇠 등)은 Line과 Fill이 같다.
- **당근(SEED) 아이콘은 목록 범위만 참고했고 모양은 모두 새로 그렸다.** SEED 아이콘은 당근마켓 저작물이고 문서에 무단 복제·배포 금지가 명시돼 있다. 사용자가 "모양 그대로"를 요청했지만 이 이유로 거절했고, 사용자도 새로 그리는 쪽으로 동의했다. 이어서 작업할 때도 당근 SVG를 가져오지 않는다.
- 업로드된 SVG 잉크는 **#777777**(`black-60`). 라이트·다크 어디서나 보이게 하려는 것. 화면에서는 인라인 SVG + `currentColor`로 쓴다.

## 5. 아이콘 고치는 법

`iconset/icons.py`의 `ICONS` 목록에 `(이름, 한국어, 묶음, 요소들)`로 정의한다. 요소 종류(`lib.py`):

| 함수 | Line | Fill |
| --- | --- | --- |
| `S(path)`, `C(cx,cy,r)`, `R(x,y,w,h,rx)` | 선 | 채움 |
| `L(path)`, `LC`, `LR` | 선 | 선 |
| `K(path)`, `KC`, `KR` | 선 | 채움에서 파냄 |
| `D(cx,cy,r)` | 채운 점 | 채운 점 |
| `KD(cx,cy,r)` | 채운 점 | 파냄 |
| `("F", '<path …/>')` | 채움 | 채움 (작은 삼각형 caret) |

```bash
python3 iconset/sheet.py        # iconset/sheet.html — 전체 Line/Fill을 나란히 보기
python3 iconset/build.py        # out/*.svg 406개 + Icon·TabBar·ReferenceCloth 미리보기 갱신
```

다듬으면 좋은 것: `walk`, `bike`, `fingerprint`는 24px에 세부를 넣다 보니 다른 아이콘보다 거칠다.

## 6. 검사

```bash
python3 tools/tokens_css.py && node tools/preview.js   # tools/light.png, tools/dark.png, 콘솔 오류 출력
```
Playwright가 필요하다(`npm i playwright` 후 `npx playwright install chromium`). 실제 게시본은 디자인 시스템 페이지가 `tokens.json`으로 `tokens.css`를 직접 만들기 때문에, 로컬 결과는 근사치다.

색을 바꾸면 대비를 다시 계산한다. 기준: 글자 4.5:1(24px 이상 3:1), 테두리·포커스·아이콘 3:1, 라이트와 다크 둘 다.

## 7. 게시하는 법 (중요한 함정 포함)

게시는 Claude의 Artifact 도구로 한다. Claude Code 세션에 그 도구가 없으면, Claude 앱 대화에서 위 아티팩트 URL을 주고 "이 폴더의 바뀐 파일을 게시해 줘"라고 요청한다.

- 파일 경로는 `project/…` 그대로 올린다. `root`는 `design-system/` 폴더이고, **바뀐 파일만** 보낸다.
- **인덱스(`design-system.json`)는 맨 마지막에 한 번만** 보낸다. 보내기 직전에 게시본 인덱스를 다시 읽어서, 그사이 페이지에서 바뀐 키를 지키고 `lastChange`만 고친다.
- `tokens.css`, `manifest.json`, `api/`는 페이지가 만든다. 직접 쓰지 않는다.
- 이미지·SVG는 파일이 아니라 **asset 업로드**(`asset: true`)로 올리고, 받은 id를 인덱스 `assetGroups.Icons.files.<파일명>.blob`에 적는다. 한 번에 25개까지.
- **업로드한 SVG에서 `<style>`은 서버가 지운다.** 그래서 다크 모드 색 전환은 SVG 안에서 할 수 없다(잉크를 #777777로 고정한 이유). `<mask>`는 그대로 남는다.
- 같은 경로의 파일을 고쳐서 다시 올리면 **예전 내용이 올라간 적이 있다.** 다시 올릴 때는 새 폴더에 복사해서 올리고, 받은 파일을 읽어 내용을 확인한다.
- 게시본 asset 저장소에는 예전 버전 아이콘 약 130개가 인덱스에 연결되지 않은 채 남아 있다. 화면에는 보이지 않는다. 정리하려면 하나씩 지워야 한다(`ids.json`에 없는 id).

## 8. 남은 일

1. **Wanted Sans 폰트 파일 넣기:** woff2(400·600·700)를 `design-system/project/fonts/`에 두고 `tokens.json`의 `type.fonts`에 `{"family": "Wanted Sans", "file": "fonts/…woff2", "weight": "400"}` 식으로 등록한다. 넣은 뒤에는 `bundle.css` 첫 줄 Noto Sans KR import를 지워도 된다.
2. **Primary 틴트 실제 값:** Figma 원본 hex로 `primary-10`~`primary-70`을 교체한다.
3. **로고 확정:** 시안 A~E 중 하나를 고르면 README의 로고 항목, 표지, Assets(로고 묶음)에 반영한다.
4. **아이콘 다듬기:** `walk`, `bike`, `fingerprint`.
5. **브랜드 초록과 판정 초록 분리 확정:** 기획 결정 기록의 C-05(버튼용·결과용 초록 분리)는 이 시스템에서 토큰으로 이미 분리했다. 팀 결정 기록에 반영할 것.
6. **포트폴리오 공개:** Share 메뉴에서 공개 링크를 켠다.
7. ~~**예시 화면(제안)**~~ 2026-10-28 완료: 쇼케이스 그룹에 상품 상세 템플릿(`ProductDetail`)을 넣었다.
8. (선택) 게시본에 남은 쓰지 않는 asset 정리, 빈 "Design System" 아티팩트 삭제.
