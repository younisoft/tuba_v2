import type { CampaignStatus } from '@/types/entities';
import type { StatusMeaning } from '@/types/status';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/state/locale.store';

/** No ratified state table exists for Campaign (TBOS_MARKETING_UX_AUDIT.md
 * P1-1) — mapped onto the same five-meaning system every other module's
 * lifecycle uses (03_COLOR_SYSTEM.md §3). Running=success (the "working as
 * intended" state), Paused=warning (needs attention, resumable), Ended=neutral
 * (terminal, but not a failure — unlike Cancelled elsewhere), Draft=neutral. */
export const CAMPAIGN_STATUS_MEANING: Record<CampaignStatus, StatusMeaning> = {
  draft: 'neutral',
  running: 'success',
  paused: 'warning',
  ended: 'neutral',
};

export const CAMPAIGN_STATUS_KEY: Record<CampaignStatus, TranslationKey> = {
  draft: 'campaign.status.draft',
  running: 'campaign.status.running',
  paused: 'campaign.status.paused',
  ended: 'campaign.status.ended',
};

/** useTranslation()'s t() has no interpolation support (lib/i18n/formatCount.ts's
 * established precedent) — every count-bearing Marketing string is composed here. */
export function formatInventoryCount(count: number, locale: Locale): string {
  if (locale === 'ar') return `${count} ${count === 1 ? 'عقار' : 'عقارات'}`;
  return `${count} listing${count === 1 ? '' : 's'}`;
}

export function formatQuotaUnits(count: number, locale: Locale): string {
  if (locale === 'ar') return `${count} ${count === 1 ? 'وحدة حصة' : 'وحدات حصة'}`;
  return `${count} quota unit${count === 1 ? '' : 's'}`;
}

export function formatShortfall(count: number, locale: Locale): string {
  if (locale === 'ar') return `أقل بـ ${formatQuotaUnits(count, locale)}`;
  return `short by ${formatQuotaUnits(count, locale)}`;
}

export function launchConsequenceMessage(inventoryCount: number, quotaCost: number, remainingQuota: number, locale: Locale): string {
  if (locale === 'ar') {
    return `سيتم إطلاق هذه الحملة لـ ${formatInventoryCount(inventoryCount, locale)} وسيستهلك ${formatQuotaUnits(quotaCost, locale)} من رصيد المحفظة (${remainingQuota} متبقٍ حاليًا).`;
  }
  return `This launches the campaign for ${formatInventoryCount(inventoryCount, locale)} and consumes ${formatQuotaUnits(quotaCost, locale)} from your Wallet (${remainingQuota} currently remaining).`;
}
