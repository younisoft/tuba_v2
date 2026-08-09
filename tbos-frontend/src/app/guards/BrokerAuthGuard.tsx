import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthProvider';
import { ROLES } from '@/lib/permissions/roles';
import { Spinner } from '@/components/ui/Spinner';

/**
 * Boundary for the Broker OS route tree. Per tbos-definition/00_PRODUCT_CONSTITUTION.md
 * Article V and tbos-blueprint/00_IMPLEMENTATION_BLUEPRINT.md §7 item 2, the
 * Platform Console "never share[s] a route prefix, session, or login surface
 * with any other screen" — so a session authenticated as a platform role is not
 * a valid Broker OS session at all, and is redirected to the Console's own
 * entry point rather than merely denied a screen (see ConsoleAuthGuard.tsx for
 * the mirror image of this check).
 */
export function BrokerAuthGuard({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (status === 'unauthenticated' || status === 'session-expired' || status === 'error') {
    return <Navigate to="/login" replace />;
  }

  if (user && ROLES[user.activeRole].isPlatformRole) {
    return <Navigate to="/console" replace />;
  }

  return <>{children}</>;
}
