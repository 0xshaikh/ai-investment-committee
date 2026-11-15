---
name: market-due-diligence
description: Use when researching a startup's market before or during an investor meeting. Produces evidence-backed market assessment with source URLs and dates.
---

# Market Due Diligence

## Purpose
Establish an evidence-backed view of the market: size, growth, structure, and the startup's obtainable slice — without inventing statistics.

## Inputs
- Startup sector, target customer, geography, business model.
- Founder market claims (TAM / SAM / SOM, growth, demand).
- Configured search provider (Tavily / Serper) — optional.

## Research checklist
- Direct competitors, indirect competitors, substitute products, existing customer solutions.
- Competitor pricing and features (only when a source or document supports them).
- Market size and growth (label the level: industry total vs addressable vs obtainable).
- Customer demand signals, industry trends, distribution challenges, regulatory barriers, threats.

## Decision rules
- Every external claim needs a source URL **and** date; record both.
- If no search provider is configured or no source is found, label the claim **unverified/unknown** — never assume it is true.
- Separate "industry is $50B" from "your obtainable market is $X" — a broad figure is not an addressable market.
- Do not fabricate competitor prices, market statistics, or customer demand.

## Outputs
`research_sources` (url, title, retrieved_at, access_outcome, evidence_tier) and `evidence_records` (claim, classification).

## Limitations
- Depth is bounded by the search provider and rate limits; low-confidence claims stay unverified.
- No provider means market claims are labeled unknown, not researched.

## Evaluation criteria
- Each material market claim has a classification (verified / founder-reported / unverified / unknown).
- Sources are retrievable and dated.
- No fabricated statistics or competitor prices.
