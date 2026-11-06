# Smart KYC Workflow

## Consent and data minimisation

Before any lookup or document processing, show purpose, fields requested, mock-integration status, retention/deletion explanation, and a required explicit consent action. Consent is versioned and tied to the KYC case. No consent means no lookup, OCR, or submission.

Required document types are `GST_CERTIFICATE`, `UDYAM_CERTIFICATE`, `SIGNATORY_ID`, and `ADDRESS_PROOF`; the product/order flow may mark registration documents conditionally required only when the selected products require them, but the demo should support all four.

## GSTIN validation

1. Normalize uppercase and remove surrounding whitespace; do not silently remove internal characters.
2. Validate exactly 15 alphanumeric characters.
3. Validate the first two characters as a numeric state code.
4. Validate the embedded PAN-shaped 10-character segment and accept the challenge's synthetic `X` entity-marker convention. Do not apply a real-taxpayer rejection based on the `X` marker.
5. Validate the 13th position as an alphanumeric registration/entity sequence, the 14th as `Z` under the supplied convention, and the 15th as a base-36 checksum.
6. Check the checksum using the standard GSTIN weighted base-36 algorithm (the 14-character payload is processed right-to-left with alternating factors; the complement modulo 36 must equal the final character). Unit fixtures must include identifiers from the supplied registry.
7. Look up the exact normalized value in `mock_gstin_registry.csv`.

Return separate results: `FORMAT_INVALID`, `NOT_FOUND`, `ACTIVE`, `SUSPENDED`, or `CANCELLED`. Only `ACTIVE` is a successful registry verification for products requiring GSTIN. The synthetic registry is not a live government source.

## Udyam validation

Accept only the challenge format:

`^UDYAM-[A-Z]{2}-00-[0-9]{7}$`

Normalize uppercase and whitespace around the value. The state segment must be two letters and district code must be literal `00`, as specified by the README. Look up the exact value in `mock_udyam_registry.csv`; return `FORMAT_INVALID`, `NOT_FOUND`, or `MATCHED`. Do not claim real Udyam authenticity.

## OCR and evidence states

The KYC case state machine is separate from the order state machine. KYC cases use exactly:

`PENDING -> IN_REVIEW -> NEEDS_CORRECTION -> IN_REVIEW -> COMPLETED`

Consent is recorded while the case remains `PENDING`. `PENDING -> IN_REVIEW` requires consent, required documents, and submission. `IN_REVIEW -> NEEDS_CORRECTION` is used for unresolved evidence problems. `NEEDS_CORRECTION -> IN_REVIEW` requires corrected evidence. `IN_REVIEW -> COMPLETED` requires all applicable checks to pass and no unresolved review reason. `COMPLETED` explicitly means successfully approved KYC. There is no `REJECTED` status in the prototype; a permanently failed or abandoned case remains `NEEDS_CORRECTION` and cannot authorize an order. An order is never represented by a KYC status.

Each document passes through:

1. `UPLOADED`: type/size/hash recorded.
2. `EXTRACTING`: OCR adapter or deterministic fallback running.
3. `EXTRACTED`: fields and confidence recorded; this is not verification.
4. `COMPARED`: fields compared with user profile and registry results.
5. `MANUAL_REVIEW`: low confidence, unreadable, missing, duplicate, mismatch, or contradictory evidence.
6. `ACCEPTED`: checks are internally consistent and required fields are present.

The deterministic fallback may use the known specimen metadata only for the demo and must be labelled `MOCK_EXTRACTION`. OCR extraction is evidence, never proof of document authenticity.

## Cross-document matching

Normalize names by case, whitespace, punctuation, and common business suffixes only for comparison; preserve originals for review. Compare:

- GST certificate legal/trade name against business name and GST registry legal/trade name.
- Udyam enterprise name against business name and Udyam registry name.
- Address proof name/address against entered business and GST principal place.
- Signatory ID name against the declared signatory and the GST legal name where available.
- GSTIN/Udyam identifiers in extracted text against entered values and registry values.
- Document dates against the 2026-07-15 reference.

Produce field-level results: `MATCH`, `MISMATCH`, `MISSING`, `UNREADABLE`, or `NOT_AVAILABLE`, with confidence and source (`USER`, `OCR`, `REGISTRY`).

## Date rule

Address proof is outdated when its issue/bill date is earlier than 2026-04-16 (90 days before 2026-07-15), subject to inclusive date handling documented in tests. Future-dated or unparseable dates go to manual review. Other certificate dates are consistency evidence, not automatically “expired” under the supplied instructions.

## Manual review triggers

Missing required document, duplicate hash/document type, OCR confidence below configured threshold, unreadable image (including the low-quality K04 specimen), name/address/identifier mismatch, invalid/cancelled/suspended registry status where active is required, outdated address proof, inconsistent dates, absent signatory evidence, or any failed checksum triggers `MANUAL_REVIEW` or correction. No rule may silently convert a contradiction to a pass.

## KYC acceptance

`COMPLETED` requires consent, all required documents, successful applicable registry checks, no unresolved mismatch/unreadable/outdated reason, and an explicit reviewer/system approval decision. Order creation must re-read the KYC row in the same transaction, require `status = COMPLETED`, and reject `PENDING`, `IN_REVIEW`, `NEEDS_CORRECTION`, or any future rejected status. Return a masked summary and KYC reference; never return full identifiers or raw OCR/document content in errors or logs.

## KYC test scenarios

| ID | Scenario | Expected |
|---|---|---|
| KY-01 | registry GSTIN, valid checksum, Active | format pass + Active |
| KY-02 | valid-format GSTIN absent from registry | `NOT_FOUND` |
| KY-03 | Cancelled/Suspended registry GSTIN | status returned; not accepted for GSTIN-required product |
| KY-04 | Udyam with district not `00` | `FORMAT_INVALID` |
| KY-05 | valid-format Udyam absent | `NOT_FOUND` |
| KY-06 | K05 | missing Udyam document/manual review |
| KY-07 | K04 blurred GST | unreadable/manual review |
| KY-08 | address proof before 2026-04-16 | outdated/manual review |
| KY-09 | duplicate upload hash | duplicate/manual review |
| KY-10 | OCR name differs from registry | mismatch/manual review |
| KY-11 | no consent | lookup/upload processing rejected |
| KY-12 | OCR extraction matches all registry fields | extracted + compared; still not authenticity proof |
