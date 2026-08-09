# TBOS Relationship Vertical Slice Report

**Status: TBOS RELATIONSHIP INTELLIGENCE VERTICAL SLICE — READY**

## 1. Executive Summary

This phase proved that TBOS can represent *relationships* — not just four more CRUD modules bolted onto Leads and Properties. Before writing any Customer/Owner code, a fresh Relationship UX Audit re-read the actual current source (Lead Detail, Property Detail, search, the mock data layer) and found that the underlying data already linked correctly, but the UI stopped at a name on screen — a customer's name in Lead Detail, an owner's name in Property Detail, neither clickable — and, more seriously, that Customer/Owner search had never received the 'own'-scope fix Leads/Properties got in Phase 6, a live PII leak waiting to happen the moment these became real screens. All of that was fixed first. Then the Customer (CUST-01/CUST-02) and Owner (OWN-01/OWN-02/OWN-03) screens were built almost entirely from the existing 80+ component registry, wired into the same Today/Notifications/Search/permission architecture Leads and Properties already use — no second version of anything. A real, previously-latent accessibility bug was also found and fixed along the way: a Drawer's focus trap re-stole focus to its Close button on every keystroke of a controlled text field, discovered only because this phase was the first to type multi-word text into a Drawer's Textarea in an automated test.

## 2. Relationship UX Audit

Full document: `TBOS_RELATIONSHIP_UX_AUDIT.md`. Method: direct inspection of `LeadDetailScreen.tsx`, `PropertyDetailScreen.tsx`, `EntityDetailHeader`/`EntityMeta`, `searchIndex.ts`, `mocks/api/db.ts`/`seed.ts`, `NotificationCenterScreen.tsx`, `ActivityTimeline`, `rolePermissions.ts`, cross-checked against a fresh, exhaustive research pass over `tbos-definition/` and `tbos-blueprint/` for the canonical Customer/Owner/Marketing Request specification.

## 3. Findings

**1 P0, 3 P1, 1 P2, 2 P3.**

- **P0-1**: `searchIndex.ts`'s Customer/Owner blocks checked agency membership only, never the `'own'` scope tier — a PC could search-find another consultant's private customer/owner, including their phone number.
- **P1-1**: `LeadDetailScreen` resolved and displayed the linked Customer's name but never linked to Customer Detail.
- **P1-2**: `PropertyDetailScreen` resolved and displayed the linked Owner's name, combined into an unsplittable string with the broker's name, never linked to Owner Detail.
- **P1-3**: `Owner.linkedPropertyIds` had already silently drifted from `Property.ownerId` (two Phase-6-added properties were missing from their owners' arrays) — a real, live data-integrity bug, not a hypothetical one.
- **P2-1**: `NotificationCenterScreen`'s deep-link resolver hardcoded a single screen (`LEAD-03`) as an `if` statement, about to need a third and fourth near-identical case.
- **P3 (deferred)**: Person/unified-identity (one human as both Customer and Owner) is not defined anywhere in the source docs — flagged as a DEFERRED PRODUCT DECISION, not built. Communication-log entry schema (channel type, direction) is undefined beyond the general "interaction log" concept — kept narrow and generic rather than inventing a taxonomy.

## 4. Fixes

All fixed before any Customer/Owner screen was built:
- P0-1: added `customersForUser()`/`ownersForUser()` to `mocks/api/db.ts`, scoped via `scopeFor()`; `'own'` scope derived transitively (a Customer is "own" if any linked Lead is assigned to the viewer; an Owner is "own" if any linked Property is brokered by the viewer) since neither entity has a stored assignee field. `searchIndex.ts` now calls these instead of the raw arrays.
- P1-1/P1-2: `EntityMeta`'s `EntityMetaItem` gained an optional `onClick`, rendering as a real keyboard-operable `<button>`; `EntityDetailHeader`'s `title` prop widened from `string` to `ReactNode`. Lead Detail's customer name and property meta, and Property Detail's owner meta, are now clickable links to the canonical screens.
- P1-3: an Owner's properties and a Customer's leads are now derived from the FK side (`Property.ownerId`, `Lead.customerId`) everywhere — never from the stored, driftable arrays. Seed data drift was also corrected for hygiene.
- P2-1: replaced the single `if` with a small `RECORD_ROUTE_BUILDERS` map (`LEAD-03`, `CUST-02`, `OWN-02`).

## 5. Deferred Issues

Person/unified-identity model and the communication-log entry schema (§3 P3) — both genuinely undefined in the source documents, not silently decided. Marketing Request tier-gating (which subscription tiers see which requests) is explicitly flagged as an unresolved business decision in `tbos-definition/18_OPEN_QUESTIONS.md` and was not implemented.

## 6. Customer Screen Inventory

| Screen ID | Name | Route | Status |
|---|---|---|---|
| CUST-01 | Customers List | `/customers` | ready |
| CUST-02 | Customer Detail | `/customers/:customerId` | ready |

## 7. Owner Screen Inventory

| Screen ID | Name | Route | Status |
|---|---|---|---|
| OWN-01 | Owners List | `/owners` | ready |
| OWN-02 | Owner Detail | `/owners/:ownerId` | ready |
| OWN-03 | Marketing Requests Queue | `/owners/marketing-requests` | ready |

All five flipped from `status: 'placeholder'` to `'ready'` in `registry/screens/screenRegistry.ts`, wired into `app/router/index.tsx`'s `SCREEN_OVERRIDES` — the same, unmodified routing mechanism every other screen uses.

## 8. Relationship Model

Customer and Owner remain **two independent entities**, per the source documents (no unified-identity concept exists anywhere — §3/§5). Customer↔Property is **not** a direct relationship in the product definition; property interest is routed through Lead (Lead↔Customer, Lead↔Property), and this phase does not invent a direct link. Owner↔Property **is** a real, direct relationship (`Property.ownerId`, the authoritative FK). Marketing Request is a **child entity of Owner** (per `tbos-definition/16_MODULE_SPECIFICATIONS.md`), never a peer top-level module. `Owner.linkedPropertyIds`/`Customer.linkedLeadIds` remain on the types for backward compatibility but are treated as non-authoritative everywhere in this phase's code — the FK side (`Property.ownerId`, `Lead.customerId`) is the single source of truth, precisely because the stored arrays had already drifted once (§3 P1-3).

## 9. Relationship Matrix

| Source → Target | Permission | Navigation | Context preserved |
|---|---|---|---|
| Customer → Lead(s) | `customers.view` + `leads.view` (record-level, own lead's assignee) | `EntityCard` → `/leads/:leadId` | Lead card shows property + stage before navigating |
| Lead → Customer | `leads.view` (record-level) | Header title button → `/customers/:customerId` | Customer name is the header title itself |
| Lead → Property | `leads.view` (record-level) | Meta item button → `/properties/:propertyId` | Property title shown inline |
| Owner → Property(ies) | `owners.view` + `properties.view` (record-level, via brokered property) | `EntityCard` → `/properties/:propertyId` | Card shows type, broker, and status badge |
| Property → Owner | `properties.view` (record-level) | Meta item button → `/owners/:ownerId` | Owner name shown alongside broker name |
| Owner → Marketing Request | `owners.view` + `marketing_requests.respond` | Embedded tab on OWN-02, plus OWN-03 agency-wide queue (same data, no duplicate) | Property context + status shown per request |
| Today → Customer/Owner | Same permission as the target screen | `linkTo`/`linkLabel` on `TodayRecommendation` → canonical screen | Recommendation states owner name + request context before navigating |
| Notification → Customer/Owner | Same permission as the target screen | `RECORD_ROUTE_BUILDERS[sourceScreenId](sourceRecordId)` | N/A this phase (no Customer/Owner notification source exists yet — §23) |

Every relationship above resolves to exactly one canonical screen regardless of entry point (Today, Search, or a related-entity link) — verified by construction, since every deep-link target is the same route the module's own List screen navigates to.

## 10. Routes

`/customers`, `/customers/:customerId`, `/owners`, `/owners/:ownerId`, `/owners/marketing-requests` — all five pre-existed in `SCREEN_REGISTRY` from the Foundation phase (path, permission, nav entry), none invented. React Router v6's automatic route ranking (static segments outrank dynamic ones) resolves `/owners/marketing-requests` correctly ahead of `/owners/:ownerId` with no manual route ordering needed.

## 11. Components Reused

Zero new components were required. Customers/Owners consume: `PageHeader`, `FilterBar`, `DataTable`, `EntityAvatar` (`kind="person"`, used for the first time — Customer/Owner are the first real people-entities in the live app, distinct from Property/Lead's `kind="record"` icon avatars), `EntityCard` (also used for the first time — the generic entity-agnostic card built in the Component Library phase specifically anticipating Customer/Owner), `EntityDetailHeader`, `EntityMeta`, `Badge`, `Tabs`, `ActivityTimeline`, `Drawer`, `Field`, `Textarea`, `Select`, `Checkbox`, `PermissionGate`, `EmptyState`, `ErrorState`, `NoPermissionState`, `Skeleton`, `Button`.

## 12. New Components

None. Every screen was composable from the existing registry — the clearest evidence yet that the Component Library's "entity-agnostic primitives" bet (Phase 4) was correct.

## 13. Mock Data Architecture

`types/entities.ts` gained `CustomerActivity`/`CustomerActivityKind`, `OwnerActivity`/`OwnerActivityKind` (both narrow, generic kind sets — no invented communication-channel taxonomy, §3 P3), `CustomerListItem`/`OwnerListItem` (computed view types, never stored — the direct lesson from P1-3), and extended `MarketingRequest` with `createdAt` (needed for the spec's own "Responded [time ago]" state message) and `lostReason?: LeadLostReason` (reusing the existing taxonomy rather than inventing a second one, per master prompt §32). `mocks/data/seed.ts` gained `CUSTOMER_ACTIVITIES` (10 entries, one customer — `c-6` — deliberately left with none, for a real reachable empty-activity persona), `OWNER_ACTIVITIES` (11 entries), a 4th `MARKETING_REQUEST` (a `lost` example, giving all 4 states — open/in_progress/won/lost — real coverage), and the P1-3 data-hygiene fix. `mocks/api/db.ts` gained `customersForUser`/`ownersForUser` (scoped), `customerById`/`ownerById`, `leadsForCustomer`/`propertiesForOwner`/`marketingRequestsForOwner` (all FK-derived), `customerActivitiesForCustomer`/`ownerActivitiesForOwner` + `add*Activity`, `logCustomerInteraction`, `marketingRequestsForUser` (MM/AO agency-wide, PC/SB matched-only, per spec), `respondToMarketingRequest`/`markMarketingRequestWon`/`markMarketingRequestLost`. `todayRecommendationsForUser` now also merges `computeRelationshipRecommendations()`.

## 14. API Contracts

`lib/api/endpoints/customers.ts` (`customersApi`), `owners.ts` (`ownersApi`), `marketingRequests.ts` (`marketingRequestsApi`) — each mirrors `propertiesApi`'s exact shape (`list`/`get`/sub-resource reads/mutations, all through `apiClient.request`). Hooks: `lib/customers/useCustomers.ts`, `useCustomer.ts`, `useCustomerLookups.ts`; `lib/owners/useOwners.ts`, `useOwner.ts`, `useOwnerLookups.ts`, `useMarketingRequestsQueue.ts` — each mirrors `useProperties.ts`/`useProperty.ts`/`usePropertyLookups.ts` exactly, typed `<TData, ApiError>` from the start. Screens never import `mocks/` directly.

## 15. Customer UX

List: search-first (name), one filter (relationship stage), columns prioritize identity → stage → linked-lead count → last activity — never an overwhelming database export. Detail: no tabs (per spec — a single inline chronological relationship timeline, contrasted deliberately with PROP-02/OWN-02's tab pattern), header states WHO + current stage + linked-lead count, one real spec'd action ("Log interaction"), "Active relationships" section shows every linked Lead as a clickable `EntityCard` (property + stage), Activity section is the real interaction log. "Edit contact info"/"merge/split"/"archive" (also listed as CUST-02 actions in the blueprint) were deliberately not built — basic CRUD, not relationship intelligence, and out of this slice's success-criteria checklist, matching the PROP-03-deferred precedent from Phase 6.

## 16. Owner UX

List: search-first (name), one filter (has open Marketing Requests), columns show property count and open-request count. Detail: tabs (Overview/Marketing Requests/Activity), state-dependent primary action (a header-level "Respond" button appears only when an open Marketing Request exists, exactly mirroring Property Detail's state-dependent primary action pattern), Overview tab shows every linked Property as a clickable `EntityCard`, Marketing Requests tab shows the full state machine (Open → Respond; In Progress → Mark Won/Mark Lost; Won/Lost terminal, with the Lost reason shown inline). "Edit contact info"/"create listing on owner's behalf" were deliberately not built, same rationale as §15.

## 17. Relationship UX

No graph/network visualization was built — confirmed via exhaustive research that none is specified anywhere in `tbos-blueprint`'s component catalog, and the master prompt explicitly forbids building one without a documented requirement. Relationships are represented entirely through information architecture: clickable meta items, `EntityCard` relationship lists, and tabs — exactly the "relationship lists, sections, tabs, contextual links" the master prompt asks for as the default.

## 18. Cross-Entity Navigation

Verified live and by test: Customer → Lead → (Property, via Lead Detail's own P1-1 fix), Lead → Customer, Owner → Property, Property → Owner, Owner → Marketing Request (embedded + queue), Today → Owner, Notification-architecture → Customer/Owner (deep-link resolver ready, §23 explains why it's not yet exercised by a real notification). Every path resolves to the one canonical screen — no duplicate entity implementations were created anywhere.

## 19. Context Preservation

A Lead Detail's header names the Customer directly (never a bare ID) and the property meta item names the Property. A Property Detail's meta row names the Owner directly. A Customer Detail's relationship card names the Property the Lead is about. An Owner Detail's property card names the type and broker. In every direction, the user can state "this Lead belongs to this Customer" / "this Property belongs to this Owner" without reconstructing it manually.

## 20. RBAC

Enforced at all four layers, no scattered `if (role === ...)` checks anywhere:
- **Route-level**: `customers.view`, `owners.view`, `marketing_requests.view` (unchanged `RouteGuard`).
- **List-level**: `customersForUser()`/`ownersForUser()`/`marketingRequestsForUser()`, scoped via `scopeFor()`.
- **Record-level**: `CustomerDetailScreen`/`OwnerDetailScreen` each compute a transitive own-scope check (§4) and render `NoPermissionState` even though the route-level check alone would allow entry — mirrors the LEAD-03/PROP-02 pattern exactly.
- **Action-level**: `PermissionGate` for `customers.edit` (log interaction) and `marketing_requests.respond` (respond/mark-won/mark-lost).

**Role matrix discovered, not invented** (already present in `rolePermissions.ts` from an earlier phase, exercised for the first time here): SM and OM hold **no** `customers.*`/`owners.*`/`marketing_requests.*` grant at all and correctly see nothing; MM holds `owners.*`/`marketing_requests.*` but **not** `customers.*`; PC holds `customers.edit` but only `owners.view` (no edit). Tested directly (§34).

## 21. Privacy / PII

The P0-1 fix (§3/§4) is the core privacy guarantee this phase adds: Customer `phone` and Owner `phone` never surface through search, relationship previews, Today, or notifications outside the viewer's actual scope. Relationship cards (`EntityCard`) show only name/type/status — never phone numbers — even for in-scope records, keeping PII confined to the canonical detail screen itself. No new PII fields were introduced.

## 22. Activity

`CustomerActivityKind`/`OwnerActivityKind` stay deliberately narrow (`created`/`interaction_logged`/`relationship_stage_changed`/`lead_linked` and `created`/`property_linked`/`marketing_request_opened`/`_responded`/`_won`/`_lost` respectively) — matching exactly what the source documents support (a general "interaction log" concept, no channel-type schema) rather than inventing WhatsApp/email/call categories. Both reuse `ActivityTimeline` unchanged.

## 23. Today Integration

`computeRelationshipRecommendations()` (new, `lib/relationships/computeRecommendations.ts`) surfaces exactly the one Today-worthy relationship signal the source documents actually specify: an **open** Marketing Request (`tbos-blueprint/04_SCREEN_INVENTORY.md` OWN-03: "derived-surfaced on TODAY-01... the platform's one deliberate cross-surface exception"). "Customer requiring follow-up" and "inactive relationship" recommendations were deliberately **not** invented — no source document specifies Today-surfacing for Customer/Owner staleness, only for Marketing Requests, and master prompt §35 explicitly forbids inventing recommendation logic. A new `today.category.relationship` category was added (both dictionaries) since none of the four existing categories honestly fit a relationship-sourced entry.

## 24. Notification Integration

The `RECORD_ROUTE_BUILDERS` map (§4 P2-1 fix) is ready to deep-link a `CUST-02`/`OWN-02` notification to the specific record, using the exact same `sourceScreenId`/`sourceRecordId` mechanism Leads already use — no second notification architecture. No Customer/Owner-sourced notification exists in the current seed data to demonstrate live (the source documents don't specify one either), so this is correctly an unexercised-but-ready integration point, not a gap.

## 25. Search

Customers/Owners are indexed in the same `searchIndex.ts` the P0-1 fix hardened — scope-correct from the moment they became real screens, never a second search mechanism. Verified live (Cmd+K, "Ahmed" → Lead + Customer results) and by 3 new regression tests in `tests/search.test.ts`.

## 26. Filters

`FilterBar` reused unchanged for both List screens — Customers filters by relationship stage (a `Select`), Owners filters by "has open Marketing Requests" (a `Checkbox`, the first non-`Select` filter control in the app, still composed through `FilterBar`'s existing `filterControls` slot — no new filter architecture).

## 27. State Architecture

Every screen supports Loading/Populated/Empty/Error, plus the relationship-specific states the master prompt names: "no active leads" (Customer Detail), "no properties"/"no marketing requests" (Owner Detail tabs), and restricted (record-level, both). No generic fake states were added.

## 28. Brand Integration

Zero raw hex values in any new file — verified by construction. Tuba Purple appears only as `action.primary.bg` (Log interaction / Respond primary actions) and active-nav state. Tuba Coral does not appear anywhere in Customer/Owner UI logic. Marketing Request's four states map onto the existing five-meaning system (open=info, in_progress=warning, won=success, lost=danger) — no bespoke hue, consistent with `03_COLOR_SYSTEM.md §3`'s binding rule.

## 29. Pattern Language

Not used anywhere in this phase's screens. Customers/Owners are data-heavy, relationship-dense screens — exactly the register the Brand Pattern Language's own usage rules (`design-system/20_BRAND_PATTERN_LANGUAGE.md`) call a bad fit ("dense operational screens"). No empty state in this phase reached the bar the master prompt sets for "a genuinely apt brand moment" the way Properties' first-listing empty state did in Phase 6 — a deliberate restraint decision, not an oversight.

## 30. RTL/LTR

Verified live at 1440px and 390px, Arabic and English. Header layout, tab order, `EntityCard` icon/status placement, and the bottom mobile tab bar all mirror correctly with zero manual RTL-specific code in any new file — logical CSS properties and existing component behavior handle it by construction, the same result Phase 5/6 already established. Arabic-Indic numerals render correctly for relative-date formatting (`formatRelativeDate`, a new small locale-aware formatter following the established `formatSlaLabel`/`formatDate` pattern, since `t()` has no interpolation support).

## 31. Dark Mode

Verified live on Customers List, Owner Detail (Overview + Marketing Requests tabs). Every new surface uses semantic tokens exclusively — no component-specific dark-mode override was needed. Marketing Request status badges (info/warning/success/danger) all read correctly with good contrast in dark mode (screenshot `05-owner-detail-marketingrequests-desktop-dark-en-ltr.png`).

## 32. Responsive

Verified at 1440px and 390px. `DataTable` (Customers/Owners List) prioritizes the entity + stage/status column at mobile width, matching the exact lesson Phase 6's own audit learned and fixed for Properties (status must be the prioritized second column, not buried behind horizontal scroll). Owner Detail's property/relationship cards collapse to a single column at mobile with no overflow; tabs remain reachable; the primary action button stays full-width-friendly. No page-level horizontal overflow found at either breakpoint, in either direction (LTR/RTL).

## 33. Accessibility

No new accessibility mechanism was needed for the screens themselves — every reused primitive already carries its contract. This phase found and fixed a real, previously-latent defect in a *shared* primitive: `useFocusTrap`'s auto-focus effect was keyed on an unstable inline `onEscape` callback, causing it to re-run and re-steal focus to the first focusable element (often a Drawer's Close button) on every keystroke of any controlled text field inside the trap — meaning a later Space/Enter keystroke could silently close the panel and discard the user's input. This affected every Drawer with a text-input field across the entire app (Lead's Add Note, Log outside response, Schedule follow-up; Property's compliance-resolve reference-number field), not something newly introduced by this phase — it was simply never exercised by an automated test that typed multi-word text into a Drawer field until Customer Detail's "Log interaction" test did. Fixed at the source (`lib/a11y/useFocusTrap.ts`) by splitting the initial-focus effect (keyed only on `active`) from the keydown-trap effect (keyed on `active`/`containerRef`/`onEscape`, safe to re-subscribe on every render since it doesn't move focus). Full regression suite re-run clean after the fix (109 pre-existing tests, unaffected).

## 34. Testing

- `npx tsc --noEmit` — clean.
- `npx eslint . --max-warnings=0` — clean.
- `npx vitest run` — **125/125 passing** (109 pre-existing + 3 new search-scope regression tests + 13 new relationship tests).
- `npm run build` — clean production build (313.1 kB main / 79.1 kB gzip, no new dependency).

New tests: `tests/search.test.ts` gained 3 (Customer scope-leak prevention, positive in-scope case, Owner cross-agency exclusion). `tests/relationships.test.tsx` (new, 13 tests) covers: Customers List PC-own-scope-via-leads + AO agency-wide + SM route-level denial; Customer Detail record-level denial + linked-lead click-through to canonical Lead Detail + end-to-end log-interaction; Owners List cross-agency exclusion; Owner Detail record-level denial + P1-3 FK-derived-property regression (the property that was missing from the stored array before the fix) + Marketing Request Open→In Progress state transition; Property→Owner and Lead→Customer cross-navigation; Today→Owner deep-link. Two genuine test-writing lessons emerged and were fixed: (1) `window.location.pathname` is unreliable under `MemoryRouter` — navigation must be proven via destination-specific rendered content instead; (2) a mutation's async invalidate+refetch must be asserted with `findBy*` (retrying), never a synchronous `getBy*`, immediately after the triggering click.

## 35. Browser Verification

Performed live via Playwright against the running dev server. Walked Customers List → Customer Detail → linked Lead → back; Owners List → Owner Detail → Overview/Marketing Requests/Activity tabs → Respond action; Property Detail → Owner (round trip); Today → Owner deep-link. Verified at 1440px and 390px, Arabic/RTL and English/LTR, light and dark mode. No horizontal overflow, no broken RTL, no unreadable badges found in the final pass.

## 36. Screenshots

`tbos-frontend/screenshots/relationships/` (9 files):

| File | What it shows |
|---|---|
| `01-customers-list-desktop-light-en-ltr.png` | Customers List, 1440px |
| `02-customer-detail-desktop-light-en-ltr.png` | Customer Detail — relationships + activity |
| `03-owners-list-desktop-light-en-ltr.png` | Owners List, 1440px |
| `04-owner-detail-marketingrequests-desktop-light-en-ltr.png` | Owner Detail Marketing Requests tab — 2-request history incl. Lost reason |
| `05-owner-detail-marketingrequests-desktop-dark-en-ltr.png` | Same, dark mode |
| `06-customers-list-desktop-dark-en-ltr.png` | Customers List, dark mode |
| `07-customers-list-390-dark-en-ltr.png` | Customers List, 390px, dark — Stage correctly prioritized second column |
| `08-owner-detail-390-light-en-ltr.png` | Owner Detail, 390px — stacked property cards |
| `09-owner-detail-390-ar-rtl.png` | Owner Detail, 390px, Arabic/RTL — mirrored header/tabs/nav |

## 37. Performance

No new dependency added. Production build grew from 280.0 kB to 313.1 kB raw (72.8 kB → 79.1 kB gzip) for five full screens plus their data/permission/mutation layers — proportionate to Phase 6's own growth for a comparable scope, no bloat. No heavy graph/visualization library was added (none was needed, §17).

## 38. Backend Handoff

For a real backend to replace `mocks/api/db.ts` behind the existing `lib/api/client.ts` seam:

- **Customer API**: list (own/agency-scoped, derived via linked Leads server-side), get, linked-leads read, interaction log read/append.
- **Owner API**: list (own/agency-scoped, derived via linked Properties server-side), get, linked-properties read, activity read.
- **Marketing Request API**: agency-wide queue (MM/AO) vs. matched-only (PC/SB) list, respond/mark-won/mark-lost mutations, matching the exact state machine in `tbos-blueprint/06_STATE_ARCHITECTURE.md`.
- **Permissions**: the frontend's transitive `'own'`-scope derivation (a Customer/Owner is "own" via a linked Lead/Property) needs a real backend-side equivalent — this frontend layer is UX only, never the authorization boundary.
- **Search**: no new backend contract beyond what Leads/Properties already require — Customers/Owners reuse the same search infrastructure.
- **Today/Notifications**: Marketing-Request-sourced Today recommendations need to be computed server-side or the existing client-side `computeRelationshipRecommendations()` ported as-is (already a pure function over real records). A Customer/Owner-sourced notification type doesn't exist yet in the product definition — flagged for whichever phase defines one.
- **Data integrity**: whatever replaces `Owner.linkedPropertyIds`/`Customer.linkedLeadIds` server-side should treat the FK side (`Property.ownerId`/`Lead.customerId`) as authoritative, per this phase's P1-3 finding — a denormalized array requires active sync discipline a real backend should avoid by not maintaining one at all.

No backend work was implemented this phase, per explicit instruction.

## 39. Known Limitations

1. Person/unified-identity (one human as both Customer and Owner) is not modeled — a documented, deliberate gap (§5/§8), not an oversight.
2. Customer/Owner "edit contact info" and Customer "merge/split"/"archive" and Owner "create listing on owner's behalf" (all listed as CUST-02/OWN-02 actions in the blueprint) were not built — basic CRUD/creation-wizard scope, deferred per the PROP-03 precedent.
3. Marketing Request tier-gating logic is unimplemented — an explicitly unresolved business decision per `tbos-definition/18_OPEN_QUESTIONS.md`.
4. No Customer/Owner-sourced notification exists yet to exercise the ready `RECORD_ROUTE_BUILDERS` deep-link path live (§24) — the mechanism is built and tested at the routing level, just not yet fed by a real notification-generating event.
5. Communication-log entry schema (channel type, message body) remains undefined, per the source documents themselves (§3 P3).

## 40. Final Readiness Assessment

**TBOS RELATIONSHIP INTELLIGENCE VERTICAL SLICE — READY.** The Relationship UX Audit found and fixed 1 P0 (a real PII-adjacent search leak) and 3 P1s before any Customer/Owner screen was built; both modules were built with zero new components, proving the Component Library's entity-agnostic bet; RBAC is enforced at all 4 layers using role grants already present in the codebase, exercised here for the first time; privacy is protected end-to-end (no PII leak through search, relationship cards, or Today); cross-entity navigation resolves to one canonical screen in every direction, both ways (Customer↔Lead↔Property, Owner↔Property, Owner↔Marketing Request); RTL/LTR/dark/responsive/accessibility were verified live, including a genuine shared-primitive accessibility bug found and fixed (not merely worked around); TypeScript/ESLint/tests (125/125)/build are all clean; the architectural integrity check confirms no duplicate Shell/Design System/Component Library/Permission/Notification/Search/API architecture was introduced anywhere. Customers and Owners feel like the same TBOS as Today/Leads/Properties — proven by direct, live navigation between all four modules, not assumed. Per master prompt §80, stopping here: no work started on Contracts, Marketing, Finance, Wallet, Analytics, Reports, Automation, AI Copilot, Settings, or Platform Console.
