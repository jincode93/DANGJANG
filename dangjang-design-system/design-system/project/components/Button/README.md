# Button

행동 하나를 실행하는 버튼으로, 주(primary)·보조(secondary)·외곽선(outline)·텍스트(text) 네 가지가 있다.

## 언제 쓰나
- `dj-btn--primary`: 화면에서 가장 중요한 행동 하나. 상세 하단 "구매하기", 비교 진입 "내 옷과 비교하기".
- `dj-btn--secondary`: primary 옆의 대안 행동("교체하기").
- `dj-btn--outline`: 화면의 흐름을 바꾸지 않는 행동("로그인하기").
- `dj-btn--text`: 문장 안이나 카드 안의 가벼운 이동("실측 보기").
- `dj-btn--block`: 화면 하단 고정 CTA. 높이 `button-height`, 좌우 `space-gutter`.

## 소비자가 제공할 것
- 동사형 라벨: "~하기"로 끝낸다. "확인" "OK"는 쓰지 않는다.
- 비활성일 때는 이유를 라벨에 쓴다("사이즈를 골라 주세요").

## 규칙
- 한 화면에 primary는 하나.
- primary 면 위 글자는 `on-primary`(검정). 흰 글자는 대비 2.5:1이라 쓰지 않는다.
- 최소 높이 `touch-min`(44px).
