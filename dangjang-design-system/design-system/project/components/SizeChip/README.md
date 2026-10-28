# SizeChip

옵션 시트에서 사이즈 하나를 고르는 칩으로, 내 기준 옷과 가장 비슷한 사이즈에는 "추천" 표시가 붙는다.

## 소비자가 제공할 것
- 그룹에 `role="radiogroup"`, 칩마다 `role="radio"`와 `aria-checked`.
- 추천 사이즈: `dj-size--rec` + `<small>추천</small>`. 점만으로 알리지 않고 낱말을 함께 쓴다.
- 품절: `dj-size--soldout` + `aria-disabled="true"`.

## 규칙
- 추천은 한 개만. 추천 근거는 칩 아래 `FitResult`로 보여 준다.
- 선택 표시는 테두리 2px `text-primary`. 초록은 추천에만 쓴다.
