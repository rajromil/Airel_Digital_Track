# Pricing Engine Rules

## Price policy

The catalogue supplies a minimum and maximum monthly price but no selection rule. The prototype uses the disclosed midpoint. Because all catalogue values are positive INR amounts, midpoint rounding is explicitly JavaScript `Math.round()` semantics:

`unitMonthlyPrice = Math.round((price_min_inr_per_month + price_max_inr_per_month) / 2)`

All amounts are integer INR. There are no invented discounts or taxes. Tax is omitted because the challenge does not specify tax treatment. A future tax line must be separately configured and labelled.

## Setup-charge assumption

`one_time_setup_inr` is treated as a per-unit setup charge because the catalogue supplies a setup amount alongside a unit, and quantity-aware quote calculation is required. Therefore:

`itemSetup = one_time_setup_inr * quantity`

This is a prototype assumption, not an explicit commercial billing statement in the source catalogue. It is applied consistently to every product and must be disclosed in the quote.

## Quantity by unit

| Catalogue unit | Quantity meaning | Validation |
|---|---|---|
| `per site` | number of sites | integer >= `min_sites`; default profile site count |
| `per line` | business mobile lines | integer >= 1; user supplied |
| `per IP` | static IP addresses | integer >= 1 |
| `per channel` | SIP channels | integer >= 1 |
| `per number` | toll-free numbers | integer >= 1 |
| `per pack` | SMS packs | integer >= 1 |
| `per account` | accounts/channels | integer >= 1 |
| `per user` | named users | integer >= 1; default employee count only when user confirms |
| `per counter` | POS counters | integer >= 1 |
| `per device` | secured/IoT devices | integer >= 1 |
| `per camera` | CCTV cameras | integer >= 1 |
| `per vehicle` | tracked vehicles | integer >= 1 |

For every item, `quantity`, `unit`, and product ID are persisted in the quote snapshot. No implicit multiplication is allowed.

## Totals

For each item:

```text
recurring = unitMonthlyPrice * quantity
setup = one_time_setup_inr * quantity
```

Quote totals:

```text
monthlyRecurringTotal = sum(item.recurring)
oneTimeSetupTotal = sum(item.setup)
firstMonthBeforeTax = monthlyRecurringTotal + oneTimeSetupTotal
```

The quote displays monthly recurring and one-time setup separately. A current-spend comparison is shown only when the customer supplies `monthly_telecom_spend_inr`; it is a comparison, not a guaranteed saving.

## Contracts and dependencies

The quote contract must be an integer number of months and must be at least the maximum `min_contract_months` among items. The quote may not contain products whose dependencies are absent from the same bundle. Eligibility is re-evaluated against the final profile and final item set before quote creation and again before order creation.

## Installation estimate

The proposed prototype rule is the maximum `typical_install_days` among quote items. It is a planning estimate, not a service-level promise. Items with `typical_install_days = 1` can still be held by a slower item in the same order.

## Sample calculations from the actual catalogue

### Micro starter bundle

P01 midpoint = (999+1199)/2 = ₹1,099, quantity 1 site, setup ₹0.  
P07 midpoint = (299+399)/2 = ₹349, quantity 2 lines, setup ₹0.  
P19 midpoint = (599+899)/2 = ₹749, quantity 1 counter, setup ₹2,500.  

**Monthly recurring:** ₹1,099 + (₹349×2) + ₹749 = **₹2,546**.  
**One-time setup:** **₹2,500**.  
**Minimum contract:** 12 months. **Install estimate:** max(5,1,3) = 5 days.

### Multi-site managed bundle

P02 midpoint ₹1,649 × 3 sites = ₹4,947/month, setup ₹0.  
P09 midpoint ₹549 × 3 sites = ₹1,647/month, setup ₹4,500.  
P10 midpoint ₹3,000 × 3 sites = ₹9,000/month, setup ₹15,000.  

**Monthly recurring:** **₹15,594**. **One-time setup:** **₹19,500**.  
**Minimum contract:** 24 months. **Install estimate:** 14 days.  
P09 and P10 are valid because P02 is in the same bundle.

### Manufacturing security bundle

P05 midpoint ₹10,000 × 1 site = ₹10,000/month, setup ₹10,000.  
P21 midpoint ₹2,499 × 1 site = ₹2,499/month, setup ₹4,000.  
P24 midpoint ₹199 × 10 devices = ₹1,990/month, setup ₹30,000.  

**Monthly recurring:** **₹14,489**. **One-time setup:** **₹44,000**.  
**Minimum contract:** 24 months. **Install estimate:** 21 days.  
P21 is valid because P05 satisfies its dependency.

## Pricing test scenarios

| ID | Input | Expected |
|---|---|---|
| PR-01 | P01 quantity 2 | ₹2,198 monthly, ₹0 setup |
| PR-02 | P19 quantity 2 | ₹1,498 monthly, ₹5,000 setup |
| PR-03 | P02 + P09, 3 sites | valid; P09 dependency satisfied; 12-month contract accepted |
| PR-04 | P09 alone | rejected with `DEPENDENCY_NOT_MET` |
| PR-05 | P06 with 12-month contract | rejected with `CONTRACT_TOO_SHORT` because catalogue `min_contract_months=24`; 24 accepted |
| PR-06 | P01 + P10, 3 sites, no active GSTIN | rejected because P10 requires active GSTIN |
| PR-07 | quote preview quantity 0, decimal, or negative | 400 validation error |
| PR-08 | min/max range 999/1199 | midpoint ₹1,099 and disclosed rounding |
