# 17 — Implementation Priorities

**Status**: Recommended, sequenced from Observed findings across this assessment. This document sequences everything in [13_GAP_ANALYSIS.md](13_GAP_ANALYSIS.md), [14_KEEP_IMPROVE_REMOVE.md](14_KEEP_IMPROVE_REMOVE.md), [15_CURRENT_STATE_VS_TARGET_STATE.md](15_CURRENT_STATE_VS_TARGET_STATE.md), and [16_AI_READINESS.md](16_AI_READINESS.md) into one ordered plan. It does not re-derive evidence — every item cites the document where the underlying finding and reasoning already live.

This is a sequencing document for whoever decides how to move from current-state Tuba toward Tuba Broker OS. It assumes the July `web-project-audit`/`phase4` Phase 1–5 roadmap (`16_PRODUCT_ROADMAP.md`, `36_MASTER_STRATEGY.md`) remains valid for anything not superseded here, and layers the new Bayut/Aqar-informed competitive priorities on top of it.

---

## Phase 0 — Resolve the checkout-consistency question (before anything else)

This is new relative to the July audit and blocks confident planning of everything downstream.

| # | Item | Source | Why first |
|---|---|---|---|
| 0.1 | Reconcile this `tuba/` checkout against what is actually deployed to `tuba.com.sa` — confirm installed package set (`barryvdh/laravel-dompdf`, `maatwebsite/excel`, `intervention/image`), real `.env` values, and whether the missing 2026-06/07-dated migrations were reverted or never existed in this checkout | [12_SOURCE_CODE_ASSESSMENT.md](12_SOURCE_CODE_ASSESSMENT.md) §0 | Every finding below that cites `.env`, dependency, or recent-migration state inherits uncertainty from this until resolved |
| 0.2 | If the dependency gaps are confirmed real in production: fix immediately (photo upload, receipt PDF, and Excel import are all plausibly fatal-erroring) | Same | Directly blocks core agent workflows if true |

## Phase 1 — Critical Security Fixes (Weeks 0–4, unchanged urgency from the July audit, now with one regression)

All 7 items independently re-confirmed still live in this pass — see [12_SOURCE_CODE_ASSESSMENT.md](12_SOURCE_CODE_ASSESSMENT.md) §4.

| # | Item | Effort | Value |
|---|---|---|---|
| 1.1 | Remove the universal hardcoded password and OTP master-bypass codes (including the now-worsened `CreateAdminUserSeeder` regression) | Low | Critical |
| 1.2 | Verify the Nafath callback JWT signature | Medium | Critical — also unblocks the trust-signal opportunity in §3 below |
| 1.3 | Enable TLS verification on HyperPay calls | Low | Critical |
| 1.4 | Fix Tabby fulfilment (implement real server-side confirmation, remove the unauthenticated free-entitlement path) | Medium | Critical — direct revenue leakage |
| 1.5 | Fix `FavoriteService::deleteRecord` IDOR | Low | Critical |
| 1.6 | Add permission middleware to the 5 unguarded reference-data controllers | Low | High |
| 1.7 | Add rate limiting to login/OTP/API endpoints (confirmed currently ineffective platform-wide due to the dead legacy Kernel — [11_TECHNICAL_ARCHITECTURE.md](11_TECHNICAL_ARCHITECTURE.md)) | Low | High |
| 1.8 | Add an audit-log package | Medium | High — forensic prerequisite for trusting every fix above actually held |

**Exit criteria** (unchanged from the July audit): no unauthenticated path grants a paid entitlement or destroys arbitrary data; no authentication path is bypassable by a known constant; every sensitive admin action is both permission-gated and logged.

## Phase 2 — Fix the one confirmed active CRM bug + finish designed-but-unbuilt features

New emphasis versus the July audit: these are not "improvements," they are completions of work already started.

| # | Item | Source |
|---|---|---|
| 2.1 | Fix `AgentPropertyRequest` notifying the customer instead of the agent | [15_CURRENT_STATE_VS_TARGET_STATE.md](15_CURRENT_STATE_VS_TARGET_STATE.md) §3 |
| 2.2 | Finish the `PropertyRequestOffer` accept/reject flow (fields already declared, unused) | [14_KEEP_IMPROVE_REMOVE.md](14_KEEP_IMPROVE_REMOVE.md) |
| 2.3 | Wire the installed review/rating package to real agent/property UI | [15_CURRENT_STATE_VS_TARGET_STATE.md](15_CURRENT_STATE_VS_TARGET_STATE.md) §5 |
| 2.4 | Replace decorative dashboard charts/hardcoded tiles with real queries or remove them | July audit `00_EXECUTIVE_SUMMARY.md` §6, reaffirmed here |

## Phase 3 — Real RBAC (the single highest-leverage competitive move identified in this assessment)

Per [13_GAP_ANALYSIS.md](13_GAP_ANALYSIS.md) §3: this is the one gap shared by Tuba, Bayut, AND Aqar — closing it puts Tuba ahead of both incumbents simultaneously, not merely at parity.

| # | Item |
|---|---|
| 3.1 | Design and implement Laravel Policies for every sensitive model |
| 3.2 | Establish a single canonical permission-string registry (fixes the sidebar-visibility mismatch as a side effect) |
| 3.3 | Build real role templates (Owner/Admin/Agent/Finance-equivalent) with scoped visibility |
| 3.4 | Remove or scope the blanket `Gate::before` SuperAdmin bypass to something auditable |

## Phase 4 — Unified Lead Pipeline / CRM

Per [13_GAP_ANALYSIS.md](13_GAP_ANALYSIS.md) §3 and the TBX synthesis's recommended unified pipeline (ingesting both buyer-inbound and, if built, owner-originated demand).

| # | Item |
|---|---|
| 4.1 | Two-way messaging/reply for `AgentInboxRequest` |
| 4.2 | Lead pipeline stages + ownership/claim + response-time tracking |
| 4.3 | Duplicate detection, source/UTM attribution, lost-lead reasons |
| 4.4 | Lead Scoring v1 (heuristic baseline, per [16_AI_READINESS.md](16_AI_READINESS.md)) |

## Phase 5 — Discovery & Search Infrastructure

| # | Item |
|---|---|
| 5.1 | Real search/relevance engine (Elasticsearch/Meilisearch/Algolia-class) |
| 5.2 | Numeric price-column migration (prerequisite for correct sort/filter and future Price Estimation) |
| 5.3 | Sitemap, structured data (JSON-LD), canonical tags, URL-based locale/`hreflang` |
| 5.4 | AI Search (NL-query-to-filter) layered on top once (5.1) lands, per [16_AI_READINESS.md](16_AI_READINESS.md) |

## Phase 6 — Design System & Front-End Rebuild

| # | Item |
|---|---|
| 6.1 | Wire up the already-declared Tailwind v4 pipeline (populate `app.css`, add a real config) rather than introducing a third styling approach |
| 6.2 | Extract and formalize the informal color/type/spacing values found in [09_DESIGN_SYSTEM.md](09_DESIGN_SYSTEM.md) into real tokens |
| 6.3 | Build a real, parameterized component library (cards, tables, forms, buttons, modals) — see [10_COMPONENT_LIBRARY.md](10_COMPONENT_LIBRARY.md) for the greenfield scope |
| 6.4 | Preserve and evolve the RTL/bilingual asset-pairing discipline into component-level direction-awareness rather than parallel files |
| 6.5 | Resolve the dual-Bootstrap-version conflict; remove the unbundled 17-script loading pattern |

## Phase 7 — AI Extension

Per [16_AI_READINESS.md](16_AI_READINESS.md) — sequenced last not because it's low-value, but because it compounds fastest once the CRM/search/RBAC foundations exist for it to plug into.

| # | Item |
|---|---|
| 7.1 | Phase 0/1 hardening of `OpenAISeoService` (config-driven key, queue, retry) |
| 7.2 | Extend to Projects |
| 7.3 | Broker Assistant v1 (reply drafting) |
| 7.4 | Market Insights / Price Estimation (only after the price-history/numeric-schema prerequisites from Phase 5) |
| 7.5 | Fraud Detection — explicitly held until after Phase 1.2 (Nafath signature fix), per the risk sequencing in [16_AI_READINESS.md](16_AI_READINESS.md) §4 |

---

## Cross-phase priority matrix (top 15)

| Rank | Item | Phase | Effort | Value |
|---|---|---|---|---|
| 1 | Resolve checkout/dependency inconsistency | 0 | Low-Medium | Blocks confidence in everything else |
| 2 | Remove hardcoded password + OTP bypasses (incl. seeder regression) | 1 | Low | Critical |
| 3 | Verify Nafath JWT signature | 1 | Medium | Critical + unlocks trust-differentiation story |
| 4 | Fix HyperPay TLS + Tabby fulfilment | 1 | Low-Medium | Critical |
| 5 | Fix `FavoriteService` IDOR | 1 | Low | Critical |
| 6 | Fix lead-notification misrouting bug | 2 | Low | High, near-zero cost |
| 7 | Admin authorization gaps + audit logging | 1 | Low-Medium | High |
| 8 | Build real RBAC (Policies + role templates) | 3 | High | Highest competitive leverage in this entire assessment |
| 9 | Wire review/rating UI | 2 | Low-Medium | High value, low effort |
| 10 | Finish `PropertyRequestOffer` accept flow | 2 | Medium | Completes a designed-but-abandoned feature |
| 11 | Two-way messaging for CRM | 4 | High | Highest CRM-specific value |
| 12 | Real search/relevance engine | 5 | High | Highest-traffic surface |
| 13 | Wire up Tailwind + real design tokens | 6 | Medium | Foundation for everything visual in the next-gen system |
| 14 | AI Search + Property Description → Projects | 7 | Low-Medium | Extends the one confirmed AI lead over both competitors |
| 15 | Numeric price-column migration | 5 | Medium | Unlocks correct search sort AND future Price Estimation |

## What this priority order deliberately does NOT do

It does not recommend starting the next-generation Broker OS build before Phases 0–1 are resolved on the current platform (or explicitly, consciously decided against as out of scope for the current codebase if the business chooses a clean-slate rebuild instead). Per the master assessment's brief, this document is an input to that later design decision, not the decision itself — see [14_KEEP_IMPROVE_REMOVE.md](14_KEEP_IMPROVE_REMOVE.md) for what should be kept, redesigned, or replaced regardless of which path (harden-then-extend vs. clean-slate) is chosen.
</content>
