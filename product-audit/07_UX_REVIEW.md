# UX Review

Strengths:

- Side navigation is compact and role-oriented.
- Dashboard maps closely to agency questions: inventory, credits, performance, recent listings.
- Listing table combines operational state with performance metrics.
- TruLeads gives agents immediate next actions through Add New Lead and Add Task.
- TruBroker™ (Agent Performance) reframes listing quality and responsiveness as a status game with a real trust-badge payoff — the most differentiated UX idea observed in the product.
- The listing preview panel (eye icon) lets a user sanity-check a row without leaving the table — a well-chosen lightweight pattern.

Weaknesses:

- Many navigation items are implemented as buttons rather than durable links, reducing browser affordances and crawlability.
- Tables are dense and can become difficult to scan without column controls, grouping, or saved views.
- "Agent Performance" and "Reports" are two adjacent, identically-styled sidebar items; on first pass they were mistaken for one non-existent item ("Agent Performance Reports"), a real discoverability/labeling risk for users skimming the sidebar too.
- Four distinct non-active listing states (Not Posted, Insufficient Credits, Ad License Expired, Deleted) are split across two tabs with no glossary connecting them to their causes or fixes.
- Every TruBroker badge is shown Locked with no explicit "N more to go" — the gamification loop is visible but not actionable.
- Direct route refreshes intermittently produced a Failed to fetch screen during audit; that is a resilience concern.
- Modals/menus often expose broad side-menu text, suggesting overlay detection and focus management may be noisy.

Overall UX score: **7.2/10**.
