import { Icon } from '@/components/ui/Icon';

export interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

/** TBOS-PAT-FILTER-001 — one removable filter chip. Every chip is removable
 * via keyboard, per design-system/12_COMPONENT_GUIDELINES.md §3 Filter/Sort Bar. */
export function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-bg-brand-subtle py-1 ps-3 pe-1.5 text-label text-text-brand">
      {label}
      <button type="button" onClick={onRemove} aria-label={`Remove filter: ${label}`} className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-bg-brand hover:text-text-on-brand">
        <Icon name="x" className="h-3 w-3" />
      </button>
    </span>
  );
}
