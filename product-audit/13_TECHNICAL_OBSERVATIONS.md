# Technical Observations

> A full, network-log-verified API architecture writeup (real endpoints, auth flow, service naming) now lives in [[31_API_ARCHITECTURE_INFERENCE]] — the summary below is superseded/confirmed by that document where the two overlap. The `Failed to fetch` observation immediately below is now explained with much higher confidence: it's coupled to a bot-challenge round-trip on token refresh, not a generic network flake.

Inferred architecture:

- Single-page application with authenticated API calls.
- Client-side routes include `/en/dashboard`, `/en/post-listing`, `/en/listings` (with query-string tab state, e.g. `?f[nested.platform_listings.status.slug]=draft`), `/en/credits-usage`, `/en/lms/leads`, `/en/agent-performance`, `/en/reports/summary`, `/en/agency-staff`, `/en/user-settings/{user-profile,agency-profile,licenses,preferences,change-password}`, and `/en/packages`.
- Bot/CAPTCHA protection is active at Bayut account entry (login goes through `www.bayut.sa/en/account` with an `externalRedirectPath` back to Profolio).
- Several navigation elements are client-side buttons rather than semantic anchors, and — confirmed via direct DOM inspection — the row-level listing action icons (view/edit/promote/delete) carry no `aria-label` or `title`, meaning they are unlabeled to assistive technology.
- Direct route refreshes intermittently showed `TypeError: Failed to fetch`, suggesting auth token refresh, API availability, CORS, or bot-protection coupling risks.
- Tables and pages appear API-driven (Ant Design components under the hood); pagination is present on listings; the Ant table renders a hidden zero-height "measure row" that automated scraping needs to filter out.
- Dashboard-level Views fluctuated across capture passes minutes apart (1,675 → 1,683), consistent with a near-real-time counter. Separately, in the original capture.json, two back-to-back captures of the same `/en/listings` route (offsets recorded ~15 minutes apart) show the identical set of listing IDs with "Views 33" in one capture and "Views 0" in the other — worth re-verifying on a clean session, since it could be either a genuine reset/lag in the analytics pipeline or an artifact of that capture run (e.g. a stale cached response).
- Reproduced and root-caused a bug in the first capture pass: the sidebar has two adjacent menu items, "Agent Performance" and "Reports", not one item named "Agent Performance Reports" — an automated text-scrape concatenated the two adjacent DOM labels and then failed to find a matching clickable element. Both pages load correctly and are now captured individually.

Security observations:

- CAPTCHA protection reduces automated abuse.
- Session and API handling should be tested for direct deep-link reliability.
- Role and permission surfaces need explicit auditability — the only two access-control primitives found (per-staff credits limit, license-sharing toggle) are coarse and not independently confirmable without a second staff seat.
