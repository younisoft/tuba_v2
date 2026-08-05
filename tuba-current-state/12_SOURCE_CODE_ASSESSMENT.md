# 12 — Source Code Assessment

**Status**: Observed (direct source read + re-verification pass, 2026-08-06). Builds on and re-verifies `web-project-audit/01_PROJECT_ARCHITECTURE.md`, `02_DATABASE_ANALYSIS.md`, `13_CODE_QUALITY.md`, `17_TECHNICAL_DEBT.md`, `18_BUG_REPORT.md` (2026-07-11/13) against the codebase as it exists today. Every claim below is either **Confirmed unchanged**, **Changed since audit**, or a **New finding** from this pass — see the five underlying verification notes in the assessment's working files for full file:line evidence (architecture/DB, features/dashboard, CX/UI/search, security, performance/quality/debt).

---

## 0. Read this first: the checkout is internally inconsistent

Before any other finding: this `tuba/` checkout does not read as a clean, linear continuation of the codebase the July 2026 audit examined. Two things are true at once:

- **The framework was upgraded**: Laravel 10 (PHP 8.1) → **Laravel 12.61.1** (PHP ^8.2). `bootstrap/app.php`/`bootstrap/providers.php` (the new-style bootstrap) now coexist with a legacy, **dead** `app/Http/Kernel.php` — nothing binds it to `Illuminate\Contracts\Http\Kernel` anymore, so its middleware/alias definitions (including the API `throttle:api` rule) silently never execute. `.env` moved to `CACHE_STORE=database` / `QUEUE_CONNECTION=database` (from `file`/`sync`), a `jobs` migration now exists, and 10 notification classes gained `ShouldQueue`.
- **The scaffold was reset to bare Laravel-12 defaults while the business logic stayed old**: `composer.json`'s `require` list has shrunk to 9 packages. `barryvdh/laravel-dompdf`, `maatwebsite/excel`, and `intervention/image` are **not installed** (absent from `composer.json`, `composer.lock`, and `vendor/`) — yet `ReceiptPdfService.php`, `PaymentController.php`, `PaymentService.php` (Dompdf), `BanNumberController.php`/`BanNumbersImport.php` (Excel), and the rewritten `mediaHelper.php` (Intervention\Image) all still call those classes. **As configured in this checkout, receipt-PDF generation, Ban-Numbers Excel import, and every property/project photo upload would fatal-error if exercised.** `.env` also has no `OPENAI_API_KEY`, no HyperPay/Google Maps/Nafath/Taqnyat/reCAPTCHA keys — it reads as a fresh scaffold, not a working configured environment. `tests/` contains only the stock Laravel example tests; the audited `UpdateMonthlyPropertyUsageTest.php` no longer exists. The newest migration on disk (`2026_06_08_161138_create_ratings_table.php`) *predates* migrations the July audit describes reading (a `2026_07_06`-dated `DeveloperPackage` catalog, a `2026_06_08_100000` index-retrofit migration) — neither exists here. There is no `.git` directory in this checkout, so history cannot be checked directly.

**Per user direction, this is documented as-is rather than resolved.** Treat every finding below that depends on `.env` values, the installed package set, or post-2026-06-08 state as describing *this checkout specifically*, which may or may not match what is actually deployed to `https://tuba.com.sa/`. This is the single most important caveat governing confidence in this entire document, and in `13_GAP_ANALYSIS.md`/`14_KEEP_IMPROVE_REMOVE.md` wherever they cite source-code evidence.

---

## 1. Architecture (confirmed unchanged from the July audit)

- **One Laravel monolith**, no microservices, no separate admin/agent codebases. `app/Http/Controllers/Backend/` (27 controllers) is shared verbatim between the internal admin CMS and the self-service Agent/Broker dashboard — differentiated only by `HomeController::index()` branching `/dashboard` to `admin.agent_dashboard` vs `admin.dashboard` Blade views based on Spatie role, and by ad hoc `@can()` checks inside shared views.
- **No route-level separation**: `routes/web.php` still has a single `Route::group(['middleware' => ['auth','check_user_status','2fa']], ...)` wrapping both customer-profile routes and all 27 Backend-controller resource routes. A commented-out `'prefix' => 'admin'` attempt (line 180) was abandoned mid-edit and never removed.
- **Zero Laravel Policy classes.** `AuthServiceProvider::$policies` is empty; the entire authorization model is `Gate::before(fn($user,$ability) => $user->hasRole('SuperAdmin') ? true : null)` plus scattered, inconsistent `permission:` middleware and `@can()` Blade checks. Five reference-data controllers (Categories, Cities, Countries, Districts, Property Types) still register only `auth`, no permission check at all.
- **Mobile API** (`routes/api.php`, 166 lines) is a separate Sanctum-token surface (`API\Agent\*`, `API\User\*`) serving a shipped Agent app and a partial User/customer app — architecturally bolted alongside the web routes, not versioned (no `/api/v1/`), no per-route rate limiting effective (see §0 — the Kernel-defined `throttle:api` is dead code under the new bootstrap).

## 2. Data layer

- 127 migrations (down from the audited ~138 — see §0), 49 models (down from ~51). Core domain modeling is real: an 8-state property lifecycle, `PropertyUsage` monthly-rolling package/quota ledger, REGA→Property ETL (`Property::fillPropertyData()`).
- **Confirmed unchanged data-quality debt**: `properties.property_price` and related money columns are still `string`, not `decimal` (sorted via `orderByRaw('CAST(property_price AS UNSIGNED)...')` — un-indexable). CSV-packed pseudo-foreign-keys still exist on `agent_preference_settings` (`region_id`/`city_id`/`district_id` as strings, queried via `FIND_IN_SET` in three files). The `agent_package_detials`/`AgentPackageDetial` typo is baked into both the table name and model name.
- **`DeveloperPackage` (the audit's "fourth/fifth package system") no longer exists anywhere** — no model, controller, or migration. The route `developer-packages` still resolves, but to a static Blade view with no DB-backed catalog. Whether this is a deliberate unwind or a snapshot artifact is unconfirmed (§0).
- No `app/Jobs/` directory exists at all — nothing in the codebase does real background-job processing, despite `QUEUE_CONNECTION=database` now being set (see §3).

## 3. What has genuinely improved since the July audit

Real, verifiable fixes exist — not everything is static or regressed:

| Fix | Evidence |
|---|---|
| The "3 hardcoded property IDs" SEO gate is gone | `viewPropertyIndex()` now applies a generic, fallback-aware SEO path to every property, not `in_array($id,[7542,7548,7547])` |
| `PropertySeoService` (the second, conflicting SEO mechanism) was deleted | Only `OpenAISeoService` remains — the audit's "two parallel SEO implementations" finding is now moot |
| The hand-rolled `cwebp` `exec()` shell-out is gone | `mediaHelper.php` now calls `Spatie\ImageOptimizer\OptimizerChainFactory` + `Intervention\Image` — but see §0, the latter package isn't installed, so this fix is currently non-functional |
| `ProjectController::create()` no longer writes a draft `Project` row on a bare GET | The `Project::create()` call now lives correctly inside `store()` |
| 10 notification classes now `implements ShouldQueue` | Contradicts the phase4 claim that none did — real, if `QUEUE_CONNECTION=database` is accurate for production |
| A `RoleSeeder.php` now exists | Creates/syncs the `SuperAdmin` role by name (partial fix — `Agent`/`Agent User`/`User` still unseeded) |
| `SocialLoginController` + `laravel/socialite` removed entirely | Resolves "non-functional OAuth, `dd()` in production" by deleting the dead feature |
| The recurring data-repair cron jobs (`FixArabicPropertyTitlesSeeder`, `TranslateAgentNamesArabic/English`) are gone | Unclear whether the underlying Arabic-title data issue was fixed at the source or the compensating job was simply removed |

## 4. What has NOT changed — Critical security findings, still exploitable today

All 7 Critical findings from the July `11_SECURITY_AUDIT.md` were independently re-verified against current source and are **confirmed still present, byte-for-byte, including the original developer comments**:

1. **Universal hardcoded password** — set on every customer/agent/sub-user/employee account across every registration path.
2. **Unconditional OTP master-bypass codes** and bypass phone numbers — not gated to non-production.
3. **Nafath (government digital-identity) callback JWT signature is never verified** — `decodeJWT()` still only base64-decodes header/payload, no signature check, no JWT library in `composer.json`.
4. **HyperPay payment calls run with TLS verification unconditionally disabled** (`CURLOPT_SSL_VERIFYPEER, false`), including the developer's own "should be true in production" comment.
5. **Tabby payment fulfilment via an unauthenticated GET keyed by a guessable sequential id** — no server-side confirmation with Tabby is ever called (`TabbyService::getSession()` exists but is never invoked from the success handler); the `/webhooks/tabby` route still points at a `handle()` method that doesn't exist anywhere in the codebase.
6. **`FavoriteService::deleteRecord` IDOR** — any authenticated user can delete any row of any Eloquent model via the "remove saved item" action; no allow-list, no ownership check.
7. **Five admin reference-data controllers have no permission middleware**, `auth` only.

**One finding has regressed**: `database/seeders/CreateAdminUserSeeder.php` was rewritten since the audit to explicitly reuse the same universal hardcoded password for the SuperAdmin bootstrap account, and now pre-marks that account `otp_verified=1`/`is_verified=1` at seed time — a materially easier default-credential bypass than the previously-audited version, with an inline code comment showing the team is aware of and has institutionalized the universal-password behavior rather than treating it as accidental debug code.

## 5. Code quality signals (confirmed unchanged)

- `PropertyController.php` (1,135 lines): ~30% of lines are commented-out dead code, including an entire legacy `store()`/`update()` implementation left in place beside the live one.
- `MainHomeController.php` (893 lines): ~26% commented-out, including a full dead predecessor of `gettestProperties()`.
- Two full duplicate media helpers coexist (`mediaHelper.php`, `oldmediaHelper.php`, 351 lines, dead) with function-name collisions that would fatal-error if ever both loaded.
- `Property` (1,030 lines) and `Project` (330 lines) models duplicate search-scope, SEO boot-hook, and slug-generation logic with no shared trait.
- `PaymentService.php` (584 lines) is an all-static-method "god class" with zero `DB::transaction()` usage anywhere, despite orchestrating multi-step payment/entitlement state changes.
- Zero automated test coverage beyond Laravel's stock example tests (the audited feature test for `UpdateMonthlyPropertyUsage` no longer exists in this checkout at all — see §0). No CI/CD, no Dockerfile, no containerization.
- No error tracking (Sentry/Bugsnag/Flare/Telescope), no audit-log package (`spatie/laravel-activitylog` or equivalent), still absent.
- The production search page and its controller methods are still literally named `test` (`teststatusWiseProperties`, `gettestProperties`, `map-test`, `map-test-property`) and are the live, highest-traffic implementation, not placeholders.

## 6. Front-end / build pipeline

- **Tailwind CSS v4 + Vite v7 + `laravel-vite-plugin` v2 were added to `package.json`** since the July audit (which found only Axios + minimal `app.js`) — but the Vite entry stylesheet, `resources/css/app.css`, is **completely empty** (0 bytes). There is no `@import "tailwindcss"`, no custom CSS — the dependency exists in `package.json` but is wired to nothing. `public/build/` has never been generated. The actual live styling for every page is still the legacy, hand-maintained asset tree under `public/login_asset/css/` (Bootstrap 4/5 mixed, `ar-*.css`/`*.css` RTL pairs, ~30 loose CSS files) and `resources/sass/app.scss` (an 8-line stub, no longer even referenced by `vite.config.js`).
- Real jQuery 3.3.1 + jQuery Migrate + Popper + Bootstrap JS + mmenu + isotope + wow.js + parallax.js are all still loaded as 17+ unbundled, non-deferred `<script>` tags per page.
- The live map/search page (`test.blade.php`) loads Bootstrap 5.3.3 JS on top of the site-wide Bootstrap 4-era CSS/JS bundle — a confirmed dual-Bootstrap-version conflict, unchanged from the audit.

## 7. Net technical picture

The July audit's headline framing — *"a commercially real, feature-rich product built on a prototype-grade engineering foundation, scoring 42/100 overall with Security at 18/100"* — still holds and, on the security dimension specifically, has not improved in any of the 7 Critical findings after a month, with one regression. Genuine engineering motion is visible (framework upgrade attempt, SEO-gate fix, media-pipeline rewrite, notification queuing, dead-feature removal), but it is uneven and, in the case of the framework/dependency mismatch documented in §0, has introduced new fatal-error risk that did not exist in the audited state. Any decision to build a next-generation Broker Experience System on this foundation should treat the Critical security findings and the dependency-consistency question as pre-requisites, not backlog items — consistent with the July audit's own Phase 1 "Critical Fixes" sequencing, which nothing in this re-verification pass shows has been executed.
</content>
