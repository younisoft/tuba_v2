# 19 — Master Mermaid Diagrams

Index and reading guide for `diagrams/*.mmd` in this folder — diagrams are navigation aids, not primary source of truth (the reasoning lives in the numbered documents; a diagram only makes structure visible faster). Mirrors the indexing pattern of `tbos-definition/22_MASTER_DIAGRAMS.md`, one level more concrete: these diagrams render actual screen IDs, release names, and state names from this blueprint rather than strategy-level concepts.

| Diagram file | Shows | Read alongside | Key thing to notice |
|---|---|---|---|
| `diagrams/navigation.mmd` | RBAC-driven visibility branching per persona code, the three-device navigation model (desktop rail / tablet icon-rail / mobile tab bar), and Global Search / Command Palette / Quick Actions as cross-cutting entry points reachable from every branch | [02_NAVIGATION_BLUEPRINT.md](02_NAVIGATION_BLUEPRINT.md), extends `tbos-definition/diagrams/navigation.mmd` down to screen IDs | The Administrator branch terminates immediately at Platform Console with no path into any Broker OS device pattern — the same architectural-isolation enforcement as the source diagram, now visible at the device-navigation layer specifically |
| `diagrams/journeys.mmd` | Two full decision-tree flowcharts: Receiving Leads (WF-LEAD-NEW) and Publishing a Property (WF-PROPERTY-NEW), rendered with every branch point from [03_USER_JOURNEYS.md](03_USER_JOURNEYS.md) journeys 2 and 3 | [01_EXPERIENCE_ARCHITECTURE.md](01_EXPERIENCE_ARCHITECTURE.md), [03_USER_JOURNEYS.md](03_USER_JOURNEYS.md); contrast against `tuba-current-state/diagrams/workflow.mmd` (the current, confirmed-broken lead journey) | The "no confident match" and "SLA breach" branches both resolve to a visible, non-dead-end state rather than silently disappearing — the literal diagram of the misrouting-bug fix |
| `diagrams/states.mmd` | The Property/Project 8-state lifecycle and the Lead pipeline stage machine, as explicit state-transition diagrams with terminal/risk states color-coded | [06_STATE_ARCHITECTURE.md](06_STATE_ARCHITECTURE.md) §2 | Rejected (Property) and Lost/SLA-Breach (Lead) both have a path back into the normal flow — neither lifecycle has a true dead-end state short of Archived |
| `diagrams/dependencies.mmd` | Every module/feature from [14_DEVELOPMENT_BLUEPRINT.md](14_DEVELOPMENT_BLUEPRINT.md) grouped into its release (R0–R7), with dependency arrows crossing release boundaries | [14_DEVELOPMENT_BLUEPRINT.md](14_DEVELOPMENT_BLUEPRINT.md), [13_FEATURE_READINESS_MATRIX.md](13_FEATURE_READINESS_MATRIX.md); extends `tbos-definition/diagrams/modules.mmd` (which stops at module-to-module dependency) into release sequencing | Platform Console has a dotted, non-blocking arrow from R1 — it's the one workstream confirmed able to start immediately, in parallel with everything else, without affecting Broker OS sequencing at all |

## Relationship to `tbos-definition/diagrams/` and `tuba-current-state/diagrams/`

Three diagram sets now exist across the repository, each answering a different question:

1. `tuba-current-state/diagrams/` — what currently exists and where it breaks (the audit).
2. `tbos-definition/diagrams/` — what TBOS should be at the product/strategy level (the constitution).
3. `tbos-blueprint/diagrams/` (this folder) — exactly which screen, in which release, implements each piece of that strategy (the build plan).

Reading all three side by side for the same workflow (e.g., lead handling) shows the complete arc: the confirmed defect, the architectural fix, and the concrete screens/release that deliver it.

## Rendering note

Every `.mmd` file in this folder is valid standalone Mermaid source (flowchart or state diagram syntax) and can be rendered directly by any Mermaid-compatible viewer, pasted into an Artifact, or embedded in design-system tooling downstream — no additional preprocessing required.
