import type { Locale } from '@/state/locale.store';
import type { Customer } from '@/types/entities';
import type { StatusMeaning } from '@/types/status';
import type { TranslationKey } from '@/lib/i18n/dictionaries';

/** tbos-blueprint/16_MODULE_SPECIFICATIONS.md / CUST-01: "prospective vs.
 * active-relationship vs. past-client — distinct states inform whether
 * Decision Support recommends re-engagement." Neutral/Success/Info-shaped:
 * past is a terminal-but-not-negative state (never Danger), matching
 * 03_COLOR_SYSTEM.md's "color is never the only signal" and the five-meaning
 * system's own semantics — a past client isn't a failure state. */
export const CUSTOMER_STAGE_MEANING: Record<Customer['relationshipStage'], StatusMeaning> = {
  prospective: 'info',
  active: 'success',
  past: 'neutral',
};

export const CUSTOMER_STAGE_KEY: Record<Customer['relationshipStage'], TranslationKey> = {
  prospective: 'customer.relationshipStage.prospective',
  active: 'customer.relationshipStage.active',
  past: 'customer.relationshipStage.past',
};

/** useTranslation()'s t() has no interpolation support (documented constraint)
 * — relative-date formatting composed here instead, mirroring
 * features/properties/propertyFormat.ts's formatDate/daysUntil pattern. */
export function formatRelativeDate(isoDate: string, locale: Locale): string {
  const days = Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000);
  if (days <= 0) return locale === 'ar' ? 'اليوم' : 'Today';
  if (days === 1) return locale === 'ar' ? 'قبل يوم واحد' : '1 day ago';
  if (locale === 'ar') return `قبل ${days} يومًا`;
  return `${days} days ago`;
}
