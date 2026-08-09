import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

/**
 * Persisted under the same key index.html's no-flash inline script reads before
 * React mounts (see design-system/14_DARK_MODE.md §8). Only 'light'/'dark' are
 * ever written to the DOM attribute directly — 'system' removes the attribute so
 * the CSS `prefers-color-scheme` media query in tokens.css takes over.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: 'system',
      setPreference: (preference) => set({ preference }),
    }),
    { name: 'tbos.theme.preference' },
  ),
);

export function applyThemeToDocument(preference: ThemePreference) {
  const root = document.documentElement;
  if (preference === 'system') {
    root.removeAttribute('data-theme');
    localStorage.removeItem('tbos.theme');
  } else {
    root.setAttribute('data-theme', preference);
    localStorage.setItem('tbos.theme', preference);
  }
}
