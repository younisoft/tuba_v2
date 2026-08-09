/**
 * TBOS Design System — Tailwind v4 theme extension.
 * Generated from tokens.json. Do not hand-edit — edit tokens.json and regenerate.
 * Consumes the CSS custom properties defined in design-tokens.css so light/dark
 * and the data-theme override keep working without a second source of truth.
 * See 19_IMPLEMENTATION_GUIDE.md §1-4.
 */

const theme = {
  colors: {
    // Canonical, exact Tuba brand identity swatches (not a tint/shade scale) — see 03_COLOR_SYSTEM.md §1a.
    brand: {
      "tuba-purple": "var(--tuba-purple)",
      "tuba-coral": "var(--tuba-coral)",
    },
    ink: {
      50: "#EFEBF9", 100: "#D8CDF4", 200: "#B69DF1", 300: "#8D63EE", 400: "#642BE9",
      500: "#4513B9", 600: "#2A0C72", 700: "#230A5C", 800: "#1C0949", 900: "#150836",
    },
    coral: {
      50: "#FCF3F3", 100: "#F9E2E2", 200: "#F7C5C7", 300: "#F7A1A4", 400: "#F87C80",
      500: "#F95A60", 600: "#F42A31", 700: "#D41118", 800: "#A11217", 900: "#741114",
    },
    copilot: {
      50: "#F5F1FE", 100: "#E9E0FC", 200: "#D2C2F9", 300: "#B39AF2", 400: "#9274E8",
      500: "#7654D6", 600: "#5F3EB8", 700: "#4B3193", 800: "#392670", 900: "#2B1D54",
    },
    slate: {
      0: "#FFFFFF", 50: "#F7F8FA", 100: "#EEF0F4", 200: "#E1E4EA", 300: "#CBD0DA",
      400: "#9AA2B1", 500: "#6C7484", 600: "#4E5563", 700: "#383D48", 800: "#24272F",
      900: "#14161B", 950: "#0B0C0F",
    },
    success: { 50: "#EEFAF1", 100: "#D6F3DD", 300: "#7DD696", 500: "#2A9D4F", 600: "#1F7D3D", 700: "#185F2F" },
    warning: { 50: "#FFF9E6", 100: "#FEEDB8", 300: "#FBCB4C", 500: "#E8A317", 600: "#B87F0E", 700: "#8C5F0A" },
    danger:  { 50: "#FDEEEE", 100: "#FAD4D4", 300: "#EF9494", 500: "#D33F3F", 600: "#AB2E2E", 700: "#822323" },
    info:    { 50: "#EAF6FC", 100: "#CDEBF7", 300: "#7FCBEA", 500: "#1E93C4", 600: "#16729A", 700: "#115774" },

    // Semantic aliases — resolve to the CSS custom properties so dark mode /
    // data-theme overrides apply automatically without a second Tailwind config.
    bg: {
      canvas: "var(--bg-canvas)", surface: "var(--bg-surface)", "surface-raised": "var(--bg-surface-raised)",
      sunken: "var(--bg-sunken)", "brand-subtle": "var(--bg-brand-subtle)", brand: "var(--bg-brand)",
      "ai-subtle": "var(--bg-ai-subtle)", ai: "var(--bg-ai)", "success-subtle": "var(--bg-success-subtle)",
      "warning-subtle": "var(--bg-warning-subtle)", "danger-subtle": "var(--bg-danger-subtle)",
      "info-subtle": "var(--bg-info-subtle)", disabled: "var(--bg-disabled)",
    },
    text: {
      primary: "var(--text-primary)", secondary: "var(--text-secondary)", muted: "var(--text-muted)",
      "on-brand": "var(--text-on-brand)", link: "var(--text-link)", brand: "var(--text-brand)",
      ai: "var(--text-ai)", success: "var(--text-success)", warning: "var(--text-warning)",
      danger: "var(--text-danger)", info: "var(--text-info)",
    },
    border: {
      DEFAULT: "var(--border-default)", strong: "var(--border-strong)", brand: "var(--border-brand)",
      focus: "var(--border-focus)", danger: "var(--border-danger)",
    },
    chart: {
      1: "var(--chart-1-blue)", 2: "var(--chart-2-orange)", 3: "var(--chart-3-violet)", 4: "var(--chart-4-yellow)",
      5: "var(--chart-5-magenta)", 6: "var(--chart-6-green)", 7: "var(--chart-7-aqua)", 8: "var(--chart-8-red)",
      "status-good": "var(--chart-status-good)", "status-warning": "var(--chart-status-warning)",
      "status-serious": "var(--chart-status-serious)", "status-critical": "var(--chart-status-critical)",
    },
  },

  fontFamily: {
    latin: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
    arabic: ["Noto Sans Arabic", "Segoe UI", "system-ui", "sans-serif"],
    mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
  },

  fontSize: {
    display: ["2rem", { lineHeight: "2.5rem", fontWeight: "700" }],
    h1: ["1.5rem", { lineHeight: "2rem", fontWeight: "700" }],
    h2: ["1.25rem", { lineHeight: "1.75rem", fontWeight: "600" }],
    h3: ["1rem", { lineHeight: "1.5rem", fontWeight: "600" }],
    "body-lg": ["0.9375rem", { lineHeight: "1.5rem", fontWeight: "400" }],
    body: ["0.875rem", { lineHeight: "1.25rem", fontWeight: "400" }],
    label: ["0.8125rem", { lineHeight: "1rem", fontWeight: "600", letterSpacing: "0.01em" }],
    caption: ["0.75rem", { lineHeight: "1rem", fontWeight: "400" }],
    micro: ["0.6875rem", { lineHeight: "0.875rem", fontWeight: "600", letterSpacing: "0.02em" }],
  },

  spacing: {
    0: "0", 1: "0.125rem", 2: "0.25rem", 3: "0.5rem", 4: "0.75rem", 5: "1rem",
    6: "1.25rem", 7: "1.5rem", 8: "2rem", 9: "2.5rem", 10: "3rem", 11: "4rem",
    12: "5rem", 13: "6rem", 14: "8rem",
  },

  borderRadius: {
    none: "0", xs: "0.25rem", sm: "0.375rem", md: "0.5rem", lg: "0.75rem", xl: "1rem", full: "9999px",
  },

  boxShadow: {
    1: "var(--elevation-1)", 2: "var(--elevation-2)", 3: "var(--elevation-3)", 4: "var(--elevation-4)",
  },

  transitionDuration: {
    instant: "var(--duration-instant)", micro: "var(--duration-micro)", fast: "var(--duration-fast)",
    base: "var(--duration-base)", moderate: "var(--duration-moderate)", slow: "var(--duration-slow)",
  },

  transitionTimingFunction: {
    standard: "var(--ease-standard)", decelerate: "var(--ease-decelerate)", accelerate: "var(--ease-accelerate)",
  },

  screens: {
    tablet: "768px",
    desktop: "1280px",
    wide: "1600px",
  },

  zIndex: {
    base: "0", sticky: "10", dropdown: "100", "overlay-scrim": "200", panel: "300",
    modal: "400", popover: "500", toast: "600", "command-palette": "700", tooltip: "800",
  },

  minWidth: { "touch-target": "2.75rem" },
  minHeight: { "touch-target": "2.75rem" },
};

export default theme;
export type TBOSTheme = typeof theme;
