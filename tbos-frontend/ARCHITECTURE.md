# Architecture

## Folder structure

```
src/
  app/
    router/       AppRouter — generates every <Route> from registry/screens
    providers/     AppProviders composition, ThemeProvider, LocaleProvider, queryClient
    config/        env.ts (the one place import.meta.env is read), constants.ts
    guards/        AuthGuard (session state), RouteGuard (RBAC + feature flags)

  components/
    ui/            Design-system primitives: Button, IconButton, Badge, Switch, Icon, Skeleton, Spinner
    navigation/     CommandPalette, QuickActionsPanel, NotificationBell — cross-cutting overlays
    feedback/       EmptyState, ErrorState, NoPermissionState, ErrorBoundary, Toast/ToastViewport
    screens/        ScreenPlaceholder (generic scaffold), NotFoundScreen

  features/<module>/   One folder per module in registry/modules — the extension point
                        future feature work fills in. ai_copilot/ is the one module with
                        real (if minimal) screens today; see ROUTING.md.

  layouts/
    AppShell/       RailNav, TopBar, MobileTabBar, UserMenu — the Broker OS chrome
    AuthLayout/      Mock persona-picker sign-in screen
    FullscreenLayout/  No-chrome layout (404, etc.)

  lib/
    api/            ApiClient (mock today, real-backend-ready contract) + endpoints/
    auth/           AuthProvider/useAuth, mock adapter, persona list, types
    permissions/    Roles, permission registry, role→permission map, evaluate(), useHasPermission
    featureFlags/   Registry + useFeatureFlag hook
    search/         RBAC-scoped search index + command list
    notifications/  useNotifications (React Query over the mock API)
    ai/             AiProvider/useAi, mock adapter, audit log
    i18n/           Dictionaries (en/ar) + useTranslation
    a11y/           useFocusTrap (shared by every modal/panel)
    analytics/      track() abstraction
    logging/        logger abstraction

  mocks/
    data/seed.ts    The one coherent mock broker dataset (two agencies, hand-linked records)
    api/db.ts       In-memory "database" over the seed data + query helpers

  registry/
    screens/        SCREEN_REGISTRY (50 entries) + validateRegistry()
    modules/        MODULE_REGISTRY (20 entries)

  state/            Zustand stores: theme, locale, ui (rail/palette/panels), session (auth), toast, featureFlags
  styles/           tokens.css (design-system CSS vars), globals.css (Tailwind entry + base layer)
  tokens/           tailwind-theme.ts (design-system Tailwind theme, mirrored)
  types/            Shared TypeScript types: rbac, screens, modules, entities, api, data-state, feature-flags
  tests/            Vitest suite + shared test utilities
```

## Provider composition

`app/providers/AppProviders.tsx`, outermost to innermost:

```
ErrorBoundary
  QueryClientProvider     (server state)
    ThemeProvider          (no store dependency)
      LocaleProvider        (no store dependency)
        BrowserRouter
          AuthProvider        (session state)
            PermissionProvider  (validates registries in dev; reads AuthProvider indirectly via hooks)
              AiProvider          (reads AuthProvider's current user)
```

Order matters: a provider never depends on one that appears after it in this list.

## Key decisions

- **Registry-driven routing.** `registry/screens/screenRegistry.ts` is the single source of truth for all 50 screens (49 Broker OS + Platform Console counted separately per `tbos-blueprint/04_SCREEN_INVENTORY.md`'s own tally). `app/router/index.tsx` maps over it to generate every `<Route>` — there is no second, hand-maintained route list to drift out of sync.
- **RBAC is UX, not the security boundary.** `RouteGuard` and `RailNav`'s filtering both call the same `hasPermission()` function (`lib/permissions/evaluate.ts`). Hiding a nav item and blocking a direct URL are the same check, run twice — see [RBAC.md](RBAC.md).
- **One mock API seam.** Every screen that will eventually fetch data goes through `lib/api/client.ts`'s `ApiResponse<T>` contract. Today it resolves against `mocks/api/db.ts`; a real backend replaces that resolver only — see [MOCK_API.md](MOCK_API.md).
- **Placeholder screens, real chrome.** Per the master prompt's explicit non-goals, none of the 50 screens has real business content — `ScreenPlaceholder` renders their registry metadata. The *shell* around them (nav, search, command palette, notifications, theme, RTL, RBAC) is fully functional, because that's what a "foundation" phase is for. `AICP-01`/`AICP-02` are the one sanctioned exception (master prompt §23: AI foundation must be provably real, with mock responses only).
- **Tailwind theme is generated, not hand-written.** `src/tokens/tailwind-theme.ts` mirrors `design-system/tailwind-theme.ts` verbatim (plus one documented addition — an `opacity` scale the upstream file didn't wire up yet). `tailwind.config.ts` loads it via `@config` in `styles/globals.css`. Never hardcode a hex/px value in a component — see `design-system/18_DESIGN_RULES.md` Rule 1.
