import type { Property, PropertyMediaItem } from '@/types/entities';
import type { TodayRecommendation } from '@/types/today';
import { evaluatePropertyContentQuality } from './contentQuality';

export interface MarketingRecommendationInputs {
  properties: Property[];
  propertyMedia: PropertyMediaItem[];
  /** Only marketing.manage holders (SB/AO/MM) get actionable content-quality
   * recommendations — the same "never expose a misleading actionable
   * recommendation" discipline Contract's canApprove-gating established in
   * Phase 8. A Property Consultant sees a listing's status on PROP-02 but
   * never performs the content-quality fix action itself. */
  canManage: boolean;
}

/**
 * TODAY-01's Marketing-sourced entries. 'content_quality' is one of the seven
 * canonical categories in tbos-definition/15_DECISION_SUPPORT_SYSTEM.md — the
 * only Marketing/Campaign Today signal actually formalized there (deliberately
 * NOT "under-promoted inventory," which the audit found real but
 * under-specified — TBOS_MARKETING_UX_AUDIT.md P3-2). "Campaign eligibility
 * blocked/insufficient balance" is implemented as the notification the source
 * itself classifies it as (09_NOTIFICATION_BLUEPRINT.md), not stretched into
 * a Today card here.
 */
export function computeMarketingRecommendations({ properties, propertyMedia, canManage }: MarketingRecommendationInputs): TodayRecommendation[] {
  if (!canManage) return [];

  const recommendations: TodayRecommendation[] = [];

  for (const property of properties) {
    if (property.status !== 'active' && property.status !== 'expiring') continue;
    const approvedCount = propertyMedia.filter((m) => m.propertyId === property.id && m.status === 'approved').length;
    const quality = evaluatePropertyContentQuality(property, approvedCount);
    if (quality.score !== 'needs_attention') continue;

    recommendations.push({
      id: `rec-content-quality-${property.id}`,
      category: 'content_quality',
      priority: 'medium',
      what: `Improve content quality for ${property.title}`,
      why: `Missing ${quality.missingItems.join(', ')} — below the content-quality bar.`,
      impact: 'Listings below the quality bar are less likely to convert a view into a lead.',
      recommendedAction: 'Open the content quality queue and fix the missing items.',
      expectedOutcome: 'Higher view-to-lead conversion once resolved.',
      linkTo: '/marketing/content-quality',
      linkLabel: 'Open content quality queue',
    });
  }

  return recommendations;
}
