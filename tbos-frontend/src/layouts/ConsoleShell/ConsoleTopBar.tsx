import { useAuth } from '@/lib/auth/AuthProvider';
import { useThemeStore } from '@/state/theme.store';
import { useLocaleStore } from '@/state/locale.store';
import { IconButton } from '@/components/ui/IconButton';

const THEME_CYCLE = ['light', 'dark', 'system'] as const;
const THEME_ICON = { light: 'sun', dark: 'moon', system: 'monitor' } as const;

/** Minimal top bar — no Global Search/Quick Actions/Notifications, none of
 * which are specified for the Platform Console this phase (`tbos-blueprint/
 * 18_OPEN_QUESTIONS.md` "Platform Console full behavioral spec... deferred"). */
export function ConsoleTopBar() {
  const { user, logout } = useAuth();
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const cycleTheme = () => {
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(preference) + 1) % THEME_CYCLE.length];
    setPreference(next);
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-4">
      <span className="text-body text-slate-400">{user?.name}</span>
      <div className="flex items-center gap-1">
        <IconButton icon={THEME_ICON[preference]} label={`Theme: ${preference}`} onClick={cycleTheme} className="text-slate-400 hover:bg-slate-800" />
        <IconButton icon="globe" label={locale === 'en' ? 'التبديل إلى العربية' : 'Switch to English'} onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')} className="text-slate-400 hover:bg-slate-800" />
        <IconButton icon="log-out" label="Sign out" onClick={logout} className="text-slate-400 hover:bg-slate-800" />
      </div>
    </header>
  );
}
