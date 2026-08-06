# 10 — Search Experience

`tbos-definition/12_SEARCH_STRATEGY.md` defines the product strategy for every search type (fixed input). `02_NAVIGATION_BLUEPRINT.md` §6 defines search's role as primary navigation. This document makes both concrete: how each named search surface actually behaves, screen by screen, including zero-result handling — per the master prompt's Phase 10 requirement.

## 1. Global Search (GS-01)

The umbrella surface — spans every entity, RBAC-scoped, ranked by relevance+recency together. Full screen spec: [04](04_SCREEN_INVENTORY.md) GS-01. Every entity-specific search below (Property, Lead, Customer, etc.) is either (a) Global Search filtered to one type, or (b) a module list's local search box — both hit the same underlying index, never a separate search implementation, per the reuse discipline in [05_COMPONENT_MAPPING.md](05_COMPONENT_MAPPING.md).

## 2. Property Search

- **Where it lives**: PROP-01's search/filter bar (module-scoped), and as a filterable result type within GS-01.
- **Behavior**: keyword + structured filters (district, price range, type, status) combined; a keyword query and a filter selection compose (AND), never conflict.
- **Distinct from the public marketplace's property search**: this is broker-facing, searching the broker's/agency's own inventory — not the consumer-facing map search on Tuba's public site (`tuba-current-state/02_PRODUCT_INVENTORY.md`), which is a KEEP, out of this blueprint's scope (broker-side only).
- **Zero-result handling**: if filters are too narrow, suggests the nearest broadening (e.g., "no matches in this district — 4 matches if you remove the price filter").

## 3. Lead Search

- **Where it lives**: LEAD-01/02's search bar, GS-01 filtered to Leads.
- **Behavior**: searches contact name/phone/email, message content, and linked property — RBAC-scoped so a Property Consultant's search never surfaces another consultant's private lead (binding rule from `12_SEARCH_STRATEGY.md`).
- **Zero-result handling**: "no leads match — check spelling, or this contact may not have reached out yet" with a direct "Add Lead" (QA-01) affordance, never a dead end.

## 4. Customer Search

- **Where it lives**: CUST-01's search bar, GS-01 filtered to Customers.
- **Behavior**: same pattern as Lead Search; also surfaces near-duplicate matches inline as a courtesy during search (feeds awareness even outside the formal Duplicate Detection AI capability at creation time).
- **Zero-result handling**: same pattern as Lead Search, offering "Add Customer" or "search Leads instead" (a customer's history often starts as a lead).

## 5. Owner / Contract Search

- **Where it lives**: OWN-01 and CONT-01 search bars, GS-01 filtered respectively.
- **Behavior**: same composable keyword+filter pattern; Contract search additionally supports searching by contract stage and linked party name.
- **Zero-result handling**: same pattern, module-appropriate CTA (Add Owner / view Leads pipeline for pending deals).

## 6. Command Search (CMD-01)

- Full spec: [02_NAVIGATION_BLUEPRINT.md](02_NAVIGATION_BLUEPRINT.md) §8. Restated here only for completeness of the search-type inventory: same surface as GS-01, `>` prefix switches to command mode, RBAC- and context-scoped.
- **Zero-result handling**: an invalid command shows the nearest valid commands (fuzzy match), never a bare "command not found."

## 7. Natural Language Search

- **Where it lives**: any Global/entity search box — not a separate input.
- **Behavior**: triggers automatically when a query doesn't match a literal keyword/filter pattern (e.g., "villas near a good school in a quiet neighborhood in Riyadh"), per `12_SEARCH_STRATEGY.md`'s two-scope split (thin NL-parsing layer vs. underlying semantic engine). The parsed filters are shown transparently above the results ("Searching: Riyadh, Villa, near: schools, quiet") so the broker can adjust rather than wonder what happened.
- **Zero-result handling**: if the NL parse produces filters with zero matches, the system offers the parse itself as adjustable filters rather than only a text apology — turns a dead end into a starting point.

## 8. Arabic Search

- **Where it lives**: every search surface above — not a separate mode, a quality bar applying to all of them.
- **Behavior**: full-fidelity matching across diacritics, spelling variants, and mixed Arabic/English queries (e.g. "فيلا Riyadh") — must not regress behind the current platform's localization strength (58/100 self-audit score, `tuba-current-state/`), i.e. this is a floor, not a stretch goal.
- **Zero-result handling**: before declaring zero results, the engine attempts diacritic-stripped and transliteration-normalized variants of the same query — a literal zero-result state should be rare for genuinely present data.

## 9. Semantic Search

- **Where it lives**: Property/Project search primarily (attribute-based semantic matching — "quiet neighborhood," "near a good school" against structured amenity/district data), part of the same NL pipeline as §7.
- **Behavior**: matches structured attributes even without literal text match; every semantic result states why it matched (Explainability applied to search, per `12_SEARCH_STRATEGY.md`).
- **Zero-result handling**: same as NL Search §7 — offers the interpreted criteria as adjustable.

## 10. Geo Search

- **Where it lives**: map-based property search — explicitly a KEEP per `tuba-current-state/14_KEEP_IMPROVE_REMOVE.md` (only the query engine underneath is replaced, not the interaction design: debounced re-fetch, stale-response discarding, shareable map-state URLs).
- **Behavior**: unchanged interaction pattern from the current platform's map search, now backed by the real search-engine replacement (`12_SEARCH_STRATEGY.md`).
- **Zero-result handling**: expands the visible radius/suggests the nearest populated area rather than an empty map with no guidance.

## 11. Voice Search

- **Where it lives**: mobile Search tab (GS-01), prioritized for mobile per `12_SEARCH_STRATEGY.md` (typing Arabic criteria is higher friction than speaking on a small screen).
- **Behavior**: alternate entry method into the same NL pipeline (§7) — not a separate feature/logic path. Transcribed text populates the search box exactly as if typed, so the broker sees and can correct the transcription before it's submitted.
- **Zero-result handling**: same as NL Search §7; additionally, a failed transcription falls back to the text input with a "try typing instead" message, never a dead end on transcription failure alone.

## 12. Recent Searches

- **Where it lives**: shown when GS-01/CMD-01 is opened with an empty query, per search surface.
- **Behavior**: last N queries (module-scoped where the search was module-scoped, global where it was global), tappable to re-run instantly.
- **Zero-result handling**: N/A (this is a pre-query state, not a result state).

## 13. Saved Searches

- **Where it lives**: any list/search screen's "Save this search" affordance; managed from GS-01's saved-searches view.
- **Behavior**: a **live subscription**, not a stored-but-static filter — new matches generate a notification (Digest channel, per [09_NOTIFICATION_BLUEPRINT.md](09_NOTIFICATION_BLUEPRINT.md)) and a Today entry. This is the direct fix for the current platform's confirmed defect (`SavedSearch` stores criteria but never re-runs) and one of the highest ROI-per-effort items identified in `12_SEARCH_STRATEGY.md`.
- **Zero-result handling**: a saved search with zero matches since creation shows "no matches yet — we'll notify you the moment one appears," never presented as if broken.

## 14. Search Suggestions

- **Where it lives**: as-you-type, on every search surface above.
- **Behavior**: suggests entities (not just query completions) — typing a partial name surfaces the matching Lead/Property/Owner directly as a selectable suggestion before the broker finishes typing or hits enter, reducing full-search round trips for the common "I know exactly what I'm looking for" case.
- **RBAC**: suggestions are scoped identically to full results — never a preview leak of a record the user couldn't otherwise open.

## 15. Zero-result handling — cross-cutting rule

Restated once, applying to every search type above (avoids duplicating the same rule 12 times, per [00](00_IMPLEMENTATION_BLUEPRINT.md)'s reuse discipline): **a bare "no results" message never ships.** Every zero-result state does at least one of: broadens/suggests the nearest match, offers the parsed interpretation as adjustable, or offers a direct creation action (Add Lead / Add Property / etc.) relevant to what was searched — matching Design Principle "Empty states" applied specifically to search.
