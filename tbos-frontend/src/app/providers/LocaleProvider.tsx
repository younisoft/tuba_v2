import { useEffect, type ReactNode } from 'react';
import { useLocaleStore, applyLocaleToDocument } from '@/state/locale.store';

/** Keeps <html lang>/<html dir> in sync with the persisted locale — RTL/LTR is a
 * document-level concern (design-system/15_INTERNATIONALIZATION.md §1), not a
 * per-component className toggle. */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    applyLocaleToDocument(locale);
  }, [locale]);

  return <>{children}</>;
}
