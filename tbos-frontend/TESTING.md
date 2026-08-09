# Testing

`npm test` runs the full suite once (Vitest + jsdom); `npm run test:watch` for the interactive loop.

## What's covered today (`src/tests/`)

| File | Covers |
|---|---|
| `registry.test.ts` | Screen/module registry integrity — no duplicate IDs/routes, every permission/module reference resolves, every nav-entry module has a resolvable primary screen |
| `permissions.test.ts` | RBAC evaluation — role grants, scope checks (`own` vs `agency`), Platform Console isolation, that every granted permission exists in the registry |
| `featureFlags.test.ts` | Registry defaults, dev overrides, `rolloutRoles` scoping |
| `mockApi.test.ts` | `ApiResponse` success/error envelopes, plain-language error messages, notification/wallet endpoints against the seed data |
| `theme.test.ts` | `data-theme` attribute + persisted-key behavior for light/dark/system |
| `rtl.test.ts` | `dir`/`lang` attribute setting; that every English dictionary key has an Arabic counterpart (no leaked-token risk) |
| `errorStates.test.tsx` | `EmptyState`/`ErrorState`/`Switch` render with correct roles, accessible names, and working actions |
| `a11y.test.tsx` | axe-core static-structure checks on `Button`/`Badge`/`EmptyState` |
| `routing.test.tsx` | End-to-end: unauthenticated → `/login` redirect; authenticated → permitted screen; RBAC-denied direct URL → `NoPermissionState`; ADM never reaches Broker OS routes |

`testUtils.tsx` provides `<TestProviders>` — every provider `AppProviders` composes except `BrowserRouter` (swapped for `MemoryRouter` so tests control the starting URL) and `ThemeProvider`/`LocaleProvider`/`ErrorBoundary` (irrelevant to most component tests).

## Accessibility testing — what axe-core in jsdom can and can't catch

`a11y.test.tsx` runs real axe-core rules (structural: labels, roles, landmarks, `color-contrast` explicitly disabled) against components rendered in jsdom. This catches missing accessible names, bad ARIA usage, and heading-order problems — the class of bug most likely to regress silently. It does **not** catch anything that depends on actual paint (real contrast ratios, focus-ring visibility, layout-based touch-target sizing). Those need a real-browser pass — Playwright + `@axe-core/playwright`, or manual review against `tbos-blueprint/11_ACCESSIBILITY_BLUEPRINT.md`'s checklist — which is out of scope for this phase's unit-test layer and named as deferred work in the final report.

## What isn't covered yet

- Component-level Storybook/isolation testing beyond the `a11y.test.tsx` smoke set (master prompt §33 asks for "only enough foundation to prove" token/theme/RTL/a11y/isolation — that's what these tests do; a full Storybook setup is Component Library phase work).
- Visual regression testing.
- Real-browser E2E (the manual RBAC/RTL/mobile verification for this phase was done via Playwright MCP during development, not checked into the automated suite).

## Adding a test for a new registry entry

If you add a screen/module/permission (see `ROUTING.md`/`RBAC.md`), `registry.test.ts` and `permissions.test.ts` already re-run against the full registry — you don't need a new test file unless you're testing screen-specific *behavior* (once a screen has real content).
