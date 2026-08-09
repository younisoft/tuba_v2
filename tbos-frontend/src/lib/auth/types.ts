import type { RoleCode } from '@/types/rbac';

export type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated' | 'session-expired' | 'error';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  agencyId: string;
  agencyName: string;
  /** Every role context this user holds — the account/persona switcher (top bar) only
   * renders when this has more than one entry, per tbos-blueprint/02_NAVIGATION_BLUEPRINT.md §1. */
  roles: RoleCode[];
  activeRole: RoleCode;
}

export interface Session {
  user: AuthUser;
  issuedAt: string;
  /** Mock sessions never really expire; this models the shape a real session would have. */
  expiresAt: string;
}

export interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  login: (personaId: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  switchRole: (role: RoleCode) => void;
  getCurrentUser: () => AuthUser | null;
}
