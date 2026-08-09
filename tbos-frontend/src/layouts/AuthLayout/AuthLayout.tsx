import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthProvider';
import { PERSONA_OPTIONS } from '@/lib/auth/personas';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Spinner } from '@/components/ui/Spinner';
import { TubaLogo } from '@/components/brand/TubaLogo';
import { cn } from '@/lib/cn';

/**
 * Mock authentication boundary (master prompt §15) — a persona picker stands in
 * for a real identity provider. AuthProvider/useAuth's contract (login/logout/
 * refresh/getCurrentUser) is what a real login form would call identically;
 * only this screen changes when real auth lands.
 *
 * This is the **Broker OS** sign-in surface only — Constitution Article V
 * requires the Platform Console to have its own, separate login surface
 * (ConsoleAuthLayout at /console/login), never this screen. PERSONA_OPTIONS
 * already excludes platform roles; see lib/auth/personas.ts.
 */
export function AuthLayout() {
  const { login, status } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  async function handleSelect(personaId: string) {
    await login(personaId);
    navigate('/', { replace: true });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-canvas px-4">
      <div className="w-full max-w-md">
        <TubaLogo className="mx-auto mb-6 h-12 w-auto text-text-brand dark:text-slate-0" />
        <p className="mb-6 text-center text-body text-text-secondary">{t('auth.chooseAccount')}</p>

        <div className="space-y-2">
          {PERSONA_OPTIONS.map((persona) => (
            <button
              key={persona.personaId}
              type="button"
              disabled={status === 'loading'}
              onClick={() => handleSelect(persona.personaId)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg border border-border bg-bg-surface px-4 py-3 text-start',
                'hover:border-border-strong disabled:opacity-disabled',
              )}
            >
              <span>
                <span className="block text-body font-semibold text-text-primary">{persona.displayName}</span>
                <span className="block text-caption text-text-secondary">
                  {persona.roleName}
                  {persona.agencyName ? ` · ${persona.agencyName}` : ''}
                </span>
              </span>
              {status === 'loading' && <Spinner className="h-4 w-4" />}
            </button>
          ))}
        </div>

        {status === 'error' && <p className="mt-4 text-center text-body text-text-danger">Sign-in failed. Please try again.</p>}

        <p className="mt-6 text-center text-caption text-text-muted">
          Tuba platform staff?{' '}
          <Link to="/console/login" className="text-text-link underline">
            Sign in to the Platform Console
          </Link>
        </p>
      </div>
    </div>
  );
}
