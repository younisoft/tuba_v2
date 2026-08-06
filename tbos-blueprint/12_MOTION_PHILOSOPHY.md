# 12 — Motion Philosophy

`tbos-definition/03_DESIGN_PRINCIPLES.md`'s "Motion" principle is the source rule: motion communicates state change only, never decoration; every animation respects `prefers-reduced-motion`; no unconditioned scroll-triggered decorative animation. This document extends that rule into a usable philosophy — when motion helps, when it must be avoided, and the timing/microinteraction conventions every screen follows. No animation curves, durations-in-milliseconds, or easing values specified here — that belongs to the design-system phase after this blueprint; this is *when and why*, not *how it looks*.

## 1. When motion is useful

Motion earns its place only when it does one of these four jobs:

1. **Orients** — shows where content came from or where it's going (a slide-over panel entering from the edge it's contextually attached to, per [02_NAVIGATION_BLUEPRINT.md](02_NAVIGATION_BLUEPRINT.md) §5's contextual-navigation pattern) so the user's spatial model of the product stays intact.
2. **Confirms** — makes a state change legible at the moment it happens (a Status Badge transitioning, a checklist item completing) so the user doesn't have to re-scan the screen to notice what changed.
3. **Continues** — signals that work is happening without blocking the user (skeleton loaders, background AI-generation indicators) per Design Principle "Loading philosophy."
4. **Guides attention** — briefly draws the eye to something that newly requires it (a new Critical entry landing at the top of TODAY-01) without being so persistent it becomes noise.

## 2. When motion must be avoided

- **Never as decoration.** No animation exists purely because a screen "feels empty" without it — that's a Minimalism-principle failure disguised as a motion one.
- **Never on data itself.** Numbers, prices, and metrics update in place, instantly — a counting-up animation on a revenue figure invites the exact "is this real or decorative" doubt Design Principle "Trust" exists to prevent.
- **Never blocking.** No animation gates the user from acting until it completes (a panel that must fully finish sliding in before its buttons become clickable is a defect, not a polish detail).
- **Never on authenticated, transactional screens as marketing.** Consistent with `tbos-definition/20_NON_GOALS.md` #8 — TBOS is not a landing page with a login; no promotional motion (confetti, mascots, marketing-style reveal animations) belongs inside Broker OS.
- **Never scroll-triggered for its own sake.** A list scrolling into view does not need to fade/slide each row in — this is the specific "unconditioned scroll-triggered decorative animation" the source Design Principle prohibits by name.
- **Never as the only signal of a state change.** Motion accompanies a state change, it never substitutes for the text/icon/ARIA-live announcement that makes the same change legible without motion (accessibility floor, [11_ACCESSIBILITY_BLUEPRINT.md](11_ACCESSIBILITY_BLUEPRINT.md) §10).

## 3. Loading transitions

- Anything under ~300ms: no transition needed, content simply appears (per Design Principle "Loading philosophy" threshold).
- ~300ms–~3s: Skeleton Loader ([05_COMPONENT_MAPPING.md](05_COMPONENT_MAPPING.md)) matching the real layout, present for the actual duration of the wait — never an artificially prolonged skeleton for perceived-polish reasons, and never a generic spinner unrelated to the content shape.
- Beyond ~3s (AI generation, report compilation, large exports): handed to a background job with a completion notification ([09_NOTIFICATION_BLUEPRINT.md](09_NOTIFICATION_BLUEPRINT.md)) — the user is never held on a loading transition this long.
- Transition *from* skeleton *to* real content is a simple cross-fade or instant swap — never a bouncy/springy reveal that draws attention to the loading mechanism itself rather than the now-available content.

## 4. Success transitions

- A meaningful action's Inline Success Confirmation ([05](05_COMPONENT_MAPPING.md)) appears immediately, stating what happens next — its entrance motion (if any) is a brief, single appearance, never a repeating or attention-grabbing loop.
- State-badge transitions (e.g., Pending Compliance → Active) animate in place rather than the record disappearing from one list and reappearing in another with no visible connection — preserves the user's mental model of "this is the same record, its status changed" (Orients, per §1).
- Publishing/closing/renewing (the Constitution's named meaningful actions) get a distinct, non-generic success moment — never the same bare toast used for a trivial autosave, because conflating the two undersells the actions that matter (Design Principle "Success states").

## 5. Navigation transitions

- Desktop/tablet: contextual panels (slide-overs) enter/exit from the edge matching their trigger's position — reinforces the "this is a detail of what I clicked, not a new destination" reading, consistent with [02](02_NAVIGATION_BLUEPRINT.md) §5's rule that a panel is never the only way to reach a record.
- Mobile: full-screen pushes follow the platform-native forward/back transition direction so back-gesture expectations aren't violated.
- Rail collapse/expand (desktop) and icon-rail expand (tablet) animate the transition so the user's spatial memory of item positions isn't broken by an instant jump — this is the one chrome-level animation justified purely by orientation (§1.1), not decoration.
- Command Palette / Global Search (CMD-01/GS-01) opens with minimal motion — near-instant, since it's a keyboard-first power-user surface where animation latency directly costs the speed the feature exists to provide (Design Principle "Speed").

## 6. Feedback timing

| Interaction | Feedback timing rule |
|---|---|
| Button press / tap | Immediate visual acknowledgment (<100ms) regardless of how long the underlying action takes — the press must never feel unregistered even while the real operation is still in flight |
| Form field validation | On blur and on submit, never only on submit for a long form (per [05](05_COMPONENT_MAPPING.md) Form Field contract) |
| Toggle switch | State flips immediately in the UI; if the save call fails, it visibly reverts with an inline error rather than silently staying in the optimistic state |
| Drag interaction (Kanban) | Continuous visual feedback during drag; on drop, the card's new state confirms within the same motion, no separate follow-up animation |
| AI generation | "Thinking" state visible within ~300ms of request, matching the same loading-transition threshold as §3 |

## 7. Microinteraction philosophy

- Every microinteraction (hover state, toggle flip, checkbox check, badge update) exists to answer "did that register?" — never to add personality for its own sake, consistent with TBOS's Broker-first, decision-first identity (Philosophy Principles #7, #8) rather than a consumer-marketing product's expressive-motion identity.
- Microinteractions are consistent per component contract ([05](05_COMPONENT_MAPPING.md)) — a Toggle Switch feels the same whether it's in NOTIF-02 or AUTO-01, never bespoke per screen.
- `prefers-reduced-motion` collapses every microinteraction above to its instant end-state with zero information loss — tested explicitly, not assumed to "just work," per [11_ACCESSIBILITY_BLUEPRINT.md](11_ACCESSIBILITY_BLUEPRINT.md) §10.

## 8. Acceptance bar

A proposed animation that can't name which of the four jobs in §1 it performs is decoration and does not ship — the same hard-gate posture applied throughout this blueprint (Feature Principles template, Explainability contract, Accessibility bar).
