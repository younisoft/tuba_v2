# TBOS Marketing + Campaign Intelligence UX Audit

**Scope**: before building MKT-01/02/03, what does the current TBOS implementation give Marketing to extend, and what does the canonical source actually specify — since Marketing was only ever three placeholder screens until now?

**Method**: fresh, exhaustive research pass over `tbos-definition/` and `tbos-blueprint/` (module specifications, screen inventory, workflow architecture, state architecture, component mapping, notification blueprint, decision support system, acceptance criteria, open questions, feature readiness matrix, AI interaction blueprint, glossary), cross-checked against direct inspection of the current source: `types/entities.ts`'s existing minimal `Campaign`/`WalletSummary`, `screenRegistry.ts`'s MKT-01/02/03 and OWN-03 entries, `rolePermissions.ts`'s `marketing.*` grants, `mocks/data/seed.ts`'s existing `CAMPAIGNS`/`WALLETS`, and the component registry's pre-registered-but-never-consumed `AISuggestion`/`QuotaBalanceMeter` entries.

## Summary

| Severity | Count | Blocking this slice? |
|---|---|---|
| P0 | 0 | — |
| P1 | 2 | Yes — resolved below with documented assumptions |
| P2 | 2 | No — documented, both resolved anyway |
| P3 | 2 | No — documented, deferred |

## Findings

### P1-1 — Campaign lifecycle has no ratified state table anywhere in the source

- **Finding**: unlike Property (8-state table), Lead pipeline, Contract (6-state table), and Marketing Request (4-state table) — all of which have an explicit state table in `tbos-blueprint/06_STATE_ARCHITECTURE.md` — **Campaign has no lifecycle section there at all**, and no entry in the state-diagram index. The only state-like language anywhere is scattered: MKT-01's "pause/resume" secondary action, MKT-02's "zero-eligible-inventory / spend-checking / insufficient-balance-error / running-campaign confirmation" states, and `03_USER_JOURNEYS.md`'s "a campaign can be paused... resumable without reconfiguration." The pre-existing `Campaign` type (Foundation phase) already encodes `'draft' | 'running' | 'paused' | 'ended'` — a plausible inference from that scattered language, but **not a quoted specification**.
- **Why it matters**: silently treating an inferred enum as ratified would misrepresent the source the same way inventing tabs for CONT-02 would have in Phase 8.
- **Resolution (ASSUMPTION, not silently decided)**: keep the existing 4-state enum (`draft`/`running`/`paused`/`ended`) — it is consistent with every scattered reference and requires no destructive type change to already-seeded data. Explicitly flagged here as an inference, not a spec quote. The "zero-eligible-inventory" and "insufficient-balance" conditions from MKT-02 are **not** modeled as stored Campaign statuses — the source frames them as a **pre-launch gate** ("eligibility checked before inventory-selection UI even renders," "prevented at the entry point, not discovered as an error"), so they are implemented as a **computed, live-evaluated blocker** on the creation flow, never a status a saved Campaign sits in. This mirrors Contract's `canActivate` computed-check pattern from Phase 8, not a new architecture.

### P1-2 — The eligibility rule's exact content is undefined; the mechanism/timing is fully specified

- **Finding**: `tbos-definition/16_MODULE_SPECIFICATIONS.md`: "a campaign cannot be started with zero eligible inventory — this state is prevented at the entry point, not discovered as an error." `tbos-blueprint/13_FEATURE_READINESS_MATRIX.md` marks MKT-01/02's eligibility *flow* "Ready — behavior fully specified." But **no document states which Property lifecycle states qualify as "eligible."** `17_ACCEPTANCE_CRITERIA.md` (151 lines, 9 covered workflows) has **zero** Marketing/Campaign scenarios — confirmed by full read, not a search miss.
- **Resolution (ASSUMPTION, documented)**: eligible inventory = Properties whose `status` is `'active'` or `'expiring'` — i.e., currently live/published. This is a direct, minimal-invention reuse of Property's own already-ratified 8-state lifecycle (`06_STATE_ARCHITECTURE.md`) rather than a second, invented eligibility taxonomy: a property cannot reach `'active'` without already having cleared compliance (Phase 6's PROP-02 precedent), so this single check also honestly encodes "compliance-clear" without a duplicate compliance check. Flagged explicitly as an inference a real Product/Ops decision could override, not a legal or business rule.

### P2-1 — Two registered components (`AISuggestion`, `QuotaBalanceMeter`) were pre-registered against MKT-02 but never consumed by any real screen

- **Finding**: `AISuggestion` (`TBOS-CMP-AI-004`) is registered with `screenIds: ['PROP-03', 'MKT-02', 'LEAD-03']` since the Component Library phase but is only ever rendered in the internal style guide, never a real screen. `QuotaBalanceMeter` (`TBOS-CMP-DATA-003`) is registered only against `['WAL-01', 'HOME-01']` — missing `MKT-02` entirely, despite `tbos-blueprint/05_COMPONENT_MAPPING.md` explicitly listing "Quota/Balance Meter" as MKT-02's pre-flight-check component. The exact same class of registry-accuracy gap Phase 8 found for the Compliance components.
- **Resolution**: **MKT-02 is the first real consumer of both.** `AISuggestion` renders the campaign-copy-generation AI action (with `AIActionBar`'s accept/regenerate/discard, matching the style guide's own demonstrated pattern — no new AI visual language). `QuotaBalanceMeter`'s registry entry gains `'MKT-02'` in its `screenIds` (a registry-accuracy fix, not a new component).
- **Status**: Resolved.

### P2-2 — Campaign has no owner/creator field, so `'own'`-scope RBAC has nothing to check against

- **Finding**: the pre-existing `Campaign` type (`{ id, agencyId, name, status, spendSar, linkedPropertyIds }`) has no field identifying who created/manages it. `rolePermissions.ts` grants `marketing.view`/`marketing.manage` as `'own'`-scoped for SB and `'agency'`-scoped for AO/MM — but `'own'` is unenforceable without a stored creator. Every other module in this codebase needed an equivalent field for real record-level RBAC (`Property.brokerId`, `Lead.assigneeId`, Contract's transitively-derived-through-Lead scope).
- **Resolution**: `Campaign` gains `createdByUserId: string` — the same class of honest, necessary addition as `Property.listedDate`/`Contract.activeSince`, not invented business content.
- **Status**: **Fixed.**

### P3-1 (deferred) — Content-quality scoring formula/thresholds are not numerically specified

`tbos-blueprint/08_AI_INTERACTION_BLUEPRINT.md`'s Property Quality capability names the rubric components — "photos present, description length/quality, pricing present" — but no numeric formula, weighting, or pass/fail threshold is given anywhere. `Property` also has no `description` field today (Foundation-phase gap, unrelated to this phase). Implemented as a transparent, deterministic, clearly-labeled **demo** completeness check (has ≥3 approved photos, has a description of reasonable length, has a price — the last of which is trivially always true since `priceSar` is a required field) rather than a fabricated AI-scoring formula. `Property.description` (optional) is added as the same class of honest addition as P2-2, populated with a realistic mix (thorough / thin / missing) across the seed set specifically so the queue has real variation to show. No numeric score is presented as an authoritative AI output — it is labeled as what it is: a completeness checklist, matching the rubric's own three named components, not a fabricated ML confidence number.

### P3-2 (deferred) — "Under-promoted inventory" Today recommendation is real but under-specified

MKT-01's own screen spec lists "under-promoted-inventory recommendation feeding campaign creation" as an AI action, and `03_USER_JOURNEYS.md` references a Today card ("3 listings under-promoted this week") — but this is **not** one of the seven canonical Today categories formalized in `tbos-definition/15_DECISION_SUPPORT_SYSTEM.md`'s "Recommendation categories" list (Lead triage/Pricing/Compliance/Response priority/**Content quality**/Team performance/Opportunity), and has no Why/Impact/Recommended-Action row anywhere. Per the exact discipline Phase 7 already established for "customer requiring follow-up" (refused for the same reason), **this is not implemented**. Only the genuinely-canonical **Content quality** category is built (§12 below), and "Campaign eligibility blocked/insufficient balance" is implemented as the **notification** the source explicitly classifies it as (`09_NOTIFICATION_BLUEPRINT.md`'s own table row), not stretched into a Today card the source doesn't specify for it.

## Answers to the master prompt's implicit consistency questions

**Marketing Request vs. Campaign**: confirmed, explicitly, as two separate, non-overlapping entities — `tbos-definition/06_PRODUCT_ARCHITECTURE.md`: "campaign/promotion management, distinct from the Marketing Requests *inbound* flow... kept separate... because 'managing my own promotional spend' and 'triaging what came in' are different jobs." No FK or shared record is introduced between them. "Marketing Request queue/list" and "Marketing Request detail" (master prompt §06) are **already fully built** — OWN-03 (agency-wide queue) and OWN-02's embedded tab (per-owner detail) — from Phase 7; no new Marketing Request screen is invented here, since none exists in the registry and the master prompt itself instructs "if the source defines fewer screens than the above, follow the source."

**Screen scope**: exactly MKT-01/MKT-02/MKT-03, the only three Marketing screen IDs anywhere in `screenRegistry.ts` or the source documents — no MKT-04 exists. MKT-02's registered path (`/marketing/new`, no dynamic segment) is implemented literally as the single-flow architecture the source specifies: an optional `?campaignId=` query parameter distinguishes "create new" (absent) from "view/manage existing" (present) on the same route — one screen, one component, matching "single flow for creating and later managing a campaign" without inventing a second `/marketing/:campaignId` route the registry doesn't define.

**Wallet spend model**: `tbos-blueprint/18_OPEN_QUESTIONS.md` explicitly flags "Wallet package/tier pricing and quota amounts" as an unresolved pricing decision scoped directly against "MKT-02's spend-tier options." Both "spend" (SAR) and "quota" (unit) language appear interchangeably in the source with no disambiguation. **Resolved as an ASSUMPTION**: Campaign launch consumes `WalletSummary.quotaUsed`/`quotaTotal` (unit-based), reusing `QuotaBalanceMeter`'s exact existing `used`/`total` contract rather than inventing a SAR-deduction formula — a fixed, clearly-labeled demo cost (1 quota unit per campaign) stands in for the real pricing decision, never presented as a ratified price.

**Component reuse**: zero new components required. MKT-01/02/03 consume `DataTable`, `PageHeader`, `FilterBar`, `Badge`, `EmptyState` (including the one real brand-pattern SVG asset already used by Properties' empty state — see §19 below), `AISuggestion` + `AIActionBar` (first real use), `QuotaBalanceMeter` (first real use, registry-fixed), `ConfirmationDialog`, `EntityDetailHeader`, `ActivityTimeline`, `PermissionGate`, `Skeleton`, `ErrorState`, `NoPermissionState`.

**Brand asset gap (informational, not a defect to fix here)**: the master prompt describes "19/20 supplied SVG brand icons," but only **one** (`modern-home.svg`) actually exists in `public/brand-patterns/` anywhere in this repository. Asset creation is outside a frontend-engineering phase's scope — the existing single asset is reused for Marketing's empty state (matching Properties' own precedent exactly), and this gap is noted for whoever owns the design-asset pipeline, not silently worked around by fabricating new SVGs.

## Verdict

0 P0, 2 P1 (both resolved with explicitly documented, reversible assumptions — Campaign lifecycle enum, eligibility rule content), 2 P2 (both fixed — AISuggestion/QuotaBalanceMeter now real, Campaign gained a creator field for RBAC), 2 P3 (documented, deferred — content-quality formula, under-promoted-inventory Today card). `npx vitest run` — 143/143 passing before any Marketing code was written. Proceeding to the Marketing + Campaign Intelligence Vertical Slice.
