import { StatusBadge } from '@/components/tbos/status/StatusBadge';
import { slaUrgency, SLA_URGENCY_MEANING } from '@/lib/leads/priority';

export interface SlaTimerProps {
  minutesRemaining: number | null;
  /** Pre-translated display text, e.g. "45 min left" / "SLA breached" —
   * SlaTimer decides color/icon from the raw minutes, never the copy, same
   * division of responsibility as StatusBadge's `label` prop. */
  label: string;
  size?: 'sm' | 'md';
}

/**
 * TBOS-CMP-STATUS-007 — the SLA Timer (tbos-blueprint/05_COMPONENT_MAPPING.md,
 * required by TODAY-01/LEAD-01/LEAD-02/LEAD-03, previously unbuilt — see
 * TBOS_UI_INTEGRATION_AUDIT.md §1.E). Reuses StatusBadge rather than inventing
 * a new badge shape — "one component, per-module state map" (design-system/
 * 12_COMPONENT_GUIDELINES.md §2) extended to SLA urgency. Renders nothing for
 * a lead with no SLA context (Won/Lost/no clock running) rather than a
 * meaningless "—".
 */
export function SlaTimer({ minutesRemaining, label, size = 'md' }: SlaTimerProps) {
  if (minutesRemaining === null) return null;
  return <StatusBadge label={label} meaning={SLA_URGENCY_MEANING[slaUrgency(minutesRemaining)]} icon="clock" size={size} />;
}
