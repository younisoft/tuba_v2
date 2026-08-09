import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';

export interface SearchEmptyStateProps {
  query: string;
  /** A broadened-query suggestion or a direct creation action — a bare
   * "no results" never ships (tbos-blueprint/10_SEARCH_EXPERIENCE.md §15's
   * cross-cutting rule). Required, not optional, by this component's type. */
  suggestion: ReactNode;
}

/** TBOS-PAT-SEARCH-002 */
export function SearchEmptyState({ query, suggestion }: SearchEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
      <Icon name="search" className="h-6 w-6 text-icon-muted" />
      <p className="text-body text-text-primary">No results for &quot;{query}&quot;</p>
      <div className="text-caption text-text-secondary">{suggestion}</div>
    </div>
  );
}
