# Third-party notice

The review skills in this directory (`review-ceo`, `review-design`, `review-eng`) and the shared procedure in `docs/eval/review-process.md` are adapted from **gstack**.

- Source: https://github.com/garrytan/gstack
- Commit: `188e574d84f34579df0ad67ed71603443e8d1f73` (2026-10-26)
- License: MIT, Copyright (c) 2026 Garry Tan. Full text: `LICENSE-gstack.txt` in this directory.

| DANGJANG file | gstack source |
|---|---|
| `review-ceo/SKILL.md` | `plan-ceo-review/SKILL.md.tmpl`, `plan-ceo-review/sections/review-sections.md.tmpl` |
| `review-design/SKILL.md` | `plan-design-review/SKILL.md.tmpl`, `plan-design-review/sections/review-sections.md.tmpl` |
| `review-eng/SKILL.md` | `plan-eng-review/SKILL.md.tmpl`, `plan-eng-review/sections/review-sections.md.tmpl` |
| `docs/eval/review-process.md` | Shared rules from all three (0–10 rating method, decision format, critical-gap rule, anti-skip rule) |

## What was changed

- Scope narrowed from code-plan review to product-planning review of a prototype. Review depth defaults to gstack's "strategy-only".
- Interactive plan editing, helper binaries, telemetry, review dashboard, mockup generation, and `~/.gstack` storage were removed. Reports go to `reviews/` instead.
- Engineering-only sections (security threat model, deployment, database performance) were dropped or folded into feasibility.
- Dimensions were rewritten with DANGJANG terms (base garment, group, purchase confirmation) and DANGJANG states.
- Instructions are in English; generated reports are in Korean.
