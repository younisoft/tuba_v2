import type { Locale } from '@/state/locale.store';
import type { LeadPriority, LeadSource, LeadLostReason } from '@/types/entities';
import type { TranslationKey } from '@/lib/i18n/dictionaries';

/** Reused by MarketingRequest's Lost flow too (OwnerDetailScreen) — neither
 * has a ratified taxonomy (TBOS_RELATIONSHIP_UX_AUDIT.md research), and master
 * prompt §32 forbids a second one, so this is the single shared list. */
export const LOST_REASONS: { id: LeadLostReason; key: TranslationKey }[] = [
  { id: 'price', key: 'leadDetail.lostReason.price' },
  { id: 'timing', key: 'leadDetail.lostReason.timing' },
  { id: 'chose_competitor', key: 'leadDetail.lostReason.chose_competitor' },
  { id: 'unresponsive', key: 'leadDetail.lostReason.unresponsive' },
  { id: 'not_qualified', key: 'leadDetail.lostReason.not_qualified' },
  { id: 'changed_mind', key: 'leadDetail.lostReason.changed_mind' },
  { id: 'duplicate', key: 'leadDetail.lostReason.duplicate' },
  { id: 'other', key: 'leadDetail.lostReason.other' },
];

/**
 * useTranslation()'s t() has no interpolation support (a flat key → string
 * lookup, TBOS_UI_INTEGRATION_AUDIT.md's i18n findings) — numeric SLA copy is
 * composed here instead of in the shared dictionary, one small bilingual
 * formatter rather than dozens of "45 min left"/"44 min left"/… dictionary keys.
 */
export function formatSlaLabel(minutesRemaining: number, locale: Locale): string {
  if (minutesRemaining <= 0) return locale === 'ar' ? 'انتهت المهلة' : 'SLA breached';
  return locale === 'ar' ? `${minutesRemaining} دقيقة متبقية` : `${minutesRemaining} min left`;
}

export const PRIORITY_KEY: Record<LeadPriority, TranslationKey> = {
  critical: 'priority.critical',
  high: 'priority.high',
  medium: 'priority.medium',
  low: 'priority.low',
};

export const SOURCE_KEY: Record<LeadSource, TranslationKey> = {
  buyer_inbound: 'leads.source.buyer_inbound',
  owner_originated: 'leads.source.owner_originated',
};
