import { ActivityItem, type ActivityItemProps } from './ActivityItem';

/**
 * TBOS-CMP-ACTIVITY-002 — the Price/Status History Timeline anatomy
 * (design-system/12_COMPONENT_GUIDELINES.md §2): a real semantically-ordered
 * list (`<ol>`), newest-first, each entry independently focusable. Used for
 * Lead/Customer/Property/Contract activity — one component, fed different
 * entries, never a bespoke timeline per module.
 */
export function ActivityTimeline({ items }: { items: (ActivityItemProps & { id: string })[] }) {
  if (items.length === 0) {
    return <p className="text-body text-text-muted">No activity yet.</p>;
  }
  return (
    <ol className="relative border-s border-border ps-4">
      {items.map((item) => (
        <ActivityItem key={item.id} {...item} />
      ))}
    </ol>
  );
}
