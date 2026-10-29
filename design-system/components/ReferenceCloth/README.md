# ReferenceCloth

비교의 기준이 되는 내 옷 한 벌을 보여 주는 카드로, 상세 화면의 기준 카드와 시트 안의 고르기 목록 두 가지가 있다.

## 소비자가 제공할 것
- 썸네일(50 × 60, 사진이 없으면 `shirt` 아이콘), 옷 이름, 메타("내 옷장 · 상의 · L Size"). 메타 사이 점은 `<i></i>`.
- 기준 카드: 맨 위 "기준" 라벨(`dj-eyebrow`)과 오른쪽 `dj-more` "교체하기 ›".
- 고르기 목록: `dj-ref-list`에 `role="radiogroup"`, 줄마다 `dj-ref--option` + `role="radio"` + `aria-checked`, 오른쪽 `dj-radio`.

## 규칙
- 카드: 안쪽 여백 `space-4`, 테두리 `line`, 모서리 `radius-md`.
- 목록: 줄 사이는 위 테두리 `line`. 고른 줄만 `primary` 테두리 카드로 바뀐다.
- 옷 이름은 두 줄까지, 넘치면 말줄임.
