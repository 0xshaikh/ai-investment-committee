---
name: competitive-intelligence
description: Use when analyzing a startup's competitive position. Identifies direct, indirect, and substitute competitors with sourced pricing/features only.
---

# Competitive Intelligence

## Purpose
Establish who the real competitors are — including the spreadsheet, the freelancer, and the do-nothing option — and whether the startup has a defensible position.

## Inputs
- Startup sector, solution, pricing, target customer.
- Founder competitor claims.
- Configured search provider (optional).

## Analysis
- Direct competitors, indirect competitors, substitute products, existing customer solutions.
- Competitor pricing and features (only with a source or document; otherwise unverified).
- Differentiation: is the edge a wedge, a moat, or a slogan?
- Switching cost and lock-in for customers.

## Decision rules
- Name the actual alternatives the customer uses today, not just funded startups.
- If no source supports a competitor price/feature claim, label it unverified.
- "Category of one" claims are scrutinized — a category can still be crowded.
- A "secret" that is really category boilerplate is not a moat.

## Outputs
`diligence_findings` (category `market` / `strategy`) and `research_sources` for competitor claims.

## Limitations
- Private-company pricing is often unavailable; treat as unverified, not invented.
- Market share data is rarely reliable for early-stage startups.

## Evaluation criteria
- Competitors are concrete and named; substitutes included.
- Pricing/feature claims are sourced or labeled unverified.
- The startup's differentiation is challenged rather than accepted.
