# 외부 코드 고지

이 폴더의 리뷰 스킬(`review-ceo`, `review-design`, `review-eng`)과 공통 절차 `docs/eval/review-process.md`는 **gstack**을 고쳐 만들었다.

- 출처: https://github.com/garrytan/gstack
- 커밋: `188e574d84f34579df0ad67ed71603443e8d1f73` (2026-10-26)
- 라이선스: MIT, Copyright (c) 2026 Garry Tan. 전문은 이 폴더의 `LICENSE-gstack.txt`.

| DANGJANG 파일 | gstack 원본 |
|---|---|
| `review-ceo/SKILL.md` | `plan-ceo-review/SKILL.md.tmpl`, `plan-ceo-review/sections/review-sections.md.tmpl` |
| `review-design/SKILL.md` | `plan-design-review/SKILL.md.tmpl`, `plan-design-review/sections/review-sections.md.tmpl` |
| `review-eng/SKILL.md` | `plan-eng-review/SKILL.md.tmpl`, `plan-eng-review/sections/review-sections.md.tmpl` |
| `docs/eval/review-process.md` | 세 스킬의 공통 규칙(0~10점 매기는 법, 결정 형식, 치명적 구멍 규칙, 건너뛰기 금지 규칙) |

## 바꾼 것

- 범위를 코드 계획 리뷰에서 프로토타입이 있는 제품 기획 리뷰로 좁혔다. 리뷰 깊이 기본값은 gstack의 "strategy-only"(전략 수준)다.
- 계획을 대화하며 고치는 기능, 보조 프로그램, 사용 기록 전송, 리뷰 대시보드, 목업 생성, `~/.gstack` 저장을 뺐다. 보고서는 `reviews/`에 쓴다.
- 엔지니어링 전용 섹션(보안 위협 모델, 배포, 데이터베이스 성능)은 빼거나 실현 가능성에 합쳤다.
- 차원을 DANGJANG 용어(기준 옷, 종류, 구매 확정)와 DANGJANG 상태로 다시 썼다.
- 2026-10-30부터 지시도 한국어로 쓴다(그 전에는 영어 지시, 한국어 결과). 팀이 읽고 고치기 쉽게 하기 위해서다. 원본 대응 관계는 각 파일의 "gstack 원본" 표기로 남긴다.
