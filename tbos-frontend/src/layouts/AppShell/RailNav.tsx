import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { MODULE_REGISTRY } from '@/registry/modules/moduleRegistry';
import { primaryScreenForModule } from '@/registry/screens/screenRegistry';
import { useHasPermission } from '@/lib/permissions/useHasPermission';
import { useFeatureFlagStore } from '@/state/featureFlags.store';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useUiStore } from '@/state/ui.store';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { TubaLogo } from '@/components/brand/TubaLogo';
import { cn } from '@/lib/cn';
import type { NavGroup } from '@/types/screens';

const GROUP_ORDER: { group: NavGroup; labelKey: 'nav.orientation' | 'nav.operating' | 'nav.intelligence' }[] = [
  { group: 'orientation', labelKey: 'nav.orientation' },
  { group: 'operating', labelKey: 'nav.operating' },
  { group: 'intelligence', labelKey: 'nav.intelligence' },
];

/**
 * Three visually distinct IA-layer groups, per tbos-blueprint/02_NAVIGATION_BLUEPRINT.md §1.
 * Reads MODULE_REGISTRY + SCREEN_REGISTRY rather than hardcoding links (master
 * prompt §10) and filters every entry through RBAC + feature flags — never a
 * per-link permission string scattered in the component itself. A group with
 * zero visible children doesn't render (§1: "rather than rendering empty").
 *
 * ADM is architecturally isolated (Constitution Article V): it never sees this
 * Broker OS tree at all — see ConsoleNav for its Platform Console equivalent.
 */
export function RailNav() {
  const { can, role } = useHasPermission();
  const { user } = useAuth();
  const isFlagEnabled = useFeatureFlagStore((s) => s.isEnabled);
  const collapsed = useUiStore((s) => s.railCollapsed);
  const toggleRail = useUiStore((s) => s.toggleRail);
  const { t } = useTranslation();

  const visibleModules = (group: NavGroup) =>
    MODULE_REGISTRY.filter((m) => m.navGroup === group)
      .filter((m) => !m.visibilityPermission || can(m.visibilityPermission))
      .filter((m) => !m.featureFlag || isFlagEnabled(m.featureFlag, role))
      .map((m) => ({ module: m, screen: primaryScreenForModule(m.id) }))
      .filter(
        (entry): entry is { module: (typeof MODULE_REGISTRY)[number]; screen: NonNullable<ReturnType<typeof primaryScreenForModule>> } =>
          !!entry.screen,
      );

  /** A group defaults expanded if any of its visible modules opts the current
   * role in via MODULE_REGISTRY's own `defaultExpandedForRoles` — reads the
   * registry instead of a hardcoded role check (master prompt §10). */
  const defaultsExpanded = (group: NavGroup) =>
    visibleModules(group).some(({ module }) => module.defaultExpandedForRoles === 'all' || (role && module.defaultExpandedForRoles.includes(role)));

  const [collapsedGroups, setCollapsedGroups] = useState<Partial<Record<NavGroup, boolean>>>({
    orientation: !defaultsExpanded('orientation'),
    operating: !defaultsExpanded('operating'),
    intelligence: !defaultsExpanded('intelligence'),
  });

  return (
    <nav
      aria-label="Primary"
      className="flex h-full shrink-0 flex-col border-e border-border bg-bg-surface transition-[width] duration-base ease-standard"
      style={{ width: collapsed ? 'var(--size-rail-collapsed)' : 'var(--size-rail-expanded)' }}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-4">
        {!collapsed && <TubaLogo className="h-7 w-auto shrink-0 text-text-brand dark:text-slate-0" />}
        <IconButton
          icon={collapsed ? 'chevron-right' : 'chevron-down'}
          label={collapsed ? t('nav.expandRail') : t('nav.collapseRail')}
          onClick={toggleRail}
          className="rtl:rotate-180"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {GROUP_ORDER.map(({ group, labelKey }) => {
          const modules = visibleModules(group);
          if (modules.length === 0) return null;
          const isGroupCollapsed = !!collapsedGroups[group];

          return (
            <div key={group} className="mb-2">
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => setCollapsedGroups((s) => ({ ...s, [group]: !s[group] }))}
                  className="flex w-full items-center justify-between px-2 py-1.5 text-micro uppercase tracking-wide text-text-muted"
                  aria-expanded={!isGroupCollapsed}
                >
                  {t(labelKey)}
                  <Icon name={isGroupCollapsed ? 'chevron-right' : 'chevron-down'} className="h-3 w-3 rtl:rotate-180" />
                </button>
              )}
              {(!isGroupCollapsed || collapsed) && (
                <ul>
                  {modules.map(({ module, screen }) => (
                    <li key={module.id}>
                      <NavLink
                        to={screen.path}
                        title={module.name}
                        className={({ isActive }) =>
                          cn(
                            'flex min-h-touch-target items-center gap-3 rounded-md px-2 text-body transition-colors duration-fast ease-standard',
                            isActive ? 'bg-bg-brand-subtle text-text-brand font-semibold' : 'text-text-secondary hover:bg-bg-sunken',
                          )
                        }
                      >
                        <Icon name={module.icon as IconName} className="h-5 w-5 shrink-0" />
                        {!collapsed && <span className="truncate">{module.name}</span>}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {user && user.roles.length > 1 && !collapsed && (
        <div className="border-t border-border px-3 py-2 text-caption text-text-muted">{t('auth.switchRole')} →</div>
      )}
    </nav>
  );
}
