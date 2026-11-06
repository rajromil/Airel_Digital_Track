# Project Udyam Digital - Final Assumptions and Risks

## Approved design assumptions to disclose

| Topic | Classification |
|---|---|
| Midpoint of catalogue price range, rounded to INR | Proposed prototype policy; catalogue does not prescribe a price point |
| Maximum item install days for bundle estimate | Proposed planning rule, not a service-level promise |
| Tax omitted | Verified challenge ambiguity; no tax formula supplied |
| Active GSTIN required where catalogue says `Y` | Design interpretation; Cancelled/Suspended are not Active |
| `target_segments` used for recommendation relevance/ranking | Product relevance interpretation, not hard eligibility or legal availability |
| `requires_one_of` means at least one listed product in the same bundle | Direct interpretation of dependency documentation |
| Udyam `00` district and GSTIN `X` convention | Verified synthetic-data instructions |
| Address-proof freshness at 2026-07-15 | Verified challenge instruction; inclusive boundary is a proposed implementation choice |
| OCR fallback | Prototype demonstration mechanism, never authenticity proof |
| Segment mapping | Central mapping: Micro retail & services -> `micro`; Professional offices -> `prof`; Small multi-site -> `multi`; Small manufacturers -> `mfg` |
| Target segment mismatch | Relevance/ranking warning only; it is not a hard eligibility failure |
| Identifier matching | Keyed HMAC with external key version; reversible encryption only where explicitly required |
| Document retention | Prototype default: delete document bytes and OCR working data 30 days after terminal KYC decision or last activity; retain minimal audit tombstone |
| Setup-charge multiplication | Proposed prototype policy: catalogue setup charge is per unit, so `one_time_setup_inr * quantity`; source does not explicitly state commercial billing granularity |
| Prisma model source | No Prisma model exists before implementation; [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) is the authoritative Prisma-ready contract |

## Risks and mitigations

1. **Synthetic identifiers resemble real identifiers.** Mask, hash, restrict, and label challenge data.
2. **GST checksum interpretation may differ across synthetic records.** Test against supplied registry fixtures and treat exact mock-registry match as lookup authority after format validation.
3. **OCR misreads or planted KYC problems.** Preserve evidence states, confidence, comparisons, and manual review; never auto-verify from OCR alone.
4. **Missing/low-quality documents.** K05 missing Udyam and K04 low-quality GST are regression fixtures.
5. **Rule duplication.** Keep one backend evaluator and one pricing module; frontend is display-only for authoritative outcomes.
6. **Quote/order race conditions.** Use immutable snapshots, expiry, transactions, and idempotency.
7. **External service outage.** Provide deterministic LLM/OCR fallback and seed/reset demo path.
8. **Selection bias in historical metrics.** Present descriptive results only; do not claim causal uplift or validated propensity.
9. **Digital exclusion.** Retain partner/sales escalation and progressive, low-bandwidth screens.
10. **Prototype versus production confusion.** Mark mock registries, mock install/payment, synthetic documents, and non-production security boundaries.
11. **Raw registry exposure.** Store no raw registry snapshots; persist only HMAC, masked identifier, status, and minimum matched fields.

## Decisions requiring product approval

- Final retention duration and whether document deletion is automatic after KYC decision.
- Quote expiry (recommended: 24 hours for the demo).
- Primary KYC demo applicant and exact reviewer role.
- Whether a tax placeholder is wanted despite no supplied challenge rule; default is no tax line.
- Whether stretch dashboard work is permitted only after mandatory E2E tests pass; recommended default is yes.
- Whether production commercial terms confirm setup charges are per unit rather than per order.

## Acquisition-cost calculation

The reported cohort-level blended acquisition cost is **₹15,053.37 per activated customer**, calculated as:

`₹5,539,640 total acquisition cost across all 5,000 lead records / 368 activated customers = ₹15,053.37`.

This is a blended cost allocation across the full lead cohort divided by activated customers. It is distinct from the direct average of the `acquisition_cost_inr` field restricted to the 368 activated rows, which is not the case-brief blended metric.
