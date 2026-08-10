# TBOS My Properties — Screen Inventory

**Status:** Documentation only. Companion to `TBOS_MY_PROPERTIES_UX_ARCHITECTURE.md`.
**Screen count:** 3 routed screens (all reused/redesigned, not new — see §0 of the architecture doc), plus 2 pattern-level overlays that are explicitly *not* counted as separate screens, consistent with the existing PROJ-02 Drawer precedent.

---

## PROP-01 — Properties List (redesigned)

- **Screen ID:** PROP-01 (existing, route `/properties`, unchanged)
- **Name:** My Properties
- **Purpose:** Portfolio-wide scan of every property the broker/agency can see — status, price, license expiry, at-a-glance performance and promotion tier.
- **Entry points:** Rail navigation ("Properties"), Global Search, post-creation redirect from PROP-03.
- **Main content:** Search + filter toolbar (Tuba ID, REGA license, title, status), status tabs (Active/Draft/Pending/Sold/Expired/Rejected/Canceled — pending §0's open vocabulary question), property card/row list, each row/card carrying a **quick performance summary** (Reach + Views only, per the architecture doc §8.6 — Leads and every future engagement metric are reserved for Property Detail, never shown at list density).
- **Primary action:** Add Property (→ Entry Decision → PROP-03 Flow A/B).
- **Secondary actions:** Edit, Promote (unified entry point, architecture doc Decision 04), per-row overflow menu (Delete, Duplicate, Request Service — unified entry point, Decision 05).
- **States:** Loading (skeleton rows/cards), Empty (no properties at all — guided "add your first property" CTA, matching the existing onboarding pattern), No results (filtered to zero), Error, Success (populated list), Restricted (`RestrictedState` if `properties.view` is denied at record scope).
- **Permissions:** `properties.view` **(EXISTING)** (route/UI); Add Property gated by `properties.create` **(EXISTING)**; Delete by `properties.delete` **(EXISTING)**; Promote by `properties.promote` **(PROPOSED — BACKEND-DEPENDENT)**; Request Service by `properties.services.request` **(PROPOSED — BACKEND-DEPENDENT)**.
- **Data dependencies:** Property records (status, license, price, district), quick Performance summary (Reach/Views — `CURRENTLY VERIFIED`), Promotion tier, active package/quota summary.
- **Backend dependency:** Property list/search/filter API; consolidated performance-metric read for Reach/Views (§14 of the audit — currently two uncoordinated sources even for the two verified metrics).
- **Authority dependency:** Indirect only (license-expiry display reads authority-sourced data already persisted on the property).

## PROP-02 — Property Detail (redesigned, now with tabs)

- **Screen ID:** PROP-02 (existing, route `/properties/:propertyId`, unchanged)
- **Name:** Property Detail
- **Purpose:** Single internal source of truth for one property — replaces the legacy behavior of leaking "View" to the public listing page (§15 of the audit).
- **Entry points:** PROP-01 row click, Global Search, contextual links from Leads/Contracts (matching existing PROP-02 precedent in the blueprint).
- **Main content:** `EntityDetailHeader` (title, status, primary actions) + six tabs: Overview, Advertisement, **Performance (CORE)**, Promotion, Services, **Activity (IMPORTANT/FUTURE IMPLEMENTATION)**. Performance and Activity are never merged — one describes audience behavior, the other describes internal history (architecture doc Decision 03).
- **Primary action:** Edit (→ PROP-03 in edit mode); tab-contextual primary actions (Promote on Promotion tab, Request on Services tab).
- **Secondary actions:** Archive/Delete, Duplicate as new listing, per-tab secondary actions (e.g., re-score content quality if that AI capability is ever wired here — not committed in this phase).
- **States:** Loading (skeleton matching tab layout — matches existing PROP-02 discipline), Error (tab-level graceful degradation, matching existing pattern), full lifecycle status set per the State Matrix, Restricted (per-tab — e.g., Advertisement tab may require a different scope than Overview, mirroring the existing "Compliance tab needs OM/AO scope" precedent already established for PROP-02). Performance tab additionally carries per-metric current/future states (architecture doc §8.4).
- **Permissions:** `properties.view` **(EXISTING)** (route); tab-level: Overview/Performance/Activity under `properties.view` **(EXISTING)**; edit actions under `properties.edit` **(EXISTING)**; Promotion tab actions under `properties.promote` **(PROPOSED — BACKEND-DEPENDENT)**; Services tab actions under `properties.services.request` **(PROPOSED — BACKEND-DEPENDENT)**.
- **Data dependencies:** Full property record, REGA/authority-sourced fields (§6.1 — including the currently-unnormalized JSON-blob fields, pending a schema decision), media, full Performance metric set (Reach/Views/Leads `CURRENTLY VERIFIED`; Clicks/Contacts/Calls/WhatsApp/Visit Requests/Favorites/Shares `FUTURE/BACKEND-DEPENDENT`, architecture doc §8.1), Promotion tier + history, Service request history, Activity log (net-new, no current data source).
- **Backend dependency:** Property detail read/update API; authority-data read (however normalized); promotion request API; service request API; activity log API (net-new — no equivalent exists in legacy, §1 of the architecture doc); consolidated performance-metric API plus new event-tracking pipelines for every `FUTURE/BACKEND-DEPENDENT` metric.
- **Authority dependency:** Direct — the Advertisement tab renders authority-sourced data and (for re-validation, if ever needed) would call AdvertisementValidator again.

## PROP-03 — Create/Edit Property (redesigned, two-flow wizard)

- **Screen ID:** PROP-03 (existing, route `/properties/new`, unchanged; edit mode reuses the same screen per existing `?propertyId=` query-param convention already established in this codebase)
- **Name:** Add / Edit Property
- **Purpose:** Guided creation covering both the licensed and unlicensed authority paths, replacing the current generic single-path wizard's placeholder compliance step.
- **Entry points:** PROP-01 "Add Property" primary action → Entry Decision screen → Flow A or Flow B; Edit entry skips the Entry Decision (a license already exists by definition).
- **Main content:** Entry Decision (Yes/No license question) → `FormWizard` + `StepIndicator`, step content per §4.1 (Flow A: License Input, Advertiser Type defaulted from account per Decision 01 → Verification → Review → Property Setup → Promotion Tier → Review & Publish) or §4.2 (Flow B: Advertiser Type, same account-default behavior → Identity → Brokerage Contract → Ownership Document → Advertisement Info → POA (conditional) → Declaration → License Creation → joins Flow A's Review step). Changing Advertiser Type away from its default cascades to dependent fields/labels/validation/identity requirements/Review Summary per architecture doc §4.3.
- **Primary action:** Advance step; final step: Publish Now / Save Draft.
- **Secondary actions:** Save Draft at any step past property-record creation (matching legacy's early-draft-creation behavior, §5.1 of the audit), regenerate AI description, remove uploaded media (scoped retry per file).
- **States:** Empty (fresh wizard, requirements shown before first field — matches existing PROP-03 discipline), Loading (authority verification, non-blocking per §5 of the architecture doc), Validation error (inline, per-field), Authority error (full expanded taxonomy per architecture doc §5 — invalid format, invalid license number, invalid advertiser identifier, license not found, license belongs to another advertiser, advertiser/license mismatch, authority unavailable, authority timeout — every one mapped to plain language, never a raw error code), Success (two-terminal-state: Active or explicit Draft, never ambiguous — matches existing `06_STATE_ARCHITECTURE.md` discipline).
- **Permissions:** `properties.create` **(EXISTING)** (route); `properties.edit` **(EXISTING)** when reached in edit mode.
- **Data dependencies:** Lookups (owners, districts), authority verification response, package/quota balances (for the Promotion Tier step), Tuba/Nafath-known identity fields (to auto-fill and avoid re-asking, §10 of the audit).
- **Backend dependency:** AdvertisementValidator proxy call; CreateADLicense proxy call (with real error-code mapping, §5/§9); property create/update; media upload; package-balance read.
- **Authority dependency:** Direct and central — this is the one screen where the authority integration is the primary subject, not a side detail.

---

## Non-screen overlays (explicitly not counted as separate screens)

### Promotion Request (Drawer, launched from PROP-01 or PROP-02 → Promotion tab) — one unified pattern (Decision 04)
- **Purpose:** License-validity check → tier selection → Package/Credit-Card payment choice → confirmation. One shared drawer shape parameterized by tier (Pro/Featured/future tiers), not a separate implementation per tier.
- **Permissions:** `properties.promote` **(PROPOSED — BACKEND-DEPENDENT, not yet in the permission registry)**.
- **Data dependencies:** License expiry, live package balance, credit-card price.
- **Backend dependency:** `checkAdLicenseDate`-equivalent guard; promotion request/payment API.
- **Why not a screen:** Matches the existing PROJ-02 precedent (Unit add/edit uses a `Drawer`, not a routed screen) — this is a focused, interruption-worthy sub-task of Property Detail, not an independent destination.

### Service Request (Drawer, launched from PROP-01 overflow or PROP-02 → Services tab) — one unified pattern (Decision 05)
- **Purpose:** Date/time + comments → Package/Credit-Card payment choice → confirmation. One shared drawer shape parameterized by service type (Photography/Video/Drone), not three bespoke implementations.
- **Permissions:** `properties.services.request` **(PROPOSED — BACKEND-DEPENDENT, not yet in the permission registry)**.
- **Data dependencies:** Live service-credit balance, service price.
- **Backend dependency:** Service request creation (currently a confirmed empty stub in legacy code, §13/§23 of the audit — a real blocker before this can go live, not just a documentation gap); for Drone specifically, the payment-type allow-list fix (§7 of the architecture doc) is a precondition, so the Package payment option must not be offered for Drone until that's resolved.
- **Why not a screen:** Same reasoning as Promotion Request.
