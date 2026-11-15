# Investor Skills

The investor intelligence engine is organized as a modular **skill architecture**. Each skill is a real, usable `SKILL.md` with a defined purpose, inputs, outputs, decision rules, limitations and evaluation criteria — not an empty placeholder.

## The 12 skill modules

| Skill | Purpose |
|---|---|
| `investor-persona-engine` | Define and drive the four fictional investor archetypes |
| `market-due-diligence` | Market size, growth, trends, structure, regulation, threats |
| `customer-discovery` | Real customer problem, willingness to pay, buying behaviour |
| `financial-due-diligence` | Revenue quality, margins, CAC/LTV, burn, runway, unit economics |
| `competitive-intelligence` | Direct/indirect/substitute competitors, pricing, features |
| `founder-evaluation` | Founder/team execution capability |
| `product-technology-diligence` | Feasibility, architecture, tech moat, scalability, security |
| `fundraising-valuation` | Capital requirements, valuation/dilution (never fabricated) |
| `adversarial-questioning` | One hard question at a time; challenge vague answers |
| `investment-decision-engine` | YES / NO / CONDITIONAL YES / MORE DILIGENCE; YES never default |
| `evidence-and-provenance` | Classify every claim; source URLs + dates; never assumption→fact |
| `contradiction-detection` | Detect contradictions between answers |

## The four fictional personas

Seeded in `supabase/migrations/0003_seed.sql` and mirrored in `lib/db/seed-data.ts`. Each has a **different thesis, priorities, risk tolerance, questioning strategy and rejection criteria** — they are not four names on one generic prompt.

1. **Venture Capital Partner** — venture-scale opportunity, TAM/SAM/SOM, market timing, growth, moat, distribution, scalability, exit, returns. High risk tolerance.
2. **Financial Investor / CFO** — revenue quality, gross margins, CAC, LTV, burn, runway, unit economics, projections, capital requirements, valuation and dilution. Low risk tolerance.
3. **Technical Investor / CTO** — feasibility, architecture, tech differentiation, scalability, tech debt, infra cost, security, dependencies, defensibility, engineering execution.
4. **Industry Specialist** — real customer problems, industry structure, existing alternatives, buying behaviour, distribution, regulations, industry economics, switching costs, willingness to pay.

> **The personas are fictional simulations.** They do not impersonate real investors and do not imply that any actual firm has evaluated the company.

## How skills are used

The orchestrator maps a persona to its questioning strategy (from `questioning_strategy_json`) and rejection criteria (`rejection_criteria_json`); the decision engine scopes findings to persona focus areas (`PERSONA_FOCUS`). The skill files are the human-readable reference for each capability; the code is the executable implementation.
