import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';

/**
 * TBOS-CMP-FEEDBACK-003 — the Offline universal state. "Never presented as if
 * live" (tbos-blueprint/06_STATE_ARCHITECTURE.md §1 Offline) — always carries
 * the as-of timestamp of the last-known-good data being shown underneath it.
 */
export function OfflineState({ asOf, onRetry }: { asOf: string; onRetry: () => void }) {
  return (
    <div role="status" className="flex items-center justify-between gap-3 rounded-md bg-bg-sunken px-4 py-2.5 text-body">
      <span className="flex items-center gap-2 text-text-secondary">
        <Icon name="info" className="h-4 w-4" />
        You&apos;re offline — showing data as of {asOf}.
      </span>
      <Button size="sm" variant="ghost" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
