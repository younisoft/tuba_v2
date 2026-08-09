import { cn } from '@/lib/cn';

export interface ProgressProps {
  /** 0–100. */
  value: number;
  label: string;
  tone?: 'brand' | 'success' | 'warning' | 'danger';
  className?: string;
}

const TONE_CLASSES = {
  brand: 'bg-bg-brand',
  success: 'bg-chart-status-good',
  warning: 'bg-chart-status-warning',
  danger: 'bg-chart-status-critical',
} as const;

/** TBOS-CMP-DISPLAY-003 — a determinate progress bar. Current/limit is always
 * stated as text by the caller (e.g. QuotaBalanceMeter), never implied by fill
 * alone (design-system/12_COMPONENT_GUIDELINES.md §6 Quota/Balance Meter rule). */
export function Progress({ value, label, tone = 'brand', className }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-bg-sunken', className)}
    >
      <div className={cn('h-full rounded-full transition-[width] duration-moderate ease-standard', TONE_CLASSES[tone])} style={{ width: `${clamped}%` }} />
    </div>
  );
}
