# REST API Specification

Base path: `/api/v1`. JSON uses camelCase. All write requests require a correlation ID; quote/order writes also require `Idempotency-Key`.

## Authentication and authorization

Use an HTTP-only authenticated session. Customer routes require ownership of the business profile; partner routes require partner role and assigned lead/business scope; reviewer routes require `OPS_REVIEWER` or `ADMIN`. No anonymous route accepts KYC identifiers or documents.

## Common error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "fieldErrors": [{"field": "siteCount", "code": "MINIMUM", "message": "Must be at least 1."}],
    "correlationId": "req_123"
  }
}
```

Use 400 for malformed input, 401 unauthenticated, 403 unauthorized, 404 unknown resource, 409 state/idempotency/conflict, 422 business-rule rejection, and 429 rate limiting. Do not include full identifiers, raw OCR, document contents, stack traces, SQL, or object-store keys.

## Advisor/profile

`POST /advisor/sessions` (customer): `{locale:"en-IN"|"hi-IN", businessProfileId?}` -> `{sessionId, nextQuestion, profileDraft}`.

`POST /advisor/sessions/:id/messages` (customer): `{message:string}` -> `{reply, extractedProfileDelta, missingFields, completed}`. LLM output is schema-validated; unrecognized fields are ignored and critical values are revalidated.

`POST /business-profiles` (customer): profile fields -> `{id, profile, completeness}`. Zod checks counts, enum values, lengths, and spend.

## Recommendation and pricing

`POST /recommendations` (customer): `{businessProfileId, requestedProductIds?, requestedContractMonths?}` -> `{runId, catalogueVersion, eligible:[{productId, hardReasonCodes:[], warnings:[], relevanceScore, rank}], excluded:[{productId, hardReasonCodes:[], warnings:[], relevanceScore, rank}]}`. Target-segment mismatch is a warning; hard failures populate `hardReasonCodes`.

`POST /quotes/preview` (customer): `{businessProfileId, contractMonths, items:[{productId, quantity}]}` -> `{valid, errors, items:[QuoteLine], monthlyRecurringTotalInr, oneTimeSetupTotalInr, installEstimateDays, pricePolicy:"MIDPOINT_MATH_ROUND_POSITIVE_INR_SETUP_PER_UNIT"}`. It never persists an accepted quote.

`POST /quotes` (customer): same request plus optional recommendation run -> immutable `{quoteId, reference, status:"DRAFT", expiresAt, totals, items}`. Re-evaluates all rules in a transaction.

`POST /quotes/:id/accept` (customer): `{}` -> `{quoteId, status:"ACCEPTED", acceptedAt}`. Requires unexpired quote and ownership.

## KYC

`POST /kyc/cases` (customer): `{businessProfileId}` -> `{caseId, status:"PENDING"}`.

`POST /kyc/cases/:id/consent` (customer): `{purpose, policyVersion, granted:true}` -> `{consentId, status:"PENDING"}`. Consent authorizes processing but does not advance the case to `IN_REVIEW`; `granted:false` returns 422 and no processing occurs.

`POST /kyc/cases/:id/registry-checks` (customer): `{registry:"GSTIN"|"UDYAM", identifier:string}` -> `{formatStatus, lookupStatus, maskedIdentifier, status, matchedFields}`. Full identifiers are accepted only in the request body and never echoed.

`POST /kyc/cases/:id/documents` (customer, multipart): file plus `documentType` -> `{documentId, status:"UPLOADED", sha256Prefix}`. Validate MIME, size, type, duplicate hash, consent, and case ownership.

`GET /kyc/cases/:id/status` (customer/reviewer) -> field-level statuses and review reasons without raw OCR/document bytes.

`POST /kyc/cases/:id/submit` (customer): `{}` -> `{reference, status:"IN_REVIEW", nextAction}`. Submission is blocked by unresolved required failures.

`POST /kyc/cases/:id/review` (reviewer): `{decision:"ACCEPT"|"REQUEST_CORRECTION", reasonCodes?, noteCode?}` -> status `COMPLETED` for `ACCEPT` or `NEEDS_CORRECTION` for `REQUEST_CORRECTION`, plus an audit reference.

## Orders/tracker

`POST /orders` (customer): `{quoteId}` -> `{orderId, publicReference, status:"ORDER_CONFIRMED", expectedInstallDate}`. Requires an accepted, unexpired quote and a linked KYC case with status `COMPLETED`; use idempotency. There is no KYC status embedded in the order state.

`GET /orders/:id` (customer/reviewer) -> `{publicReference, maskedBusinessName, status, items, kycStatus, expectedInstallDate, timeline, nextAction}`.

`POST /orders/:id/events` (reviewer/admin/mock-ops): `{toStatus, noteCode}` -> `{status, event}`. Server verifies permitted transition and prerequisites.

## Catalogue and analytics

`GET /catalogue/active` (authenticated) -> normalized products without internal source paths.

`GET /analytics/funnel` (partner/reviewer) -> aggregate counts and rates from seeded challenge data; never returns KYC contents.
