# Routing

Every route in the app is generated from `registry/screens/screenRegistry.ts` — there is no hand-maintained `<Route>` list to drift out of sync with `tbos-blueprint/04_SCREEN_INVENTORY.md`.

## How it works

1. `SCREEN_REGISTRY` is an array of `ScreenDefinition` — one entry per screen ID (`PROP-01`, `LEAD-03`, …), with its `path`, owning `moduleId`, required `permission`, optional `featureFlag`, and nav metadata.
2. `ROUTABLE_SCREENS` filters out the two overlay-only entries (`QA-01` Quick Actions, `CMD-01` Command Palette — panels, not pages).
3. `app/router/index.tsx` maps `ROUTABLE_SCREENS` to `<Route>` elements, each wrapped in `<RouteGuard screen={screen}>`.
4. Every route renders `<ScreenPlaceholder screen={screen} />` **except** the two entries in `SCREEN_OVERRIDES` (`AICP-01`, `AICP-02`), which render real (if minimal) components proving the AI foundation end-to-end.

```
/login                        → AuthLayout (mock persona picker)
/  (index)                    → RootRedirect → /today, or /console/moderation for ADM
/<every ROUTABLE_SCREENS.path> → AppShell > RouteGuard > ScreenPlaceholder | override
*                              → NotFoundScreen (inside FullscreenLayout)
```

`AppShell` and `FullscreenLayout` routes are both wrapped in `AuthGuard`, which redirects to `/login` unless `status === 'authenticated'`.

## Adding a screen for real

When a future phase implements a screen's real content:

1. Build the component under `features/<module>/`.
2. Add its ID to `SCREEN_OVERRIDES` in `app/router/index.tsx`, pointing at the new component.
3. Nothing else changes — the route, its permission gate, and its nav entry (if any) already exist.

## Adding a brand-new screen

1. Add a `ScreenDefinition` entry to `SCREEN_REGISTRY` (`registry/screens/screenRegistry.ts`). If it needs a rail/tab entry, set `hasNavEntry: true` — it becomes the module's primary nav target automatically via `primaryScreenForModule()`.
2. If it's a new permission, add it to `PERMISSION_REGISTRY` first (`lib/permissions/permissionRegistry.ts`) — `validateRegistry()` fails the dev console (and `tests/registry.test.ts`) if a screen references an undefined permission.
3. If it belongs to a new module, add the module to `MODULE_REGISTRY` (`registry/modules/moduleRegistry.ts`) first.

## Breadcrumbs

Not implemented as a standalone component this phase — `ScreenPlaceholder` shows the screen's ID/module/permission/status as chips instead, which is more useful for a scaffold. `tbos-blueprint/02_NAVIGATION_BLUEPRINT.md` §9's `[Module] / [Record]` pattern is the spec a real Breadcrumb component should follow when detail screens get real content.

## Platform Console isolation

`PC-01`–`PC-05` carry `moduleId: 'platform_console'` and `permission: 'platform_console.access'`, which only the `ADM` role holds (`lib/permissions/rolePermissions.ts`). `RootRedirect` sends an ADM user to `/console/moderation` (PC-01) after login, and `RouteGuard` blocks every other role from any `/console/*` route regardless of how they got the URL — see [RBAC.md](RBAC.md).

**Known limitation** (explicitly deferred, not silently skipped — matches `tbos-blueprint/04_SCREEN_INVENTORY.md`'s own "behavioral detail intentionally light this phase" note on Platform Console): `RailNav`'s three groups are Orientation/Operating/Intelligence only, so it never renders a Platform Console nav entry at all — an ADM user currently reaches PC-02–05 only via direct URL or Global Search, not a nav link. Console and Broker OS also still share one `AuthLayout` persona picker and one `AppShell`/`RailNav` component tree (branched by role) rather than fully separate route subtrees. A real Platform Console pass should give it its own nav surface — see `TBOS_FRONTEND_FOUNDATION_REPORT.md` "Deferred work".
