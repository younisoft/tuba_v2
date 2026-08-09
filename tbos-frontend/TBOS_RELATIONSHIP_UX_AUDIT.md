# TBOS Relationship UX Audit

**Scope**: before building Customers/Owners as real screens, does the current TBOS implementation (First Vertical Slice + Properties Vertical Slice) represent the relationships between Lead, Customer, Property, and Owner correctly — or does identity resolve to a name with no path back to the canonical record?

**Method**: direct source inspection of `LeadDetailScreen.tsx`, `PropertyDetailScreen.tsx`, `EntityDetailHeader.tsx`/`EntityMeta.tsx`, `searchIndex.ts`, `mocks/api/db.ts`, `mocks/data/seed.ts`, `NotificationCenterScreen.tsx`, `ActivityTimeline.tsx`, and `rolePermissions.ts`, cross-checked against a fresh, exhaustive research pass over `tbos-definition/` and `tbos-blueprint/` for the canonical Customer/Owner/Marketing Request specification (screen IDs, fields, states, acceptance criteria).

## Summary

| Severity | Count | Blocking this slice? |
|---|---|---|
| P0 | 1 | Yes — fixed below |
| P1 | 3 | Yes — all fixed below |
| P2 | 1 | No — fixed anyway (small, directly relevant) |
| P3 | 2 | No — documented, deferred |

## Findings

### P0-1 — Customer/Owner search leaks PII outside the viewer's scope (correctness + privacy bug)

- **Finding**: `lib/search/searchIndex.ts`'s Customer and Owner blocks gate only on `ctx.can('customers.view')` / `ctx.can('owners.view')` (does the role hold the permission *at all*) and filter by `agencyId` only — never by the `'own'` scope tier. This is the exact bug class Phase 6's P1-1 fixed for Leads/Properties (`TBOS_PRODUCT_UI_CONSISTENCY_AUDIT.md`), reintroduced here because Customers/Owners were stubbed before that fix existed and were never revisited.
- **Evidence**: `rolePermissions.ts` grants PC/SB `customers.view`/`owners.view` at `'own'` scope, not agency scope. `searchIndex.ts` lines 64–80 loop `db.customers`/`db.owners`, checking only `c.agencyId === ctx.agencyId`.
- **Why it matters**: unlike Leads/Properties, Customer and Owner records carry a `phone` field — direct PII. An agency-wide search leak here doesn't just reveal "a lead exists," it hands another consultant a colleague's private client's name and phone number, exactly what master prompt §39 calls out as the highest-stakes privacy surface in this phase.
- **Fix**: `customersForUser`/`ownersForUser` added to `mocks/api/db.ts`, scoped via `scopeFor()`. Because `Customer`/`Owner` have no stored `assigneeId`/`brokerId` field (§P1-3 below explains why), `'own'` scope is derived transitively: a Customer is "own" if any of its Leads (`Lead.customerId`) is assigned to the viewer; an Owner is "own" if any of its Properties (`Property.ownerId`) is brokered by the viewer. `searchIndex.ts`'s Customer/Owner blocks now call the same scoped lookups instead of the raw `db.customers`/`db.owners` arrays. Regression tests added to `tests/search.test.ts`.
- **Status**: **Fixed.**

### P1-1 — Lead Detail shows the Customer's name but never links to Customer Detail

- **Finding**: `LeadDetailScreen.tsx` resolves `customer = customers.find(...)` and renders `customer.name` as the header `<h1>` title and `property.title` as a meta-row label — both plain text, no navigation.
- **Why it matters**: master prompt §14/§26 requires every relationship to be actionable and to resolve to the canonical entity screen. Lead Detail already *has* the resolved Customer/Property records in scope — the only gap is that clicking them does nothing.
- **Fix**: `EntityDetailHeader`'s `title` prop widened from `string` to `ReactNode` (backward-compatible — every existing string-title call site still type-checks). `EntityMetaItem` gained an optional `onClick`; `EntityMeta.tsx` renders those items as real `<button>`s (keyboard-operable, focus-visible) instead of a plain `<li>`. `LeadDetailScreen`'s title is now a link-styled button to `/customers/:customerId` when the customer resolves; the property meta item is now a link-styled button to `/properties/:propertyId`.
- **Status**: **Fixed.**

### P1-2 — Property Detail shows the Owner's name but never links to Owner Detail

- **Finding**: `PropertyDetailScreen.tsx` resolves `owner = owners.find(...)` but renders it inside a single combined meta string, `` `${owner?.name} · ${broker?.name}` `` — not only unlinked, but two different entities (Owner, TeamMember) concatenated into one un-splittable label.
- **Why it matters**: same class of gap as P1-1, on the Owner→Property direction the master prompt names explicitly (§20 "one of the most important flows... both directions must resolve to canonical screens").
- **Fix**: split into two separate `EntityMetaItem`s — owner name (linked to `/owners/:ownerId` via the new `onClick`) and broker name (unlinked — no Team Member detail screen exists in this phase's scope, so it stays plain text, same as before).
- **Status**: **Fixed.**

### P1-3 — `Owner.linkedPropertyIds` has already drifted from `Property.ownerId` (duplicated, inconsistent representation)

- **Finding**: two properties added in the Phase 6 Properties slice (`p-106`, ownerId `o-2`; `p-107`, ownerId `o-1`) were never added to `o-2.linkedPropertyIds` / `o-1.linkedPropertyIds` in `mocks/data/seed.ts`. `Customer.linkedLeadIds` happened to still be consistent with `Lead.customerId` (verified by direct cross-check of all 8 leads), but nothing enforces that — it's the same fragile pattern, just not yet broken.
- **Why it matters**: this is exactly the "relationship duplicated across two sources of truth" failure mode the audit's classification scheme (A/B/C/D) exists to catch, and it already produced a real, silent inconsistency in one phase.
- **Fix**: rather than patch the array and hope it doesn't drift again, an Owner's properties and a Customer's leads are now **derived from the FK side** (`Property.ownerId`, `Lead.customerId`) wherever the frontend needs them — `propertiesForOwner()`/`leadsForCustomer()` in `mocks/api/db.ts` — never read from the stored `linkedPropertyIds`/`linkedLeadIds` arrays. Those two fields remain on the `Customer`/`Owner` types (removing them would be a breaking type change with no benefit this phase) but are no longer treated as authoritative by any new code. The seed-data drift itself was also corrected for data hygiene.
- **Status**: **Fixed.**

### P2-1 — Notification deep-link resolution hardcodes a single screen (`LEAD-03`)

- **Finding**: `NotificationCenterScreen.tsx`'s `targetPath()` special-cases exactly one screen: `if (n.sourceScreenId === 'LEAD-03' && n.sourceRecordId) return \`/leads/${n.sourceRecordId}\`;`. Adding Customer/Owner deep-links (master prompt §36/§66) the same way would mean a third and fourth near-identical `if` line.
- **Why it matters**: small, but this phase adds exactly the two more cases that turn "one special case" into "a pattern crying out to be a lookup table."
- **Fix**: replaced the single `if` with a small `RECORD_ROUTE_BUILDERS: Partial<Record<string, (id: string) => string>>` map (`LEAD-03`, `CUST-02`, `OWN-02`), same behavior for the existing case, generalized for the two new ones. No new architecture — still one `targetPath()` function, still the same `sourceScreenId`/`sourceRecordId` fields.
- **Status**: **Fixed.**

### P3 — documented, deferred

1. **Person / unified identity (one human as both Customer and Owner)** — confirmed absent from every source document (exhaustive grep for "unified identity," "same person," etc. across `tbos-definition/`+`tbos-blueprint/` returns nothing). Customer and Owner remain two independent entities/modules, per master prompt §4's own instruction not to invent a shared-identity architecture the product definition doesn't support. Flagged as a **DEFERRED PRODUCT DECISION** — a real person can today hold a Customer record and an Owner record with no system-level link between them (the existing `c-1-p` "Reem Al-Dosari (own deal)" fixture is a *team member* who is also a Customer, a different, already-supported case — RBAC's `assigneeId`/user-identity link, not a Customer↔Owner identity merge).
2. **Communication log entry schema (channel type, direction, message body)** — the *concept* of an interaction/communication log is real and documented (`tbos-blueprint/05_COMPONENT_MAPPING.md`: "Price/Status History Timeline... Customer interaction log" variant, reusing the same component `ActivityTimeline` already implements). The specific schema of an entry (WhatsApp vs. email vs. call, message content) is not specified anywhere and WhatsApp is documented only as a *notification delivery channel*, not a logged interaction type. This phase's `CustomerActivityKind`/`OwnerActivityKind` therefore stay narrow and generic (`created`, `interaction_logged`, `relationship_stage_changed`, `lead_linked` / `created`, `property_linked`, `marketing_request_*`) rather than inventing a channel taxonomy.

## Answers to the master prompt's critical audit question

**"Can a broker understand the context of a person without navigating through multiple unrelated modules?"** — **Not before this phase's fixes.** Lead Detail and Property Detail both already *compute* the linked Customer/Owner record (§P1-1/P1-2), so the context existed in memory but stopped at a name on screen — the broker could read who the customer was but had no way to click through to that customer's own relationship history, other leads, or activity. After the P1-1/P1-2 fixes plus the two new canonical screens (CUST-02, OWN-02) this phase builds, the answer becomes yes: Customer → Lead → Property and Owner → Property → Lead all resolve in one click each, in both directions.

## Relationship representation classification (per master prompt §6)

| Relationship | Before this phase | After this phase |
|---|---|---|
| Lead → Customer | **B** (name shown, not actionable) | **A** (linked, canonical) |
| Lead → Property | **B** (name shown, not actionable) | **A** (linked, canonical) |
| Property → Owner | **B** (name shown, buried in a combined string) | **A** (linked, canonical) |
| Customer → Lead(s) | **D** (no Customer Detail screen existed) | **A** |
| Owner → Property(ies) | **C** (duplicated, drifted array vs. FK) | **A** (FK-derived, single source of truth) |
| Owner → Marketing Request | **D** (no Owner Detail screen existed) | **A** |
| Today/Notification → Customer/Owner | **D** (screens didn't exist to link to) | **A**, where the underlying Today/Notification signal is itself spec'd (Marketing Requests only — see the Relationship Vertical Slice Report §Today Integration for why Customer/Owner "staleness" recommendations were *not* invented) |

## Verdict

1 P0 (a real PII leak, not yet shipped since Customers/Owners weren't routed screens until this phase, but present in the search index already), 3 P1, 1 P2 — all fixed before any new screen was built. 2 P3s documented and correctly out of scope. `npm run test` — 109/109 passing (Properties Vertical Slice baseline) before any Customers/Owners screen code was written. Proceeding to the Relationship Vertical Slice.
