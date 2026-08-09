# Security

Frontend-foundation practices in place today, and what a real deployment must still enforce server-side.

## In place

- **Environment variables**: `app/config/env.ts` is the only file reading `import.meta.env`. No secret has ever been placed in a Vite env var here — anything under `import.meta.env` ships in the client bundle, so this project treats that as a hard rule, not a reminder.
- **No tokens in logs**: `lib/logging/logger.ts` accepts a free-form `data` object; callers are responsible for never passing credentials/tokens, and no call site in this codebase does. `mocks/data/seed.ts` has no real credentials (it's mock data).
- **Safe storage**: `localStorage` is used only for non-sensitive UI/session preferences (theme, locale, rail-collapsed, the mock session object) via Zustand's `persist` middleware. A real auth token would need httpOnly-cookie or short-lived-memory storage instead — `localStorage` is not an acceptable place for one.
- **Sanitized rendering**: no component uses `dangerouslySetInnerHTML`. AI-generated text (`lib/ai/mockAiAdapter.ts`) is rendered as plain text, never interpreted as HTML.
- **RBAC as UX, not the boundary**: see `RBAC.md` — every permission check here is explicitly documented as non-authoritative.
- **Permission boundaries**: the Platform Console (`ADM`) and Broker OS roles share zero permissions by construction (`lib/permissions/rolePermissions.ts`) — see `ROUTING.md`'s Platform Console section for the one remaining UI-surface gap.

## Must be enforced server-side (not provided by this phase)

- **Authoritative authorization** — every mutation a real backend receives must independently verify the caller's permission, never trusting a client-supplied role/permission claim.
- **Session/token validation** — this phase's "session" is a mock object in `localStorage` with no real token, signature, or expiry check. A real `AuthProvider` implementation needs actual token validation and refresh.
- **Rate limiting, CSRF, input validation** — none of these exist in the mock API layer; they're backend/infrastructure concerns a real API gateway must own.
- **Secure external links** — no external links exist in this phase's placeholder content; when real content is added, external links should use `rel="noopener noreferrer"`.

## Dependency posture

`npm audit --omit=dev` reports one moderate advisory: `esbuild` ≤0.24.2 (pulled in transitively via `@tailwindcss/vite` → `vite`) allows any website to send requests to the **dev server** and read the response — [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99). It does not affect the production build output (no dev server ships), only `npm run dev`. Fixing it requires an upgrade to Vite 6/7 (breaking change, not taken in this phase — pinned versions here are chosen for Node 20.11 compatibility, see `DEVELOPMENT.md`). Re-evaluate when this project's Node/Vite versions are next upgraded.

`npm audit` (including devDependencies) additionally reports advisories in test-only tooling, none of which ship in any build output.
