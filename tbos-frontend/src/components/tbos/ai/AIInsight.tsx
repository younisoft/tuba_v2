import { Icon } from '@/components/ui/Icon';

/**
 * TBOS-CMP-AI-005 — AI Insights (tbos-blueprint/08_AI_INTERACTION_BLUEPRINT.md):
 * a one-to-two sentence plain-language annotation beside a metric/tile.
 * Passive — no accept/reject step, since it's descriptive, not actionable on
 * its own. Never shown without the metric's real figure alongside it (the
 * number is never gated on this narrative being available).
 */
export function AIInsight({ text }: { text: string }) {
  return (
    <p className="flex items-start gap-1.5 text-caption text-text-ai">
      <Icon name="sparkles" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{text}</span>
    </p>
  );
}
