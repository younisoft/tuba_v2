# 08 — Iconography

## 1. Grammar

One icon grammar, applied everywhere: **24×24px grid, 1.5px stroke, outline by default, rounded caps and joins.** A filled variant of the same glyph exists only for active/selected states (active rail item, selected tab, checked toggle) — never for decoration, never as a second style mixed freely with outline.

TBOS does not commission a bespoke icon set at v1.0 — it specifies the grammar an implementation-time library must match (Lucide and Phosphor's "regular" weight both satisfy this grammar out of the box; either is an acceptable starting library, chosen at implementation time and applied consistently, never mixed). What matters is the rule, not the vendor: every icon in the product must share stroke weight, corner radius, and optical size, because a mixed-weight icon set is the fastest way to make a screen look assembled rather than designed.

## 2. Sizing

`tokens.json` → `sizing.icon`:

| Token | px | Use |
|---|---|---|
| `sm` | 16 | Inline with `caption`/`label` text, badge icons |
| `md` | 20 | Inline with `body` text — the default size, most icons in the product |
| `lg` | 24 | Standalone icon buttons, rail nav icons, table row action icons |
| `xl` | 32 | Empty-state illustration icons, onboarding |

An icon's size is always paired to the text it sits beside via §5 below — never chosen independently.

## 3. Color

Icons never carry meaning through color alone (binding accessibility rule, [11_ACCESSIBILITY.md](11_ACCESSIBILITY.md) §3) — a status icon is always paired with a text label. Default icon color is `icon.default` (`slate.500`/`slate.400` dark); icons inside a colored surface (a Status Badge, a Recommendation Card's urgency chip) use that surface's matching semantic foreground token, never an independently chosen hue.

## 4. Touch targets

Any icon that is itself an interactive control (icon-only button, rail item, table row action) sits inside a minimum 44×44px hit area regardless of the icon's own visual size — the icon can render at 20–24px while its clickable/tappable bounds meet the floor. This is non-negotiable per [01_DESIGN_PRINCIPLES.md](01_DESIGN_PRINCIPLES.md)'s binding numeric floors, including in Compact-density table rows where visual space is tight.

## 5. Icon-to-text pairing

| Context | Icon size | Gap |
|---|---|---|
| Beside `body`/`label` text | `md` (20px) | `space.3` (8px) |
| Beside `caption`/`micro` text (badges) | `sm` (16px) | `space.2` (4px) |
| Standalone button/rail icon | `lg` (24px) | n/a |

## 6. RTL mirroring — the rule that actually matters

Icons split into two categories, and treating them the same is the most common RTL defect:

- **Directional icons** (back/forward chevrons, arrows, the breadcrumb separator, the panel-open/close caret) **mirror** in RTL — a "back" chevron points right in Arabic, left in English.
- **Non-directional icons** (a document icon, a person icon, a house icon, a status dot, a bell) **never mirror** — flipping a house icon horizontally changes nothing meaningful and only risks looking broken if the source asset isn't symmetric.

Every icon in the system is classified as one or the other at the point it's added to the library (recorded alongside the icon in implementation, e.g. as a `mirrors: true/false` flag) — this is not a per-instance judgment call left to whoever places the icon on a screen.

## 7. Where icons are required, not optional

Per §3 and the Status Badge component contract (`tbos-blueprint/05_COMPONENT_MAPPING.md`, verbatim: "icon + text always paired — never color alone"): every Status Badge, every urgency tier (Critical/High/Medium/Low on a Recommendation Card), every AI Confidence Indicator level, and every notification urgency tier ships with a distinct icon, not just a distinct color. [17_COMPONENT_CATALOG.md](17_COMPONENT_CATALOG.md) lists the exact icon assigned per state so it stays consistent across every screen that renders it.
