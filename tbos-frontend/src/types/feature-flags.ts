import type { RoleCode } from './rbac';

export type FlagEnvironment = 'all' | 'development' | 'staging' | 'production';

export interface FeatureFlagDefinition {
  key: string;
  description: string;
  enabled: boolean;
  /** If set, the flag is only on for these roles even when `enabled` is true. */
  rolloutRoles?: RoleCode[];
  environment: FlagEnvironment;
}
