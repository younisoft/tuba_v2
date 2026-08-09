import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import type { ApiError } from '@/types/api';

/**
 * Plain-language error rendering — never a raw stack trace or gateway string
 * (tbos-blueprint/06_STATE_ARCHITECTURE.md §1 Error). `error.debugDetail` is
 * logged (see lib/logging/logger.ts) but never rendered.
 */
export function ErrorState({ error, onRetry }: { error: ApiError; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border px-6 py-12 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-danger-subtle text-text-danger">
        <Icon name="alert-triangle" className="h-5 w-5" />
      </span>
      <p className="max-w-sm text-body text-text-primary">{error.message}</p>
      {onRetry && error.recoveryAction === 'retry' && (
        <Button size="sm" variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
