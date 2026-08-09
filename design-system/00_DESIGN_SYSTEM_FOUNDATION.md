# 00 — Design System Foundation

## 1. Why this exists

[`tbos-definition/00_PRODUCT_CONSTITUTION.md`](../tbos-definition/00_PRODUCT_CONSTITUTION.md) Article XIII is explicit: its 24 documents specify *no screens, no components, no visual system, no frontend code*, and none should be inferred from them. [`tbos-blueprint/`](../tbos-blueprint/) then specified 49 screens and every component's *behavior contract* — but deliberately left "what it looks like" for later. [`tbos-blueprint/12_MOTION_PHILOSOPHY.md`](../tbos-blueprint/12_MOTION_PHILOSOPHY.md) says this outright: "No animation curves, durations-in-milliseconds, or easing values specified here — that belongs to the design-system phase after this blueprint."

This is that phase. Two years of screens, all built by different people, must look like they came from the same product. That's only possible if the visual decisions get made once, here, and never again per-screen.

## 2. Design vision

TBOS looks like operating software a broker trusts with their business, not like a marketing site that happens to have a login. Concretely, that means:

- **Dense but never cluttered.** Brokers and their teams work in this product for hours a day (Constitution: "long working sessions" is a named design constraint). A screen that looks impressive in a five-minute demo but tires the eye in hour three has failed.
- **Calm, not decorative.** Nothing moves, glows, or changes color unless it's telling the user something true. This is a direct consequence of the Trust principle (§4 below) — decoration that isn't information reads as noise at best and as manipulation at worst.
- **Fast to scan, slow to fatigue.** High information density (property lists, lead pipelines, finance tables) rendered with enough whitespace, hierarchy, and restraint that scanning doesn't become work.
- **Bilingual by construction, not by patch.** Arabic RTL and English LTR are both first-class. See §7 and [15_INTERNATIONALIZATION.md](15_INTERNATIONALIZATION.md).

## 3. Visual personality

Five adjectives from the master brief, made concrete enough to check a design against:

| Adjective | What it looks like | What it never looks like |
|---|---|---|
| **Professional** | Restrained palette, precise alignment, consistent iconography | Playful illustrations, mascots, novelty fonts |
| **Modern** | Clean geometric type, generous negative space, flat/near-flat surfaces | Skeuomorphism, gradients-as-decoration, drop shadows on everything |
| **Elegant** | Deliberate hierarchy — one clear focal point per screen | Every element competing for attention at once |
| **Calm** | Motion only for orientation/confirmation ([10_MOTION_SYSTEM.md](10_MOTION_SYSTEM.md)), muted semantic color | Bright, saturated color as a default; celebratory animation on ordinary actions |
| **Trustworthy** | Every number is real-time-accurate or labeled with its as-of time (Design Principle, verbatim) | Ambient/placeholder numbers, unlabeled estimates |

## 4. Trust model, inherited

`tbos-definition/03_DESIGN_PRINCIPLES.md`'s Trust principle exists because of a real, documented failure: Tuba's current dashboard fires four consumer ad-attribution pixels at a *paying broker*, and shows a hardcoded "Ratings and Reviews: 0" tile that was never real data ([`tuba-current-state/06_WORKFLOW_ANALYSIS.md`](../tuba-current-state/06_WORKFLOW_ANALYSIS.md), [`07_UX_AUDIT.md`](../tuba-current-state/07_UX_AUDIT.md)). The design system's obligation is to make that failure mode *visually impossible to repeat*:

- No metric ships without either a live value or an explicit as-of timestamp treatment (see Metric Tile in [12_COMPONENT_GUIDELINES.md](12_COMPONENT_GUIDELINES.md)).
- No skeleton loader is ever styled identically to a populated state that could be mistaken for real data.
- No progress/count-up animation on numbers or prices — [10_MOTION_SYSTEM.md](10_MOTION_SYSTEM.md) §2 forbids it explicitly, because it invites "is this real or decorative" doubt.
- Confidence is always visible on AI output (High/Medium/Low, text-labeled, never color-only) — see [12_COMPONENT_GUIDELINES.md](12_COMPONENT_GUIDELINES.md) Confidence Indicator.

## 5. Density philosophy

TBOS supports two density modes, not one, because its persona set genuinely needs both (see [`tbos-blueprint/00_IMPLEMENTATION_BLUEPRINT.md`](../tbos-blueprint/00_IMPLEMENTATION_BLUEPRINT.md) §2 personas):

- **Comfortable** (default) — generous row height and padding, for detail screens, forms, and any first-time or low-frequency task.
- **Compact** — reduced row height, for Sales Managers and Operations Managers doing high-volume daily triage (Record List, Kanban, Data Table). Compact is a per-user, per-list preference, never forced.

Density is a spacing-scale decision (token multiplier, see [05_SPACING_SYSTEM.md](05_SPACING_SYSTEM.md) §3), not a separate component set. A Record List has one implementation with a density prop, never two components.

## 6. Provenance — what this system is and isn't built from

Read this before citing any color, font, or spacing value from an older document as if it were a TBOS decision.

- `product-audit/39_DESIGN_TOKENS.json` and `product-audit/24–28` are a DOM-verified reverse-engineering of **Bayut's Profolio broker console** — a competitor's product. Its teal (`#006169`) is Bayut's brand, not Tuba's.
- `competitor-analysis/aqar/07_DESIGN_SYSTEM.md` is **Aqar's** system (green `#008236`) — competitor reference, never a source to copy.
- `tuba-current-state/09_DESIGN_SYSTEM.md`'s headline finding is **"there is no design system"** in Tuba's current platform: zero CSS custom properties, four total Sass variables, and colors that are unthemed Airbnb-template leftovers (`#FF5A5F`). Its own recommendation: "a next-gen Broker OS design system should be built fresh — there is nothing to migrate."

The one thing genuinely worth carrying forward from that legacy audit is a *discipline*, not a value: real, deliberate RTL/LTR asset parity. Tuba's old implementation did it with duplicated parallel files per component — the discipline is right, that implementation is wrong. This system carries the discipline forward using logical CSS properties and direction-aware components instead (see [15_INTERNATIONALIZATION.md](15_INTERNATIONALIZATION.md)).

Every color, type scale, spacing value, radius, shadow, and motion curve in this folder is therefore **originated fresh for TBOS**, not migrated or copied — justified against the binding numeric rules already fixed upstream (contrast floors, touch-target floors, loading thresholds — see [01_DESIGN_PRINCIPLES.md](01_DESIGN_PRINCIPLES.md)), and deliberately distinct from both competitors' palettes.

## 7. Platforms and modes this system covers

| Axis | Values | Where specified |
|---|---|---|
| Viewport | Mobile (<768px) · Tablet (768–1279px) · Desktop (≥1280px) · Wide (≥1600px) | [06_GRID_SYSTEM.md](06_GRID_SYSTEM.md), [07_LAYOUT_SYSTEM.md](07_LAYOUT_SYSTEM.md) |
| Language/direction | Arabic (RTL) · English (LTR) | [15_INTERNATIONALIZATION.md](15_INTERNATIONALIZATION.md) |
| Color scheme | Light · Dark | [14_DARK_MODE.md](14_DARK_MODE.md) |
| Density | Comfortable · Compact | [05_SPACING_SYSTEM.md](05_SPACING_SYSTEM.md) §3 |
| Motion preference | Standard · Reduced (`prefers-reduced-motion`) | [10_MOTION_SYSTEM.md](10_MOTION_SYSTEM.md) §6 |

Every component in [12_COMPONENT_GUIDELINES.md](12_COMPONENT_GUIDELINES.md) is specified against all five axes simultaneously — a component that only works in one combination isn't done.

## 8. Success criteria

Restated from the master brief, as a checklist this folder is held to:

- [ ] Any future TBOS screen in the 49-screen inventory can be built using only tokens and components defined here.
- [ ] Every future component derives from `tokens.json` — no hardcoded hex, px, or ms value in implementation.
- [ ] Designers and developers share the same names for the same things (token names = CSS variable names = Figma variable names = Tailwind theme keys).
- [ ] The system scales past hundreds of screens without visual drift, because there is one source of truth, not per-screen judgment calls.
- [ ] Nothing here was copied from a generic UI library or a competitor's product without a stated, TBOS-specific reason.
