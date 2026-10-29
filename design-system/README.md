# 당장 디자인 시스템

> **이 폴더는 복사본이다.** 원본은 디자이너(이다영)의 아티팩트 https://claude.ai/artifact/MYCBSxu8TBYQeEFBcS1Myt 에 있다. 이 폴더 파일은 손으로 고치지 않는다. 원본이 바뀌면 Claude에게 "디자인 시스템 최신으로 가져와 줘"라고 해서 가져오기 PR로 맞춘다.
>
> - 가져온 버전: `1793165722-d667` (원본 마지막 수정 2026-10-28, "Wanted Sans 폰트 파일 적용"), 가져온 날 2026-10-29
> - 아래 "원칙"부터 끝까지는 원본 README 그대로다.

## 이 폴더

| 파일 | 내용 |
|---|---|
| `tokens.json` | 원본 토큰 (색 51 · 글자 스타일 9 · 간격 8 · 모서리 5 · 그림자 2 · 크기 9). 토큰마다 쓰는 곳이 적혀 있다 |
| `tokens.css` | `tokens.json`에서 만든 CSS 변수와 글꼴 선언. `python3 design-system/build_tokens.py`로 만든다. 다크 테마는 `<html data-theme="dark">`일 때만 |
| `components/bundle.css` | 컴포넌트 스타일 (`.dj-*`). 값은 모두 `tokens.css`에서 온다 |
| `components/*/README.md` | 컴포넌트 17개의 쓰는 법과 규칙 |
| `icons/icons.json` | 아이콘 203종. 이름 · 한국어 이름 · 묶음 · Line과 Fill의 SVG 안쪽 내용. `<svg class="dj-icon" viewBox="0 0 24 24">` 안에 넣는다 |
| `fonts/` | Wanted Sans 400·500·600·700, 사용 허가문 `OFL.txt` |

화면에서 쓰는 순서: `tokens.css` → `components/bundle.css`를 불러오고, 색·간격·글꼴은 `var(--…)`로, 글자 스타일은 `font: var(--font-body)`처럼 쓴다.

## 가져오는 법 (Claude가 따름)

1. 원본 아티팩트를 `read`해서 `project/README.md`, `project/tokens.json`, `project/components/bundle.css`, `project/components/*/README.md`, `project/fonts/*.woff2`, `project/components/Icon/preview.html`을 받는다.
2. 이 폴더에 덮어쓴다. 아이콘은 `Icon/preview.html`의 `ICONS` 배열을 `icons/icons.json`으로 바꾼다. 맨 위 안내 블록의 버전과 날짜를 고친다.
3. `python3 design-system/build_tokens.py`를 돌린다. 컴포넌트가 쓰는 변수가 빠지면 멈춘다.
4. PR 설명에 바뀐 토큰(이름 · 이전 값 → 새 값)과 바뀐 컴포넌트 규칙을 적는다.

---

당장(DANGJANG)은 '당신의 옷장'의 줄임말이에요. 내 옷장의 잘 맞는 옷 한 벌이 사이즈표가 되는 Gen Z 패션몰이고, 이 시스템은 그 앱의 화면을 만드는 규칙이에요.

## 원칙

1. **내 옷이 기준이다.** 숫자보다 "내 옷과 비교해 어떤가"를 먼저 보여 준다. 판정(`FitResult`)과 기준 옷(`ReferenceCloth`)이 화면의 주인공이다.
2. **확신을 준다.** 판정은 낱말·숫자·색을 겹쳐서 알린다. 애매한 표현("대체로", "아마")은 쓰지 않는다.
3. **바로 한다.** 한 화면에 주 행동 하나. 사용자가 고민하는 시간을 줄인다.

## 문구

- 존댓말 해요체로 쓴다. "저장했어요", "사이즈를 골라 주세요".
- 넓은 버튼 하나는 "~하기" 동사형: "구매하기", "선택하기", "로그인하기", "교체하기". 두 버튼을 나란히 둘 때는 짧은 명사: "장바구니", "구매".
- 판정 낱말은 두 묶음이다. 섞지 않는다.
  - 부위 판정(`FitResult`): **비슷해요 / 넉넉해요 / 부족해요**. 부위를 앞에 붙인다("어깨 비슷해요").
  - 사이즈 판정(`SizeChip`): **작아요 / 살짝 작아요 / 비슷해요 / 살짝 커요 / 커요 / 부위별로 달라요**.
- 차이는 기준 옷 대비 cm로 쓴다: `+3cm`, `−2cm`(마이너스 기호 U+2212).
- 중고 거래 상품에는 "판매 상품", 당장에서 산 옷에는 "당장 구매 인증" 라벨을 붙인다.
- 이모지는 쓰지 않는다. 근거 없는 수치("98%가 만족")를 화면에 넣지 않는다.
- 서비스명은 국문 '당장', 영문 'DANGJANG'. 품번 접두어는 `DJ-`.

## 컬러

- 브랜드 초록 `primary`(`primary-00`, #06BC51)는 주 버튼, 선택된 칩, 스위치, 고른 항목의 테두리에 쓴다.
- `primary` 면 위 글자는 `on-primary`(흰색). 초록 글자는 `primary-text`(라이트 #06BC51, 다크 `primary-10`).
- 두 쌍 모두 흰 바탕·초록 면에서 대비 2.5:1로 4.5:1 기준에 못 미친다. 상세 시안(2026-10-28)을 따른 팀 결정이다. 그래서 초록 글자는 13px 이상, 600 이상 굵기로만 쓴다.
- 할인율은 `discount`(#F2382B). 판정·오류 빨강 `danger`와 따로 쓴다.
- 틴트 `primary-30`~`primary-70`은 배경·하이라이트 전용. 옅은 선택 바탕은 `primary-subtle`.
- 회색은 사용자가 정한 두 스케일을 쓴다: 밝은 쪽 `white-00`~`white-70`, 어두운 쪽 `black-00`~`black-70`. 화면에서는 이름 대신 역할 토큰을 쓴다.
  - 바탕 `bg`, 구분 띠·입력칸 `bg-subtle`, 시트·카드 `surface-raised`
  - 글자 `text-primary` > `text-secondary` > `text-tertiary`(#979797, 흰 바탕 2.9:1·팀 결정). `text-disabled`는 비활성 전용
  - 선 `line`(장식), `line-strong`(조작 요소 테두리)
- 판정 색 `fit-match`·`fit-loose`·`fit-tight`는 판정에만 쓴다. 브랜드 `primary`를 판정에 쓰지 않는다.
- 다크 테마는 `bg`가 `black-00`(#121212). 같은 역할 토큰을 쓰면 자동으로 바뀐다.

## 타이포그래피

- 서체는 Wanted Sans 한 가지(`font-sans`). 400·500·600·700 파일이 `fonts/`에 있다(SIL OFL 1.1, wanteddev/wanted-sans).
- 스타일: `display` 28 · `title-1` 22 · `title-3` 20 · `title-2` 18 · `headline` 16 · `body`/`body-strong` 15 · `body-sm` 14 · `caption` 13 · `label` 12.
- 본문은 `body`(15/22). 가격·실측·개수처럼 세로로 맞춰 읽는 숫자는 `tabular-nums`.
- 굵기는 400·500·600·700. 500은 메타 정보와 보조 문구에 쓴다.
- 자간은 모든 글자에 −3%(`-0.03em`). `bundle.css`의 `body`에 걸려 있다.

## 레이아웃

- 화면 좌우 여백은 항상 `space-gutter`(20px).
- 섹션 사이는 `space-section`(8px) 높이의 `bg-subtle` 띠로 나눈다.
- 누를 수 있는 모든 요소는 `touch-min`(44×44px) 이상.
- 간격은 `space-1`(4) · `space-2`(8) · `space-3`(12) · `space-4`(16) · `space-6`(24) · `space-8`(32)만 쓴다.
- 상단 헤더 `header-height`(56px), 하단 탭바 `tabbar-height`(56px) + 안전 영역, 상세 대표 이미지 `hero-height`(468px).

## 모양

- 모서리: 라벨·수량 칸 `radius-xs`(4) · 입력칸 `radius-sm`(8) · 버튼·카드·칩·사이즈 칩·드롭다운 `radius-md`(12) · 시트 `radius-lg`(20) · 알약·스위치 `radius-full`.
- 그림자는 떠 있는 것에만: 바텀시트 `shadow-sheet`, 토스트 `shadow-float`. 카드는 그림자 대신 `line` 테두리.
- 바텀시트 뒤는 `dim`(80%).

## 로고와 아이콘

- 로고는 아직 정해지지 않았다. 정해질 때까지 '당장'을 Wanted Sans 700으로 쓴다.
- 아이콘은 당장 아이콘 세트(Assets › Icons, 컴포넌트 `Icon`)만 쓴다. 다른 아이콘 라이브러리를 섞지 않는다.
  - 24×24 그리드, 바깥 2px 여백, 선 1.8px, 끝과 모서리는 둥글게(round cap, round join).
  - 203종, 각각 Line과 Fill 두 벌. 묶음: 방향, 행동, 상태, 소통, 사람, 미디어·문서, 커머스, 장소, 기기, 사물, 핏.
  - 기본은 Line. 선택된 상태에만 `-fill` 짝을 쓴다: 탭바의 현재 탭, 찜한 상태, 새 알림, 저장한 항목.
  - Fill은 닫힌 모양을 채우고, 안쪽 디테일(체크, 눈금, 글줄)은 같은 1.8px 굵기로 파낸다. 화살표·꺾쇠처럼 닫힌 모양이 없는 아이콘은 Line과 Fill이 같다.
  - 점(더보기, 느낌표 점)은 지름 2.2~3.2px의 채운 원으로, 1.8px 선과 같은 무게로 보이게 맞춘다.
  - 크기는 `icon-lg`(24) 기준, 줄일 때 `icon-md`(20)·`icon-sm`(16). 선 두께는 크기와 함께 줄어든다.
  - 색은 글자색을 따른다(`currentColor`). 아이콘만 있는 버튼은 `aria-label`을 붙이고 누르는 영역을 `touch-min`으로 키운다.
- 판정 아이콘: `check`(비슷해요), `plus`(넉넉해요), `minus`(부족해요). `icon-sm`, 판정 색과 같은 색.

## 접근성

- 글자는 바탕 대비 4.5:1 이상(24px 이상은 3:1). 각 글자 토큰 설명에 어떤 바탕 위에서 쓰는지 적어 두었다.
- 키보드 포커스는 `focus-ring` 2px 실선, 간격 2px.
- 판정은 색만으로 알리지 않는다. `fit-match`(초록)와 `fit-tight`(빨강)는 밝기가 비슷해서 색각 이상 사용자가 색으로 구분하기 어렵다. 낱말이나 숫자를 꼭 함께 쓴다.
