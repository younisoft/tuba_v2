# RBAC

> **Frontend RBAC improves UX. It does not replace backend authorization.** Every mutation this app will eventually make must be re-checked server-side. Nothing in this document is a substitute for that — it exists so the UI never dangles an action a real permission check will ultimately reject, and so a foundation-phase demo can show scoped navigation working with mock personas.

## The model

`types/rbac.ts` defines the primitives:

- **Role** (`RoleCode`) — `SB` Solo Broker, `AO` Agency Owner, `SM` Sales Manager, `MM` Marketing Manager, `OM` Operations Manager, `PC` Property Consultant, `ADM` Administrator. Source: `tbos-definition/04_PERSONAS.md`. `ADM` is architecturally isolated — see below.
- **Permission** (`PermissionKey`) — a `module.action` string, e.g. `properties.create`, `leads.assign`, `settings.roles.manage`. The full catalog lives in `lib/permissions/permissionRegistry.ts`, derived line-by-line from every screen's Permissions field in `tbos-blueprint/04_SCREEN_INVENTORY.md`.
- **Scope** (`PermissionScope`) — `own` | `team` | `agency` | `platform`. A role's grant of a permission carries a scope (`lib/permissions/rolePermissions.ts`); `own`-scoped grants are checked against a record's `ownerId` when the caller supplies one.

## Checking a permission

One function, `hasPermission(role, permissionKey, context?)` in `lib/permissions/evaluate.ts`, is pure and has no React/store dependency — every other check calls it:

```ts
const { can } = useHasPermission(); // lib/permissions/useHasPermission.ts
if (can('properties.edit', { ownerId: property.brokerId })) { … }
```

This one function backs all four layers the master prompt asks for:

| Layer | Where |
|---|---|
| Route level | `app/guards/RouteGuard.tsx` — renders `NoPermissionState` instead of the screen |
| Navigation level | `layouts/AppShell/RailNav.tsx` — filters modules/screens before rendering nav links |
| Component level | Any component conditionally rendering an action (e.g. `QuickActionsPanel.tsx` filtering its 4 actions) |
| Action level | Disabling/hiding a specific button inline |

**Why nav-filtering and route-guarding are both implemented, not just one:** hiding a nav link is a UX nicety; a user typing the URL directly must still be blocked. `tests/routing.test.tsx` verifies this explicitly (a Property Consultant hitting `/settings/roles` directly gets `NoPermissionState`, not the screen).

## Platform Console isolation

Constitution Article V: the Platform Console (`PC-01`–`PC-05`) must never share a route, nav tree, or search result with the Broker OS. Enforced today by: `platform_console.access` is the *only* permission `ADM` holds (`rolePermissions.ts`), and no Broker OS role holds it — so `RouteGuard` and search (`lib/search/searchIndex.ts`, which calls the same `can()`) both exclude it structurally, not by a special-cased `if (role === 'ADM')` branch. See `ROUTING.md` for the one known gap (shared `AppShell`/login surface, no Console-specific nav yet).

## Adding a permission

1. Add it to `PERMISSION_REGISTRY` (`lib/permissions/permissionRegistry.ts`) with a `module`/`action`/`description`.
2. Grant it to whichever roles need it in `ROLE_PERMISSIONS` (`lib/permissions/rolePermissions.ts`), with a scope.
3. If it gates a screen, set that screen's `permission` field in `SCREEN_REGISTRY`. `validateRegistry()` (run on every dev boot via `PermissionProvider`, and in `tests/registry.test.ts`) fails loudly if a screen references a permission that doesn't exist in the registry.

## Team & Roles (SET-02)

The screen inventory names `SET-02` "the real RBAC surface — role creation, scoped permission assignment," Phase-1 priority per `tbos-blueprint/14_DEVELOPMENT_BLUEPRINT.md`. This foundation ships the *architecture* SET-02 will configure (role/permission/scope model above) but not the SET-02 UI itself — it's a `ScreenPlaceholder` like every other screen. Building it is explicitly the next implementation step (see the final report).
