# 16 — Content Guidelines

Voice and microcopy rules for every string TBOS ships. This is the visual system's textual half — a beautifully typeset bare "No data" still fails Design Principle 9. Terminology here must match `tbos-definition/21_GLOSSARY.md` exactly; this document never introduces a synonym for an already-canonical term.

## 1. Voice

TBOS reads as a competent colleague, not a marketing brochure and not a terse system log. Concretely:

| Do | Don't |
|---|---|
| "Contact these 5 leads today — they're going cold." | "You have 12 active leads." |
| "This will remove 3 leads from this campaign." | "Are you sure?" |
| "License expires in 14 days — renew now to avoid a listing gap." | "Restricted: upgrade required." |
| "Saved. Contract #123 can now proceed." | "Saved." |

Never marketing tone inside authenticated surfaces — no exclamation points as a default, no "Awesome!"/"Oops!" register, no confetti-adjacent copy. This follows directly from Non-Goal 8 (`tbos-definition/20_NON_GOALS.md`): "not a landing page with a login."

## 2. Terminology — use exactly, never a synonym

Canonical terms from `tbos-definition/21_GLOSSARY.md`: **TBOS** (never "the platform," "the app," "the dashboard," or "the CRM" in first reference), **Broker OS** vs. **Platform Console** (never conflated), **Today** vs. **Tasks** (Today is derived/algorithmic; Tasks are durable/assignable — confusing them in copy is treated as a defect), **Quick Actions** (the specific 4-action control, never a generic term for any shortcut), **AI Copilot**, **RBAC**, **JTBD**.

Module names, capitalized exactly: Home, Today, Tasks, Properties, Projects, Leads, Customers, Owners, Contracts, Marketing, Finance, Wallet, Analytics, Reports, Automation, AI Copilot, Notifications, Knowledge, Settings.

Lifecycle stage names, exact, never paraphrased in UI copy: Lead pipeline (New, Assigned, Contacted, Qualified, Negotiating, Won, Lost), Property/Project (Draft, Pending Compliance, Active, Expiring, Expired, Rejected, Sold/Rented, Archived), Contract (Draft, Pending Compliance, Active, Renewal Due, Closed, Cancelled).

## 3. Buttons

Verb-first, states the actual outcome, never generic: "Add Property" not "Submit," "Send Reply" not "OK," "Archive Listing" not "Delete." A destructive action's button label states what's destroyed: "Delete 3 Leads," not "Delete" or "Confirm." Primary/secondary/danger button copy pairs with the visual action styling in [12_COMPONENT_GUIDELINES.md](12_COMPONENT_GUIDELINES.md) Confirmation Dialog — the button's color and its verb must agree (a `text.danger`-styled button never carries a neutral verb like "Continue").

## 4. Validation and error copy

States what's wrong and how to fix it, in that order, never just "Invalid input." Field-level: "Phone number must include the country code (e.g. +966…)." Page/banner-level errors state what failed, what's unaffected, and the recovery path: "Couldn't load recent leads. Your other data is unaffected — retry." Never blame the user ("You entered this wrong") and never hide the system's own fault behind vague copy ("Something went wrong") when a more specific cause is knowable.

## 5. Success copy

States the outcome and, where relevant, what happens next (Design Principle 9) — never a bare "Saved" or "Done" when more is knowable: "Saved. Contract #123 can now proceed" (when the save unblocked something), "Property listed — visible on the marketplace within 5 minutes."

## 6. AI wording

AI-originated content is labeled as such inline ("AI suggested," "AI drafted this reply") — never presented as if a human wrote it. Confidence is stated in words, not just implied by color: "High confidence — based on 14 similar past deals." Explainability Popover copy follows the five-question order exactly (why → how calculated → what changed → recommended action → business impact) and never repeats the metric's own name as if that were an explanation (binding standard, `tbos-definition/14_EXPLAINABILITY_SYSTEM.md`).

## 7. Notifications

Terse, front-loads the actionable fact: "Lead 'Ahmed S.' has gone 48 hours without a reply" not "You have a notification about a lead." Critical/High-tier push notifications state the record and the urgency in the first ~40 characters (visible in an OS notification preview without expansion).

## 8. Tooltips and labels

A tooltip adds information the label doesn't already state — never repeats the label verbatim (the same standard the Explainability Popover is held to, applied to the simpler case). Form labels are nouns or noun phrases ("Listing Price," not "Enter the listing price").

## 9. Empty states

Three required parts, always: **what would be here**, **why it's empty right now**, **a working action**. Never a bare "No data" or "Nothing to show" (binding, `tbos-blueprint/06_STATE_ARCHITECTURE.md`):

- First-use empty: "No properties yet. Add your first listing to start tracking leads and compliance in one place. [Add Property]"
- Filtered-to-zero empty: "No leads match 'Riyadh, Villa, Won this month.' [Clear filters] or [Broaden search]"
- Genuinely-caught-up empty (Today): "You're all caught up." — the one place a short, positive empty state is correct, because the "why" is self-evident and stated as an accomplishment, not an absence.

## 10. Restricted/upgrade copy

Never a vague "Upgrade required." States the specific number, date, or limit: "You've used 48 of 50 listings this month. Upgrade to add more, or wait until your plan resets on the 1st." (binding, State Architecture's Restricted-state rule).

## 11. Localization

Every string is authored for translation from the start — no string concatenation that assumes English word order (Arabic sentence structure differs), no hardcoded plural handling (Arabic has more plural forms than English), no idioms that don't translate ("going cold" for a stale lead is checked for a natural Arabic equivalent, not machine-translated literally). AI-generated copy is authored natively per-language at generation time — never machine-translated after the fact (binding, [11_ACCESSIBILITY.md](11_ACCESSIBILITY.md) §8). Full RTL/locale mechanics: [15_INTERNATIONALIZATION.md](15_INTERNATIONALIZATION.md).
