import { Icon, type IconName } from '@/components/ui/Icon';

export interface EntityMetaItem {
  icon: IconName;
  label: string;
  /** When present, the item renders as a real, keyboard-operable button that
   * navigates to the related entity's canonical detail screen (e.g. a Lead's
   * meta row linking to its Customer/Property) instead of a plain label —
   * master prompt §14/§26: every relationship must be actionable. */
  onClick?: () => void;
}

/**
 * TBOS-CMP-ENTITY-002 — the small icon+text meta row under an EntityHeader
 * title (district, price, due date, linked-record count). One component so
 * every entity type's meta row shares identical spacing/icon-sizing rather
 * than each screen composing its own icon+text row ad hoc.
 */
export function EntityMeta({ items }: { items: EntityMetaItem[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-1.5 text-caption text-text-secondary">
          <Icon name={item.icon} className="h-3.5 w-3.5 text-icon-muted" />
          {item.onClick ? (
            <button
              type="button"
              onClick={item.onClick}
              className="rounded text-text-link underline-offset-2 hover:underline"
            >
              {item.label}
            </button>
          ) : (
            item.label
          )}
        </li>
      ))}
    </ul>
  );
}
