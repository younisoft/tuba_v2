import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '@/state/ui.store';
import { useNotifications } from '@/lib/notifications/useNotifications';
import { useFocusTrap } from '@/lib/a11y/useFocusTrap';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { IconButton } from '@/components/ui/IconButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/ui/Button';
import { NotificationItem } from '@/components/tbos/notifications/NotificationItem';

/** Top-bar bell + dropdown — NOTIF-01's data surfaced as a cross-cutting shell
 * component, rendering each row via the Component Library's NotificationItem
 * (TBOS-CMP-NOTIFICATION-001) rather than an inline-duplicated markup. */
export function NotificationBell() {
  const open = useUiStore((s) => s.notificationPanelOpen);
  const setOpen = useUiStore((s) => s.setNotificationPanelOpen);
  const { notifications, isLoading, unreadCount, markRead, markAllRead } = useNotifications();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);
  useFocusTrap(containerRef, open, close);

  return (
    <div className="relative">
      <IconButton
        icon="bell"
        label={`${t('topbar.notifications')}${unreadCount > 0 ? ` — ${unreadCount} ${t('notifications.unread')}` : ''}`}
        active={open}
        onClick={() => setOpen(!open)}
      />
      {unreadCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute end-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-action-danger-bg px-1 text-micro text-text-on-brand"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}

      {open && (
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-label={t('topbar.notifications')}
          className="absolute end-0 top-full z-popover mt-2 w-80 rounded-lg border border-border bg-bg-surface shadow-4"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <h2 className="text-h3 text-text-primary">{t('topbar.notifications')}</h2>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => markAllRead()}>
                {t('notifications.markAllRead')}
              </Button>
            )}
          </div>

          <div aria-live="polite" className="max-h-96 overflow-y-auto">
            {isLoading && (
              <div className="space-y-3 p-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}

            {!isLoading && notifications.length === 0 && (
              <div className="p-2">
                <EmptyState tone="positive" title={t('notifications.empty')} body="" />
              </div>
            )}

            {!isLoading && notifications.length > 0 && (
              <ul>
                {notifications.map((n) => (
                  <li key={n.id}>
                    <NotificationItem
                      notification={n}
                      onOpen={() => {
                        markRead(n.id);
                        if (n.sourceScreenId) close();
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-border p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                navigate('/notifications');
                close();
              }}
            >
              {t('topbar.notifications')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
