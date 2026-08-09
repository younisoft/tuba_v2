import { create } from 'zustand';
import { FEATURE_FLAG_MAP } from '@/lib/featureFlags/registry';
import type { RoleCode } from '@/types/rbac';

interface FeatureFlagState {
  /** Dev/QA-only per-session overrides layered on top of the registry defaults —
   * never persisted, never a substitute for the registry's own defaults. */
  overrides: Record<string, boolean>;
  setOverride: (key: string, value: boolean | null) => void;
  isEnabled: (key: string, role: RoleCode | null) => boolean;
}

export const useFeatureFlagStore = create<FeatureFlagState>()((set, get) => ({
  overrides: {},

  setOverride: (key, value) =>
    set((state) => {
      const next = { ...state.overrides };
      if (value === null) delete next[key];
      else next[key] = value;
      return { overrides: next };
    }),

  isEnabled: (key, role) => {
    const definition = FEATURE_FLAG_MAP[key];
    if (!definition) return false;

    const override = get().overrides[key];
    const enabled = override ?? definition.enabled;
    if (!enabled) return false;

    if (definition.rolloutRoles && definition.rolloutRoles.length > 0) {
      return role ? definition.rolloutRoles.includes(role) : false;
    }
    return true;
  },
}));
