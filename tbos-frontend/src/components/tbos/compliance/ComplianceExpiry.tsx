import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

export interface ComplianceExpiryProps {
  /** Plain-language deadline, already formatted by the caller per locale —
   * "Expires in 14 days", "5 business days remaining." */
  label: string;
  daysRemaining: number;
}

/**
 * TBOS-CMP-COMPLIANCE-002 — proximity-aware urgency display for a license/
 * document deadline, matching the escalating-urgency pattern in
 * tbos-blueprint/09_NOTIFICATION_BLUEPRINT.md's reminder model (sparse far
 * out, frequent/urgent as the deadline nears). Icon+text, color reinforces.
 */
export function ComplianceExpiry({ label, daysRemaining }: ComplianceExpiryProps) {
  const tone = daysRemaining <= 7 ? 'text-text-danger' : daysRemaining <= 30 ? 'text-text-warning' : 'text-text-secondary';
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-body font-medium', tone)}>
      <Icon name="clock" className="h-4 w-4" />
      {label}
    </span>
  );
}
