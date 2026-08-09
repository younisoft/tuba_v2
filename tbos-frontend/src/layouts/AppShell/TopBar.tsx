import { useThemeStore } from '@/state/theme.store';
import { useUiStore } from '@/state/ui.store';
import { useLocaleStore } from '@/state/locale.store';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useHasPermission } from '@/lib/permissions/useHasPermission';
import { IconButton } from '@/components/ui/IconButton';
import { Icon } from '@/components/ui/Icon';
import { NotificationBell } from '@/components/navigation/NotificationBell';
import { UserMenu } from './UserMenu';

const THEME_CYCLE = ['light', 'dark', 'system'] as const;
const THEME_ICON = { light: 'sun', dark: 'moon', system: 'monitor' } as const;

/**
 * Global search, Quick Actions, notifications, account/persona switcher — per
 * tbos-blueprint/02_NAVIGATION_BLUEPRINT.md §1. Rendered once by AppShell, so
 * every screen gets these without reimplementing them.
 */
export function TopBar() {
  const { t } = useTranslation();
  const openCommandPalette = useUiStore((s) => s.openCommandPalette);
  const setQuickActionsOpen = useUiStore((s) => s.setQuickActionsOpen);
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const { can } = useHasPermission();

  const cycleTheme = () => {
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(preference) + 1) % THEME_CYCLE.length];
    setPreference(next);
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-bg-surface px-4">
      <button
        type="button"
        onClick={() => openCommandPalette('search')}
        className="flex min-h-touch-target min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-bg-canvas px-3 text-start text-body text-text-muted hover:border-border-strong tablet:max-w-md"
      >
        <Icon name="search" className="h-4 w-4 shrink-0 text-icon-muted" />
        <span className="truncate">{t('topbar.search.placeholder')}</span>
        <kbd className="ms-auto hidden rounded border border-border px-1.5 py-0.5 text-micro text-text-muted desktop:inline">⌘K</kbd>
      </button>

      <div className="flex items-center gap-1">
        {(can('leads.view') || can('properties.create') || can('tasks.create')) && (
          <div className="hidden tablet:block">
            <IconButton icon="plus" label={t('topbar.quickActions')} onClick={() => setQuickActionsOpen(true)} />
          </div>
        )}

        <NotificationBell />

        <IconButton icon={THEME_ICON[preference]} label={t(`theme.${preference}` as 'theme.light')} onClick={cycleTheme} />

        <IconButton
          icon="globe"
          label={locale === 'en' ? t('locale.ar') : t('locale.en')}
          onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
        />

        <UserMenu />
      </div>
    </header>
  );
}
