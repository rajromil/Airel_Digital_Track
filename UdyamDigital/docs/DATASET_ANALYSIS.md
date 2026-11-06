# Project Udyam Digital - Dataset Analysis

## Files and archive inventory

The workspace contains:

- `source/Airtel_digitrack.zip`, containing two nested challenge archives and macOS metadata entries.
- `source/extracted/6ad9d4887d445_airtel_sync.zip`, containing the case PDF and PowerPoint template.
- `source/extracted/YTL_TrackA_Udyam_Digital_Data.zip`, containing the README, four CSVs, and the KYC directory.
- Expanded working copies under `source/case_package/` and `source/data_package/`.
- `source/case_package/__MACOSX/` and `source/extracted/__MACOSX/` metadata sidecars. These are not business data.

No judges-only archive was supplied in the workspace. The official PDF says that such a pack exists separately and must not be shared.

## CSV schema and quality

### `smb_leads.csv`

5,000 rows and 40 columns; unique `lead_id`, no duplicate values detected in `lead_id`, `gstin`, or `udyam_number` among nonblank values.

Identity/profile fields: `lead_id`, `created_date`, `business_name`, `business_type`, `segment`, `city`, `city_tier`, `state`, `preferred_language`, `contact_name`, `contact_role`.

Size and registration: `employee_count`, `num_sites`, `annual_turnover_band`, `has_gstin`, `gstin`, `has_udyam`, `udyam_number`.

Need/current state: `lead_source`, `current_internet`, `current_provider`, `monthly_telecom_spend_inr`, `products_of_interest`.

Funnel/outcome: `stage_reached`, `outcome`, `drop_reason`, `contacted_date`, `needs_assessed_date`, `quote_accepted_date`, `kyc_complete_date`, `activated_date`.

Activation outcomes: `days_lead_to_activation`, `customer_follow_up_calls`, `bundle_products`, `monthly_bundle_value_inr`, `one_time_setup_inr`, `contract_months`, `churned_within_6_months`, `nps_score`, `acquisition_cost_inr`.

Blankness is structurally meaningful: stage dates and activated-only metrics are blank before the corresponding stage. Activated-only fields are populated for 368 rows. `customer_follow_up_calls` and `acquisition_cost_inr` are populated for all 5,000 rows.

Date range: created dates are 2026-04-01 to 2026-06-30; later stage dates extend to 2026-07-26. The case therefore describes an Apr-Jun acquisition cohort with post-quarter progression.

Key distributions: 2,578 tier-1 and 2,422 tier-2 leads; 3,534 have GSTIN and 2,723 have Udyam. Preferred languages include Hindi (2,137), English (1,168), Marathi (505), Kannada (253), Gujarati (233), Telugu (207), Tamil (207), Bengali (111), Punjabi (96), and Malayalam (83).

### `product_catalogue.csv`

25 rows and 16 fully populated columns:

`product_id`, `category`, `product_name`, `description`, `unit`, `price_min_inr_per_month`, `price_max_inr_per_month`, `one_time_setup_inr`, `min_contract_months`, `available_city_tiers`, `min_employees`, `min_sites`, `requires_gstin`, `requires_one_of`, `typical_install_days`, `target_segments`.

Categories are Connectivity, Communication, Cloud & Productivity, Security, and IoT & Physical. Prices are ranges, not single prices. Seven products declare dependencies in `requires_one_of`, using `|` as the separator. Units include per site, per line, per IP, per channel, per number, per pack, per user, per account, per counter, per device, per camera, and per vehicle.

### `mock_gstin_registry.csv`

3,534 unique rows and 8 columns: `gstin`, `legal_name`, `trade_name`, `constitution`, `principal_place_of_business`, `state`, `registration_date`, `status`.

Status counts: Active 3,266; Cancelled 167; Suspended 101. All GSTINs are nonblank and unique. The README says they follow a 15-character/checksum-like structure but use synthetic embedded PAN entity marker `X`; validators must accept this challenge convention and still require registry matching for verification.

### `mock_udyam_registry.csv`

2,723 unique rows and 8 columns: `udyam_number`, `enterprise_name`, `enterprise_type`, `major_activity`, `nic_description`, `state`, `city`, `date_of_registration`.

The README says synthetic Udyam numbers use district code `00`, which does not exist in the real system. They must be validated against the challenge convention and local registry, not treated as live government verification.

### `README.md`

The README documents synthetic-data status, row counts, field meanings, eligibility fields, the 2026-07-15 reference date, privacy expectations, and the initial funnel summary.

## Verified business metrics

- Funnel: 5,000 -> 3,406 -> 1,974 -> 861 -> 588 -> 368.
- Overall activation: 7.36%.
- Average activated lead-to-activation time: 17.6168 days.
- Average follow-up calls among activated: 3.0109.
- Activated monthly value: average ₹12,350.52; median ₹6,900.
- Activated one-time setup: average ₹13,879.08.
- Activated NPS: average 6.8614/10.
- Six-month churn: 56 yes, 312 no, among 368 activated (15.22% churned).
- Recorded acquisition cost: ₹5,539,640 total across all rows; do not label this as the case's blended per-activation cost without a defined allocation method.

## Interpretation limits

### Acquisition-cost denominator

The cohort-level blended acquisition cost is **₹15,053.37 per activated customer**:

`₹5,539,640 total acquisition_cost_inr across all 5,000 leads / 368 activated customers = ₹15,053.37`.

The denominator is the 368 rows with a populated `activated_date`. This is a cohort allocation, not the arithmetic average of acquisition cost values only among activated rows.

The dataset is synthetic and observational. It supports descriptive baselines and hypotheses, not causal claims, production model validation, TAM/SAM/SOM, profitability, or regulatory conclusions. The data does not provide a reliable experiment/control design, post-activation revenue beyond available bundle fields, support cost, network feasibility, or true field-force capacity.
