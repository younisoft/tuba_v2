import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthStatus, AuthUser } from '@/lib/auth/types';
import type { RoleCode } from '@/types/rbac';
import { mockLogin } from '@/lib/auth/mockAuthAdapter';

interface SessionState {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  login: (personaId: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  switchRole: (role: RoleCode) => void;
}

/**
 * Session State, per master prompt §28 — kept separate from UI state (state/ui.store.ts)
 * and Permission state (derived, see lib/permissions/evaluate.ts) rather than one
 * monolithic store. Persisted so a page refresh doesn't lose the mock session.
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      status: 'unauthenticated',
      user: null,
      error: null,

      login: async (personaId: string) => {
        set({ status: 'loading', error: null });
        try {
          const user = await mockLogin(personaId);
          set({ status: 'authenticated', user, error: null });
        } catch (err) {
          set({ status: 'error', error: err instanceof Error ? err.message : 'Sign-in failed.' });
        }
      },

      logout: () => set({ status: 'unauthenticated', user: null, error: null }),

      refresh: async () => {
        const current = get().user;
        if (!current) return;
        set({ status: 'loading' });
        const user = await mockLogin(current.id);
        set({ status: 'authenticated', user });
      },

      switchRole: (role: RoleCode) => {
        const current = get().user;
        if (!current || !current.roles.includes(role)) return;
        set({ user: { ...current, activeRole: role } });
      },
    }),
    { name: 'tbos.session' },
  ),
);
