import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';

export interface MetricCardProps {
  label: string;
  value: string;
  /** Positive/negative framed as a signed delta, e.g. "+12%" / "-3 days" —
   * caller decides the sign; this component only decides the icon/color. */
  delta?: { value: string; direction: 'up' | 'down' };
  /** Set when the metric isn't real-time — design-system/12_COMPONENT_GUIDELINES.md
   * §2 Metric Tile anatomy requires this whenever applicable. */
  asOf?: string;
  state?: 'loading' | 'error' | 'success';
  /** Slot for an ExplainabilityPopover trigger — kept as a child rather than a
   * hard dependency so MetricCard doesn't have to know about the Explainability
   * contract shape. */
  explainability?: ReactNode;
}

/**
 * TBOS-CMP-DATA-001 — HOME-01/TODAY-01/ANL-01/WAL-01's Metric Tile
 * (design-system/12_COMPONENT_GUIDELINES.md §2). Loading uses a skeleton
 * matching the real layout, never a spinner-only placeholder; error is a
 * per-tile graceful degradation (one failed tile never blanks the page).
 */
export function MetricCard({ label, value, delta, asOf, state = 'success', explainability }: MetricCardProps) {
  if (state === 'loading') {
    return (
      <div className="rounded-lg border border-border bg-bg-surface p-4">
        <Skeleton className="mb-2 h-3 w-20" />
        <Skeleton className="h-7 w-16" />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div role="alert" className="flex flex-col gap-1 rounded-lg border border-border bg-bg-surface p-4">
        <span className="text-label text-text-muted">{label}</span>
        <span className="flex items-center gap-1.5 text-caption text-text-danger">
          <Icon name="alert-triangle" className="h-3.5 w-3.5" />
          Unavailable right now
        </span>
      </div>
    );
  }

  const metricDescription = `${label}: ${value}${delta ? `, ${delta.direction === 'up' ? 'up' : 'down'} ${delta.value}` : ''}`;

  return (
    <div aria-label={metricDescription} className="rounded-lg border border-border bg-bg-surface p-4">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-label text-text-muted">{label}</span>
        {explainability}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-h1 text-text-primary">{value}</span>
        {delta && (
          <span className={cn('flex items-center gap-0.5 text-caption font-semibold', delta.direction === 'up' ? 'text-text-success' : 'text-text-danger')}>
            <Icon name={delta.direction === 'up' ? 'arrow-up' : 'arrow-down'} className="h-3 w-3" />
            {delta.value}
          </span>
        )}
      </div>
      {asOf && <p className="mt-1 text-caption text-text-muted">As of {asOf}</p>}
    </div>
  );
}
