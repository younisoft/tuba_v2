# TBOS Frontend Foundation — Report

**Phase**: Frontend Foundation (per the master prompt "TBOS FRONTEND FOUNDATION v1.0")
**Location**: `tbos-frontend/` — a new, isolated project alongside `tbos-definition/`, `tbos-blueprint/`, `design-system/`. The existing `tuba/` application was not touched.
**Status**: Complete. Builds, type-checks, lints, and tests clean; runs locally with a working RBAC-scoped, bilingual, themeable Application Shell over the full 49-screen (50-entry) registry.

---

## 1. What was built

A production-quality **application foundation** — the shell, plumbing, and cross-cutting systems every future TBOS screen will sit inside — with zero business-feature content, per the master prompt's explicit non-goals (§38). Concretely:

- A working Application Shell: collapsible three-group rail nav, top bar, mobile bottom-tab bar, all RBAC- and feature-flag-filtered from one registry.
- Routing for all 50 registry screens (49 Broker OS + Platform Console's 5, matching the blueprint's own screen count — see §3 below for the exact reconciliation), each route permission-guarded independently of nav visibility.
- A real RBAC engine: 7 roles, 45 permissions, scoped grants, evaluated by one pure function used at route/nav/component/action level alike.
- A mock API layer with a real error/loading/empty taxonomy, backed by one coherent, hand-linked mock broker dataset (two agencies, full relational graph).
- Mock authentication with 7 seeded personas (including one dual-role user, demonstrating the persona switcher).
- A working theme engine (light/dark/system, no-flash, persisted) and a working bilingual RTL/LTR foundation (English/Arabic), both verified live in-browser.
- Working Global Search, Command Palette, Quick Actions, and Notification Center chrome — all RBAC-scoped, all built on the same registry and mock API.
- A proven (not just architected) AI foundation: a real `AiProvider` → mock adapter → audit-log path, demonstrated on the one screen the master prompt explicitly sanctions for this (AICP-01/02).
- A full design-token integration: every color/spacing/type/motion value in the app resolves through `design-system/tokens.json` → CSS custom properties → Tailwind classes, with zero hardcoded values.
- 39 automated tests across registry integrity, RBAC evaluation, feature flags, the mock API, theme/RTL mechanics, component accessibility, and full routing/RBAC integration.

## 2. Technology decisions

| Choice | Why |
|---|---|
| **React 18 + TypeScript (strict) + Vite 5** | Matches the master prompt's preferred direction; Vite for fast HMR and a clean production build. |
| **Tailwind CSS v4** | `design-system/tailwind-theme.ts` is already written as a Tailwind v4 theme extension — consumed directly (mirrored into `src/tokens/`, see ARCHITECTURE.md), not reinvented. |
| **React Router v7** | Data-router-capable, nested layouts, works cleanly with a registry-generated route list. |
| **TanStack Query v5** | Server-state layer over the mock API — the same hooks work unchanged once a real backend lands. |
| **Zustand v5** | Chosen over Redux/Context-only for the reasons in `STATE_MANAGEMENT.md`: no boilerplate for legitimately-global state, stores usable outside React. |
| **Vitest 2 + Testing Library + axe-core** | Matches Vite's own transform pipeline; no separate Jest config. Pinned to v2 rather than the newly-released v4 for Node 20.11 compatibility — see `DEVELOPMENT.md` "Node version note." |
| **No UI component library** | Per master prompt §4 — every primitive (`Button`, `Badge`, `Switch`, `Icon`, …) is hand-built directly against design tokens in `components/ui/`. |
| **Hand-rolled i18n dictionary** (not i18next) | The foundation phase has no business copy yet; a ~90-key EN/AR dictionary (`lib/i18n/`) covers all shell chrome. Swap path to a full i18n library documented for when content volume justifies it. |

## 3. Screen count reconciliation

The master prompt says "49 screens." `tbos-blueprint/04_SCREEN_INVENTORY.md` — the authoritative source one layer below the master prompt in the hierarchy — enumerates **50** screen IDs when Platform Console's 5 (`PC-01`–`PC-05`) are counted: Orientation (4) + Operating (19) + Intelligence & Control (18) + cross-cutting overlays (4: `GS-01`, `QA-01`, `CMD-01`, `ONB-01`) + Platform Console (5) = 50. `SCREEN_REGISTRY` in this codebase implements all 50, matching the blueprint exactly rather than trimming one to hit the master prompt's round number — the blueprint is the binding source per the stated authority hierarchy. `tests/registry.test.ts` asserts this count so it can't silently drift.

## 4. Architecture

Full detail in `tbos-frontend/ARCHITECTURE.md`. Summary: `app/` (router, providers, config, guards) → `layouts/` (AppShell, AuthLayout, FullscreenLayout) → `components/` (ui, navigation, feedback, screens) → `features/<module>/` (one folder per module, the extension point) → `lib/` (api, auth, permissions, featureFlags, search, notifications, ai, i18n, a11y, analytics, logging) → `mocks/` (data, api) → `registry/` (screens, modules) → `state/` (Zustand stores) → `styles/`/`tokens/` (design-system integration) → `types/`.

No circular dependencies: `registry/` depends only on `types/`; `lib/permissions/` depends on `registry/` (to validate against it) and `types/`, never the reverse; `components/`/`layouts/` depend on `lib/`/`state/`/`registry/`, never the other way.

## 5. Design System integration

`design-system/tokens.json` is the single source of truth. `src/styles/tokens.css` mirrors `design-system/design-tokens.css` (with the dark-mode explicit-toggle block fully expanded — the upstream file left it abbreviated with a comment saying a build pipeline would expand it; this codebase *is* that expansion, values identical to the `prefers-color-scheme` block). `src/tokens/tailwind-theme.ts` mirrors `design-system/tailwind-theme.ts` verbatim, plus one documented addition (an `opacity` scale wiring up a token category the upstream file defined in `tokens.json` but hadn't mapped to Tailwind yet). Verified live: light/dark/system theme switching, RTL mirroring (rail, breadcrumbs-equivalent chips, icons, form/button alignment), and zero-hardcoded-value discipline (every class in every component resolves through a token).

## 6. Routing

See `ROUTING.md`. Every route generated from `registry/screens/screenRegistry.ts` — no second, hand-maintained list. Verified: unauthenticated redirect to `/login`, authenticated landing on `/today`, direct-URL RBAC denial independent of nav visibility, 404 handling, Platform Console isolation.

## 7. RBAC

See `RBAC.md`. 7 roles (`SB`/`AO`/`SM`/`MM`/`OM`/`PC`/`ADM`), 45 permissions across 20 modules, scoped grants (`own`/`team`/`agency`/`platform`), one pure evaluation function used identically at route/nav/component/action level. Verified live in-browser: switching Sara Al-Otaibi from Agency Owner to Property Consultant instantly re-filters the rail nav (Marketing/Finance/Reports/Automation/Settings→Roles disappear) *and* independently blocks direct navigation to `/settings/roles` with a translated `NoPermissionState`.

## 8. Mock API & mock data

See `MOCK_API.md`. One `ApiResponse<T>` contract, one coherent hand-linked dataset (two agencies — a 5-role brokerage and a Solo Broker account — with every lead/task/notification/contract tracing to a real linked record). Swap-to-real-backend path documented and structurally enforced (nothing outside `lib/api/`/`mocks/` imports mock data directly).

## 9. Search, Command Palette, Quick Actions, Notifications

All four built on the same registry + RBAC + mock-API foundation, all verified working: Global Search/Command Palette share one surface (`>` prefix switches modes) per the blueprint; Quick Actions shows 3 or 4 actions per role (never a disabled 4th); the Notification bell shows a real, always-accurate unread count per recipient (the specific defect named in the current-platform audit) with working mark-read/mark-all-read.

## 10. AI foundation

`AiProvider`/`useAi` → `mockAiAdapter` → in-memory audit log, covering all six `AiActionKind`s from `tbos-definition/10_AI_STRATEGY.md`. Demonstrated live on `AICP-01` (ask → confidence-scored, source-cited response) and `AICP-02` (the resulting audit-log entry, rendered in a real `<table>` with `<th scope>`). No other screen carries real AI content — this is the one sanctioned exception (master prompt §23).

## 11. Testing

39 tests, 9 files, all passing — see `TESTING.md` for the full breakdown and the explicit axe-core/jsdom coverage boundary (structural a11y checks yes; paint-dependent contrast/focus checks need a real-browser pass, named as deferred work below).

## 12. Accessibility

Structural rules verified by `a11y.test.tsx` (axe-core) plus manual verification during development: keyboard focus-trapping on every overlay (Command Palette, Quick Actions, Notification panel, User menu — `lib/a11y/useFocusTrap.ts`), real semantic controls (`role="switch"`, `role="alert"`, `<th scope>`), non-color-alone status (every `Badge` carries text), RTL mirroring, 44px touch targets on interactive controls, `prefers-reduced-motion` respected (skeleton pulse, all token durations collapse to 0ms).

## 13. Performance

Route-level code splitting via `React.lazy`-free but chunk-split build (`vendor`/`query` manual chunks in `vite.config.ts`); production bundle: ~82KB app JS + ~43KB query + ~179KB vendor (React/Router), all gzip ~95KB combined. No premature optimization beyond this — matches master prompt §35's "measure before optimizing."

## 14. Security

See `SECURITY.md` for the full breakdown, including the one known moderate dev-server-only advisory (esbuild, doesn't affect production output) and the explicit list of what a real backend must still enforce.

## 15. Known limitations / deferred work

Named explicitly rather than silently skipped, per the master prompt's own standard for the Platform Console:

1. **Platform Console has no dedicated nav surface.** `RailNav` only renders the three Broker OS groups; an ADM user reaches `PC-02`–`PC-05` via direct URL/search only, not a nav link. Console and Broker OS also still share one `AuthLayout` and one `AppShell` component tree (branched by role) rather than fully separate route subtrees — see `ROUTING.md`.
2. **Screen/module names and purposes are English-only.** Shell chrome (nav labels, buttons, states) is fully bilingual; the registry's `name`/`purpose` fields (used only in `ScreenPlaceholder`, a dev scaffold) are not, since translating placeholder-only copy isn't meaningful work.
3. **Full-page accessibility sweeps** (real contrast, focus-ring visibility) need a real-browser tool (Playwright + axe) — this phase's automated a11y tests cover structural rules only; see `TESTING.md`.
4. **SET-02 (Team & Roles UI)** — named Phase-1 priority in `tbos-blueprint/14_DEVELOPMENT_BLUEPRINT.md` — has the RBAC *architecture* it will configure, but is itself still a placeholder screen, per this phase's explicit scope (no business features).
5. **No Storybook/component-isolation environment** was set up — the master prompt asks for "only enough foundation to prove" tokens/theme/RTL/a11y/isolation, which the test suite (not Storybook) currently proves; a dedicated component-dev environment is Component Library-phase work.

## 16. Exact next implementation step

Per the master prompt's final rule ("Stop after the Foundation Quality Gate... The next phase will be the TBOS Component Library, and it must consume this foundation rather than rebuild it"): the next phase should build the full `components/ui/` catalog against `design-system/17_COMPONENT_CATALOG.md` (Record List, Kanban Board, Detail Header, Wizard/Stepper, Slide-over Panel, Data Table, etc.) as real, tested, Storybook-documented components — consuming this foundation's registries, RBAC hooks, and mock API contract unchanged. After that, per `tbos-blueprint/14_DEVELOPMENT_BLUEPRINT.md`'s Release 1 (Foundation/Trust), the first real *feature* work should be **SET-02 (Team & Roles)** and the **Unified Lead Pipeline (LEAD-01/02/03)**, in tight lockstep, exactly as sequenced there.
