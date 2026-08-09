import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthProvider';
import { CONSOLE_PERSONA_OPTIONS } from '@/lib/auth/personas';
import { Spinner } from '@/components/ui/Spinner';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

/**
 * The Platform Console's own sign-in surface — deliberately not a reskin of
 * AuthLayout mounted at a different path. Dark, slate-toned chrome (vs. the
 * Broker OS's canvas-toned login) so the two are visually unmistakable, not
 * just structurally separate. Constitution Article V: "different route space,
 * different login surface, different session."
 */
export function ConsoleAuthLayout() {
  const { login, status } = useAuth();
  const navigate = useNavigate();

  async function handleSelect(personaId: string) {
    await login(personaId);
    navigate('/console', { replace: true });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-200">
            <Icon name="shield" className="h-5 w-5" />
          </span>
          <h1 className="text-center text-h1 text-slate-50">Tuba Platform Console</h1>
          <p className="text-center text-body text-slate-400">Internal platform staff only — sign in to continue</p>
        </div>

        <div className="space-y-2">
          {CONSOLE_PERSONA_OPTIONS.map((persona) => (
            <button
              key={persona.personaId}
              type="button"
              disabled={status === 'loading'}
              onClick={() => handleSelect(persona.personaId)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-start',
                'hover:border-slate-500 disabled:opacity-45',
              )}
            >
              <span>
                <span className="block text-body font-semibold text-slate-50">{persona.displayName}</span>
                <span className="block text-caption text-slate-400">{persona.roleName}</span>
              </span>
              {status === 'loading' && <Spinner className="h-4 w-4 border-slate-500" />}
            </button>
          ))}
        </div>

        {status === 'error' && <p className="mt-4 text-center text-body text-danger-300">Sign-in failed. Please try again.</p>}
      </div>
    </div>
  );
}
