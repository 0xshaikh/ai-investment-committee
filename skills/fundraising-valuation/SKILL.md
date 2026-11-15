---
name: fundraising-valuation
description: Use when evaluating a funding ask and valuation. Checks ask sizing, price/dilution sanity, and comparable multiples — never inventing a valuation.
---

# Fundraising & Valuation

## Purpose
Pressure-test the funding ask and valuation for sanity — without inventing a valuation when information is insufficient.

## Inputs
- Funding ask (amount), equity offered (%), current revenue/run-rate (if stated).
- Stage, sector, comparable companies (if sourced).

## Checks
- Ask size vs stage and growth stage — is it sized to actually close?
- Price/dilution sanity: implied valuation from ask and equity offered; lead ownership (a lead under ~10% is a red flag).
- Comparable multiples vs stated valuation (only when comps are sourced).
- Current-month traction and recent hires shown — evidence, not projection.
- Timeline and use of funds.

## Decision rules
- **Never invent** valuation, investment amounts, or term sheets.
- If ask or equity is not stated, or comps are unavailable, say "valuation cannot be determined."
- A "great deal" begets questions, not interest — challenge cheap-looking asks.
- No competitor-round comps without a source.

## Outputs
`diligence_findings` (category `financial`) and a valuation statement that is either evidence-based or explicitly undetermined.

## Limitations
- Private comps are usually unavailable; valuation often cannot be determined.
- No term-sheet negotiation; the output is a simulated assessment.

## Evaluation criteria
- Ask size and dilution are checked against stated data.
- Valuation is stated only when evidence supports it; otherwise explicitly undetermined.
- No fabricated investment amounts, valuations, or funding offers.
