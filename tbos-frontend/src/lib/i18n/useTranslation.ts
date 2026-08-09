import { useLocaleStore } from '@/state/locale.store';
import { DICTIONARIES, type TranslationKey } from './dictionaries';

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const t = (key: TranslationKey): string => DICTIONARIES[locale][key] ?? DICTIONARIES.en[key] ?? key;

  return { t, locale, setLocale, dir: locale === 'ar' ? 'rtl' : 'ltr' } as const;
}
