import { useEffect, useState } from 'react';

/**
 * Real viewport-aware conditional rendering — not a CSS-only `hidden md:block`
 * toggle. PROP-01's desktop table vs. mobile/tablet card list must not both
 * exist in the DOM simultaneously (TBOS_MY_PROPERTIES_UX_ARCHITECTURE.md
 * §10: two genuinely different representations, not one shrunk into the
 * other) — a pure CSS toggle still mounts both, which is harmless in a real
 * browser (the hidden one is display:none) but duplicates every row's
 * content in the accessibility tree and in any environment that doesn't
 * compute stylesheet visibility (e.g. jsdom in tests). Defaults to `true`
 * when `matchMedia` isn't available (no polyfill in the test environment) —
 * the desktop/table layout, matching this screen's pre-existing test
 * coverage, which was written against the table.
 */
export function useMediaQuery(query: string): boolean {
  const supported = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
  const [matches, setMatches] = useState(() => (supported ? window.matchMedia(query).matches : true));

  useEffect(() => {
    if (!supported) return;
    const mql = window.matchMedia(query);
    const listener = () => setMatches(mql.matches);
    listener();
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, [query, supported]);

  return matches;
}
