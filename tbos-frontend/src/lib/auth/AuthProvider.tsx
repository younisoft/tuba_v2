import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useSessionStore } from '@/state/session.store';
import type { AuthContextValue } from './types';

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Thin wrapper over state/session.store.ts — the store already holds the real
 * state (so it's usable outside React, e.g. in lib/api interceptors later); this
 * provider's job is exposing the stable AuthProvider/AuthUser/Session shape the
 * master prompt names explicitly, and giving screens a single `useAuth()` import.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const status = useSessionStore((s) => s.status);
  const user = useSessionStore((s) => s.user);
  const error = useSessionStore((s) => s.error);
  const login = useSessionStore((s) => s.login);
  const logout = useSessionStore((s) => s.logout);
  const refresh = useSessionStore((s) => s.refresh);
  const switchRole = useSessionStore((s) => s.switchRole);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      error,
      login,
      logout,
      refresh,
      switchRole,
      getCurrentUser: () => useSessionStore.getState().user,
    }),
    [status, user, error, login, logout, refresh, switchRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Co-locating useAuth with AuthProvider (common context+hook pairing) outweighs
// the minor Fast Refresh cost of splitting a 4-line hook into its own file.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
