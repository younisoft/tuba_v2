import type { Role, RoleCode } from '@/types/rbac';

/** Source: tbos-definition/04_PERSONAS.md. Order matters for the persona-switcher
 * UI — roughly descending scope, ADM last since it's a separate universe. */
export const ROLES: Record<RoleCode, Role> = {
  SB: {
    code: 'SB',
    name: 'Solo Broker',
    description: 'Independent agent, no team — handles every function themselves.',
    isPlatformRole: false,
  },
  AO: {
    code: 'AO',
    name: 'Agency Owner',
    description: 'Runs a multi-agent brokerage; full account owner.',
    isPlatformRole: false,
  },
  SM: {
    code: 'SM',
    name: 'Sales Manager',
    description: 'Owns lead distribution and agent performance day-to-day.',
    isPlatformRole: false,
  },
  MM: {
    code: 'MM',
    name: 'Marketing Manager',
    description: 'Owns listing quality, promotion spend, and campaign performance.',
    isPlatformRole: false,
  },
  OM: {
    code: 'OM',
    name: 'Operations Manager',
    description: 'Owns compliance, contracts, and the administrative backbone.',
    isPlatformRole: false,
  },
  PC: {
    code: 'PC',
    name: 'Property Consultant',
    description: 'Team member handling showings, buyer relationships, and closing.',
    isPlatformRole: false,
  },
  ADM: {
    code: 'ADM',
    name: 'Administrator',
    description: 'Internal Tuba staff — manages the platform itself, never the broker-side product.',
    isPlatformRole: true,
  },
};

export const BROKER_OS_ROLES: RoleCode[] = ['SB', 'AO', 'SM', 'MM', 'OM', 'PC'];
export const PLATFORM_ROLES: RoleCode[] = ['ADM'];
