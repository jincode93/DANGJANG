# BottomSheet

화면 아래에서 올라오는 시트로, 기준 옷 선택이나 옵션 선택처럼 지금 화면을 벗어나지 않는 짧은 작업에 쓴다.

## 소비자가 제공할 것
- 제목(`title-3`, 20px 600), 내용(`dj-sheet-body`), 아래 행동(`dj-sheet-foot`).
- `role="dialog"`와 `aria-label`. 열릴 때 포커스를 시트 안으로 옮긴다.

## 규칙
- 위 12px에 손잡이(40 × 4), 제목은 위 40px부터. 좌우 `space-gutter`, 아래 20px.
- 최대 높이 `sheet-max`(600px). 넘치면 내용만 시트 안에서 스크롤하고 아래 버튼은 고정.
- 뒤 배경 `dim`(80%). 위 모서리 `radius-lg`, 그림자 `shadow-sheet`.
