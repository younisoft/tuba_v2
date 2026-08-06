# 09 — Notification Blueprint

`tbos-definition/13_NOTIFICATION_STRATEGY.md` defines the channel-classification model and anti-fatigue rules (fixed input, referenced not restated — see [00](00_IMPLEMENTATION_BLUEPRINT.md) §6 for the four urgency tiers). This document extends that table to every concrete event surfaced by the workflows in [01_EXPERIENCE_ARCHITECTURE.md](01_EXPERIENCE_ARCHITECTURE.md) and screens in [04_SCREEN_INVENTORY.md](04_SCREEN_INVENTORY.md), and adds the dimensions the source strategy left implicit: **Timeline vs. Digest, explicit Escalation path, and explicit Reminder cadence.**

## Classification legend

- **Timeline** — appears once, chronologically, in NOTIF-01; no batching.
- **Digest** — batched with same-type events over a defined window, delivered as one notification.
- **Escalation** — if unaddressed, automatically re-routes to a different persona/channel at higher urgency.
- **Reminder** — recurs on a defined cadence until resolved or its deadline passes.
- **Silent** — logged to NOTIF-01/AICP-02 but never pushes/interrupts.

## Full event catalog

| Event | Source workflow/screen | Urgency | Channel(s) | Timeline/Digest | Escalation | Reminder |
|---|---|---|---|---|---|---|
| New lead assigned to me | WF-LEAD-NEW → LEAD-03 | Critical | Push + in-app | Timeline | N/A (this *is* the routing outcome) | None — SLA breach is the escalation trigger, not a repeat of this |
| Lead SLA approaching breach | WF-LEAD-NEW | High | Push (assignee) | Timeline | Escalates to Sales Manager (in-app + push) on breach | One reminder at the midpoint of the SLA window |
| Lead SLA breached | WF-LEAD-NEW | Critical | Push + in-app (Sales Manager) | Timeline | Escalates to Agency Owner if unaddressed past a second threshold | None beyond the breach alert itself |
| New Marketing Request matching specialty/district | WF-OWNER-NEW → OWN-03 | High | Push + in-app | Timeline | Reassigns to next-best-matched broker if unclaimed past a defined window | None |
| Saved-search match | GS-01 (saved search) | Medium | In-app + WhatsApp | **Digest** (batched, not per-match) | None | None — digest cadence itself is the delivery rhythm |
| License/compliance expiring — first notice | WF-RENEWAL → SET-04 | Medium | Email | Timeline | Escalates urgency (channel upgrades to push) as deadline nears | Escalating cadence: first notice, then recurring reminders at defined intervals closer to expiry |
| License/compliance expiring — imminent (<7 days) | WF-RENEWAL | Critical | Push + email | Timeline | Escalates to Agency Owner if Operations Manager hasn't acted | Daily reminder inside the final week |
| License/compliance lapsed | WF-RENEWAL | Critical | Push + email | Timeline | Immediate — surfaces dependent-listing impact alongside the alert | Recurs until renewed |
| Contract stage change | WF-CONTRACT-NEW → CONT-02 | Medium | In-app + email (all parties) | Timeline | None | None |
| Contract stuck Pending Compliance past expected window | WF-CONTRACT-NEW | High | In-app (Operations Manager) | Timeline | Escalates to Agency Owner past a second threshold | Reminder at the expected-window boundary |
| Listing published | WF-PUBLISHING | Low | In-app | Timeline | None | None |
| Listing rejected | WF-LISTING-REJECTED | High | Push + in-app | Timeline | None (this is itself the action-required signal) | None |
| Listing expiring | WF-LISTING-EXPIRED | Medium → escalates | In-app, then push as date nears | Timeline | Urgency escalates with proximity to expiry, no persona escalation | Escalating cadence, same pattern as license expiry |
| Listing expired | WF-LISTING-EXPIRED | High | Push + in-app | Timeline | None | Recurs until renewed or archived |
| Campaign eligibility blocked / insufficient balance | WF-MARKETING-CAMPAIGN | Medium | In-app | Timeline | None | None |
| Content-quality score dropped (drift) | Journey 4 / MKT-03 | Low | In-app (digest to Marketing Manager weekly) | **Digest** | None | Weekly digest cadence |
| Automation rule failed | WF-AUTOMATION | Critical | Push + in-app (rule owner) | Timeline | Escalates to Agency Owner if unaddressed past a defined window — a silent automation failure reintroduces the exact defect TBOS exists to fix | Recurs each subsequent failed run until fixed |
| Team member performance summary | Journey 11 (End-of-Day/weekly review) | Low | Email | **Digest** (weekly) | None | Weekly cadence |
| Payment/billing event (success, failure, upcoming charge) | WAL-02 | Medium (High if failed) | Email + in-app | Timeline | Failed payment escalates urgency and re-sends until resolved or grace period lapses | Reminder cadence during any grace period |
| AI action taken on my behalf | Any AI embedding point ([08](08_AI_INTERACTION_BLUEPRINT.md)) | Low | In-app only | **Silent** in the sense of never pushing — reviewable in AICP-02 | None | None |
| Platform/system incident affecting account | Cross-cutting | Critical | Push + email | Timeline | Must reach regardless of individual preference (only category exempt from full opt-out) | Recurs at defined intervals until resolved, with a resolution notice |
| General marketing/product announcement | Cross-cutting | Low | Email only | **Digest** | None | N/A |
| New team member onboarded / role changed | SET-02 | Low | In-app | Timeline | None | None |
| Task assigned to me | TASK-01/02 | Medium | In-app (push if due within 24h) | Timeline | None | Reminder at due-date approach |
| Task overdue | TASK-01/02 | High | Push + in-app | Timeline | Escalates to assigning manager if overdue past a defined window | Recurs daily while overdue |

## Channel behavior details

- **Push** — reserved for Critical/High events where delay has a measurable cost (per anti-fatigue rule #2, digest over instance wherever not individually time-urgent).
- **In-app** — the durable record of every event regardless of other channel; NOTIF-01's unread count must always equal real unread state (binding rule, direct fix for the confirmed "0" badge defect in `tuba-current-state/`).
- **Email** — used for anything needing a paper trail (compliance, billing, contract stage changes) or genuinely non-urgent digest content.
- **WhatsApp** — deliberately narrow: saved-search digests and AI-drafted reply delivery only (per `tbos-definition/13_NOTIFICATION_STRATEGY.md`) — never used for the full notification catalog above; meets brokers where they already are without becoming a second, competing channel.
- **SMS** — not assigned to any event in this catalog by default; retained as an available channel (Taqnyat integration, `tuba-current-state/02_PRODUCT_INVENTORY.md`) for future high-criticality use only if push/email prove insufficient in market testing — an open item, not a default.

## Escalation model (cross-cutting)

Every escalation in the catalog above follows the same shape: **event → primary recipient → unaddressed past threshold → secondary recipient at higher urgency.** No event escalates more than one level (e.g., Assignee → Sales Manager → Agency Owner is two hops maximum, never an unbounded chain) — keeps the model legible and matches Minimalism.

## Reminder model (cross-cutting)

Reminder cadence is never a fixed universal interval — it's proportional to the deadline's proximity (sparse far out, frequent as the deadline nears), matching the "escalating reminder ahead of expiry" pattern already specified for licenses/renewals in `tbos-definition/11_AUTOMATION_STRATEGY.md`, applied consistently to every reminder-bearing event above (tasks, contracts, automation failures).

## Preferences (NOTIF-02)

Every event above is user-adjustable per-type per the source strategy's per-type opt-out rule, **except** the three flagged Critical safety/compliance categories (License lapsed, Platform/system incident, Automation rule failed) — these can be re-channeled (e.g., push instead of email) but never fully silenced, per the binding rule in `tbos-definition/13_NOTIFICATION_STRATEGY.md`.

## Failure visibility (binding, cross-cutting)

Any delivery failure for any event in this catalog surfaces visibly in-app (per anti-fatigue rule #5) — this applies uniformly and isn't repeated per row above to avoid duplication, consistent with [00](00_IMPLEMENTATION_BLUEPRINT.md)'s reuse discipline.
