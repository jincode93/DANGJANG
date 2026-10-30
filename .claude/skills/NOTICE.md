# 외부 코드 고지

리뷰 스킬 `review-ceo`, `review-design`, `review-eng`와 공통 절차 `docs/eval/review-process.md`는 **gstack**을 고쳐 만들었다.

- 출처: https://github.com/garrytan/gstack
- 커밋: `188e574d84f34579df0ad67ed71603443e8d1f73` (2026-10-26)
- 라이선스: MIT, Copyright (c) 2026 Garry Tan. 전문은 이 폴더의 `LICENSE-gstack.txt`.

| DANGJANG 파일 | gstack 원본 |
|---|---|
| `review-ceo/SKILL.md` | `plan-ceo-review` |
| `review-design/SKILL.md` | `plan-design-review` |
| `review-eng/SKILL.md` | `plan-eng-review` |
| `docs/eval/review-process.md` | 세 스킬의 공통 규칙(0~10점, 결정 형식, 치명적 구멍, 건너뛰기 금지) |

## 바꾼 것

- 코드 계획 리뷰를 프로토타입이 있는 기획 리뷰로 좁혔다. 기본 깊이는 전략 수준이다.
- 대화형 계획 수정, 보조 프로그램, 사용 기록 전송, 대시보드, 목업 생성, `~/.gstack` 저장을 뺐다. 보고서는 `reviews/`에 쓴다.
- 보안 위협 모델, 배포, 데이터베이스 성능 섹션은 빼거나 실현 가능성에 합쳤다.
- 차원을 DANGJANG 용어와 상태로 다시 썼다.
- 2026-10-30부터 지시를 한국어로만, 짧게 쓴다. 팀이 읽고 고치기 쉽고, AI가 매번 읽는 분량을 줄이기 위해서다.
