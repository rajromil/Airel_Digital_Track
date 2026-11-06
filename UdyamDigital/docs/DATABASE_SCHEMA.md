# PostgreSQL Database Schema

Use PostgreSQL with Prisma migrations. No Prisma model file exists yet; this document is the authoritative Prisma-ready contract for implementation. All primary keys are UUIDs unless noted. Timestamps are `timestamptz`; every monetary column uses integer INR, never paise, decimals, or floating point.

## Tables

### `users`

`id PK`, `role` (`CUSTOMER|PARTNER|OPS_REVIEWER|ADMIN`), `phone_hash`, `email_hash`, `created_at`, `updated_at`, `disabled_at`.

Indexes: unique `(phone_hash)` where non-null, `(role)`.

### `business_profiles`

`id PK`, `owner_user_id FK users`, `business_name`, `business_type`, `segment`, `city`, `city_tier`, `state`, `preferred_language`, `employee_count`, `site_count`, `annual_turnover_band`, `current_internet`, `current_provider`, `monthly_telecom_spend_inr`, `has_gstin`, `has_udyam`, `created_at`, `updated_at`.

Checks: employee/site counts >= 1; city tier in 1/2; segment in `micro|prof|multi|mfg`; spend >= 0 when present. Index `(segment, city_tier)`, `(owner_user_id)`.

### `consents`

`id PK`, `business_id FK`, `purpose`, `policy_version`, `granted`, `granted_at`, `withdrawn_at`, `actor_user_id FK`, `ip_hash`, `user_agent_hash`.

Consent history is append-only: do not update or delete a consent event. Do not use a uniqueness constraint involving `granted_at`, because repeated grants, withdrawals, and policy versions are valid history. Index `(business_id, purpose, granted_at desc)`. Current valid consent is the latest event for `(business_id, purpose)` where `granted = true`, `withdrawn_at IS NULL`, and `policy_version` is accepted by the current policy; a later withdrawal invalidates prior consent. The consent service determines this in a transaction.

### `catalogue_versions` and `products`

`catalogue_versions(id PK, source_name, source_hash, imported_at, active)`; `products(id PK, catalogue_version_id FK, product_code, category, name, description, unit, price_min_inr, price_max_inr, setup_inr, min_contract_months, available_city_tiers text[], min_employees, min_sites, requires_gstin, requires_one_of text[], typical_install_days, target_segments text[], active)`.

Row-level checks: prices/setup >= 0, min contract/employees/sites/install days >= 1, and min <= max. Unique constraint: `UNIQUE(catalogue_version_id, product_code)`. Partial unique index: `CREATE UNIQUE INDEX one_active_catalogue_version ON catalogue_versions ((active)) WHERE active = true`; this permits at most one active catalogue version. Index `(catalogue_version_id, active)`, `(product_code)`.

### `recommendation_runs` and `recommendation_items`

`recommendation_runs(id PK, business_id FK, catalogue_version_id FK, input_snapshot jsonb, created_at)`; `recommendation_items(id PK, run_id FK, product_id FK, eligible, hard_reason_codes text[], warnings text[], reason_details jsonb, relevance_score numeric(5,4), rank, created_at)`. `input_snapshot` may contain only normalized `cityTier`, `employeeCount`, `siteCount`, canonical `segment`, GSTIN status category (`absent|active|suspended|cancelled|not_found|invalid`), requested contract months, normalized need tags, and catalogue version. It must not contain raw identifiers, names, phone/email/contact data, addresses, document references, or OCR text.

Index `(business_id, created_at desc)`, `(run_id, eligible)`.

### `quotes` and `quote_items`

`quotes(id PK, business_id FK, recommendation_run_id FK nullable, status, contract_months, monthly_total_inr, setup_total_inr, currency, price_policy, catalogue_version_id FK, expires_at, accepted_at, created_at)`.

`quote_items(id PK, quote_id FK, product_id FK, product_code_snapshot, product_name_snapshot, unit_snapshot, quantity, unit_monthly_price_inr, setup_unit_price_inr, recurring_total_inr, setup_total_inr, min_contract_months, dependencies_snapshot jsonb)`.

Row-level checks: quantity integer >= 1; item prices and totals are nonnegative; contract months is a positive integer. Quote totals are not an ordinary row-level `CHECK`: the quote service calculates them from quote items in a transaction and persists the resulting integer totals. Index `(business_id, created_at desc)`, `(status, expires_at)`.

### `kyc_cases`, `documents`, `registry_checks`, `kyc_field_checks`

`kyc_cases(id PK, business_id FK, status CHECK (status IN ('PENDING','IN_REVIEW','NEEDS_CORRECTION','COMPLETED')), consent_id FK, reference UNIQUE, submitted_at, completed_at, review_reason_codes text[], created_at, updated_at)`.

`documents(id PK, kyc_case_id FK, document_type, object_key, sha256, mime_type, byte_size, extraction_status, extraction_mode, uploaded_at, retention_until, deleted_at, deletion_reason)`. Unique `(kyc_case_id, sha256)`. `retention_until` is required; a deletion job removes object content at or after that timestamp and retains only a minimal tombstone/audit record.

`registry_checks(id PK, kyc_case_id FK, registry_type, identifier_hmac, hmac_key_version, masked_identifier, format_status, lookup_status, matched_record_fields jsonb, checked_at)`. `identifier_hmac` is computed with a keyed HMAC and is not reversible. Do not store raw registry snapshots; `matched_record_fields` may contain only field names and boolean comparison outcomes, never returned names, addresses, registration dates, or raw identifiers. Index `(kyc_case_id, registry_type, checked_at desc)`, `(registry_type, identifier_hmac)`.

`kyc_field_checks(id PK, document_id FK nullable, kyc_case_id FK, field_name, user_value_hash, extracted_value_hash, registry_value_hash, result, confidence, source, details jsonb, created_at)`.

Raw identifiers/OCR text should not be retained in normal relational columns; use encrypted restricted storage only if production requirements demand it.

### `orders`, `order_items`, `installation_events`

`orders(id PK, business_id FK, quote_id FK, kyc_case_id FK, public_reference UNIQUE, status CHECK (status IN ('ORDER_CONFIRMED','INSTALLATION_SCHEDULED','INSTALLATION_COMPLETED','ACTIVATED')), expected_install_date, created_at, updated_at)`.

`order_items(id PK, order_id FK, product_id FK, product_code_snapshot, product_name_snapshot, quantity, recurring_total_inr, setup_total_inr)`.

`installation_events(id PK, order_id FK, from_status, to_status, event_at, actor_user_id FK nullable, note_code, idempotency_key UNIQUE)`, with `order_id FK orders`. `from_status` and `to_status` use only the order states above.

Row-level checks: status values use the order state enum and event timestamps are valid. Quote/business/KYC ownership consistency, accepted quote status, completed KYC status, quote expiry, and order creation are enforced by the order service in one transaction using row locks and foreign keys; they are not represented as ordinary cross-table `CHECK` constraints. Index `(business_id, created_at desc)`, `(status)`, `(order_id, event_at)`.

### `audit_events`

`id PK`, `actor_user_id FK nullable`, `entity_type`, `entity_id`, `action`, `request_id`, `metadata jsonb`, `created_at`.

Audit actions include `REGISTRY_LOOKUP`, `DOCUMENT_VIEW`, `DOCUMENT_DOWNLOAD`, `OCR_RUN`, `KYC_REVIEW`, `QUOTE_ACCEPTED`, `ORDER_CREATED`, and `ORDER_STATUS_CHANGED`. Never put full identifiers, raw OCR, document content, tokens, or secrets in metadata. Index `(entity_type, entity_id, created_at desc)`, `(request_id)`, `(actor_user_id, created_at desc)`. Document access is denied unless the actor is authorized and each view/download is audited.

## Relationship summary

One user owns many business profiles; a business has many consents, recommendation runs, quotes, KYC cases, and orders. A recommendation run has many items. A quote has many items. A KYC case has documents, registry checks, and field checks. An order references one accepted quote and completed KYC case, has items, and has append-only installation events.

## Prisma/PostgreSQL invariant implementation

The Prisma model must map every monetary field to `Int`, every status to an enum, and the composite product uniqueness to `@@unique([catalogueVersionId, productCode])`. Prisma migrations must add the partial active-version unique index through SQL because Prisma schema syntax does not express this partial predicate. The service layer must use transactions for consent-current-state calculation, quote total calculation, quote acceptance, KYC approval, and order creation. Database foreign keys and row-level checks remain authoritative for structural validity; service invariants handle cross-table and aggregate validity.

## Retention and deletion

For the prototype, set document `retention_until` to 30 days after the KYC case reaches a terminal decision, or 30 days after last activity if no decision is reached. A scheduled deletion job removes document bytes and OCR working data, sets `deleted_at` and `deletion_reason`, and leaves only the minimum audit/tombstone record. Identifier HMACs may remain for duplicate detection and audit correlation; encryption keys and HMAC keys are managed outside the database and rotated by key version.
