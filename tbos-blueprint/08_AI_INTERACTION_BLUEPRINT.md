# 08 — AI Interaction Blueprint

`tbos-definition/10_AI_STRATEGY.md` defines *what* AI does and where it embeds (fixed input, referenced not restated). This document defines *how* each embedding point behaves as an interaction: trigger, context, prompt approach, expected output, human review, approval, fallback, confidence, audit trail — per the master prompt's Phase 8 requirement that AI exists inside workflows, never as a separate destination (Philosophy Principle #3).

## Interaction contract (applies to every row below, stated once)

- **Confidence** is always shown, never hidden — High / Medium / Low (canon in [00](00_IMPLEMENTATION_BLUEPRINT.md) §6), via the Confidence Indicator component ([05](05_COMPONENT_MAPPING.md)).
- **Human review** is the default posture for every capability below except the two explicitly marked "none" (deterministic Lead-routing logic and Deletion, which excludes AI entirely).
- **Fallback**: if the AI call fails or returns low confidence, the workflow continues manually — no capability below is ever the sole blocking gate on its workflow (`tbos-definition/10_AI_STRATEGY.md` guardrail).
- **Audit trail**: every invocation logs to AICP-02 (AI Action Audit Log) with the inputs used, output produced, confidence, and human-review outcome (accepted-as-is / accepted-edited / discarded / flagged-incorrect).

## AI Writing

| | |
|---|---|
| **Embeds in** | WF-PROPERTY-NEW (PROP-03), Project creation (PROJ-03), Lead reply drafting (LEAD-03), Marketing campaign copy (MKT-02), Knowledge content drafting (internal, KB authoring) |
| **Trigger** | Broker reaches the description/content field in a form, or taps "Draft a reply" in LEAD-03 |
| **Context supplied** | Structured field data already entered (property attributes, unit specs, lead's stated interest/message history), target language (AR/EN) |
| **Prompt approach** | Structured-output generation constrained to the entity's real attributes — never invents amenities/facts not present in the underlying record (hallucination guardrail from AI Strategy) |
| **Expected output** | Bilingual description/SEO text, or a drafted reply, editable inline |
| **Human review** | Always — output renders as an AI Suggestion Inline Block, broker edits or accepts before it's saved/sent |
| **Approval** | Implicit in "accept" or "send"; nothing is saved/sent unreviewed |
| **Fallback** | Blank field with manual entry — form is fully usable with zero AI availability |
| **Confidence** | Shown per generation; low-confidence generations (e.g., insufficient structured input to work from) are flagged and the field defaults to a manual prompt instead of a weak guess |
| **Audit trail** | Logged with the source record snapshot used, so a later dispute ("why did it say X") is fully reconstructable |

## AI Search (NL-to-structured-query)

| | |
|---|---|
| **Embeds in** | GS-01, CMD-01 |
| **Trigger** | Free-text query that doesn't match a literal keyword/filter pattern |
| **Context supplied** | The querying user's RBAC scope (never lets NL parsing bypass permission filtering) |
| **Prompt approach** | Translates NL into the same structured filter set the manual UI would produce — not a separate retrieval path (`tbos-definition/12_SEARCH_STRATEGY.md`) |
| **Expected output** | A structured filter query, applied transparently — user can see and adjust the filters that were inferred |
| **Human review** | Implicit — results are browsable/filterable exactly as if built manually; a wrong inference is just a wrong filter the user edits |
| **Approval** | N/A (non-destructive, informational) |
| **Fallback** | Falls back to literal keyword search if NL parsing fails |
| **Confidence** | Shown as "search interpreted as: [filters]" so a low-confidence parse is visible before the user trusts an empty result set |
| **Audit trail** | Not logged to AICP-02 (informational, non-consequential, high-volume — logging every search would violate Minimalism) |

## AI Recommendations

| | |
|---|---|
| **Embeds in** | PROP-02/PROJ-02 ("similar listings"), TODAY-01 (attention-worthy leads/owners), MKT-01/02 (under-promoted inventory) |
| **Trigger** | Record view (similar listings) or scheduled Today-refresh cycle (attention recommendations) |
| **Context supplied** | Entity attributes + interaction history (content-based first per sequencing; collaborative filtering only once interaction volume supports it) |
| **Prompt approach** | Not LLM-generated text — a ranking/matching computation; "AI" here means the matching logic, not generative output |
| **Expected output** | Ranked list of related records or a surfaced Recommendation Card on TODAY-01 |
| **Human review** | Implicit — a recommendation is just a suggestion to click into, never auto-acted |
| **Approval** | N/A |
| **Fallback** | Empty/hidden section if no confident match — never a low-quality forced recommendation |
| **Confidence** | Not surfaced numerically for this capability (ranking, not a single fact) — instead each item states its match reason (Explainability "why") |
| **Audit trail** | Not logged individually (same volume rationale as Search) |

## AI Insights

| | |
|---|---|
| **Embeds in** | HOME-01, ANL-01 tiles, RPT-02 narrative summaries |
| **Trigger** | Tile/metric render, or explicit "explain this" tap |
| **Context supplied** | The real underlying data series behind the metric — never a fabricated narrative disconnected from real numbers |
| **Prompt approach** | Constrained to describe only what the data shows: trend direction, magnitude, comparison to baseline — implements the Explainability contract's "how calculated"/"what changed" |
| **Expected output** | One-to-two sentence plain-language annotation |
| **Human review** | Passive — user reads it; no accept/reject step needed since it's descriptive, not actionable-on-its-own |
| **Approval** | N/A |
| **Fallback** | Metric still displays with its raw figure if narrative generation fails — number is never gated on AI availability |
| **Confidence** | Not applicable in the accept/reject sense; if the underlying data is too sparse, the narrative says so explicitly rather than reaching |
| **Audit trail** | Not logged individually |

## Lead Scoring

| | |
|---|---|
| **Embeds in** | WF-LEAD-NEW, LEAD-01/02/03 |
| **Trigger** | Lead intake |
| **Context supplied** | v1: engagement recency, stated budget vs. listing price, response latency (heuristic, no LLM). v2 (later): free-text buyer-intent signal via LLM, once heuristic baseline is trusted (`10_AI_STRATEGY.md` sequencing) |
| **Prompt approach** | v1 is a deterministic scoring formula, not a prompt at all — included here because it's still an "AI Strategy" capability even though v1 has no generative component |
| **Expected output** | Numeric score + one-line rationale, attached to the lead immediately at intake — never delays routing waiting on the score |
| **Human review** | Score is informational context for the broker's own judgment, never auto-decides pipeline stage |
| **Approval** | N/A |
| **Fallback** | Lead still routes and displays normally with no score if scoring fails — routing itself (deterministic capacity-aware logic) is entirely independent of scoring |
| **Confidence** | v1: score itself functions as the confidence signal (extreme scores == high-confidence signals present); v2 LLM layer shows explicit confidence |
| **Audit trail** | Score + rationale logged with the lead record itself (not just AICP-02) since it's a first-class field |

## Pricing (AI-assisted, never AI-determined)

| | |
|---|---|
| **Embeds in** | WF-PRICE-CHANGE (PROP-02) |
| **Trigger** | Broker opens price-change flow |
| **Context supplied** | Comparable active/sold listings in the same district within a recent window (gated on the price-history pipeline existing — see [13_FEATURE_READINESS_MATRIX.md](13_FEATURE_READINESS_MATRIX.md)) |
| **Prompt approach** | Not generative — a comparables aggregation presented as context, e.g. "12 similar listings, range X–Y" |
| **Expected output** | A suggested price band, never a single prescribed number presented as fact |
| **Human review** | Always — broker sets the actual price; AI band is context only |
| **Approval** | The broker's price entry itself is the approval step |
| **Fallback** | Manual price entry with no comparables context if the pipeline/data isn't ready yet — this capability is explicitly sequenced *after* the prerequisite exists, never shipped as "AI theater" ahead of real data |
| **Confidence** | Shown as sample size and recency of comparables ("based on 12 listings in the last 90 days") rather than an abstract confidence label |
| **Audit trail** | Logged alongside the resulting Price History entry |

## Property Quality

| | |
|---|---|
| **Embeds in** | WF-PROPERTY-NEW media-upload step, MKT-03 |
| **Trigger** | Media upload completes |
| **Context supplied** | Uploaded photos |
| **Prompt approach** | Image classification for amenity-tag suggestion + a completeness scoring rubric (photos present, description length/quality, pricing present) |
| **Expected output** | Suggested amenity tags (broker confirms), a content-completeness score feeding the Publishing pre-publish gate |
| **Human review** | Amenity tags always broker-confirmed before saving; the completeness score itself is informational/gating (blocks Publish button, doesn't reject silently) |
| **Approval** | N/A beyond the tag-confirmation step |
| **Fallback** | Manual amenity tagging always available; completeness check has a manual-override path for edge cases (with a logged reason) rather than a hard, unappealable block |
| **Confidence** | Per-tag confidence; low-confidence tags aren't pre-selected, just offered |
| **Audit trail** | Logged with the listing record |

## Duplicate Detection

| | |
|---|---|
| **Embeds in** | WF-PROPERTY-NEW, WF-LEAD-NEW, WF-OWNER-NEW (Owners/Customers matching) |
| **Trigger** | New record creation |
| **Context supplied** | Phone/email exact-match rules-based first pass (`10_AI_STRATEGY.md` sequencing — ML layer only once volume justifies it) |
| **Prompt approach** | Not generative — deterministic matching rules |
| **Expected output** | High-confidence exact match → auto-merge; partial/ambiguous match → flagged for confirmation |
| **Human review** | Required for any non-exact match; exact match still shows a post-merge "was this correct?" affordance |
| **Approval** | Implicit for exact match (default action), explicit for ambiguous match |
| **Fallback** | Creates a new, unmerged record if matching is unavailable — never blocks record creation |
| **Confidence** | Exact match = High; partial match = Medium/Low, explicitly labeled as such in the confirmation prompt |
| **Audit trail** | Merge/split actions logged (per WF-OWNER-NEW recovery path — un-merge is always available) |

## Market Intelligence

| | |
|---|---|
| **Embeds in** | ANL-01, broker's district/property-type watchlist |
| **Trigger** | Scheduled aggregation refresh once price-history pipeline has accumulated sufficient data |
| **Context supplied** | Aggregated, anonymized market data — never a single-owner's private detail |
| **Prompt approach** | Aggregation + narrative layer, sequenced strictly after the aggregation pipeline itself exists — "no narrative layer before aggregation exists" (`10_AI_STRATEGY.md`) |
| **Expected output** | Trend charts + plain-language narrative |
| **Human review** | Passive (informational) |
| **Approval** | N/A |
| **Fallback** | "Not enough data yet" explicit state if the pipeline/volume prerequisite isn't met — never a fabricated trend |
| **Confidence** | Stated as sample size/recency, same convention as Pricing |
| **Audit trail** | Not logged individually |

## Customer Intelligence

| | |
|---|---|
| **Embeds in** | CUST-02, OWN-02 |
| **Trigger** | Detail page view |
| **Context supplied** | Full interaction history, stated preferences, deal stage across linked Leads/Contracts |
| **Prompt approach** | Summarization constrained to real logged interactions — no inferred facts presented as known |
| **Expected output** | Short relationship summary + deal-readiness signal |
| **Human review** | Passive (informational); broker can flag if the summary misrepresents the relationship |
| **Approval** | N/A |
| **Fallback** | Raw interaction timeline (already present as a component) remains fully usable without the summary |
| **Confidence** | Not surfaced numerically; summary explicitly cites which interactions it drew from |
| **Audit trail** | Not logged individually |

## Document Intelligence

| | |
|---|---|
| **Embeds in** | WF-COMPLIANCE, WF-CONTRACT-NEW (SET-04, CONT-02) |
| **Trigger** | Document/credential upload |
| **Context supplied** | The uploaded document + the system record it should match against |
| **Prompt approach** | OCR/extraction + field-level comparison; flags mismatches rather than silently accepting or rejecting |
| **Expected output** | Pre-filled fields + a mismatch flag list where applicable |
| **Human review** | Mandatory — Operations Manager always confirms before any compliance status changes; this is the clearest instance of "AI never the sole gate on a regulated action" |
| **Approval** | Explicit OM approval action required regardless of how clean the extraction was |
| **Fallback** | Full manual data entry and manual document review remain available end-to-end |
| **Confidence** | Per-field extraction confidence; low-confidence fields are left blank rather than guessed, forcing manual entry precisely there |
| **Audit trail** | Full extraction + human-decision trail logged — this is the Operations Manager's primary audit-relevant AI capability |

## Workflow Automation (AI's narrow role within it)

| | |
|---|---|
| **Embeds in** | AUTO-01/02, and inline on any record touched by automation (e.g., LEAD-03's "auto-assigned because...") |
| **Trigger** | Any automated action completing |
| **Context supplied** | The rule and the data that triggered it |
| **Prompt approach** | AI's role is strictly the plain-language explanation layer — the routing/reminder logic itself is deterministic and non-LLM, per `10_AI_STRATEGY.md` and reinforced in [01](01_EXPERIENCE_ARCHITECTURE.md) WF-AUTOMATION |
| **Expected output** | A one-line "why this happened" statement |
| **Human review** | Passive — this is explanatory, not actionable |
| **Approval** | N/A |
| **Fallback** | The underlying rule's own logged trigger/condition (already deterministic) suffices if the narrative layer fails — nothing about the automation itself depends on AI |
| **Confidence** | N/A (deterministic underlying logic) |
| **Audit trail** | Logged as part of the automation's own run history on AUTO-01 |

## Agent Copilot (AICP-01/02)

| | |
|---|---|
| **Embeds in** | AICP-01 (open-ended requests), AICP-02 (audit) |
| **Trigger** | Broker explicitly opens AI Copilot for a non-workflow-scoped question ("what should I focus on this week") |
| **Context supplied** | The user's RBAC-scoped live data + Knowledge module grounding content — Copilot never answers with data the user couldn't otherwise see |
| **Prompt approach** | Retrieval-grounded conversational response, citing Knowledge content and real DB fields, constrained against inventing facts (`10_AI_STRATEGY.md` hallucination guardrail) |
| **Expected output** | Conversational answer, with source citation and confidence |
| **Human review** | Any action the Copilot proposes (not just answers) requires an explicit confirmation step before executing — Copilot never silently performs a consequential action from a conversational request |
| **Approval** | Required for any action beyond read/answer |
| **Fallback** | "I don't have enough information to answer that confidently" rather than a confident-sounding guess |
| **Confidence** | Shown per response |
| **Audit trail** | Every action taken (not every message) logs to AICP-02; conversational history itself is retained per the user's own data-retention settings |

## Build sequencing cross-reference

Full sequencing (Foundation → Fast-follow → Moderate infrastructure → Structural-prerequisite-gated → Security-gated) is `tbos-definition/10_AI_STRATEGY.md` §Sequencing, inherited unchanged into [14_DEVELOPMENT_BLUEPRINT.md](14_DEVELOPMENT_BLUEPRINT.md) and [13_FEATURE_READINESS_MATRIX.md](13_FEATURE_READINESS_MATRIX.md). This document does not resequence it — it only specifies each capability's interaction contract for whenever it ships.
