import type { Lead, LeadPriority } from '@/types/entities';
import type { StatusMeaning } from '@/types/status';

export type SlaUrgency = 'healthy' | 'approaching' | 'breaching';

export const SLA_URGENCY_MEANING: Record<SlaUrgency, StatusMeaning> = {
  healthy: 'info',
  approaching: 'warning',
  breaching: 'danger',
};

export function slaUrgency(minutesRemaining: number | null): SlaUrgency {
  if (minutesRemaining === null) return 'healthy';
  if (minutesRemaining <= 15) return 'breaching';
  if (minutesRemaining <= 60) return 'approaching';
  return 'healthy';
}

/**
 * Lead urgency is derived, never a stored field (TBOS_UI_INTEGRATION_AUDIT.md
 * §1.P / tbos-blueprint's Lead entity has no "priority" attribute anywhere it's
 * documented). Ranking follows tbos-definition/15_DECISION_SUPPORT_SYSTEM.md's
 * stated order: time-sensitivity first (SLA), then business value (score).
 * Closed leads (Won/Lost) are never urgent — nothing to act on.
 */
export function computeLeadPriority(lead: Lead): LeadPriority {
  if (lead.stage === 'won' || lead.stage === 'lost') return 'low';

  if (lead.slaMinutesRemaining !== null) {
    if (lead.slaMinutesRemaining <= 15) return 'critical';
    if (lead.slaMinutesRemaining <= 60) return 'high';
  }

  if (lead.score >= 80) return 'high';
  if (lead.score >= 60) return 'medium';
  return 'low';
}
