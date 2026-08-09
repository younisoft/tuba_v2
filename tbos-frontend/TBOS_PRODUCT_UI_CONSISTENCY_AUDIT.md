# TBOS Product UI Consistency Audit

**Scope**: does the UI language established by the First Vertical Slice (Today, Leads Pipeline, Leads Inbox, Lead Detail, Notification Center) hold together as one repeatable grammar strong enough to scale into a second, substantially different operational domain (Properties)? Read-only investigation of the actual current source, then fixes.

**Method**: re-read all 5 vertical-slice screen files fresh this phase (not assumed from the Phase 5 report), plus the components they compose, the permission/search infrastructure underneath them, and the two not-yet-consumed status-badge components (`PropertyStatusBadge`) left over from the Component Library phase. Cross-checked against `tbos-blueprint/17_ACCEPTANCE_CRITERIA.md` (GS-01) for the one finding that touches correctness, not just consistency.

## Summary

| Severity | Count | Blocking Properties? |
|---|---|---|
| P0 | 0 | — |
| P1 | 3 | Yes — all fixed below |
| P2 | 2 | No — fixed anyway (small, directly reused by Properties) |
| P3 | 3 | No — documented, deferred |

**No P0.** The slice's UI grammar is genuinely repeatable — every list screen follows the same header→filter→content→states shape, every record-detail screen follows the same header→context→actions→history shape, and the permission/state/empty/error vocabulary is uniform. The gaps found are exactly the kind a first slice leaves behind: one real correctness bug in shared infrastructure (search scope), one component nobody had exercised with real i18n yet, and one small duplicated pattern about to be duplicated a fifth time.

## Findings

### P1-1 — Global Search leaks out-of-scope records (correctness, not just consistency)

- **Finding**: `lib/search/searchIndex.ts`'s Leads and Properties loops filtered by `agencyId` only, never by the `'own'` scope tier a Property Consultant's `leads.view`/`properties.view` grant is actually restricted to.
- **Evidence**: `tbos-blueprint/17_ACCEPTANCE_CRITERIA.md` GS-01: "Search never leaks out-of-scope records... a Property Consultant searches for a keyword that matches another consultant's private lead... that lead does not appear." The code did the opposite — any agency member could search-find (and see the existence/name of) a teammate's own-scoped lead or property, even though `LeadDetailScreen`'s own record-level check (built in Phase 5) would correctly block navigating into it.
- **Why it matters**: this is search infrastructure every module shares — Leads already violated it, and Properties would inherit the exact same leak on day one, at PC scope, the persona this bug affects most.
- **Impact on Properties**: direct — `properties.view` is `'own'`-scoped for PC/SB exactly like `leads.view`.
- **Fix**: added `scopeFor(role, permission)` to `lib/permissions/evaluate.ts` (the grant-scope lookup `hasPermission()` doesn't expose); `SearchContext` now carries `userId`/`role`; both the Leads and Properties loops additionally filter by `assigneeId`/`brokerId` when the caller's grant is `'own'`-scoped. `CommandPalette.tsx` updated to pass the new context fields. Regression test: `tests/search.test.ts` (4 tests, all passing), asserting the exact GS-01 scenario in both directions (PC never sees a teammate's lead; SM/team-scope does).
- **Status**: **Fixed.**

### P1-2 — `PropertyStatusBadge` never received the i18n fix `LeadStageBadge` got

- **Finding**: `components/tbos/status/PropertyStatusBadge.tsx` (built in the Component Library phase, before any real screen consumed it) still hardcoded English labels (`'Draft'`, `'Pending Compliance'`, …) — the exact defect `LeadStageBadge` had until Phase 5's audit fixed it by reading from the i18n dictionary.
- **Evidence**: direct file comparison — `LeadStageBadge` calls `useTranslation()` and a `STAGE_MAP` of dictionary keys; `PropertyStatusBadge` still had a `STATUS_MAP` of raw English strings.
- **Why it matters**: this is precisely the component Properties List/Detail's status badges depend on. Shipping it unfixed would mean Properties launches with an Arabic-locale regression the Leads slice already fixed a phase ago.
- **Impact on Properties**: direct — every Properties screen shows this badge.
- **Fix**: added 8 `property.status.*` key pairs (en/ar) to `dictionaries.ts`; `PropertyStatusBadge` now mirrors `LeadStageBadge`'s exact pattern.
- **Status**: **Fixed.** Verified: `tests/tbosComponents.test.tsx`'s existing Sold/Rented-vs-Active icon-distinction test still passes unchanged (it asserts icon shape, not text).

### P1-3 — Page header markup hand-duplicated across 4 screens, about to become 5

- **Finding**: `TodayScreen`, `LeadsPipelineScreen`, `LeadsInboxScreen`, and `NotificationCenterScreen` each independently wrote the identical `<h1 className="text-h1 text-text-primary">…</h1><p className="mt-1 text-body-lg text-text-secondary">…</p>`(+ optional actions row) block — confirmed by direct grep, not assumption.
- **Why it matters**: exactly the "is there a repeatable UI grammar" question this audit exists to answer. There *is* a grammar, but it wasn't factored into a component, so nothing enforces it stays consistent — the natural failure mode is screen 5 (Properties List) drifting slightly (different heading size, missing subtitle margin, etc.) with no code-level signal that it should match.
- **Impact on Properties**: direct — PROP-01 needs exactly this header.
- **Fix**: extracted `components/patterns/layout/PageHeader.tsx` (title/subtitle/actions), registered as `TBOS-PAT-LAYOUT-001`, wired into all 4 existing screens (behavior-identical, verified by the unchanged 98 pre-existing tests still passing), and is what `PropertiesListScreen` uses below — so it's now enforced by reuse, not convention.
- **Status**: **Fixed.**

### P2-1 — `error as unknown as ApiError` cast repeated in every screen

- **Finding**: all 5 screens cast React Query's `error` (typed `Error | null` by default) to `ApiError` via `as unknown as ApiError`, because none of the `useQuery` calls in `useLeads`/`useLead`/`useToday`/`useNotifications` specified the error generic.
- **Why it matters**: not a UX bug (the runtime value genuinely is an `ApiError`, thrown deliberately by each `queryFn`) but a code-quality wart that Properties' new hooks (`useProperties`/`useProperty`) would otherwise copy forward into 2 more files.
- **Fix**: typed every `useQuery<TData, ApiError>(...)` explicitly; removed all 5 casts and their now-unused `ApiError` imports.
- **Status**: **Fixed.**

### P2-2 — `FilterBar`/`BulkActionBar` hardcoded "Clear all" / "N selected" / "Clear"

- **Finding**: same class of gap as Phase 5's `KanbanBoard`/`ConfirmationDialog` fix — these two components render fixed English strings with no override.
- **Why it matters**: `FilterBar` is already live on Leads Pipeline (English "Clear all" was showing even in Arabic mode); `BulkActionBar` is live on Leads Inbox. Properties List reuses both per the blueprint's own "bulk actions (archive, reassign)" secondary-action spec — so this isn't a hypothetical future problem, it's already visible today and would double before this phase ends.
- **Fix**: same additive-optional-prop pattern as Phase 5 (`activeFiltersLabel`/`clearAllLabel` on `FilterBar`, `selectedLabel`/`clearLabel` on `BulkActionBar`, both defaulting to the original English so no existing test broke), plus a small shared `lib/i18n/formatCount.ts` (count-bearing strings, since `t()` has no interpolation — same constraint documented in `TBOS_UI_INTEGRATION_AUDIT.md`). Wired into the existing Leads screens too, not just the new Properties ones.
- **Status**: **Fixed.**

### P3 — documented, deferred (do not affect Properties)

1. **`max-w-2xl` (Today, Notifications) vs. `max-w-content` (Leads Pipeline/Inbox, Lead Detail)** — confirmed intentional, not accidental: card-stream screens (a vertical list of self-contained cards) read better narrow; table/board screens need the width. Properties List follows the **table/board convention** (`max-w-content`), consistent with its DataTable-shaped content. Documented here so it's legible as a deliberate two-variant grammar to the next reader, not mistaken for drift.
2. **`KanbanCard`'s "Move to stage" label, `Drawer`'s "Open full record," `MetricCard`'s "As of"/"Unavailable right now," `ErrorState`'s "Retry," `ActivityTimeline`'s "No activity yet"** — already documented as deferred in `TBOS_UI_INTEGRATION_AUDIT.md` §3; still true, still secondary chrome, several still pinned by existing foundation tests. Properties Detail's History tab reuses `ActivityTimeline` and will seed at least one entry per property (same mitigation as Leads), so the empty-state string stays unreachable in this slice's own data, same as before.
3. **Customers/Owners have no `assigneeId`-equivalent field**, so `searchIndex.ts`'s `'own'`-scope fix (P1-1) only covers Leads and Properties, not Customers/Owners search rows. Both modules' `'own'` grants exist in `rolePermissions.ts` but neither module is built yet — flagged for whichever phase builds them, not fixable here without inventing a field the entity doesn't have.

## Answers to the explicit consistency questions

**A. Consistent entity identity model?** Yes — every entity (Lead, and now Property) resolves to a title + `EntityMeta` row + a `StatusBadge`-family badge. `EntityAvatar`/`EntityMeta` are entity-agnostic already.

**B. Consistent page header/action structure?** Yes, now enforced by `PageHeader` (P1-3) for list screens and `EntityDetailHeader` for record screens — two patterns, each used consistently within its own kind of screen.

**C. Primary action visually consistent?** Yes — solid `Button` (Tuba Purple via `action.primary.bg`), one per screen, always the single highest-priority next step (never a generic "Edit").

**D. Secondary/destructive actions consistent?** Yes — `variant="secondary"` (outline) for secondary, `variant="danger"` (red) for destructive, `ConfirmationDialog`/`Drawer` gating any consequential one. Verified no screen uses a bare `<button>` outside these variants.

**E. Filters consistent across modules?** Yes, and now more so — `FilterBar` is the only filter component in the app; P2-2's fix makes it fully bilingual for the second module reusing it.

**F. Statuses semantic, not decorative?** Yes — every status badge (`LeadStageBadge`, `PropertyStatusBadge`) resolves through the same five-meaning `StatusMeaning` system; confirmed zero raw colors in either.

**G. Permission restrictions represented consistently?** Yes, with one pattern correctly generalized twice: `PermissionGate` for real `<Button>`s, and the manual `can()` + `Tooltip` + disabled-`Button` fallback for `Dropdown`-based actions (documented in Phase 5 as a `PermissionGate` limitation — `mode="disable"` clones a `disabled` prop `Dropdown` doesn't consume). Properties' compliance-tab-specific write permission (`properties.compliance.edit`, distinct from `properties.edit`) reuses this exact mechanism.

**H/I/J. Empty/loading/error states consistent?** Yes — `EmptyState`/`Skeleton`/`ErrorState` used identically across all 5 screens with no bespoke alternative anywhere.

**K. AI recommendations visually consistent?** Yes — `RecommendationCard` (Today) and `MetricWithExplanation`/`ExplainabilityPopover` (Lead Detail's score) are the only two AI-surface patterns; Properties' compliance/performance sections reuse the second one, not a new one.

**L. Dates/numbers/numerals consistent?** Partially — SLA countdown text and dates use a small locale-aware formatter (`formatSlaLabel`, `toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')`); this is the one place actual Arabic-Indic numeral rendering depends on the browser's `Intl` implementation rather than an explicit design-system rule, since no such rule exists in the source docs. Not a defect — flagged as the honest boundary of what's currently enforced.

**M. RTL behaves consistently?** Yes — verified live in Phase 5 across Kanban, headers, drawers, timelines; zero manual RTL-specific code needed anywhere because logical properties + flex reversal handle it by construction. No new mechanism needed for Properties.

**N. Mobile navigation stays consistent?** Yes — `MobileTabBar`'s 5 fixed destinations are untouched by this or the prior phase; Properties adds a rail entry only (already present since the Foundation phase), no tab-bar change.

**O. Dark mode uses the same semantic system?** Yes, with the one deliberate, user-requested exception documented inline in `TubaLogo.tsx`: the wordmark is pure white in explicit dark mode rather than the semantic `text.brand` dark value, because the user specifically asked for it after seeing the semantic value read as insufficiently vivid against near-black chrome. Every other component in the slice uses semantic tokens exclusively — confirmed by grep, zero hardcoded colors outside that one component.

**P. Tuba branding present without becoming decorative noise?** Yes — Purple appears only as `action.primary.bg` and active-nav state; Coral appears only in the logo mark, never as a status color (confirmed: no `RecommendationCard`/`StatusBadge`/`SlaTimer` call site references coral).

**Q. Patterns used as intentional brand moments?** The Tuba Brand Pattern Language SVGs remain unused in the live app (registered in `design-system/` only) — correctly so per their own usage rules ("bad places: dense operational screens"). Properties List's first-time empty state is the first genuinely apt moment for one; see the Vertical Slice report's Brand Integration section for the decision.

## Verdict

All 3 P1s fixed, both P2s fixed (small and directly reused by Properties), 3 P3s documented and correctly out of scope. `npm run test` — 102/102 passing (98 pre-existing + 4 new search-scope regression tests) before any Properties code was written. Proceeding to the Properties Vertical Slice.
