import { StatusBadge } from './StatusBadge';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { StatusMeaning } from '@/types/status';
import type { ContractStatus } from '@/types/entities';
import type { IconName } from '@/components/ui/Icon';
import type { TranslationKey } from '@/lib/i18n/dictionaries';

/** Contract's 6-state lifecycle (tbos-blueprint/06_STATE_ARCHITECTURE.md)
 * mapped onto the five-meaning system, mirroring PropertyStatusBadge's exact
 * pattern from day one (never shipping a hardcoded-English badge again —
 * TBOS_PRODUCT_UI_CONSISTENCY_AUDIT.md P1-2's lesson). Closed gets a distinct
 * icon from Active so two "success" states stay visually distinguishable,
 * the same Sold/Rented-vs-Active precedent. */
const STATUS_MAP: Record<ContractStatus, { key: TranslationKey; meaning: StatusMeaning; icon?: IconName }> = {
  draft: { key: 'contract.status.draft', meaning: 'neutral' },
  pending_compliance: { key: 'contract.status.pending_compliance', meaning: 'info' },
  active: { key: 'contract.status.active', meaning: 'success' },
  renewal_due: { key: 'contract.status.renewal_due', meaning: 'warning' },
  closed: { key: 'contract.status.closed', meaning: 'success', icon: 'check-square' },
  cancelled: { key: 'contract.status.cancelled', meaning: 'danger' },
};

/** TBOS-CMP-STATUS-005 */
export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const { t } = useTranslation();
  const { key, meaning, icon } = STATUS_MAP[status];
  return <StatusBadge label={t(key)} meaning={meaning} icon={icon} />;
}
