# Architecture Summary

One-page synthesis of Phase 2. Full detail lives in the linked documents; this page is the entry point.

## What Profolio actually is

A supply-side operations console for a real-estate marketplace, not a standalone CRM — every module ultimately serves keeping licensed inventory current, paid, and high-quality on Bayut's own consumer marketplace. Full reasoning in [[28_PRODUCT_PHILOSOPHY]].

## How it's built (confirmed, not guessed)

- **Frontend**: SPA on Ant Design + a custom "styleProfolio" theme, brand teal `#006169`, `Figtree`/`Droid Arabic Kufi` typography — real values, DOM-sampled. Full token set in [[25_DESIGN_SYSTEM_AUDIT]] and [[39_DESIGN_TOKENS.json]].
- **Auth**: Keycloak OIDC, session bridged through a first-party endpoint, token refresh gated behind a bot-challenge ("Humbucker") — this coupling is the most likely root cause of the `Failed to fetch` reliability issue found earlier in the audit. Full detail in [[31_API_ARCHITECTURE_INFERENCE]].
- **Business API**: one gateway host (`legion.bayut.sa/api/surge/*`) fronting Rails/Ransack-flavored services named `lms` (leads), `ovation` (agent scoring/TruBroker), and the base `surge` namespace (listings, credits, users). Server-side filtering, date-range, and `group_by` aggregation confirmed directly from network calls.
- **Analytics/engagement**: GA4 with rich custom dimensions (package tier, agency ID, is-package-user) + MoEngage for push/lifecycle messaging — Bayut's internal analytics are visibly more capable than what's exposed back to the paying agency in Reports.

## The data model in one paragraph

Listing is the center of gravity; License and Credit Balance gate whether a Listing can be Active; Leads and Agent Performance/TruBroker are both **derived** from Listing + interaction data, not independent primary sources; Reports is a rollup of the same. Full ER diagram in [[23_DATA_MODEL]], dependency graph in [[32_FEATURE_DEPENDENCY_GRAPH]].

## The one-sentence UX finding that recurs everywhere

**The product measures and computes far more than it discloses** — TruBroker badges show scores but not thresholds, Draft listings show they're blocked but not by how much, license expiry and its listing consequences live on two disconnected screens. Fixing disclosure, not adding new data collection, is Tuba's cheapest path to a visibly better product. This finding threads through [[26_UX_PATTERN_LIBRARY]], [[29_USER_JOURNEYS]], and every P0 item in [[30_TUBA_NEXT_GENERATION_SPEC]].

## Where governance is thin

Exactly two access-control primitives exist agency-wide (per-staff credit limit, binary license-sharing toggle); no role picker, no audit log, confirmed on a single-seat account so genuinely untested at multi-role scale. Full matrix in [[27_PERMISSION_MATRIX]].

## What Tuba should build, in order

1. Unified listing-status handling + license-expiry linkage (cheap, fixes the most-cited weakness)
2. TruBroker-equivalent gamification **with disclosed thresholds** (cheapest high-leverage AI-assisted feature)
3. Lead pipeline + scoring (highest ceiling, highest effort — resource accordingly)
4. Role-based permissions + audit log (needed once Tuba has real multi-seat customers)
5. Reporting as a genuinely distinct module, not a dashboard mirror

Full roadmap with phasing in [[35_PRODUCT_ROADMAP]]; full per-feature current-vs-recommended spec in [[30_TUBA_NEXT_GENERATION_SPEC]]; all diagrams consolidated in [[40_MERMAID_DIAGRAMS]].

## Confidence map

| Area | Confidence | Why |
| --- | --- | --- |
| Design tokens (color/type/radius) | High | DOM-sampled via `getComputedStyle`, not screenshot-estimated |
| API/service architecture | High | Read directly from the browser's network log (URLs, methods, status codes) |
| Data model / entities | Medium-High | Every field observed in UI; some relationships (Lead↔Listing cardinality, Media) inferred |
| Permission model beyond Owner | Low | Single-seat account — no second role was ever tested |
| Write-path API behavior | Untested | No create/update/delete call was exercised, by design, to avoid mutating the live account |
