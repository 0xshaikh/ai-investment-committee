---
name: financial-due-diligence
description: Use when evaluating a startup's financials and unit economics. Distinguishes measured figures from modelled assumptions; never invents revenue or valuation.
---

# Financial Due Diligence

## Purpose
Assess revenue quality, unit economics, burn, runway, projections, capital requirements, and valuation sanity — without inventing figures.

## Inputs
- Financial documents (uploaded) and founder-stated metrics.
- Pricing, CAC, LTV, gross margin, churn, burn, runway, funding ask, equity offered.

## What to challenge
- CAC / LTV / payback: measured from data or modelled? Show inputs.
- Recurring vs one-time revenue; churn; renewal counts.
- Monthly burn and runway at current burn; conservative runway.
- Projection assumptions — the three that matter most and how to falsify them.
- Valuation: what multiple does the ask imply vs comparable companies?
- Dilution: post-money ownership asked of the lead; option-pool effect.

## Decision rules
- **Never invent** revenue, valuation, investment amounts, or customer counts.
- If information is insufficient, state: "valuation / investment terms cannot be determined."
- Label metrics as measured vs modelled (`financial_metrics.source_type`).
- Flag negative gross margin, unit economics that never recover CAC, burn without a breakeven path.

## Outputs
`financial_metrics` rows and `diligence_findings` (category `financial`).

## Limitations
- Financials are founder-reported or document-supported unless externally verified.
- No access to accounting systems or bank statements.

## Evaluation criteria
- Every financial figure is labeled measured or modelled.
- No fabricated revenue, valuation, or funding amounts.
- Capital requirements and dilution are challenged, not accepted.
