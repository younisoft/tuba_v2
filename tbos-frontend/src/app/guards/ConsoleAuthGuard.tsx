import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthProvider';
import { ROLES } from '@/lib/permissions/roles';
import { Spinner } from '@/components/ui/Spinner';

/**
 * Boundary for the Platform Console route tree — the mirror image of
 * BrokerAuthGuard.tsx. A Broker OS session (any non-ADM role) is not a valid
 * Console session; it's sent back to the Broker OS entry point, not shown a
 * Console screen with a permission error. Unauthenticated visitors go to the
 * Console's own sign-in (`/console/login`), never the Broker OS one — the two
 * surfaces do not share a login screen, per Constitution Article V.
 */
export function ConsoleAuthGuard({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (status === 'unauthenticated' || status === 'session-expired' || status === 'error') {
    return <Navigate to="/console/login" replace />;
  }

  if (user && !ROLES[user.activeRole].isPlatformRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
