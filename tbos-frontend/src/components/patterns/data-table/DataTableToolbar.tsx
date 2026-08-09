import type { ReactNode } from 'react';
import { FilterBar, type FilterBarProps } from '@/components/patterns/filters/FilterBar';

export interface DataTableToolbarProps extends FilterBarProps {
  /** A primary "Create" action or export button — screen-specific, so it's a slot. */
  actions?: ReactNode;
}

/**
 * TBOS-PAT-DATA-003 — pairs FilterBar with a trailing actions slot above a
 * DataTable. Kept as a thin composition rather than a new component with its
 * own state, so DataTable/FilterBar remain the two things under test, not a
 * third parallel implementation.
 */
export function DataTableToolbar({ actions, ...filterBarProps }: DataTableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 tablet:flex-row tablet:items-start tablet:justify-between">
      <div className="flex-1">
        <FilterBar {...filterBarProps} />
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}
