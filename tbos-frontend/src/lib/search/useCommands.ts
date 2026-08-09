import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '@/state/theme.store';
import { useLocaleStore } from '@/state/locale.store';
import { useUiStore } from '@/state/ui.store';
import type { CommandDefinition } from './types';

/**
 * The foundation-phase command set named in the master prompt §21 — every
 * command here already exists as a reachable UI action elsewhere (theme/locale
 * toggles in the top bar, notifications via the bell), satisfying the "palette
 * is an accelerator, never a hidden capability" rule (tbos-blueprint/02 §8).
 */
export function useCommands(): CommandDefinition[] {
  const navigate = useNavigate();
  const themePreference = useThemeStore((s) => s.preference);
  const setThemePreference = useThemeStore((s) => s.setPreference);
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const setNotificationPanelOpen = useUiStore((s) => s.setNotificationPanelOpen);
  const closeCommandPalette = useUiStore((s) => s.closeCommandPalette);

  const wrap = (fn: () => void) => () => {
    fn();
    closeCommandPalette();
  };

  return [
    { id: 'go-home', label: 'Go Home', permission: 'home.view', run: wrap(() => navigate('/home')) },
    { id: 'go-today', label: 'Go to Today', permission: 'today.view', run: wrap(() => navigate('/today')) },
    {
      id: 'toggle-theme',
      label: themePreference === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme',
      permission: null,
      run: wrap(() => setThemePreference(themePreference === 'dark' ? 'light' : 'dark')),
    },
    {
      id: 'change-language',
      label: locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية',
      permission: null,
      run: wrap(() => setLocale(locale === 'ar' ? 'en' : 'ar')),
    },
    {
      id: 'open-notifications',
      label: 'Open Notifications',
      permission: 'notifications.view',
      run: wrap(() => setNotificationPanelOpen(true)),
    },
  ];
}
