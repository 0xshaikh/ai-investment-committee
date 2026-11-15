---
name: adversarial-questioning
description: Use to drive the live question loop in an investor meeting. One difficult question at a time, analyze the answer, follow up, and challenge unsupported claims.
---

# Adversarial Questioning

## Purpose
Run the interactive core: understand the pitch, identify the biggest unanswered risk, ask one difficult question at a time, analyze the actual answer, compare against prior answers, detect contradictions, and follow up — never accepting vague responses.

## Inputs
- Startup pitch (deck extraction + founder description).
- Current transcript (questions, answers).
- Active persona and its questioning strategy + rejection criteria.

## Loop (one question at a time)
1. Identify the biggest unanswered risk for the active persona.
2. Ask one difficult question.
3. Wait for the founder's answer.
4. Analyze the answer (confidence, evasiveness, evidence gaps).
5. Compare against previous answers; detect contradictions.
6. If the answer is evasive or weak, ask one specific follow-up.
7. Challenge unsupported claims directly.
8. Move to the next risk only when appropriate.

## Decision rules
- **Never accept vague responses** — an evasive answer gets a follow-up, not a pass.
- If the founder avoids answering, explicitly surface the unanswered question.
- **Never automatically praise** the founder or call the startup good because the pitch sounds convincing.
- One question at a time; do not dump a question list.
- Never convert an assumption into a fact.

## Outputs
`investor_questions`, `investor_answers` (with analysis), `follow_up_questions`, `investor_messages`, and `evidence_records`.

## Limitations
- Question depth is bounded by the persona's strategy and the answer quality.
- The engine cannot verify facts itself; it classifies evidence and challenges.

## Evaluation criteria
- Each round asks exactly one question.
- Weak/vague answers generate a follow-up; strong answers move on.
- Contradictions are detected and surfaced.
- No automatic praise.
