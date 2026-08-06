# 06 — State Architecture

Every state a screen or record can be in. Two tiers: **universal states** (any screen can be in these, defined once here and referenced by [04_SCREEN_INVENTORY.md](04_SCREEN_INVENTORY.md) rather than redefined per screen), and **record lifecycle states** (owned by a specific module's entity, e.g. Property's 8-state lifecycle). Every state below answers: User message, Primary action, Secondary action, Recovery path, AI opportunity — per the master prompt's Phase 6 requirement.

## 1. Universal states (apply across screens)

### Empty
| | |
|---|---|
| User message | States what would normally be here, why it's empty, and the one action that fills it — never a bare "no data." |
| Primary action | A working control that creates the first record or resolves the emptiness (e.g., "Add Property," never a dead link). |
| Secondary action | Link to Knowledge (KB-01) explaining the module, for a genuinely new user. |
| Recovery path | N/A — this state resolves itself once data exists; no separate recovery needed. |
| AI opportunity | For TODAY-01/NOTIF-01 specifically, the empty state is *positive* ("You're all caught up") rather than a call-to-action — AI has no role in generating this message, it's deterministic based on zero pending items. |

### Loading
| | |
|---|---|
| User message | None required if <~300ms; a skeleton matching the real layout if longer (Design Principle "Loading philosophy"). |
| Primary action | None — loading states have no user action, only a visible progress indicator. |
| Secondary action | Cancel, if the operation is user-initiated and cancellable (e.g., a large export). |
| Recovery path | If loading exceeds a reasonable bound (e.g., >10s with no progress), degrades to an Error state with retry rather than spinning indefinitely. |
| AI opportunity | Anything >~3s (AI generation, report compilation) hands off to a background job with completion notification instead of holding the user on a loading screen at all. |

### Offline
| | |
|---|---|
| User message | "You're offline — showing data as of [timestamp]." Never presented as if live. |
| Primary action | Retry connection (automatic background retry + manual "try again"). |
| Secondary action | None. |
| Recovery path | Automatically resolves and refreshes silently once connectivity returns, with a brief confirmation that data is now current. |
| AI opportunity | None. |

### No Permission
| | |
|---|---|
| User message | Plain-language statement of what's restricted and why (role-based), never a raw 403. |
| Primary action | "Request access" if the agency's RBAC config supports a request-to-manager flow; otherwise none. |
| Secondary action | Link back to the nearest screen the user does have access to. |
| Recovery path | Resolves automatically once a manager (AO/SM) grants the permission in SET-02 — no re-login required. |
| AI opportunity | None — permission grants are never AI-mediated (high-trust action). |

### Error
| | |
|---|---|
| User message | Plain language explaining what happened and what to try next; never raw system/stack detail (Design Principle "Error states"). |
| Primary action | Retry. |
| Secondary action | Contact support / view incident detail, for page/incident-level errors. |
| Recovery path | Logged with enough detail for engineering to diagnose without reproduction; user-facing retry is independent of that logging. |
| AI opportunity | None in the error path itself; AI Copilot (AICP-01) may be offered as a "explain this error" affordance for non-obvious cases. |

### Restricted — Payment Required / Subscription Expired
| | |
|---|---|
| User message | States exactly what's restricted and why (quota exhausted, package expired), with the specific number/date involved — never a vague "upgrade required." |
| Primary action | Direct link to WAL-02 to resolve (top up, renew, upgrade). |
| Secondary action | View what remains accessible at the current/free tier. |
| Recovery path | Restriction lifts immediately on successful payment/renewal — no manual re-activation step. |
| AI opportunity | Tier-recommendation nudge (WAL-01's AI action) may pre-empt this state by surfacing usage trend before the hard restriction hits. |

### Archived
| | |
|---|---|
| User message | "Archived on [date]" with the archiving actor/reason if provided. |
| Primary action | Un-archive (single action, no data loss). |
| Secondary action | View in context of archived-items filter within the parent list. |
| Recovery path | Un-archive is always available with no time limit (distinct from Deleted's grace-window model). |
| AI opportunity | None. |

### Deleted (soft-delete, recovery window)
| | |
|---|---|
| User message | Plain-language consequence statement shown *before* deletion is confirmed (Confirmation Dialog component); post-deletion, "Deleted on [date] — recoverable until [date]." |
| Primary action | Restore, while inside the recovery window. |
| Secondary action | View what else was affected (scoped-consequence detail). |
| Recovery path | Restore reverses fully within the window; past the window, permanent removal — no recovery, stated explicitly at deletion time so it's never a surprise later. |
| AI opportunity | None — deletion is explicitly excluded from AI/automation involvement ([01](01_EXPERIENCE_ARCHITECTURE.md) WF-DELETION). |

## 2. Module-specific lifecycle states

### Property / Project lifecycle (PROP-02, PROJ-02) — the canonical 8-state set, KEEP from current platform per `tuba-current-state/14_KEEP_IMPROVE_REMOVE.md`, now with full explanation/action per state

| State | User message | Primary action | Secondary action | Recovery path | AI opportunity |
|---|---|---|---|---|---|
| Draft | "Not yet published — [N] steps remaining." | Continue wizard (→ PROP-03) | Delete draft | Resumable indefinitely | Content-quality pre-check hints while still in Draft |
| Pending Compliance | "Waiting on [specific requirement] before this can go live." | View/resolve the specific requirement | View estimated timeline | Auto-transitions to Active on verification | Document Intelligence pre-fill |
| Active | "Live since [date]. [Performance summary line]." | Edit, change price | Archive | N/A (healthy state) | Property Quality recommendations, price-band context |
| Expiring | "Expires in [N] days — renew now to avoid a gap." | One-click renew | Snooze reminder (not dismiss) | Auto-escalates urgency as date nears | None (deterministic) |
| Expired | "Expired on [date]. [N] days until archive." | Renew | View what's affected | Renewable within grace window before auto-archive | None |
| Rejected | "Rejected: [specific reason]. Fix [specific field] to resubmit." | Fix and resubmit | View full rejection detail | Re-enters review queue automatically once fixed | Property Quality score should reduce recurrence |
| Sold / Rented | "Marked Sold/Rented on [date]." | Archive | Create similar new listing | N/A (terminal, positive) | None |
| Archived | (see Universal §1 Archived) | Un-archive | Relist as new | Un-archive restores full record | None |

### Lead pipeline stages (LEAD-01/02/03)

| State | User message | Primary action | Secondary action | Recovery path | AI opportunity |
|---|---|---|---|---|---|
| New | "Just arrived — not yet routed." | (system auto-routes; rarely user-facing for more than seconds) | Manual assign if auto-routing had no confident match | N/A | Lead Scoring attaches here |
| Assigned | "Assigned to [broker] — SLA: [time remaining]." | Respond | Reassign | Auto-escalates on SLA risk | Reply drafting available from here forward |
| Contacted | "First response sent [time ago]. Awaiting reply." | Follow up | Log outside interaction | N/A | Next-best-action suggestion |
| Qualified | "Confirmed interest — [budget/preference summary]." | Schedule showing / send options | Update preferences | N/A | Customer Intelligence summary |
| Negotiating | "Offer in progress: [terms summary]." | Update offer terms | Escalate to manager | N/A | None (human judgment stage) |
| Won | "Converted — Contract #[id] created." | Continue in Contracts | View contract | N/A | None |
| Lost | "Marked Lost: [required reason]." | Reopen (if reason was premature) | View similar active leads | Reopenable, not permanently closed | Lost-reason pattern feeds Analytics |

### Contract lifecycle (CONT-02)

| State | User message | Primary action | Secondary action | Recovery path | AI opportunity |
|---|---|---|---|---|---|
| Draft | "Terms captured — compliance checklist not yet started." | Start compliance checklist | Edit terms | N/A | None |
| Pending Compliance | "Waiting on [specific document/verification]." | Resolve the specific item | View elapsed/expected time | Auto-transitions on verification result | Document Intelligence |
| Active | "Active since [date]. Renewal due [date]." | View documents | Amend (with audit trail) | N/A | None |
| Renewal Due | "Renews in [N] days." | Renew | Decline renewal (with reason) | Same reminder cadence as WF-RENEWAL | None (deterministic) |
| Closed | "Closed on [date]." | Archive | View final documents | N/A (terminal, positive) | None |
| Cancelled | "Cancelled on [date]: [reason]." | View cancellation detail | Start new contract for same parties | N/A (terminal) | None |

### Marketing Request states (OWN-03)

| State | User message | Primary action | Secondary action | Recovery path | AI opportunity |
|---|---|---|---|---|---|
| Open | "New request from [owner] — matches your [district/specialty]." | Claim/respond | Reassign to better-matched broker | N/A | AI matching to broker capacity |
| In Progress | "Responded [time ago] — awaiting owner." | Follow up | — | N/A | None |
| Won | "Converted to listing/relationship." | View resulting record | — | N/A | None |
| Lost | "Marked Lost: [required reason]." | — | View pattern in Analytics | Reopenable if premature | Lost-reason pattern feeds Analytics |

### Wallet / subscription states (WAL-01/02)

| State | User message | Primary action | Secondary action | Recovery path | AI opportunity |
|---|---|---|---|---|---|
| Active, healthy | "[Tier] — [N] of [total] quota used." | View usage detail | Change tier | N/A | Tier-recommendation nudge |
| Approaching limit | "[N]% of quota used — consider upgrading before you run out." | Upgrade | Dismiss (reappears at hard limit) | N/A | Usage-trend projection |
| Exhausted | "Quota reached — [specific action, e.g. publishing] is paused until you upgrade or the cycle renews." | Upgrade / top up | View renewal date | Lifts immediately on payment | None |
| Payment failed | "Payment didn't go through: [specific reason, never raw gateway text]." | Retry payment / update method | Contact support | Retry succeeds → resumes Active | None |
| Expired | "Subscription expired on [date]." | Renew | View what's restricted meanwhile | Renewing restores full access immediately | None |

### AI action states (AICP-02, and any AI Suggestion Inline Block)

| State | User message | Primary action | Secondary action | Recovery path | AI opportunity |
|---|---|---|---|---|---|
| Generated, pending review | "AI-suggested — review before it's used." | Accept / edit | Discard | Discard reverts to manual entry, no penalty | N/A (this is the AI opportunity itself) |
| Accepted, unedited | "Used as suggested." | — | Flag as incorrect | Flagging feeds model/prompt improvement | N/A |
| Accepted, edited | "Used with edits." | — | View original suggestion | N/A | N/A |
| Low confidence | "Low confidence — verify manually before relying on this." | Manual override always available | Request regeneration | N/A | Confidence is itself the signal, no further AI needed |
| Failed | "AI assistance unavailable right now — continue manually." | Continue manually (workflow never blocks) | Retry | Retry independent of the surrounding form's state | N/A |

## 3. State-diagram index

See `diagrams/states.mmd`, indexed in [19_MASTER_MERMAID_DIAGRAMS.md](19_MASTER_MERMAID_DIAGRAMS.md), for the Property lifecycle and Lead pipeline rendered as explicit state-transition diagrams — the two lifecycles with the most transition complexity and the most direct link to a named current-platform defect (ambiguous status states, misrouted leads).

## 4. Cross-cutting rule

No screen in [04_SCREEN_INVENTORY.md](04_SCREEN_INVENTORY.md) may ship a state not covered by this document. If implementation discovers a state genuinely not listed here, it's added here first — states are never invented ad hoc in a single screen's spec, consistent with the reuse discipline in [05_COMPONENT_MAPPING.md](05_COMPONENT_MAPPING.md) §3.
