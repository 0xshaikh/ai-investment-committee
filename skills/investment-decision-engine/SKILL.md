---
name: investment-decision-engine
description: Use to produce the committee decision. Four outcomes, per-persona disagreement preserved, no universal scoring threshold, never YES by default.
---

# Investment Decision Engine

## Purpose
Produce one of four outcomes — YES, NO/PASS, CONDITIONAL YES, MORE DILIGENCE — from evidence, findings, and unanswered questions, allowing personas to disagree.

## Inputs
- Evidence ledger (per claim classification + confidence).
- Diligence findings (category + severity).
- Per-persona rejection criteria.
- Unanswered questions.

## Decision rules
- **YES is never the default.**
- A persona returns NO when its rejection criteria are met or high/critical findings exist in its focus.
- A persona returns MORE DILIGENCE when material evidence gaps (unverified/unknown claims) or unanswered questions remain — it is not a NO, it is "needs more evidence."
- A persona returns CONDITIONAL_YES when the thesis holds but medium findings require resolution.
- A persona returns YES only when evidence supports its thesis and no rejection triggers exist.
- The committee aggregates: a hard NO from a focused member blocks funding; YES requires a strict majority with no NO; otherwise MORE DILIGENCE.
- Criteria adapt to stage, sector, and business model — no arbitrary universal scoring threshold.

## Outputs
`investor_verdicts` (per persona) and `committee_decisions` (aggregate with agreement, disagreement, risks, strengths, weaknesses, unanswered, reconsider conditions).

## Limitations
- The engine is evidence-driven and rule-based; it does not know a real fund's mandate.
- It cannot guarantee accuracy — the output is a simulated assessment, explicitly labeled.

## Evaluation criteria
- Four outcomes only; YES not default.
- Disagreement between personas is preserved, not averaged away.
- The decision explains agreement, disagreement, biggest risks, strongest/weakest evidence, unanswered questions, and reconsider conditions.
- Output is labeled simulated, not a real offer or prediction.
