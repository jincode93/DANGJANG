# SizeChip

사이즈 하나를 고르는 칩으로, 사이즈 이름 아래에 내 기준 옷과 비교한 판정을 한 줄로 보여 준다.

## 소비자가 제공할 것
- 묶음 `dj-sizes`에 `role="radiogroup"`, 칩마다 `role="radio"`와 `aria-checked`.
- 칩 안: `<b>사이즈</b><span>판정</span>`. 추천 사이즈는 `<b>L<small>추천</small></b>`.
- 품절: `dj-size--soldout` + `aria-disabled="true"`, 판정 자리에 "품절".

## 규칙
- 사이즈 판정 낱말은 여섯 가지만: 작아요 · 살짝 작아요 · 비슷해요 · 살짝 커요 · 커요 · 부위별로 달라요(큰 부위와 작은 부위가 함께 있을 때). 부위 판정(비슷해요·넉넉해요·부족해요)과 섞지 않는다.
- 기준 옷이 없으면 판정 줄을 빼고 사이즈만 쓴다.
- 추천은 한 개만. "추천" 낱말은 `primary-text`.
- 고른 칩은 `primary-subtle` 바탕 + `primary` 테두리. 최소 너비 72px, 모서리 `radius-md`.
