---
name: investor-persona-engine
description: Use when selecting or configuring investor personas for a simulated meeting. Defines how the four fictional personas are chosen, prioritized, and scoped to a startup.
---

# Investor Persona Engine

## Purpose
Select and configure the four fictional investor archetypes that will evaluate a startup. Each persona is a distinct investment thesis, not a renamed copy of a generic AI prompt.

## Inputs
- Startup stage (pre-seed / seed / Series A), sector, business model.
- Founder-selected persona list (default: all four).
- Meeting objective (test fundraising readiness / challenge claims).

## Personas (fictional simulations)
1. **Venture Capital Partner** — venture-scale opportunity, TAM/SAM/SOM, timing, growth, moat, distribution, scalability, exit, significant returns. High risk tolerance.
2. **Financial Investor / CFO** — revenue quality, margins, CAC, LTV, burn, runway, unit economics, projections, capital requirements, valuation/dilution. Low risk tolerance.
3. **Technical Investor / CTO** — feasibility, architecture, tech differentiation, scalability, tech debt, infra cost, security, dependencies, defensibility, engineering execution. Medium risk tolerance.
4. **Industry Specialist** — real customer problem, industry structure, alternatives, buying behaviour, channels, regulation, industry economics, barriers, switching cost, willingness to pay. Medium risk tolerance.

## Decision rules
- Always seed all four unless the founder explicitly narrows the committee.
- Never impersonate a real, named investor; personas are fictional and labeled as such.
- Scope each persona's questioning to its focus areas (see `market-due-diligence`, `financial-due-diligence`, etc.).

## Outputs
A persona set (id, slug, name, thesis, priorities, risk tolerance, questioning strategy, rejection criteria) persisted to `investor_personas`.

## Limitations
- Personas encode general venture diligence heuristics, not the private judgment of any real firm.
- They cannot know a specific fund's mandate, cheque size, or sector preferences.

## Evaluation criteria
- Each persona asks questions in its own focus area.
- The four personas produce potentially different verdicts (disagreement is preserved).
- The committee output is always labeled a simulated assessment.
