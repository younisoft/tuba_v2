import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';

export interface RestrictedStateProps {
  /** States exactly what's restricted and why, with the specific number/date —
   * never a vague "upgrade required" (tbos-blueprint/06_STATE_ARCHITECTURE.md
   * §1 Restricted). E.g. "Publishing is paused — you've used 50 of 50 listing slots." */
  reason: string;
  onUpgrade?: () => void;
  onViewAvailable?: () => void;
}

/**
 * TBOS-CMP-FEEDBACK-002 — the Restricted universal state (Payment
 * Required/Subscription Expired), named as a gap in
 * TBOS_FRONTEND_FOUNDATION_VERIFICATION.md §State Architecture and built here
 * now that the Component Library phase is the right place for reusable state
 * renderers. First real consumer will be WAL-01/02 and any quota-gated create
 * action once those screens get real content.
 */
export function RestrictedState({ reason, onUpgrade, onViewAvailable }: RestrictedStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border px-6 py-12 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-warning-subtle text-text-warning">
        <Icon name="wallet" className="h-5 w-5" />
      </span>
      <p className="max-w-sm text-body text-text-primary">{reason}</p>
      <div className="flex gap-2">
        {onUpgrade && (
          <Button size="sm" onClick={onUpgrade}>
            Upgrade / Top up
          </Button>
        )}
        {onViewAvailable && (
          <Button size="sm" variant="secondary" onClick={onViewAvailable}>
            View what's still available
          </Button>
        )}
      </div>
    </div>
  );
}
