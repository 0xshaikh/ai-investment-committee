---
name: product-technology-diligence
description: Use when evaluating whether the product can be built, scaled, and defended. Assesses architecture, technical moat, security, and dependencies.
---

# Product & Technology Diligence

## Purpose
Determine whether the product is feasible, differentiated, scalable, and secure — and whether the engineering can deliver it.

## Inputs
- Product description, architecture description (from deck or founder).
- Technical claims (differentiation, scalability, security, dependencies).
- Team engineering capacity.

## Assessment
- Architecture: main components and the hardest scaling constraint.
- Differentiation: is the edge code, data, a model, or an integration — and is it defensible?
- Scalability: what breaks first at 10x load (DB, third-party API, single service)?
- Security: what sensitive data is held, how is it protected, has a review been done?
- Dependencies: which critical third-party APIs/models/vendors, and the plan if one disappears or 10x prices.
- Engineering execution: seniority, headcount, retention plan.

## Decision rules
- No defensible technical capability, an unscalable architecture, unresolved security issues, or a single point of failure in a critical dependency are **high-severity** findings.
- Technical claims without architecture detail are unverified, not assumed.
- Infra cost estimates are modeled assumptions unless documented.

## Outputs
`diligence_findings` (category `product` / `team`).

## Limitations
- No codebase access or security audit; assessment is from stated description.
- Cannot verify actual scaling behavior.

## Evaluation criteria
- Architecture, differentiation, scalability, security, and dependencies are each assessed.
- High-severity technical findings surface as rejection/condition triggers.
