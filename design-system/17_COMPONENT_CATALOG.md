# 17 — Component Catalog

The full component inventory, cross-referenced to the screens in [`tbos-blueprint/04_SCREEN_INVENTORY.md`](../tbos-blueprint/04_SCREEN_INVENTORY.md) that consume it. Anatomy/variants/states/accessibility rules for each are in [12_COMPONENT_GUIDELINES.md](12_COMPONENT_GUIDELINES.md) — this document is the traceability index proving every component earns its place, and the first place to check before proposing a new one.

**Screen ID legend**: HOME/TODAY/TASK (Orientation) · PROP/PROJ/LEAD/CUST/OWN/CONT/MKT (Operating) · FIN/WAL/ANL/RPT/AUTO/AICP/NOTIF/KB/SET (Intelligence & Control) · GS/QA/CMD/ONB (cross-cutting) · PC (Platform Console, light-spec).

## Navigation & chrome

| Component | Used by | Universal states |
|---|---|---|
| Rail Nav Group | Every Broker OS screen | expanded/collapsed × active/default |
| Tab Bar | Every mobile Broker OS screen | active/default |
| Breadcrumb | All detail/nested-creation screens: PROP-02/03, PROJ-02/03, LEAD-03, CUST-02, OWN-02, CONT-02, MKT-02, RPT-02, AUTO-02, SET-01–04 | n/a |
| Tab Group | PROP-02, CONT-02, SET-02, AICP-02 | default/active/disabled(RBAC) |
| Slide-over Panel | PROP-02 (linked Leads/Contract), OWN-02 (linked Marketing Requests), CUST-02, TASK-02 | open/closed, sm/md/lg |
| Command/Search Bar | Top Bar, all screens | default/focused |
| Command Palette (CMD-01) | Global, keyboard-invoked | query mode / action mode |
| Global Search (GS-01) | Global | Empty(zero-result)/Loading/Success |

## Data display

| Component | Used by | Universal states |
|---|---|---|
| Record List | PROP-01, PROJ-01, LEAD-02, CUST-01, OWN-01, CONT-01, MKT-01, TASK-01, AUTO-01, RPT-01, PC-01/02 | Empty/Loading/Error/Success, comfortable/compact |
| Kanban Board | LEAD-01 | Empty(per-column)/Loading/Error/Success |
| Detail Header | PROP-02, PROJ-02, LEAD-03, CUST-02, OWN-02, CONT-02, MKT-02, RPT-02, WAL-02 | n/a |
| Status Badge | Every screen rendering a Property/Lead/Contract/Marketing Request/Wallet/AI-action state | see [03_COLOR_SYSTEM.md](03_COLOR_SYSTEM.md) §3 per-module map |
| Metric Tile | HOME-01, TODAY-01 (summary), FIN-01, WAL-01, ANL-01 | Loading(skeleton)/Error(per-tile)/Success |
| Price/Status History Timeline | PROP-02, LEAD-03, CONT-02 | Empty/Success |
| Compliance Checklist | PROP-03, CONT-02, SET-04 | incomplete/complete per item |
| Data Table | FIN-01, RPT-01/02, ANL-01 | Empty/Loading/Error/Success |

## Data entry

| Component | Used by | Universal states |
|---|---|---|
| Form Field | PROP-03, PROJ-03, LEAD-03(edit), CUST-02(edit), OWN-02(edit), CONT-02(edit), MKT-02, SET-01/02/03, ONB-01 | default/focus/error/disabled/read-only |
| Wizard/Stepper | PROP-03, PROJ-03, ONB-01 | step-indexed |
| File/Media Uploader | PROP-03, PROJ-03, SET-04 (compliance docs) | empty/uploading/error/success |
| Toggle Switch | SET-01/02/03, NOTIF-02, AUTO-02 | on/off, saving |
| Filter/Sort Bar | Every Record List screen, ANL-01, RPT-01 | default/filters-active |
| Bulk Action Bar | PROP-01, LEAD-01/02, CUST-01, CONT-01, TASK-01 | hidden/visible(count) |

## Feedback & state

| Component | Used by | Notes |
|---|---|---|
| Empty State Block | Every list/pipeline screen on first use or zero-result | Copy contract: [16_CONTENT_GUIDELINES.md](16_CONTENT_GUIDELINES.md) |
| Skeleton Loader | Every screen with async data (i.e., every screen) | Shape-matched, [12_COMPONENT_GUIDELINES.md](12_COMPONENT_GUIDELINES.md) §4 |
| Confirmation Dialog | WF-DELETION, WF-ARCHIVING, WF-PUBLISHING triggers across PROP/PROJ/LEAD/CONT/MKT | standard / destructive(`alertdialog`) |
| Inline Success Confirmation | Every form submit, Toggle Switch, Quick Action completion | auto-dismiss unless actionable |
| Error Inline/Banner | Every Form Field; every screen's Error state | inline(field) / banner(page) |

## AI & decision support

| Component | Used by | Notes |
|---|---|---|
| Explainability Popover | TODAY-01 entries, HOME-01 tiles, ANL-01/RPT-02 metrics, all Recommendation Cards | Five-question contract, [12_COMPONENT_GUIDELINES.md](12_COMPONENT_GUIDELINES.md) §5 |
| Recommendation Card | TODAY-01, HOME-01, LEAD-01/02/03 (AI-suggested next action) | Urgency-tiered |
| AI Suggestion Inline Block | PROP-03/MKT-02 (AI-drafted listing/campaign copy), LEAD-03 (AI-drafted reply) | Editable, never silent |
| AI Conversation Thread | AICP-01 | Streaming |
| Confidence Indicator | Every AI Suggestion Inline Block and Recommendation Card | High/Medium/Low |

## Domain-specific

| Component | Used by |
|---|---|
| Marketing Request Card | OWN-03 (canonical), TODAY-01 (derived) |
| SLA Timer | LEAD-03 (response-time), OWN-03 |
| Quota/Balance Meter | WAL-01, WAL-02, HOME-01 |
| Permission Scope Selector | SET-02 |
| Notification List Item | NOTIF-01, Top Bar bell dropdown, mobile Notifications tab |

## Platform Console (PC-01–05) — light spec, this phase

Reuses Record List, Data Table, Form Field, Confirmation Dialog, and Status Badge from the Broker OS catalog above — the Platform Console is architecturally separate ([00_DESIGN_SYSTEM_FOUNDATION.md](00_DESIGN_SYSTEM_FOUNDATION.md) §7 note, `tbos-definition` Article V) but shares the same visual system. It does not get its own component set; a future Platform Console-specific screen still checks this catalog first.

## Adding a component not listed here

State, in writing, which screen from `04_SCREEN_INVENTORY.md` needs it and why no existing component (with a new variant, if needed) can serve — the same bar `05_COMPONENT_MAPPING.md` §3 sets for the blueprint layer. Add the approved component to this catalog and to [12_COMPONENT_GUIDELINES.md](12_COMPONENT_GUIDELINES.md) in the same change; a component used in implementation but absent from both is a defect.
