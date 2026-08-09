import { useEffect, type ReactNode } from 'react';
import { useThemeStore, applyThemeToDocument } from '@/state/theme.store';

/**
 * Reconciles the persisted theme preference with the DOM on every change.
 * index.html's inline script already applied the persisted value before first
 * paint (no flash); this effect keeps the DOM in sync for the rest of the
 * session, including when the user switches preference at runtime.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const preference = useThemeStore((s) => s.preference);

  useEffect(() => {
    applyThemeToDocument(preference);
  }, [preference]);

  return <>{children}</>;
}
