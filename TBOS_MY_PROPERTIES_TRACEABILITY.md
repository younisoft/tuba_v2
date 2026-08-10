# TBOS My Properties — Traceability

**Status:** Documentation only. Every major UX decision in `TBOS_MY_PROPERTIES_UX_ARCHITECTURE.md` traced to its source. Companion to the Screen Inventory and State Matrix.

**Source key:** `AUDIT §N` (Phase A finding) · `AUTHORITY REQ` (the two NHC/Takamolat PDFs) · `TBOS SPEC` (existing `tbos-blueprint`/`tbos-definition` documents) · `LIVE BEHAVIOR` (a specific, driven observation, subset of `AUDIT §N`) · `INFERENCE` (reasonable conclusion, not literally stated anywhere) · `BUSINESS DECISION REQUIRED` (no source resolves this).

| # | Decision | Source | Type |
|---|---|---|---|
| 1 | PROP-01/02/03 screen IDs and routes reused, not duplicated | TBOS SPEC — existing `screenRegistry.ts` entries, `tbos-blueprint/04_SCREEN_INVENTORY.md` | Direct |
| 2 | Two ad-license flows (validate existing / create new) as the top-level Add Property branch | AUDIT §5, §5.2, §5.3 — both flows driven live end-to-end | Direct |
| 3 | Explicit "Do you have a license?" entry decision before branching | AUDIT §17 (P1: two unexplained buttons) | Direct fix for a cited defect |
| 4 | Flow A step order (License Input → Verification → Review → Property Setup → Promotion → Publish) | AUDIT §5.2 (live-observed order) | Direct |
| 5 | Flow B field set (Advertiser Type, National ID, Brokerage Contract, Deed Number, Price, Purpose, Disclaimer) | AUDIT §5.3, cross-checked against AUTHORITY REQ (Create AD License guide, Input Parameters table) | Direct, dual-sourced |
| 6 | Five Advertiser Type branches (Individual Broker/Owner, Owner Rep, Establishment Broker/Owner) | LIVE BEHAVIOR (AUDIT §5.3 dropdown, all 5 options read) + AUTHORITY REQ §11 | Direct, dual-sourced |
| 7 | Conditional POA step added to Flow B | AUTHORITY REQ (Create AD License guide §7, the required/not-required matrix) + AUDIT §9 (legacy hardcodes a constant instead of asking) | Direct fix for a cited defect — not an invented field |
| 8 | Disclaimer step must actually transmit its value | AUDIT §5.3, §9, §17 (P0: legacy discards the checkbox and hardcodes `true`) | Direct fix for a cited defect |
| 9 | Price validated live against brokerage contract price | AUTHORITY REQ (Create AD License guide, Input Parameters #14, Error code #29) | Direct |
| 10 | REGA-sourced fields presented as explicitly read-only with an explanation | AUDIT §5.2 step 3 (read-only confirmed) + AUDIT §17 pattern (actions that look editable but aren't) | LIVE BEHAVIOR + INFERENCE |
| 11 | Identity/mobile/name auto-filled from Tuba/Nafath records, never re-asked | AUDIT §10, §11 | Direct |
| 12 | Advertisement as its own Property Detail tab, not merged into Overview | AUDIT §6 (REGA card is categorically read-only/authority data), TBOS SPEC (PROP-02's existing tab-level RBAC pattern) | INFERENCE from combined sources |
| 13 | Performance as its own tab | AUDIT §14 (distinct refresh/loading semantics, dual uncoordinated data sources) | INFERENCE |
| 14 | Promotion/Services as tabs-with-drawer, not inline panels or new screens | TBOS SPEC (PROJ-02's existing Drawer-for-Unit precedent) + AUDIT §12/§13 (both are focused, payment-adjacent tasks) | INFERENCE from combined sources |
| 15 | Activity tab as a genuinely new capability | AUDIT §22 (`OPEN QUESTION` — no history/activity surface observed anywhere in legacy) + TBOS SPEC (existing `ActivityTimeline` component, already used for Property/Project price-history elsewhere) | Direct (component) + explicit gap-fill (capability) |
| 16 | List row de-emphasizes Performance/Promotion/Services relative to Status/Price/License | AUDIT §4 (legacy gives all these equal visual weight) + AUDIT §17 (P2: unstructured/dense row) | INFERENCE |
| 17 | Services collapsed to an overflow menu item instead of 3 permanent icons | AUDIT §20 (unlabeled icons, real accessibility defect) | Direct fix for a cited defect |
| 18 | Internal PROP-02 detail replaces "View → public page" | AUDIT §15 (confirmed: View currently leaks to the public listing page) | Direct fix for a cited gap |
| 19 | Two new permission keys: `properties.promote`, `properties.services.request` | AUDIT §16 (confirmed: legacy has zero permission gate on these actions at all) | Direct fix for a cited defect |
| 20 | `PermissionGate`-only enforcement pattern, no scattered role checks | TBOS SPEC (existing 4-layer RBAC model, already used across PROP-01/02/03) | Direct |
| 21 | Authority error states mapped to plain language, per the four-question framework (what/why/need/next) | AUDIT §9 (no error-code mapping exists anywhere) + AUTHORITY REQ (the 29-code error table) + task brief's explicit framework requirement | Direct, dual-sourced |
| 22 | Recoverable single-file media retry, scoped to the failing file only | AUDIT (session context: this exact behavior already implemented in the existing `MediaUploader` pattern component, predating this audit) | Direct (existing capability, preserved) |
| 23 | Reach/Views/Leads as the only verified performance vocabulary; "Clicks" explicitly not introduced | AUDIT §14 (no `clicks` field found anywhere in the codebase) | Direct correction of the task brief's own assumption |
| 24 | Leads shown as "not yet tracked" rather than a bare 0 | AUDIT §14 (the metric structurally cannot increment — one call site, commented out) | Direct |
| 25 | Trend/history performance view deferred, not designed | AUDIT §14 (no real trend data exists; the one chart present is decorative/hardcoded) | Direct (scope discipline, not invention) |
| 26 | Promotion tiers = Basic/Featured/Pro, real Package vs. Credit Card payment choice preserved | LIVE BEHAVIOR, AUDIT §12 (live-tested modal, real balances/prices) | Direct |
| 27 | Photography/Video/Drone request UI preserved; fulfillment state NOT asserted as real | AUDIT §13 (booking modal live-functional; `PropertyServiceRequestController::store()` confirmed an empty stub in code) | Direct, dual-sourced (live + code) |
| 28 | Drone excluded from the Package payment path until backend fixed | AUDIT §13 (`CODE FACT`: Drone's `type` excluded from the deduction endpoint's allow-list) | Direct |
| 29 | Responsive: 3 real breakpoints (desktop/tablet/mobile), not legacy's effective 2 | AUDIT §18 (legacy only shows a true desktop vs. collapsed-everything-else split) | Direct fix for a cited gap |
| 30 | No persistent floating action button anywhere in the new architecture | AUDIT §18 (the "Scroll to bottom" button's overlap defect, reproduced at all 3 tested widths) | Direct fix for a cited defect |
| 31 | RTL/LTR structural mirroring required for every new surface | AUDIT §19 (confirmed: legacy List already does this correctly — the standard to match) | Direct |
| 32 | Translated labels must preserve source concept, not just words | AUDIT §4/§17 (P3: "Publish Type" vs. رصيد النشر drift) | Direct fix for a cited defect |
| 33 | Every state in the State Matrix marked VERIFIED or FUTURE STATE | Task brief's explicit instruction ("Only include states supported by evidence or clearly mark future states") | Direct (methodology, not a finding) |
| 34 | AdvertisementValidator/CreateADLicense proxy strategy left undecided | AUDIT §6 (Tuba currently proxies through its own legacy PHP, not the NHC gateway directly) | **BUSINESS DECISION REQUIRED** — re-platform vs. keep proxying |
| 35 | REGA JSON-blob fields (borders, plan/land number, obligations, etc.) — normalize into schema or leave as-is | AUDIT §6.1 (confirmed: currently unqueryable) | **BUSINESS DECISION REQUIRED** |
| 36 | My Properties status vocabulary vs. shared Property/Project lifecycle vocabulary | AUDIT §4 (7 real legacy statuses) vs. TBOS SPEC (existing shared 8-state Property/Project lifecycle, built pre-audit) | **BUSINESS DECISION REQUIRED** |
| 37 | Which roles get the two new permission keys, at what scope | AUDIT §16 (gap identified; no source specifies the resolution) | **BUSINESS DECISION REQUIRED** |
| 38 | Whether Leads stays as a displayed metric at all until it's real | AUDIT §14 | **BUSINESS DECISION REQUIRED** |
| 39 | Rejected-listing reason display — format/content | AUDIT §22 (`OPEN QUESTION` — never observed live) | **BUSINESS DECISION REQUIRED**, pending a follow-up live pass |
| 40 | Pending-tab detail semantics | AUDIT §22 (`OPEN QUESTION`) | **BUSINESS DECISION REQUIRED**, pending a follow-up live pass |
| 41 | Advertiser Type defaults from the authenticated account's `agent_type`, remains user-changeable | Explicit product decision (Phase B.1, Decision 01) + AUDIT §5.2/§10 (legacy's opposite behavior cited as the defect being corrected) | Direct — resolves what was previously an unstated design gap |
| 42 | Changing Advertiser Type cascades to identity fields/labels/validation/POA visibility/Review Summary | Explicit product decision (Decision 01) + AUTHORITY REQ (Create AD License guide §7, §11 — the matrices these cascades implement) | Direct, dual-sourced |
| 43 | Prefix checks are a non-authoritative UX hint only; the Authority's response is the sole source of truth | Explicit product decision (Decision 01) | Direct — a guardrail against the frontend re-implementing authority business logic |
| 44 | Performance elevated to a first-class, 11-metric-inventory experience (Reach/Views/Clicks/Leads/Contacts/Calls/WhatsApp/Visit Requests/Favorites/Shares/future) | Explicit product decision (Decision 02), superseding this document's own earlier 3-metric-only treatment | Direct — an explicit revision, not a new independent finding |
| 45 | Every performance metric classified `CURRENTLY VERIFIED` or `FUTURE/BACKEND-DEPENDENT`, never fabricated | AUDIT §14 (only Reach/Views/Leads have any legacy basis at all; Leads itself is a verified-but-broken hybrid) | Direct |
| 46 | Derived metrics (CTR, conversion rates) architected as a slot, never rendered until both underlying data and a formal definition exist | Explicit product decision (Decision 02/§8.3) | Direct — scope discipline, not a finding |
| 47 | List shows a quick Reach/Views-only performance summary; Detail carries the full KPI/breakdown/trend apparatus | Explicit product decision (Decision 02's "appropriate balance" requirement) | INFERENCE — a specific balance point chosen to satisfy the stated constraint, not itself dictated by the brief |
| 48 | Activity Log formally distinguished from Performance (internal history vs. audience behavior) and explicitly retained as a real, sequenced-later feature | Explicit product decision (Decision 03) | Direct |
| 49 | Unified Promotion pattern (one drawer, parameterized by tier) replacing three separate legacy action buttons | Explicit product decision (Decision 04) + AUDIT §12 (the three-button pattern being replaced) | Direct |
| 50 | Unified Service Request pattern (one drawer, parameterized by service type) replacing three separate legacy triggers | Explicit product decision (Decision 05) + AUDIT §13/§20 (the unlabeled, bespoke legacy triggers being replaced) | Direct |
| 51 | Authority validation state set expanded to 9 explicit categories (invalid format/license/identifier, not found, belongs to another advertiser, type mismatch, unavailable, timeout, success), with no exact error copy invented | Explicit product decision (Decision 06) + AUTHORITY REQ (the 29-code error table's existence, justifying the category set) | Direct, dual-sourced |
| 52 | All Add Property fields reclassified into 5 categories (User-entered/Account-derived/Authority-derived/System-derived/Read-only) | Explicit product decision (Decision 07), refining the audit's original 3-way Data Source Analysis (AUDIT §11) | Direct extension of a prior finding |
| 53 | Existing vs. proposed permission keys made explicit everywhere (`properties.promote`/`properties.services.request` marked PROPOSED — BACKEND-DEPENDENT, not claimed to already exist) | Explicit product decision (Decision 08) + AUDIT §16 (the original gap finding) | Direct |
| 54 | Future extensibility formalized as an architectural constraint (open, data-driven lists for metrics/promotion tiers/service types/activity kinds) rather than a fixed set | Explicit product decision (Decision 09) | Direct — a constraint on *how* Phase C builds these, not new scope |

## Decisions requiring business approval (roll-up)

1. Authority integration re-platforming vs. continued legacy-proxy dependency (#34).
2. Schema investment for currently-unstructured REGA data (#35).
3. Unified vs. divergent status vocabulary between Properties/Projects (#36).
4. Role/scope assignment for the two proposed permission keys, and formally registering them in the permission system before Phase C (#37, #53).
5. Exact wording/visual treatment for the Leads metric's "not yet reliably tracked" state — **narrowed, not closed, by Decision 02**: it is now settled that Leads stays visible (classified `CURRENTLY VERIFIED (displayed)`), but the precise copy/visual treatment for its broken pipeline is still open (#38, refined by #44/#45).
6. Rejected/Pending state semantics, pending a follow-up live audit pass to actually observe them (#39, #40).
7. Formal calculation definitions for any future derived metric (CTR, conversion rates) before they can ever render (#46).
8. Confirm the List-vs-Detail performance summary balance point (Reach/Views only at list density) against actual broker feedback once buildable (#47 — an inference-based UX choice, not directly dictated by any source).

## Traceability gaps carried forward as Open Questions (not resolved by this phase)

Directly inherited from `TBOS_MY_PROPERTIES_AUDIT.md` §28, since no new evidence was gathered in Phase B: the Pro/Featured-and-Photography "dead JS vs. live-functional" discrepancy; the actual behavior of a rejected/invalid license number; the public property page's console errors/duplicated header; Nafath's production-vs-sandbox wiring; the un-expanded "Filters" dropdown's full field set; the property-creation form's full bilingual verification.
