import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/lib/notifications/useNotifications';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { SCREEN_MAP } from '@/registry/screens/screenRegistry';
import { NotificationItem } from '@/components/tbos/notifications/NotificationItem';
import { PageHeader } from '@/components/patterns/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import type { AppNotification } from '@/types/entities';

/** Screens whose notifications deep-link to one specific record rather than
 * the screen's own (parameterized, un-navigable-as-is) route — a small map
 * instead of a growing chain of `if`s now that Customer/Owner join Lead as
 * canonical, record-level deep-link targets (TBOS_RELATIONSHIP_UX_AUDIT.md
 * P2-1). */
const RECORD_ROUTE_BUILDERS: Partial<Record<string, (recordId: string) => string>> = {
  'LEAD-03': (id) => `/leads/${id}`,
  'CUST-02': (id) => `/customers/${id}`,
  'OWN-02': (id) => `/owners/${id}`,
  'CONT-02': (id) => `/contracts/${id}`,
  'MKT-02': (id) => `/marketing/new?campaignId=${id}`,
};

/** Resolves a notification's deep-link target — the specific record when one
 * is known (sourceRecordId), otherwise the screen's own route if it has no
 * unfilled path param, otherwise null (mark-as-read only, no navigation). */
function targetPath(n: AppNotification): string | null {
  const buildRoute = n.sourceScreenId ? RECORD_ROUTE_BUILDERS[n.sourceScreenId] : undefined;
  if (buildRoute && n.sourceRecordId) return buildRoute(n.sourceRecordId);
  const screen = n.sourceScreenId ? SCREEN_MAP[n.sourceScreenId] : undefined;
  if (screen && !screen.path.includes(':')) return screen.path;
  return null;
}

/**
 * NOTIF-01 — Notification Center (tbos-blueprint/04_SCREEN_INVENTORY.md):
 * "timeline of every notification the broker has received in-app." Reuses
 * NotificationItem unchanged from the TopBar dropdown (master prompt §21);
 * "open notification (deep-links to source)" is implemented here via
 * sourceRecordId (TBOS_UI_INTEGRATION_AUDIT.md §1.P item 2) — a notification
 * is never a dead end.
 */
export function NotificationCenterScreen() {
  const { notifications, isLoading, error, unreadCount, markRead, markAllRead } = useNotifications();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [unreadOnly, setUnreadOnly] = useState(false);

  const visible = useMemo(() => (unreadOnly ? notifications.filter((n) => !n.read) : notifications), [notifications, unreadOnly]);

  if (error) return <ErrorState error={error} />;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={t('notifications.center.title')}
        subtitle={t('notifications.center.subtitle')}
        actions={
          unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={() => markAllRead()}>
              {t('notifications.markAllRead')}
            </Button>
          )
        }
      />

      <div className="mt-4">
        <Button variant={unreadOnly ? 'primary' : 'secondary'} size="sm" onClick={() => setUnreadOnly((v) => !v)}>
          {t('notifications.center.filterUnread')}
        </Button>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        {isLoading && (
          <div className="space-y-3 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}

        {!isLoading && visible.length === 0 && (
          <div className="p-2">
            <EmptyState tone="positive" title={t('notifications.empty')} body={t('notifications.center.empty.body')} />
          </div>
        )}

        {!isLoading && visible.length > 0 && (
          <ul>
            {visible.map((n) => (
              <li key={n.id}>
                <NotificationItem
                  notification={n}
                  onOpen={() => {
                    markRead(n.id);
                    const path = targetPath(n);
                    if (path) navigate(path);
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
