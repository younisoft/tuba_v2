# API Architecture (Reverse-Engineered)

Unlike most sections in this project, this one is substantially **`[Observed]`**, not inferred: it's built from the browser's own network log during the read-only capture session (URLs, HTTP methods, and status codes only — no request/response bodies, headers, or tokens were inspected or recorded). No endpoint listed here was invented; each was actually called by the production Profolio frontend during normal navigation.

## Service topology `[Observed]`

Profolio is not one monolith — it's a frontend that composes calls to at least four distinct backend surfaces:

| Host | Role | Evidence |
| --- | --- | --- |
| `auth.bayut.sa` | Identity provider (Keycloak) | `POST /auth/realms/bayut-sa/protocol/openid-connect/token` |
| `www.bayut.sa` | Session/cookie bridge + bot-defense | `POST /api/keycloak/session`, `GET/POST /.humbucker/challenge/js/*` |
| `legion.bayut.sa` | Core Profolio business API | `GET/POST /api/surge/*` (see resource list below) |
| `profolio.bayut.sa` | SPA host only | serves the frontend application itself |
| `analytics.google.com`, `sdk-01.moengage.com` | Third-party analytics/engagement | GA4 + MoEngage SDK calls |

This is a **BFF-adjacent / API-gateway pattern**: the SPA talks to one internal API host (`legion.bayut.sa`) under a consistent `/api/surge/` prefix, with authentication fully delegated to a separate Keycloak realm (`bayut-sa`) rather than handled by the business API itself. `[Observed]`

## Authentication & session flow `[Observed]`

1. `POST auth.bayut.sa/.../openid-connect/token` — OAuth2/OIDC token exchange against Keycloak.
2. `POST www.bayut.sa/api/keycloak/session` — the SPA hands the token to a first-party session endpoint, which sets/refreshes a session cookie.
3. On session/token expiry, the *first* retry of step 2 returned **HTTP 401**, which triggered a **bot-challenge round-trip** before retrying: `GET /.humbucker/challenge/js/generate/script` → `POST /.humbucker/challenge/js/validate` → `POST /api/keycloak/session` (succeeds, 200) → re-fetch `GET legion.bayut.sa/api/surge/users/current`.

This full sequence was captured **twice** in one session, both ending in success after the challenge step. `[Observed]` This tells us two concrete things: (a) token refresh is coupled to a proof-of-work/bot-defense layer named "Humbucker" (custom or vendor-branded — not identifiable further from the network log alone), and (b) this coupling is the most likely explanation for the intermittent `Failed to fetch` errors noted elsewhere in this audit on direct route refreshes — a refresh that races the challenge round-trip could plausibly fail client-side before the retry completes. `[Inferred from the timing correlation, not proven]`

## Business API resource map (`legion.bayut.sa/api/surge/`) `[Observed]`

| Endpoint (path + observed query params) | Maps to product surface |
| --- | --- |
| `GET /users/current` | Current session user (called repeatedly — likely a cheap identity check on route change) |
| `GET /users/{id}` | User profile detail |
| `GET /notifications?page=N&q[user_id_eq]={id}` | Notifications panel, paginated |
| `GET /notifications/stats` | Notification bell badge count |
| `GET /languages` | Language dropdown (User Settings) |
| `GET /area_units` | Property area unit options (Sq. M. etc.) |
| `GET /experience_list` | "Years of Experience" dropdown (User Settings) |
| `GET /agencies/{id}` | Agency Settings |
| `GET /products` | Package/tier catalog (Credits & Packages) |
| `GET /credits/summary?platform_id[]=1` | Credit Balance widget |
| `GET /listings/summary` | Listings composition counts (Dashboard, Reports) |
| `GET /listings` | My Listings table |
| `GET /dashboard/listing_stats` | Dashboard performance widget |
| `GET /lms/leads/stats` | TruLeads summary counters (Total Leads, TruLeads, Bayut Match) |
| `GET /lms/stats/product_stats?...group_by[]=date&group_by[]=ad_product` | Reports Summary time series, grouped server-side |
| `GET /lms/stats/phone_lead_stats?...` | Call Insights widget |
| `GET /ovation/stats?...user_external_ids[]=...&ad_external_ids[]=...` | Agent Performance / TruBroker scoring (per-listing, per-user) |
| `GET /ovation/stats/trends?...` | Agent Performance trend data |
| `GET /ovation/stats/product_stats?...` | Agent Performance per-product-tier breakdown |

**Naming reveals internal service boundaries `[Observed, interpreted]`**: `lms` = Lead Management System (backs TruLeads), `ovation` = the reputation/scoring service backing Agent Performance/TruBroker (an evocative internal codename, not a public product name), `surge` = the umbrella API namespace all of the above sit under.

## Query conventions `[Observed]`

- **Ransack-style filter params**: `q[user_id_eq]=120909` on the notifications endpoint is the Ransack gem's exact query syntax (`{attribute}_{predicate}`). This is strong, specific evidence the backend (or at least this service) is **Ruby on Rails**, not just "some REST API." `[Observed, high-confidence inference from syntax]`
- **Array-bracket params** for multi-value filters: `agency_external_ids[]=...`, `category_ids[]=1&category_ids[]=2`, `ad_external_ids[]=88087735&ad_external_ids[]=88087716...` (ten individual listing IDs passed as repeated query params to fetch aggregate stats for exactly the agency's own active listing set).
- **Explicit date-range params** (`start_date`/`end_date` or `start_datetime`/`end_datetime`) rather than a relative-range enum — the frontend resolves "Last 30 Days" to concrete ISO dates before calling the API.
- **`group_by[]` as a query param**, letting the frontend request server-side aggregation (`group_by[]=date&group_by[]=ad_product`) instead of aggregating raw rows client-side — a reasonable, scalable design choice.

## Analytics & engagement layer `[Observed]`

- **Google Analytics 4** (`G-RMY7YXCJN2`) fires on every page view and scroll-depth milestone, with a *rich custom parameter set* baked into events: `ep.website_section=profolio`, `ep.page_group`, `ep.page_type`, `ep.interacted_from` (e.g. `side_bar`), `ep.package_type` (`bronze-yearly`), `epn.package_duration`, `ep.is_agency`, `epn.agency_id`, `ep.agency_name`, `ep.is_package_user`. This means Bayut's product analytics can slice engagement by package tier and agency identity out of the box — a materially more advanced analytics instrumentation than anything exposed to the agency user themselves in Reports Summary.
- **MoEngage** (`sdk-01.moengage.com`) — a customer-engagement/push-notification platform — is initialized on load (`websdksettings`, `sdkconfig/web`), most likely the delivery mechanism behind the marketing-flavored Notifications items ("Upgrade your listings!", TruBroker nudges) observed in the UX audit.

## What this confirms vs. what remains inferred

**Confirmed by direct network evidence**: OIDC/Keycloak auth, a bot-challenge gate on token refresh, a single REST-ish API gateway host, Rails/Ransack-flavored query conventions, server-side date-range and group-by aggregation, GA4 + MoEngage as the analytics/engagement stack, and the `lms`/`ovation`/`surge` internal service naming.

**Still inferred, not confirmed** `[Inferred]`: the write-path APIs (create/update listing, spend credits, invite staff) were never exercised in this audit (deliberately, to avoid mutating the account), so POST/PUT/PATCH/DELETE request shapes are unknown. Standard REST verb conventions are assumed for a Recommended Tuba design, not copied from an observed Bayut write call.

## Recommendation for Tuba

1. Mirror the **separation of identity (OIDC) from business API** — it's a sound pattern independent of Bayut's specific vendor choices.
2. Mirror **server-side aggregation with `group_by`** for time-series/report endpoints — avoids shipping raw rows to the client for charting.
3. Do **not** mirror coupling token refresh to a synchronous bot-challenge round-trip on the critical path of every page load — this is the most likely root cause of Bayut's own `Failed to fetch` reliability issue observed in this audit; Tuba should keep bot-defense off the token-refresh hot path (e.g. gate it at login only, or run it asynchronously).
4. Build the agency-facing Reports module on top of the *same* depth of aggregation Bayut already proves is possible internally (rich GA4 event dimensions, ovation/lms stats grouped by date and product) — Bayut is already collecting this shape of data for itself; Tuba's opportunity is exposing an equivalent to the paying customer, not re-inventing the aggregation.
