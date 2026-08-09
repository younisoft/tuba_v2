import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import type { AppNotification, NotificationPriority } from '@/types/entities';

const PRIORITY_TONE: Record<NotificationPriority, BadgeTone> = {
  critical: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'neutral',
};

export interface NotificationItemProps {
  notification: AppNotification;
  onOpen: () => void;
}

/**
 * TBOS-CMP-NOTIFICATION-001 — the Notification List Item (design-system/
 * 12_COMPONENT_GUIDELINES.md §6): urgency-tier icon/badge → message →
 * timestamp/source implied by the caller's context → unread state
 * (`bg.brand-subtle`). Consumed by NotificationBell (top-bar dropdown) today;
 * NOTIF-01's full-page timeline reuses it unchanged once built.
 */
export function NotificationItem({ notification, onOpen }: NotificationItemProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'flex w-full flex-col items-start gap-0.5 border-b border-border px-4 py-2.5 text-start last:border-b-0 hover:bg-bg-sunken',
        !notification.read && 'bg-bg-brand-subtle',
      )}
    >
      <span className="flex w-full items-center gap-2">
        <span className="flex-1 text-body font-semibold text-text-primary">{notification.title}</span>
        {(notification.priority === 'critical' || notification.priority === 'high') && (
          <Badge tone={PRIORITY_TONE[notification.priority]}>{notification.priority}</Badge>
        )}
      </span>
      <span className="text-caption text-text-secondary">{notification.body}</span>
    </button>
  );
}
