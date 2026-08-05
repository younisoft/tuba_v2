# 11 — Technical Architecture

**Status**: Observed (direct source read, 2026-08-06). Read alongside [12_SOURCE_CODE_ASSESSMENT.md](12_SOURCE_CODE_ASSESSMENT.md) §0 for the checkout-consistency caveat that qualifies several facts below (framework version, installed packages, `.env` values).

---

## 1. Stack summary

| Layer | Technology | Evidence |
|---|---|---|
| Backend framework | Laravel **12.61.1** (`composer.json` requires `^12.0`) | `composer.lock`; contradicts July audit's "Laravel 10" — see [12_SOURCE_CODE_ASSESSMENT.md](12_SOURCE_CODE_ASSESSMENT.md) §0 |
| Language | PHP `^8.2` | `composer.json:5` |
| Bootstrap style | **Hybrid**: new `bootstrap/app.php`/`bootstrap/providers.php` (Laravel 11+ style) coexists with a dead legacy `app/Http/Kernel.php` and the classic `config/app.php` `providers` array | `bootstrap/app.php`, `app/Http/Kernel.php` (unreachable), `config/app.php` |
| Database | MySQL (Eloquent ORM), 127 migrations, 49 models | `database/migrations/`, `app/Models/` |
| Cache | Configured `CACHE_STORE=database` in `.env`, but `config/cache.php` still reads the old `CACHE_DRIVER` key → silently falls back to `file` | `.env:40`, `config/cache.php:18` |
| Queue | `QUEUE_CONNECTION=database` in `.env` (changed from `sync`); `jobs`/`cache` migrations now exist | `.env:38`; `database/migrations/0001_01_01_00000*` |
| Sessions | `database` driver (per `.env`) | `.env` |
| Frontend rendering | Server-rendered Blade, no SPA framework | `resources/views/` (Blade only), `package.json` (no vue/react/alpine) |
| Frontend JS | jQuery 3.3.1 + jQuery Migrate + Popper + Bootstrap JS (4 and 5.3.3 both loaded on the search page) + mmenu + isotope + wow.js + parallax.js — all as unbundled `<script>` tags | `resources/views/login_layout/footer-scripts.blade.php`, `front-end/test.blade.php:777` |
| Frontend build tooling | Vite 7 + `laravel-vite-plugin` v2 + Tailwind CSS v4 declared in `package.json`, but wired to nothing — entry `resources/css/app.css` is empty, `public/build/` never generated | `package.json`, `vite.config.js`, `resources/css/app.css` (0 bytes) |
| Legacy styling | Bootstrap (mixed v4/v5), hand-maintained CSS under `public/login_asset/css/` (~30 files incl. Arabic/English RTL pairs), `resources/sass/app.scss` (8-line stub, unreferenced by Vite) | `public/login_asset/css/`, `resources/sass/` |
| Auth | Laravel session auth (web) + Sanctum tokens (API, non-expiring) + custom 2FA/OTP middleware + Spatie `laravel-permission` roles | `config/sanctum.php:49`, `app/Http/Middleware/`, `composer.json` |
| Media | Spatie Media Library (`^11.23`), image pipeline rewritten to Intervention/Image + Spatie ImageOptimizer — **package not installed**, see [12_SOURCE_CODE_ASSESSMENT.md](12_SOURCE_CODE_ASSESSMENT.md) §0 | `app/Helpers/mediaHelper.php`, `composer.json`/`composer.lock` (absent) |
| AI | OpenAI Responses API, model literal `gpt-5.4-mini`, single service (`OpenAISeoService`), Property-only, synchronous | `app/Services/OpenAISeoService.php` |
| Real-time | Pusher, wired but broadcasting on a public (non-private) channel keyed by raw user id | `header-scripts.blade.php:61-66`, `routes/channels.php` (all channel-auth callbacks commented out) |
| Payments | HyperPay (card/Mada) + Tabby (BNPL) | `app/Services/HyperPay.php`, `app/Services/TabbyService.php` |
| Government integrations | REGA (ad-licensing ETL), Nafath (national digital identity), FAL (brokerage licensing) | `app/Models/AgentAdValidatorInformation.php`, `NafathVerification.php`, `FalLicenseVerification.php` |
| SMS | Taqnyat (bearer token hardcoded in source) | `app/Models/User.php:316` |

## 2. Application structure

```
app/
  Console/Commands/       Scheduled jobs (SEO generation, monthly usage, etc.) — 4 currently scheduled
  Events/                 MyEvent.php (broadcasting scaffold — never dispatched)
  Helpers/                mediaHelper.php (live) + oldmediaHelper.php (dead duplicate) + dropdownHelper.php
  Http/
    Controllers/
      Backend/            27 controllers — shared verbatim by Admin CMS AND Agent/Broker dashboard
      Frontend/            7 controllers — public marketing/search site
      API/Agent/           Mobile Agent-app REST surface (Sanctum)
      API/User/            Mobile User/customer-app REST surface (Sanctum, partial)
      Auth/                Registration/login/2FA/OTP (web)
    Middleware/            check_user_status, 2fa, custom guards
  Imports/                 BanNumbersImport.php (maatwebsite/excel — package not installed)
  Jobs/                    Does not exist — no real background-job infrastructure anywhere
  Models/                  49 Eloquent models
  Notifications/           10 classes, all `implements ShouldQueue` (new), all `via() => ['database']` only
  Providers/               AuthServiceProvider (empty $policies, Gate::before SuperAdmin bypass), RouteServiceProvider (legacy manual route registration)
  Services/                OpenAISeoService, HyperPay, TabbyService, PaymentService (god-class), FavoriteService, PropertyRequestService, GlobalService (kitchen-sink), ReceiptPdfService (dompdf — not installed)

routes/
  web.php   (322 lines) — single shared auth+2FA middleware group for customer AND admin/agent routes, no /admin or /agent prefix
  api.php   (166 lines) — Sanctum mobile API, no versioning, no effective rate limiting
  channels.php — all Broadcast::channel() authorization callbacks commented out
  console.php

resources/
  views/
    admin/            2 files — agent_dashboard.blade.php, dashboard.blade.php (role-branched from the same route)
    backend/          27 module directories (agents, agent-users, categories, cities, countries, districts,
                       faqs, packages, license_packages, project, property, property_request,
                       property_service_requests, roles, users, ...) — the shared CMS/dashboard views
    front-end/        Public marketing/search site (Blade + jQuery)
    login_layout/      Shared header/footer/sidebar/master layouts for the authenticated area
    components/       6 Blade components (og-meta, pagination-info, payment-modal, post_a_listing_modal,
                       whatsapp-icon, why-choose-us-ad-cards) — a thin, ad hoc component layer
    old_auth/          Legacy auth views, still present
  css/app.css          Empty — Tailwind entry point wired to nothing
  sass/                app.scss + _variables.scss — legacy stub, no longer built by Vite
  lang/en, lang/ar     8 parallel files each; Arabic validation.php is missing 25 keys present in English
```

## 3. Architectural characteristics

- **No admin/agent separation at any layer** — not routes, not controllers, not middleware groups, not even a folder boundary. The only differentiator is a runtime `if (hasRole(...))` branch in one controller method and scattered `@can()` checks inside otherwise-shared Blade views. This is the single largest structural fact governing everything else in this document: any authorization bug in a shared controller affects both internal staff and paying agents simultaneously.
- **No policy layer.** Laravel Policies — the framework's designed mechanism for per-model authorization — are entirely unused (`$policies = []`). All access control is either a blanket `Gate::before` SuperAdmin bypass, inconsistent route-level `permission:` middleware (present on some resource controllers, absent on 5+), or `@can()` calls scattered through Blade templates with no single source of truth.
- **No service-layer consistency.** Some business logic lives in "Service" classes (`PaymentService`, `FavoriteService`, `PropertyRequestService`, `OpenAISeoService`), some lives directly in controllers (`PropertyController` at 1,135 lines, `MainHomeController` at 893 lines), and some is duplicated between `Property`/`Project` models with no shared trait. There is no consistent boundary between "controller," "service," and "model" responsibility.
- **No background-job infrastructure**, despite `QUEUE_CONNECTION=database` now being configured. `app/Jobs/` does not exist. The only asynchronous behavior in the entire codebase is the 10 notification classes' new `ShouldQueue` flag — everything else (OpenAI calls, PDF generation, image optimization, payment processing) still executes synchronously in the request or scheduled-command thread.
- **Hybrid, partially-dead bootstrap.** The Laravel 12 upgrade introduced `bootstrap/app.php`'s `Application::configure()` style, but `app/Http/Kernel.php` (the pre-11 middleware/route-group definition file) is still present and **no longer wired to anything** — a future engineer editing it (e.g., to fix the missing API rate limiting) would have silently no effect. `RouteServiceProvider::boot()` still manually re-registers `routes/web.php`/`routes/api.php` in the legacy style, alongside whatever `bootstrap/app.php`'s `->withRouting()` call does — not confirmed whether this double-registers routes (would need `php artisan route:list` against a booted app).
- **Configuration hygiene gaps recur across every external integration**: OpenAI, Google Maps, and Taqnyat SMS keys are all read via raw `env()` calls or hardcoded literals rather than `config()` entries — meaning `php artisan config:cache` would silently break at least the OpenAI and Google Maps integrations in production (a `config()`-cached array can't see fresh `env()` reads inside service classes).
- **Single point of AI integration** (`OpenAISeoService`) — proves the team can operate a modern LLM API (auth, structured JSON output, bilingual generation) but this pattern has not been generalized into a reusable internal package/facade; every future AI feature would currently be built by copy-pasting this one file's HTTP-call shape.

## 4. Scalability posture

- Single-node assumption throughout: `FILESYSTEM_DISK=local` (no S3/CDN default), cache/session/queue all point at the same MySQL database (`database` driver for all three), no read replicas configured.
- No containerization (no `Dockerfile`/`docker-compose.yml`), no CI/CD pipeline, no infrastructure-as-code found anywhere in the repository.
- The one genuinely well-engineered high-traffic interaction (debounced map search, stale-response discarding, shareable map-state URLs on `test.blade.php`) shows the team can build for real user load when they invest — the gap is infrastructure automation and background processing, not raw capability.

## 5. What this means for a next-generation Broker OS

A rebuild should assume **none** of the current admin/agent/customer boundary, authorization model, or service-layer structure can be extended as-is — it would need to be designed fresh with route-level separation, a real Policy layer, and a consistent service boundary from day one (this is also the TBX synthesis's #1 recommended differentiator: real RBAC as a first-class primitive, not a post-launch feature). The genuinely reusable assets are the **data layer** (property lifecycle, package/quota ledger, government-integration models) and the **AI integration pattern** (proven OpenAI HTTP-call shape) — both can inform a new system's design even if the surrounding application code is not carried forward directly.
</content>
