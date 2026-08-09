import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthProvider';
import { ROLES } from '@/lib/permissions/roles';
import { useFocusTrap } from '@/lib/a11y/useFocusTrap';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

/**
 * Account/persona switcher — only meaningfully offers role-switching when the
 * user holds more than one role context, per tbos-blueprint/02_NAVIGATION_BLUEPRINT.md §1
 * ("an Agency Owner who is also a Property Consultant on their own deals").
 */
export function UserMenu() {
  const { user, logout, switchRole } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);
  useFocusTrap(containerRef, open, close);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={t('topbar.account')}
        aria-haspopup="menu"
        className="flex min-h-touch-target items-center gap-2 rounded-md px-1.5 hover:bg-bg-sunken"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-brand-subtle text-label text-text-brand">
          {initials}
        </span>
      </button>

      {open && (
        <div
          ref={containerRef}
          role="menu"
          aria-label={t('topbar.account')}
          className="absolute end-0 top-full z-popover mt-2 w-64 rounded-lg border border-border bg-bg-surface p-1.5 shadow-4"
        >
          <div className="px-2.5 py-2">
            <p className="text-body font-semibold text-text-primary">{user.name}</p>
            <p className="text-caption text-text-secondary">
              {ROLES[user.activeRole].name} · {user.agencyName}
            </p>
          </div>

          {user.roles.length > 1 && (
            <div className="border-t border-border py-1.5">
              <p className="px-2.5 pb-1 text-micro uppercase text-text-muted">{t('auth.switchRole')}</p>
              {user.roles.map((role) => (
                <button
                  key={role}
                  type="button"
                  role="menuitemradio"
                  aria-checked={role === user.activeRole}
                  onClick={() => {
                    switchRole(role);
                    close();
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-start text-body hover:bg-bg-sunken',
                    role === user.activeRole && 'text-text-brand font-semibold',
                  )}
                >
                  {ROLES[role].name}
                  {role === user.activeRole && <Icon name="check" className="h-4 w-4" />}
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-border py-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                navigate('/settings/profile');
                close();
              }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-start text-body text-text-primary hover:bg-bg-sunken"
            >
              <Icon name="settings" className="h-4 w-4" />
              {t('topbar.account')}
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                logout();
                close();
              }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-start text-body text-text-danger hover:bg-bg-sunken"
            >
              <Icon name="log-out" className="h-4 w-4" />
              {t('auth.signOut')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
