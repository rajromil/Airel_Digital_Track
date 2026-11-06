# Project Udyam Digital - Problem Analysis

## Scope and evidence

This analysis is based on the complete [Master Prompt](./Project_Udyam_Digital_Master_Prompt.md), the official [Airtel SYNC case PDF](../source/case_package/Airtel_SYNC_Case.pdf), the [data-pack README](../source/data_package/README.md), the supplied CSVs, the 47 KYC images, and the [submission PowerPoint template](../source/case_package/Submission%20Template_Sync.pptx). All supplied businesses, people, identifiers, documents, and figures are fictional challenge data.

## Verified problem

Accel Telecom's B2B arm, Accel Business, serves large corporates effectively but has limited penetration among India's MSMEs. MSME customers commonly need a bundle of connectivity, business mobile, communications, cloud, security, POS/CCTV, and IoT services, but the current journey is fragmented:

- Needs are discovered during a field visit, with risk of product-led rather than needs-led selling.
- Quotes take 3-5 days and are delivered as product-code-heavy PDFs.
- KYC documents are collected physically or by email.
- Installation and activation take 10-14 days on average, with 3-4 customer status calls.
- Products are billed and supported separately.

The case asks for a phone-first, preferred-language digital journey that lets an MSME discover a bundle, buy it, complete KYC, and track activation with minimal human effort.

## Users and stakeholders

| User | Verified need | Product implication |
|---|---|---|
| MSME owner or authorised representative | Understand needs, price, eligibility, KYC, and order status quickly | Mobile-first progressive journey, plain language, consent and transparency |
| Accel Business sales employee | Receive better-qualified leads and handle exceptions | Escalation and assisted-journey views; digital complements field sales |
| Channel partner | Submit or follow up high-intent opportunities | Partner attribution, lead status, and hand-off |
| Operations/KYC reviewer | Resolve mismatches and manual-review cases | Evidence-based verification states and audit trail |
| Product/pricing owner | Maintain catalogue rules | Catalogue-driven rules; no hard-coded LLM decisions |
| Hackathon judge | Validate a coherent 3-minute working journey and business case | Reliable mock integrations and visible labels for synthetic/mock behaviour |

## Baseline funnel verified from `smb_leads.csv`

The stage counts below use cumulative `stage_reached` date presence, not the non-cumulative row label alone:

| Stage | Records | Conversion from previous |
|---|---:|---:|
| Lead | 5,000 | - |
| Contacted | 3,406 | 68.12% |
| Needs assessed | 1,974 | 57.96% |
| Quote accepted | 861 | 43.62% |
| KYC complete | 588 | 68.29% |
| Activated | 368 | 62.59% |

Lead-to-activation is 368/5,000 = **7.36%**. Activated records average **17.6168 days** from lead to activation and **3.0109 follow-up calls**. The median activated monthly bundle value is **₹6,900**. The raw average acquisition cost across all leads is ₹1,107.93; the average recorded cost among activated rows is ₹5,385.19. The case brief's approximately ₹15,000 blended acquisition cost per activated SMB is therefore a case-level stated figure, not the arithmetic mean of the CSV's `acquisition_cost_inr` field.

## Segment and channel findings

| Segment | Leads | Activated | Activation rate |
|---|---:|---:|---:|
| Micro retail & services | 2,709 | 110 | 4.06% |
| Professional offices | 1,247 | 138 | 11.07% |
| Small multi-site businesses | 755 | 83 | 10.99% |
| Small manufacturers | 289 | 37 | 12.80% |

Referral is the strongest recorded source at **14.77%** (61/413), followed by inbound call at 9.52%, channel partner at 8.02%, field sales at 7.27%, website form at 4.32%, and WhatsApp campaign at 2.79%. This is historical correlation, not proof that channel alone causes conversion.

Leads with GSTIN activate at **9.56%** (338/3,534), versus **2.05%** (30/1,466) without GSTIN. This supports a GSTIN-ready fast path, but must not be used to reject non-GSTIN customers where catalogue rules allow purchase.

The largest recorded drop reasons are unreachable after three attempts (805), no time for a visit (531), not interested on first call (470), price too high (414), locked in with current provider (325), wrong/invalid number (319), and visit not scheduled (296). Quote comprehension and speed are also explicit issues: quote too complex (206) and quote too slow (179).

## Opportunity and product response

The product should attack the biggest friction points rather than simply reproduce a product catalogue:

1. Progressive advisor questions reduce unnecessary sales visits.
2. Catalogue-backed recommendations and a plain-language bundle reduce quote delay and complexity.
3. Immediate recurring/setup separation makes price transparent.
4. GSTIN/Udyam lookup plus OCR comparison reduces repeated paperwork.
5. A tracker reduces status-chasing calls.
6. Assisted escalation preserves the value of field and channel partners for exceptions and high-value accounts.

## Mandatory versus stretch scope

**Mandatory:** AI-powered advisor, deterministic product recommendation, bundle builder/quote/checkout, Smart KYC with consent, mock GSTIN/Udyam lookups and document extraction/validation, and order tracker.

**Stretch:** voice or WhatsApp front end, sales/partner back-office dashboard, and a simple explainable propensity score.

## Judging and submission constraints

The official case requires a working prototype and a maximum-10-slide business case, plus an architecture diagram and one-page privacy/security note. The master prompt additionally calls for a three-minute demo script, README, test report, and submission checklist. The supplied template uses Airtel and SYNC branding with Unstop platform-partner branding; any final deck should preserve the template's visual conventions unless explicitly permitted otherwise.

