import { StatusBadge } from '@/components/tbos/status/StatusBadge';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { ExplainabilityPopover } from '@/components/ai/ExplainabilityPopover';
import { cn } from '@/lib/cn';
import type { TodayRecommendation } from '@/types/today';
import type { StatusMeaning } from '@/types/status';

const PRIORITY_MEANING: Record<TodayRecommendation['priority'], StatusMeaning> = {
  critical: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'neutral',
};

/** Token-driven accent per priority — reuses the existing text.{danger,warning,
 * info} tokens (already defined) rather than inventing new border tokens,
 * per design-system's "no hardcoded values" rule (18_DESIGN_RULES.md). */
const PRIORITY_BORDER_CLASS: Record<TodayRecommendation['priority'], string> = {
  critical: 'border-s-text-danger',
  high: 'border-s-text-warning',
  medium: 'border-s-text-info',
  low: 'border-s-border',
};

export interface RecommendationCardProps {
  recommendation: TodayRecommendation;
  priorityLabel: string;
  categoryLabel: string;
  onOpen: () => void;
  onDismiss: () => void;
  dismissLabel: string;
  explainTriggerLabel: string;
  /** Pre-translated answer to the Explainability contract's "what changed"
   * question — TodayRecommendation has no such field of its own since a
   * recommendation is recomputed fresh each load, not diffed against a
   * previous value. */
  whatChangedText: string;
}

/**
 * TBOS-CMP-AI-007 — the Recommendation Card (tbos-blueprint/05_COMPONENT_
 * MAPPING.md, required by TODAY-01, previously unbuilt — see
 * TBOS_UI_INTEGRATION_AUDIT.md §1.E). One action + its reasoning + its
 * urgency (design-system/03_COLOR_SYSTEM.md §3 four-tier urgency, never Tuba
 * Coral — brand color ≠ semantic state, master prompt §10). Every entry
 * satisfies the Explainability contract on demand via the existing
 * ExplainabilityPopover — never a bespoke "why" tooltip. Resolve inline
 * (primary action) or dismiss — never a dead end.
 */
export function RecommendationCard({
  recommendation,
  priorityLabel,
  categoryLabel,
  onOpen,
  onDismiss,
  dismissLabel,
  explainTriggerLabel,
  whatChangedText,
}: RecommendationCardProps) {
  const meaning = PRIORITY_MEANING[recommendation.priority];

  return (
    <div className={cn('flex flex-col gap-2 rounded-lg border border-border border-s-4 bg-bg-surface p-4', PRIORITY_BORDER_CLASS[recommendation.priority])}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge label={priorityLabel} meaning={meaning} size="sm" />
          <span className="text-caption text-text-muted">{categoryLabel}</span>
        </div>
        <IconButton icon="x" label={dismissLabel} onClick={onDismiss} />
      </div>

      <h3 className="text-h3 text-text-primary">{recommendation.what}</h3>
      <p className="text-body text-text-secondary">{recommendation.why}</p>

      {recommendation.deadline && <p className="text-caption font-semibold text-text-muted">{recommendation.deadline}</p>}

      <div className="mt-1 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={onOpen}>
          {recommendation.linkLabel}
        </Button>
        {recommendation.aiRecommendation && (
          <ExplainabilityPopover
            triggerLabel={explainTriggerLabel}
            contract={{
              why: recommendation.why,
              howCalculated: recommendation.aiRecommendation,
              whatChanged: whatChangedText,
              recommendedAction: recommendation.recommendedAction,
              businessImpact: recommendation.expectedOutcome,
            }}
          />
        )}
      </div>
    </div>
  );
}
