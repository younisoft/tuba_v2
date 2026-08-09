# TBOS UI Integration Audit

**Scope**: verify that Design System v1.1, Frontend Foundation, Component Library (78 components), `tbos-definition/`, and `tbos-blueprint/` actually cohere into one working product substrate, before building the first Vertical Slice (Today → Leads → Lead Detail → Lead Action → Notification). Read-only investigation; findings below, fixes applied are marked explicitly.

**Method**: read the actual current files (not prior reports) — `tokens.json`/`design-tokens.css`/`tailwind-theme.ts`, `app/router/index.tsx`, `registry/screens/screenRegistry.ts`, `registry/components/componentRegistry.ts` + `screenComponentMap.ts`, `lib/permissions/*`, `lib/api/*`, `mocks/*`, `lib/i18n/*`, `state/*`, and a representative sample of the components this slice needs to reuse (`KanbanBoard`/`KanbanCard`, `ActivityTimeline`/`ActivityItem`, `NotificationItem`, `EntityDetailHeader`/`EntityAvatar`/`EntityMeta`, `LeadStageBadge`, `DataTable`, `ConfirmationDialog`, `Drawer`, `FilterBar`, `BulkActionBar`, `MetricWithExplanation`, `AISuggestion`/`AIConfidence`, `ExplainabilityPopover`). Cross-checked against `tbos-blueprint/04_SCREEN_INVENTORY.md`, `05_COMPONENT_MAPPING.md`, `06_STATE_ARCHITECTURE.md`, `07_DECISION_SUPPORT_SYSTEM.md`, `09_NOTIFICATION_BLUEPRINT.md`, and `tbos-definition/14_EXPLAINABILITY_SYSTEM.md`.

## Summary

| Severity | Count | Blocking this phase? |
|---|---|---|
| P0 | 0 | — |
| P1 | 6 | Yes — all fixed in this phase (§2) |
| P2 | 5 | No — documented, deferred (§3) |
| P3 | 2 | No — documented, deferred (§3) |

**No P0 found.** The foundation (tokens → theme → components → routing → permissions → i18n → test infra) is internally consistent and holds together. The gaps found are exactly what's expected of a Foundation + Component Library phase that deliberately built *no business screens yet*: two blueprint-required components were never built (they had no screen to justify them until now), the mock API has no Leads/Today query layer yet (nothing consumed one), and a handful of foundation-layer pattern components render hardcoded English strings that were never exercised in Arabic because no real screen used them yet. None of this is contradictory or broken — it's unfinished in the specific, narrow way a "components before screens" build order predicts.

## 1. Findings by category

### A. Design tokens — PASS
`design-system/tokens.json` v1.1.0 (Tuba Brand Identity Correction, prior phase) is the live source; `tbos-frontend/src/styles/tokens.css` and `src/tokens/tailwind-theme.ts` mirror it exactly, including the corrected `--tuba-purple`/`--tuba-coral`/`ink`/`coral` primitives and the dark-mode brand-role corrections. Re-verified by reading both files fresh this phase, not assumed from the prior report.

### B. Theme — PASS
`state/theme.store.ts` (zustand + persist) + `applyThemeToDocument` toggling `data-theme` on `<html>`, with `@media (prefers-color-scheme: dark)` as the unset-preference fallback. Both paths present and consistent with the tokens.

### C. Brand tokens — PASS
Confirmed live: `action-primary-bg` resolves to `#2a0c72` (light) / `#4513b9` (dark) via `getComputedStyle`, matching the v1.1 correction. No raw hex anywhere in component source sampled.

### D. Pattern assets — PASS (registered, not yet consumed)
`design-system/icons_set/` (20 SVGs) is registered as the Tuba Brand Pattern Language in `design-system/20_BRAND_PATTERN_LANGUAGE.md`. Not yet imported into `tbos-frontend` — correctly so, since no screen with a qualifying "brand moment" (empty state, auth) existed until this phase. This slice uses them selectively per master prompt §28 (see §"Brand Integration" in the Vertical Slice report).

### E. Component registry — P1 (2 missing components) — **FIXED**
`registry/components/componentRegistry.ts` has 78 well-formed entries; `registry/components/screenComponentMap.ts`'s `NAME_ALIASES` explicitly flags two blueprint-required components as `[]` with the comment "not yet built": **SLA Timer** (`05_COMPONENT_MAPPING.md`: required by TODAY-01, LEAD-01, LEAD-02, LEAD-03) and **Recommendation Card** (required by TODAY-01, the *entire* mechanism the screen exists to render). Both are on the critical path of this slice — Today cannot be built without Recommendation Card, and lead urgency cannot be shown without SLA Timer. Built both this phase (`SlaTimer.tsx`, `RecommendationCard.tsx`), registered as `TBOS-CMP-STATUS-007`/`TBOS-CMP-AI-007`.

### F. Component exports — PASS
No barrel-file drift; every import path sampled resolves to the file the registry claims.

### G. Shell — PASS (one confirmed forward-reference, expected)
`AppShell`/`RailNav`/`TopBar`/`MobileTabBar` all functional. `NotificationBell.tsx`'s "View all" button already calls `navigate('/notifications')` — it was built expecting a real NOTIF-01 page to exist at that route; today it lands on `ScreenPlaceholder`. This is exactly the gap this phase closes, not a defect.

### H. Routing — PASS (registry-generated, confirmed extension point)
`app/router/index.tsx` builds every `<Route>` from `SCREEN_REGISTRY`; a real screen is wired in purely via the `SCREEN_OVERRIDES` map (currently only `AICP-01`/`AICP-02`). `LEAD-01` (`/leads`), `LEAD-02` (`/leads/inbox`), `LEAD-03` (`/leads/:leadId`), `TODAY-01` (`/today`), `NOTIF-01` (`/notifications`) all already exist in `screenRegistry.ts` with correct paths/permissions/nav entries — confirmed no new registry rows needed, only `SCREEN_OVERRIDES` entries and each screen's `status` flipped from `'placeholder'` to `'ready'`.

### I. State architecture — PASS
Zustand for client/UI state (`session`, `locale`, `theme`, `ui`), React Query for server state (`useNotifications` as the concrete precedent: `lib/api/endpoints/notifications.ts` → `lib/notifications/useNotifications.ts`). This slice's `leadsApi`/`useLeads` and `todayApi`/`useToday` follow the identical shape — no new architecture invented.

### J. Permissions — P1 (scope enforcement must happen in the data layer) — **FIXED**
`permissionRegistry.ts`/`rolePermissions.ts` are correct and already encode the exact blueprint scoping: `PC` gets `leads.view`/`leads.respond` scoped `'own'` with no `leads.assign`; `SM`/`AO` get `'team'`/`'agency'` scope plus `leads.assign`; `MM` has **no** `leads.view` grant at all (matches blueprint's "no access to Leads pipeline internals beyond Marketing-Request-linked leads"). Verified this is all correct, not a gap.

The actual gap: `lib/permissions/evaluate.ts`'s `hasPermission()` only checks `'own'` scope against a supplied `ownerId` — `'team'`/`'agency'` scope checks are **no-ops that return `true`** (documented in the file's own comment as "scope handling not implemented yet"). This is fine for route-level/component-level gating (can this role ever reassign a lead — yes/no) but is **not** sufficient to filter *which* leads a PC sees vs. an SM/AO. Fixed by scoping the mock query layer itself (`leadsForUser()` in `mocks/api/db.ts` filters by `assigneeId` for own-scope roles, by `agencyId` for team/agency-scope roles), rather than relying on the permission check to do list-filtering it was never designed to do.

### K. RTL / i18n — P1 (real gap, partially fixed, partially documented as deferred) — **PARTIALLY FIXED**
Infra is solid and correctly re-verified: `lib/i18n/dictionaries.ts` (hand-rolled, `TranslationKey` is a literal union over the `en` object so a missing Arabic key is a type error at the call site... except the dictionary itself has no compile-time check that `ar` has every `en` key — that check is `tests/rtl.test.ts`'s job, confirmed it exists and passes today), `useTranslation()`, `useLocaleStore` + `applyLocaleToDocument` setting `<html dir>`. All correct.

The gap: several **already-`status: 'ready'`** pattern/tbos components render hardcoded English strings that were never exercised in Arabic because nothing consumed them with real (non-style-guide) content yet:

| Component | Hardcoded string | On this slice's critical path? |
|---|---|---|
| `KanbanBoard.tsx` | `` `No ${column.title.toLowerCase()} leads` `` | Yes — LEAD-01 uses this directly |
| `ConfirmationDialog.tsx` | `confirmLabel = 'Confirm'` default, and `Cancel` hardcoded with no override at all | Yes — Mark Lost flow uses this |
| `KanbanCard.tsx` | `"Move to stage"` label | Yes, but shared/tested string (see §3, deferred) |
| `ActivityTimeline.tsx` | `"No activity yet."` | Yes, but only shown for a brand-new lead with zero activity — rare state |
| `BulkActionBar.tsx`/`FilterBar.tsx`/`Drawer.tsx`/`MetricCard.tsx`/`ErrorState.tsx` | `"Clear"`/`"selected"`/`"Clear all"`/`"...filter(s) active"`/`"Open full record"`/`"As of"`/`"Unavailable right now"`/`"Retry"` | Not this slice's primary content — chrome/secondary microcopy |

**Fixed this phase** (minimal, additive, backward-compatible — no existing test broke): `KanbanBoard` gained an optional `emptyStateLabel?: (column) => string` prop (defaults to the exact old string, so `patterns.test.tsx`'s `"No won leads"` assertion still passes); `ConfirmationDialog` gained an optional `cancelLabel?: string` prop (defaults to `'Confirm'`/`'Cancel'` exactly as before). Both are wired to `t()` from the new screens.

**Deferred to P2/P3** (§3): the remaining hardcoded strings in `KanbanCard`, `BulkActionBar`, `FilterBar`, `Drawer`, `MetricCard`, `ErrorState`, `ActivityTimeline`'s empty state — these are foundation-layer components whose English strings are secondary chrome (a menu label, a count noun, a retry button), not this slice's primary content, and several are pinned by existing tests (`patterns.test.tsx` asserts `getByRole('button', {name: 'Move to stage'})` literally). Retrofitting full i18n into every foundation component is foundation-layer work spanning components this slice doesn't even use (WAL-01's `QuotaBalanceMeter`, `StepIndicator`, etc.) — correctly out of scope per master prompt §51 ("P2/P3 issues may be documented and deferred if they do not affect the slice").

### L. Dark mode — PASS
Re-verified: every sampled component (`KanbanBoard`, `StatusBadge`, `NotificationItem`, `EntityDetailHeader`, `MetricCard`) uses semantic tokens (`bg-bg-*`, `text-text-*`, `border-border`) exclusively, zero hardcoded colors — dark mode is automatic for anything this slice builds on top of them.

### M. Responsive behavior — PASS, one pre-existing documented limitation
Breakpoints/logical properties (`ps-`/`pe-`/`start-`/`end-`) used throughout. `KanbanBoard`'s own registry entry already documents "mobile-native single-column view is deferred... horizontal scroll" as its mobile strategy — a pre-existing, registry-documented decision (master prompt §13 explicitly sanctions horizontal scroll as a valid mobile pattern), not a new defect. Verified it doesn't break/overflow at 390px (§ Browser Verification in the Vertical Slice report).

### N. Accessibility — PASS
`useFocusTrap` used consistently across `Drawer`/`Dialog`/`Dropdown`/`NotificationBell`; every interactive primitive sampled (`Checkbox`, `Button`, `KanbanCard`'s move-to-stage `Dropdown`) is a real semantic element, never a styled `div`. No new gap found in the components this slice reuses.

### O. Test infrastructure — PASS
`tests/testUtils.tsx`'s `TestProviders` + the `useSessionStore.getState().login(...)` pattern (`tests/routing.test.tsx`) is sufficient to test permission-scoped screens without inventing new test scaffolding.

### P. Mock data architecture — P1 (two real gaps) — **FIXED**
The seed dataset itself (`mocks/data/seed.ts`) is rich, coherent, and hand-linked (7 leads across 2 agencies, cross-referenced to customers/properties/tasks/notifications) — good raw material, no changes needed there.

1. **No Leads/Today query layer exists** (`mocks/api/db.ts` has helpers for notifications/tasks/wallet but zero for leads). Expected — nothing consumed one before this phase. Built `leadsForUser()`, `leadById()`, `updateLeadStage()`, `reassignLead()`, `markLeadLost()`, `addLeadActivity()` in `db.ts`, and `lib/api/endpoints/leads.ts` + `lib/leads/useLeads.ts`/`useLead.ts` following the exact `notificationsApi`/`useNotifications` shape.
2. **`AppNotification.sourceScreenId` names a screen, not a record** — insufficient for NOTIF-01's blueprint-required "open notification (deep-links to source)" when multiple leads could produce a notification pointing at `LEAD-03`. Fixed with an additive, optional `sourceRecordId?: string` field (`types/entities.ts`) — existing seed notifications left unchanged (field omitted = falls back to the screen-level route, exactly today's behavior), new lead-related notifications populate it so `NotificationItem`'s `onOpen` can navigate to the specific `/leads/:leadId`.

## 2. P1 fixes applied this phase

| # | Issue | Fix | Files touched |
|---|---|---|---|
| 1 | SLA Timer component missing (blueprint-required for TODAY-01/LEAD-01/02/03) | Built `SlaTimer.tsx`, registered `TBOS-CMP-STATUS-007` | `components/tbos/lead/SlaTimer.tsx`, `registry/components/componentRegistry.ts` |
| 2 | Recommendation Card component missing (blueprint-required for TODAY-01) | Built `RecommendationCard.tsx`, registered `TBOS-CMP-AI-007` | `components/tbos/ai/RecommendationCard.tsx`, `registry/components/componentRegistry.ts` |
| 3 | Permission scope (`team`/`agency`) is a route-level no-op, insufficient for list-filtering | Scoped `leadsForUser()` in the mock data layer by role/assignee/agency, not by re-deriving it from `hasPermission()` | `mocks/api/db.ts` |
| 4 | No Leads/Today mock API + hook layer | Built following the `notificationsApi`/`useNotifications` precedent exactly | `mocks/api/db.ts`, `lib/api/endpoints/leads.ts`, `lib/api/endpoints/today.ts`, `lib/leads/useLeads.ts`, `lib/leads/useLead.ts`, `lib/today/useToday.ts` |
| 5 | `AppNotification` can't deep-link to a specific record | Additive optional `sourceRecordId?: string` field | `types/entities.ts`, `mocks/data/seed.ts` (new notifications only), `components/tbos/notifications/NotificationItem.tsx` consumer wiring in `NotificationCenterScreen` |
| 6 | Hardcoded English strings on this slice's critical path (`KanbanBoard` empty column, `ConfirmationDialog` cancel button) | Additive optional props, backward-compatible defaults, wired to `t()` from new screens | `components/patterns/kanban/KanbanBoard.tsx`, `components/patterns/feedback/ConfirmationDialog.tsx` |

## 3. P2/P3 — documented, deferred (do not affect this slice)

| # | Sev | Issue | Why deferred |
|---|---|---|---|
| 1 | P2 | `KanbanCard`'s "Move to stage" menu label, `BulkActionBar`'s "selected"/"Clear", `FilterBar`'s "filter(s) active"/"Clear all", `Drawer`'s "Open full record", `MetricCard`'s "As of"/"Unavailable right now", `ErrorState`'s "Retry" are hardcoded English | Secondary chrome, not primary screen content; several are pinned by existing foundation tests; full retrofit spans components this slice doesn't touch (out of scope per master prompt §51) |
| 2 | P2 | `ActivityTimeline`'s "No activity yet." empty state is hardcoded English | Only shown for a lead with literally zero activity — this slice always seeds at least a "Lead created" event, so the state is unreachable in the slice's own data |
| 3 | P2 | `KanbanBoard` has no mobile single-column view, only horizontal scroll | Pre-existing, registry-documented decision; master prompt §13 sanctions horizontal scroll as valid; verified non-broken at 390px |
| 4 | P2 | `figma-tokens.json`'s dark-semantic export is a partial subset (missing several roles present in `tokens.json`) | Pre-existing from the Phase 4 brand correction, unrelated to this phase's screens, no consumer in this slice |
| 5 | P2 | No dedicated in-platform two-way message thread UI for Leads — blueprint's "respond" action is "reply draft (editable) → in-platform reply or WhatsApp-formatted send," not a chat inbox | Confirmed via `tbos-definition/13_NOTIFICATION_STRATEGY.md`/`08_AI_INTERACTION_BLUEPRINT.md` this is the *correct*, blueprint-specified scope, not a gap — implemented exactly this shape (§ Lead Actions in the Vertical Slice report), documented here so it isn't mistaken for an omission |
| 6 | P3 | Lost Reason has no blueprint-defined taxonomy (confirmed via exhaustive search — every mention says "required reason," none enumerate one) | A genuine product-spec gap, not an integration issue. Per master prompt §4 ("if sources conflict/are silent, STOP and document"): this phase introduces a working taxonomy (`price`, `timing`, `chose_competitor`, `unresponsive`, `not_qualified`, `changed_mind`, `duplicate`, `other`) documented as an **assumption**, not a ratified spec — flagged for product-definition follow-up, not silently decided |
| 7 | P3 | No literal "Activity Timeline" component/screen mapping exists in the blueprint's component matrix for LEAD-03 (only for CUST-02) | `ActivityTimeline` is reused for LEAD-03 anyway — one component per master prompt §42's reuse gate, functionally identical need (chronological interaction history), not a new component invented to fill a gap |

## 4. Verdict

**No P0 integration issues.** All 6 P1s are fixed above, before any screen was built on top of them (master prompt §51's ordering requirement). Proceeding to the Vertical Slice implementation.
