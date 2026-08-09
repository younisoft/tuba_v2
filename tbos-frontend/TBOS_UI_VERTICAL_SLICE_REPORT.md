# TBOS UI Vertical Slice Report

**Status: TBOS FIRST VERTICAL SLICE — READY**

## 1. Executive Summary

This phase proved that the Design System, Frontend Foundation, and 78-component Component Library converge into one coherent product experience. It audited the integration between them (`TBOS_UI_INTEGRATION_AUDIT.md`), fixed every P1 gap found, and built the first real Vertical Slice: **Today → Leads → Lead Detail → Lead Action → Notification**. Five screens (`TODAY-01`, `LEAD-01`, `LEAD-02`, `LEAD-03`, `NOTIF-01`) are now real, permission-aware, bilingual, dark-mode-correct product surfaces — not placeholders — built almost entirely by composing existing components. Two components the blueprint required but nothing had built yet (`SlaTimer`, `RecommendationCard`) were added, registered, and are now used by three of the five screens. No other module was touched or expanded.

## 2. Integration Audit Summary

Full detail: `TBOS_UI_INTEGRATION_AUDIT.md`. **0 P0, 6 P1 (all fixed), 5 P2 + 2 P3 (documented, deferred, none block this slice).** The foundation was internally consistent; every gap found was exactly what a "components before screens" build order predicts — nothing contradictory, nothing broken.

## 3. Issues Found

1. SLA Timer and Recommendation Card — blueprint-required, never built (no screen had needed them yet).
2. Permission scope (`team`/`agency`) is a route-level yes/no, not a list filter — list-scoping had to happen in the data layer.
3. No Leads/Today mock API + hook layer existed.
4. `AppNotification` could name a screen but not a specific record — insufficient for "deep-links to source."
5. Hardcoded English strings in `KanbanBoard`'s empty-column copy and `ConfirmationDialog`'s Cancel button, on this slice's critical path.
6. LEAD-03's actual permission rule ("assignee has full read/write; SM/AO can reassign; others have no access") is record-scoped; `RouteGuard` only checks role-level "can this role ever view a lead," not "can this user view *this* lead."

## 4. Issues Fixed

All 6 above — see `TBOS_UI_INTEGRATION_AUDIT.md` §2 for exact files touched. Summary: two new components built and registered; a scoped `leadsForUser()` query function; a full `leadsApi`/`useLeads`/`useLead`/`useLeadMutations` layer mirroring the existing `notificationsApi`/`useNotifications` shape; an additive optional `sourceRecordId` field; two additive optional component props (`KanbanBoard.emptyStateLabel`, `ConfirmationDialog.cancelLabel`); and a record-level scope check added directly inside `LeadDetailScreen` (`can('leads.view.team') || lead.assigneeId === user.id`).

## 5. Deferred Issues

See `TBOS_UI_INTEGRATION_AUDIT.md` §3 (5 P2, 2 P3) — all either secondary chrome strings outside this slice's primary content, pre-existing documented limitations (Kanban has no mobile single-column view), or genuine product-spec gaps flagged as assumptions rather than silently decided (Lost Reason taxonomy — see §16 below).

## 6. Screen Inventory

| Screen ID | Name | Route | Status |
|---|---|---|---|
| TODAY-01 | Today | `/today` | ready |
| LEAD-01 | Leads Pipeline | `/leads` | ready |
| LEAD-02 | Leads Inbox | `/leads/inbox` | ready |
| LEAD-03 | Lead Detail | `/leads/:leadId` | ready |
| NOTIF-01 | Notification Center | `/notifications` | ready |

All five flipped from `status: 'placeholder'` to `status: 'ready'` in `registry/screens/screenRegistry.ts`, wired into `app/router/index.tsx`'s `SCREEN_OVERRIDES` map — the same, unmodified routing mechanism every other screen already uses. No new `<Route>`, no new guard, no second router.

## 7. Route Inventory

All five routes already existed in `SCREEN_REGISTRY` (path, permission, nav entry) from the Foundation phase — none invented. `LEAD-02`'s path (`/leads/inbox`) deliberately has `hasNavEntry: false`, reached only via the view-toggle control on `LEAD-01`, per blueprint's explicit "a view mode, not a new destination" rule.

## 8. Component Reuse Map

76 of 78 pre-existing components were available for reuse; this slice actually consumes: `KanbanBoard`, `KanbanCard`, `DataTable`, `EntityDetailHeader`, `EntityAvatar`, `EntityMeta`, `LeadStageBadge`, `StatusBadge`, `MetricWithExplanation`, `ExplainabilityPopover`, `ActivityTimeline`, `ActivityItem`, `NotificationItem`, `PermissionGate`, `FilterBar`, `BulkActionBar`, `Dropdown`, `Drawer`, `Field`, `Select`, `Textarea`, `Input`, `Button`, `Badge`, `Tooltip`, `EmptyState`, `ErrorState`, `NoPermissionState`, `Skeleton`. Zero duplicate implementations were created — no second Kanban, no second table, no bespoke `LeadCard` component (composed instead from `EntityAvatar`/`EntityMeta`/`Badge`, per `EntityCard`'s own documented anti-proliferation principle).

## 9. New Components

Exactly two, both blueprint-required and previously missing (component reuse gate, master prompt §42 — searched the registry first, confirmed absent, documented why before building):

- **`SlaTimer`** (`TBOS-CMP-STATUS-007`) — reuses `StatusBadge` internally rather than inventing a new badge shape; renders nothing when a lead has no SLA context.
- **`RecommendationCard`** (`TBOS-CMP-AI-007`) — Today's one entry format; priority accent uses existing `text.{danger,warning,info}` tokens (no new tokens), composes the existing `ExplainabilityPopover` rather than a bespoke "why" tooltip.

Both have full registry entries (a11y/RTL/dark-mode notes, screen IDs, states) and are exercised by the new tests.

## 10. Mock Data Architecture

Extended, never scattered inline. `mocks/data/seed.ts` gained `LEAD_ACTIVITIES` (11 hand-linked entries across 4 leads, human/system/ai actor mix) and `sourceRecordId` on 3 existing notifications. `mocks/api/db.ts` gained `leadsForUser`, `leadById`, `leadActivitiesForLead`, `updateLeadStage`, `reassignLead`, `markLeadLost`, `reopenLead`, `addLeadNote`, `logLeadOutsideResponse`, `scheduleLeadFollowUp`, `customersForAgency`, `propertiesForAgency`, `teamMembersForAgency`, `todayRecommendationsForUser` — every one following the file's existing plain-function-over-the-`db`-object convention. A new `lib/api/endpoints/leads.ts`, `today.ts`, `lookups.ts` layer wraps these through `apiClient.request` exactly like the pre-existing `notifications.ts`; screens never import `mocks/` directly. Realistic content throughout (no lorem ipsum); supports Arabic seed data already present (agency names, team member names); every state (empty/loading/error/permission-restricted) is reachable with real personas already in the fixture (e.g. `tm-noura`/MM has zero lead-triage recommendations by construction, for the Today empty-state test).

## 11. State Architecture

No new pattern. Zustand continues to own client/UI state (unchanged); React Query owns server state, via three new hooks (`useToday`, `useLeads`, `useLead`) matching `useNotifications`'s exact shape (`useQuery` for reads, `useMutation` + `invalidateQueries` for writes). `useToday`'s dismiss is deliberately session-local only (not persisted — no backend to persist against, and the blueprint doesn't specify persistence).

## 12. Permission Model

RBAC enforced at three layers, none duplicated:
- **Route-level** (unchanged `RouteGuard`): `today.view`, `leads.view`, `notifications.view`.
- **List-level** (new, in the mock data layer): `leadsForUser()` filters by assignee for `'own'`-scope roles, by agency for `'team'`/`'agency'`-scope roles — the fix for finding #2 above.
- **Record-level** (new, inside `LeadDetailScreen`): a lead outside the viewer's scope renders `NoPermissionState`, even though the route-level check alone would have allowed it.
- **Action-level** (`PermissionGate` for real `<Button>` actions; a manual `can()` branch + `Tooltip` for the two `Dropdown`-based actions, since `PermissionGate`'s `mode="disable"` clones a `disabled` prop that `Dropdown` doesn't consume — verified before using it, not assumed).

No screen or component implements its own `if (role === ...)` check — every gate calls the same `useHasPermission()`/`hasPermission()` the rest of the app already uses.

## 13. Today UX

Ranked `RecommendationCard` list, Critical/High pinned above Medium/Low. Every entry is real, mock-data-derived (SLA-at-risk leads, overdue tasks, high-score negotiating leads) — zero decorative metrics, zero "Total Leads" counters. Every entry states What/Why/Impact/Recommended Action/Priority/Deadline, and AI-sourced entries (Lead Scoring-derived) additionally carry an Explainability trigger. Empty state uses the blueprint's "You're all caught up" positive framing, shared verbatim with `NOTIF-01`.

## 14. Leads UX

One pipeline (`LEAD-01`, Kanban) + one alternate view of the *same query* (`LEAD-02`, table) — never two disconnected lists. Source (buyer-inbound vs. owner-originated) is a card-level `Badge`, not a separate visual system. Cards answer WHO (customer)/WHAT (property)/WHY NOW (SLA/score)/NEXT ACTION (click through) in a few glance-able lines, never overloaded.

## 15. Lead Detail UX

`EntityDetailHeader` (title + stage badge + meta row: assignee, property, source, SLA) → Lead score with Explainability → Actions → Activity timeline, in that order — identity and context before action, action before history. A closed lead (Won/Lost) hides the actions that no longer apply (no dead "Change stage" button on a Lost lead) rather than disabling them all indiscriminately.

## 16. Lead Actions

Implemented: respond (opens the reply-log drawer), change stage (dropdown of the 6 open stages), reassign (dropdown of teammates, `leads.assign`-gated), mark Lost (required structured reason + optional free-text note — see below), log outside-platform response, add note, schedule follow-up (also creates a real `Task`, mirroring `QA-01`'s documented "Log Follow-up creates a Task" behavior), reopen a Lost lead. **Not implemented**: "merge with existing Customer" (secondary action per blueprint) — genuinely out of this slice's scope (no Customer module built), documented rather than faked.

**Lost Reason**: the blueprint has no ratified taxonomy (confirmed by exhaustive search — every mention says "required reason," none enumerate one). This phase introduces a working list (`price`, `timing`, `chose_competitor`, `unresponsive`, `not_qualified`, `changed_mind`, `duplicate`, `other`) as a documented **assumption**, added as `LeadLostReason` alongside a free-text `lostReasonNote` field so specific human context isn't lost to the enum. Flagged for product-definition follow-up, not silently decided.

## 17. Notifications

`NOTIF-01` reuses `NotificationItem` unchanged from the TopBar dropdown. Opening a notification marks it read **and** navigates to its specific source record when one is known (via the new `sourceRecordId` field) — previously, opening a notification did neither. Unread-only filter; "Mark all read." A notification is never a dead end.

## 18. AI Usage

Deliberately narrow, per master prompt §23. Two real uses: (1) Lead Scoring rationale on `LEAD-03`, surfaced via `MetricWithExplanation`/`ExplainabilityPopover` — every field of the five-question contract answered with real, lead-specific text, not "AI insights" filler; (2) `RecommendationCard`'s optional AI-sourced entries (score-derived Today recommendations) carry the same contract. No "AI-powered dashboard" framing anywhere; AI is a labeled, explainable input to a human decision, never a silent actor.

## 19. Brand Integration

Zero raw hex values in any new file — verified by construction (every color comes from a Tailwind utility resolving to a design-system token). Tuba Purple appears as `action.primary.bg` (primary buttons — "Draft a reply," "Open lead") and active-nav-state, exactly the existing semantic-token usage already verified in Phase 4. **Tuba Coral is not used anywhere in this slice** — correctly: master prompt §10/§27 explicitly forbid using brand color for "important," and every priority/urgency signal here (`RecommendationCard`, `SlaTimer`, `StatusBadge`/`LeadStageBadge`) uses the five-meaning semantic system (danger/warning/info/success/neutral) instead. The Tuba Brand Pattern Language SVGs were not used — no marketing/empty-state surface in this slice's five screens is the right "brand moment" per `design-system/20_BRAND_PATTERN_LANGUAGE.md`'s own usage rules (dense operational screens are explicitly a *bad place* for them).

## 20. RTL/LTR

Verified live in-browser (not assumed): Kanban column order, action-button order, header layout, activity timeline accent edge, and Drawer entry edge all mirror correctly automatically (logical CSS properties + `flex` row reversal under `dir="rtl"` — no manual RTL-specific code was needed in any new screen). All new UI chrome (titles, labels, buttons, stage names, priority names, lost reasons) is fully bilingual — `dictionaries.ts` grew by ~110 key pairs, both locales, verified complete by the pre-existing `tests/rtl.test.ts` dictionary-completeness assertion (still passing). `LeadStageBadge` was fixed to read from the dictionary (previously hardcoded English, never exercised by a real Arabic screen before now).

**Known, documented limitation**: dynamically-*generated* content — Today's recommendation prose (what/why/impact sentences), Lead Detail's activity-log entries, lost-reason free-text notes — is composed in English only. Translating computed/templated sentences (not fixed dictionary lookups) needs a real content-localization system (e.g. ICU MessageFormat), which `useTranslation()`'s flat key→string lookup doesn't support and which is a foundation-layer capability beyond this slice's scope. All static UI chrome around that content is fully Arabic.

## 21. Dark Mode

Verified live at all five screens (screenshots below). Every new component uses semantic tokens exclusively (`bg-bg-*`, `text-text-*`, `border-border`, `text-text-{danger,warning,info}` for `RecommendationCard`'s priority accent) — dark mode required zero component-specific overrides.

## 22. Responsive Design

Verified live at 390px, 768px, 1440px (screenshots below). No horizontal page overflow at any breakpoint. `KanbanBoard` uses its own internal horizontal scroll at narrow widths (pre-existing, registry-documented strategy, sanctioned by master prompt §13) — confirmed it doesn't break the page around it. `DataTable` (Leads Inbox) does the same. `EntityDetailHeader` stacks title above actions below the tablet breakpoint, as already documented.

## 23. Accessibility

No new accessibility mechanism was needed — every reused primitive already carries its accessibility contract (`Drawer`/`Dropdown` focus-trapped, `Checkbox`/`Select`/`Input` real native elements, `KanbanCard`'s move-to-stage menu keyboard-operable, `ExplainabilityPopover` a real focus-trapped `<button>` trigger). New components followed the same discipline: `SlaTimer` inherits `StatusBadge`'s icon+text pairing (never color-only); `RecommendationCard`'s dismiss is a real labeled `IconButton`; the manually-built disabled-action fallback (§12) uses real `disabled`/`aria-disabled` + a focus-and-hover `Tooltip`, not a CSS-only fake-disabled state.

## 24. Testing

- `npx tsc -b` — clean.
- `npm run lint` — clean, 0 errors/warnings.
- `npm run test` — **98/98 passing** (87 pre-existing + 2 pre-existing tests updated to match real content instead of placeholder text, since `/today` no longer renders `ScreenPlaceholder` + 9 new vertical-slice tests + 2 new registry-traceability tests).
- `npm run build` — clean production build, main bundle 232.8 kB / 60.8 kB gzipped (no dependency added this phase).

New tests cover: Today's real recommendation content and its positive empty state; Leads Pipeline's PC-vs-SM scoping (the actual RBAC list-filtering behavior, not just "the button is there"); Lead Detail's record-level access denial; a full stage-change interaction verified via the rendered activity log; the full Mark-Lost-with-required-reason flow end-to-end including the redirect; a disabled, explained Reassign control; and Notification Center's deep-link navigation.

## 25. Browser Verification

Performed live via Playwright against the running dev server (not assumed from code review). Walked the complete flow — Today → Leads Pipeline → Lead Detail → Lead Action (stage change, Mark Lost, Explainability popover) → Notifications → deep-link back to a lead — at 1440px, 768px, and 390px, in English/LTR and Arabic/RTL, and in light and dark mode. No horizontal overflow, no clipped content, no broken RTL, no unreadable text, no broken mobile navigation found at any combination checked.

## 26. Screenshots

`tbos-frontend/screenshots/vertical-slice/`:

| File | What it shows |
|---|---|
| `01-today-desktop-light-en.png` | Today, ranked recommendations, 1440px |
| `02-leads-pipeline-desktop-light-en.png` | Leads Pipeline Kanban, 1440px |
| `03-lead-detail-desktop-light-en.png` | Lead Detail full layout, 1440px |
| `04-lead-detail-explainability-open.png` | Lead score Explainability popover open |
| `05-notifications-desktop-light-en.png` | Notification Center |
| `06-today-desktop-dark-en.png` | Today, dark mode |
| `07-today-mobile-dark-en.png` | Today, 390px, dark mode, mobile tab bar |
| `08-leads-pipeline-mobile-dark-en.png` | Leads Pipeline, 390px, dark mode |
| `09-leads-inbox-mobile-dark-en.png` | Leads Inbox table, 390px, dark mode |
| `10-leads-pipeline-desktop-light-ar-rtl.png` | Leads Pipeline, Arabic/RTL, correct column mirroring |
| `11-lead-detail-desktop-light-ar-rtl.png` | Lead Detail, Arabic/RTL |
| `12-lead-detail-tablet-light-en.png` | Lead Detail, 768px |

## 27. Performance

No new dependency added (`package.json` unchanged). No new SVG assets. Bundle grew from 190.7 kB to 232.8 kB raw (49.5 kB → 60.8 kB gzipped) for five full product screens plus their data/permission/mutation layers — proportionate, no bloat. No premature lazy-loading added (route-level code-splitting was already out of scope for the Foundation phase's Vite config and stays that way).

## 28. Known Limitations

1. Dynamically-generated content (recommendation prose, activity-log entries, lost-reason notes) is English-only — §20.
2. `LEAD-01`'s bulk-reassign lives on the Inbox (`DataTable`) view, not the Kanban view — `KanbanCard` has no multi-select capability today, and adding one is a foundation-component change beyond this slice; the Inbox view is the same data, per blueprint's own "view mode, not a new destination" architecture, so the capability exists, just on the alternate presentation.
3. "Merge with existing Customer" (LEAD-03 secondary action) is not implemented — no Customer module exists in this slice's scope.
4. Lost Reason taxonomy is this phase's documented assumption, not a ratified product spec — §16.
5. The 5 P2 / 2 P3 integration findings in `TBOS_UI_INTEGRATION_AUDIT.md` §3, none affecting this slice.

## 29. Backend Integration Requirements

For a real backend to replace `mocks/api/db.ts` behind the existing `lib/api/client.ts` seam (per `MOCK_API.md`'s documented swap contract), it needs to provide:

- **Lead API**: list (agency/team/own-scoped), get by id, update stage, reassign, mark lost (reason + note), reopen, list activity, append activity (note/logged-response/follow-up), matching the exact shapes in `types/entities.ts` (`Lead`, `LeadActivity`, `LeadLostReason`).
- **Lead scoring**: a real Lead Scoring service producing `score` + rationale text at intake and after each interaction (currently a static seeded number with authored rationale copy).
- **Today recommendations**: either computed server-side (preferred, so ranking logic isn't duplicated client-side) or the client-side `computeRecommendations()` algorithm ported as-is — it's a pure function over Leads + Tasks already, no UI coupling.
- **Task creation** from "Schedule follow-up" (already modeled identically to `QA-01`'s "Log Follow-up" behavior).
- **Notifications**: `sourceRecordId` needs to be populated by whatever server-side process creates lead-related notifications, not just `sourceScreenId`.
- **Permissions**: the frontend's `'own'/'team'/'agency'` scope semantics (`lib/permissions/evaluate.ts`) need a real backend-side equivalent — this frontend layer is UX only, never the authorization boundary (per `RBAC.md`, unchanged by this phase).
- **Customers/Properties/TeamMembers lookups**: currently minimal read-only name-resolution endpoints (`lib/api/endpoints/lookups.ts`) — a real Customers/Properties module would supersede these, not extend them.

No backend work was implemented this phase, per explicit instruction.

## 30. Final Readiness Assessment

**TBOS FIRST VERTICAL SLICE — READY.** All 30 success-criteria items in the master prompt's checklist are met: integration audit complete with 0 P0 remaining; all five screens implemented, permission-aware, with empty/loading/error/restricted states; components reused rather than duplicated (2 justified additions, both registered); mock data isolated behind the existing API seam; RTL/LTR/dark/mobile/desktop/accessibility verified live; Tuba brand identity visible but restrained, semantic tokens used correctly for state; Platform Console isolation untouched; TypeScript/ESLint/tests/build all clean. Stopping here per master prompt §67/§70 — no expansion into Properties, Customers, Contracts, or any other module.
