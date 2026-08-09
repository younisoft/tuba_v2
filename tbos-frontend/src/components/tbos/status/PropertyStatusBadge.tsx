import { StatusBadge } from './StatusBadge';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { StatusMeaning } from '@/types/status';
import type { PropertyStatus } from '@/types/entities';
import type { IconName } from '@/components/ui/Icon';
import type { TranslationKey } from '@/lib/i18n/dictionaries';

/** Property's 8-state lifecycle mapped onto the five-meaning system exactly
 * per design-system/03_COLOR_SYSTEM.md §3's worked table — including the
 * explicit Sold/Rented-vs-Active icon override so two "success" states stay
 * visually distinct. */
const STATUS_MAP: Record<PropertyStatus, { key: TranslationKey; meaning: StatusMeaning; icon?: IconName }> = {
  draft: { key: 'property.status.draft', meaning: 'neutral' },
  pending_compliance: { key: 'property.status.pending_compliance', meaning: 'info' },
  active: { key: 'property.status.active', meaning: 'success' },
  expiring: { key: 'property.status.expiring', meaning: 'warning' },
  expired: { key: 'property.status.expired', meaning: 'danger' },
  rejected: { key: 'property.status.rejected', meaning: 'danger' },
  sold_rented: { key: 'property.status.sold_rented', meaning: 'success', icon: 'check-square' },
  archived: { key: 'property.status.archived', meaning: 'neutral' },
};

/** TBOS-CMP-STATUS-004 */
export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  const { t } = useTranslation();
  const { key, meaning, icon } = STATUS_MAP[status];
  return <StatusBadge label={t(key)} meaning={meaning} icon={icon} />;
}
