import { TEAM_MEMBERS, AGENCIES } from '@/mocks/data/seed';
import { ROLES } from '@/lib/permissions/roles';
import type { RoleCode } from '@/types/rbac';

export interface PersonaOption {
  personaId: string;
  teamMemberId: string;
  displayName: string;
  roleCode: RoleCode;
  roleName: string;
  agencyName: string | null;
}

const ALL_PERSONA_OPTIONS: PersonaOption[] = TEAM_MEMBERS.map((member) => {
  const primaryRole = member.roles[0];
  const agency = AGENCIES.find((a) => a.id === member.agencyId) ?? null;
  return {
    personaId: member.id,
    teamMemberId: member.id,
    displayName: member.name,
    roleCode: primaryRole,
    roleName: ROLES[primaryRole].name,
    agencyName: agency?.name ?? null,
  };
});

/**
 * Drives the Broker OS mock sign-in screen (AuthLayout) — one option per team
 * member, using their first-listed role as the persona's headline (a user with
 * more than one role, e.g. Sara as AO+PC, switches roles in-app after login via
 * the top bar persona switcher, not by picking a second persona here).
 *
 * Deliberately excludes platform roles (ADM) — Constitution Article V requires
 * a separate login surface for the Platform Console, so an Administrator
 * account never appears as an option on this screen. See CONSOLE_PERSONA_OPTIONS.
 */
export const PERSONA_OPTIONS: PersonaOption[] = ALL_PERSONA_OPTIONS.filter((p) => !ROLES[p.roleCode].isPlatformRole);

/** Drives ConsoleAuthLayout — the Platform Console's own, separate sign-in screen. */
export const CONSOLE_PERSONA_OPTIONS: PersonaOption[] = ALL_PERSONA_OPTIONS.filter((p) => ROLES[p.roleCode].isPlatformRole);
