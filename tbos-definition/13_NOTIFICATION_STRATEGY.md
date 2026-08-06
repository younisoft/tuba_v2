# 13 — Notification Strategy

**Status**: Recommended. Defines what deserves interruption, what belongs in a passive timeline, and which channel (email/WhatsApp/push/in-app) each notification type uses — with the explicit goal of avoiding notification fatigue.

---

## Starting position (Observed)

Tuba's current platform has the notification-class infrastructure (10 classes, recently gained `ShouldQueue`) but delivers **database-only** — every class defines a `toMail()` method that is never enabled, despite Pusher (real-time) and Taqnyat (SMS) both already being integrated elsewhere in the codebase for other purposes (`tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md`). The live session further confirmed the notification bell showing "0" despite clear recent account activity (`tuba-current-state/07_UX_AUDIT.md`) — brokers currently cannot trust the notification system to tell them anything is happening at all. TBOS's strategy starts from "notifications must be trustworthy" before it addresses "notifications must be well-tuned."

## The core question this document answers, per notification type

**What deserves interruption?** (push/SMS/WhatsApp — reaches the broker even if they're not looking at TBOS)
**What belongs in a timeline?** (in-app notification center — seen next time they open TBOS)
**What belongs in email?** (durable, reference-able, not time-urgent)
**What belongs in WhatsApp specifically?** (Saudi market's dominant communication channel — used deliberately, not as a catch-all)

## Classification

| Notification type | Channel(s) | Why |
|---|---|---|
| New lead assigned to me | Push + in-app | Job 1's highest-frequency, highest-value trigger (`05_JOBS_TO_BE_DONE.md`) — every minute of delay costs conversion. Interruption is justified. |
| Lead SLA about to breach | Push (to assignee) + in-app (to Sales Manager) | Time-sensitive, actionable now |
| New Marketing Request matching my specialty/district | Push + in-app | A monetized opportunity (`tuba-current-state/06_WORKFLOW_ANALYSIS.md` §3) — currently invisible in Tuba's platform; TBOS must not repeat that by under-notifying it |
| Saved-search match | In-app + WhatsApp digest (batched, not per-match) | High-value but not urgent-per-instance; a live fix to Tuba's current platform's entirely-inert `SavedSearch` feature (`12_SEARCH_STRATEGY.md`) |
| License/compliance expiring | Email (first notice, durable record) escalating to push as the deadline nears | Needs a paper trail (Operations Manager persona, `04_PERSONAS.md`) but becomes urgent close to expiry |
| Contract stage change | In-app + email (to all parties on the contract) | Reference-able, not typically urgent-interrupt-worthy |
| Listing published/rejected | In-app, push only for rejection (actionable) | Publish confirmation is informational; rejection requires action |
| Team member performance summary | Email (weekly digest) | Not time-urgent, benefits from a durable, glanceable format |
| Payment/billing event (renewal charged, package expiring) | Email + in-app | Financial record-keeping needs durability |
| AI action taken on my behalf (description generated, reply drafted) | In-app only (reviewable in AI Copilot's audit view, `10_AI_STRATEGY.md`) | Informational, not urgent — over-notifying AI activity is a fast path to fatigue |
| Platform/system incident affecting my account | Push + email | Rare, high-severity, must reach the broker regardless of channel preference |
| General marketing/product announcements from Tuba | Email only, explicitly separate preference toggle | Never push, never WhatsApp — must not compete with operational notifications for attention |

## WhatsApp specifically

Used deliberately for **digest-style, high-value, low-frequency** notifications (saved-search match summaries) and as an **AI Copilot output channel** (`10_AI_STRATEGY.md`'s reply-drafting can format its output for direct WhatsApp send, since Tuba's current platform already shows brokers habitually leave the platform for WhatsApp via the static `wa.me` deep link — `tuba-current-state/02_PRODUCT_INVENTORY.md`). TBOS does not attempt to replace WhatsApp as the market's dominant messaging channel; it meets brokers where they already are for time-sensitive external communication, while keeping in-platform record-keeping (Leads, Customers) as the source of truth.

## Anti-fatigue rules

1. **Every notification type has exactly one channel-set**, defined above — no broker configures channel-per-type from scratch; they adjust from these sensible defaults.
2. **Digest over instance** wherever the underlying event isn't individually time-urgent (saved-search matches, performance summaries) — never one push per match.
3. **A broker can always see why they got a notification** (Explainability, `14_EXPLAINABILITY_SYSTEM.md`) and mute that specific type without an all-or-nothing kill switch.
4. **The in-app notification center is always accurate** — a "0" badge means zero real unread notifications, never a disconnected counter. This is a direct, binding response to the live-observed "0" badge with clear contradicting account activity (`tuba-current-state/07_UX_AUDIT.md`) — TBOS treats a notification counter that doesn't reflect real state as a shipped defect, not a cosmetic issue.
5. **Failed delivery is visible, not silent** — if a push/SMS/WhatsApp send fails, the notification still appears in-app and the failure is logged (ties to `11_AUTOMATION_STRATEGY.md`'s reliability requirements).

## Notification preferences (Settings module, `06_PRODUCT_ARCHITECTURE.md`)

Per-type opt-out where the type is not safety/compliance-critical; safety/compliance notifications (license expiry, platform incidents) are never fully disable-able, only re-channeled.
</content>
