# Project Udyam Digital - Final Implementation Roadmap

No application implementation begins until this design is approved.

| ID | Task | Depends on | Acceptance criteria |
|---|---|---|---|
| T01 | Freeze source catalogue/registry imports | none | 25 products, 3,534 GST, and 2,723 Udyam rows imported with source hashes; source files remain read-only |
| T02 | Create monorepo/tooling/config | T01 | Vite/Express/Prisma/Zod/Pandas package boundaries, `.env.example`, no secrets |
| T03 | Add Prisma schema/migrations/seed | T01,T02 | Tables and constraints match [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md); repeatable reset/seed |
| T04 | Add auth/RBAC/error middleware | T02 | Session, roles, correlation IDs, common errors, masked logging |
| T05 | Normalize catalogue, segment mapping, and rule evaluator | T03 | Every product parses; hard rules, `TARGET_SEGMENT_MISMATCH` warnings, seven dependencies, and all reason codes are covered |
| T06 | Build recommendation API/UI | T04,T05 | RE-01 through RE-10 pass; exclusions are explainable |
| T07 | Build pricing engine | T03,T05 | All units, midpoint, dependencies, contracts, and PR-01 through PR-08 pass |
| T08 | Build quote UI/API | T04,T07 | Preview and immutable accepted quote agree on server/client totals |
| T09 | Build KYC consent/registry adapters | T03,T04 | GST/Udyam format/status scenarios KY-01 through KY-05 pass |
| T10 | Build document/OCR adapter and comparison | T09 | KY-06 through KY-12 pass; OCR never equals authenticity |
| T11 | Build order state machine/tracker | T03,T08,T10 | Only permitted transitions; timeline and expected date work |
| T12 | Integrate end-to-end customer journey | T06,T08,T11 | Known-good path completes without external services |
| T13 | Add responsive/accessibility/security hardening | T12 | Mobile, keyboard, masking, upload limits, safe errors, retention metadata |
| T14 | Add mandatory tests and demo reset | T12,T13 | Unit/integration/E2E report covers [TEST_COVERAGE_MATRIX.md](./TEST_COVERAGE_MATRIX.md); deterministic reset and fallback |
| T15 | Add stretch dashboard/propensity/voice | T14 | Only if mandatory path is green; historical versus proposed metrics labelled |
| T16 | Prepare submission artefacts | T14 | Deck <=10 slides, architecture, privacy note, demo script, README, test report |

## Test plan

### Unit

- Recommendation: each hard rule, all reason codes, seven dependencies, central segment mapping, target-segment warnings, and Active/Cancelled/Suspended GST handling.
- Pricing: every unit, midpoint rounding, quantity validation, setup/recurring totals, contract maximum, install maximum.
- KYC: GSTIN format/checksum/X convention, Udyam regex, normalization, date threshold, comparison, duplicate detection.
- KYC: every permitted and invalid transition for PENDING, IN_REVIEW, NEEDS_CORRECTION, and COMPLETED.
- Orders: every permitted and invalid transition for ORDER_CONFIRMED, INSTALLATION_SCHEDULED, INSTALLATION_COMPLETED, and ACTIVATED; creation blocked until quote acceptance and completed KYC.

### Integration

- Profile -> recommendation -> quote preserves profile and catalogue version.
- Quote acceptance -> KYC gate -> order creation enforces prerequisites.
- Registry adapters distinguish Active, Cancelled, Suspended, and not-found.
- Document processing stores metadata/status without exposing content.
- API errors have stable codes and no sensitive payload.

### End-to-end

1. Micro customer without GSTIN: P01/P07/P19 quote and tracker.
2. Professional tier-1 customer with active GSTIN: P03/P12/P16 quote.
3. Invalid dependency: P09 alone rejected.
4. KYC missing K05 Udyam and blurred K04 GST: manual review.
5. Correct KYC -> order -> scheduled -> completed -> activated.
6. Mobile viewport, English/Hindi switch, refresh persistence, external adapter unavailable.

## Exit gates

Mandatory modules, tests, safe fallback, and source-data seed must be green before stretch work. No feature is complete without a recorded test result.
