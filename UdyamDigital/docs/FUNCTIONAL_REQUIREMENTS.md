# Project Udyam Digital - Final Functional Requirements

`MUST` is mandatory for the prototype; `SHOULD` is expected unless explicitly deferred; `MAY` is stretch.

## Customer journey

1. MUST support English and Hindi, with an extensible locale model.
2. MUST progressively collect only the profile fields needed for recommendation: business type/segment, employees, sites, city/tier, state, current setup/spend, needs, language, contract preference, and registrations.
3. MUST pass the structured profile directly to recommendation and quote.
4. MUST show accessible validation, loading, empty, error, and success states.

## Recommendation

1. MUST use the supplied catalogue as the only product/rule source.
2. MUST enforce city tier, employees, sites, Active GSTIN, minimum contract, unit quantity, and dependency rules as hard rules.
3. MUST use the central segment mapping and return target-segment relevance warnings without rejecting an otherwise hard-eligible product.
4. MUST not allow an LLM to decide eligibility or pricing.

## Quote

1. MUST calculate all recurring and setup totals on the backend.
2. MUST support every catalogue unit and explicit quantities.
3. MUST disclose midpoint pricing, minimum contract, dependencies, and installation estimate.
4. MUST reject an invalid bundle rather than silently dropping an item.
5. MUST produce an immutable quote snapshot and reference.

## KYC

1. MUST obtain explicit consent before lookup or document processing.
2. MUST implement synthetic GSTIN/Udyam format checks, local mock lookups, status distinctions, OCR extraction, comparison, missing/duplicate/unreadable/outdated/mismatch states, manual review, and a submission reference.
3. MUST use 2026-07-15 as the reference date and flag address proof older than 90 days.
4. MUST distinguish extraction from registry matching and verification; OCR never proves authenticity.

## Order tracking

1. MUST implement separate KYC and order state machines in [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md).
2. MUST create orders only after KYC is `COMPLETED` and a quote is accepted and unexpired.
3. MUST show order ID, masked business, products, KYC, installation, expected date, activation, timestamps, and escalation.
4. MUST calculate expected readiness from catalogue installation days using the declared maximum rule.

## Security and privacy

MUST enforce RBAC, masked identifiers, private document access, input validation, safe errors, retention/deletion metadata, audit events without raw documents, and explicit mock-integration labels. No regulatory certification or live government verification may be claimed.

## Stretch

MAY add a partner/sales dashboard based on actual leads, explainable non-validated propensity scoring, voice, or WhatsApp only after the mandatory journey and tests pass.
