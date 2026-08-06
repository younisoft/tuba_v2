# 21 — Glossary

**Status**: Reference. Terms as used throughout `tbos-definition/`. Where a term originates in a specific prior document, that's cited.

---

**AI Copilot** — TBOS's thin, dedicated AI module for open-ended requests and AI-action auditing; not the home for most AI capability, which is embedded in workflows (`06_PRODUCT_ARCHITECTURE.md`, `10_AI_STRATEGY.md`).

**Broker OS** — the persona-facing half of TBOS (all personas except Administrator); architecturally separate from the Platform Console (`07_INFORMATION_ARCHITECTURE.md`).

**Decision Support System** — the mechanism that converts raw platform data into a short, prioritized, explained list of recommendations, primarily surfaced in Today (`15_DECISION_SUPPORT_SYSTEM.md`).

**Explainability contract** — the required five-question answer (why / how calculated / what changed / recommended action / business impact) every metric, score, or AI output must satisfy before shipping (`14_EXPLAINABILITY_SYSTEM.md`).

**FAL** — the brokerage-licensing government system Tuba's current platform integrates with; part of the regulatory moat referenced throughout (`tuba-current-state/13_GAP_ANALYSIS.md`).

**JTBD (Jobs To Be Done)** — the ranked list of what a broker actually needs to accomplish, independent of any specific feature (`05_JOBS_TO_BE_DONE.md`).

**Marketing Request** — an owner-originated request for marketing/sale assistance on their property; a real, monetized, tier-gated feature confirmed live on Tuba's current platform but currently under-surfaced (`tuba-current-state/06_WORKFLOW_ANALYSIS.md` §3). In TBOS, lives structurally inside the Owners module.

**Nafath** — Saudi Arabia's national digital-identity verification system; one of Tuba's three government integrations. Its callback signature-verification gap is a named, binding prerequisite for several TBOS features (e.g., Fraud Detection, see `10_AI_STRATEGY.md`).

**North Star Metric** — time from lead creation to first qualified broker response; the single metric TBOS's design is most directly accountable to (`01_PRODUCT_VISION.md`, `18_SUCCESS_METRICS.md`).

**Operating layer** — the middle tier of TBOS's three-layer module architecture (Properties, Projects, Leads, Customers, Owners, Contracts, Marketing) — where the actual jobs get done (`06_PRODUCT_ARCHITECTURE.md`).

**Orientation layer** — the top tier of TBOS's module architecture (Home, Today, Tasks) — answers "what needs my attention" (`06_PRODUCT_ARCHITECTURE.md`).

**Intelligence & Control layer** — the bottom tier of TBOS's module architecture (Finance, Wallet, Analytics, Reports, Automation, AI Copilot, Notifications, Knowledge, Settings) — where a broker understands and configures the system (`06_PRODUCT_ARCHITECTURE.md`).

**Platform Console** — the fully separate, Administrator-only half of TBOS; never shares a route, session, or login surface with the Broker OS (`07_INFORMATION_ARCHITECTURE.md`).

**Quick Actions** — a persistent, elevated control exposing the four highest-frequency jobs (Add Lead, Add Property, Log Follow-up, Submit Compliance Document) from anywhere in the product (`08_NAVIGATION_SYSTEM.md`).

**RBAC (Role-Based Access Control)** — scoped, delegated permissions per role, identified across this entire definition set as TBOS's single highest-leverage opportunity, since it is a gap shared by Tuba's current platform, Bayut, and Aqar alike (`tuba-current-state/13_GAP_ANALYSIS.md` §3).

**REGA** — the Real Estate General Authority; Tuba's ad-license validation integration, part of the regulatory moat.

**TBOS (Tuba Broker OS)** — the product this entire document set defines: a complete operating system for a real-estate broker, not a dashboard, CRM, or listing manager (Master Prompt).

**TBX (Tuba Broker Experience Foundation)** — the prior cross-competitor synthesis document (`competitor-analysis/TUBA_BROKER_EXPERIENCE_FOUNDATION.md`) combining the Bayut and Aqar audits; cited throughout as the source of the "one home per capability" and "every status has a next action" principles.

**Today** — TBOS's prioritized, cross-module worklist module; the primary rendering surface of the Decision Support System and the module with no direct equivalent in Tuba's current platform, Bayut, or Aqar (`06_PRODUCT_ARCHITECTURE.md`).

**Wasata** — the brokerage-contract concept referenced in the Aqar audit's compliance-lifecycle findings, cited in this definition as a comparison point for TBOS's own Contracts module design, not a system TBOS integrates with directly.
</content>
