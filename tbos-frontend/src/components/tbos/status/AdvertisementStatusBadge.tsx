import { StatusBadge } from './StatusBadge';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { StatusMeaning } from '@/types/status';
import type { ComplianceRequirementStatus } from '@/types/entities';
import type { TranslationKey } from '@/lib/i18n/dictionaries';

/**
 * Advertisement (REGA ad license) status — deliberately a separate badge from
 * PropertyStatusBadge (TBOS_MY_PROPERTIES_UX_ARCHITECTURE.md Part 05 / §1:
 * "Clearly distinguish Property Status from Advertisement Status from
 * Promotion Status... never merge these into one badge"). Sourced from the
 * property's real 'REGA Ad License' compliance requirement, not a new field.
 */
const STATUS_MAP: Record<ComplianceRequirementStatus | 'none', { key: TranslationKey; meaning: StatusMeaning }> = {
  verified: { key: 'properties.adStatus.verified', meaning: 'success' },
  pending_verification: { key: 'properties.adStatus.pending', meaning: 'info' },
  expiring: { key: 'properties.adStatus.expiring', meaning: 'warning' },
  expired: { key: 'properties.adStatus.expired', meaning: 'danger' },
  missing: { key: 'properties.adStatus.missing', meaning: 'neutral' },
  none: { key: 'properties.adStatus.missing', meaning: 'neutral' },
};

export function AdvertisementStatusBadge({ status }: { status: ComplianceRequirementStatus | 'none' }) {
  const { t } = useTranslation();
  const { key, meaning } = STATUS_MAP[status];
  return <StatusBadge label={t(key)} meaning={meaning} icon="shield" size="sm" />;
}
