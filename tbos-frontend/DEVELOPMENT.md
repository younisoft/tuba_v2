# Development

## Node version note

This environment runs Node 20.11.1. `vitest@4`/`jsdom@30`/`@testing-library/jest-dom@7` (and Vite's own `create-vite` scaffolder) require Node ≥20.19/22.12 for a `node:util` API (`styleText`) that doesn't exist in 20.11. This repo pins `vitest@^2.1.9`, `jsdom@^25.0.1`, and `@testing-library/jest-dom@^6.9.1` instead — fully compatible, no functionality lost for this project's needs. If your Node is ≥20.19, upgrading those three back to latest is safe and not required.

## Day-to-day

```bash
npm run dev          # dev server with HMR
npm test             # full test run
npm run lint          # ESLint
npm run format        # Prettier write
npm run build          # type-check + production build
```

Before committing: `npm run lint && npm test && npm run build` should all be clean — that's the same bar `TBOS_FRONTEND_FOUNDATION_REPORT.md`'s quality gate checks.

## Adding a screen, module, or permission

See `ROUTING.md` and `RBAC.md` — both are registry-driven, so adding one is a data change (a new array entry), not new plumbing.

## Adding an API endpoint

1. Add mock data to `mocks/data/seed.ts` if it's a new entity, keeping relationships hand-linked (real `agencyId`/`ownerId`/etc. references — see `MOCK_API.md`).
2. Add query/mutation helpers to `mocks/api/db.ts`.
3. Add a thin wrapper in `lib/api/endpoints/<name>.ts` using `apiClient.request()` — follow `notifications.ts`'s pattern.
4. Consume it from a React Query hook (`useQuery`/`useMutation`) in the feature that needs it, not directly from a component.

## Adding an AI capability

`lib/ai/types.ts`'s `AiActionKind` union (`recommendation` | `explanation` | `generation` | `summarization` | `classification` | `automation`) covers every capability named in `tbos-definition/10_AI_STRATEGY.md`. Add a canned response for a new kind to `CANNED_RESPONSES` in `lib/ai/mockAiAdapter.ts` for prototyping; a real implementation replaces `mockAiAdapter.request()`'s body with an actual model call behind the same `AiProviderContract`.

## Adding a component

Check `design-system/17_COMPONENT_CATALOG.md` first — if an existing component (with a new variant) can serve, use it. `components/ui/` holds design-system primitives; anything screen-specific belongs in that screen's `features/<module>/` folder once it has real content.

## Design tokens

Never hand-write a hex/px/ms value in a component. Every value comes from `styles/tokens.css` (CSS custom properties) via the Tailwind classes `src/tokens/tailwind-theme.ts` maps them to (e.g. `bg-bg-brand`, `text-text-danger`, `duration-fast`). If a token you need doesn't exist, it needs to be added to `design-system/tokens.json` first (out of this project's scope) — don't invent a one-off value.
