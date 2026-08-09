# Mock API

## The contract

`lib/api/client.ts` exports one function, `apiClient.request<T>(resolver, options)`, that:

1. Simulates network latency (`mocks/api/latency.ts`, default 150ms).
2. Runs `resolver()` — a synchronous function reading from `mocks/api/db.ts`.
3. Wraps the result in `ApiResponse<T>` (`types/api.ts`): `{ status: 'success', data }` or `{ status: 'error', error: ApiError }`.
4. `ApiError` always carries a plain-language `message` (never a raw stack/gateway string) and a `recoveryAction` hint (`retry` | `go-back` | `re-authenticate` | `reload`).

Feature-specific endpoints wrap this in `lib/api/endpoints/` — see `notifications.ts` and `wallet.ts` for the pattern. Screens never import `mocks/` directly; they go through `lib/api/endpoints/*` (or a React Query hook wrapping it, like `lib/notifications/useNotifications.ts`).

## Supported states

`ApiResponse`/`ApiError` cover every state the master prompt asks for: loading (caller's own `isLoading`/`isPending`), success, empty (`data` is an empty array — the caller decides how to render that, e.g. `EmptyState`), and every `ApiErrorCode`: `validation`, `unauthenticated`, `unauthorized`, `not_found`, `conflict`, `rate_limited`, `server_error`, `network_error`, `unknown`.

Force a specific error path in a test or a demo via `options.simulateError`:

```ts
apiClient.request(() => data, { simulateError: 'server_error' });
```

## Swapping in a real backend

Nothing above `lib/api/client.ts` should need to change. A real implementation:

1. Replaces `request()`'s body with an actual `fetch`/HTTP client call, keeping the same `ApiResponse<T>` return shape.
2. Replaces each `lib/api/endpoints/*.ts` file's calls into `mocks/api/db.ts` with calls to real REST/GraphQL endpoints — the exported function signatures (`notificationsApi.list(recipientId)`, etc.) don't need to change, so React Query hooks consuming them are unaffected.
3. Deletes `mocks/` once nothing references it.

## Mock data

`mocks/data/seed.ts` is one hand-linked dataset — not random generation — modeling two agencies:

- **Al Waha Real Estate** (`agency-1`) — a 5-person team covering all six Broker OS roles (Sara Al-Otaibi holds both Agency Owner and Property Consultant, demonstrating the persona switcher).
- **Omar Realty** (`agency-2`) — a Solo Broker account.

Every relationship resolves to a real record: leads reference a real customer and property; tasks reference a real lead/property; notifications are scoped to a real recipient; contracts trace back to a real won lead. `mocks/api/db.ts` is the in-memory "database" over this seed — mutations (e.g. `markNotificationRead`) persist for the session, same as a real backend would, just not across a reload.
