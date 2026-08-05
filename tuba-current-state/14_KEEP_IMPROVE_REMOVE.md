# 14 — Keep / Improve / Remove Matrix

**Status**: Observed/Recommended. Classifications build directly on [05_FEATURE_CATALOG.md](05_FEATURE_CATALOG.md)'s maturity ratings and [13_GAP_ANALYSIS.md](13_GAP_ANALYSIS.md)'s competitive positioning. Five classifications used, as specified: **KEEP**, **KEEP & IMPROVE**, **REDESIGN**, **REPLACE**, **REMOVE**.

This is a judgment layer, not a re-statement of facts already documented elsewhere — each row states a decision and the reasoning behind it. Per the master assessment's instructions, this is analysis for the *next-generation Broker Experience System's* design input, not a work order for the current codebase.

---

## Data / Domain Layer

| Feature/asset | Decision | Reasoning |
|---|---|---|
| Property lifecycle model (8-state) | **KEEP** | Real, working domain modeling — a genuine strength across two independent audits one month apart. |
| Package/quota ledger (`PropertyUsage`, `Package`, `LicensePackage`, `SinglePackage`) | **KEEP & IMPROVE** | Mature monetization logic (KEEP), but should gain a monetized-visibility layer (boosts/auctions per the TBX gap analysis) and lose the free-text price-column debt (IMPROVE). |
| `DeveloperPackage` catalog | **REMOVE** (already effectively gone) | No longer exists in this checkout; if genuinely deprecated by the business, formally retire the route/view stub rather than leaving a dead entry point. If it was accidentally lost (see checkout-consistency caveat), confirm with engineering before deciding — do not silently resurrect without a product decision. |
| REGA/Nafath/FAL government integrations | **KEEP & IMPROVE** | The platform's single most defensible asset (a real regulatory moat neither Bayut nor Aqar's audits found an equivalent depth of) — but the Nafath signature-verification gap must be fixed before this can be marketed as a trust differentiator. |
| Amenity/nearby taxonomy (35 + 9 flags) | **KEEP** | Structured, consistent, and directly reusable as an AI Image-Analysis auto-tagging input per the AI-readiness assessment. |
| CSV-packed pseudo-FK columns (`agent_preference_settings`) | **REPLACE** | Migrate to proper pivot tables with foreign-key constraints — a well-understood, bounded fix, not a redesign question. |

## Authentication, Authorization & Security

| Feature/asset | Decision | Reasoning |
|---|---|---|
| Universal hardcoded password across all account types | **REMOVE** | Not a feature to improve — this should not exist in any form, in any environment, gated or not. |
| OTP master-bypass codes | **REMOVE** | Same reasoning; legitimate testing needs are already correctly served by the separate, properly `local`-gated test-code block found alongside these. |
| Spatie role assignment | **KEEP & IMPROVE** | The role-storage mechanism itself is fine; what's missing is Policies and consistent enforcement, not a replacement of the underlying library. |
| Current authorization model (`Gate::before` blanket bypass + inconsistent middleware) | **REDESIGN** | Needs a from-scratch RBAC design (Policies, scoped permissions, role templates) — this is the TBX synthesis's #1 recommended differentiator and cannot be patched incrementally into the current ad hoc pattern without a deliberate redesign. |
| Sanctum mobile API auth | **KEEP & IMPROVE** | Token mechanism is sound; add expiration, scoped abilities, and versioning rather than replacing Sanctum itself. |

## Discovery & Search

| Feature/asset | Decision | Reasoning |
|---|---|---|
| Map-search interaction design (debounce, stale-response guard, shareable URL) | **KEEP** | Genuinely well-engineered UX pattern — carry the *interaction design* forward even though the underlying implementation is replaced. |
| Eloquent `scopeAppSearch` query engine | **REPLACE** | No relevance ranking, no typo-tolerance, un-indexable string price sort — this is the July audit's own top-priority infrastructure gap and the TBX-confirmed gap versus category norms; needs a real search engine (Elasticsearch/Meilisearch/Algolia-class), not incremental tuning. |
| Project listing/search surface | **KEEP & IMPROVE, or REBUILD if confirmed removed** | If the apparent removal since the July audit is intentional, this needs to be rebuilt as part of the next-gen IA regardless — a Project detail page with no on-site discovery path is a dead end today. |
| Saved search | **KEEP & IMPROVE** | The "save" mechanism works; the missing "alert me on match" half should be built, not replaced — data model is already correct. |

## Listings Management

| Feature/asset | Decision | Reasoning |
|---|---|---|
| Property/Project CRUD (current implementation) | **REDESIGN** | Functionally complete but carries ~30% dead code, a dual live/legacy form UI, and duplicated Property/Project logic with no shared trait — worth a clean rebuild on the same domain model rather than incremental patching, given the scale of accumulated debt. |
| AI-generated SEO/description (`OpenAISeoService`) | **KEEP & IMPROVE** | Real, working, and a genuine competitive lead over both Bayut and Aqar (neither has meaningful AI) — extend to Projects, move to a queue, add retry/backoff, per [16_AI_READINESS.md](16_AI_READINESS.md). Do not discard this integration pattern. |
| Media/photo pipeline | **REPLACE** | Currently likely non-functional in this checkout (missing dependency) and even when working, offers only one fixed thumbnail size with no responsive variants — build a proper, queued, multi-size pipeline rather than patching the current one further. |

## Lead Generation & CRM

| Feature/asset | Decision | Reasoning |
|---|---|---|
| `PropertyRequest` (buyer-initiated, broadcast to matched agents) | **KEEP & IMPROVE** | The demand-capture concept is sound and matches the TBX-recommended "ingest buyer-inbound" half of a unified pipeline — fix the notification-misrouting bug immediately, then extend into a real pipeline. |
| `AgentInboxRequest` (direct contact) | **KEEP & IMPROVE** | Same reasoning — add two-way reply, keep the capture mechanism. |
| `PropertyRequestOffer` (designed-but-unbuilt accept flow) | **KEEP & IMPROVE** | Fields already exist; this is a genuine "finish, don't redesign" opportunity — completing it is lower effort than building a new offer/negotiation model from scratch. |
| WhatsApp static deep link | **REPLACE** | A real messaging-API integration (or an in-platform equivalent) should replace the "leave the platform" pattern — this is the TBX-flagged single most consequential CRM gap versus category-leader expectations. |

## Notifications & Real-Time

| Feature/asset | Decision | Reasoning |
|---|---|---|
| Notification class structure (10 classes, `ShouldQueue`) | **KEEP & IMPROVE** | The class-per-event structure and the new queuing capability are sound scaffolding — add real multi-channel delivery (`via()` beyond `database`) rather than replacing the pattern. |
| Pusher real-time channel | **REDESIGN** | The mechanism is fine; the public/non-authenticated channel exposure is a security defect that requires redesigning the channel-authorization model (private channels + restored `routes/channels.php` callbacks), not just a config flip. |

## Admin / Internal Tooling

| Feature/asset | Decision | Reasoning |
|---|---|---|
| Reference-data management (Countries/Cities/Districts/Categories/Property Types) | **KEEP & IMPROVE** | The CRUD itself is unremarkable but fine — add the missing permission middleware; no need to redesign functioning reference-data admin screens. |
| Dashboard analytics (decorative charts, hardcoded tiles) | **REPLACE** | "Wire real data or remove" was already the July audit's own recommendation — a decorative chart actively misinforms staff and should not simply be "improved" cosmetically. |
| Rent Now Click Report | **KEEP** | The one genuinely real, useful analytics screen in the platform — a template for what the rest of the analytics surface should become. |
| Page SEO admin (empty CRUD stubs) | **REDESIGN** | Half-built (`index`/`update` only) — decide whether this module is still wanted before investing further; if yes, finish the CRUD properly rather than leaving stubs. |
| Property Service Requests admin | **REDESIGN or REMOVE** | Only `index()` implemented; confirm with the business whether this module is still an active feature before investing in completing it — if abandoned, remove rather than leave dead stub methods. |

## Front-End / Design System

| Feature/asset | Decision | Reasoning |
|---|---|---|
| Legacy Bootstrap 4/5-mixed CSS (`public/login_asset/css/`) | **REPLACE** | No tokens, 27k lines, dual Bootstrap versions actively conflicting on the highest-traffic page — this is a greenfield design-system build, not a migration (see [09_DESIGN_SYSTEM.md](09_DESIGN_SYSTEM.md)). |
| Tailwind v4 + Vite pipeline (declared, unused) | **KEEP & IMPROVE (as the direction, not the current state)** | The right toolchain choice for a token-based rebuild — actually wire it up (populate `app.css`, add a Tailwind config, generate a real build) rather than starting over with a different tool. |
| RTL/LTR bilingual asset-pairing discipline | **KEEP** | A genuine strength (Localization scored 58/100, second-highest in the July audit) — preserve the *practice* even while rebuilding the underlying CSS, ideally evolving it from "two parallel files" to "one component, direction-aware." |
| jQuery + 17-script unbundled loading pattern | **REMOVE** | No SPA framework is being mandated by this document, but the specific pattern (jQuery 3.3.1, unbundled scripts, no defer/async) should not be carried into a next-gen system regardless of what replaces it. |

## Mobile API

| Feature/asset | Decision | Reasoning |
|---|---|---|
| Sanctum-based Agent/User API surface | **KEEP & IMPROVE** | Already backs a shipped mobile app — add versioning (`/api/v1/`), rate limiting, API Resources for consistent envelopes, and OpenAPI documentation rather than replacing the underlying auth/data model. |

---

## Summary counts

| Decision | Count |
|---|---|
| KEEP | 6 |
| KEEP & IMPROVE | 14 |
| REDESIGN | 6 |
| REPLACE | 7 |
| REMOVE | 4 |

**Reading this distribution**: the plurality verdict is **KEEP & IMPROVE** — consistent with the July audit's own framing that Tuba's core product/business layer is sound and the debt is concentrated in engineering/security execution, not fundamental product-market misfit. The **REPLACE** cluster is concentrated almost entirely in infrastructure (search engine, media pipeline, CSS/design system, messaging) rather than domain logic — exactly the pattern a next-generation Broker OS build should expect: keep the data model and the two-country regulatory moat, rebuild the engineering substrate underneath it.
</content>
