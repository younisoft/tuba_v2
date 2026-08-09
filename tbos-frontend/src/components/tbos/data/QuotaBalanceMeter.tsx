import { Progress } from '@/components/ui/Progress';

export interface QuotaBalanceMeterProps {
  label: string;
  used: number;
  total: number;
}

/**
 * TBOS-CMP-DATA-003 — WAL-01's Quota/Balance Meter (design-system/
 * 12_COMPONENT_GUIDELINES.md §6). Current/limit always stated as text
 * alongside the bar, color shifts Success → Warning → Danger as consumption
 * approaches the limit — never fill-percentage-only.
 */
export function QuotaBalanceMeter({ label, used, total }: QuotaBalanceMeterProps) {
  const pct = total === 0 ? 0 : (used / total) * 100;
  const tone = pct >= 90 ? 'danger' : pct >= 70 ? 'warning' : 'success';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-body">
        <span className="text-text-primary">{label}</span>
        <span className="text-text-secondary">
          {used} of {total}
        </span>
      </div>
      <Progress value={pct} label={`${label}: ${used} of ${total} used`} tone={tone} />
    </div>
  );
}
