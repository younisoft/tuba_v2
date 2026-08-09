import { MetricCard, type MetricCardProps } from './MetricCard';
import { ExplainabilityPopover } from '@/components/ai/ExplainabilityPopover';
import type { ExplainabilityContract } from '@/types/explainability';

export interface MetricWithExplanationProps extends Omit<MetricCardProps, 'explainability'> {
  contract: ExplainabilityContract;
}

/**
 * TBOS-CMP-DATA-002 — the concrete enforcement of tbos-blueprint/
 * 07_DECISION_SUPPORT_SYSTEM.md's rule: "instead of '12 Leads' — What / Why /
 * Impact / Recommended Action..." Every metric that ships through this
 * component, rather than the bare MetricCard, automatically carries its
 * Explainability trigger — a future screen reaching for "just the number" has
 * to deliberately choose MetricCard over this one, not the other way round.
 */
export function MetricWithExplanation({ contract, label, ...rest }: MetricWithExplanationProps) {
  return <MetricCard label={label} {...rest} explainability={<ExplainabilityPopover triggerLabel={`Why: ${label}`} contract={contract} />} />;
}
