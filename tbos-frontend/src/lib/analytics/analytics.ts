import { logger } from '@/lib/logging/logger';

export type AnalyticsEventName = 'page_view' | 'action' | 'search' | 'feature_used' | 'error' | 'permission_denied' | 'ai_action';

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  properties?: Record<string, string | number | boolean | undefined>;
}

/**
 * Production analytics abstraction (master prompt §29) — no provider is wired
 * in this phase; `track()` currently routes to the dev logger only, so call
 * sites are already correct once a real provider (Segment, PostHog, etc.) is
 * plugged in behind this one function.
 */
export function track(event: AnalyticsEvent) {
  logger.info(`analytics:${event.name}`, event.properties);
}
