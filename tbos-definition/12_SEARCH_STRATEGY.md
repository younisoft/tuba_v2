# 12 — Search Strategy

**Status**: Recommended. Defines the ideal search experience across TBOS. This is a product-strategy document, not an infrastructure spec — the underlying search-engine replacement (Elasticsearch/Meilisearch/Algolia-class, replacing Tuba's current unindexed Eloquent scope chain) is a `tuba-current-state/13_GAP_ANALYSIS.md`/`17_IMPLEMENTATION_PRIORITIES.md` engineering item this document assumes exists, then defines what it should feel like to use.

---

## Why search is strategic, not a feature

Tuba's current platform's highest-traffic page runs on a ~150-line Eloquent scope chain with no relevance ranking and an un-indexable string price column (`tuba-current-state/13_GAP_ANALYSIS.md`), and its one entity-heavy filter screen resorts to a several-hundred-option flat dropdown because there's no search-first alternative (`tuba-current-state/04_PAGE_ANALYSIS.md`). TBOS treats search as the primary navigation method for any list beyond a handful of items (`08_NAVIGATION_SYSTEM.md`), which means search quality is not a nice-to-have — it's load-bearing for the entire IA.

## Global Search

One search surface, reachable from anywhere (`08_NAVIGATION_SYSTEM.md`), spanning every entity in `07_INFORMATION_ARCHITECTURE.md`'s tree — Properties, Projects, Leads, Customers, Owners, Contracts — ranked by relevance and recency together, not siloed per module. A broker should never need to know *which module* something lives in to find it.

## Semantic Search

Beyond keyword matching — "villa near a good school in a quiet neighborhood" should return relevant results even if no listing's text contains those exact words, matched against structured attributes (amenities, district characteristics) the way `tuba-current-state/16_AI_READINESS.md`'s AI Search opportunity describes. This is the natural-language layer sitting on top of a real relevance engine, not a replacement for one.

## Arabic Search

Full-fidelity Arabic-language search — correct handling of diacritics, common spelling variants, and mixed Arabic/English queries (a broker searching "فيلا Riyadh" should work). This is a genuine area of existing strength worth protecting: Tuba's current platform's Localization score is its second-highest sub-score in the July self-audit (58/100), built on real RTL/bilingual asset-pairing discipline (`tuba-current-state/09_DESIGN_SYSTEM.md`) — search must not regress behind that existing investment.

## Geo Search

Map-based and radius/district search — Tuba's current platform's map-search *interaction design* (debounced re-fetch, stale-response discarding, shareable map-state URLs) is explicitly named a strength to carry forward as-is in `tuba-current-state/14_KEEP_IMPROVE_REMOVE.md` (KEEP), even though the query engine underneath it must be replaced. TBOS's geo search preserves that interaction pattern.

## AI Search

Natural-language-to-structured-query translation (`10_AI_STRATEGY.md`) — "show me 3-bedroom villas under 2M SAR in Jeddah with a pool" parsed into the same structured filters the manual filter UI produces, not a separate code path. Two distinct scopes worth keeping separate in implementation: the NL-parsing layer (thin, ships fast) and the underlying relevance/semantic engine (the real infrastructure investment) — exactly the sequencing `tuba-current-state/16_AI_READINESS.md` recommends.

## Recent Searches / Saved Searches

Every search a broker runs is recoverable — recent searches surface on next visit to the search surface; any search can be explicitly saved. Saved searches are not inert: unlike Tuba's current platform, where `SavedSearch` stores filter criteria but nothing ever re-runs it against new listings (`tuba-current-state/02_PRODUCT_INVENTORY.md`), TBOS's saved searches are a live subscription — new matches generate a notification (`13_NOTIFICATION_STRATEGY.md`) and a Today entry. This single fix — making an already-half-built feature actually work — is one of the highest ROI-per-effort items identified anywhere in the current-state assessment.

## Voice Search

Voice input as an alternate entry method into the same AI Search pipeline, prioritized for mobile (where typing Arabic property criteria is higher-friction than speaking it) — not a separate feature with its own logic.

## Natural Language Search

Treated as the same capability as AI Search above, not a separate mode — the distinction in this document is purely to enumerate the requested capability list explicitly; the implementation is one NL-understanding layer serving both "AI Search" and "Voice Search" entry points.

## Search result quality principles

- **Every result explains why it matched** when the match isn't obvious (a semantic/AI match, not an exact keyword hit) — the Explainability principle (`14_EXPLAINABILITY_SYSTEM.md`) applied to search specifically.
- **Empty search results are never a bare "no results" message** — per Design Principle "Empty states," a no-match state suggests a broadened query or the nearest available matches, never a dead end.
- **Search respects RBAC scope** (`07_INFORMATION_ARCHITECTURE.md`) — a Property Consultant's search never surfaces another consultant's private lead data, even if the keyword matches.
</content>
