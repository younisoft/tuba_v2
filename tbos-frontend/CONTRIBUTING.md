# Contributing

## Before opening a PR

- `npm run lint`, `npm test`, and `npm run build` all pass.
- New registry entries (screens/modules/permissions/flags) follow the patterns in `ROUTING.md`/`RBAC.md` — don't hardcode a route/permission check outside the registry.
- No hardcoded colors/spacing/typography — see `DEVELOPMENT.md` "Design tokens".
- RTL: if you touch layout, verify it with `dir="rtl"` (toggle the language switcher in the top bar) — logical properties (`ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`) only, never `ml-`/`mr-`/`left-`/`right-`.
- Accessibility: interactive elements are real semantic elements (`<button>`, `role="switch"`, etc.) with an accessible name — see `tbos-blueprint/11_ACCESSIBILITY_BLUEPRINT.md`.

## Code style

Enforced by ESLint + Prettier (`npm run lint` / `npm run format`) — don't hand-format against the grain of the config. TypeScript strict mode is on; avoid `any` (if you must, comment why).

## Commit scope

Keep PRs scoped to one concern (one new module, one bugfix, one doc update) — this foundation is meant to stay easy to extend without a feature touching five unrelated files.

## Out of scope for this phase

Per the master prompt's non-goals: no business-feature screen content, no real backend integration, no real authentication, no payment integration. If your change needs one of those, it belongs in the next implementation phase (TBOS Component Library / feature phases), not this foundation.
