import type { FeatureFlagDefinition } from '@/types/feature-flags';

/**
 * Centralized feature-flag definitions — the only place a flag's default state
 * is decided. Components call useFeatureFlag(key) (state/featureFlags.store.ts);
 * nothing should read import.meta.env or a literal boolean inline.
 */
export const FEATURE_FLAG_REGISTRY: FeatureFlagDefinition[] = [
  { key: 'tbos.ai.copilot', description: 'AI Copilot module (AICP-01/02) and embedded AI surfaces.', enabled: true, environment: 'all' },
  { key: 'tbos.leads.pipeline', description: 'Unified Lead Pipeline (LEAD-01/02/03).', enabled: true, environment: 'all' },
  { key: 'tbos.marketing.requests', description: 'Owner-originated Marketing Requests queue (OWN-03).', enabled: true, environment: 'all' },
  { key: 'tbos.analytics', description: 'Analytics Explorer (ANL-01) and Reports (RPT-01/02).', enabled: true, environment: 'all' },
  {
    key: 'tbos.platformConsole',
    description: 'Platform Console (PC-01–05) — ADM only regardless of this flag.',
    enabled: true,
    rolloutRoles: ['ADM'],
    environment: 'all',
  },
];

export const FEATURE_FLAG_MAP: Record<string, FeatureFlagDefinition> = Object.fromEntries(FEATURE_FLAG_REGISTRY.map((f) => [f.key, f]));
