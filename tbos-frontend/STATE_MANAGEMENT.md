# State Management

The simplest architecture that separates the six kinds of state the master prompt names, per its explicit instruction not to introduce global state for data that belongs locally.

| Kind | Owned by | Why not merged with another kind |
|---|---|---|
| **Server state** | TanStack Query (`app/providers/queryClient.ts`) | Has its own lifecycle (stale/refetch/cache) that a plain store re-implements badly. `lib/notifications/useNotifications.ts` is the reference pattern. |
| **UI state** | `state/ui.store.ts` (Zustand) | Rail collapsed, command palette/quick actions/notification panel open, last-focused-element for focus restoration. Ephemeral except `railCollapsed`, which is the one field persisted (`partialize`). |
| **Session state** | `state/session.store.ts` (Zustand, persisted) | The authenticated user, auth status, active role. Backs `lib/auth/AuthProvider.tsx`. |
| **Permission state** | *Derived, not stored* | `lib/permissions/evaluate.ts`'s `hasPermission()` is a pure function of (role, permission registry) — computing it fresh is cheaper and less error-prone than caching a permission set that could drift from the role. |
| **Feature flag state** | `state/featureFlags.store.ts` (Zustand, not persisted) | Registry defaults (`lib/featureFlags/registry.ts`) layered with in-session dev overrides only — flags are never meant to silently persist a QA override across reloads. |
| **Navigation state** | React Router's own history | The URL is the source of truth for "where am I"; nothing duplicates it into a store. |

## Why Zustand over Context/Redux

- No provider boilerplate for state that doesn't need render-scoping (theme/locale/session are legitimately global).
- Stores are plain functions usable outside React (e.g. `mockLogin` reads `useSessionStore.getState()` indirectly via the store's own actions) — useful for the eventual API-interceptor use case (attaching an auth token to requests) without prop-drilling.
- `persist` middleware handles localStorage sync declaratively for the three stores that need it (`theme`, `locale`, `session`, and `ui`'s `railCollapsed` slice) — see each store file's comment for what's persisted and why.

## Why some "providers" are thin wrappers over stores

`AuthProvider`, `ThemeProvider`, `LocaleProvider` all read a Zustand store and expose it as `useX()`. The master prompt names these providers explicitly (`AuthProvider`, `AiProvider`, …) as the stable interface future code depends on — but the *storage* underneath is Zustand, not `useState`/`useReducer`, for the reasons above. This is a deliberate two-layer split: the store owns state, the provider owns the public contract.
