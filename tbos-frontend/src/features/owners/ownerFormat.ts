import type { MarketingRequestStatus } from '@/types/entities';
import type { StatusMeaning } from '@/types/status';
import type { TranslationKey } from '@/lib/i18n/dictionaries';

/** tbos-blueprint/06_STATE_ARCHITECTURE.md "Marketing Request states": Open
 * (new, actionable) / In Progress (in motion) / Won (positive terminal) /
 * Lost (negative terminal) — mapped onto the same five-meaning system every
 * other module's lifecycle uses (03_COLOR_SYSTEM.md §3), no bespoke hue. */
export const MARKETING_REQUEST_STATUS_MEANING: Record<MarketingRequestStatus, StatusMeaning> = {
  open: 'info',
  in_progress: 'warning',
  won: 'success',
  lost: 'danger',
};

export const MARKETING_REQUEST_STATUS_KEY: Record<MarketingRequestStatus, TranslationKey> = {
  open: 'marketingRequest.status.open',
  in_progress: 'marketingRequest.status.in_progress',
  won: 'marketingRequest.status.won',
  lost: 'marketingRequest.status.lost',
};
