# Consolidated Mermaid Diagrams

All diagrams from this phase (and the Phase 1 audit) in one place for quick reference. Source of truth for the Phase-1 diagrams is `diagrams/*.mmd`; source of truth for Phase-2 diagrams is the individual documents linked below — this file is a convenience index, not a new source.

## Site Map (Phase 1 — `diagrams/site-map.mmd`)

See [[03_INFORMATION_ARCHITECTURE]] and `diagrams/site-map.mmd`.

## Permissions (Phase 1 — `diagrams/permissions.mmd`, superseded in detail by Phase 2)

See [[27_PERMISSION_MATRIX]] for the full matrix; `diagrams/permissions.mmd` for the flow diagram.

## Listing Workflow (Phase 1 — `diagrams/workflow.mmd`)

See `diagrams/workflow.mmd`, extended in Journey 1 and 2 below.

## Feature Map (Phase 1 — `diagrams/feature-map.mmd`)

See `diagrams/feature-map.mmd`.

---

## Entity Relationship Diagram (Phase 2 — [[23_DATA_MODEL]])

```mermaid
erDiagram
  AGENCY ||--o{ USER : employs
  AGENCY ||--o| LICENSE : holds
  AGENCY ||--o{ LISTING : owns
  AGENCY ||--o| CREDIT_BALANCE : has
  AGENCY ||--o| PACKAGE_SUBSCRIPTION : subscribes_to
  AGENCY ||--o{ LEAD : receives

  USER ||--o| LICENSE : "may view (sharing toggle)"
  USER ||--o| AGENT_PERFORMANCE : has
  USER ||--o{ CREDIT_TRANSACTION : performs
  USER ||--o{ TASK : assigned
  USER ||--o| PREFERENCES : configures
  USER ||--o{ NOTIFICATION : receives

  LISTING ||--o{ MEDIA : contains
  LISTING ||--o{ LEAD : generates
  LISTING ||--o{ CREDIT_TRANSACTION : consumes_via
  LISTING }o--|| REGION : located_in
  LISTING ||--o| LICENSE : validated_by

  LEAD ||--o{ TASK : has
  LEAD }o--o{ LISTING : interested_in

  CREDIT_BALANCE ||--o{ CREDIT_TRANSACTION : depletes_via
  PACKAGE_SUBSCRIPTION ||--o{ CREDIT_TRANSACTION : funds

  AGENT_PERFORMANCE ||--o{ BADGE : tracks
```

## Feature Dependency Graph (Phase 2 — [[32_FEATURE_DEPENDENCY_GRAPH]])

```mermaid
flowchart TD
  L[License: FAL + REGA validity] --> P[Post Listing]
  C[Credits Balance] --> P
  P --> A[Active Listing]
  A --> V[Views / Clicks]
  V --> LE[Leads]
  LE --> TR[TruLeads: Tasks / Follow-up]
  A --> U[Upgrades: Hot/Signature/Refresh/Media]
  U --> C
  A --> AP[Agent Performance: Images/Features Score]
  TR --> AP
  AP --> TB[TruBroker Badges]
  A --> RS[Reports Summary: composition + location]
  V --> RS
  LE --> RS
  L -.expires.-> RM[Removed: Ad License Expired]
  C -.insufficient.-> DR[Draft: Insufficient Credits]
  RM --> P
  DR --> P
```

## User Journey: Create & Publish a Listing (Phase 2 — [[29_USER_JOURNEYS]])

```mermaid
flowchart TD
  A[Click Post Listing] --> B{Choose Type}
  B -->|Sell or Rent Property| C[Property Form]
  B -->|Daily Rentals| C
  C --> D[Submit]
  D --> E{License Valid?}
  E -->|No| F["[Inferred] Block with license error"]
  E -->|Yes| G{Credits Sufficient for Tier?}
  G -->|No| H[Draft: Insufficient Credits]
  G -->|Yes| I{Fully Submitted?}
  I -->|No| J[Draft: Not Posted]
  I -->|Yes| K[Listing Active / Live]
  H --> L[Publish Now retry]
  J --> L
  L --> K
  K --> M[Accrue Views/Clicks/Leads]
```

## User Journey: Listing Falls Out of Active Status (Phase 2 — [[29_USER_JOURNEYS]])

```mermaid
stateDiagram-v2
  [*] --> Active
  Active --> Removed_LicenseExpired: FAL license lapses
  Active --> Removed_Deleted: user deletes
  Removed_LicenseExpired --> Draft_or_Active: Publish Now (after license renewal)
  Removed_Deleted --> Draft_or_Active: Publish Now (restore)
  Draft_or_Active --> Active: republish succeeds
```

## User Journey: Receive and Work a Lead (Phase 2 — [[29_USER_JOURNEYS]])

```mermaid
flowchart LR
  A[Buyer/Tenant Contacts via Call/WhatsApp/SMS/Email] --> B[Lead Row Created in TruLeads]
  B --> C[Notification: New Lead Alert]
  C --> D[Agent Opens TruLeads]
  D --> E{Lead Has Name?}
  E -->|No| F[Add Name manually]
  E -->|Yes| G[Add Task]
  F --> G
  G --> H[Follow-up Task Scheduled]
  H --> I["[Inferred] Deal Won/Lost — no stage tracked in product"]
```

## User Journey: Credits Top-Up and Spend (Phase 2 — [[29_USER_JOURNEYS]])

```mermaid
flowchart TD
  A[Balance Low or Listing Blocked] --> B[Credits and Packages screen]
  B --> C[Enter custom amount or pick package tier]
  C --> D["[Inferred] Payment step"]
  D --> E[Credits added to Available balance]
  E --> F[Spend via Publish/Refresh/Hot/Signature/Media services]
  F --> G[Logged in Credits Usage History]
  H[Smart Credit Utilization enabled] -.auto-spend near expiry.-> F
```

## User Journey: TruBroker Progression (Phase 2 — [[29_USER_JOURNEYS]])

```mermaid
flowchart TD
  A[Agent Visits Agent Performance] --> B{Complete Profile?}
  B -->|No| C[Prompt: Complete Profile]
  B -->|Yes| D{2+ Active Listings?}
  D -->|No| E[Prompt: Add Listings]
  D -->|Yes| F{Active Bayut Package?}
  F -->|No| G[Prompt: Buy Package]
  F -->|Yes| H[TruBroker Unlocked]
  H --> I{Meets Badge Thresholds?}
  I -->|Quality| J[Quality Lister Badge]
  I -->|Responsiveness| K[Responsive Broker Badge]
  I -->|Volume| L[Super Lister Badge]
  I -->|Not yet, no visible threshold| M["Stays Locked — no stated target [Observed gap]"]
```

## User Journey: Reports & Notifications Consumption (Phase 2 — [[29_USER_JOURNEYS]])

```mermaid
flowchart LR
  A[Bell Icon Badge: 24] --> B[Open Notifications Panel]
  B --> C{Transactional or Marketing?}
  C -->|New Lead Alert| D[Navigate to TruLeads]
  C -->|Upgrade / TruBroker nudge| E[Navigate to Packages or Agent Performance]
  F[Dashboard or Sidebar] --> G[Reports Summary]
  G --> H[Composition / Location / Performance views]
```

## AI Architecture Pattern (Phase 2 — [[34_AI_ARCHITECTURE]])

```mermaid
flowchart LR
  D[(Domain Data: Listings, Credits, Leads, Licenses)] --> S[Scoring/Aggregation Service]
  S --> R[Rules/Threshold Layer]
  R --> G[Generative Explanation Layer]
  G --> U[Surfaced in-product: badge coaching, draft-recovery hint, expiry warning]
```

## Roadmap Sequencing (Phase 2 — [[35_PRODUCT_ROADMAP]])

```mermaid
flowchart LR
  MVP[MVP: Core value chain + Quick Wins] --> V2[V2: Differentiation layer]
  V2 --> V3[V3: Enterprise + long-term AI]
  MVP -.parallel track.-> ENT[Enterprise foundations: RBAC, audit log, SSO]
  ENT --> V3
```
