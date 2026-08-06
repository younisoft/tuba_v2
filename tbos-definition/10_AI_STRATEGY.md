# 10 — AI Strategy

**Status**: Recommended. Extends `tuba-current-state/16_AI_READINESS.md`'s findings (the platform's one real, working AI integration — Property SEO/description generation — and the ten additional opportunities it evaluated) into a forward-looking TBOS strategy. Per Philosophy Principle #3, **AI is not a page** — every capability below is embedded in the module/workflow it serves (`06_PRODUCT_ARCHITECTURE.md`, `09_WORKFLOW_ARCHITECTURE.md`); the AI Copilot module is a thin exception, not the home for all of this.

---

## Starting position (Observed)

Tuba already operates a production LLM integration — structured JSON output, bilingual (Arabic/English) generation, wired into a real data model (`PageSeo`) — confined today to Property description/SEO generation only (`tuba-current-state/16_AI_READINESS.md`). This is a genuine, evidence-confirmed lead over both Bayut and Aqar, neither of which has meaningful AI at all (`competitor-analysis/TUBA_BROKER_EXPERIENCE_FOUNDATION.md` §1). TBOS's AI strategy is an extension of this proven pattern, not a new program.

## AI capabilities, by embedding point

### AI Writing
**Where it lives**: Properties/Projects (description/SEO generation, extended to every listing type — closing the Property-only gap); Leads (reply drafting, "Broker Assistant v1" per `tuba-current-state/16_AI_READINESS.md`); Marketing (campaign copy); Knowledge (support-content drafting for Administrator persona).

### AI Search
**Where it lives**: the global search bar (`08_NAVIGATION_SYSTEM.md`, `12_SEARCH_STRATEGY.md`) — natural-language query parsed into the structured filters the underlying search index already supports. This is explicitly a thin orchestration layer on top of a real search engine (see `12_SEARCH_STRATEGY.md`), not a replacement for one — `tuba-current-state/16_AI_READINESS.md` is explicit that Tuba's current platform needs the relevance-engine fix regardless of any AI layer on top.

### AI Recommendations
**Where it lives**: Properties/Projects ("similar listings" on any detail page), Today (surfacing which leads/owners most deserve attention today), Marketing (which inventory is under-promoted). Sequenced content-based-first (uses existing taxonomy: `Property::AMENITY_KEYS`-equivalent structured data), collaborative-filtering second, once interaction volume supports it — the two-stage build order `tuba-current-state/16_AI_READINESS.md` recommends.

### AI Insights
**Where it lives**: Analytics and Home — the plain-language explanation layer behind every metric (implements Philosophy Principle #2 and the full `14_EXPLAINABILITY_SYSTEM.md` spec). Never a standalone "insights" feed disconnected from the metric it explains.

### Lead Scoring
**Where it lives**: the Leads pipeline, as a first-class field every lead carries. v1 is a heuristic (engagement recency, stated budget vs. listing price, response latency — no LLM needed); an LLM-based qualitative layer (summarizing buyer intent from free-text) is a v2 addition once the heuristic baseline is trusted, per the phased build order in `tuba-current-state/16_AI_READINESS.md`.

### Pricing (AI-assisted, not AI-determined)
**Where it lives**: the Price Change workflow (`09_WORKFLOW_ARCHITECTURE.md`) — a comparables-based estimate ("12 similar listings in this district") shown as context before a broker confirms a price, never an autonomous price-setter. Explicitly sequenced *after* the numeric price-schema fix and a real price-history table exist — `tuba-current-state/16_AI_READINESS.md` is direct that building the AI narrative layer before that data pipeline exists produces "AI theater," and TBOS's strategy treats that warning as binding.

### Property Quality
**Where it lives**: the New Property workflow's media-upload step — AI-suggested amenity tags from photos (against the already-real, structured amenity taxonomy), and a content-completeness score feeding the Publishing workflow's pre-publish gate. Framed as an assistive suggestion an agent confirms, never an autonomous auto-publish decision, given the real liability stakes of a government-licensed advertisement.

### Duplicate Detection
**Where it lives**: New Property/New Lead workflows, and Owners/Customers matching (does this new lead match an existing person). A rules-based first pass (phone/email matching — a specific, concrete gap the July self-audit's CRM recommendations named as unaddressed) with an ML-based layer added only once real volume justifies it.

### Market Intelligence
**Where it lives**: Analytics and a broker's district/property-type watchlist. Explicitly gated on the price-history data pipeline existing first (same sequencing note as Pricing, above) — this is the highest-ceiling, highest-floor AI opportunity `tuba-current-state/16_AI_READINESS.md` identifies, and TBOS does not attempt the AI narrative layer before the underlying aggregation exists.

### Customer Intelligence
**Where it lives**: the Customer/Owner detail page — a synthesized relationship summary (interaction history, stated preferences, deal-readiness signal) replacing the need for a broker to manually piece this together across scattered inbox entries, the exact failure mode confirmed live in Tuba's current `/agent-inbox` (`tuba-current-state/04_PAGE_ANALYSIS.md`).

### Document Intelligence
**Where it lives**: the Compliance workflow (`09_WORKFLOW_ARCHITECTURE.md`) — OCR/extraction assist on FAL license and contract document uploads, pre-filling fields and flagging mismatches for human review, never autonomously approving a regulated compliance status. Directly extends `tuba-current-state/16_AI_READINESS.md`'s Document Processing recommendation, which also flagged that the underlying approval endpoint needs a permission-gating fix independent of any AI work — a prerequisite this strategy inherits, not solves.

### Workflow Automation
**Where it lives**: this is `11_AUTOMATION_STRATEGY.md`'s domain; AI's role there is specifically the "qualitative/summary" layer on top of deterministic rules (e.g., an LLM-drafted summary of *why* a lead was auto-routed to a specific broker), never the routing logic itself, which must remain deterministic and auditable.

### Prompt Library
**Where it lives**: an internal, versioned asset (not broker-facing) governing every AI Writing/Insights/Copilot call — config-driven model selection and prompt versions (fixing Tuba's current hardcoded `'gpt-5.4-mini'` model literal and raw `env()` key read, per `tuba-current-state/16_AI_READINESS.md`'s Weaknesses table), so a model deprecation or prompt refinement doesn't require a source-code edit across every feature.

### Knowledge Base
**Where it lives**: the Knowledge module (`06_PRODUCT_ARCHITECTURE.md`) — the grounding content every AI Insight, compliance explanation, and FAQ-bot response cites. AI answers are constrained to cite real Knowledge-base content and real database fields, never invented facts — the direct implementation of the Risk #1 mitigation named in `tuba-current-state/16_AI_READINESS.md` (hallucination risk in regulated real-estate advertising).

### Agent Copilot
**Where it lives**: the thin AI Copilot module (`06_PRODUCT_ARCHITECTURE.md`) for open-ended requests, plus an audit view of every AI action taken on the broker's behalf across all the embedded points above — the single place a broker or Operations Manager can review "what has AI done for/to my account," directly serving the Explainability principle and the Operations Manager persona's audit needs (`04_PERSONAS.md`).

## Sequencing (inherited from `tuba-current-state/16_AI_READINESS.md`, restated as TBOS build phases)

1. **Foundation**: config-driven model/key management, queued (async) execution — the reliability fixes every other phase depends on.
2. **Fast follow**: extend AI Writing to Projects; AI Search (NL-to-filter); Agent Copilot v1 (reply drafting); Lead Scoring v1.
3. **Moderate new infrastructure**: Property Quality (image tagging); Document Intelligence; AI Recommendations v1 (content-based).
4. **Structural prerequisites first**: Market Intelligence and Pricing — do not start the AI layer until the price-history pipeline exists.
5. **Security-gated**: any Fraud Detection capability is explicitly sequenced after the Nafath identity-verification integrity fix (a prerequisite outside TBOS's own scope, inherited as a hard dependency).

## Cross-cutting rules

- **No AI feature ships without an Explainability contract** (`14_EXPLAINABILITY_SYSTEM.md`) — what it used, why it suggested this, what to do about it.
- **No AI feature sends customer PII to a third-party model without a data-minimization/redaction step** — inherited directly as a binding constraint from `tuba-current-state/16_AI_READINESS.md`'s Risk #2, given Saudi PDPL obligations.
- **No AI feature is the sole gate on a regulated action** (publishing an ad, approving a compliance document) — every one is assistive, with a human confirmation step, given the regulatory exposure the July self-audit named for AI-generated real-estate advertising content.
</content>
