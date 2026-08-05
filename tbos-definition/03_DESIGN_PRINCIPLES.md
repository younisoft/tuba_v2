# 03 — Design Principles

**Status**: Recommended. This document defines *how every screen must behave*, not what any screen looks like — no colors, no components, no layouts. Visual system design is explicitly out of scope for this phase (see `20_NON_GOALS.md`). Each principle is stated as a testable rule, not a mood word.

---

## Consistency

**Rule**: a capability has exactly one visual and interaction pattern across the entire product, regardless of which module surfaces it. A "status" looks and behaves the same in Properties as it does in Contracts as it does in Leads.

**Why it's a rule and not a preference**: Tuba's current platform has no component library — cards, buttons, and forms are hand-copied per screen with no shared source of truth (`tuba-current-state/10_COMPONENT_LIBRARY.md`), producing at least three visually distinct button treatments with no evident system. Consistency in TBOS is enforced by definition (one pattern per capability), not by design-review vigilance.

## Clarity

**Rule**: a first-time user of any screen can state, within 5 seconds, what the screen is for and what the single most important thing on it is. If two things compete for primary attention, the screen is wrong, not the user.

## Accessibility

**Rule**: every interactive element is keyboard-operable and screen-reader-legible by construction — not retrofitted. Status toggles announce their state (`aria-pressed`/`role="switch"` equivalents), every image has a real, non-filename `alt` description, and no critical information is conveyed by color alone.

**Why**: Tuba's live platform has a real, observed example of the *good* version of this (a genuinely focusable buy/rent toggle) sitting next to the *bad* version (no `aria-pressed` state, so a screen-reader user still can't tell which option is active) — `tuba-current-state/06_WORKFLOW_ANALYSIS.md`/`08_UI_AUDIT.md`. TBOS's rule closes that specific gap by construction.

## Speed

**Rule**: no interaction a broker performs more than once a day should take more than two steps. No page load should block on a synchronous third-party call (payment status, AI generation, image processing) — these run asynchronously with a visible progress state, never a frozen screen.

**Why**: Tuba's current platform runs OpenAI calls, image optimization, and PDF generation synchronously in the request cycle with no queue (`tuba-current-state/11_TECHNICAL_ARCHITECTURE.md`) — this is an implementation detail, but the design principle it violates is real: a broker should never watch a spinner because the system chose to do slow work on the critical path.

## Trust

**Rule**: no number is displayed unless it is either real-time-accurate or explicitly labeled with its as-of time. No status is displayed unless the underlying state actually supports it (no "verified" badge without a real verification; no review count that isn't a real count).

**Why**: directly closes the "decorative dashboard" and "fake review tile" findings from `tuba-current-state/07_UX_AUDIT.md`.

## Minimalism

**Rule**: a screen earns every element on it. If removing an element doesn't reduce what the user can accomplish, remove it. Default states show the smallest useful set of fields/columns; anything else is opt-in (a "show more" or a customizable column set), never opt-out.

## Responsiveness (layout, not performance)

**Rule**: every screen is designed mobile-first and verified at three breakpoints (mobile, tablet, desktop) before it is considered complete. No text may be clipped by a viewport edge at any breakpoint; floating UI elements (chat, help, quick-actions) must never overlap each other or obscure primary content.

**Why**: Tuba's live mobile dashboard has a directly observed instance of exactly this failure — a section heading clipped at the screen edge, and a floating "scroll" control overlapping the stats grid alongside the WhatsApp button (`tuba-current-state/08_UI_AUDIT.md`). This is not a hypothetical risk in this market; it is a confirmed, present-tense defect in the platform TBOS replaces.

## Motion

**Rule**: motion communicates state change (something loaded, something was confirmed, something moved) — it never runs for decoration. Every animation respects `prefers-reduced-motion`. No page ships unconditioned scroll-triggered decorative animation libraries.

**Why**: Tuba's current platform loads `wow.js`/`parallax.js` unconditionally sitewide with no reduced-motion handling (`tuba-current-state/09_DESIGN_SYSTEM.md`) — purely decorative motion with a real accessibility cost and no functional payoff.

## Empty states

**Rule**: an empty state always states (a) what would normally be here, (b) why it's empty right now, and (c) the one action that would fill it — rendered as a working control, not a static message. A blank screen with no explanation is never acceptable, regardless of whether the underlying feature is fully built.

**Why**: this is not abstract. Tuba's own live platform has a confirmed dead end today (`/developer-packages`, "no data found," no path forward) that is structurally identical to the Aqar dead-end (`/user/campaigns/new`) the TBX synthesis specifically names as the cautionary example to test every empty state against (`tuba-current-state/06_WORKFLOW_ANALYSIS.md` §6; `competitor-analysis/TUBA_BROKER_EXPERIENCE_FOUNDATION.md` §6 principle 6). TBOS treats this as the highest-priority design principle to enforce by checklist before any module ships, precisely because it has already failed twice in this competitive set.

## Error states

**Rule**: an error never exposes raw system detail (stack traces, database errors) to a broker, but always explains in plain language what happened and what to try next — and is logged with enough detail that support/engineering can diagnose it without asking the broker to reproduce it.

**Why**: Tuba's live platform gets half of this right today — a real HTTP 500 on `/properties/create` renders a plain, non-debug error page (`tuba-current-state/06_WORKFLOW_ANALYSIS.md`) — but offers the broker no next step at all. TBOS keeps the "don't leak internals" discipline and adds the "tell the user what to do" half that's currently missing.

## Success states

**Rule**: completing a meaningful action (publishing a listing, closing a lead, renewing a license) is always confirmed explicitly, and the confirmation states what happens next (when it goes live, who was notified, what to expect) — never a bare "Saved" toast.

## Loading philosophy

**Rule**: anything that takes longer than ~300ms shows a skeleton of the real layout, not a generic spinner — the broker should be able to predict the shape of what's coming. Anything that takes longer than ~3 seconds (AI generation, report compilation) is handed off to a background job with a notification on completion, never held on-screen.

## Interaction philosophy

**Rule**: destructive actions (delete, remove team member, cancel a listing) always require a confirmation that states the specific consequence in plain language — never a generic "Are you sure?" Bulk actions always show a preview of what will be affected before committing.

**Why**: Tuba's current platform has a live, confirmed IDOR where a delete action can silently remove *any* row of *any* model with no ownership check and no confirmation of consequence (`tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md` §4) — an extreme version of exactly the interaction-design failure this principle exists to prevent, even setting aside the security dimension entirely.

---

## How these are enforced

These are testable rules, not aspirations — each maps to a checklist item any module spec (`16_MODULE_SPECIFICATIONS.md`) or feature definition (`17_FEATURE_PRINCIPLES.md`) must pass before implementation begins in a later phase.
</content>
