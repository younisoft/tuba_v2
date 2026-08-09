# TBOS Contracts + Compliance UX Consistency Audit

**Scope**: before building CONT-01/CONT-02, does the current TBOS implementation (First Vertical Slice, Properties, Relationship Intelligence) give Contracts a coherent grammar to extend — and what does the actual canonical source say about Contracts specifically, since it was only ever a placeholder screen until now?

**Method**: fresh, exhaustive research pass over `tbos-definition/` and `tbos-blueprint/` (screen inventory, state architecture, component mapping, acceptance criteria, notification/decision-support docs, open questions, feature readiness matrix), cross-checked against direct inspection of the current source: `types/entities.ts`'s existing `Contract`/`ContractStatus`, `screenRegistry.ts`'s CONT-01/CONT-02 entries, `permissionRegistry.ts`/`rolePermissions.ts`'s `contracts.*` grants, `mocks/data/seed.ts`'s `CONTRACTS`, and — critically — `registry/components/componentRegistry.ts`'s four already-built, never-consumed Compliance components (`ComplianceStatus`, `ComplianceExpiry`, `ComplianceChecklist`, `ComplianceDocument`, all registered with `screenIds` including `'CONT-02'` since the Component Library phase).

## Summary

| Severity | Count | Blocking this slice? |
|---|---|---|
| P0 | 0 | — |
| P1 | 1 | Yes — fixed below |
| P2 | 2 | No — documented, one fixed anyway |
| P3 | 1 | No — documented, deferred |

## Findings

### P1-1 — CONT-02 was about to be built with tabs it never had a spec for

- **Finding**: every prior detail-screen precedent in this codebase (PROP-02, OWN-02) uses a `Tabs` pattern, and the natural instinct going into this phase was to mirror it for CONT-02. Fresh research proves this would have been fabrication: `tbos-definition/07_INFORMATION_ARCHITECTURE.md`'s Contracts tree lists only "All Contracts" and "Contract Detail" with no sub-structure (contrast Property/Project, which explicitly say "tabs, not sub-pages"), and `tbos-blueprint/05_COMPONENT_MAPPING.md`'s CONT-02 row lists `Detail Header, Compliance Checklist, Status Badge, AI Suggestion Inline Block, Confirmation Dialog` — no "Tab Group," where PROP-02/OWN-02's rows explicitly include one.
- **Why it matters**: this is exactly the kind of silent architecture invention the master prompt forbids ("Do NOT create sub-routes if the blueprint explicitly defines tabs" — the inverse failure, inventing tabs the blueprint doesn't define, is just as real a fabrication).
- **Fix**: CONT-02 is built as a single, non-tabbed page — terms + compliance checklist + documents + activity, all in one scroll, per spec.
- **Status**: **Fixed** (caught before implementation, not after).

### P2-1 — Four registered Compliance components have never been consumed

- **Finding**: `ComplianceStatus`, `ComplianceExpiry`, `ComplianceChecklist`, `ComplianceDocument` (`TBOS-CMP-COMPLIANCE-001` through `-004`) were built in the Component Library phase, explicitly registered with `screenIds` including `'CONT-02'` (and `'SET-04'`, `'PROP-03'`) — but Properties' Compliance tab (Phase 6) never used them, instead composing equivalent logic inline with `Badge`/`Alert` and a locally-defined 5-state `ComplianceRequirementStatus` (`missing`/`pending_verification`/`verified`/`expiring`/`expired`) that doesn't match `ComplianceStatus`'s registered 6-state vocabulary (`not_started`/`pending_verification`/`verified`/`expiring`/`expired`/`mismatch` — note the extra `mismatch` state, which exists specifically for Document Intelligence's mismatch-flagging scenario, §6 below).
- **Why it matters**: this is a real, pre-existing inconsistency between what's registered and what's built — exactly what this audit exists to catch.
- **Fix (scoped)**: retrofitting Property's already-shipped Compliance tab (with its own passing tests asserting the exact text "Missing") is out of this phase's scope and would be a regression risk for no product benefit. Instead, **CONT-02 — the screen these components were actually built for — uses them as designed**, resolving the inconsistency going forward without destabilizing Properties. Documented here so a future reader understands why Property and Contract compliance render with different (but both internally consistent) state vocabularies, rather than assuming drift.
- **Status**: Resolved for Contracts; Properties' variant documented as a known, deliberately-not-retrofitted difference.

### P2-2 — Contract's existing minimal shape omits fields the source docs treat as first-class

- **Finding**: the pre-existing `Contract` type (`{ id, agencyId, leadId, propertyId, status, valueSar }`, dating to the Foundation phase) has no `customerId`/`ownerId`, while `tbos-definition/16_MODULE_SPECIFICATIONS.md` and `tbos-blueprint/04_SCREEN_INVENTORY.md` both list a contract's required data as "linked **Lead/Customer/Owner/Property**" — all four as direct, first-class links, not merely Lead/Property with Customer/Owner reachable transitively (contrast Phase 7, where Customer↔Owner genuinely has no direct link in the spec and transitive derivation was correct there).
- **Fix**: `Contract` gains direct `customerId`/`ownerId` fields, consistent with the source documents' own phrasing. Existing seed contracts updated to the real, already-consistent values (`ct-1`'s `customerId`/`ownerId` match its `leadId`'s `customerId` and `propertyId`'s `ownerId`, etc. — verified, not guessed).
- **Status**: **Fixed.**

### P3 — documented, deferred (not a defect)

**Contract-type-specific compliance checklist content is explicitly unresolved in the source itself** — not merely undocumented by omission, but formally flagged: `tbos-blueprint/13_FEATURE_READINESS_MATRIX.md`: "Compliance-checklist-per-contract-type needs Operations input on the exact checklist items per contract type — a domain-expertise decision this blueprint can't make unilaterally," and `tbos-blueprint/18_OPEN_QUESTIONS.md` lists it with owner "Operations Manager domain expert (internal) + Legal." This phase implements the compliance *mechanism* (checklist UI, blocking/non-blocking states, Document Intelligence mismatch flagging, OM/AO-gated approval — all real, documented behavior) with a minimal, honestly-labeled generic checklist (identity verification via Nafath — an already-documented TBOS integration reused here, not invented; linked-property compliance, computed from the real linked Property's actual compliance state, zero fabrication; document verification) rather than inventing named legal requirements (no fabricated "Ejar Registration" or similar — confirmed via exhaustive search that Ejar does not appear anywhere in TBOS's own source documents). Flagged here as a DEFERRED PRODUCT DECISION per the master prompt's own instruction, not silently decided.

## Answers to the master prompt's implicit consistency questions

**Headers/layouts**: CONT-01 uses `PageHeader` + `FilterBar` + `DataTable`, identical grammar to CUST-01/OWN-01/PROP-01. CONT-02 uses `EntityDetailHeader`, identical grammar to CUST-02 (no tabs) rather than PROP-02/OWN-02 (tabs) — a deliberate, spec-driven difference, not drift.

**Status badges**: Contract's own lifecycle (`ContractStatusBadge`, new) follows the exact `LeadStageBadge`/`PropertyStatusBadge` pattern — dictionary-driven from day one (learning directly from Phase 6's P1-2 finding, never shipping a hardcoded-English badge again).

**Compliance**: now has two deliberately different implementations (Property's inline `Badge` rows, Contract's registered `ComplianceChecklist`/`ComplianceDocument` components) — documented as intentional (P2-1), not a new inconsistency being introduced.

**Search/RBAC**: `searchIndex.ts` gains a Contracts block built scope-correct from the start, directly applying the P0-1 lesson from Phase 7 (never ship agency-membership-only scoping for a new entity again) — verified by new regression tests before any other Contract UI was built.

## Verdict

0 P0, 1 P1 (fixed — tabs correctly not built), 2 P2 (one fixed by using the registered components as designed, one fixed by adding the spec'd direct relationships), 1 P3 (documented, deferred, matches the source's own explicit "Needs Business Validation" flag). `npm run test` — 125/125 passing before any Contract code was written. Proceeding to the Contracts + Compliance Vertical Slice.
