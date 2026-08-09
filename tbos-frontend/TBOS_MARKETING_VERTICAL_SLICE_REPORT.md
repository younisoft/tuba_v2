# TBOS Marketing + Campaign Intelligence Vertical Slice Report

**Status: TBOS MARKETING + CAMPAIGN INTELLIGENCE VERTICAL SLICE — READY**

## 1. Implemented Screens

- **MKT-01 — Campaigns List**: outbound campaign/promotion management, search-first, filterable by lifecycle status.
- **MKT-02 — Campaign Create/Detail**: single flow for creating and managing a campaign, with a mandatory eligibility gate before inventory selection.
- **MKT-03 — Content Quality Queue**: AI-assisted review queue of live listings below the content-quality bar, worst-first.

Marketing Request queue/detail (also named in the master prompt's screen scope) is **not** re-implemented — it already exists, complete, from Phase 7 (OWN-03 agency-wide queue + OWN-02's embedded per-owner tab). No second Marketing Request screen was created; see §11.

## 2. Routes

`/marketing` (MKT-01), `/marketing/new` (MKT-02, optionally `?campaignId=<id>`), `/marketing/content-quality` (MKT-03) — all three pre-existed in `SCREEN_REGISTRY` as placeholders from the Foundation phase; none invented.

## 3. Screen IDs

MKT-01, MKT-02, MKT-03 — confirmed the only three Marketing screen IDs anywhere in the source documents or the registry (no MKT-04 exists). All three flipped from `status: 'placeholder'` to `'ready'`.

## 4. Components Reused

`PageHeader`, `FilterBar`, `DataTable`, `EntityAvatar`, `Badge`, `EntityDetailHeader`, `Alert`, `MetricWithExplanation`, `Checkbox`, `Field`, `Input`, `Textarea`, `Tooltip`, `ConfirmationDialog`, `ActivityTimeline`, `PermissionGate`, `EmptyState` (including the one real brand-pattern SVG asset, `/brand-patterns/modern-home.svg`, reused from Properties' exact precedent), `ErrorState`, `NoPermissionState`, `Skeleton`, `Button`. Two components were pre-registered against MKT-02 since the Component Library phase but never consumed by any real screen until now: **`AISuggestion` + `AIActionBar`** (campaign-copy generation, content-quality fix suggestions) and **`QuotaBalanceMeter`** (Wallet pre-flight check) — the latter's `componentRegistry.ts` entry was missing `'MKT-02'` in its `screenIds` despite the component-mapping document listing it; fixed as a registry-accuracy correction (§14).

## 5. Components Added

**None.** Every screen was composable from the existing registry — the same result every prior vertical-slice phase has reached, reinforcing that the Component Library's entity-agnostic bet holds for a fourth consecutive module. Status badges for Campaign's 4-state lifecycle use the plain `Badge` component directly (matching Marketing Requests' own precedent, `MarketingRequestsQueueScreen.tsx`), not a dedicated `StatusBadge` subclass — a deliberate choice to avoid manufacturing a component for a simple, icon-less status set.

## 6. API/Data Layer

`lib/api/endpoints/marketing.ts` (`marketingApi`) mirrors `contractsApi`'s exact shape (list/get/sub-resource reads/mutations, all through `apiClient.request`). Hooks: `lib/marketing/useCampaigns.ts`, `useCampaign.ts` (data + all 5 mutations: create/selectInventory/launch/pause/end), `useMarketingLookups.ts` (Property + Wallet lookups), `useContentQualityQueue.ts` (queue + the one description-edit mutation). Screens never import `mocks/` directly. One small, justified addition to `propertiesApi`: `updateDescription` (mirrors `changePrice` exactly), needed to make MKT-03's fix-suggestion loop genuinely close (accept suggestion → edit → re-score), not merely advisory.

## 7. Mock Data

`types/entities.ts`: `Campaign` extended with `createdByUserId` (RBAC), `quotaCost`/`launchedAt`/`endedAt` (lifecycle), `CampaignStatus` (4-state, explicitly flagged as an inference — §12); `CampaignActivity`/`CampaignActivityKind`; `Property.description` (optional, new — needed for the content-quality rubric's description check). `mocks/data/seed.ts`: `CAMPAIGNS` expanded from 2 to 5 (covering all 4 states across both agencies), `CAMPAIGN_ACTIVITIES` (11 entries), realistic `description` values populated across a deliberate mix (thorough / thin / missing) on the three currently-live Properties so the Content Quality Queue has genuine variation to show. `WALLETS`' `quotaUsed` adjusted to stay consistent with the expanded campaign roster's quota consumption.

## 8. State Architecture

MKT-01: loading/populated/empty (brand-pattern)/filtered-no-results/error. MKT-02: loading/create-mode/populated (all 4 statuses)/zero-eligible-inventory (never renders the selection UI, per spec)/launch-blocked (3 distinct reasons, each named)/restricted/error/not_found. MKT-03: loading/populated (worst-first)/empty (positive tone, "all listings meet the quality bar")/error. No state was invented beyond what the source's scattered language and the master prompt's own state list (§25) support.

## 9. RBAC

Enforced at all four layers:
- **Route-level**: `marketing.view` (MKT-01), `marketing.manage` (MKT-02, MKT-03) — unchanged `RouteGuard`.
- **List-level**: `campaignsForUser()`/`contentQualityQueueForUser()`, scoped via `scopeFor()` (own for SB, agency-wide for AO/MM). PC/OM/SM hold **no** `marketing.*` grant at all — verified route-denied.
- **Record-level**: `CampaignDetailScreen` computes `sameAgency && (!ownScopeOnly || campaign.createdByUserId === user.id)` — the P0 cross-agency pattern (Phase 8) applied **proactively from day one**, not retrofitted after a live-browser discovery this time.
- **Action-level**: `PermissionGate permission="marketing.manage"` on create/select-inventory/launch/pause/end; the Launch button additionally goes **disabled with a Tooltip** (not merely gated) when eligible inventory exists but none is selected — never a misleading confirmation dialog for an action that would immediately fail (§25).

## 10. Agency Isolation

Verified live and by test: an Agency Owner in agency-1 is denied `NoPermissionState` when opening agency-2's campaign by direct URL (`marketing.test.tsx`'s P0-regression test), matching the exact pattern already fixed across Property/Owner/Customer/Lead/Contract in Phase 8. Search (`campaignsForUser()`-backed from day one, §18) and Today (`propertiesForUser()`-backed, §16) both inherit the same agency boundary — no code path in this phase reads `db.campaigns`/`db.properties` directly.

## 11. Marketing Request Lifecycle

**Unchanged, not touched this phase.** Marketing Request (Open → In Progress → Won/Lost, `MarketingRequestStatus`) remains exactly as Phase 7 built it — OWN-03's agency-wide queue and OWN-02's embedded per-owner tab. Confirmed, by fresh research, that Marketing Request and Campaign are explicitly two separate, non-overlapping entities in the source (`tbos-definition/06_PRODUCT_ARCHITECTURE.md`: "distinct from the Marketing Requests *inbound* flow... different jobs with different cadences") — no FK or shared record was introduced between them, and no second Marketing Request screen was built.

## 12. Campaign Lifecycle

**Draft → Running ⇄ Paused → Ended**, the pre-existing 4-state enum from the Foundation phase, kept as-is and now explicitly documented as an **ASSUMPTION** (`TBOS_MARKETING_UX_AUDIT.md` P1-1): no ratified Campaign state table exists anywhere in the source (unlike Property/Lead/Contract/Marketing Request, each of which has one), only scattered language ("pause/resume," "running-campaign confirmation") consistent with this exact set. The zero-eligible-inventory and insufficient-balance conditions are **not** additional stored statuses — they are a computed, live-evaluated gate on the launch action, mirroring Contract's `canActivate` pattern rather than inventing new lifecycle states.

## 13. Eligibility Architecture

The **mechanism** is fully spec'd (`tbos-definition/16_MODULE_SPECIFICATIONS.md`: "a campaign cannot be started with zero eligible inventory — prevented at the entry point, not discovered as an error"; `tbos-blueprint/04_SCREEN_INVENTORY.md` MKT-02: "eligibility checked before inventory-selection UI even renders"). The **rule content** is not — no document states which Property states qualify. Resolved as an ASSUMPTION: eligible = `status === 'active' || status === 'expiring'` (currently live/published), reusing Property's own ratified 8-state lifecycle rather than inventing a second taxonomy; since Property can't reach `'active'` without already clearing compliance (Phase 6), this single check also honestly encodes "compliance-clear" for free. `eligiblePropertiesForUser()` (`mocks/api/db.ts`) is the single source of truth, consumed identically by the UI's checkbox list and the `launchCampaign()` mutation's own re-validation — never two divergent copies of the rule. Launch is blocked with one of three specific, named reasons (no inventory selected / inventory no longer eligible / insufficient Wallet balance, with the exact shortfall) — never a bare disabled button with no explanation.

## 14. AI / Content-Quality Integration

MKT-02's campaign-copy generation reuses `AISuggestion` + `AIActionBar` exactly as demonstrated in the style guide (accept/regenerate/discard) — no new AI visual language. MKT-03's content-quality check is a **transparent, deterministic completeness rubric** — has ≥3 approved photos, has a description ≥30 characters, has a price (trivially always true) — directly naming the same three components `tbos-blueprint/08_AI_INTERACTION_BLUEPRINT.md`'s Property Quality capability specifies ("photos present, description length/quality, pricing present"), never a fabricated ML score or confidence number presented as real. The fix-suggestion loop is genuinely actionable: accepting the suggestion opens an inline description editor (`updatePropertyDescription`, a small justified addition mirroring `changePropertyPrice`), and the queue **re-scores live** on save — verified in the test suite and live browser. `QuotaBalanceMeter`'s registry entry gained `'MKT-02'` (§4).

## 15. Owner/Property Relationships

Campaign's only structural relationship to existing entities is `linkedPropertyIds` (Property) — Owner is reachable only transitively, through the linked Property's `ownerId`, and this phase does not add a direct Campaign↔Owner link since no source document names one. Campaign is **not** related to Marketing Request, Lead, Customer, or Contract in any way (§11).

## 16. Today Integration

`computeMarketingRecommendations()` (new, `lib/marketing/computeRecommendations.ts`) surfaces exactly the one Today-worthy Marketing signal formalized in the source's seven canonical recommendation categories (`tbos-definition/15_DECISION_SUPPORT_SYSTEM.md`): **Content quality** — a new `'content_quality'` `TodayRecommendationCategory`, gated to `marketing.manage` holders only (mirrors Contract's `canApprove`-gating discipline: never expose an actionable recommendation to a role that can't act on it). "Campaign eligibility blocked/insufficient balance" and "under-promoted inventory" were **deliberately not** built as Today cards — the former is the source's own **notification** row (§17), not a Today recommendation; the latter is real but explicitly under-specified (present only in informal screen-inventory/journey language, never formalized with its own Why/Impact row), matching the exact discipline Phase 7 already established for refusing "customer requiring follow-up."

## 17. Notifications

`'campaign'` added to `NotificationType`. `RECORD_ROUTE_BUILDERS['MKT-02']` added to `NotificationCenterScreen.tsx`'s existing map, resolving to `/marketing/new?campaignId=<id>` — the query-param deep-link form, not a path param, matching MKT-02's actual route shape. A notification is created when a launch attempt is genuinely blocked by ineligibility or insufficient balance (`addCampaignNotification()` inside `launchCampaign()`), matching `tbos-blueprint/09_NOTIFICATION_BLUEPRINT.md`'s "Campaign eligibility blocked / insufficient balance" row exactly (Medium urgency, in-app, timeline-delivered). The source's second Marketing notification row ("Content-quality score dropped — weekly digest to MM") was not implemented as a live notification generator — a digest cadence is a backend/scheduling concern out of this frontend phase's scope, flagged in §29.

## 18. Search

Campaigns are indexed in `searchIndex.ts`, built scope-correct **from the moment the block was added** — directly on `campaignsForUser()`, never a raw array — applying the Phase 7 P0-1 / Phase 8 lesson proactively rather than needing a second fix cycle. Verified by 3 new regression tests in `tests/search.test.ts` (cross-agency exclusion, positive in-scope match, route-permission exclusion).

## 19. Accessibility

No new accessibility mechanism was needed — every reused primitive (`Checkbox`'s real `<input type="checkbox">`, `ConfirmationDialog`'s focus-trapped `Dialog`, `Tooltip` on the disabled Launch button, `Field`'s programmatic label association) already carries its contract from prior phases, including the Drawer focus-trap fix from Phase 7. Verified structurally via the accessibility tree during live browser verification (proper heading hierarchy, named buttons/checkboxes, `status`-role alert banners) and confirmed by the automated test suite's extensive `getByRole`/`getByLabelText` usage, which would fail on any missing accessible name.

## 20. RTL/LTR

Verified live at 1440px and 390px, Arabic and English. Table columns, checkbox list, meta row, `QuotaBalanceMeter`'s progress bar, and the mobile bottom tab bar all mirror correctly with zero manual RTL-specific code in any new file. Arabic status-badge translations, filter labels, and the Content Quality Queue's missing-item badges all render correctly.

## 21. Dark Mode

Verified live on all three screens, including the zero-eligible-inventory blocked state and the AI Suggestion block (`bg-bg-ai-subtle` Copilot-violet accent reads correctly against the dark surface). All new surfaces use semantic tokens exclusively — no component-specific dark-mode override was needed.

## 22. Responsive

Verified at 1440px, 768px, and 390px. MKT-01's `DataTable` prioritizes Status as the second column at narrow widths (the established Phase 6/7/8 lesson). MKT-02's checkbox inventory list and metric cards stack cleanly at 390px with no horizontal overflow (confirmed via `document.documentElement.scrollWidth === clientWidth`). No new responsive defect was introduced.

## 23. Brand Identity

Zero raw hex values in any new file. Tuba Purple appears only as `action.primary.bg` (Create/Launch/Resume primary actions) and active-nav state. Tuba Coral appears only on the danger-toned End-campaign button (button fills only, per the Phase 8 coral-vs-generic-red fix), never as a generic status color. Campaign's 4-state badges map onto the existing five-meaning system (Running=success, Paused=warning, Draft/Ended=neutral) — no bespoke hue.

## 24. Pattern Language Usage

The one existing brand-pattern SVG asset (`/brand-patterns/modern-home.svg`) is reused for MKT-01's empty state and MKT-02's zero-eligible-inventory block — both genuine "first-use / nothing here yet" brand moments, matching Properties' own established usage rule exactly (subtle, editorial, not decorative noise — never on dense screens like the Campaigns table itself or the Content Quality Queue's rows). **Finding, not a defect to fix here**: the master prompt describes "19/20 supplied SVG brand icons," but only this one asset actually exists anywhere in the repository (`public/brand-patterns/`) — asset creation is outside a frontend-engineering phase's scope; flagged for whoever owns the design-asset pipeline.

## 25. Test Results

- `npx tsc --noEmit` — clean.
- `npx eslint .` — clean.
- `npx vitest run` — **159/159 passing** (143 pre-existing + 13 new Marketing tests + 3 new Campaign search-scope regression tests).
- `npm run build` — clean production build (379.00 kB main / 93.57 kB gzip).

New tests (`tests/marketing.test.tsx`, 13): MKT-01 (AO agency-wide visibility incl. cross-agency exclusion, route-level denial), MKT-02 (cross-agency denial — P0 regression applied proactively, create-flow, zero-eligible-inventory block engineered via the real Property "Mark Sold/Rented" mutation rather than a permanent fixture, disabled-explained Launch control with no misleading confirm dialog, full launch happy path with Wallet quota consumption verified, resume-paused re-validating eligibility), MKT-03 (worst-first queue with correct missing-item badges, route-level denial, accept-fix-suggestion re-scores live), Today integration (2, gated correctly). One genuine test-infrastructure lesson: calling `render()` twice within a single test to simulate two page loads leaves both DOM trees mounted simultaneously (ambiguous queries against duplicated nav chrome) — fixed by capturing and explicitly `unmount()`-ing the first render before the second, the correct testing-library pattern for a scenario with no client-side link between the two routes involved.

## 26. Browser Verification

Performed live via Playwright against the running dev server, persona-switching through `/login`. Walked Campaigns List → Campaign Detail (running, draft-with-checkboxes, zero-eligible-blocked) → full launch flow with Wallet quota consumption → Content Quality Queue → accept-fix → re-score. Verified at 1440px, 768px, and 390px, Arabic/RTL and English/LTR, light and dark mode. One methodology lesson encountered and corrected: engineering the zero-eligible-inventory state via a hard `page.goto()` between the Property mutation and the Campaign screen silently reset the in-memory mock database (the same session-reset behavior established in Phase 8), producing a false "still eligible" observation; corrected by using in-app link navigation to preserve session state, after which the blocked state rendered exactly as the automated test already independently confirmed.

## 27. Performance

No new dependency added. Production build grew from 378.99 kB to 379.00 kB main (93.57 kB gzip) — negligible; three full screens plus their data/permission/mutation layers reused nearly the entire existing component surface (§4/§5).

## 28. Backend Handoff Requirements

For a real backend to replace `mocks/api/db.ts` behind the existing `lib/api/client.ts` seam:

- **Campaign API**: list (own/agency-scoped), get, create, select-inventory, activities read, launch/pause/end mutations. The launch mutation must independently re-validate eligibility and Wallet balance server-side — the frontend's checks are UX only.
- **Eligibility rule**: the frontend's `status === 'active' || 'expiring'` rule is an ASSUMPTION (§13) — a real Product/Ops decision could define additional criteria; the backend should treat this as a starting point, not a ratified spec.
- **Wallet spend/quota model**: the frontend models Campaign launch as consuming Wallet `quotaUsed`/`quotaTotal` at a fixed 1-unit-per-launch demo cost — genuinely unresolved pricing (`tbos-blueprint/18_OPEN_QUESTIONS.md`); the backend's real spend model (SAR deduction vs. unit quota, actual per-tier amounts) must come from a real business/pricing decision, not this frontend's placeholder.
- **Content Quality API**: score computation could move server-side (currently a pure, deterministic frontend function — `lib/marketing/contentQuality.ts`) if a real AI scoring service replaces the transparent rubric; the description-update mutation needs a real endpoint.
- **Notifications**: the "Campaign eligibility blocked/insufficient balance" notification is created client-side today; a real backend should generate it server-side at the moment of a real blocked launch attempt. The "Content-quality score dropped (drift)" weekly-digest notification is not implemented — needs a real scheduled job, out of frontend scope entirely.
- **Search/Today**: no new backend contract beyond what Properties/Contracts already require — Campaigns reuse the same infrastructure end to end.

No backend work was implemented this phase, per explicit instruction.

## 29. Deferred Decisions

1. Campaign lifecycle's exact state set is an inference, not a ratified spec (§12) — a real Product decision could add/rename states.
2. Eligible-inventory rule content is an inference (§13) — Ops/Legal could define additional eligibility criteria (e.g., a minimum listing age, a specific compliance sign-off beyond reaching `'active'`).
3. Wallet spend-vs-quota conversion and per-tier pricing amounts are explicitly unresolved in the source (`18_OPEN_QUESTIONS.md`) — a fixed demo rate stands in, never presented as real pricing.
4. "Content-quality score dropped (drift)" weekly-digest notification — real, sourced, but needs a scheduled backend job this frontend phase cannot build.
5. "Under-promoted inventory" Today recommendation — real but under-specified in the source; deliberately not built, matching the Phase 7 precedent for refusing under-specified recommendations.

## 30. Known Limitations

1. Content-quality scoring is a transparent, deterministic completeness check, not a real AI/ML capability — an honest placeholder for a genuine "Property Quality AI" backend service that doesn't exist yet.
2. The `'own'`-marketing-scope tier (SB) has no real second-creator collision to test with the current persona roster — SB exists alone in agency-2, the same structural limitation Properties/Contracts already had; not a defect, a testing-coverage note.
3. Only one brand-pattern SVG asset exists in the repository against the master prompt's expectation of ~19-20 (§24) — an asset-pipeline gap, not a frontend code defect.
4. The Content-quality-drift weekly digest and the real AI scoring service are both out of this frontend-only phase's reach (§28/§29).

## 31. Screenshots

`tbos-frontend/screenshots/marketing/` (6 files):

| File | What it shows |
|---|---|
| `mkt-01-list-1440-ar-light.png` | Campaigns List, 1440px, Arabic/RTL, light — all 4 lifecycle states represented |
| `mkt-02-running-1440-ar-light.png` | Campaign Detail (Running), 1440px, Arabic/RTL, light — Wallet quota meter, activity timeline |
| `mkt-02-draft-390-en-dark.png` | Campaign Detail (Draft, checkbox inventory selection + AI copy suggestion), 390px mobile, dark |
| `mkt-01-list-768-en-dark.png` | Campaigns List, 768px tablet, dark — status correctly prioritized second column |
| `mkt-03-quality-1440-en-dark.png` | Content Quality Queue, 1440px, dark — AI Suggestion fix block with confidence label |
| `mkt-02-zero-eligible-1440-en-dark.png` | Campaign Detail — zero-eligible-inventory blocked state, brand-pattern illustration, direct fix link |

## 32. Final Readiness Status

**TBOS MARKETING + CAMPAIGN INTELLIGENCE VERTICAL SLICE — READY.** The pre-implementation UX audit (`TBOS_MARKETING_UX_AUDIT.md`) resolved two genuine spec gaps (Campaign lifecycle, eligibility-rule content) as explicitly documented assumptions rather than silent inventions, and fixed a real registry-accuracy gap (`QuotaBalanceMeter` never wired to MKT-02 despite being spec'd there). The mandatory eligibility gate is implemented exactly as the source requires — checked before the selection UI renders, with a specific reason for every blocked state, never a dead end. RBAC's P0 cross-agency pattern (discovered live in Phase 8) was applied proactively from day one rather than needing rediscovery. AI integration reuses existing components with zero new visual language and a genuinely closed fix-suggestion loop. Marketing Requests were correctly left untouched, confirmed structurally separate from Campaigns. RTL/LTR/dark/responsive/accessibility were verified live; TypeScript/ESLint/tests (159/159)/build are all clean; zero new components and negligible bundle growth confirm the Component Library's reuse bet holds for a fourth module. Per the master prompt's stop condition, stopping here: no work started on Finance, Wallet, Analytics, Reports, Automation, AI Copilot, Settings, or Platform Console.
