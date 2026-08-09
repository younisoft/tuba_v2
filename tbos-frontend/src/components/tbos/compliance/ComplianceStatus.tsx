import { StatusBadge } from '@/components/tbos/status/StatusBadge';
import type { StatusMeaning } from '@/types/status';

export type ComplianceState = 'not_started' | 'pending_verification' | 'verified' | 'expiring' | 'expired' | 'mismatch';

const STATE_MAP: Record<ComplianceState, { label: string; meaning: StatusMeaning }> = {
  not_started: { label: 'Not started', meaning: 'neutral' },
  pending_verification: { label: 'Pending verification', meaning: 'info' },
  verified: { label: 'Verified', meaning: 'success' },
  expiring: { label: 'Expiring soon', meaning: 'warning' },
  expired: { label: 'Expired', meaning: 'danger' },
  mismatch: { label: 'Mismatch flagged', meaning: 'danger' },
};

/**
 * TBOS-CMP-COMPLIANCE-001 — reuses StatusBadge with a compliance-specific
 * state map, deliberately with **no dedicated compliance hue** — design-system/
 * 03_COLOR_SYSTEM.md §4: "Compliance is not a module with its own visual
 * identity, it's a property of records across every module." SET-04, CONT-02,
 * and PROP-02's Compliance tab all render through this same map.
 */
export function ComplianceStatus({ state }: { state: ComplianceState }) {
  const { label, meaning } = STATE_MAP[state];
  return <StatusBadge label={label} meaning={meaning} />;
}
