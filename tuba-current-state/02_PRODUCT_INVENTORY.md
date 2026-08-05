# 02 — Product Inventory

**Status**: Observed (source-code read: `routes/web.php`, `routes/api.php`, `app/Http/Controllers/**`, `resources/views/**`, `database/migrations/**`). Live-browser confirmation of the authenticated Broker Dashboard portion is pending (see [18_SCREENSHOT_INDEX.md](18_SCREENSHOT_INDEX.md) once available) — items below marked **[Live-pending]** should be re-confirmed against the running app.

This is a complete enumeration of what exists in the codebase today, organized by surface. It does not judge quality (see [07_UX_AUDIT.md](07_UX_AUDIT.md)/[08_UI_AUDIT.md](08_UI_AUDIT.md)) or maturity (see [05_FEATURE_CATALOG.md](05_FEATURE_CATALOG.md)) — it is the inventory those documents are scored against.

---

## 1. Public marketing / search site (unauthenticated + customer)

| Page/feature | Route(s) | Notes |
|---|---|---|
| Home | `/` | Search box, popular locations, featured listings |
| Buy / Rent / Search listings | `/{buy\|rent\|search}`, `properties/listing` (`all-properties-listing`), `test/properties` | Live implementation is the `test`-named controller methods (`teststatusWiseProperties`, `gettestProperties`) — this is production code, not a placeholder |
| Map search | `map-test`, `map-test-property` | Debounced re-fetch, stale-response discarding, shareable map-state URL — the platform's most carefully-engineered interaction |
| Property detail | `property/{slug}` | Per-property SEO now generic (fixed since July audit) |
| Project detail | `view/project/{slug}` | No SEO data set at all (`viewProjectIndex()`) |
| Project listing/search | *(none found)* | Appears **removed** since the July audit — no route, controller method, or nav link found; only project *detail* pages remain reachable. Flag for live confirmation. |
| Agent public profile | `agent-detail-{id}` | |
| Agent's properties | `agent-properties/{id}/{type}` | |
| Agents directory | `agents-listing-ajax` | |
| Services | `/services` (resource) | |
| Newsroom / blog | `/newsrooms` (resource) | |
| FAQ | `/faq` | |
| Contact us | `/contact` + `contact-store` | reCAPTCHA server-side check commented out |
| About us | `/about-us` | |
| Support center | `/support-center` | |
| Legal pages | `/terms-conditions`, `/privacy-policy`, `/terms-of-advertising`, `/copyright` | |
| Neighborhood page | `/neighborhood` | |
| Featured project details | `/featured-project-details` | |
| Single package (pricing) page | `/single-package` | |
| App download page | `/download` | |
| Favorites | `add-favorite` | Route sits **outside** the authenticated middleware group despite requiring a logged-in user in practice |
| Saved search | `saveFilterSearch`, `deleteRecord` | No match-notification job found — filters are stored but never re-run against new listings |
| Reviews | `review-store` | `codebyray/laravel-review-rateable` installed, `Property`/`User` implement it, but no visible UI wires it up on the dashboard side (`Rating and Reviews` tile hardcoded to `0`) |
| Property enquiry (buyer→agent) | `property-request-forms` (`PropertyRequest`) | Broadcast-style: notifies matched agents (with a routing bug — see below) |
| Direct agent contact | `agent-inbox-property-request` (`AgentInboxRequest`) | One-way; no reply/chat mechanism exists |
| Social login | *(removed)* | `SocialLoginController` + `laravel/socialite` deleted entirely since the July audit |
| Language switch | `change/lang` | Session-based, not URL-based — no `hreflang`, not crawlable per-locale |
| Nafath identity callback | `nafat-callbackurl` (POST, unauthenticated by design) | JWT signature never verified — Critical security finding |
| Google Maps proxy | `google-maps-js` | API key hardcoded in source |

## 2. Agent / Broker self-service dashboard (shares all views/controllers with admin — see [11_TECHNICAL_ARCHITECTURE.md](11_TECHNICAL_ARCHITECTURE.md)) **[Live-pending]**

| Module | Route(s) / controller | Notes |
|---|---|---|
| Dashboard home | `/dashboard` → `admin.agent_dashboard` | Contains hardcoded `0` "Rating and Reviews" tile, decorative chart |
| My Projects | `/agent-projects` | |
| Notifications | `/notifications`, `all/notifications` | Database-only; no email/SMS/push delivery wired to any of the 10 notification classes |
| Profile / account settings | `my-profile`, `account-setting`, `agent-agency-settings-update` | |
| Nafath verification | `/nafath-verification` | |
| FAL license | `agent-falLicense-update` | Manual staff review only, no OCR/extraction |
| Properties CRUD | `Route::resource('properties', ...)` + AJAX listing, media upload, AI description generation, floor description, advertisement license | Dual form UI still exists (`old_edit` via `?chk=1`) |
| Projects CRUD | `Route::resource('project', ...)` + unit add/update/delete | |
| Property requests (leads, buy/rent/sell) | `Route::resource('property-requests', ...)`, `agent-inbox` | Flat, non-threaded, one-way; `PropertyRequestOffer` accept-flow fields exist but are never populated |
| Packages / license packages / single packages | `agent-packages`, `agent-license-packages`, `developer-packages`, `package-detials/{id?}` | `developer-packages` route now resolves to a static view — the underlying `DeveloperPackage` model/catalog no longer exists in this checkout |
| Payment / billing | `Route::resource('payment', ...)`, HyperPay + Tabby checkout, receipt download/print | Tabby fulfilment is a Critical, unauthenticated free-entitlement risk; receipt PDF service depends on `barryvdh/laravel-dompdf`, which is not installed in this checkout |
| Sub-user (Agent User) management | `Route::resource('agent-users', ...)` | New sub-users get the platform's universal hardcoded password |
| Favorites | `Route::resource('favorites', ...)` | Shares the IDOR-vulnerable `deleteRecord` path |
| Analytics / reporting | Rent Now Click Report (`AgentController@paymentHistories` area) | The **one** real, non-decorative analytics screen in the platform |

## 3. Internal Admin CMS (same controllers/views as the Agent dashboard, gated by role)

| Module | Route(s) | Notes |
|---|---|---|
| Roles & permissions | `Route::resource('roles', ...)` | No protection against deleting core role IDs 2/3/4 |
| Ban numbers | `Route::resource('ban-numbers', ...)` + Excel import | Import depends on `maatwebsite/excel`, not installed in this checkout |
| Reference data | Countries, Regions, Cities, Districts, Categories, Property Types (all `Route::resource`) | 5 of these have **no permission middleware**, `auth` only |
| Contact-Us submissions | `Route::resource('contact-us', ...)` | Only `index` is permission-gated |
| Page SEO | `Route::resource('page-seo', ...)` | `create`/`store`/`show`/`destroy` are empty stubs |
| FAQs | `Route::resource('faqs', ...)` | |
| Agents (staff view) | `Route::resource('agents', ...)`, `changeUserStatus`, `payment-histories` | |
| Users (customers) | `Route::resource('users', ...)` | |
| Newsrooms (admin) | `Route::resource('admin-newsrooms', ...)` | |
| Services (admin) | `Route::resource('admin-services', ...)` | |
| Property service requests | `Route::resource('property-service-requests', ...)` | `create/store/show/edit/update/destroy` are all empty method bodies — only `index()` implemented |
| Property services (settings) | `Route::resource('property-services', ...)` | |
| Packages / License packages / Single packages (catalog admin) | `Route::resource(...)` ×3 | Sidebar links for these are permanently invisible to non-SuperAdmin roles due to a permission-name mismatch |

## 4. Mobile REST API (Sanctum, backs a shipped Agent app + partial User/customer app)

| Surface | Prefix | Notes |
|---|---|---|
| Employee/Government integration | (root) | `rega-notifications` (fully unauthenticated `Route::any`), `store-property-data` (`eskan.verify.apis` middleware), `add-verficiation`/`check-verficiation-status` |
| Customer app | `/user/*` | Register/login/2FA, profile, favorites, saved search, reviews, notifications, property/project browse, map search, agent directory, single-agent view, lead submission |
| Agent app | `/agent/*` | Register/login/2FA, profile, account/preference settings, property requests, advertisement-validator, packages listing, active package, property CRUD (resource), sub-user (agents-users) CRUD, favorites, package deduction, agent inbox, FAL license store |
| Shared | `/api/user` (Sanctum `auth:sanctum`) | Basic authenticated user info |

No `/api/v1/` versioning exists. No effective rate limiting on any API route (the Kernel-defined `throttle:api` rule is dead code under the current bootstrap — see [11_TECHNICAL_ARCHITECTURE.md](11_TECHNICAL_ARCHITECTURE.md)). Sanctum tokens never expire.

## 5. Integrations inventory

| Integration | Purpose | State |
|---|---|---|
| REGA (Real Estate General Authority) | Ad-license validation, ETL into `Property` | Live, functioning |
| Nafath | National digital identity verification | Live, but callback signature never verified (Critical) |
| FAL | Brokerage license verification | Live, manual document review only |
| HyperPay | Card/Mada payments | Live, TLS verification disabled (Critical) |
| Tabby | BNPL payments | Live, unauthenticated fulfilment path (Critical) |
| OpenAI (Responses API, `gpt-5.4-mini`) | SEO metadata + description generation | Live, Property-only, synchronous, no retry/backoff |
| Google Maps | Map rendering, geocoding | Live, API key hardcoded in source |
| Taqnyat | SMS/OTP delivery | Live, bearer token hardcoded in source |
| Pusher | Real-time notification delivery | Wired but broadcasting on a public (non-private) channel |
| Rize | Rent-now partner click-through | Live, sandbox key referenced in production per prior audit (unconfirmed this pass) |

## 6. What does NOT exist (codebase-confirmed absence)

- Dedicated search/relevance engine (Elasticsearch/Algolia/Meilisearch-class) — search is a ~150-line Eloquent scope chain.
- Two-way messaging/chat for any lead type.
- Saved-search match notifications (model stores filters; nothing re-runs them).
- Mortgage/affordability calculator, price-history/market-trend charts.
- Virtual tour/3D walkthrough delivery pipeline (a `three_d_plans` flag exists on the now-removed `DeveloperPackage` model; no delivery mechanism was ever found).
- Agent review/rating UI wired to real data (package installed, unused).
- Revenue/sales dashboard, agent-performance leaderboard, conversion funnel beyond one click-report.
- Sitemap, structured data (JSON-LD), canonical tags, `hreflang`.
- CI/CD, containerization, error tracking, audit logging, verified backups.
- Real RBAC (Policies, scoped permissions) — Spatie roles exist but are enforced inconsistently.
</content>
