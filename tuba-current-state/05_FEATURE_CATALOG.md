# 05 — Feature Catalog & Maturity Assessment

**Status**: Observed/Inferred (source-code read, cross-referenced with the July audit and this pass's re-verification). Maturity labels use the six-tier scale requested: **Prototype**, **MVP**, **Production Ready**, **Needs Improvement**, **Needs Redesign**, **Obsolete**. Live-browser confirmation pending for UX-dependent judgments — see [07_UX_AUDIT.md](07_UX_AUDIT.md).

Maturity is judged on: does it work end-to-end, is it internally consistent, does it have known correctness/security defects, and is the underlying implementation something a next-gen system could extend vs. must replace.

---

## Discovery & Search

| Feature | Maturity | Why |
|---|---|---|
| Map-based search (debounced, stale-response-safe, shareable URL) | **Production Ready** (interaction design) / **Needs Redesign** (implementation) | The UX pattern is genuinely well-engineered — but it sits on a dev-named `test` controller, a ~150-line Eloquent scope chain with no relevance ranking, and an un-indexable string price column. Keep the interaction pattern; replace the underlying search engine. |
| Buy/Rent status-wise listing (legacy `{type}` route) | **Obsolete** | Superseded by the map-search implementation; still routed, unclear if still linked anywhere live. |
| Property detail page | **Production Ready** | Core content and SEO (now fixed, generic per-property) both work. |
| Project detail page | **Needs Improvement** | Page works but has zero SEO data wired (`viewProjectIndex` sets none). |
| Project listing/search | **Obsolete or removed** | No route/controller/nav link found in current source — appears deprecated since the July audit; needs live confirmation. |
| Saved search | **Prototype** | Filters are stored (`SavedSearch` model) but nothing ever re-runs them — the "save" half of the feature works, the "alert me" half was never built. |
| Favorites | **Needs Redesign** | Functionally works, but its delete path (`FavoriteService::deleteRecord`) is the platform's Critical mass-deletion IDOR — cannot ship as-is regardless of feature completeness. |

## Lead Generation & CRM

| Feature | Maturity | Why |
|---|---|---|
| PropertyRequest (buyer→matched agents) | **Needs Redesign** | Functions, but has a confirmed notification-routing bug (notifies the customer, not the agent) and is one-way with no reply channel. |
| AgentInboxRequest (direct contact) | **Prototype** | One-way lead drop; agent can read but not reply in-platform; API path doesn't notify at all. |
| Offer/negotiation flow | **Prototype** | `PropertyRequestOffer` has 5 fillable fields (`min_price`, `status`, `accepted_date`, etc.) that are declared but never populated by any code path — a designed-but-unbuilt feature. |
| Lead pipeline / stages / SLA | **Does not exist** | No stage model, no ownership/claim mechanism, no response-time tracking anywhere in the codebase. |
| Agent-to-customer chat/messaging | **Does not exist** | WhatsApp is a static `wa.me` deep link only; no messaging API integration anywhere. |

## Listings Management

| Feature | Maturity | Why |
|---|---|---|
| Property CRUD (agent + admin) | **Needs Improvement** | Functionally complete (create/edit/publish/media/AI description), but ~30% of the controller is dead commented-out code, a parallel legacy form (`old_edit`) coexists with the current one, and the media pipeline currently depends on an uninstalled package in this checkout. |
| Project CRUD | **Needs Improvement** | Same duplication pattern as Property, no AI description support (Property-only), no SoftDeletes despite a `deleted_at` column existing. |
| AI-generated SEO/description | **MVP** | Genuinely live and working for Property; confined to one content type, synchronous, no retry/backoff, API key read via raw `env()`. |
| Media/photo upload | **Needs Redesign** (currently likely broken — see below) | Pipeline was rewritten to use Intervention/Image + Spatie ImageOptimizer, a real improvement in design — but `intervention/image` is not an installed dependency in this checkout, meaning every upload may currently fatal-error. Single fixed thumbnail size (400×300), no responsive variants. |
| Amenity/feature tagging | **Production Ready** | 35 structured amenity flags + 9 nearby flags, taxonomy-consistent, manually agent-entered — a real asset for future AI auto-tagging. |

## Packages, Billing & Compliance

| Feature | Maturity | Why |
|---|---|---|
| Package / License Package / Single Package catalogs | **Production Ready** | Real, working monthly-rolling quota ledger (`PropertyUsage`), mature monetization logic. |
| Developer Package | **Obsolete / removed** | Model, controller, and migrations no longer exist in this checkout; route resolves to a static, non-functional view. |
| HyperPay checkout | **Needs Redesign** | Functionally live, server verifies status directly with the gateway (a real strength) — but TLS certificate verification is unconditionally disabled, a Critical defect that must be fixed before this can be called production-safe. |
| Tabby (BNPL) checkout | **Needs Redesign** | Fulfilment is granted via an unauthenticated GET keyed by a guessable sequential id, with no server-side confirmation from Tabby — a Critical, exploitable revenue-leakage defect. |
| Receipt generation | **Prototype (currently non-functional in this checkout)** | Depends on `barryvdh/laravel-dompdf`, which is not installed here. |
| Nafath identity verification | **Needs Redesign** | Live and functioning, but the callback JWT signature is never verified — the platform's core trust-differentiator is undermined by a Critical, fixable security gap. |
| FAL license verification | **Prototype** | Fully manual staff review, no OCR/extraction, and the approval endpoint has no permission middleware beyond `auth`. |
| REGA ad-license ETL | **Production Ready** | A genuinely functioning government-data integration — one of the platform's real strengths. |

## Notifications & Communication

| Feature | Maturity | Why |
|---|---|---|
| In-app/database notifications | **MVP** | 10 notification classes exist and now (new since audit) implement `ShouldQueue` — but all still deliver `database`-only; every class defines a commented-out `toMail()` path that's never enabled. |
| Email notifications | **Does not exist in practice** | Infrastructure (`toMail()` methods) is written but not wired to `via()` on any class. |
| SMS (Taqnyat) | **MVP** | Used for OTP delivery; bearer token hardcoded in source rather than config. |
| Push (Pusher real-time) | **Needs Redesign** | Wired for one use case (Nafath callback) but broadcasts on a public, non-authenticated channel — a privacy/security defect, not just an incompleteness gap. |
| WhatsApp | **Prototype** | Static deep-link only, no API integration. |

## Admin / Internal Operations

| Feature | Maturity | Why |
|---|---|---|
| Role management | **Needs Redesign** | Spatie roles exist and are assignable, but zero Laravel Policies exist, `Gate::before` gives SuperAdmin a blanket bypass, and `RoleController::destroy()` has no protection against deleting core role IDs. This is infrastructure for RBAC without the safety rails RBAC requires. |
| Reference data management (Countries/Cities/Districts/Categories/Property Types) | **Needs Redesign** | Functionally complete CRUD, but 5 of these controllers have zero permission gating beyond `auth` — any logged-in user, any role, has full write access. |
| Page SEO management | **Prototype** | `create`/`store`/`show`/`destroy` are empty method stubs; only `index`/`update` work. |
| Property Service Requests | **Prototype** | Only `index()` is implemented; every other CRUD method is an empty stub. |
| Ban Number management + Excel import | **Needs Improvement (import currently non-functional in this checkout)** | Import depends on `maatwebsite/excel`, not installed here. |
| Analytics / reporting | **Prototype**, one exception | Almost every dashboard metric (Total Favorites, Rating and Reviews, the main chart) is hardcoded or decorative. The Rent Now Click Report is the one **Production Ready** exception — real date-range/partner filtering and drill-down. |

## Platform / Cross-Cutting

| Feature | Maturity | Why |
|---|---|---|
| Authentication (session, web) | **Needs Redesign** | Functions, but ships a universal hardcoded password across every account type and unconditional OTP-bypass codes not gated to non-production — both Critical, and one (the SuperAdmin seeder) has gotten worse since the July audit. |
| Authorization (RBAC) | **Prototype** | Spatie installed and used for role storage, but no Policies, no scoped permissions, inconsistent middleware application — the TBX synthesis's #1 flagged gap versus both Bayut and Aqar applies to Tuba too, not just the competitors. |
| Mobile API (Sanctum) | **MVP** | Functioning, backs a shipped Agent app, but unversioned, non-expiring tokens, no effective rate limiting. |
| Bilingual (AR/EN) content | **Needs Improvement** | Real RTL asset pairs and parallel lang files exist, but Arabic `validation.php` is missing 25 keys present in English, and locale is a session flag, not a URL segment (blocks per-locale SEO indexing). |
| Design system / front-end build | **Prototype (in transition)** | Tailwind v4 + Vite declared in `package.json` but the CSS entry file is empty and unused — real styling is 100% the legacy Bootstrap 4/5-mixed asset tree. See [09_DESIGN_SYSTEM.md](09_DESIGN_SYSTEM.md). |
| Testing / CI/CD | **Does not exist** | Only Laravel's stock example tests remain in this checkout; no CI pipeline, no containerization. |
| Observability (logging, error tracking, audit log) | **Does not exist** | No Sentry/Bugsnag/Telescope, no activity-log package, matching the July audit's Operational score of 15/100. |

---

## Summary distribution

| Maturity | Count (approx., major features above) |
|---|---|
| Production Ready | 6 |
| MVP | 4 |
| Needs Improvement | 5 |
| Needs Redesign | 11 |
| Prototype | 9 |
| Obsolete / Removed / Does not exist | 9 |

**Reading this distribution**: the platform has real production-grade pieces (REGA ETL, package/quota ledger, map-search interaction, property detail SEO, Rent Now report) but the largest single cluster is "Needs Redesign" — features that function but carry a Critical security or correctness defect that blocks calling them production-safe. This is the same story the July audit told at the platform level (Product 58, Security 18) expressed at feature granularity: breadth and initial engineering care are real, but almost every module needs a defect-remediation pass, not a rebuild-from-zero, before it can anchor a next-generation system.
</content>
