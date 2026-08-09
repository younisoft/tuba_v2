import { StatusBadge } from '@/components/tbos/status/StatusBadge';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { StatusMeaning } from '@/types/status';
import type { LeadStage } from '@/types/entities';
import type { TranslationKey } from '@/lib/i18n/dictionaries';

/** Maps Lead's 7-stage pipeline onto the five-meaning system exactly as
 * design-system/03_COLOR_SYSTEM.md §3 specifies — no new component, StatusBadge
 * reused with this module's own state map (design-system/12_COMPONENT_GUIDELINES.md
 * §2's binding "one component, per-module state map" rule). */
const STAGE_MAP: Record<LeadStage, { key: TranslationKey; meaning: StatusMeaning }> = {
  new: { key: 'leads.stage.new', meaning: 'info' },
  assigned: { key: 'leads.stage.assigned', meaning: 'info' },
  contacted: { key: 'leads.stage.contacted', meaning: 'info' },
  qualified: { key: 'leads.stage.qualified', meaning: 'warning' },
  negotiating: { key: 'leads.stage.negotiating', meaning: 'warning' },
  won: { key: 'leads.stage.won', meaning: 'success' },
  lost: { key: 'leads.stage.lost', meaning: 'danger' },
};

/** TBOS-CMP-STATUS-003 */
export function LeadStageBadge({ stage }: { stage: LeadStage }) {
  const { t } = useTranslation();
  const { key, meaning } = STAGE_MAP[stage];
  return <StatusBadge label={t(key)} meaning={meaning} />;
}
