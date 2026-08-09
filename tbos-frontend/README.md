# TBOS Frontend

The Tuba Broker OS application foundation — Application Shell, Routing, RBAC, Mock API, and every other cross-cutting system the 49-screen Broker OS is built on top of. This is the **Frontend Foundation** phase: no business features are implemented. See [`TBOS_FRONTEND_FOUNDATION_REPORT.md`](../TBOS_FRONTEND_FOUNDATION_REPORT.md) for the full phase report.

Authoritative sources this app implements (never contradicted, never redefined):

```
tbos-definition/   → TBOS Product Constitution
tbos-blueprint/     → TBOS Experience Blueprint
design-system/      → TBOS Design System
```

## Quick start

```bash
npm install
npm run dev       # http://localhost:5173
```

Sign in as any of the 7 seeded personas (Solo Broker, Agency Owner, Sales Manager, Marketing Manager, Operations Manager, Property Consultant, Administrator) — no password, this is mock auth. Sara Al-Otaibi holds two roles (Agency Owner + Property Consultant) to demonstrate the persona switcher.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) then production build |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:ui` | Vitest's browser UI runner |
| `npm run lint` | ESLint |
| `npm run format` | Prettier — write |
| `npm run format:check` | Prettier — check only |

## Documentation

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — folder structure, provider composition, key decisions
- [`ROUTING.md`](ROUTING.md) — the screen registry and how routes are generated
- [`RBAC.md`](RBAC.md) — the permission model and its frontend/backend boundary
- [`MOCK_API.md`](MOCK_API.md) — the mock API contract and how to swap in a real backend
- [`STATE_MANAGEMENT.md`](STATE_MANAGEMENT.md) — server/UI/session/permission/flag state boundaries
- [`TESTING.md`](TESTING.md) — what's covered, how to run it, known limitations
- [`SECURITY.md`](SECURITY.md) — frontend security practices and what must be enforced server-side
- [`DEVELOPMENT.md`](DEVELOPMENT.md) — day-to-day workflow, adding a screen/module/permission
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — code style and PR expectations

## Stack

React 18 · TypeScript (strict) · Vite 5 · Tailwind CSS v4 · React Router 7 · TanStack Query 5 · Zustand 5 · Vitest 2 + Testing Library + axe-core.
