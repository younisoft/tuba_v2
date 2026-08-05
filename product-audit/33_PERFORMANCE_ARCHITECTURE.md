# Performance Architecture

## Loading strategy `[Observed]`

Single-page application; route changes do not trigger a full page reload (confirmed by uninterrupted header/sidebar state across navigations during the capture session). Data for each module loads via dedicated REST calls to `legion.bayut.sa/api/surge/*` rather than one large payload (see [[31_API_ARCHITECTURE_INFERENCE]] for the endpoint map) — i.e. each module fetches only what it needs, a reasonable per-view data-fetching strategy.

## Pagination `[Observed]`

Listings table paginates numerically (1/2/3/4, prev/next) rather than infinite-scrolling. TruLeads similarly paginates (1/2 observed with 14 leads). This is a safe, predictable choice for tabular data but was not tested at scale (the largest observed dataset was 29 Removed listings across roughly 3 pages) — behavior at hundreds or thousands of rows is `[Untested]`.

## Caching `[Inferred, one data point]`

A likely caching or staleness issue was observed directly: two `/en/listings` captures roughly 15 minutes apart returned "Views 33" for a set of listing IDs in one capture and "Views 0" for the identical IDs in the other (see [[13_TECHNICAL_OBSERVATIONS]]). This is consistent with either a short-lived cache serving stale zeros, or a genuine backend metric reset/lag — the network log did not capture response bodies, so the specific mechanism can't be confirmed, only flagged as worth re-testing.

## Search / filtering strategy `[Observed]`

Filters (Listing ID, REGA number, Purpose, Property Type, date ranges) are encoded into the URL query string (e.g. `?f[nested.platform_listings.status.slug]=draft`), and API calls include matching query parameters server-side (`q[user_id_eq]=...`, `agency_external_ids[]=...`). This means filtering is **server-side**, not a client-side filter over an already-fetched dataset — the right choice for a real dataset (29+ removed listings, 14+ leads) even though this account's scale never stress-tested it.

## Chart rendering `[Observed]`

Performance charts (Dashboard, Reports Summary, Agent Performance trends) are fed by dedicated stats endpoints with server-side `group_by[]` aggregation (confirmed for `lms/stats/product_stats` grouped by `date` and `ad_product`) rather than the client aggregating raw event rows. This is good practice — it keeps chart payloads small regardless of the underlying event volume.

## Media loading `[Inferred]`

No media library or upload flow was directly exercised. The listing preview panel showed a placeholder illustration for a 0-photo listing rather than a broken image or a loading spinner, implying at least a basic "no image" fallback state exists. Actual image optimization (responsive sizes, lazy loading, CDN) could not be confirmed from this audit.

## Navigation performance / reliability `[Observed — confirmed, not just noticed]`

Direct route refreshes intermittently produced `TypeError: Failed to fetch`. The API-architecture pass (see [[31_API_ARCHITECTURE_INFERENCE]]) traced this to token-refresh being coupled to a synchronous bot-challenge (Humbucker) round-trip: a `401` on the session endpoint triggers a challenge-generate → challenge-validate → session-retry sequence before any business API call can succeed. A direct refresh that lands mid-expiry has to survive this full round-trip, which is a plausible, evidence-backed root cause for the resilience issue — not a vague "SPA flakiness" observation.

## Large-dataset handling `[Untested]`

Nothing in this audit exercised the product at a scale meaningfully larger than the audited account's own data (12 active listings, 29 removed, 14 leads). Bulk-action absence (see [[26_UX_PATTERN_LIBRARY]]) suggests the product hasn't needed to solve for very large per-agency inventories, but this is a gap in the audit's coverage, not a confirmed architectural limitation.

## Potential bottlenecks `[Inferred, from the evidence above]`

1. **Auth/bot-challenge coupling on the critical path** — the strongest, most specific bottleneck identified, with direct network evidence.
2. **Ovation/lms stats endpoints pass long arrays of IDs as query parameters** (`ad_external_ids[]=...` × 10 for a 12-listing agency) — this will not scale linearly to agencies with hundreds of listings without either pagination of the stats query itself or a move to POST-with-body for large ID sets.
3. **No visible caching layer surfaced to the frontend** (no `ETag`/cache-control behavior was inspectable from the network log at the level captured) — cannot confirm either way, flagged as an open question.

## Recommendations for Tuba

1. Decouple bot/abuse defense from the token-refresh hot path — gate it at login and suspicious-activity triggers, not every session renewal.
2. Keep the server-side filtering + server-side aggregation pattern; it's the right architecture and Bayut already validates it works.
3. Design stats/report endpoints to accept ID sets via request body (not unbounded query-string arrays) from day one, anticipating agencies larger than the one audited here.
4. Add explicit loading/skeleton states and a visible "last updated" timestamp on any metric that might be cached or lagged — the Views-count discrepancy observed here would be far less confusing to an end user with a visible freshness indicator.
