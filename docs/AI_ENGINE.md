# AI Engine

The investor intelligence engine is the core of the product. It is deliberately evidence-driven and skeptical. It is built from **pure, testable functions** in `lib/engine/*` plus a **provider abstraction** in `lib/ai/provider.ts`.

## Provider abstraction

`callAI(prompt, opts)` routes to the first configured provider in precedence order:

1. **OpenRouter** (`OPENROUTER_API_KEY`, default model `anthropic/claude-3.5-sonnet`)
2. **Gemini** (`GEMINI_API_KEY`, default `gemini-2.0-flash`)
3. **Groq** (`GROQ_API_KEY`, default `llama-3.3-70b-versatile`)

Features: structured output (`jsonMode` → `responseMimeType`/JSON mode), retry, timeout, token usage + cost estimation, `extractJson` (strips markdown fences). Server secrets are never exposed to the frontend. Model names and endpoints are env-configurable. If no provider is configured, AI-gated routes return a clear configuration error; the rest of the app still runs (local demo mode).

## Evidence ledger (`evidence.ts`)

`classifyClaim(claim, signals)` is deterministic. Priority order: **contradicted > externally_verified > document_supported > founder_reported > modelled_assumption > unverified > unknown**. An assumption is never converted into a fact. Example from the spec: founder says "100 customers" — if only 12 are paying, the system records 12, not 100.

## Adversarial questioning (`questioning.ts`)

- `pickNextQuestion` — one unasked category at a time, then deepens the least-covered risk.
- `analyzeAnswer` — AI structured output; deterministic keyword fallback for evasiveness (`"I don't know"`, `"maybe"`, `"not sure"`…). Vague → low confidence + `evasive: true`.
- `generateFollowUp` — asks ONE precise follow-up on the biggest remaining gap; never praises.
- `detectContradiction` — rule-based numeric conflict detection on the same metric (e.g. "100 customers" vs "12 customers").

The loop: one question → answer → analyze → classify → detect contradiction → follow-up or next → per-persona cap (6) → next persona → finalize.

## Decision engine (`decision.ts`)

- `evaluatePersona` — per persona, scoped to its focus areas. Hard **NO** on critical/high findings or a matched rejection criterion; **MORE_DILIGENCE** on evidence gaps; **CONDITIONAL_YES** on medium findings; **YES** only with clean evidence. NO thresholds are not universal — criteria adapt to persona focus.
- `aggregateDecision` — combines the four verdicts. **YES is never the default.** Personas are allowed to disagree (VC: Conditional Yes, CFO: Pass, CTO: More Diligence, Specialist: Conditional Yes). Disagreement is preserved in the report. 2+ NO forces NO.

## Market intelligence (`market.ts`)

`marketResearch` / `searchWeb` use Tavily or Serper when configured. Every external claim carries a source URL and date. If no provider is available, claims are labeled **unverified** — never fabricated.

## Report (`report.ts`)

`buildReport` produces the 16-section evaluation report (executive summary, startup overview, business model, market, competitor, customer validation, product/technology, financial, founder, risk register, evidence ledger, investor-by-investor verdicts, committee decision, unanswered questions, reconsider conditions, next steps). It never invents investment amounts, valuations, revenue, customer counts, commitments or term sheets — where information is insufficient it states that a value cannot be determined, and it labels the whole output a simulated assessment.

## Orchestrator (`orchestrator.ts`)

`startMeeting` → `answerQuestion` → (loop) → `finalizeSession`. Persists questions/answers/messages/evidence/verdicts/decision/report. Meeting state is fully persisted so a refresh or return later does not lose the session.
