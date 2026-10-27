# DANGJANG

잘 맞는 내 옷을 기준으로, 사기 전에 상품의 부위별 핏을 알려주는 패션 커머스 앱 안의 옷장 서비스.

- 데모: https://claude.ai/artifact/Tky3xmqceQXmTaQdB9Byq4
- KAI10 이커머스1팀 팀 프로젝트 · 최종 발표 2026-11-05

## 문제

키·몸무게가 같은 사람의 후기를 봐도, 내 비율에서 밑위·기장·어깨가 어디에 떨어질지 사기 전에 알 수 없다.
설문 24명 중 핏 확인형 13명에서, 최근 6개월에 3벌 이상 실패한 사람이 6명이었다. 나머지 11명 중에서는 1명이었다.

## 해결

이미 잘 맞는 내 옷(기준 옷)을 한 번 등록하면, 상품 상세에서 그 옷과 부위별로 cm 차이를 비교해 사이즈를 추천한다.

## 이 레포를 보는 법

| 보고 싶은 것 | 위치 |
|---|---|
| 제품 맥락과 결정 | `CLAUDE.md`, `logs/decision-log.md` |
| 서비스 정책 | `docs/policy/서비스-정책.md` |
| 리서치 근거 (설문 24명, 인터뷰 5명, 페르소나, 경쟁사) | `docs/research/README.md` |
| 프로젝트 일정과 멘토링 기록 | `docs/timeline.md`, `docs/mentoring/` |
| 평가 기준 | `docs/eval/rubric.md` |
| 리뷰 결과와 점수 변화 | `reviews/`, `reviews/scores.csv` |
| AI 리뷰 스킬 | `.claude/skills/` |
| 작업 시간 기록 | `logs/time-log.md` |

## AI로 일하는 방식

CEO, 디자이너, 엔지니어 관점의 리뷰를 Claude Code 스킬로 만들어 두었다. [gstack](https://github.com/garrytan/gstack)(MIT)의 `plan-ceo-review`, `plan-design-review`, `plan-eng-review`를 기획·프로토타입 리뷰에 맞게 고친 것이다(출처: `.claude/skills/NOTICE.md`). 결과물이 나올 때마다 같은 기준으로 차원별 0~10점을 매기고, 점수 변화를 `reviews/scores.csv`에 쌓는다.

```
/review-ceo 통합 데모
/review-design 통합 데모
/review-eng 통합 데모
```

세 리뷰는 서로 기다릴 필요가 없어서, 세션 세 개에서 동시에 돌린다.
