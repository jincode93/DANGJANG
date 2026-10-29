# Button

행동 하나를 실행하는 버튼으로, 주(primary)·외곽선(outline)·보조(secondary)·텍스트(text) 네 가지가 있다.

## 언제 쓰나
- `dj-btn--primary dj-btn--block`: 화면 하단의 넓은 주 버튼("구매하기", "선택하기"). 높이 `button-height`(56px).
- `dj-btn-pair`: 두 버튼을 반씩 나눌 때. 왼쪽 `outline`("장바구니"), 오른쪽 `primary`("구매").
- `dj-btn--secondary`: primary 옆의 대안 행동.
- `dj-btn--text`: 카드 안의 가벼운 이동("교체하기 ›"). 13px, `text-tertiary`.

## 소비자가 제공할 것
- 라벨. 넓은 버튼 하나는 "~하기"("구매하기"), 두 버튼은 짧은 명사("장바구니", "구매").
- 비활성일 때는 이유를 라벨에 쓴다("옵션을 골라 주세요").

## 규칙
- 한 화면에 primary는 하나.
- primary 위 글자는 `on-primary`(흰색). 대비 2.5:1로 기준에 못 미치지만 시안 결정으로 유지한다. 그래서 글자는 16px 700으로 쓴다.
- 모서리 `radius-md`(12px). 최소 높이 `touch-min`(44px).
