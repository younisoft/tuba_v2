# Aqar (تطبيق عقار) Broker Platform Audit

Generated from a live authenticated audit capture on 2026-08-06, via a browser session the account holder (فهد حميد, on behalf of شركة أسبار الموحدة التجارية — an Asbar-branded broker account) authenticated themselves. Direct observation only; no credentials were requested or handled by the auditing agent, and no authentication bypass was attempted.

Site audited: `sa.aqar.fm` (desktop web).

## Contents

- `01_EXECUTIVE_SUMMARY.md` — top-line findings and overall read
- `02_PRODUCT_PHILOSOPHY.md` — what Aqar optimizes for and why, Observed vs Inferred
- `03_INFORMATION_ARCHITECTURE.md` — full sitemap, navigation model
- `04_PAGE_ANALYSIS.md` — page-by-page breakdown of every reachable screen
- `05_COMPONENT_LIBRARY.md` — reusable UI components, states, variants
- `06_USER_JOURNEYS.md` — end-to-end workflows with Mermaid diagrams
- `07_DESIGN_SYSTEM.md` — DOM-verified typography/color/spacing tokens
- `08_TECHNICAL_OBSERVATIONS.md` — network-verified architecture, API patterns, analytics stack
- `09_FEATURE_CATALOG.md` — full feature inventory
- `10_STRENGTHS.md`
- `11_WEAKNESSES.md`
- `12_AI_OPPORTUNITIES.md`
- `screenshots/` — 30 evidence captures, numbered in audit order
- `diagrams/` — Mermaid source files (sitemap, workflows)

## Scope Note

**Account context**: the audited account is a pre-existing broker/business account (شركة أسبار الموحدة التجارية, CR 4030407410) on a paid "الأفراد الأساسية" (Basic Individual) subscription — 30 ad-space credits, 1 user seat, running until 21/04/2027. It had **zero active listings** at capture time (all lifecycle tabs showed 0), a wallet balance of 0 SAR with one expired 100 SAR top-up on record, and a small set of pre-existing Favorites (real marketplace listings, several tagged "طلب تسويق" / Marketing Request). This means most list/table views were captured in their **empty state** rather than populated — documented explicitly as such throughout, never fabricated with placeholder data.

**Modules reached**: My Ads (`/my-listings`), Subscription Info, Add Listing (all three entry roles — Host/Owner-Agent/Broker-Marketer — and both the REGA-license and free-license-issuance sub-flows), Licenses/`/mlr`, Wallet + top-up modal, the separate "Office Management" console (`/offices-management` — Dashboard, Listings, Wallet, Featured Campaigns, Statistics, Users/Team, Invoices, Settings), Featured Listings campaign flow (`/user/campaigns`), District Broker bidding flow (`/district-broker/bid`), Ejar contract issuance + Broker Ejar contracts (assigned-contract CRM view), Aqar+ (consumer premium tier), Saved Searches, Bookings (both host and guest tabs), Off-plan Payment Requests, Establishment Account, Favorites, and the public Projects marketplace.

**Not completed, and why**: the REGA license number field, the free-license Wasata contract/deed number fields, and the District Broker bid amount step all require real government-issued identifiers (REGA license numbers, Wasata brokerage contract numbers, deed numbers) or a real payment. These were not fabricated or submitted — the forms and their field requirements are documented up to that point, consistent with "never invent findings."

**PII note**: the account holder's own name, phone number, and CR number appear in this report only as business-identifying detail for the audited account (consistent with the same treatment used in the existing `product-audit/` Bayut audit's PII note) — no third-party lead, tenant, or customer data was present in the account to begin with (0 leads, 0 assigned Ejar contracts, 0 bookings).

## Method Note

Design tokens marked `[DOM-verified]` in `07_DESIGN_SYSTEM.md` were read via read-only `getComputedStyle` inspection against the live authenticated session. Architecture notes in `08_TECHNICAL_OBSERVATIONS.md` marked `[Network-verified]` come from the browser's own network request log; no write/mutating request was ever inspected or issued beyond the read-only navigation this audit performed. Everything else is a direct screen observation unless explicitly marked `[Inferred]`.
