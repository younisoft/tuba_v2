import type { ReactNode } from 'react';
import { Checkbox } from '@/components/ui/Checkbox';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, type EmptyStateProps } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { cn } from '@/lib/cn';
import type { ApiError } from '@/types/api';

export interface DataTableColumn<T> {
  id: string;
  header: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  /** Numeric columns align to the *end* edge (logical, not "right") —
   * design-system/12_COMPONENT_GUIDELINES.md §2 Data Table. */
  align?: 'start' | 'end';
}

export interface DataTableSort {
  columnId: string;
  direction: 'asc' | 'desc';
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  state?: 'loading' | 'error' | 'success';
  error?: ApiError;
  onRetry?: () => void;
  emptyState?: Pick<EmptyStateProps, 'title' | 'body' | 'primaryAction' | 'secondaryAction'>;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  /** Feeds each row checkbox's accessible name — individually labeled with the
   * record's identifying name, never just "row 3" (tbos-blueprint/
   * 04_SCREEN_INVENTORY.md PROP-01 accessibility note). Defaults to the row's
   * id if omitted, which is legible but not ideal — callers should supply this. */
  getRowLabel?: (row: T) => string;
  sort?: DataTableSort;
  /** DataTable never sorts data itself — it reports the requested column/
   * direction and the caller (backed by a real query eventually) re-fetches
   * or re-sorts. Master prompt §37: "Do not implement backend sorting... the
   * component should accept those capabilities through props/contracts." */
  onSortChange?: (columnId: string) => void;
  onRowClick?: (row: T) => void;
  density?: 'comfortable' | 'compact';
}

/**
 * TBOS-PAT-DATA-001 — the Record List / Data Table pattern
 * (design-system/12_COMPONENT_GUIDELINES.md §2), the single reusable list
 * every future *-01 list screen (PROP-01, LEAD-02, CUST-01, OWN-01, CONT-01,
 * MKT-01, TASK-01, AUTO-01, RPT-01, FIN-01, ANL-01) is meant to consume rather
 * than inventing its own table. Real `<table>`/`<th scope>` semantics;
 * horizontal scroll is this pattern's mobile strategy (master prompt §13
 * sanctions "horizontal scrolling or responsive alternative").
 */
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  state = 'success',
  error,
  onRetry,
  emptyState,
  selectedIds,
  onSelectionChange,
  getRowLabel,
  sort,
  onSortChange,
  onRowClick,
  density = 'comfortable',
}: DataTableProps<T>) {
  const selectable = !!onSelectionChange;
  const rowPadding = density === 'compact' ? 'py-1.5' : 'py-3';
  const allSelected = selectable && rows.length > 0 && rows.every((r) => selectedIds?.has(getRowId(r)));

  function toggleAll() {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? new Set() : new Set(rows.map(getRowId)));
  }

  function toggleRow(id: string) {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  }

  if (state === 'error') {
    return <ErrorState error={error ?? { code: 'unknown', message: 'Something went wrong loading this list.' }} onRetry={onRetry} />;
  }

  if (state === 'success' && rows.length === 0 && emptyState) {
    return <EmptyState {...emptyState} />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-body">
        <thead>
          <tr className="border-b border-border bg-bg-sunken">
            {selectable && (
              <th scope="col" className="w-10 px-3 py-2">
                <Checkbox label="Select all rows" labelHidden checked={allSelected} onChange={toggleAll} />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.id}
                scope="col"
                aria-sort={sort?.columnId === col.id ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                className={cn('px-3 py-2 text-label text-text-secondary', col.align === 'end' ? 'text-end' : 'text-start')}
              >
                {col.sortable && onSortChange ? (
                  <button type="button" onClick={() => onSortChange(col.id)} className="inline-flex items-center gap-1 hover:text-text-primary">
                    {col.header}
                    <Icon name="chevrons-up-down" className="h-3 w-3" />
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {state === 'loading' &&
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border last:border-b-0">
                {selectable && (
                  <td className="px-3 py-3">
                    <Skeleton className="h-4 w-4" />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.id} className="px-3 py-3">
                    <Skeleton className="h-4 w-full max-w-32" />
                  </td>
                ))}
              </tr>
            ))}

          {state === 'success' &&
            rows.map((row) => {
              const id = getRowId(row);
              const isSelected = selectedIds?.has(id) ?? false;
              return (
                <tr
                  key={id}
                  onClick={() => onRowClick?.(row)}
                  className={cn('border-b border-border last:border-b-0', onRowClick && 'cursor-pointer hover:bg-bg-sunken', isSelected && 'bg-bg-brand-subtle')}
                >
                  {selectable && (
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <Checkbox id={`select-row-${id}`} label={`Select ${getRowLabel?.(row) ?? id}`} labelHidden checked={isSelected} onChange={() => toggleRow(id)} />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.id} className={cn('px-3', rowPadding, col.align === 'end' ? 'text-end tabular-nums' : 'text-start')}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
