# Testing

**Nothing is marked complete without testing.** Test strategy: unit (pure engine logic) + integration (API/DB flow) + a live end-to-end journey against the running production build.

## Unit tests (vitest)

`tests/unit/*.test.ts` — 32 tests, all passing (`npx vitest run`):

- **evidence.test.ts (11)** — `classifyClaim` priority (contradicted > externally_verified > document_supported > founder_reported > modelled_assumption > unverified > unknown), assumption never becomes fact, `claimToSearchQuery`, `summarizeEvidence`.
- **decision.test.ts (12)** — `evaluatePersona` hard NO on critical finding / rejection criterion, MORE_DILIGENCE on gaps (never NO/YES), CONDITIONAL_YES on medium findings, YES only with clean evidence; `aggregateDecision` never defaults to YES, single hard NO among majority-positive → not YES (mixed), 2+ NO forces NO, disagreement preserved.
- **questioning.test.ts (9)** — `pickNextQuestion` bank order + deepen, `detectContradiction` numeric conflict, `analyzeAnswer` deterministic evasiveness fallback (no fake AI).

## Integration tests

Covered by the live API end-to-end against `npm start` (production build, local adapter): auth (signup/me/login), startup CRUD (owner-scoped), session create + start (real AI question generation), answer + follow-up (real AI), persistence. Supabase adapter methods are implemented but **not executed against a live Supabase project** (no credentials in this environment) — honestly noted, not faked.

## End-to-end journey (verified live)

1. Homepage `/` 200 ✓
2. `/login`, `/signup`, `/about`, `/terms`, `/privacy`, `/disclaimer` 200 ✓
3. Sign up → token → `/api/auth/me` ✓
4. Create startup ✓
5. Start meeting → 4 personas + first adversarial question (real AI) ✓
6. Answer → follow-up question (real AI) ✓
7. Meeting loop terminates under the per-persona cap (verified: persona advances at 6 questions) ✓

## Investor intelligence scenarios

The synthetic scenarios (strong/weak/no-revenue/fabricated-traction/contradictory/TAM/competitive/regulated/technical-risk/evasive-founder) are exercised through the deterministic engine functions in unit tests — e.g. a founder claiming 100 customers with 12 paying is classified as contradicted/12-not-100. These are **synthetic tests, not proof of real-world investor accuracy** (spec §13).

## Production checks

- `npx tsc --noEmit` — clean (strict mode on).
- `npm run build` — succeeds (21 routes).
- `npx vitest run` — 32/32 pass.
- ESLint — `next lint` available via the scaffold; errors would be fixed, not suppressed. TypeScript strictness and tests are never disabled to force a green build.

## Results summary

| Check | Result |
|---|---|
| TypeScript (`tsc --noEmit`) | ✅ clean |
| Production build | ✅ 21 routes |
| Unit tests | ✅ 32/32 |
| Live API e2e (auth→startup→meeting→answer) | ✅ real AI |
| Live production deploy | ⛔ blocked — needs Supabase + Vercel credentials |
