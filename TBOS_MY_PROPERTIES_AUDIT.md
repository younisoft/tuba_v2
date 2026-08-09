# TBOS My Properties — Phase A: Current State, Live Flow & Authority Integration Audit

**Status:** Read-only audit. No frontend, backend, database, or API code was modified during this phase.
**Auditor:** Claude Code, live-browser + source-code investigation.
**Date:** 2026-08-10

**Legend** — every material claim below is tagged:
`SOURCE FACT` (stated directly in the authority PDFs) · `CODE FACT` (confirmed by reading the Tuba Laravel repo) · `OBSERVED BEHAVIOR` (confirmed by driving the live production site) · `AUTHORITY REQUIREMENT` (a rule stated in the NHC/Takamolat integration guides) · `INFERENCE` (a reasonable conclusion not literally stated by any one source) · `ASSUMPTION` (a gap filled in without a source, flagged for review) · `OPEN QUESTION` (could not be resolved in this phase).

---

## 1. Executive Summary

Tuba's "My Properties" (عقاراتي) is a mature, Blade + jQuery/Bootstrap 4 server-rendered screen (`CODE FACT`) that already implements almost everything the future TBOS redesign needs to preserve: a two-branch ad-license flow (validate an existing REGA license, or mint a new one through Tuba), a three-tier promotion system (Basic/Featured/Pro) backed by a real subscription+quota ledger, a Photography/Video/Drone service-request system, and per-property performance counters. Both branches of the license flow were driven live end-to-end (through to the pre-publish review screen) using the supplied test data and matched the code precisely.

The single most important finding is architectural, not cosmetic: **Tuba does not talk to the NHC/Takamolat gateway described in the two integration-guide PDFs directly.** It proxies both `AdvertisementValidator` and `CreateADLicense` through its own legacy PHP endpoints (`live.tuba.com.sa/advertisement_validator.php`, `.../create_advertisement_license.php`) — see §8. This is a boundary the future TBOS backend will inherit or must replace; it is not visible from the UI at all.

Beyond that, this audit surfaces several concrete defects and gaps that should shape the redesign rather than be silently carried forward: a hardcoded, non-functional `attorneyCode` and a hardcoded `disclaimer: true` that ignores the real consent checkbox (§7, §9); no mapping for any of the 29 documented NHC error codes (§9); a direct-URL 500 error on the create-property route (§5); no Policy classes and only four coarse permissions governing five distinct actions (§16); a Nafath identity-verification callback that never validates its JWT signature (§9); and a "leads" metric that is displayed everywhere but is never actually incremented in reachable code (§14).

## 2. Scope

In scope: the My Properties list, both property-creation branches (licensed / unlicensed), the property detail/edit screen, promotion (Featured/Pro), services (Photography/Video/Drone), performance display, and the RBAC governing all of it — current state only. Out of scope (explicitly, per the governing instructions): any frontend/backend implementation, any new TBOS screens, any change to the live product or its data beyond the unavoidable side effect noted in §5.1.

## 3. Sources Reviewed

| # | Source | How reviewed |
|---|---|---|
| 1 | Live production platform, `https://tuba.com.sa/properties` | Driven directly via browser automation, authenticated as a real agent (see §5) |
| 2 | Tuba Laravel source, `C:\Users\YOUNES\Laravel projects\tuba` | Read via two full-repo research passes (backend/integration, frontend/RBAC) |
| 3 | `real-estate-authority/brokerage API-AdvertisementValidator V3.2 140925.pdf` | Read in full |
| 4 | `real-estate-authority/Brokerage-Create Advertise V2.1 160925.pdf` | Read in full |
| 5 | Internal Tuba audit docs already present in the repo (`web-project-audit/`, `phase4/`, `implementation-specifications/`, `tuba-current-state/`) | Read where materially relevant, cited inline |

## 4. Live My Properties Audit

`OBSERVED BEHAVIOR` unless noted.

**Header (both languages):** logo · "Post a listing" (dark) / "Get License by Tuba" (red) action pair · Verified-Agent (Nafath) badge with a green check · Fal License badge · Website link · language toggle · notification bell (badge "0") · avatar + first name.

**Sidebar:** Main (Dashboard) · Manage Listings (**My Properties** — active, Inbox, Property Requests) · Admin Settings · Manage Account (My Package, Team Management, My Profile, Account Setting) · The Packages (expandable: The Packages, Developer Packages, License Packages).

**Filters row:** Tuba Listing ID, REGA Ad License Number, title search, a sort dropdown (Newly Listed / Featured / Price asc / Price desc), Reset, Search, and an additional "Filters" dropdown (not expanded in this pass).

**Status tabs, this account:** Active (2) · Draft (0, became 1 mid-audit — see §5.1) · Pending (0) · Canceled (25) · Sold (1) · Expired (20) · Rejected (5). Matches `Property::STATUS_*` constants found in code (`CODE FACT`, `app/Models/Property.php`).

**Active-tab table columns:** Property (thumbnail + ad-type tier badge + title + city/postal + Tuba reference ID + REGA license number + posted/end dates + creator + price, all packed into a single table cell) · Status · Publish Type (shows "Package", i.e. which quota pool the listing was published under) · Performance (Reach / Views / Leads counters) · Upgrades (Pro / Featured / Renew tags) · Services (three unlabeled icon triggers — photography/video/drone) · Action (Edit, View, Delete icons).

**Row actions confirmed by href:**
- Edit → `/properties/{id}/edit` (same controller/view as create, per §6)
- View → `/property/{slug}` — the **public** listing page, not an internal preview (§15)
- Delete → `href="#"`, JS-driven (not traced further to avoid a destructive action)

**English/LTR rendering:** switching the language toggle produces a genuine mirrored layout (sidebar moves to the left, table reading order flips, RTL→LTR throughout), not merely translated text inside an RTL shell — confirmed via full-page screenshot comparison. One label inconsistency: the Arabic column header رصيد النشر ("publish balance") is translated to the English "Publish Type" — a different concept, not a literal translation (§18).

## 5. Current Add Property Flow

Two distinct entry points exist on the same page header, and they are **not** the two scenarios this audit expected — the mapping is:

- **"Post a listing" / إضافة عقار جديد** → opens the **Scenario A** modal (validate an existing REGA license).
- **"Get License by Tuba" / ترخيص إعلان** → opens the **Scenario B** modal (mint a brand-new REGA license through Tuba).

Both are Bootstrap modals injected into the same page (`postaListingModal` and a second, unnamed-in-DOM modal respectively) — confirmed via the accessibility tree; a direct full-page screenshot was needed once because a viewport-only screenshot missed the modal, which was not a rendering bug (§5, corrected on re-check with `fullPage: true`).

### 5.1 Direct navigation to `/properties/create` — 500 Server Error

Navigating straight to `https://tuba.com.sa/properties/create` (bypassing the modal-driven flow) returns an **HTTP 500 Server Error** (`OBSERVED BEHAVIOR`, screenshot captured). This independently reproduces a defect already screenshotted in the prior internal audit at `tuba-current-state/10_properties_create_500error.png` (`CODE FACT` / prior-audit corroboration) — this is a known, still-unfixed production bug, not a fluke of this session. The actual create flow only works when the license-validation modal sets state first and redirects to `/properties/create?id={n}`.

**Side effect disclosure:** completing Scenario A live (§5.2) with the supplied test data created a real, persisted **Draft** property on the authenticated account — "Compound For Rent Samith," Tuba ID 67215563, REGA ID 7200822986, status "Not Posted," visible under the Draft tab with working "Complete Information" (resume) and Delete actions. This was an unavoidable consequence of tracing the flow as instructed (the record is created as soon as the license validates, before any publish action — see §5.2) and was *not* published. It is left in place, deletable via the row's trash icon, so the account owner can decide whether to remove it.

### 5.2 Scenario A — Broker already has an ad license (test data: Unified Number `7021495051`, Ad License `7200822986`)

Full flow driven live, end-to-end, through to (but not past) the pre-publish review screen:

1. **Modal: "إضافة عقار جديد" ("Please enter the ad license data")** — fields: نوع الترخيص (License Type — toggle, defaulted to "منشأة"/Establishment), الرقم الموحد (Unified Number, placeholder `7000000001`), رقم ترخيص الإعلان (Ad License Number, placeholder `7200000001`). This maps directly to `AdvertisementValidator`'s `advertiserId`/`idType`/`adLicenseNumber` params (`CODE FACT`, `MinistryAPIs::advertisementValidatorAPI`).
2. Submitting **immediately validated against the live proxy and redirected** to `/properties/create?id=8257` — no visible loading state was needed at this response speed, and no error path was exercised because the supplied data validated cleanly.
3. **Property creation form**, pre-populated with a read-only "Ad License Details" card sourced entirely from the REGA response: license number, advertiser name (**شركة أسبار الموحدة التجارية** — a company, confirming the test identity resolves to an establishment), deed type ("Beneficial Ownership Deed" per translation), deed number (`CN-56321`), the *ad's* responsible-employee name and mobile (both distinct from the logged-in agent — see §11), property title/rooms/bathrooms/area/city/postal code, price, a QR code linking to the public REGA ad page, and a live Active/expiry badge.
4. **Additional Required Details** (everything not returned by REGA): Property Title (EN, pre-filled from the REGA title), Property Title (AR, pre-filled), Description (required, empty, with an "Generate Description" AI-assist trigger — not tested further), Video URL (optional), Parking Spaces (optional), Google Street View mode (dropdown), Rent Type (Yearly/etc.), Bathrooms, 360° virtual tour (optional), **Property Media (required, drag-and-drop)**, Property Floor Plans (drag-and-drop, not marked required), an amenities grid (~35 checkboxes, confirms `CODE FACT` count from `add.blade.php`), and a "Nearby Places" grid grouped by Education / Health / Transportation (~9 items visible).
5. **Package Information**: live credit balances pulled from the active subscription — Basic 36 remaining, Featured 6 remaining, Pro 4 remaining — with "Publish Now" / "Publish Later" actions.

Stopped here deliberately (§8 of the governing instructions: do not perform an irreversible final action). No error state, no rejected-license state, and no "already-used license" state were observed in this pass — all `OPEN QUESTION`s, see §27.

### 5.3 Scenario B — Broker has no ad license ("Get License by Tuba" modal)

Fields confirmed live, all present and matching the `CreateADLicense` input contract (`CODE FACT` cross-checked against `AUTHORITY REQUIREMENT`):

| Field (Arabic label, live) | Maps to | Required? |
|---|---|---|
| نوع المعلن (Advertiser Type) — dropdown | `advertiserType` | Yes |
| رقم الهوية الوطنية أو رقم الإقامة (National ID / Iqama) | `advertiserId` (when individual) | Yes |
| رقم عقد الوساطة (Brokerage contract number) | `brokerageContractNumber` | Yes |
| رقم وثيقة الملكية (Ownership document number) | `deedNumber` | Yes |
| السعر (Price) | `propertyPrice` | Yes |
| غرض الإعلان (Advertisement purpose — إيجار/بيع) | `advertisementType` | Yes |
| Disclaimer checkbox (verbatim regulatory text, see below) | `disclaimer` | Yes (HTML-required) |

All five `advertiserType` lookup values are present and match the authority spec exactly: وسيط فرد (Individual Broker), مالك فرد (Individual Owner), وكيل المالك (Owner's Agent), وسيط منشاة (Establishment Broker), مالك منشاة (Establishment Owner) — `OBSERVED BEHAVIOR`, matching `AUTHORITY REQUIREMENT` §11 of the Create AD License guide precisely.

The disclaimer text rendered live is **character-for-character identical** to the mandated text in the authority PDF:
> أقر بصحة المعلومات وبيانات العقار المدخلة أعلاه وأتحمل كامل المسؤولية في حال ثبت عدم صحة هذه البيانات، ويحق للهيئة إتخاذ كافة الإجراءات النظامية

However — this is a critical discrepancy between **what the UI shows the broker** and **what the code actually submits**: the code review (`CODE FACT`, `PropertyController::CreateADLicense`, `app/Http/Controllers/Backend/PropertyController.php:866`) confirms the checkbox's real state is **never read**; the payload sent to the Ministry hardcodes `"disclaimer": true` unconditionally. The broker is shown and asked to affirmatively check a legal attestation whose actual value is discarded. This was not re-verified against network traffic in this pass (submitting Scenario B would mint a real, live REGA ad license — an irreversible action explicitly forbidden by the governing instructions) but is a direct, cited code finding that the redesign must not silently inherit.

No field for `deedSerialNumber`, `attorneyCode`/POA, or advertiser mobile/name exists in this modal — matching the code finding that `deedSerialNumber` is hardcoded `null`, `attorneyCode` is a hardcoded constant (`452543857`, regardless of the actual agent), and advertiser name/mobile are pulled server-side from the agent's profile and latest Nafath verification record rather than asked in the UI.

## 6. Authority Integration (Tuba ↔ NHC/Takamolat)

`CODE FACT`, from the backend research pass.

Tuba's Laravel app does **not** call `integration-gw.housingapps.sa`/`integration-gw.nhc.sa` directly, and no `X-IBM-Client-Id`/`X-IBM-Client-Secret` credential handling exists anywhere in the repo (confirmed absent from `.env.example`, `config/*`, and `app/`). Instead:

- `MinistryAPIs::advertisementValidatorAPI()` GETs `http://live.tuba.com.sa/advertisement_validator.php` (prod) / `http://test.tuba.com.sa/...` (local) — a **separate, legacy PHP system not present in this repo** that presumably holds the real IBM Gateway credentials and talks to NHC on Tuba's behalf.
- `MinistryAPIs::CreateADLicenseAPI()` POSTs to the equivalent `create_advertisement_license.php` proxy.
- Response shape is one level deeper than the authority PDFs document: `data.Body.result...`, consistent with a wrapper the legacy proxy adds.
- All three Ministry-bound HTTP calls use **plain HTTP, not HTTPS** (`web-project-audit/11_SECURITY_AUDIT.md` Finding 14, independently corroborated) — national IDs, deed numbers, owner names and GPS coordinates travel unencrypted between Tuba's app server and the legacy proxy.

**Implication for TBOS:** the real government-integration boundary — credentials, retries, the authoritative request/response contract — lives outside every codebase reviewed in this phase. Any future backend work must either keep proxying through this legacy PHP layer or re-platform onto the NHC gateway directly; this is a decision this audit surfaces but does not make.

### 6.1 Response → Property field mapping (what actually gets normalized)

`Property::fillPropertyData()` maps the following AdvertisementValidator/CreateADLicense response fields into real, queryable `properties` columns: `propertyUsages[0]`, `mainLandUseTypeName` (via a hardcoded Arabic→English lookup), `advertisementType`→`property_status`, `numberOfRooms`, `propertyPrice`, `propertyArea`, `propertyAge`→`year_built`, `propertyType` (matched against a lookup table), region/city/district (`firstOrCreate` into dedicated tables), street/postal/city→`national_address`, building number, postal code, lat/long.

**Not mapped to any column** — surviving only inside a single `response_data` JSON blob (`agent_ad_validator_information` table): `deedNumber`, `deedSerialNumber`, `brokerageAndMarketingLicenseNumber`, `titleDeedTypeName`, all four border descriptions, `landNumber`, `planNumber`, `propertyFace`, `streetWidth`, `propertyUtilities`, `obligationsOnTheProperty`, `guaranteesAndTheirDuration`, `complianceWithTheSaudiBuildingCode`, `landTotalPrice`. A future TBOS backend that wants to query/filter/report on any of these (e.g., "properties with an active وقف/pawn constraint") cannot do so against the current schema without a migration — this data exists but is not structured.

## 7. Licensed Advertisement Flow — field/behavior summary

Covered in full in §5.2. Key acceptance-relevant behaviors confirmed live: the REGA-sourced card is genuinely read-only (no edit affordance was found on any of its fields); the additional-details form is the only editable surface; media upload is marked required and blocks progress in the code (`CODE FACT`, `add.blade.php`); the three-tier package picker shows real, live credit balances rather than static copy.

## 8. No-License Flow — field/behavior summary

Covered in full in §5.3. The flow is a single modal/form, not a multi-step wizard — all fields collected in one screen, then (per code) submitted to `CreateADLicenseAPI()`, which on success calls the same `Property::fillPropertyData()` used by Scenario A, landing the broker on the identical "Additional Required Details" form from §5.2 step 4 onward. **This was not driven past the disclaimer/submit step live**, since a real REGA license would be minted (irreversible, forbidden by the governing instructions). The full server-side payload construction (including the two hardcoded fields flagged in §5.3) was confirmed by code, not by network trace.

## 9. Existing Tuba Source Code Findings (consolidated)

- **`attorneyCode` is a hardcoded constant** (`452543857`) sent on every `CreateADLicense` call regardless of whether the agent has a real power of attorney, is a different attorney, or needs none — `CODE FACT`, `PropertyController.php:855`. No POA/attorney-code input exists anywhere in the UI.
- **`disclaimer` is hardcoded `true`** — the real checkbox state is discarded (§5.3).
- **No mapping exists anywhere in the codebase for the 29 documented `CreateADLicense` business-rule error codes** (`AUTHORITY REQUIREMENT`, Create AD License PDF §"Error codes"). Errors surface as raw, unmapped Arabic strings passed straight from the proxy response.
- **`rega-notifications` webhook has no authentication middleware at all**, unlike the adjacent `store-property-data` endpoint which is protected — `CODE FACT`, independently tracked as `SEC-006` in `implementation-specifications/EP-04-government-integration-hardening-rega-nafath-fal.md`.
- **Nafath JWT signature is never verified** (`web-project-audit/11_SECURITY_AUDIT.md` Finding 4, Critical) — the callback trusts a base64-decoded, unsigned-checked payload. Since `users.is_verified` gates `CreateADLicense`, this is a direct integrity gap on the exact flow this audit examines: a forged "verified" identity could in principle reach a real government ad-license submission.
- **No Laravel Policy classes exist anywhere in the repo** — RBAC is entirely ad hoc role-string/permission-string checks (§16).
- Two parallel, uncoordinated package/quota systems exist: `agent_packages`/`agent_package_detials`/`property_usages` (ad-posting tiers) vs. `agent_license_packages`/`no_of_license` (ad-license *minting*) — a Pro/Featured upsell and a brand-new REGA license draw from entirely separate wallets.

## 10. User Account Data

`CODE FACT`, `users` table + related. Already stored, and therefore should **not** be re-asked in a redesigned flow: `agent_type` (individual vs. company — the broker-type flag), `company_name`, `mobile_number`, `id_number` (national ID/Iqama), the four-part Nafath-style legal name (`father_name`/`grand_father_name`/`family_name` + `name`), `is_verified` (Nafath status), `fal_license_verified`. A separate `agent_users` table models the establishment→sub-agent ("Agent User") relationship (one office, many linked employee accounts).

One inconsistency worth flagging: `CreateADLicense()` re-derives national ID/full name from the **latest Nafath verification row**, not from `users.id_number` directly — two sources of truth for the same fact, observed live too (§5.2 step 3: the ad's "responsible employee" name/mobile differed from what would be expected purely from the login profile, consistent with this Nafath-row-based lookup).

## 11. Data Source Analysis

| Field | Source | Evidence |
|---|---|---|
| Advertiser Type | User input (this transaction) | §5.3 dropdown |
| National ID / Unified Number | User input (Scenario A/B) *or* Tuba DB (`users.id_number`) *or* latest Nafath row, depending on path | §5.2, §10 |
| Ad License Number | Authority response (Scenario A) / Authority-issued (Scenario B) | §6.1 |
| Advertiser Name | Authority response (company) / Nafath verification (individual) — never user-typed once identity resolves | §5.2 step 3, §10 |
| Brokerage Contract Number | User input | §5.3 |
| Deed / Ownership Document Number | User input (Scenario B) / Authority response (Scenario A) | §5.2, §5.3 |
| Price | User input, validated server-side against the brokerage contract's price (`AUTHORITY REQUIREMENT` #12/#29) | §5.3 |
| Advertisement Purpose (Sell/Rent) | User input | §5.3 |
| Property Title/Description/Media/Amenities | User input, 100% (never returned by the authority) | §5.2 step 4 |
| Region/City/District/Lat-Long | Authority response, normalized into DB | §6.1 |
| Deed borders, plan/land number, utilities, obligations | Authority response, **not normalized** — JSON blob only | §6.1 |
| Disclaimer consent | UI-collected but **discarded** — always submitted as `true` | §5.3, §9 |
| POA/Attorney Code | Not collected — hardcoded constant | §5.3, §9 |

## 12. Promotion Audit (Featured/Pro)

`OBSERVED BEHAVIOR` + `CODE FACT`. Three tiers exist: Basic (`normal_ads`), Featured (`unique_ads`), Pro (`distinguished_ads`) — chosen either at creation time (§5.2 step 5) or via post-creation upgrade tags in the list row.

Clicking either upgrade tag first triggers a real, working license-validity guard — live confirm dialog "The ad license is valid for N more day(s). Do you still want to continue?" (`checkAdLicenseDate`, AJAX-backed) — observed identically for both Pro and Featured, in both languages. Proceeding opens a genuinely functional **"Request Pro/Featured Listing Upgrade"** modal: expiry-date notice ("set to 30 days"), and a real Payment Method choice between **Package** (deducts from the live credit balance — observed "4 Pro Listing" / enough-credit indicator) and **Credit Card** (a real SAR price — observed 275 SAR for Pro). Not submitted, per the governing instructions (§8) — this is exactly the "irreversible action" boundary to document, not cross.

**This live result is an important correction to the source-code finding**, not a confirmation of it: the backend research pass found `handleFormSubmission` calls for these forms commented out in `public/js/properties/agent_index.js`, concluding the upgrade forms were non-functional. Live testing shows the modal opens, is fully populated with real account data, and presents a working payment choice — so either a different/newer script now serves this page than the one read in the repo checkout, or the dead code found is a *previously* broken path that has since been superseded. **Flagged explicitly in §23 rather than silently reconciled**, per instructions.

`is_featured` (a boolean column) appears vestigial next to the real `ad_type` tiering mechanism — `CODE FACT`, no controller writes to it.

## 13. Property Services Audit (Photography/Video/Drone)

Same correction applies here. Clicking the Photography icon opened a fully functional **"Request Photography Service"** modal: Date & Time picker, free-text Comments, and the same Package (live "1 Photograph Service Left" balance) vs. Credit Card (1000 SAR) choice — `OBSERVED BEHAVIOR`, contradicting the code-level "dead JS" finding for at least this trigger. Not submitted (§8).

The code-level gap that live testing could *not* disprove (since submitting was out of scope): `Backend\PropertyServiceRequestController::store()` is confirmed (`CODE FACT`) to be an **empty stub** — even a successfully-submitted request has no server-side handler to actually create the fulfillment record via that path. The only confirmed end-to-end-wired path is the **credit-card checkout success callback** (`PaymentService::handlePhotographyServiceLogic`), and even that has no admin-side status/fulfillment workflow beyond a read-only list. Drone specifically is excluded from the package-deduction endpoint's allowed `type` values (`CODE FACT`, `PaymentController.php:48`) — a drone request submitted via the Package path would be rejected server-side even though its icon is presented identically to the other two.

## 14. Performance Audit (Views/Clicks/Leads)

Live table shows **Reach / Views / Leads** (not "Clicks" — no such field exists in the codebase; the audit brief's assumption of a "Clicks" metric does not match reality, `OPEN QUESTION` resolved: it's "Reach" instead). Two parallel, uncoordinated tracking mechanisms exist in code: a real per-visit `views` table (via `cyrildewit/eloquent-viewable`) and a homegrown `Metric` model (`reaches`/`views`/`leads`) — only `reaches` is actually incremented anywhere reachable; `leads` has exactly one call site and it is commented out (`CODE FACT`). The live "Leads: 0" on both active properties is consistent with this — not a data-entry artifact but the expected steady state of a metric that is never written. No trend/chart view exists; only point-in-time totals are shown, matching the internal doc finding that the dashboard's "View Statistics" chart is decorative, hardcoded sample data unrelated to real properties.

## 15. Property Detail Audit

No internal "detail/manage" screen distinct from Edit exists — the row's "View" action goes to the **public** listing page (`/property/{slug}`), the same page a buyer/renter would see. Confirmed live: title, price/period, gallery, Description, Property Details (Reference ID, Price, Size, Bedrooms, Bathrooms, Garage), Property Utilities, a **"REGA Verified Information"** card (Responsible Employee Name/Mobile, FAL License Number, Advertising License Number, License Issued/Expiry — a second, public-facing rendering of the same REGA data shown privately in §5.2), a location map with an explicit "location according to the deed may not match" disclaimer, Floor Plans, What's Nearby, a review form, similar properties, and an agency profile card.

Two defects observed on this page: **13 console errors / 10 warnings** on load, and a **visually duplicated header/navigation bar rendering mid-document** (a second full nav strip appears between the gallery and the Description section, overlapping content) — both `OBSERVED BEHAVIOR`, screenshot captured.

## 16. RBAC Audit

`CODE FACT`. Package: `spatie/laravel-permission`. **Zero Policy classes exist.** A single global `Gate::before` unconditionally grants SuperAdmin everything. `PropertyController`'s constructor gates exactly four actions: `property-list` (index/show), `property-create` (create/store), `property-edit` (edit/update), `property-delete` (destroy) — there is no fifth permission for "promote" or "request a service"; the Pro/Featured/Photography/Video/Drone triggers in the list row are **ungated by any permission check at all**, confirmed both in code and by the fact that these triggers rendered and opened fully for this session without any distinguishable capability check. Only the `SuperAdmin` role is actually seeded by any seeder — `Agent`/`Agent User`/`User` are referenced pervasively in code but have no seed-time creation path, an undocumented bootstrap gap on any fresh environment.

Compare to TBOS's four-layer model (route/UI/API/record): this legacy system has route-level enforcement only for the four core CRUD actions, no record-level (agency/ownership-scope) enforcement beyond ad hoc `scopeListBy()` string comparisons, and no UI-level or API-level enforcement at all for promotion/services actions.

## 17. UX Audit

Severity classified P0–P3.

- **P0** — `/properties/create` 500s on direct navigation (§5.1); only reachable via the modal-set-state-then-redirect path. A bookmarked or shared link, a back-button return, or a page refresh mid-flow all plausibly hit this.
- **P0** — Disclaimer checkbox is cosmetic; its value is discarded and `true` is always sent to a government system (§5.3, §9). This is a compliance-shaped risk, not just a UX one.
- **P1** — Promotion/Service triggers carry zero permission check (§16) despite being real, wallet-consuming, payment-adjacent actions.
- **P1** — Two authority-facing "add a property" entry points ("Post a listing" vs. "Get License by Tuba") are not visually or conceptually distinguished as "I have a license" vs. "I need one" — a first-time user has no way to know which button to press without already knowing the business rule.
- **P2** — The entire property "card" in the list table is one packed, unstructured table cell (image alt text is the literal filename `fp2.jpg`) — real accessibility and semantic-structure cost, not just cosmetic (§19).
- **P2** — A floating "Scroll to bottom" action button visually overlaps interactive row content (license number text on mobile, delete icon at 1440px) — reproduced at three different viewport widths.
- **P2** — `leads` is displayed as a first-class performance metric everywhere in the UI but is never incremented in reachable code (§14) — the number is not wrong, it is structurally incapable of ever being anything but 0.
- **P3** — Column-header translation drift: رصيد النشر → "Publish Type" (§4) changes the concept, not just the language.

## 18. Responsive Audit

Captured at 1440×900 (desktop), 768×1024 (tablet), 390×844 (mobile) — the property-creation form (heaviest screen tested).

- **1440px:** full sidebar, multi-column form, REGA card and title stacked side-by-side. No issues.
- **768px:** sidebar collapses entirely to a "Dashboard Navigation" dropdown — there is no intermediate/hybrid tablet treatment (e.g., icon-only rail); it is the same collapsed pattern used at mobile width, just with a two-column form still visible. The floating scroll button overlaps form spacing near "Property Title."
- **390px:** single-column stack, header collapses to hamburger + logo + avatar. The floating scroll button directly overlaps the REGA license-number text, partially obscuring it (screenshot captured).

Only two effective breakpoints were observed (desktop vs. "everything else"), not three tuned tiers — worth deciding deliberately, not by omission, for the TBOS redesign.

## 19. Arabic/English Audit

Full LTR mirror confirmed on the list page (§4) — a genuine structural flip, not a translated RTL shell. The property-creation form was tested primarily in Arabic (the account's default); a full field-by-field bilingual pass of that specific form (labels, placeholder direction, numeral formatting in the QR/price fields) was not completed in this phase — `OPEN QUESTION`, flagged for the next audit pass or for Phase B to re-verify once the new form exists. One confirmed drift: "Publish Type" vs. رصيد النشر (§4/§17).

## 20. Accessibility Audit

- Property image alt text is the literal filename (`fp2.jpg`) — no descriptive alt anywhere in the sampled rows.
- The entire property card (image, ad-type badge, title, location, two reference numbers, three dates, creator, price) is one single `rowheader` cell with no internal semantic subdivision — a screen reader gets one long undifferentiated string per property.
- The three Services triggers (Photography/Video/Drone) are unlabeled interactive elements (`generic`/`img` with `cursor:pointer` but no accessible name) — confirmed via accessibility-tree inspection, not just visual inspection.
- By contrast, the SweetAlert2-based confirm dialogs (license-validity check) and the Bootstrap upgrade/service modals **are** properly structured (`dialog` role, real `heading`, real `button` elements, labeled radios) — accessibility quality is inconsistent within the same page, not uniformly poor.
- The disclaimer checkbox in the no-license modal does have a correct, full accessible name (§5.3) — another point of inconsistency against the unlabeled service icons on the same general screen family.

## 21. Current UX Problems (roll-up)

See §17 for the severity-classified list; the pattern across all P0/P1 items is the same: **the UI presents an action as fully real (a checkbox, a credit balance, a payment choice) while the code either discards the input or has no fulfillment path behind it.** This is the single throughline the TBOS redesign needs to resolve, not any one individual field.

## 22. Missing States

Not observed in this pass (`OPEN QUESTION`, not `NOT FOUND` — these require producing an actual error, which risks an irreversible/destructive action and was avoided per §8):
- A rejected/invalid license number in Scenario A.
- Any of the 29 documented `CreateADLicense` business-rule errors, live.
- A property in the Pending/Rejected/Expired/Canceled/Sold tabs' full detail (only their counts and the Draft tab's row were inspected).
- A failed media upload / retry affordance.
- The "no active package to deduct from" error path (§9, `AUTHORITY REQUIREMENT` error #28).

## 23. Missing Capabilities / Confirmed Gaps

- No admin-side fulfillment workflow for Photography/Video/Drone requests beyond a read-only list (§13).
- No structured storage for deed borders, plan/land number, obligations, or Saudi-Building-Code compliance — only inside an opaque JSON blob (§6.1).
- No error-code-to-user-message mapping for either Ministry API (§9).
- No record-level (agency/ownership) permission enforcement for promotion or services actions (§16).
- No trend/history view over performance metrics — point-in-time only (§14).

## 24. Discrepancy Matrix

| Topic | Live | Tuba Code | Authority Docs | Difference | Recommendation |
|---|---|---|---|---|---|
| Pro/Featured upgrade submit handler | Fully functional modal, real credit balance, working payment choice | `handleFormSubmission` calls for these forms found commented out in `agent_index.js` | N/A | Code and live behavior disagree | Re-verify which JS file production actually serves before assuming either source is current; do not silently trust the code-only finding |
| Photography service request | Fully functional modal, real credit balance | `PropertyServiceRequestController::store()` is an empty stub | N/A | The modal renders/validates but code shows no confirmed persistence path | Trace the actual submit network call (out of scope here) before Phase B; do not assume the request is silently lost, but do not assume it's saved either |
| Disclaimer checkbox | Presented as a real, required legal attestation, exact authority wording | Value is read but never sent; payload hardcodes `true` | Disclaimer is a mandatory input field | UI promises something the backend does not deliver | Must not be repeated in TBOS — either wire the real value through or don't present a checkbox |
| "Clicks" metric | Table shows Reach/Views/Leads — no Clicks field anywhere | No `clicks` column/field found in codebase | N/A | The audit brief's assumed metric name doesn't exist | Use Reach/Views/Leads as the real vocabulary going forward |
| POA/Attorney Code | No input field exists | Hardcoded constant sent regardless of actual agent | POA required unless specific ownership/approval conditions are met (§7 of Create AD License guide) | A real authority requirement is silently defaulted around | Must be a real, conditional field in TBOS, matching the authority's own required/not-required matrix |

## 25. Requirements Matrix

| Requirement | Source | Current Behavior | Observed? | Future UX Requirement | Backend Dependency | Open Question |
|---|---|---|---|---|---|---|
| Validate an existing ad license before property creation | Live + Code | Modal → proxy call → redirect with pre-filled REGA card | Yes | Preserve as the "I already have a license" entry, visually distinguished from "I need one" | AdvertisementValidator proxy | Error/invalid-license path not observed |
| Mint a new ad license for an unlicensed broker | Live + Code | Single-form modal, 5 advertiser types, verbatim disclaimer | Yes (through submission-readiness; not submitted) | Preserve all 5 advertiser-type branches; wire real disclaimer value; add real POA field | CreateADLicense proxy | Full submit + resulting states not observed |
| Property creation additional-details form | Live + Code | Title/description/media/amenities/nearby-places/package-tier | Yes | Preserve; media-required gate already correct | Property create/update endpoints | AI "Generate Description" behavior not traced |
| Promotion tiers (Basic/Featured/Pro) | Live + Code | Real quota ledger, live credit balances, Package vs. Credit Card | Yes | Preserve dual payment path; add missing permission gate | Package/PropertyUsage system | Confirm which JS actually serves prod (§23) |
| Property services (Photography/Video/Drone) | Live + Code | Booking modal functional; fulfillment backend stubbed | Partially | Preserve booking UX; build the missing fulfillment workflow; fix Drone's excluded `type` | PropertyServiceRequest + PaymentController | Actual submit outcome not traced |
| Performance display (Reach/Views/Leads) | Live + Code | Point-in-time only; Leads never increments | Yes | Decide deliberately whether Leads stays as a metric or is removed/rebuilt | Metric / eloquent-viewable | — |
| RBAC for promotion/service actions | Code | No permission gate exists | Yes (absence confirmed both ways) | Must get a real permission key in TBOS's 4-layer model, unlike the legacy 4-permission-only scheme | permission registry | — |
| Public property page REGA card | Live | Duplicates the private REGA card's data, public-facing | Yes | Decide what regulatory data is appropriate to expose publicly vs. privately | — | Console-error root cause not diagnosed |

## 26. Backend Dependency Map

Documentation only — nothing here is implemented in this phase.

| Frontend capability | Read API | Write API | Validation | Permission | Persistence | External dependency |
|---|---|---|---|---|---|---|
| Validate existing license | Get advertisement details | — | adLicenseNumber/advertiserId/idType present | `properties.create` (new key needed) | `agent_ad_validator_information` (or TBOS equivalent) | AdvertisementValidator (via whatever proxy TBOS chooses) |
| Mint new license | — | Create license | Full field set incl. real disclaimer + conditional POA | `properties.create` | Same table, `addlicensestore`-equivalent | CreateADLicense |
| Create/edit property | Get property, get lookups | Create/update property | Media required, title/price/etc. required | `properties.create`/`properties.edit` | `properties` + normalized location tables | fillPropertyData-equivalent mapping |
| Promote (Featured/Pro) | Get package balance | Deduct credit / charge card | License-validity check (≥N days) | New key: `properties.promote` | Package/quota ledger | Payment gateway (credit-card path) |
| Request service | Get service pricing/quota | Create service request, deduct/charge | Date/time required | New key: `properties.services.request` | `property_service_requests` (needs real fulfillment states) | Payment gateway |
| Performance display | Get metrics | (system-incremented, not user-write) | — | `properties.view` | Metric/views tables — needs consolidation to one source of truth | — |

## 27. Proposed Future UX Architecture (proposal only — not implemented)

**My Properties**
- List / Filters (Tuba ID, REGA license, title, status tabs) / Search
- Per-property: Status · Performance (Reach/Views — reconsider Leads until it's real) · Promotion tier · Services shortcuts · Actions

**Property Detail** (a real internal detail screen — currently missing, §15)
- Overview · Advertisement/License (the REGA card, privately) · Performance · Promotion · Services · Activity · Actions

**Add Property** — two clearly-labeled entry points, not "Post a listing" vs. an ambiguously-named second button:

```
Flow A — Has Advertisement License
Ad License Number + Advertiser ID/Type
        ↓
Authority Validation (real error states surfaced, not just the happy path)
        ↓
Review pre-filled REGA data (read-only)
        ↓
Property Setup (title/description/media/amenities — everything REGA doesn't provide)
        ↓
Promotion tier selection (real balances)
        ↓
Publish Now / Save Draft
```

```
Flow B — No Advertisement License
Advertiser Type (5 branches, matching the authority matrix exactly)
        ↓
Identity (pulled from Tuba/Nafath where already known — never re-asked)
        ↓
Brokerage Contract + Ownership Document
        ↓
Advertisement Info (price, purpose) — validated live against contract price
        ↓
POA (only when the authority's own matrix requires it — not hardcoded)
        ↓
Disclaimer (value genuinely wired through, not discarded)
        ↓
Authority License Creation (real error-code mapping, not raw strings)
        ↓
→ joins Flow A at "Review pre-filled REGA data"
```

## 28. Open Questions

1. Why does live behavior for the Pro/Featured upgrade and Photography-service modals contradict the "dead JS" code finding — is production running different JS than this checkout? (§23, §24)
2. What actually happens on a rejected/invalid license number, or any of the 29 documented error codes, in the live UI? (§22)
3. What is the root cause of the 13 console errors / duplicated header on the public property page? (§15)
4. Is Nafath actually wired to production, or permanently pointed at the sandbox endpoint? (`web-project-audit/11_SECURITY_AUDIT.md`, unresolved even in that prior audit)
5. Does the "Filters" dropdown (not expanded in this pass) surface additional fields (city/district/type/price range) confirmed to exist in code but not yet visually inspected live?
6. What is the full bilingual (EN label/placeholder/direction) state of the property-creation form specifically — only spot-checked, not exhaustively verified (§19)।

## 29. Assumptions

- That the residual Draft property created in §5.1 is an acceptable, disclosed side effect of tracing the flow as instructed, rather than a violation of the "no destructive actions" rule — it is reversible (delete action confirmed present) and was disclosed immediately.
- That "Clicks" in the original brief was an approximation for what the product actually calls "Reach" — treated as resolved via §14/§24 rather than left open.
- That the two source-code/live-behavior discrepancies in §24 should be flagged rather than arbitrated — per the explicit instruction not to silently reconcile differing sources.

## 30. Recommended Next Step

**UX Architecture Review** of this document, specifically: (a) confirm the Flow A/B entry-point relabeling in §27 matches product intent, (b) decide the Leads-metric question in §14/§25 before it's carried into any new schema, (c) decide how much of the REGA JSON-blob data (§6.1) needs to become queryable in TBOS, (d) resolve Open Questions #1 and #2 with either a second live pass or direct network-trace access, since they materially affect how much error-handling UI Phase B needs to design for.

Per the governing instructions: **implementation has not started, and Phase B (My Properties UX Architecture + Frontend Implementation) has not been auto-started.** Stopping here for review.

---

## Screenshots captured this session

All saved to the `tuba_v2/` root (repo-relative), for reference during review:
`audit-01-homepage.png` · `audit-02-myproperties-list.png` · `audit-03-featured-modal.png` · `audit-04-adlicense-modal.png` · `audit-05-properties-create-500.png` · `audit-06-addproperty-modal.png` · `audit-07-addproperty-modal-fullpage.png` · `audit-08-property-create-form.png` · `audit-09-mobile-390-create-form.png` · `audit-10-tablet-768-create-form.png` · `audit-11-english-list.png` · `audit-12-pro-click-result.png` · `audit-13-pro-upgrade-modal.png` · `audit-14-photography-click.png` · `audit-15-draft-tab.png` · `audit-16-public-property-detail.png`
