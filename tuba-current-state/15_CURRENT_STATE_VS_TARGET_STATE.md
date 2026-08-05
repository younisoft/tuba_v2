# 15 — Current State vs. Target State

**Status**: Observed (Current Experience, Problems) + Inferred (Root Causes) + Recommended (Desired Experience, Required Features, Priority, Complexity). Each row follows the requested chain: Current Experience → Problems → Root Causes → Desired Experience → Required Features → Priority → Estimated Complexity.

---

## 1. Authentication & Account Security

- **Current Experience**: Any of the platform's account types (customer, agent, sub-user, employee, and — per this pass's finding — even the seeded SuperAdmin) can be accessed via a single, universal hardcoded password if an attacker knows it; OTP verification has unconditional master-bypass codes and phone numbers.
- **Problems**: Total authentication-integrity failure across every role; a security incident here would compromise the trust moat (Nafath-verified identity) the platform's entire regulatory strategy depends on.
- **Root Causes**: Debug/test conveniences from early development were never removed or environment-gated before the code reached what appears to be a production-intended state; the SuperAdmin seeder was recently rewritten in a way that *reinforces* rather than removes this pattern, suggesting it may be viewed internally as a deliberate operational shortcut rather than leftover debt.
- **Desired Experience**: Every account authenticates only with its own real credential; OTP has no bypass path outside a strictly `local`-gated developer/test mode.
- **Required Features**: Remove the hardcoded password and bypass codes entirely; add rate limiting to login/OTP endpoints; add an audit log so any future "convenience" shortcut is visible and reviewable rather than silent.
- **Priority**: P0 — blocks everything else, per both this assessment and the July audit's own Phase 1 sequencing.
- **Estimated Complexity**: Low (mechanically bounded — remove literals, add `app()->environment('local')` gates, add `throttle` middleware).

## 2. Listing Creation

- **Current Experience**: An agent creating a property or project encounters a dual, coexisting form UI (a legacy `old_edit`/`old_add` path reachable via `?chk=1` alongside the current form), no upfront checklist of what compliance/media/pricing information will be required, and (in this checkout) a media-upload step that likely fatal-errors due to a missing dependency.
- **Problems**: Cognitive overhead from an undocumented "which form is live" ambiguity that only engineers would know to avoid; brokers discover blocking requirements mid-flow rather than upfront; photo upload — arguably the single most important step in listing quality — is the least reliable part of the flow.
- **Root Causes**: Incremental rewrites left the old implementation in place rather than removed (a recurring pattern across Property, Project, and the media helper); the recent Laravel-12/dependency migration was not completed consistently (scaffold updated, some vendor packages dropped, code not adjusted to match).
- **Desired Experience**: One listing-creation wizard per listing type that front-loads a compliance/media/pricing checklist before the user starts filling fields — directly the TBX-recommended pattern, informed by Aqar's compliance-gate granularity and Bayut's lack of readiness guidance, avoiding both.
- **Required Features**: Retire the legacy form path; rebuild the media pipeline on a confirmed-installed, queued image-processing dependency; add a pre-flow requirements checklist (AI-assisted per [16_AI_READINESS.md](16_AI_READINESS.md) item 3).
- **Priority**: P1 — high business value (listing quality directly drives buyer conversion), moderate urgency (not a security risk, but a conversion/trust risk).
- **Estimated Complexity**: Medium-High (touches the core domain model, requires both a UI rebuild and a dependency/infrastructure fix).

## 3. Lead Handling / CRM

- **Current Experience**: A buyer's property inquiry can silently misroute its notification to the buyer instead of the agent; direct agent-contact messages are one-way with no in-platform reply; an agent's counter-offer flow has database fields that are never populated, meaning the "accept/reject" step doesn't exist despite being designed for.
- **Problems**: The core revenue promise of the platform — connecting a paying agent to a real lead — fails silently in at least one confirmed path; agents have no way to close the loop on a negotiation without leaving the platform.
- **Root Causes**: A copy-paste/refactor error in the notification call (`$propertyRequest->user->notify(...)` uses the submitting customer's relationship instead of the matched agent's); the offer-accept feature appears to have been started and abandoned mid-build (fields exist, logic doesn't).
- **Desired Experience**: Every lead reliably reaches the correct agent; agents can reply and negotiate without leaving the platform; a real pipeline shows lead stage, ownership, and response-time — the TBX-recommended unified pipeline ingesting both buyer-inbound and (if built) owner-originated demand into one scored, SLA-timed system.
- **Required Features**: Fix the notification-routing bug (near-zero effort, immediate); build two-way messaging; finish the `PropertyRequestOffer` accept/reject flow using its already-declared fields; add response-time tracking.
- **Priority**: P1 for the bug fix (trivial effort, high value); P2 for the full pipeline rebuild (depends on RBAC landing first for lead ownership/visibility scoping).
- **Estimated Complexity**: Low (bug fix) → High (full two-way CRM pipeline).

## 4. Role-Based Access Control

- **Current Experience**: Roles exist (Spatie) and can be assigned, but there are no Laravel Policies anywhere, a blanket `Gate::before` bypass grants SuperAdmin universal access regardless of any specific permission, five+ admin controllers have no permission check at all beyond being logged in, and sidebar navigation for some features is invisible to correctly-permissioned users due to a permission-name mismatch.
- **Problems**: "Role" currently means very little in practice — a logged-in user's actual capability boundary is inconsistent and, for several modules, effectively unbounded.
- **Root Causes**: RBAC infrastructure (Spatie) was adopted without a corresponding design discipline (Policies, a single source of truth for permission strings, systematic middleware application) — the library was installed, the pattern around it was not.
- **Desired Experience**: Real role templates (Owner/Admin/Agent/Finance-equivalent) with scoped, delegated authority — the TBX synthesis's #1 recommended differentiator, since neither Bayut nor Aqar has this either, making it Tuba's single highest-leverage opportunity to lead the category rather than merely catch up.
- **Required Features**: Policy classes for every sensitive model; a single canonical permission-string registry (fixing the sidebar mismatch as a side effect); consistent `permission:` middleware application; an audit log recording every authorization-relevant action.
- **Priority**: P1 — not a P0 security emergency in the same class as hardcoded credentials, but the highest-leverage *competitive* investment identified anywhere in this assessment.
- **Estimated Complexity**: High (touches every controller and requires a genuine design exercise, not a config change).

## 5. Trust & Compliance Signaling

- **Current Experience**: Three real government integrations (REGA, Nafath, FAL) exist and function, but the Nafath callback's cryptographic signature is never checked, and the installed review/rating package has no UI wired to it anywhere — the dashboard's own "Rating and Reviews" tile is a hardcoded `0`.
- **Problems**: The platform's most defensible asset (regulatory trust) is undermined by a fixable integrity gap; a nearly-free credibility signal (reviews) is left completely unused, misrepresenting real platform activity to staff and agents.
- **Root Causes**: The Nafath integration was built for the happy path (verify identity, proceed) without the adversarial case (verify the verifier); the review package was installed as part of a broader dependency set but the UI work to surface it was never scheduled or was deprioritized.
- **Desired Experience**: A trust layer that is simultaneously regulatory (verified, cryptographically sound government identity checks) and social (real, visible review/rating data) — a combination neither Bayut (gamified badge, no reviews found) nor Aqar (no comparable mechanic found) currently offers.
- **Required Features**: JWT signature verification on the Nafath callback (a bounded, well-understood fix); wire the existing `ReviewRateable` implementation to real agent/property UI.
- **Priority**: P0 for the Nafath fix (security-critical); P2 for review UI (high value, low-medium effort, not urgent).
- **Estimated Complexity**: Low-Medium for both — these are two of the highest value-per-effort items in the entire assessment.

## 6. Navigation & Information Architecture

- **Current Experience**: One flat, ~27-item sidebar serves customers, agents, and internal admin staff alike, differentiated only by which `@can()` checks happen to pass at render time; there is no URL-level or route-level separation between "admin panel" and "agent dashboard."
- **Problems**: No information scent beyond a bare label for 27 undifferentiated items; a correctly-permissioned user can still fail to find a feature they're allowed to use because of the permission-name/sidebar-check mismatch noted above.
- **Root Causes**: The application was built as one shared codebase from the start, with role differentiation added as an afterthought (a commented-out `'prefix' => 'admin'` route-group attempt in `routes/web.php` shows this was considered and abandoned mid-implementation).
- **Desired Experience**: One coherent navigation system, differentiated by role at the structural level (not just conditional rendering) — avoiding both Bayut's flatness (which Tuba already has) and Aqar's duplication (which Tuba should not introduce while fixing this).
- **Required Features**: Route-level (or at minimum, systematically grouped) navigation differentiation by role, sequenced after the RBAC rebuild since role-scoping is the prerequisite input navigation differentiation needs.
- **Priority**: P3 — a real structural improvement, but lower urgency than the security and RBAC-foundation items it depends on.
- **Estimated Complexity**: Medium (mostly a routing/IA reorganization once RBAC exists, not a new capability to build).

## 7. Search & Discovery

- **Current Experience**: A well-engineered map-search *interaction* (debounced, stale-response-safe, shareable URL) sits on top of a ~150-line Eloquent scope chain with no relevance ranking, no typo-tolerance, and an un-indexable string price column, all running through a controller and routes still literally named `test`.
- **Problems**: Search quality has a hard ceiling that query-tuning cannot fix; the naming makes the codebase harder to reason about and onboard new engineers into.
- **Root Causes**: What was likely originally a prototype/test implementation became the permanent production path without ever being promoted/renamed or replaced with dedicated search infrastructure — a common trajectory for fast-moving small teams, per the July audit's own framing.
- **Desired Experience**: The same well-regarded interaction design, backed by a real relevance-ranked search engine with a numeric, indexable price schema.
- **Required Features**: Elasticsearch/Meilisearch/Algolia-class search infrastructure; numeric price-column migration; route/controller renaming (cosmetic but worth doing once test coverage exists to do it safely).
- **Priority**: P2 — high business value (search is the highest-traffic surface), but appropriately sequenced behind the P0/P1 security and RBAC work.
- **Estimated Complexity**: High (new infrastructure, data migration, and reindexing at existing listing volume).

## 8. AI Capability

- **Current Experience**: One production AI feature (Property SEO/description generation via OpenAI) — genuinely live, and ahead of both audited competitors, but confined to one content type, synchronous, and fragile (raw `env()` key, no retry).
- **Problems**: A real advantage is at risk of narrowing as competitors catch up, and the current implementation's fragility means it could silently break (e.g., under `config:cache`) without anyone noticing quickly, given the platform's absent error-tracking/observability.
- **Root Causes**: The integration was built to solve one immediate content-generation need rather than as a reusable internal AI-orchestration capability; observability/error-tracking was never added platform-wide, so this integration inherits that gap along with everything else.
- **Desired Experience**: The same proven integration pattern, hardened (queued, configured, retried) and extended into the connective-tissue role the TBX synthesis recommends — explaining compliance requirements, KPIs, and lead scores in plain language across every module, not just generating listing copy.
- **Required Features**: See [16_AI_READINESS.md](16_AI_READINESS.md) in full — Phase 0 hardening, Property→Project extension, AI Search, Broker Assistant v1, Lead Scoring v1, in that order.
- **Priority**: P3 — genuinely valuable and differentiating, but correctly sequenced after the security/RBAC/CRM foundations, consistent with the July audit's own roadmap logic.
- **Estimated Complexity**: Low (Phase 0/1 items) to High (Market Insights/Price Estimation, which require new data infrastructure first).
</content>
