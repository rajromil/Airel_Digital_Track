# Consolidated Test Coverage Matrix

This matrix is the implementation acceptance baseline. All monetary assertions are integer INR and all catalogue assertions must run against the imported catalogue version.

## Recommendation engine

| ID | Fixture | Expected result |
|---|---|---|
| RE-01 | Tier 2, 1 employee, 1 site, `micro`, no GSTIN, P01 | Eligible |
| RE-02 | RE-01 with P03 | `CITY_TIER_UNAVAILABLE`, `EMPLOYEE_MINIMUM_NOT_MET`, `GSTIN_REQUIRED`; no segment failure |
| RE-03 | Tier 1, 5 employees, 1 site, `prof`, Active GSTIN, P03 | Eligible |
| RE-04 | Tier 2, 5 employees, 1 site, `prof`, Active GSTIN, P03 | `CITY_TIER_UNAVAILABLE` |
| RE-05 | Tier 1, 10 employees, 3 sites, `multi`, Active GSTIN, P10 + P02 | Eligible |
| RE-06 | RE-05 with P10 alone | `DEPENDENCY_NOT_MET` |
| RE-07 | Tier 1, 25 employees, 1 site, `mfg`, Active GSTIN, P06, contract 12 | `CONTRACT_TOO_SHORT`; 24 passes |
| RE-08 | Tier 1, 10 employees, 1 site, `mfg`, Suspended GSTIN, P05 | `GSTIN_REQUIRED` |
| RE-09 | Tier 2, 1 employee, 1 site, `micro`, no GSTIN, P19 | Eligible |
| RE-10 | Tier 1, 3 employees, 1 site, `prof`, Active GSTIN, P12 without base | `DEPENDENCY_NOT_MET`; P12 + P01 passes |
| RE-11 | Tier 2, 1 employee, 1 site, `mfg`, Active GSTIN, P14 | Eligible with `TARGET_SEGMENT_MISMATCH` warning |
| RE-12 | Tier 1, 25 employees, 1 site, `mfg`, Active GSTIN, P06, contract 12 | `CONTRACT_TOO_SHORT`; 24 passes |
| RE-13 | Tier 1, 25 employees, 1 site, `mfg`, Cancelled GSTIN, P06, contract 24 | `GSTIN_REQUIRED` |

The test suite must additionally enumerate all seven dependency products: P09, P10, P11, P12, P21, P22, and P23, with one passing and one missing-dependency fixture for each.

## Pricing engine

| ID | Assertion |
|---|---|
| PR-01 | P01 midpoint ₹1,099, quantity 2 => ₹2,198/month, ₹0 setup |
| PR-02 | P19 midpoint ₹749, quantity 2 => ₹1,498/month, ₹5,000 setup |
| PR-03 | P02 + P09, 3 sites => valid; P09 dependency satisfied; 12-month contract accepted |
| PR-04 | P09 alone => `DEPENDENCY_NOT_MET` |
| PR-05 | P06, 12 months => `CONTRACT_TOO_SHORT`; 24 months accepted |
| PR-06 | P01 + P10, 3 sites, no Active GSTIN => `GSTIN_REQUIRED` |
| PR-07 | Quantity 0, decimal, negative, or non-integer => validation error |
| PR-08 | P01 range 999/1199 => `Math.round(1099)` = ₹1,099 |
| PR-09 | P05 quantity 2 => setup ₹20,000, proving setup is multiplied per unit |
| PR-10 | Micro starter bundle => ₹2,546 recurring, ₹2,500 setup, 5-day estimate |
| PR-11 | Multi-site managed bundle => ₹15,594 recurring, ₹19,500 setup, 14-day estimate |
| PR-12 | Manufacturing security bundle => ₹14,489 recurring, ₹44,000 setup, 21-day estimate |

## KYC and privacy

| ID | Assertion |
|---|---|
| KY-01 | Valid registry GSTIN/checksum and Active status => eligible registry result |
| KY-02 | Valid-format GSTIN absent from registry => `NOT_FOUND` |
| KY-03 | Cancelled and Suspended GSTIN statuses are distinct and fail Active-GSTIN requirements |
| KY-04 | Udyam district code other than `00` => `FORMAT_INVALID` |
| KY-05 | Valid-format Udyam absent from registry => `NOT_FOUND` |
| KY-06 | K05 missing Udyam => `NEEDS_CORRECTION` |
| KY-07 | K04 blurred GST => unreadable/manual review and not `COMPLETED` |
| KY-08 | Address proof before 2026-04-16 => outdated/manual review |
| KY-09 | Duplicate document hash => correction/manual review |
| KY-10 | OCR/registry name mismatch => mismatch/manual review |
| KY-11 | No consent => no lookup, upload processing, or submission |
| KY-12 | Matching OCR remains extraction/comparison evidence, not authenticity proof |
| KY-13 | Recommendation input snapshot contains no raw identifiers, contacts, or OCR |
| KY-14 | Document view/download creates an access audit event without content |

## State and API integration

| ID | Assertion |
|---|---|
| ST-01 | KYC `PENDING -> IN_REVIEW` requires consent, required documents, and submission |
| ST-02 | KYC `IN_REVIEW -> NEEDS_CORRECTION` and correction resubmission are valid |
| ST-03 | Only approved `COMPLETED` KYC can authorize an order |
| ST-04 | Accepted, unexpired quote is required for order creation |
| ST-05 | Order transitions only `ORDER_CONFIRMED -> INSTALLATION_SCHEDULED -> INSTALLATION_COMPLETED -> ACTIVATED` |
| ST-06 | Invalid state transitions return a safe conflict error and create no event |
| ST-07 | Duplicate quote/order idempotency keys do not create duplicate records |
| ST-08 | Quote totals are recomputed transactionally from quote items |
| ST-09 | Business ownership, quote ownership, KYC ownership, and order ownership agree |
| ST-10 | API errors never include full identifiers, OCR, document content, or secrets |

