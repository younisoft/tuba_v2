import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { FilterChip } from './FilterChip';
import { Button } from '@/components/ui/Button';

export interface ActiveFilter {
  id: string;
  label: string;
}

export interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  activeFilters: ActiveFilter[];
  onRemoveFilter: (id: string) => void;
  onClearAll?: () => void;
  /** The filter-selection controls themselves (Select/Checkbox groups) — kept
   * as a slot since which filters exist is entirely screen-specific. */
  filterControls?: ReactNode;
  /** Overrides the "N filter(s) active" copy — needed by any caller rendering
   * in a locale other than English. Defaults to the original string. */
  activeFiltersLabel?: (count: number) => string;
  /** Overrides the "Clear all" button label — same reason. */
  clearAllLabel?: string;
}

/**
 * TBOS-PAT-FILTER-002 — Filter/Sort Bar (design-system/12_COMPONENT_GUIDELINES.md
 * §3): search input + removable filter chips + sort control. Chart filters
 * reuse this exact component (design-system/13_DATA_VISUALIZATION.md §6) —
 * never a bespoke chart-filter UI.
 */
export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
  activeFilters,
  onRemoveFilter,
  onClearAll,
  filterControls,
  activeFiltersLabel,
  clearAllLabel = 'Clear all',
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Icon name="search" className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-icon-muted" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="min-h-touch-target w-full rounded-sm border border-border bg-bg-surface py-2 ps-9 pe-3 text-body text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-border-focus"
          />
        </div>
        {filterControls}
      </div>
      {activeFilters.length > 0 && (
        <div aria-live="polite" className="flex flex-wrap items-center gap-1.5">
          <span className="text-caption text-text-muted">
            {activeFiltersLabel ? activeFiltersLabel(activeFilters.length) : `${activeFilters.length} filter${activeFilters.length > 1 ? 's' : ''} active`}
          </span>
          {activeFilters.map((f) => (
            <FilterChip key={f.id} label={f.label} onRemove={() => onRemoveFilter(f.id)} />
          ))}
          {onClearAll && (
            <Button variant="ghost" size="sm" onClick={onClearAll}>
              {clearAllLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
