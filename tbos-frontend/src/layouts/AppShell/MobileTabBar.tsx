import { NavLink } from 'react-router-dom';
import { useUiStore } from '@/state/ui.store';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

/**
 * Exactly 5 destinations, fixed and non-overlapping — tbos-blueprint/02_NAVIGATION_BLUEPRINT.md §3.
 * Universal across personas (RBAC scopes what's *inside* Search/Today, not the
 * tab bar itself) — a persona never sees a broken/disabled tab.
 */
export function MobileTabBar() {
  const openCommandPalette = useUiStore((s) => s.openCommandPalette);
  const setQuickActionsOpen = useUiStore((s) => s.setQuickActionsOpen);
  const setNotificationPanelOpen = useUiStore((s) => s.setNotificationPanelOpen);
  const { t } = useTranslation();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex min-h-touch-target flex-1 flex-col items-center justify-center gap-0.5 text-micro',
      isActive ? 'text-text-brand' : 'text-text-muted',
    );

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-sticky flex h-16 items-stretch border-t border-border bg-bg-surface tablet:hidden"
    >
      <NavLink to="/home" className={linkClass}>
        <Icon name="home" className="h-5 w-5" />
        Home
      </NavLink>
      <NavLink to="/today" className={linkClass}>
        <Icon name="zap" className="h-5 w-5" />
        Today
      </NavLink>
      <button
        type="button"
        onClick={() => openCommandPalette('search')}
        className="flex min-h-touch-target flex-1 flex-col items-center justify-center gap-0.5 text-micro text-text-muted"
      >
        <Icon name="search" className="h-5 w-5" />
        Search
      </button>
      <div className="flex flex-1 items-center justify-center">
        <button
          type="button"
          onClick={() => setQuickActionsOpen(true)}
          aria-label={t('topbar.quickActions')}
          className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-bg-brand text-text-on-brand shadow-3"
        >
          <Icon name="plus" className="h-6 w-6" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => setNotificationPanelOpen(true)}
        className="flex min-h-touch-target flex-1 flex-col items-center justify-center gap-0.5 text-micro text-text-muted"
      >
        <Icon name="bell" className="h-5 w-5" />
        Alerts
      </button>
    </nav>
  );
}
