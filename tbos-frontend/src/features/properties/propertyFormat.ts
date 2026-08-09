import type { Locale } from '@/state/locale.store';
import type { PropertyType, PropertyStatus } from '@/types/entities';
import type { TranslationKey } from '@/lib/i18n/dictionaries';

export const PROPERTY_TYPE_KEY: Record<PropertyType, TranslationKey> = {
  apartment: 'property.type.apartment',
  villa: 'property.type.villa',
  townhouse: 'property.type.townhouse',
  land: 'property.type.land',
  office: 'property.type.office',
  retail: 'property.type.retail',
};

export const PROPERTY_STATUS_KEY: Record<PropertyStatus, TranslationKey> = {
  draft: 'property.status.draft',
  pending_compliance: 'property.status.pending_compliance',
  active: 'property.status.active',
  expiring: 'property.status.expiring',
  expired: 'property.status.expired',
  rejected: 'property.status.rejected',
  sold_rented: 'property.status.sold_rented',
  archived: 'property.status.archived',
};

/** useTranslation()'s t() has no interpolation support (documented constraint,
 * see TBOS_PRODUCT_UI_CONSISTENCY_AUDIT.md) — price/date formatting composed
 * here instead, one shared formatter rather than re-derived per screen. */
export function formatPriceSar(priceSar: number, locale: Locale): string {
  return `${priceSar.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')} ${locale === 'ar' ? 'ريال' : 'SAR'}`;
}

export function formatDate(isoDate: string, locale: Locale): string {
  return new Date(isoDate).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function daysUntil(isoDate: string): number {
  return Math.ceil((new Date(isoDate).getTime() - Date.now()) / 86_400_000);
}
