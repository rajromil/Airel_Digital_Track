# Project Udyam Digital - Final Technical Architecture

## Decision summary

Use the proposed baseline: React + Vite + TypeScript, Tailwind CSS + shadcn/ui, Node.js + Express + TypeScript, PostgreSQL + Prisma, Zod, Python + Pandas for offline analysis, an OCR adapter with a deterministic fallback, and an LLM adapter for conversational extraction only.

There is no concrete blocker to this stack. The prototype should keep the frontend and API as separate packages, share Zod/domain types where practical, and keep recommendation, pricing, KYC comparison, and order transitions in backend/domain modules that can be unit tested without a browser or external service.

## System context

```text
MSME owner / sales partner
          |
          v
React/Vite mobile web app
          |
          v
Express API: auth, validation, rate limits, correlation IDs
          |
  +-------+--------+----------+-----------+------------+
  |                |          |           |            |
Profile/advisor  Catalogue  Recommend  Pricing       KYC
  |                |          |           |            |
  +----------------+----------+-----------+------------+
          |                 |             |
      PostgreSQL        mock registries  private document store
          |
   Orders / installation / audit / aggregate analytics
          |
   Sales and partner dashboard (stretch)
```

## Component responsibilities

- **React/Vite:** progressive profile conversation, recommendation cards, quote editor, consent/upload screens, tracker, bilingual labels, accessible states.
- **Express API:** authentication, authorization, Zod request validation, transaction boundaries, idempotency, consistent errors, rate limits, and audit events.
- **Advisor orchestration:** calls the LLM only for natural-language interaction and structured profile extraction. It cannot select an ineligible product or calculate a price.
- **Catalogue service:** imports and versions the 25 supplied products and normalizes semicolon/pipe-delimited fields.
- **Recommendation engine:** pure deterministic evaluation of rules in [RECOMMENDATION_RULES.md](./RECOMMENDATION_RULES.md).
- **Pricing engine:** pure deterministic quantity, midpoint, contract, dependency, and total calculations in [PRICING_RULES.md](./PRICING_RULES.md).
- **KYC service:** consent gate, identifier validation, mock registry lookup, OCR adapter, comparison, manual review, and submission reference in [KYC_WORKFLOW.md](./KYC_WORKFLOW.md).
- **Order service:** quote/KYC prerequisites and the state machine defined in this document.
- **Document storage adapter:** private local/object-store abstraction; only metadata and hashes are persisted in PostgreSQL.
- **Analytics:** aggregate lead/funnel reporting from `smb_leads.csv`; never expose document contents to reporting roles.

## Data flows

1. Advisor session creates a profile draft.
2. Profile completion invokes hard eligibility and relevance ranking with a catalogue version.
3. User edits quantities/add-ons; pricing preview revalidates the entire bundle.
4. Quote acceptance creates a quote snapshot, not a live recalculation.
5. Consent is recorded before registry lookup or document processing.
6. KYC checks return separate format, registry, extraction, comparison, and review states.
7. An order can be created only from an accepted, non-expired quote and KYC-completed case.
8. Installation events advance the order state through the validated order state machine.

## Rule ownership

The backend is authoritative for eligibility, pricing, KYC status, and order transitions. The frontend may show optimistic previews but must display the backend result. The LLM is non-authoritative. The CSV registries are mock adapters, not live government services.

## Security and reliability baseline

Use secure HTTP-only sessions (or short-lived access plus refresh tokens), RBAC (`CUSTOMER`, `PARTNER`, `OPS_REVIEWER`, `ADMIN`), Zod validation, request size/type limits, idempotency keys for quote/order writes, transactionally persisted state transitions, correlation IDs, masked identifiers, private document URLs, retention jobs, and audit events without raw document content. Do not log full GSTIN/Udyam values, OCR text, upload paths, or secrets. Registry matching uses a keyed HMAC with a separately managed key version, or envelope encryption where reversible values are strictly required.

External LLM/OCR calls require timeouts and bounded retries. A deterministic advisor and OCR fallback must preserve the demo when external services are unavailable.

## Separate KYC and order state machines

KYC statuses are `PENDING`, `IN_REVIEW`, `NEEDS_CORRECTION`, and `COMPLETED`.

| KYC from | KYC to | Preconditions |
|---|---|---|
| `PENDING` | `IN_REVIEW` | consent, required documents, and submission received |
| `IN_REVIEW` | `NEEDS_CORRECTION` | missing, unreadable, mismatched, outdated, or failed evidence |
| `NEEDS_CORRECTION` | `IN_REVIEW` | corrected evidence resubmitted |
| `IN_REVIEW` | `COMPLETED` | applicable registry checks pass and no unresolved review reason remains |

Order statuses are `ORDER_CONFIRMED`, `INSTALLATION_SCHEDULED`, `INSTALLATION_COMPLETED`, and `ACTIVATED`.

| Order from | Order to | Preconditions |
|---|---|---|
| `ORDER_CONFIRMED` | `INSTALLATION_SCHEDULED` | installation slot/date recorded |
| `INSTALLATION_SCHEDULED` | `INSTALLATION_COMPLETED` | installation completion event accepted |
| `INSTALLATION_COMPLETED` | `ACTIVATED` | all order items marked ready |

An order is created directly as `ORDER_CONFIRMED` only when the quote is accepted and unexpired and the linked KYC case is `COMPLETED`. There is no `KYC_PENDING` order state. No transition bypasses KYC or marks `ACTIVATED` before installation completion. An administrative cancellation/refund state may be added later but is outside the mandatory demo path.

## Mock versus production boundaries

Prototype-only: CSV registry adapters, synthetic KYC images, deterministic OCR fallback, simulated payment, mock technician/install events, and local object storage. Production replacement points require approved registry integrations, managed OCR with human review, secure object storage/KMS, payments, network provisioning, scheduling, monitoring, legal review, and DPDP governance.
