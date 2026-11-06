# Recommendation Engine Rules

## Inputs and normalization

The engine accepts a `CustomerContext`:

```text
cityTier: 1 | 2
employeeCount: integer >= 1
siteCount: integer >= 1
segment: micro | prof | multi | mfg
gstinStatus: absent | active | suspended | cancelled | not_found | invalid
requestedContractMonths: positive integer
requestedProductIds: optional product IDs
needSignals: optional structured tags
```

Normalize catalogue lists by splitting `available_city_tiers` on `;`, `target_segments` on `;`, and `requires_one_of` on `|`. Product IDs are case-sensitive canonical IDs `P01`-`P25`.

Normalize source/customer segment labels through this single mapping before rule evaluation:

| Source label | Canonical value |
|---|---|
| Micro retail & services | `micro` |
| Professional offices | `prof` |
| Small multi-site | `multi` |
| Small manufacturers | `mfg` |

Unknown or unmapped segment labels are validation errors, not an automatic `micro` fallback.

## Catalogue eligibility matrix

The following is the normalized source-of-truth matrix from `product_catalogue.csv`. A blank dependency means none; `Y` means an Active GSTIN is required.

| Product | City tiers | Min employees | Min sites | GSTIN | Target segments | Requires one of |
|---|---:|---:|---:|---|---|---|
| P01 | 1,2 | 1 | 1 | N | micro, prof | — |
| P02 | 1,2 | 1 | 1 | N | prof, multi | — |
| P03 | 1 | 5 | 1 | Y | prof, multi, mfg | — |
| P04 | 1,2 | 1 | 1 | N | micro, prof | — |
| P05 | 1,2 | 10 | 1 | Y | mfg, multi | — |
| P06 | 1,2 | 25 | 1 | Y | mfg | — |
| P07 | 1,2 | 1 | 1 | N | micro, prof, multi, mfg | — |
| P08 | 1,2 | 1 | 1 | N | prof, multi, mfg | — |
| P09 | 1,2 | 1 | 1 | N | multi, prof | P01/P02/P03/P05/P06 |
| P10 | 1,2 | 10 | 3 | Y | multi | P01/P02/P03/P05/P06 |
| P11 | 1,2 | 1 | 1 | N | prof, mfg | P01/P02/P03 |
| P12 | 1,2 | 3 | 1 | Y | prof, multi | P01/P02/P03/P04/P05/P06 |
| P13 | 1,2 | 1 | 1 | Y | multi, prof | — |
| P14 | 1,2 | 1 | 1 | Y | prof, multi, micro | — |
| P15 | 1,2 | 1 | 1 | Y | micro, prof, multi | — |
| P16 | 1,2 | 1 | 1 | N | prof, multi, mfg | — |
| P17 | 1,2 | 1 | 1 | N | prof, mfg | — |
| P18 | 1,2 | 1 | 1 | N | micro, prof | — |
| P19 | 1,2 | 1 | 1 | N | micro, multi | — |
| P20 | 1,2 | 1 | 1 | N | prof, mfg, multi | — |
| P21 | 1,2 | 10 | 1 | Y | mfg, multi, prof | P01/P02/P03/P05/P06 |
| P22 | 1,2 | 1 | 1 | N | micro, multi, prof | P01/P02/P03/P04 |
| P23 | 1,2 | 1 | 1 | N | micro, multi, mfg | P01/P02/P03/P04/P05/P06 |
| P24 | 1,2 | 10 | 1 | Y | mfg | — |
| P25 | 1,2 | 1 | 1 | N | multi, mfg | — |

## Hard eligibility and relevance

Hard eligibility determines whether a product can be included in a purchasable bundle. It enforces only city tier, minimum employees, minimum sites, Active GSTIN where `requires_gstin = Y`, product dependency presence in the same bundle, and requested contract duration.

`target_segments` is not a hard eligibility gate. It primarily controls recommendation relevance/ranking. A product whose hard rules pass but whose target segment does not contain the normalized customer segment remains `eligible: true`, receives a `TARGET_SEGMENT_MISMATCH` warning, and is ranked below matching products. It may be shown with an explanatory “outside primary target segment” label. The quote engine may include it if the customer explicitly selects it and all hard rules pass.

## Exact evaluation order

For each product, evaluate in this order and return all failed reason codes:

1. `PRODUCT_UNKNOWN` if the product ID is not in the active catalogue version.
2. `CITY_TIER_UNAVAILABLE` if `cityTier` is not in `available_city_tiers`.
3. `EMPLOYEE_MINIMUM_NOT_MET` if `employeeCount < min_employees`.
4. `SITE_MINIMUM_NOT_MET` if `siteCount < min_sites`.
5. `GSTIN_REQUIRED` if `requires_gstin = Y` and `gstinStatus != active`.
6. `CONTRACT_TOO_SHORT` if a requested contract is supplied and it is below `min_contract_months`.
7. `DEPENDENCY_NOT_MET` if `requires_one_of` is nonempty and the bundle contains none of those product IDs.

The engine returns `eligible = true` when no hard reason code exists. For a recommendation candidate without a requested bundle, dependency products are not automatically treated as present: the engine recommends the prerequisite first or returns `DEPENDENCY_NOT_MET` with the prerequisite IDs. A dependency warning is not permitted to be bypassed in a final bundle.

Add `TARGET_SEGMENT_MISMATCH` to `warnings`, not `reasons`, when the normalized customer segment is outside `target_segments`. This is not a legal or network availability restriction.

GSTIN requirement means a registry lookup must return `Active`; merely having a syntactically valid or user-entered GSTIN is insufficient. Products with `requires_gstin = N` remain eligible without GSTIN.

## Reason code contract

```json
{
  "productId": "P14",
  "eligible": true,
  "reasons": [],
  "warnings": [
    {"code": "TARGET_SEGMENT_MISMATCH", "message": "This product is primarily targeted at professional, multi-site, and micro businesses.", "details": {"customerSegment": "mfg", "targetSegments": ["prof", "multi", "micro"]}}
  ],
  "relevanceScore": 0.6
}
```

Messages are localized presentation; codes/details are stable API data. `relevanceScore` is an explainable ranking value, not a propensity probability.

## Catalogue-derived examples

- A tier-2, 2-employee, 1-site, micro customer without GSTIN can buy P01, P04, P07, P18, P19, and other products whose hard rules pass. P14 fails `GSTIN_REQUIRED` before any target-segment warning is considered. P03/P05/P06/P10/P12/P13/P15/P21/P24 fail hard employee, site, GSTIN, or dependency rules as applicable.
- A tier-1, 25-employee, 3-site, mfg customer with active GSTIN can hard-qualify for P03, P05, P06, P07, P08, P10, P11 (with a base), P16, P17, P20, P21 (with a base), P23 (with a base), P24, and P25. Products outside the mfg target list receive warnings rather than automatic exclusion.
- P09 requires at least one of P01, P02, P03, P05, or P06 in the same bundle; P04 alone does not satisfy it.
- P22 requires one of P01, P02, P03, or P04; P04 alone does satisfy it, while P05/P06 alone do not.
- The seven catalogue dependency rules are exactly P09, P10, P11, P12, P21, P22, and P23; each requires at least one listed product in the same bundle.

## Test scenarios

| ID | Context/bundle | Expected |
|---|---|---|
| RE-01 | tier 2, 1 employee, 1 site, micro, no GSTIN; P01 | eligible |
| RE-02 | same as RE-01; P03 | hard failures: `CITY_TIER_UNAVAILABLE`, `EMPLOYEE_MINIMUM_NOT_MET`, `GSTIN_REQUIRED`; no segment hard failure |
| RE-03 | tier 1, 5 employees, 1 site, prof, active GSTIN; P03 | eligible |
| RE-04 | tier 2, 5 employees, 1 site, prof, active GSTIN; P03 | `CITY_TIER_UNAVAILABLE` |
| RE-05 | tier 1, 10 employees, 3 sites, multi, active GSTIN; P10 + P02 | eligible |
| RE-06 | same as RE-05; P10 alone | `DEPENDENCY_NOT_MET` |
| RE-07 | tier 1, 25 employees, 1 site, mfg, active GSTIN; P06, contract 12 | `CONTRACT_TOO_SHORT` |
| RE-08 | tier 1, 10 employees, 1 site, mfg, suspended GSTIN; P05 | `GSTIN_REQUIRED` |
| RE-09 | tier 2, 1 employee, 1 site, micro, absent GSTIN; P19 | eligible |
| RE-10 | tier 1, 3 employees, 1 site, prof, active GSTIN; P12 without base | `DEPENDENCY_NOT_MET`; with P01, eligible |
| RE-11 | tier 2, 1 employee, 1 site, mfg, active GSTIN; P14 | eligible with `TARGET_SEGMENT_MISMATCH` warning |
| RE-12 | tier 1, 25 employees, 1 site, mfg, active GSTIN; P06, contract 12 | `CONTRACT_TOO_SHORT`; contract 24 passes |
| RE-13 | tier 1, 25 employees, 1 site, mfg, cancelled GSTIN; P06, contract 24 | `GSTIN_REQUIRED` |
