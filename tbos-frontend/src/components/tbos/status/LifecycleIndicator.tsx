import { cn } from '@/lib/cn';
import type { StatusMeaning } from '@/types/status';

const DOT_CLASSES: Record<StatusMeaning, string> = {
  neutral: 'bg-slate-400',
  info: 'bg-info-500',
  warning: 'bg-warning-500',
  success: 'bg-success-500',
  danger: 'bg-danger-500',
};

export interface LifecycleIndicatorProps {
  label: string;
  meaning: StatusMeaning;
  /** Optional trailing detail — "since Aug 3", "9 of 11 comparables" — kept
   * separate from `label` so callers don't have to compose a single string. */
  detail?: string;
}

/**
 * TBOS-CMP-STATUS-002 — a denser sibling to StatusBadge for contexts where a
 * full pill is too heavy (a Price/Status History Timeline node, a compact
 * DataTable cell). Still icon+text, never a bare color dot — the dot here is
 * reinforcement alongside the text label, not the sole signal.
 */
export function LifecycleIndicator({ label, meaning, detail }: LifecycleIndicatorProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-body text-text-primary">
      <span aria-hidden="true" className={cn('h-2 w-2 shrink-0 rounded-full', DOT_CLASSES[meaning])} />
      {label}
      {detail && <span className="text-caption text-text-muted">— {detail}</span>}
    </span>
  );
}
