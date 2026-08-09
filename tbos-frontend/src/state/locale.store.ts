import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Locale = 'en' | 'ar';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'tbos.locale.preference' },
  ),
);

/** Mirrors index.html's inline script contract — 'tbos.locale' is the flat key
 * read before first paint; kept in sync here whenever the locale changes post-load. */
export function applyLocaleToDocument(locale: Locale) {
  const root = document.documentElement;
  root.setAttribute('lang', locale);
  root.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
  localStorage.setItem('tbos.locale', locale);
}
