# TBOS My Properties — Phase B: UX Architecture

**Status:** Architecture documentation only. No frontend/backend code was written, modified, or scaffolded in this phase.
**Depends on:** `TBOS_MY_PROPERTIES_AUDIT.md` (Phase A) — every finding cited here (§N) refers to that document's numbered sections.
**Labels used throughout:** `CURRENT CAPABILITY` (legacy Tuba already does this) · `FUTURE UX REQUIREMENT` (TBOS should do this, informed by evidence) · `BACKEND DEPENDENCY` (needs a future API/data contract) · `OPEN BUSINESS DECISION` (no source resolves this — needs a human call) · `INFERENCE` (a reasonable conclusion, not literally sourced).

---

## 0. Relationship to the Existing TBOS Build

This is not a greenfield design. **PROP-01 (Properties List), PROP-02 (Property Detail), and PROP-03 (Create/Edit Property)** already exist in `tbos-frontend` — built in an earlier phase of this project, before the Phase A audit existed. That earlier build is a legitimate, working first pass, but it was necessarily generic: a five-step wizard (Requirements → Details → Compliance → Media → Review) against a **mocked** FAL/REGA/Nafath compliance checklist, an eight-state lifecycle shared with Projects, and no Promotion, Services, or Reach/Views/Leads Performance surface at all — because none of that had been verified yet.

This architecture is the **informed redesign of those same three screens** (same screen IDs, same routes, same permission keys — `properties.view`/`properties.create`/`properties.edit`), not a fourth/fifth/sixth screen. Where this document's flows diverge from what's already built, that divergence is the point: it's what Phase A verified that the earlier pass couldn't have known. Two genuinely new interaction surfaces are introduced — **Promotion Request** and **Service Request** — but per the existing convention (Units in PROJ-02 use a `Drawer`, not a new screen ID), these are pattern-level overlays inside PROP-01/PROP-02, not new routed screens. Screen count stays at **3**, detailed in `TBOS_MY_PROPERTIES_SCREEN_INVENTORY.md`.

Two existing-build elements are explicitly **superseded** by this architecture and should be reconciled during implementation, not carried forward silently:
- The current PROP-03 wizard's generic "Compliance" step (a placeholder FAL/REGA/Nafath checklist) is replaced by the real two-flow authority integration in Part 4.
- The current lifecycle status set (shared verbatim with Projects) needs a decision on whether My Properties' real status vocabulary (Active/Draft/Pending/Sold/Expired/Rejected/Canceled — §4 of the audit) should diverge from Projects' — `OPEN BUSINESS DECISION`, carried into §12/State Matrix.

## 1. Information Architecture

```
My Properties
├── Overview / List (PROP-01)
│   ├── Search + Filters
│   ├── Status tabs
│   └── Property cards/rows
├── Property Detail (PROP-02)
│   ├── Overview
│   ├── Advertisement (license + authority data)
│   ├── Performance
│   ├── Promotion
│   ├── Services
│   └── Activity
└── Add Property (PROP-03)
    ├── Flow A — Has Advertisement License
    └── Flow B — No Advertisement License
```

Why each section exists, traced to evidence:

- **List** exists because a broker's core question is portfolio-wide: "what's the state of everything I've listed?" (§4, §17 of the audit — the current list is the entire product surface for this JTBD; nothing else attempts it).
- **Property Detail** exists because no internal single-source-of-truth screen currently exists — "View" leaks to the *public* listing page (§15). This is the highest-leverage net-new IA element: it consolidates six things (license, performance, promotion, services, activity, overview) that today live scattered across a packed list row, two modal families, and an external page.
- **Advertisement** is its own section, not folded into Overview, because the REGA card is categorically different data — authority-sourced, read-only, legally consequential — and conflating it with editable property fields is exactly the "everything is one form" pattern that makes the legacy `add.blade.php`/`edit.blade.php` (2,800+ lines each) hard to reason about (§6, §9 of the audit).
- **Performance** is separated because it's read-only, system-generated, and has fundamentally different states (unavailable, zero-because-never-tracked — §14) from the editable content around it.
- **Promotion** and **Services** are separated from each other and from Overview because they are independently payable, independently permission-worthy (§16 — the legacy system currently gates neither), and independently backend-dependent actions, not property attributes.
- **Activity** exists because a status/price/promotion history currently has no surface at all in the legacy product (`OPEN QUESTION` in the audit, not contradicted anywhere) — this is a genuine net-new capability, flagged as such, not inferred from legacy behavior.
- **Add Property**'s two-flow split is the single most load-bearing IA decision in this whole document, because the legacy product's two entry buttons ("Post a listing" / "Get License by Tuba") do not self-explain which one a first-time broker needs (§17, P1 finding) — the redesign must make the "do I have a license already?" branch a first-class, explained decision, not a guess between two ambiguously-labeled buttons.

## 2. Property List Experience

**Design intent:** the legacy table (§4) already contains the right *information* — it is not missing data, it is missing hierarchy. The redesign keeps every data point but re-prioritizes what's always visible vs. what's a click away.

**Always visible (primary row content):**
- Thumbnail, title, district/city (`CURRENT CAPABILITY`, unchanged — this is what a broker scans by)
- Status (Active/Draft/Pending/etc.) — as a `Badge` (`TBOS-CMP-STATUS-006`), never color-alone, matching the existing Design Principle already enforced on PROP-01 (`CODE FACT`-adjacent: `tbos-blueprint/04_SCREEN_INVENTORY.md` PROP-01 accessibility line)
- Price
- REGA license number + expiry proximity (a plain "78 days left" style read is more scannable than the raw date the legacy table shows — `INFERENCE`, not a legacy behavior)

**Secondary (visible but visually quieter — a "meta" row under the primary line, not a separate column fight):**
- A quick performance summary — Reach and Views only, per §8.6's list-vs-detail balance; Leads and every future engagement metric (Clicks, Contacts, Calls, WhatsApp, Visit Requests, Favorites, Shares — §8.1) are deliberately reserved for Property Detail, where their "not yet tracked"/"not available yet" nuance can be explained rather than glanced past
- Posted/created-by metadata

**Primary actions (always one tap/click away):** Edit, View detail (→ **internal** PROP-02, replacing the legacy leak to the public page — §15), Promote.

**Secondary actions (overflow menu, `Dropdown`/`TBOS-CMP-ACTION-001`):** Delete, Duplicate as new listing (`FUTURE UX REQUIREMENT`, not currently possible per legacy code — a genuine improvement, not a regression risk since it's additive), Request Service.

**Status representation:** `Badge` per status, matching PROP-01's existing eight-state Property lifecycle work — reconciled with §0's open question about whether My Properties needs its own vocabulary.

**Advertisement-license status:** shown as a compact license-days-remaining chip on the primary row (not a separate "Publish Type: Package" label, which live-tested as a confusing translation of رصيد النشر — §4/§17 P3). "Publish Type" (Package vs. Credit Card) is demoted to Property Detail → Advertisement, since it's a payment-method fact, not a scanning-priority fact.

**Promotion representation:** current tier (Basic/Featured/Pro) as a small `Badge`, always visible; the upgrade action itself (Pro/Featured/Renew tags in the legacy row) moves to a single "Promote" action that opens the Promotion drawer (§6) — three permanently-visible colored buttons per row, most of which don't apply to most properties, is the exact density problem this redesign should not reproduce.

**Services representation:** collapsed into the overflow menu as "Request Service," not three permanently-visible unlabeled icons (§20 accessibility finding) — discoverability moves from "always-on icon soup" to "always-available, clearly-labeled menu item," which is a net accessibility and density win without hiding the capability.

This is a deliberate rebalancing, not a like-for-like table port: the legacy row tries to show list + status + performance + 3 promotion states + 3 service triggers + 3 actions simultaneously, all at equal visual weight. The redesign keeps every capability reachable in ≤2 interactions but makes only Status/Price/License-expiry/primary-actions permanently competing for attention.

## 3. Property Detail (PROP-02)

`Tabs` (`TBOS-CMP-DISPLAY-004`), matching the existing PROP-02 tab-based pattern already established for compliance-heavy entities (`tbos-blueprint/04_SCREEN_INVENTORY.md` PROP-02: "tab-level RBAC").

| Section | Tab or panel? | Why |
|---|---|---|
| Overview | Tab (default/landing) | Title, description, media, amenities, nearby places — the editable content set, matches the legacy `add.blade.php`/`edit.blade.php`'s "Additional Required Details" (§5.2 step 4) |
| Advertisement | Tab | The REGA-sourced read-only card (§5.2 step 3) plus license status/expiry — deliberately separated per §1's reasoning; large enough (12+ fields, per §6.1) to need its own scroll context |
| Performance — **CORE** | Tab | Read-only, system-generated, different refresh/loading semantics than editable content (§14). Describes **what the audience did with the advertisement** — Reach, Views, Leads, and the future engagement set in §8. First-class per Decision 02: this is not a secondary tab, it is one of the two or three tabs a broker is expected to check routinely |
| Promotion | Tab (entry point) → **Drawer** for the actual request (`TBOS-CMP-OVERLAY-004`) | The tab shows current tier + history; the *action* of upgrading is a focused, interruption-worthy task (real payment/credit decision — §12 of the audit) that belongs in a drawer, not inline in a tab, matching PROJ-02's precedent of using a Drawer for a focused sub-task (add/edit Unit) rather than another tab. A single unified "Promote" entry point replaces the legacy pattern of three permanently-rendered, duplicated action buttons per row (Decision 04) |
| Services | Tab (entry point) → **Drawer** per service type | Same reasoning as Promotion — booking a service (date/time, payment method, §13) is a focused task, not passive reading. One unified Service Request pattern (shared drawer shape across Photography/Video/Drone) replaces three separately-styled legacy triggers (Decision 05) |
| Activity — **IMPORTANT / FUTURE IMPLEMENTATION** | Tab | `ActivityTimeline` (`TBOS-CMP-ACTIVITY-002`) — genuinely new capability (§1), reusing the exact component PROP-02/PROJ-02 already use for price/status history. Describes **what happened to the property/ad inside Tuba** — created, edited, price changed, images updated, advertisement updated, promotion requested/activated, service requested/completed, status changed. Deliberately distinct from Performance (Decision 03: audience behavior vs. internal history) and never merged with it, even though both are "history-shaped" — this remains a real, planned capability, not deprioritized out of the architecture, but its backend (an activity-log API, §17) does not yet exist, so it is sequenced after Performance, not built against fabricated entries |

Promotion and Services are **not** contextual panels (i.e., not sidebar widgets always visible alongside Overview) because they are occasional, not constant, concerns — a broker checking a listing's description doesn't need the promotion-purchase UI competing for the same screen real estate every time, matching the Minimalism discipline already stated for PROP-02 in the blueprint.

## 4. Add Property Architecture (PROP-03)

The highest-priority section, per the task brief and per the audit's own P1 finding (§17) that the legacy two-button entry is unexplained.

### 4.0 Entry decision (new, above both flows)

`FUTURE UX REQUIREMENT`, not currently present in legacy (§17 P1): before either flow starts, present the choice explicitly as a question — "Do you already have an advertisement license for this property?" — Yes → Flow A, No → Flow B. This single screen is the fix for the audit's most-cited first-time-user confusion; it costs one extra tap and removes a guess.

### 4.1 Flow A — Has Advertisement License

```
Entry decision: "Yes, I have a license"
        ↓
Step 1 — License Input
  · Advertiser Type toggle (Individual / Establishment) — CURRENT CAPABILITY (§5.2),
    DEFAULTED from the authenticated account's own type (see §4.3) — FUTURE UX REQUIREMENT,
    not currently observed live (legacy defaults the toggle to "منشأة"/Establishment
    regardless of who's logged in, §5.2 of the audit) — but changeable, since the account's
    stored type is a UX default, not a legal constraint (Decision 01)
  · Unified Number / National ID (conditional on toggle) — CURRENT CAPABILITY
  · Ad License Number — CURRENT CAPABILITY
        ↓
Step 2 — Authority Verification (loading state, §5 of this doc)
        ↓
Step 3 — Review Retrieved Information (read-only)
  · AUTHORITY DATA: license number, advertiser name, deed type/number, responsible-employee
    name/mobile, title/rooms/bathrooms/area/city/postal, price, expiry — CURRENT CAPABILITY (§5.2 step 3)
  · Explicit "this came from REGA, not editable here" framing — FUTURE UX REQUIREMENT (legacy
    shows this correctly as read-only but never explains *why* it's locked — INFERENCE from the
    audit's P1 finding pattern of "action looks real but isn't explained")
        ↓
Step 4 — Property Setup (everything REGA doesn't provide)
  · USER INPUT: title (EN/AR), description, video URL, parking, street-view mode, rent type,
    bathrooms, virtual tour, media (required), floor plans, amenities (~35), nearby places (~9)
    — CURRENT CAPABILITY (§5.2 step 4), field set unchanged, just re-grouped for scan-ability
    (media/description first, secondary metadata collapsed under "More details")
        ↓
Step 5 — Promotion Tier (Basic/Featured/Pro, live balances) — CURRENT CAPABILITY (§5.2 step 5)
        ↓
Step 6 — Review & Publish
  · Publish Now / Save Draft — CURRENT CAPABILITY, but see §5 for the error/recovery redesign
```

**Field source classification** (per the brief's explicit requirement):

| Field | Classification |
|---|---|
| Advertiser Type, Unified Number/National ID, Ad License Number | USER INPUT |
| License validity, advertiser name, deed type/number, responsible-employee name/mobile | AUTHORITY DATA (read-only) |
| Property type/rooms/bathrooms/area/city/postal/price (pre-filled from REGA) | AUTHORITY DATA, editable only where the legacy form already allows it (title EN/AR are pre-filled but editable — §5.2 step 4) |
| Region/City/District normalization | DERIVED (server-normalized from authority response, §6.1) |
| Title, description, media, amenities, nearby places | USER INPUT (100%, never returned by authority — §11 of the audit) |
| Advertiser mobile/name for CreateADLicense-adjacent flows | AUTO-FILLED from Tuba's own user/Nafath record (§10 of the audit) — this is the single most important "don't re-ask" rule to carry forward |
| Promotion tier balances | DERIVED, read from the live package/quota ledger |

### 4.2 Flow B — No Advertisement License

```
Entry decision: "No, I need to create one"
        ↓
Step 1 — Advertiser Type (5 branches, verified exact set)
  Individual Broker · Individual Owner · Owner Representative ·
  Establishment Broker · Establishment Owner        — CURRENT CAPABILITY, exact match to
                                                        AUTHORITY REQUIREMENT §11 (§5.3 of audit)
  · DEFAULTED from the account's own stored type (individual vs. establishment, §10 of the
    audit's `agent_type` finding) — FUTURE UX REQUIREMENT, not observed live (Decision 01)
        ↓
Step 2 — Identity
  · National ID / Residency ID — USER INPUT when not already known;
    AUTO-FILLED from users.id_number/Nafath when it is (§10, §11 of audit) — do not re-ask
        ↓
Step 3 — Brokerage Contract Number — USER INPUT (§5.3)
        ↓
Step 4 — Ownership Document Number — USER INPUT (§5.3)
        ↓
Step 5 — Advertisement Info
  · Price — USER INPUT, validated live against the brokerage contract's price
    (AUTHORITY REQUIREMENT #12/#29 — server-side, surfaced as a real inline error, not silent)
  · Advertisement Purpose (Sell/Rent) — USER INPUT
        ↓
Step 6 — Power of Attorney (conditional)
  · Shown ONLY when the authority's own required/not-required matrix (§7 of the Create AD
    License guide) says POA is needed for this Advertiser Type + ownership-approval combination
  · FUTURE UX REQUIREMENT — the legacy product has NO field for this at all and silently sends
    a hardcoded constant instead (§9, §24 discrepancy — this is a correction, not a new invention)
        ↓
Step 7 — Declaration
  · Disclaimer, verbatim authority text (§5.3) — USER INPUT, and — critically —
    FUTURE UX REQUIREMENT: its real checked/unchecked value must actually reach the backend
    (§9, §17 P0 finding: legacy discards it and hardcodes true)
        ↓
Step 8 — Authority License Creation (loading state, §5 of this doc)
        ↓
→ joins Flow A at "Review Retrieved Information" (Step 3 of §4.1)
```

**No fields were invented beyond what §5.3/§11 of the audit verified.** The one structural addition (POA, Step 6) is not a new field invented by this document — it is a real, cited `AUTHORITY REQUIREMENT` that the legacy product currently defaults around rather than asks; surfacing it correctly is a compliance fix, not scope creep, and is explicitly flagged as such.

### 4.3 Advertiser Type — Default, Change, and Cascade Behavior (Decision 01)

The account type is a **default, not a constraint.** Both flows pre-select the Advertiser Type field from the authenticated user's own stored `agent_type` (individual vs. establishment, §10 of the audit) — an Establishment Broker account defaults to "Establishment Broker," an Individual Broker account defaults to "Individual Broker." This is `FUTURE UX REQUIREMENT`: legacy does the opposite of this live (§5.2 of the audit observed the toggle hardcoded to "منشأة"/Establishment regardless of who was logged in), so this is a deliberate correction, not a preservation of legacy behavior.

**The user may always change it**, where the authority's own business rules permit (e.g., an Establishment Broker account holder acting as an Owner Representative for a personally-owned property — a real, verified branch of the 5-type set, §5.3/§11 of the audit). Changing the Advertiser Type is a **cascading** action, not an isolated field edit:

| Changes when Advertiser Type changes | Why |
|---|---|
| Identity field label and requirement (Unified Number vs. National ID/Iqama) | `AUTHORITY REQUIREMENT` — establishment types require the company unified number; individual types require National ID/Iqama (Create AD License guide §11) |
| Which fields are auto-filled vs. asked (§4.3.1 below) | An Establishment Broker's identity resolves differently than an Individual Owner's (§10 of the audit) |
| POA step visibility (Flow B, §4.2 Step 6) | The authority's required/not-required matrix is keyed on Advertiser Type + ownership-approval status (Create AD License guide §7) |
| Validation rules | Format/required-field differences per type |
| Review Summary content | Must reflect the type actually submitted, not the account's default |

**Prefix checks are a UX hint, never the source of truth.** A `700`-prefixed number visually suggesting "this looks like a company number" may prompt an inline hint ("this looks like a Unified Number — did you mean Establishment?"), but it must never silently override the user's explicit selection, and it is never what gets submitted as validated — only the Authority's own response (via AdvertisementValidator/CreateADLicense) is authoritative on whether an identifier is valid for the selected type. This directly prevents the frontend from re-implementing business logic that belongs to NHC/REGA.

## 5. Authority Experience

`FUTURE UX REQUIREMENT` throughout — the legacy product has almost no error vocabulary here (§9: no mapping exists for any of the 29 documented error codes; §22: no rejected/invalid-license state was even observable live).

Every authority interaction needs four things the user must always be able to answer, per the brief:

| State | What Is Happening | Why | What Tuba Needs | What To Do Next |
|---|---|---|---|---|
| Verifying | "Checking your license with the Real Estate Authority…" | (not exposed — no jargon) | nothing yet | wait (non-blocking spinner, not a frozen screen) |
| Successful verification | "License found — here's what's on file" | — | confirm the details are right | continue |
| Invalid format | "That doesn't look like a valid license/ID number" | client-side format check, before ever calling the authority | correct the field | fix inline, no network call wasted |
| Invalid license number | "We couldn't validate this license number" | the number itself failed authority validation | re-check the number, or switch to Flow B if none exists | fix inline; offer the "I don't have a license" branch as an explicit escape hatch, not a dead end |
| Invalid advertiser identifier | "This ID/Unified Number doesn't match what the Authority has on file" | identifier failed authority validation | re-check the identifier | fix inline |
| License not found | "We couldn't find a license with these details" | genuinely doesn't exist in the authority's records | double-check the number, or switch to Flow B | same escape hatch as above |
| License belongs to another advertiser | "This license is registered to a different advertiser" | advertiserId/idType combination doesn't match the license | correct the identity fields, or confirm this is genuinely their license | fix inline; do not silently proceed with mismatched data |
| Advertiser/license mismatch (type-level, e.g. individual ID against an establishment license) | Plain-language restatement that the Advertiser Type and the license's registered type don't agree | authority business rule | change Advertiser Type or correct the license number | link back to the Advertiser Type field (§4.3) |
| Authority rejection (business rule, e.g. price below contract) | Plain-language restatement of the specific rule (never the raw Arabic string, per §9's error-code gap) | the authority's actual rule, translated once, centrally | the specific missing/wrong thing | a direct link back to the exact field, not "please try again" |
| Missing information (e.g. no active package to deduct a license from, error #28) | "You don't have an available license credit right now" | quota exhausted | buy/renew | link to Packages, not a dead end |
| Authority unavailable | "The Real Estate Authority service isn't responding right now" | upstream outage (Tuba's own proxy or NHC itself, §6 of the audit) | nothing they did wrong | offer retry; do not block Save Draft if the property record itself doesn't depend on this call succeeding |
| Authority timeout | "This is taking longer than expected" | slow upstream response | wait or retry | a visible retry action after a reasonable wait, not an indefinite spinner |
| Recoverable error (e.g. failed media upload) | Which specific file, why | — | retry that one item | retry affordance scoped to the failing item only, matching the *already-correct* pattern the existing `MediaUploader` pattern component implements (`TBOS-PAT-FORM-003`) |
| Non-recoverable error (e.g. 500, §5.1 of the audit) | "Something went wrong on our side" | — | nothing they did wrong | a real retry/support path, never a bare white error page |

**No exact authority error copy is invented above** — every row is a category/behavior description (per Decision 06), not a literal string; the actual wording NHC/the proxy returns for each of these categories is unverified (§22/§28 of the audit) and must be confirmed before Phase C locks in copy. The central, non-negotiable requirement this section adds beyond legacy: **every one of the 29 documented error codes needs to be mapped into one of the rows above, with a real plain-language message, before Phase C implementation** — this is the single largest concrete backend-dependency gap surfaced by Phase A (§9, §23) and the biggest risk to a good authority experience if skipped.

## 6. Promotion (Featured/Pro/متميز/برو)

**Decision 04 — one unified promotion experience, not duplicated legacy action buttons.** Legacy renders three separately-styled, always-visible action tags (Pro/Featured/Renew) per row, each opening its own similarly-but-not-identically-structured modal (§12 of the audit). This architecture instead defines a single Promotion pattern — one "Promote" entry point, one drawer shape, parameterized by tier — so Pro and Featured (and any future tier, §19) share one interaction model instead of three parallel implementations.

- **Where they appear:** current tier badge on every PROP-01 row and on PROP-02 → Advertisement/Promotion tab (§2, §3). Upgrade action lives behind a single "Promote" affordance, not three permanently-rendered buttons.
- **When actionable:** whenever the property has an active, non-expired advertisement license — matches the legacy `checkAdLicenseDate` guard, which is real, live-tested working behavior (§12 of the audit) worth preserving exactly, including its specific "N days left, continue?" framing.
- **Current-state display:** a `Badge` (Basic/Featured/Pro), consistent with status badges elsewhere — never re-derive a new visual language for tiers.
- **Relationship to the property:** promotion is a property attribute (the listing itself is boosted), confirmed by the legacy `ad_type` column living directly on `properties` (§6.1's schema read).
- **Relationship to advertisement status:** gated by license validity, not property status — a Draft property has no promotion action available at all (`INFERENCE`, since promotion requires a live, dated license per §12).
- **Discovery:** the Promotion tab plus the List row's badge are the two discovery points — no separate "browse promotions" screen, since legacy never had one and nothing in the audit suggests a business need for it.
- **No invented pricing/eligibility:** the drawer surfaces exactly the two payment paths already verified live (Package balance / Credit Card price, §12) — real numbers come from the backend at request time, never hardcoded in the frontend.

## 7. Property Services (Photography/Video/Drone)

**Decision 05 — one unified service request experience.** Legacy renders three separate, individually-styled trigger icons with no shared visual or interaction language beyond superficial similarity (§13, §20 of the audit — and confirmed unlabeled for accessibility). This architecture defines one Service Request pattern, parameterized by service type, rather than three bespoke implementations — the same discipline as Promotion (§6).

| | Current Verified Capability | Future Frontend State | Backend Dependency |
|---|---|---|---|
| Photography | Booking modal fully functional live (date/time, comments, Package/Credit-Card choice, real balance) — §13 | Preserve as a Service Request drawer per §3; add a visible request-status (Requested/Scheduled/Completed) once one exists | `PropertyServiceRequestController::store()` confirmed an empty stub in code (§9/§13) — frontend must not assume persistence works until this is built or the live discrepancy in §24 is resolved |
| Video | Same UI pattern as Photography (icon present, not individually driven live) | Same drawer pattern | Same gap, unverified individually |
| Drone | Icon present; code confirms its `type` value is excluded from the package-deduction endpoint's allow-list (§13) | Same drawer pattern, but must not silently offer "Package" as a payment option for Drone until that backend gap is closed | Explicit backend fix required before Drone can honestly offer the Package path |

The frontend architecture must render service **request** states (available / requested / unavailable) without asserting a **fulfillment** state (scheduled / completed / delivered) that no backend currently produces (§13, §23) — this is the load-bearing distinction the brief asks for, and it maps directly to §12 of the audit's discrepancy finding (the request UI works; what happens after is unverified).

## 8. Performance (Decision 02 — a core, first-class experience)

Performance is not a side-panel of three counters — it is one of the six primary sections of Property Detail (§1, §3) and a defining part of "how is my listing doing," the second half of the audit's own stated UX principle. This section supersedes the narrower, three-metric-only treatment in the original draft of this document.

### 8.1 Metric inventory — classified, not fabricated

Every metric the redesign must architect for, classified per the brief's explicit instruction. **No metric below is displayed as real data unless it is `CURRENTLY VERIFIED`.**

| Metric | Classification | Basis |
|---|---|---|
| Reach | `CURRENTLY VERIFIED` | `OBSERVED BEHAVIOR` + `CODE FACT`, §14 of the audit — live numbers (778/12,757 observed), and the only counter actually incremented in reachable legacy code |
| Views | `CURRENTLY VERIFIED` | `OBSERVED BEHAVIOR`, §14 — live numbers (170/439 observed), backed by a real per-visit tracking table |
| Leads | `CURRENTLY VERIFIED (displayed) / BACKEND-DEPENDENT (data pipeline)` — a deliberate hybrid, not a clean "verified" | `CODE FACT`, §14 — the field is real, displayed live, and structurally always `0` (the one increment call site is commented out). Treat the *column* as verified-to-exist and the *value* as not yet trustworthy — see §8.4 |
| Clicks | `FUTURE / BACKEND-DEPENDENT` — entirely new | §14 of the audit confirms no `clicks` field exists anywhere in the legacy codebase; this is a genuinely new metric, not a rename of something verified |
| Contacts | `FUTURE / BACKEND-DEPENDENT` — entirely new | Not observed or found in code anywhere in Phase A |
| Calls | `FUTURE / BACKEND-DEPENDENT` — entirely new | Same |
| WhatsApp | `FUTURE / BACKEND-DEPENDENT` — entirely new | Same |
| Visit Requests | `FUTURE / BACKEND-DEPENDENT` — entirely new | Same |
| Favorites | `FUTURE / BACKEND-DEPENDENT` — entirely new | Same |
| Shares | `FUTURE / BACKEND-DEPENDENT` — entirely new | Same |
| Other future verified engagement events | `FUTURE / BACKEND-DEPENDENT` — placeholder category | The architecture must not hardcode "10 metrics, forever" (§8.5) |

This is not a reason to hide the future metrics from the architecture — per the task brief, they belong in the design now, rendered honestly as not-yet-available rather than omitted or faked.

### 8.2 KPI structure

- **KPI overview:** a metric-card row at the top of the Performance tab — Reach/Views/Leads shown with real values today; Clicks/Contacts/Calls/WhatsApp/Visit Requests/Favorites/Shares shown in the same visual system but in an explicit "not yet available" treatment (§8.4), never silently omitted, so the broker can see the full shape of what performance tracking *will* cover.
- **Engagement breakdown:** a secondary grouping distinguishing *exposure* metrics (Reach, Views) from *action* metrics (Clicks, Contacts, Calls, WhatsApp, Visit Requests, Leads) from *audience-interest* metrics (Favorites, Shares) — this grouping is `INFERENCE`, a reasonable information-architecture choice, not sourced from legacy (which has no such grouping, since it only ever had three flat counters).
- **Trends:** a time-series chart slot exists in the architecture but renders no data and no fake chart until a backend actually records time-series values — directly avoids repeating the legacy defect of a decorative, hardcoded-sample-data chart (§14 of the audit).
- **Time period selection:** a date-range control (e.g., 7/30/90 days, custom) is architected as part of the Performance tab's toolbar — `FUTURE UX REQUIREMENT`, since legacy only ever shows point-in-time totals (§14) with no period control at all.
- **Comparison:** period-over-period or property-to-property comparison is architected as a future capability slot, not built now — it requires trend data that doesn't exist yet (§8.1), so comparison must not be exposed as a working feature until trends are real.

### 8.3 Derived metrics — future-ready, never presented as real

Click-through rate, lead-conversion rate, contact-conversion rate, visit-conversion rate, and general engagement rate are all plausible future derived metrics. Per the brief: **these are architected as a defined slot, not implemented or estimated.** A derived metric may only render once (a) every metric it depends on is itself `CURRENTLY VERIFIED`, and (b) its formal calculation definition is agreed — neither condition is met today for any derived metric, since even the underlying Clicks/Contacts numerator data doesn't exist yet. Until then, the Performance tab must not display a computed percentage next to a metric that has no real backing data.

### 8.4 Empty, unavailable, and future states

| State | Treatment |
|---|---|
| Currently-verified metric, real value | Numeric display, as today (Reach/Views) |
| Leads specifically | Shown with its real (currently-always-zero) value, but with a "not yet reliably tracked" affordance distinguishing it from a genuine zero-engagement result (§8.1's hybrid classification) — `BUSINESS DECISION REQUIRED` on the exact wording/visual treatment |
| Future/backend-dependent metric, no data source yet | Shown as part of the KPI layout in a clearly "not available yet" state — visible so the broker understands the full future shape of performance tracking, never fabricated as a `0` or omitted entirely |
| New property, zero traffic yet | "No performance data yet" — distinct from the "not yet tracked" treatment above; this is a real absence-of-activity state, not a broken pipeline |
| Derived metric, dependencies incomplete | Not rendered as a number at all — shown only once §8.3's two conditions are met |

### 8.5 Extensibility (Decision 09)

The Performance tab is architected as an **open, ordered list of metric cards grouped by category** (exposure / action / interest, §8.2), not a fixed grid or a hardcoded 3-or-10-column table. Adding an 11th verified metric, or promoting a `FUTURE` metric to `CURRENTLY VERIFIED` once its backend exists, must be a data-classification change, not a layout redesign. This is the direct architectural answer to the brief's "capable of evolving as Tuba adds new engagement events" requirement.

### 8.6 Accessibility from List vs. Detail

Per the brief: the broker should not need to open Property Detail just to sense whether an ad is performing, but the List must not become overloaded.

- **PROP-01 (List/Card):** a **quick performance summary** only — Reach and Views as compact inline numbers (already the least controversial, most reliable metrics per §8.1), with a single "View performance" affordance rather than the full KPI/breakdown/trend apparatus. Leads and every future metric are deliberately **not** shown at list density — they belong in the Detail view where the "not yet tracked"/"not available yet" nuance (§8.4) can be explained, not just glanced at.
- **PROP-02 → Performance tab:** the full KPI overview, breakdown, trend slot, time-period control, and (once viable) comparison and derived metrics.

This is the explicit balance point required by the brief: List = "is this worth a closer look," Detail = "what's actually happening."

## 9. RBAC

Per the brief: **do not duplicate role checks throughout the UI.** TBOS's existing four-layer model (route / UI / API / record) already has the pattern this needs — `PermissionGate` (`TBOS-CMP-PERMISSION-001`) at the UI layer, `RouteGuard`-equivalent at the route layer (per the existing PROP-01/02/03 build), server-side enforcement at the API layer, and agency/ownership scoping at the record layer.

**Gap this audit surfaces that legacy doesn't have at all (§16, §23):** two new permission keys are needed. Per Decision 08, the distinction between what already exists and what is only proposed must stay explicit — nothing below claims a proposed key is already registered in the permission system:

| Key | Status | Governs | Notes |
|---|---|---|---|
| `properties.view` | **EXISTING** | List/detail read access | Already registered (`permissionRegistry.ts`), unchanged by this architecture |
| `properties.create` | **EXISTING** | Add Property (both flows) | Unchanged |
| `properties.edit` | **EXISTING** | Edit property content | Unchanged |
| `properties.delete` | **EXISTING** | Delete/archive | Unchanged |
| `properties.compliance.edit` | **EXISTING** | Compliance-tab edit | Unchanged; not the same action as Promotion or Services, see below |
| `properties.promote` | **PROPOSED — BACKEND-DEPENDENT** | Requesting a Featured/Pro upgrade | Does not exist today, in legacy or in the current TBOS permission registry. It's a payment/quota action, not a content edit — legacy currently gates it with *nothing* (§16), which is itself the defect to fix, not a pattern to copy |
| `properties.services.request` | **PROPOSED — BACKEND-DEPENDENT** | Requesting Photography/Video/Drone | Does not exist today. Same reasoning — a real, wallet-consuming action with zero current permission coverage |

Both proposed keys should support the same scope dimensions already established for `properties.*` (own/agency/platform), so a Marketing Manager with content-write but no compliance-write (existing pattern, §16 of the audit re: legacy MM role) can be denied promotion/service actions independently of edit access — this is a real gap the legacy system has that TBOS should not inherit. `BUSINESS DECISION REQUIRED`: which roles actually get these two proposed keys, and at what scope — this document only establishes that the keys must exist and must be added to the permission registry before Phase C, not who holds them.

Visibility, action-availability, and scope all resolve the same way already-built PROP-01/02/03 resolve them: **`PermissionGate` wraps the affected UI (Promote button, Service Request menu item), never a scattered `if (role === ...)` check inline in a component.**

## 10. Responsive

Verified against the legacy live-test at 1440/768/390 (§18 of the audit — only two effective breakpoints observed there, a gap this redesign should not repeat).

| Element | Desktop (1440) | Tablet (768) | Mobile (390) |
|---|---|---|---|
| List | Table/`DataTable` | Card grid (2-col) — a genuine intermediate tier, unlike legacy's binary collapse | Card list (1-col, `TBOS-CMP-ENTITY` card pattern) |
| Filters | Inline toolbar | `DataTableToolbar` collapses secondary filters into a `Popover` | Full-width filter sheet (bottom sheet) |
| Property Detail tabs | Horizontal `Tabs` | Horizontal `Tabs`, scrollable if needed | Bottom sheet per tab, or a segmented control at the top — not a horizontally-scrolling tab strip, which is a known small-screen usability trap |
| Promotion/Service request | `Drawer` (side) | `Drawer` (side) | `Drawer` becomes a bottom sheet — same component, different anchor, matching existing `Drawer` primitive's responsive behavior rather than introducing a new component |
| Add Property wizard | Full-page, `FormWizard` + `StepIndicator` side-by-side | Full-page, `StepIndicator` collapses to a progress bar | Full-page flow, one field group per screen — never a modal on mobile, since this is a long, save-worthy task |

The floating "Scroll to bottom" overlap defect (§18 of the audit, reproduced at all three widths) is explicitly **not** reproduced here — no persistent floating action button is specified anywhere in this architecture.

## 11. RTL / LTR

Confirmed baseline: the existing List page already mirrors correctly, structurally not just linguistically (§19 of the audit) — this architecture inherits that discipline rather than re-deriving it. Every new surface introduced here (Promotion/Service drawers, the Advertisement tab's REGA card, the Flow A/B entry decision) must mirror the same way: icon-before/after-text ordering flips, numeric fields (price, license numbers) stay LTR-internal per standard bidi-numeral handling regardless of overall direction (matching how the legacy QR/price fields already behave live), and the information hierarchy (primary action always nearest the reading-start edge) stays constant in both directions. The one confirmed legacy drift to fix, not repeat: a translated label must preserve the *source* concept (§4/§17 P3's "Publish Type" vs. رصيد النشر) — every EN string in this architecture's screens must be reviewed against its AR counterpart for concept-preservation, not just word-for-word translation.

## 12. States

See `TBOS_MY_PROPERTIES_STATE_MATRIX.md` for the full matrix. Summary of sourcing discipline: every state either cites an audit section (verified) or is explicitly marked `FUTURE STATE — not yet backed by a live/code observation`.

## 13. User Journeys

1. **Broker views properties** — PROP-01 loads → Active tab default (matches legacy default, §4) → scans Status/Price/License-expiry.
2. **Broker searches for a property** — types in title/Tuba-ID/REGA-ID search (all three fields verified live, §4) → results filter in place, no page reload (`FUTURE UX REQUIREMENT` vs. legacy's presumed full-page AJAX reload pattern — not confirmed network-level in this pass, `OPEN QUESTION`).
3. **Broker opens a property** — clicks a row → **PROP-02 internal detail** (not the public page leak, §15) → Overview tab by default.
4. **Broker checks performance** — from PROP-02, switches to Performance tab → sees Reach/Views, and a "Leads not yet tracked" explanatory state rather than a bare 0 (§8).
5. **Broker promotes a property** — from PROP-01 row or PROP-02 Promotion tab → license-validity check (preserved from legacy, §12) → Promotion drawer → picks Package or Credit Card → confirms → sees the real resulting tier, not just a toast.
6. **Broker requests photography** — from PROP-02 Services tab (or PROP-01 overflow) → Service Request drawer → date/time + comments → payment choice → confirmation screen that's honest about what happens next (§7 — do not promise fulfillment tracking that doesn't exist yet).
7. **Broker adds a property with an existing license** — Entry decision → Flow A (§4.1) end to end → Publish or Save Draft, with a real two-terminal-state confirmation (matches the existing PROP-03 discipline already established in `06_STATE_ARCHITECTURE.md`).
8. **Broker adds a property without a license** — Entry decision → Flow B (§4.2), including the conditional POA step and the now-honestly-wired disclaimer → joins Flow A's review step.
9. **Authority rejects information** — any Flow A/B step returns a business-rule error → the plain-language mapped message from §5's table, with a direct link back to the offending field — never a raw Arabic string, never a dead end (directly fixes the audit's §9/§22 gap).
10. **Broker recovers from an error** — a single failed media file shows a scoped retry (preserves the legacy `MediaUploader`'s already-correct behavior, §5 of this doc's Recoverable-error row) without losing any other completed step's data — the wizard's step state must survive a single-field error, matching the existing `FormWizard` pattern's step-persistence design.

## 14. Screen Inventory

See `TBOS_MY_PROPERTIES_SCREEN_INVENTORY.md`.

## 15. Component Requirements

Mapped to the existing registry wherever a match exists; only genuinely new needs are proposed as new components, and even those are named provisionally per the brief's instruction.

| Need | Existing component | New? |
|---|---|---|
| PropertyCard (list, mobile) | New — no existing card variant covers this entity shape | **New pattern**, `TBOS-PAT-ENTITY` family (naming provisional) |
| PropertyList | `DataTable` (`TBOS-PAT-DATA-001`) + `DataTableToolbar` (`TBOS-PAT-DATA-003`) + `Pagination` (`TBOS-PAT-DATA-002`) | Reused, not new |
| PropertyStatus | `Badge` (`TBOS-CMP-STATUS-006`) | Reused |
| AdvertisementStatus (license expiry chip) | `Badge`, possibly composed with `Tooltip` (`TBOS-CMP-OVERLAY-001`) for the "N days left" detail | Reused/composed |
| PerformanceSummary | New — a metric-card layout, no existing equivalent found in the registry | **New pattern** |
| PromotionCard / tier badge | `Badge` for state; **new** drawer content for the request flow, built from existing `Drawer` (`TBOS-CMP-OVERLAY-004`) primitives | Composed, mostly reused |
| ServiceCard / request trigger | Overflow `Dropdown` (`TBOS-CMP-ACTION-001`) entry + **new** drawer content, same `Drawer` primitive | Composed, mostly reused |
| AuthorityVerification (loading/result state) | `Spinner` (`TBOS-CMP-DISPLAY-007`) + `Alert` (`TBOS-CMP-FEEDBACK-001`) for the four-state table in §5 | Reused/composed |
| LicenseInput | `Field`/`Input` primitives (existing form components, per prior-phase precedent) | Reused |
| AdvertiserIdentityInput | Same, with the Advertiser Type toggle as an existing pattern (radio/segmented control) | Reused |
| AddPropertyStepper | `StepIndicator` (`TBOS-PAT-FORM-001`) + `FormWizard` (`TBOS-PAT-FORM-002`) — same components already powering the current PROP-03 | Reused, extended for the two-flow branch |
| ReviewSummary | New — a read-only summary layout; likely composable from `EntityDetailHeader` (`TBOS-PAT-ENTITY-001`) patterns | **New pattern**, high reuse of existing primitives |
| ActivityTimeline | `ActivityTimeline` (`TBOS-CMP-ACTIVITY-002`) / `ActivityItem` (`TBOS-CMP-ACTIVITY-001`) | Reused directly, no changes needed |
| RestrictedState (permission-denied) | `RestrictedState` (`TBOS-CMP-FEEDBACK-002`) | Reused directly |

## 16. Design System Compliance

No raw hex values, no new visual language, per the brief. Specifically:
- Status/tier badges use the existing `Badge` component and existing semantic status tokens — the redesign does not introduce a new color per promotion tier beyond what the design system already defines for Basic/Featured/Pro-equivalent states elsewhere.
- Destructive actions (Delete) use Tuba Coral per the established rule (design-system memory: Coral reserved for destructive only) — Promotion/Service actions are **not** destructive and must not borrow that color.
- Primary actions (Publish, Promote, Request Service) use Tuba Purple, consistent with every other primary CTA in the built PROP-01/02/03.
- No new icon set — the three Service icons (camera/video/drone) should be sourced from the existing `Icon` (`TBOS-CMP-DISPLAY-005`) library, and each must carry a real accessible label this time (fixes §20 of the audit).

## 17. Backend Contract Placeholders

Documentation only — nothing implemented. Full per-screen detail in the Screen Inventory; summarized here by capability:

| Capability | Data Required | Data Mutated | Read Dependency | Write Dependency | Authority Dependency | Permission Dependency |
|---|---|---|---|---|---|---|
| Validate existing license | advertiserId, idType, adLicenseNumber | none (read-only check) | AdvertisementValidator (via chosen proxy strategy, §6) | — | Yes — AdvertisementValidator | `properties.create` |
| Create new license | Full Flow B field set incl. real disclaimer + conditional POA | Creates a license record | — | CreateADLicense | Yes — CreateADLicense, with real error-code mapping (§5) | `properties.create` |
| Create/edit property | Property fields + media | Property record | Property, lookups | Create/update property | Indirect (via license linkage) | `properties.create`/`properties.edit` |
| Promote | Package/quota balance | Deduct credit or charge card | Package balance | Promotion request | No | New: `properties.promote` |
| Request service | Service pricing/quota | Create service request, deduct/charge | Service pricing | Service request | No | New: `properties.services.request` |
| View performance | Metric values | none | Metrics (consolidated source — §14's dual-tracking gap must be resolved before this is a single clean read) | — | No | `properties.view` |

## 18. Account-Derived Data Classification (Decision 07)

Per the brief, every field across both Add Property flows (§4) is reclassified into five categories — a refinement of §11's original three-way split, applied consistently so the frontend never asks a broker to re-type something Tuba, the account, or the authority already knows.

| Field | Classification | Notes |
|---|---|---|
| Advertiser Type (initial value) | **Account-derived** | Defaulted from `agent_type`, §4.3 — user may override |
| Advertiser Type (after user changes it) | **User-entered** | Once changed, it's an explicit choice for this transaction |
| National ID / Unified Number | **Account-derived** when already on file (`users.id_number`/latest Nafath row, §10 of the audit); **User-entered** only when not yet known to Tuba | Never re-ask if already known — the single most important rule carried from §10/§11 of the audit |
| Advertiser Name | **Authority-derived** (Scenario A, from the validated license) or **Account-derived** (Scenario B individual, from Nafath) | Never user-typed once identity resolves, §10/§11 of the audit |
| Advertiser Mobile Number | **Account-derived** | Pulled from the agent's stored profile, §10 |
| Ad License Number | **User-entered** (Flow A, they supply it to validate) or **System-derived** (Flow B, issued by the authority as a result of the transaction) | |
| Brokerage Contract Number | **User-entered** | §5.3/§11 of the audit — no source for this exists anywhere in Tuba's own records per Phase A |
| Deed / Ownership Document Number | **User-entered** (Flow B) or **Authority-derived** (Flow A, returned by AdvertisementValidator) | |
| Price | **User-entered**, validated against contract price (**System-derived** validation check) | §11 of the audit |
| Advertisement Purpose (Sell/Rent) | **User-entered** | |
| Disclaimer consent | **User-entered** | Must genuinely reach the backend this time (§9 of the audit, §5 of this doc) |
| POA / Attorney Code | **User-entered**, only when the authority's matrix requires it (§4.2 Step 6) | Never a hardcoded default, unlike legacy |
| Region/City/District/Lat-Long | **Authority-derived**, normalized server-side | §6.1 of the audit |
| Deed borders, plan/land number, obligations, Saudi Building Code compliance | **Authority-derived**, currently **Read-only** and unstructured (JSON blob only) | §6.1 — a `BUSINESS DECISION REQUIRED` on whether to normalize this into editable/queryable fields |
| Property Title/Description/Media/Amenities/Nearby Places | **User-entered**, 100% | Never returned by the authority, §11 of the audit |
| Promotion tier balances | **System-derived** | Read from the live package/quota ledger at request time |
| Performance metric values (§8) | **System-derived**, where a real pipeline exists; otherwise **not available** | Never fabricated, per §8.1 |

**Read-only** is treated as an orthogonal property, not a sixth category — any of the above (most commonly Authority-derived fields) can additionally be read-only within a given flow (e.g., the REGA card in Flow A's Review step, §4.1 Step 3), meaning the UI must render it but never offer an edit affordance for it.

## 19. Future Extensibility (Decision 09)

The brief requires the frontend architecture — not the backend — to be ready for growth in four areas without any backend work happening in this phase:

- **Performance metrics:** §8.5 — an open, categorized metric-card list, not a fixed layout. Promoting a metric from `FUTURE/BACKEND-DEPENDENT` to `CURRENTLY VERIFIED` is a data-classification change only.
- **Promotion products:** today's three tiers (Basic/Featured/Pro) are rendered as a list the Promotion drawer iterates over, not three hardcoded cases — a fourth tier (if the business ever introduces one) is additive, not a structural rework. No pricing/eligibility rule for a hypothetical fourth tier is invented here (per Decision 04's explicit instruction).
- **Property services:** the Services tab/drawer pattern is one shared component parameterized by service type (§7), so a fourth service type is additive the same way a fourth promotion tier is — again, no new service type is invented or implied.
- **Activity history:** the `ActivityTimeline` component (§3, reused directly from the existing PROP-02/PROJ-02 pattern) already accepts an open-ended `kind` enumeration in its existing usage elsewhere in TBOS — the same extensibility applies here without modification once a backend activity-log API exists.

None of this is implemented in this phase. It is a constraint on *how* Phase C should build these surfaces (as open, data-driven lists) rather than a description of anything built now.
