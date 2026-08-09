import { Icon } from '@/components/ui/Icon';
import type { AiConfidence } from '@/lib/ai/types';

const CONFIDENCE_CONFIG: Record<AiConfidence, { label: string; icon: 'trending-up' | 'arrow-up' | 'alert-triangle'; className: string }> = {
  high: { label: 'High confidence', icon: 'trending-up', className: 'text-text-success' },
  medium: { label: 'Medium confidence', icon: 'arrow-up', className: 'text-text-warning' },
  low: { label: 'Low confidence — verify manually', icon: 'alert-triangle', className: 'text-text-danger' },
};

/**
 * TBOS-CMP-AI-001 — the Confidence Indicator (design-system/12_COMPONENT_GUIDELINES.md
 * §5): text label + icon, always visible, never hidden behind a hover-only
 * tooltip, never color-only. Placed adjacent to the AI output it qualifies —
 * never a separate/detached summary (caller's responsibility to position it).
 */
export function AIConfidence({ confidence }: { confidence: AiConfidence }) {
  const config = CONFIDENCE_CONFIG[confidence];
  return (
    <span className={`inline-flex items-center gap-1 text-caption font-semibold ${config.className}`}>
      <Icon name={config.icon} className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}
