import type { Locale } from '@/state/locale.store';

/**
 * useTranslation()'s t() has no interpolation support (TBOS_PRODUCT_UI_
 * CONSISTENCY_AUDIT.md / TBOS_UI_INTEGRATION_AUDIT.md's i18n findings) — a
 * count-bearing string is composed here instead, shared by every FilterBar
 * caller (Leads, Properties, …) rather than re-derived per screen.
 */
export function formatActiveFiltersLabel(count: number, locale: Locale): string {
  if (locale === 'ar') return `${count} ${count === 1 ? 'فلتر نشط' : 'فلاتر نشطة'}`;
  return `${count} filter${count > 1 ? 's' : ''} active`;
}

export function formatSelectedLabel(count: number, locale: Locale): string {
  if (locale === 'ar') return `${count} ${count === 1 ? 'محدد' : 'محددة'}`;
  return `${count} selected`;
}
