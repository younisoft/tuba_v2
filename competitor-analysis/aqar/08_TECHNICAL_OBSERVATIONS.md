# Technical Observations

Values marked `[Network-verified]` come directly from the browser's own network request log during this audit. Everything else is inference from observed behavior, marked `[Inferred]`. No write/mutating request was ever inspected or issued beyond the normal page loads this audit's navigation generated.

## Frontend architecture `[Network-verified + Inferred]`

- Requests of the form `GET https://sa.aqar.fm/en?_rsc=<hash>` were observed, which is the React Server Components fetch signature used by **Next.js App Router**. `[Inferred]` Aqar's frontend is very likely a Next.js application using server-side rendering/RSC rather than a pure client-side SPA — consistent with pages rendering fully-formed on load with no visible loading skeleton in most cases (see `04_PAGE_ANALYSIS.md`).
- Static assets are served from a dedicated subdomain, `assets.aqar.fm` `[Network-verified]` (e.g., `assets.aqar.fm/icons/v2/map-pin.svg`) — a versioned (`v2`) shared icon path, implying a maintained, versioned design-asset pipeline rather than ad hoc per-page assets.
- A Cloudflare Real User Monitoring beacon (`POST sa.aqar.fm/cdn-cgi/rum`) fires on page load `[Network-verified]` — indicates the site sits behind Cloudflare and uses its RUM product for real-world performance monitoring (Core Web Vitals-style telemetry), separate from the third-party analytics stack below.

## API architecture `[Network-verified]`

Two distinct GraphQL endpoints were observed, not one:

- `POST /graphql` — used for general/public data (e.g., marketplace content).
- `POST /auth-graphql` — used specifically for authenticated, user-scoped operations; multiple calls to this endpoint were observed in immediate succession while loading the account drawer and Office Management dashboard, consistent with per-widget or per-section data fetching rather than a single consolidated query.

Alongside GraphQL, a set of plain REST-style "Next API" routes were also observed, used for smaller, mostly-static reference data:

- `GET /next-api/cities` — city reference list (powers city dropdowns/filters, e.g., in the District Broker bid flow and marketplace filters).
- `GET /next-api/config/specs` — configuration/specification reference data (likely powers property-type/spec dropdowns).

**Architectural read `[Inferred]`**: the split between a public `/graphql` endpoint and a separate `/auth-graphql` endpoint for anything requiring the logged-in session is a clean, deliberate separation of concerns — it means authenticated broker operations are not routed through the same resolver surface as anonymous marketplace browsing, which is a reasonable security/scaling boundary. The REST-style `/next-api/*` routes for small reference datasets (cities, specs) alongside GraphQL for everything else suggests these were added as lightweight, cacheable endpoints rather than modeled as GraphQL queries — a pragmatic, if slightly inconsistent, API surface.

## Analytics & third-party instrumentation `[Network-verified]`

The following third-party trackers were observed firing on **`/offices-management`** — an authenticated, non-marketing, operational broker back-office screen, not a public landing page:

- **Google Analytics 4** (`analytics.google.com/g/collect`, measurement ID `G-8DTTM22D6F`) — full page-view event including page title, referrer, screen resolution, and a long list of active Google "experiment" IDs (`tag_exp` parameter carried 8+ distinct experiment IDs in a single hit).
- **Google Ads conversion tracking** (`google.com/ccm/collect`, `ad.doubleclick.net/ccm/s/collect`) — conversion-attribution beacons, the kind normally reserved for acquisition/checkout funnels, firing on an internal operations page.
- **Snapchat Pixel** (`tr.snapchat.com/p`).
- **LinkedIn Insight Tag** (`px.ads.linkedin.com/attribution_trigger`, `px.ads.linkedin.com/wa/`).
- **Microsoft Clarity** (`z.clarity.ms/collect`) — fired repeatedly (6+ times in a single page session observed), consistent with continuous session-replay/heatmap recording rather than a single page-view ping.

**Observation, stated plainly**: this is an acquisition/marketing analytics stack (ad-conversion pixels + session recording) instrumented on a page a broker only reaches *after* logging in to manage their own paid subscription, wallet, team, and invoices. `[Inferred]` This is most plausibly explained by the marketing tag manager being deployed site-wide (a single Google Tag Manager container covering both the public marketplace and the authenticated console) rather than a deliberate choice to track broker back-office behavior for ad attribution specifically — but the practical effect is the same regardless of intent: broker operational activity is visible to Google/Snapchat/LinkedIn/Microsoft Clarity's tracking infrastructure. This is worth explicit scrutiny for Tuba's own architecture (see `12_AI_OPPORTUNITIES.md` and the final synthesis) — a professional back-office product should not, by default, ship consumer ad-attribution pixels on authenticated operational screens.

## Authentication `[Observed]`

- Phone-number + OTP login (`+966` prefix, local number entry), no password field observed at any point.
- The account drawer distinguishes a **personal profile** identity from a **business/establishment** identity as two separate switchable entities under one login — i.e., one phone-verified login can represent either "me" or "my company" contextually, rather than the login being tied 1:1 to a single business account.

## Performance observations `[Observed, single-session, not benchmarked]`

- Pages consistently rendered with visible content immediately on navigation with no loading spinner/skeleton state observed for the primary content area across ~25 page loads — consistent with server-rendered HTML rather than a client-fetch-then-render pattern for initial paint.
- No infinite-scroll or pagination control was exercised on the public marketplace/projects grids in this pass (not enough distinct pages were loaded to observe pagination behavior) — flagged as **not assessed**.
- No console errors were observed on any page load in this audit; console **warnings** were present on nearly every page (ranging from ~5 to ~95 cumulative across a session), but their content was not enumerated in this pass — flagged as a gap, not a claim that the warnings are benign.

## Error handling `[Observed]`

- No error state (form-validation error, network-failure banner, 404/500 page) was directly triggered or observed during this audit, since every flow either completed successfully to its next legitimate step or was intentionally stopped before a submission that would have required fabricated data or a real payment. This is a genuine coverage gap: **error-state UX is entirely unassessed** in this document.

## Comparison note vs. Bayut

The existing Bayut audit (`product-audit/31_API_ARCHITECTURE_INFERENCE.md`, `33_PERFORMANCE_ARCHITECTURE.md`) documents Bayut Profolio's own network-verified architecture separately; a direct side-by-side comparison of the two platforms' backend stacks was not re-derived here to avoid restating unverified claims about Bayut from memory. The one architecturally comparable and directly verifiable finding across both audits' methods is that **both products' authenticated back-office areas were reachable and inspectable via standard browser DevTools/network logs with no anti-automation friction observed** — neither product appears to specifically harden its broker console against this class of read-only inspection.
