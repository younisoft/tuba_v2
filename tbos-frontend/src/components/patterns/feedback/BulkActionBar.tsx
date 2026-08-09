import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

export interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: ReactNode;
  /** Overrides the "N selected" copy — needed by any caller rendering in a
   * locale other than English. Defaults to the original string. */
  selectedLabel?: (count: number) => string;
  /** Overrides the "Clear" button label — same reason. */
  clearLabel?: string;
}

/**
 * TBOS-PAT-FEEDBACK-002 — Bulk Action Bar (design-system/12_COMPONENT_GUIDELINES.md
 * §3): appears only when ≥1 row is selected, states the count, dismisses on
 * selection clear. Selection count announced live for screen-reader users.
 */
export function BulkActionBar({ selectedCount, onClearSelection, actions, selectedLabel, clearLabel = 'Clear' }: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div aria-live="polite" className="sticky top-0 z-sticky flex items-center justify-between gap-3 rounded-md bg-bg-brand-strong px-4 py-2.5 text-body text-text-on-brand">
      <span>{selectedLabel ? selectedLabel(selectedCount) : `${selectedCount} selected`}</span>
      <div className="flex items-center gap-2">
        {actions}
        <Button variant="secondary" size="sm" onClick={onClearSelection}>
          {clearLabel}
        </Button>
      </div>
    </div>
  );
}
