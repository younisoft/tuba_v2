import type { Config } from 'tailwindcss';
import tbosTheme from './src/tokens/tailwind-theme';

/**
 * Loaded via `@config` in src/styles/globals.css. Theme values live in
 * src/tokens/tailwind-theme.ts (mirrored from design-system/tailwind-theme.ts) —
 * extend, never replace, so Tailwind's own defaults stay available as a fallback
 * only for utilities the design system doesn't define (e.g. arbitrary layout gaps).
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: tbosTheme,
  },
  plugins: [],
} satisfies Config;
