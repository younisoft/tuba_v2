import { TEAM_MEMBERS, AGENCIES } from '@/mocks/data/seed';
import { simulateLatency } from '@/mocks/api/latency';
import type { AuthUser } from './types';

/**
 * Stands in for a real identity provider. login() is the one function a future
 * real AuthProvider implementation replaces — everything consuming AuthUser via
 * useAuth() is unaffected by that swap (see ARCHITECTURE.md "Authentication boundary").
 */
export async function mockLogin(personaId: string): Promise<AuthUser> {
  await simulateLatency(400);

  const member = TEAM_MEMBERS.find((m) => m.id === personaId);
  if (!member) {
    throw new Error(`Unknown persona "${personaId}"`);
  }
  const agency = AGENCIES.find((a) => a.id === member.agencyId);

  return {
    id: member.id,
    name: member.name,
    email: member.email,
    agencyId: member.agencyId,
    agencyName: agency?.name ?? 'Tuba Platform',
    roles: member.roles,
    activeRole: member.roles[0],
  };
}
