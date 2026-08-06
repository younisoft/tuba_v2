# 22 — Master Diagrams

**Status**: Recommended. Index and reading guide for `diagrams/*.mmd`. Each diagram is a visual restatement of reasoning fully documented elsewhere in this folder — the diagrams are navigation aids, not the primary source of truth.

---

## `diagrams/architecture.mmd`

**Shows**: the two-system split (Broker OS vs. Platform Console) and the three-layer module map (Orientation, Operating, Intelligence & Control) within the Broker OS.

**Read alongside**: `06_PRODUCT_ARCHITECTURE.md`, `07_INFORMATION_ARCHITECTURE.md`.

**Key thing to notice**: Settings (RBAC) and Today both have dotted cross-cutting arrows into the Operating and Intelligence layers — this is deliberate. RBAC scopes *visibility* into every other module; Today is a *derived view* across every Operating-layer module, not a module with its own independent data. Neither is a normal "depends on" relationship, which is why they're dotted rather than solid.

## `diagrams/navigation.mmd`

**Shows**: how a broker's role (RBAC) determines what they see, and how that scoped tree is then presented across desktop/tablet/mobile, with Global Search and Quick Actions as universal cross-cutting entry points.

**Read alongside**: `08_NAVIGATION_SYSTEM.md`, `07_INFORMATION_ARCHITECTURE.md`'s role-visibility table.

**Key thing to notice**: the Administrator branch terminates immediately at "Platform Console ONLY" — there is no path from that role into any Broker OS device pattern. This is the diagram's visual enforcement of Article V of `00_PRODUCT_CONSTITUTION.md`.

## `diagrams/journeys.mmd`

**Shows**: two core workflows in full — **New Lead** (the P0 workflow, given the severity of the defect it replaces) and **New Property** (demonstrating the front-loaded-requirements principle in practice).

**Read alongside**: `09_WORKFLOW_ARCHITECTURE.md`, and directly contrast against `../tuba-current-state/diagrams/workflow.mmd`, which diagrams the **current, confirmed-broken** version of the same lead-handling journey (an agent's own contact info appearing as the "sender"). Viewing both diagrams side by side is the fastest way to understand exactly what TBOS's Leads module fixes.

**Key thing to notice**: the New Lead journey has two distinct capture paths (buyer-inbound and owner-originated) that immediately converge into one routing/SLA/notification pipeline — this is the literal diagram of the "unified pipeline" concept referenced throughout `06_PRODUCT_ARCHITECTURE.md`, `13_NOTIFICATION_STRATEGY.md`, and `17_FEATURE_PRINCIPLES.md`'s worked example 1.

## `diagrams/modules.mmd`

**Shows**: the full module dependency graph — which modules cannot function without which others, derived directly from every module's "Depends On" field in `16_MODULE_SPECIFICATIONS.md`.

**Read alongside**: `16_MODULE_SPECIFICATIONS.md`, `19_PRODUCT_ROADMAP.md`.

**Key thing to notice**: Settings, Wallet, and Knowledge have no outgoing arrows — they are the foundational/leaf modules everything else depends on, which is exactly why `19_PRODUCT_ROADMAP.md` sequences RBAC (Settings) into Phase 1 and Wallet into Phase 2, rather than treating them as late-stage configuration screens the way Tuba's current platform effectively does today.

---

## How these diagrams relate to `tuba-current-state/diagrams/`

The prior assessment's diagrams (`feature-map.mmd`, `navigation.mmd`, `workflow.mmd`, `component-tree.mmd`) document what **currently exists** and its defects. This folder's diagrams document what **TBOS should be**. They are deliberately not drawn in the same visual style as a coincidence — the contrast is the point. Anyone reviewing this constitution should be able to place both sets side by side and see exactly what changed and why, with every change traceable back to a cited finding.
</content>
