# MASTER PROJECT PROMPT

## YTL Hackathon 2026 --- Project Udyam Digital \| Enterprise Track A

Act as a senior product architect, full-stack engineer, AI engineer,
data analyst, business strategist, UX designer, security specialist, and
hackathon submission consultant.

I am participating in the YTL Hackathon 2026, Enterprise Track A. I have
uploaded the complete challenge ZIP containing the problem statement,
dataset, nested archives, and PowerPoint submission template.

Your responsibility is to help prepare a complete, competition-quality
submission: a functional prototype, technical architecture, business
case presentation, privacy note, and demo plan.

Do not approach this as a simple website-building exercise. Think like a
product team building a commercially viable, digital-first MSME
acquisition and onboarding platform for an Indian telecom operator.

------------------------------------------------------------------------

# 1. First: Inspect and Understand All Source Material

Before designing or coding, inspect the complete uploaded ZIP and all
nested ZIP archives. Read the problem statement PDF and inspect the
submission PowerPoint template. Extract and review the supplied datasets
and KYC document images.

Important files expected in the archive include:

-   `Airtel_SYNC_Case.pdf`
-   `Submission Template_Sync.pptx`
-   `YTL_TrackA_Udyam_Digital_Data.zip`
-   `smb_leads.csv`
-   `product_catalogue.csv`
-   `mock_gstin_registry.csv`
-   `mock_udyam_registry.csv`
-   All files in the `kyc_documents/` directory

Do not assume the filenames or contents without verifying them. If the
archive structure differs, report the actual structure and adapt.

Produce an initial requirements brief covering:

1.  The business problem.
2.  Target users and stakeholders.
3.  Mandatory prototype modules.
4.  Stretch goals.
5.  Dataset schema and quality.
6.  Product catalogue rules and eligibility constraints.
7.  KYC requirements and mock integrations.
8.  Submission deliverables and judging expectations.
9.  Technical, business, privacy, and operational constraints.
10. Any ambiguities or assumptions that need to be stated.

Do not ignore the actual supplied dataset or replace it with randomly
generated sample information. The supplied records and registries should
be the primary source of truth for the prototype and business analysis.

Treat all supplied business and customer identifiers as synthetic
challenge data, but handle them as if they were confidential customer
information.

------------------------------------------------------------------------

# 2. Product Vision and Business Objective

Build a digital-first platform called **Project Udyam Digital** for the
fictional telecom operator **Accel Business**.

The platform should allow an MSME owner to complete the following
journey:

**Business discovery → Needs assessment → Product recommendation →
Bundle configuration → Transparent quote → Digital KYC → Order
confirmation → Installation tracking → Activation**

The current business problem is a fragmented and slow telecom onboarding
process. Customers may depend on field salespeople, wait several days
for quotations, submit KYC documents through disconnected channels,
experience lengthy installation timelines, and make repeated follow-up
calls to understand order status.

The proposed platform should reduce friction by making discovery,
recommendation, quotation, KYC, and order tracking available through one
coherent digital experience.

The primary product objectives are:

-   Reduce dependence on unnecessary sales visits.
-   Reduce quotation turnaround time.
-   Reduce manual paperwork and KYC friction.
-   Improve lead-to-activation conversion.
-   Reduce time to activation.
-   Improve transparency and customer confidence.
-   Provide a consistent cross-product experience.
-   Help sales and channel partners focus on high-value activities
    rather than repetitive administration.

Design for Indian MSMEs, including business owners who may not be
technically sophisticated. Make the experience mobile-first, accessible,
fast, and easy to understand.

Support English and Hindi at minimum, with an architecture that can
support additional Indian languages later.

------------------------------------------------------------------------

# 3. Mandatory Product Modules

## Module A --- AI-Powered Business Advisor

Build an intelligent conversational business advisor that understands
business requirements and recommends eligible products from the actual
supplied product catalogue.

### Information to collect

-   Business name and category.
-   Business size and employee count.
-   Number of business locations/sites.
-   City and city tier.
-   Annual turnover range, if relevant to eligibility.
-   Existing internet and telecom arrangements.
-   Current telecom expenditure.
-   GSTIN and Udyam registration status.
-   Business connectivity requirements.
-   Security, communication, cloud, IoT, and operational requirements.
-   Budget and preferred contract duration, where relevant.

Do not overwhelm users with a long form. Collect information
progressively through a conversational flow, asking only relevant
questions.

### Recommendation examples

-   A kirana store may need broadband, business mobile lines, cloud POS,
    and WhatsApp Business.
-   A clinic may need reliable broadband, cloud email, backup
    connectivity, endpoint security, and business communication.
-   A multi-location restaurant may need SD-WAN, connectivity, CCTV, and
    failover.
-   A manufacturing unit may need dedicated connectivity, firewall,
    machine monitoring, and IoT solutions.

These are examples, not hard-coded recommendations. Validate all
recommendations against the actual product catalogue and eligibility
rules.

### Recommendation engine requirements

Implement a deterministic, backend-controlled recommendation engine
that:

-   Uses `product_catalogue.csv` as its product source.
-   Checks city-tier eligibility.
-   Checks minimum employee requirements.
-   Checks minimum site requirements.
-   Checks GSTIN requirements.
-   Enforces product dependencies.
-   Considers target customer segments.
-   Respects minimum contract durations.
-   Handles product quantities and units.
-   Explains why each product is recommended.
-   Explains why an otherwise relevant product is unavailable or
    ineligible.
-   Avoids recommending products that the customer cannot purchase.

Use an LLM for natural-language interaction, requirement extraction, and
explanations. Do not delegate eligibility, pricing, or other critical
business rules to an unconstrained LLM. Use structured outputs and
backend validation.

The advisor should produce a structured customer profile and pass it to
the bundle builder without asking the customer to re-enter information.

------------------------------------------------------------------------

## Module B --- Bundle Builder, Quote, and Checkout

Create a professional bundle configuration and checkout experience.

Display:

-   Recommended bundle.
-   Individual product names and descriptions.
-   Monthly product pricing.
-   Quantity and pricing unit.
-   Optional add-ons.
-   One-time setup or installation charges.
-   Contract duration.
-   Total recurring monthly expenditure.
-   One-time charges.
-   Applicable taxes, if the challenge specification requires them.
-   Estimated savings against current telecom expenditure, only when
    supported by customer-provided information and clearly stated
    assumptions.

### Pricing rules

-   Calculate prices using the supplied product catalogue.
-   Inspect the actual catalogue schema before implementing
    calculations.
-   If a product has a minimum and maximum price range and the challenge
    does not prescribe a selection rule, use a clearly disclosed
    assumption such as the midpoint for the prototype.
-   Handle per-user, per-device, per-site, per-line, and other units
    correctly.
-   Respect minimum quantities and product dependencies.
-   Recalculate totals immediately when products or quantities change.
-   Keep pricing calculations on the backend or in a shared, tested
    pricing module.
-   Never silently ignore eligibility or dependency rules.
-   Clearly distinguish recurring charges from one-time charges.
-   Do not invent discounts or savings.

Provide a transparent quote summary before checkout. Allow the user to
add or remove optional products and understand how each choice changes
the total.

------------------------------------------------------------------------

## Module C --- Smart Digital KYC

Implement a complete digital KYC workflow using the supplied mock
registries and document samples.

### Required workflow

1.  Explain the purpose of each requested data item.
2.  Obtain explicit customer consent before collecting or processing KYC
    information.
3.  Accept GSTIN input.
4.  Validate GSTIN format and checksum.
5.  Look up GSTIN in `mock_gstin_registry.csv`.
6.  Accept Udyam registration input.
7.  Validate Udyam format against the challenge's synthetic data
    conventions.
8.  Look up Udyam in `mock_udyam_registry.csv`.
9.  Allow relevant document uploads.
10. Run OCR or document text extraction.
11. Compare extracted fields with customer-entered information and
    registry results.
12. Detect inconsistencies and missing information.
13. Display clear verification states and corrective actions.
14. Allow the customer to submit the KYC application.
15. Provide a confirmation and reference number.

### KYC validation scenarios

Use the supplied files in `kyc_documents/` to test the workflow. Inspect
the actual images and identify the document types and scenarios
represented.

Detect, where possible:

-   Missing documents.
-   Expired or outdated address proof.
-   Name mismatches.
-   Address mismatches.
-   Invalid or inconsistent registration details.
-   Missing signatory information.
-   Unreadable or low-quality documents.
-   Duplicate uploads.
-   Inconsistent dates or identifiers.

Use **15 July 2026** as the reference date for date-based document
checks if that is the date specified in the challenge materials. If the
source material specifies a different date or context, follow the source
material and explain the choice.

### Verification states

Clearly distinguish:

-   Information extracted by OCR.
-   Information matched against a supplied mock registry.
-   Format validation passed or failed.
-   Information requiring manual review.
-   Verification completed.

OCR extraction alone must never be represented as proof of document
authenticity.

Use the supplied mock registries as local mock API data sources. Clearly
label them as mock integrations, not live government verification
services.

------------------------------------------------------------------------

## Module D --- Order Tracker

Build an order tracking dashboard that gives the customer a clear view
of the order journey.

Display:

-   Order ID.
-   Customer/business name, with appropriate masking where needed.
-   Purchased products and bundle.
-   KYC status.
-   Order confirmation status.
-   Payment status, if included in the challenge.
-   Installation scheduling status.
-   Technician assignment, if applicable.
-   Expected installation date.
-   Activation status.
-   Support or escalation option.

Use `typical_install_days` from the product catalogue to calculate
expected installation timelines. Inspect how this field applies when a
bundle contains multiple products and document the chosen calculation
rule. Do not invent installation promises.

Provide a visual timeline with meaningful status updates, timestamps,
and next steps.

Use realistic mock workflow transitions. Do not claim that a real
telecom network, payment system, or installation operation has been
connected or activated.

------------------------------------------------------------------------

## Module E --- Partner and Sales Back-Office Dashboard

Implement this stretch feature if time permits after the mandatory
customer journey works.

Create a separate dashboard for Accel Business employees and channel
partners.

Include:

-   Total leads.
-   Lead funnel.
-   Segment-wise conversion.
-   Lead source performance.
-   Drop-off analysis.
-   KYC-pending leads.
-   High-intent leads.
-   Follow-up actions.
-   Lead status and owner.
-   Conversion and activation metrics.

Use the actual `smb_leads.csv` data.

Build a simple, explainable lead propensity score if useful. Explain its
features and limitations. Do not present an arbitrary score as a
validated machine-learning prediction.

Show how digital acquisition complements the existing field sales team
and channel partners rather than simply replacing them.

------------------------------------------------------------------------

# 4. Dataset Analysis and Business Intelligence

Perform exploratory data analysis on the supplied lead dataset and
catalogue. Inspect data types, missing values, duplicates, inconsistent
categories, date fields, and relationships before calculating metrics.

Analyse, where the relevant fields exist:

-   Lead source performance.
-   Business segment performance.
-   Lead funnel conversion.
-   GSTIN versus non-GSTIN conversion.
-   Customer acquisition cost.
-   Average activation time.
-   Follow-up call frequency.
-   Drop reasons.
-   Bundle adoption.
-   Monthly bundle value.
-   Six-month churn.
-   NPS.
-   City or city-tier performance.
-   Employee-count and site-count patterns.

### Required business outputs

1.  Identify the most attractive customer segments.
2.  Identify the biggest points of funnel leakage.
3.  Identify which acquisition channels perform best.
4.  Identify likely causes of customer drop-off.
5.  Recommend suitable product bundles by segment.
6.  Recommend how to prioritise sales and partner effort.
7.  Identify the most impactful improvements the platform could make.
8.  Define measurable success metrics.

Use actual supplied data for historical analysis.

Clearly distinguish:

-   Historical figures directly present in the dataset.
-   Metrics calculated from supplied records.
-   Business assumptions.
-   Proposed targets.
-   Forecasts or scenarios.

Never present a proposed target as an achieved result.

If a metric cannot be calculated because the dataset lacks the required
fields, state that limitation rather than inventing a value.

### Initial figures to verify

An initial analysis of the supplied leads indicated the following
figures. Recalculate them from the actual files before using them in any
deliverable:

  -----------------------------------------------------------------------
  Metric                                                   Initial figure
  ------------------------------ ----------------------------------------
  Total leads                                                       5,000

  Contacted                                                         3,406

  Needs assessed                                                    1,974

  Quote accepted                                                      861

  KYC complete                                                        588

  Activated                                                           368

  Lead-to-activation conversion                                     7.36%

  Average activation time                                       17.6 days

  Average acquisition cost per     Approximately ₹15,000, as described in
  activation                                               the case brief
  -----------------------------------------------------------------------

Initial segment figures to independently verify:

  Segment                     Leads   Activated   Conversion
  ------------------------- ------- ----------- ------------
  Micro retail & services     2,709         110        4.06%
  Professional offices        1,247         138       11.07%
  Small multi-site              755          83       10.99%
  Small manufacturers           289          37       12.80%

Initial observations to verify:

-   Referrals appeared to have the strongest conversion, approximately
    14.77%.
-   Leads with GSTIN appeared to activate at approximately 9.56%,
    compared with approximately 2.05% without GSTIN.
-   Frequently observed drop reasons included unreachable customers,
    lack of time for a sales visit, lack of interest, and price
    concerns.

Do not use these figures without independently checking the source
records, denominators, filters, and definitions.

### Strategic hypotheses to test

-   Professional offices may be attractive for an initial acquisition
    campaign because of their conversion performance.
-   Multi-site businesses may support higher-value connectivity,
    failover, and central management bundles.
-   Micro retailers may need a low-friction, affordable self-service
    journey because they represent a large lead pool but may convert
    less frequently.
-   Manufacturers may be suitable for specialised connectivity,
    security, and IoT bundles.
-   Referral channels may deserve additional investment if their
    performance remains strong after validation.

Treat these as hypotheses to validate against the data, not
predetermined conclusions.

------------------------------------------------------------------------

# 5. Technical Architecture

Design a modular, production-oriented architecture suitable for a
credible hackathon prototype.

### Suggested technology stack

-   Frontend: React.js or Next.js.
-   Backend: Node.js with Express.js or NestJS.
-   Database: PostgreSQL.
-   AI: LLM API with structured outputs and tool/function calling.
-   OCR: Suitable local OCR engine or document OCR service.
-   Authentication: Secure sessions or JWT-based authentication.
-   Charts: Recharts or an equivalent charting library.
-   File storage: Secure object-storage abstraction.
-   API communication: REST APIs.
-   Testing: Appropriate unit, integration, and end-to-end testing
    tools.

You may recommend changes to this stack if they improve delivery speed,
reliability, maintainability, or demo quality. Explain important
trade-offs.

### Architecture components

Separate the following logical responsibilities:

1.  Frontend application.
2.  Authentication and authorisation.
3.  Business profile service.
4.  AI advisor and conversation orchestration.
5.  Recommendation engine.
6.  Product catalogue service.
7.  Pricing and quote engine.
8.  KYC verification service.
9.  OCR/document processing service.
10. Registry lookup adapters.
11. Order management service.
12. Installation tracking service.
13. Analytics and reporting.
14. Database.
15. Secure document storage.
16. External integration adapters.

Create a clear architecture diagram showing components, API boundaries,
data stores, and data flows.

### Engineering requirements

-   Define database schemas and relationships.
-   Define API contracts and request/response examples.
-   Validate all input on the backend.
-   Implement consistent error responses.
-   Handle loading, timeout, and retry scenarios.
-   Separate business logic from UI components.
-   Keep secrets in environment variables.
-   Include an `.env.example` without real secrets.
-   Do not commit API keys, credentials, private uploads, or sensitive
    information.
-   Avoid logging personal or document information.
-   Include seed scripts for the supplied challenge data.
-   Provide repeatable local setup instructions.
-   Document mock integrations and production replacement points.

------------------------------------------------------------------------

# 6. User Experience and Interface Design

The application should look and feel like a polished commercial telecom
or fintech product, not a generic college project.

### Design principles

-   Mobile-first responsive design.
-   Minimal cognitive load.
-   Clear information hierarchy.
-   Professional typography.
-   Consistent spacing and components.
-   Accessible forms and controls.
-   Clear validation messages.
-   Meaningful loading states.
-   Useful empty states.
-   Helpful error states.
-   Clear success feedback.
-   Transparent pricing.
-   Trustworthy consent and privacy messaging.

### User experiences

Create separate experiences for:

1.  MSME/business owner.
2.  Sales or channel partner employee.
3.  Internal administrator, only if needed for the prototype.

The primary business-owner journey must be demonstrable in under three
minutes.

Prioritise a coherent end-to-end journey over an excessive number of
disconnected screens.

------------------------------------------------------------------------

# 7. Privacy, Security, and DPDP Considerations

Prepare the system with privacy by design.

Address:

-   Explicit consent before KYC processing.
-   Clear purpose statements.
-   Data minimisation.
-   Secure document upload and handling.
-   Encryption in transit and at rest, where implemented.
-   Masking of GSTIN, Udyam, and other identifiers.
-   Role-based access control.
-   Document retention and deletion policy.
-   Audit logging.
-   Secure API access.
-   Session management.
-   Input validation.
-   Safe error handling.
-   Protection against unauthorised document access.

Clearly distinguish prototype safeguards from production-grade controls
and integrations.

Do not claim regulatory certification or legal compliance without
evidence. Describe the relevant design considerations and recommend
legal review before production deployment.

Prepare a separate one-page privacy and security note.

------------------------------------------------------------------------

# 8. Business Case Presentation --- Maximum 10 Slides

Use the supplied PowerPoint submission template if available. Preserve
its required structure and branding conventions. Do not ignore template
instructions.

Prepare a concise, professional presentation with no more than 10
slides.

Suggested structure:

### Slide 1 --- Problem and Opportunity

Explain the current MSME acquisition and onboarding friction, its
business consequences, and the opportunity.

### Slide 2 --- Customer Segmentation

Show actual dataset-backed segments, conversion performance, and the
priority target segments.

### Slide 3 --- Proposed Solution

Explain Project Udyam Digital, its value proposition, and the end-to-end
experience.

### Slide 4 --- Product Bundles and Pricing

Show segment-specific recommendations, product eligibility, transparent
pricing, and the bundle-building experience.

### Slide 5 --- Customer Journey

Show the flow from business discovery through recommendation, quote,
KYC, order tracking, and activation.

### Slide 6 --- Technical Architecture and AI

Show the architecture, recommendation engine, AI advisor, OCR, mock
registry integrations, and order management.

### Slide 7 --- Business Model and Expected Impact

Show the expected impact on conversion, acquisition cost, activation
time, and operational efficiency. Label all targets and assumptions.

### Slide 8 --- Go-to-Market and Channel Strategy

Explain digital acquisition, referral channels, partner enablement, and
how the existing sales team benefits.

### Slide 9 --- KPIs, Risks, and Mitigation

Show baseline metrics, proposed targets, measurement methods, and key
risks.

### Slide 10 --- Rollout Roadmap and Conclusion

Show phased implementation, dependencies, next steps, and the central
business value.

### Presentation quality requirements

-   Use actual dataset insights wherever possible.
-   Use readable charts and clear labels.
-   Avoid overcrowding slides.
-   Use a consistent visual identity.
-   Make the business case understandable to non-technical judges.
-   Explain why selected segments are attractive.
-   Explain why the recommended bundles fit their needs.
-   Explain how the platform can reduce acquisition cost and activation
    time.
-   Explain how channel partners benefit.
-   Avoid unsupported TAM/SAM/SOM figures.
-   Avoid fabricated financial projections.
-   State assumptions and calculation methods.

------------------------------------------------------------------------

# 9. Three-Minute Product Demonstration

Prepare a timed demonstration script and a reliable demo sequence.

Suggested timeline:

  -----------------------------------------------------------------------
  Time                                Demonstration
  ----------------------------------- -----------------------------------
  0:00--0:20                          Introduce the MSME onboarding
                                      problem

  0:20--0:50                          Enter business details and interact
                                      with the AI advisor

  0:50--1:20                          Show recommended products, bundle
                                      configuration, and pricing

  1:20--2:05                          Demonstrate consent, document
                                      upload, and Smart KYC

  2:05--2:35                          Show order confirmation and
                                      installation/activation tracking

  2:35--2:55                          Show partner dashboard and business
                                      analytics

  2:55--3:00                          Close with measurable business
                                      value
  -----------------------------------------------------------------------

Prepare:

-   A word-for-word narration.
-   Exact screens and actions to perform.
-   A known-good demo business profile.
-   Valid and invalid test cases for KYC.
-   A fallback path if an external AI or OCR service is unavailable.
-   A clean reset procedure between demonstrations.

Prioritise a seamless working journey over lengthy explanations.

Never make the demo depend on an unreliable external service when a
clearly labelled mock fallback can preserve the experience.

------------------------------------------------------------------------

# 10. Testing and Quality Assurance

Before declaring the submission complete, test the following.

### Recommendation engine

-   Eligible customer receives relevant recommendations.
-   Ineligible customer does not receive restricted products.
-   City-tier rules work.
-   Employee and site requirements work.
-   GSTIN requirements work.
-   Product dependencies work.
-   Contract-duration constraints work.
-   Recommendation explanations match actual rules.

### Pricing and checkout

-   Product prices match catalogue rules.
-   Quantity calculations are correct.
-   Different pricing units are handled correctly.
-   Add-ons update totals.
-   One-time charges are separated from recurring charges.
-   Dependencies are enforced.
-   Quote totals are consistent between frontend and backend.

### KYC

-   Valid GSTIN lookup.
-   Invalid GSTIN format.
-   GSTIN not found in registry.
-   Valid Udyam lookup.
-   Udyam not found in registry.
-   Missing document.
-   Unreadable document.
-   Name mismatch.
-   Address mismatch.
-   Expired document.
-   Duplicate document.
-   Manual review state.
-   Consent not granted.

### Order tracking

-   Order creation.
-   KYC pending.
-   KYC completed.
-   Order confirmation.
-   Installation scheduling.
-   Installation delay or rescheduling.
-   Activation.
-   Invalid status transition.

### General application

-   Responsive desktop and mobile layouts.
-   Authentication and access control.
-   Form validation.
-   API error handling.
-   Empty and loading states.
-   No exposed secrets.
-   No unintended exposure of personal data.
-   Clear mock-versus-live integration labels.

Provide a test report showing passed, failed, and not-yet-implemented
cases. Do not mark a feature as complete unless it has been tested.

------------------------------------------------------------------------

# 11. Required Final Deliverables

Prepare all of the following:

**A. Working prototype** - Complete source code. - Functional end-to-end
customer journey. - Working backend and frontend. - Actual supplied
challenge data integrated where applicable. - Clear mock integration
boundaries.

**B. Solution architecture** - Architecture diagram. - Component
descriptions. - Data-flow explanation. - Database schema. - API
contracts.

**C. Business case presentation** - Maximum 10 slides. - Based on the
supplied template where applicable. - Actual data analysis. - Clear
business strategy and measurable impact.

**D. Privacy and security note** - One page. - Consent, data
minimisation, security, retention, and limitations.

**E. Three-minute demo script** - Timestamps. - Narration. -
Screen-by-screen actions. - Fallback plan.

**F. README** - Project overview. - Technology stack. - Prerequisites. -
Setup instructions. - Environment variables. - Database setup and seed
instructions. - How to run frontend and backend. - API documentation. -
Demo credentials, if applicable. - Testing instructions. - Known
limitations. - Mock versus production integrations.

**G. Test report and submission checklist** - Test cases. - Results. -
Outstanding issues. - Final deliverable status.

------------------------------------------------------------------------

# 12. Execution Plan --- Work in Phases

Work in the following order. Do not jump directly into coding.

## Phase 1 --- Source Inspection

Inspect all archives, PDFs, spreadsheets, CSV files, images, and the
presentation template. Produce a requirements brief and identify
constraints.

## Phase 2 --- Data Analysis and Business Strategy

Analyse the real dataset. Validate the funnel, segment conversion,
acquisition channels, product catalogue, and KYC registries. Produce the
business recommendations and baseline KPIs.

## Phase 3 --- Product and Technical Design

Define user journeys, wireframes, system architecture, database schema,
API contracts, product eligibility rules, and pricing logic.

## Phase 4 --- Core Prototype

Implement the mandatory modules in this order: 1. Business profile and
AI advisor. 2. Deterministic recommendation engine. 3. Bundle builder
and quote. 4. Smart KYC. 5. Order tracker.

## Phase 5 --- Integration and Testing

Integrate all modules into one customer journey. Test business rules,
edge cases, API behaviour, and responsive layouts.

## Phase 6 --- Stretch Features

Implement the partner dashboard, lead analytics, and explainable
propensity scoring if time permits.

## Phase 7 --- Submission Preparation

Create the architecture documentation, business case presentation,
privacy note, README, test report, and demo script.

------------------------------------------------------------------------

# 13. Rules for Working with Me

1.  Do not rush into coding before understanding the challenge.
2.  Do not fabricate dataset values, customer results, product features,
    or integrations.
3.  Do not replace actual supplied data with dummy data when the actual
    data can be used.
4.  Do not assume a catalogue field or business rule; inspect the
    source.
5.  Do not let an LLM make unchecked pricing or eligibility decisions.
6.  Clearly label assumptions, targets, forecasts, and mock
    integrations.
7.  Explain important architectural and business trade-offs.
8.  Prefer a smaller, fully working end-to-end product over many
    incomplete features.
9.  Keep the code modular, readable, maintainable, and easy to run.
10. Preserve the original uploaded ZIP and source files.
11. Do not overwrite an existing repository or remote without explicit
    approval.
12. Never commit secrets, credentials, or private uploads.
13. Provide exact commands and complete code when implementation is
    requested.
14. After each phase, report what was completed, what was tested, and
    what remains.
15. If essential information is missing, ask a focused clarification
    rather than silently inventing it.

------------------------------------------------------------------------

# 14. Definition of a Winning Submission

The final submission should demonstrate four qualities:

### Engineering excellence

A genuinely working, integrated product with sound architecture,
reliable business logic, meaningful testing, and sensible security
controls.

### Product thinking

A simple, trustworthy, mobile-first experience that solves real MSME
onboarding problems.

### Business understanding

Data-backed customer segmentation, commercially sensible bundles,
transparent pricing, channel strategy, and measurable impact.

### Presentation quality

A compelling demonstration and a concise business case that
non-technical and technical judges can both understand.

The central story of the submission should be:

**An MSME owner can move from expressing a business requirement to
receiving a verified, transparent, and trackable telecom order in one
digital journey, without unnecessary sales visits, paperwork, or
repeated follow-ups.**

Do not merely build a prototype that works. Build and present a credible
product that judges can imagine being deployed by a telecom operator at
scale.
