# 10 — Motion System

`tbos-blueprint/12_MOTION_PHILOSOPHY.md` fixed *when and why* motion is allowed and explicitly deferred *how it looks* to this document: "No animation curves, durations-in-milliseconds, or easing values specified here — that belongs to the design-system phase." This is that specification.

## 1. The four jobs motion is allowed to do

Restated from the blueprint, binding: motion exists only to **orient, confirm, continue, or guide attention.** If a proposed animation doesn't serve one of these four jobs, it doesn't ship — this is checked the same way a proposed component is checked against `05_COMPONENT_MAPPING.md`'s reuse discipline.

| Job | Example | Never |
|---|---|---|
| **Orients** | Slide-over Panel entering from the edge it's conceptually attached to | A page transition with no spatial relationship to what triggered it |
| **Confirms** | A saved-state checkmark micro-animation on Toggle Switch | Counting-up animation on a number or price (forbidden, see §2) |
| **Continues** | A list item's exit animation when archived, so its neighbors' reflow reads as continuous rather than a jump-cut | Automatic carousel/auto-advancing content |
| **Guides attention** | A newly-arrived Critical notification's brief entrance emphasis | Looping/idle animation, pulsing badges with no state change behind them |

## 2. Absolute prohibitions

- **Never on data itself.** No counting-up/ticking animation on metrics, prices, or scores — `tbos-blueprint/12`, verbatim: "invites the exact 'is this real or decorative' doubt Trust exists to prevent." A number changes instantly, or via a brief cross-fade at most.
- **Never blocking.** A panel's buttons must be clickable before its entrance animation finishes — motion is always visually-only, never gating interaction.
- **Never scroll-triggered or decorative.** Direct rejection of Tuba's legacy `wow.js`/`parallax.js` sitewide load (`tuba-current-state/09_DESIGN_SYSTEM.md`). No parallax, no reveal-on-scroll, anywhere in an authenticated surface.
- **Never a substitute for a missing state.** If content needs a loading spinner because it has nothing better, that's a Skeleton Loader problem to fix in [12_COMPONENT_GUIDELINES.md](12_COMPONENT_GUIDELINES.md), not a motion problem to animate around.

## 3. Duration scale

`tokens.json` → `motion.duration`:

| Token | ms | Use |
|---|---|---|
| `instant` | 0 | Reduced-motion fallback for everything below |
| `micro` | 80 | Button press acknowledgment (must register within the <100ms binding floor, [01_DESIGN_PRINCIPLES.md](01_DESIGN_PRINCIPLES.md)), toggle flip |
| `fast` | 120 | Hover state transitions, focus ring appearance, tooltip appearance |
| `base` | 180 | Dropdown/menu open, tab switch, most micro-interactions — the default for anything not otherwise specified |
| `moderate` | 240 | Slide-over Panel entrance/exit, Dialog open/close |
| `slow` | 320 | Command Palette open (the largest, most attention-commanding overlay) — the ceiling; nothing in TBOS animates slower than this |

**Why the ceiling is 320ms**: `00_DESIGN_SYSTEM_FOUNDATION.md` §5 names repeated daily use as the defining constraint — an animation that feels appropriately weighty the first time becomes friction by the hundredth. 320ms is already at the outer edge of what a daily-use enterprise tool should ask a user to wait through.

## 4. Easing

Three curves, `tokens.json` → `motion.easing` — deliberately not a spring/bounce curve anywhere in the system, which would read as playful rather than "calm, trustworthy" ([00](00_DESIGN_SYSTEM_FOUNDATION.md) §3):

| Token | Curve | Use |
|---|---|---|
| `standard` | `cubic-bezier(0.2, 0, 0, 1)` | Default for any transition with both a start and end state visible on screen (dropdown open, tab switch) |
| `decelerate` | `cubic-bezier(0, 0, 0, 1)` | Entrances — content arriving from off-screen or from nothing (Panel/Dialog/Toast entrance) |
| `accelerate` | `cubic-bezier(0.3, 0, 1, 1)` | Exits — content leaving the screen (Panel/Dialog/Toast dismissal) |

## 5. Per-component motion assignment

| Component | Trigger | Duration | Easing |
|---|---|---|---|
| Button | Press | `micro` | `standard` |
| Toggle Switch | Flip | `micro` | `standard` |
| Dropdown / Menu | Open | `base` | `decelerate` |
| Dropdown / Menu | Close | `fast` | `accelerate` |
| Tab Group | Switch | `base` | `standard` |
| Tooltip / Explainability Popover | Appear | `fast` | `decelerate` |
| Toast / Inline Success Confirmation | Enter | `base` | `decelerate` |
| Toast / Inline Success Confirmation | Auto-dismiss exit | `fast` | `accelerate` |
| Slide-over Panel | Open/close | `moderate` | `decelerate` / `accelerate` |
| Confirmation Dialog | Open/close | `moderate` | `decelerate` / `accelerate` |
| Command Palette | Open/close | `slow` | `decelerate` / `accelerate` |
| Skeleton Loader | Pulse | continuous, 1200ms cycle, `opacity.skeletonPulse` range | `standard` (ease in/out symmetric) |
| List item add/remove/reflow | Insert/remove | `base` | `standard` |

## 6. Reduced motion

`prefers-reduced-motion: reduce` collapses every duration above to `instant` (0ms), with **zero information loss** — binding rule (`tbos-blueprint/12`). A Slide-over Panel still opens and closes, just without the slide; a Skeleton Loader's pulse becomes a static mid-tone fill rather than stopping the loading indicator itself. This is implemented once, at the token layer (`motion.reducedMotion` in `tokens.json`), never as a per-component afterthought — any component that hardcodes its own duration instead of referencing the token scale breaks this guarantee.

## 7. AI-specific motion

Streamed AI responses (AI Conversation Thread, AI Suggestion Inline Block) use a text-append reveal, not a typewriter character-by-character animation — `aria-live="polite"` announces the completed message, and a per-character animation both delays that announcement and risks reading as an affectation rather than genuine streaming. A Confidence Indicator or Recommendation Card never animates its own confidence/urgency value changing after initial render — if a recommendation's ranking changes, it's re-rendered in its new position via the standard list-reflow motion (§5), not a value tween.
