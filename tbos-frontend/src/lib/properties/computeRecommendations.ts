import type { Property } from '@/types/entities';
import type { TodayRecommendation } from '@/types/today';

export interface PropertyRecommendationInputs {
  properties: Property[];
}

/**
 * TODAY-01's property-sourced entries — tbos-blueprint/09_NOTIFICATION_BLUEPRINT.md's
 * event catalog names exactly these three property-lifecycle events as
 * Today/Notification-worthy: listing rejected (High), listing expiring
 * (Medium → escalates), listing expired (High), plus license-expiring
 * cascading to "this affects N active listings" (07_DECISION_SUPPORT_SYSTEM.md).
 * Every entry traces to a real Property record — never fabricated content,
 * same discipline as lib/today/computeRecommendations.ts for Leads.
 */
export function computePropertyRecommendations({ properties }: PropertyRecommendationInputs): TodayRecommendation[] {
  const recommendations: TodayRecommendation[] = [];

  for (const property of properties) {
    if (property.status === 'rejected') {
      recommendations.push({
        id: `rec-property-rejected-${property.id}`,
        category: 'compliance',
        priority: 'high',
        what: `Fix and resubmit ${property.title}`,
        why: property.rejectionReason ?? 'This listing was rejected during compliance review.',
        impact: 'A rejected listing earns no leads until it is fixed and resubmitted.',
        recommendedAction: `Fix ${property.rejectionField ?? 'the flagged field'} and resubmit for review.`,
        expectedOutcome: 'The listing re-enters the review queue and can go live again.',
        linkTo: `/properties/${property.id}`,
        linkLabel: 'Open property',
      });
    }

    if (property.status === 'expiring' && property.expiryDate) {
      const daysLeft = Math.max(0, Math.ceil((new Date(property.expiryDate).getTime() - Date.now()) / 86_400_000));
      const expiringSoon = daysLeft <= 7;
      const dependentCount = properties.filter((p) => p.brokerId === property.brokerId && (p.status === 'active' || p.status === 'expiring')).length;
      recommendations.push({
        id: `rec-property-expiring-${property.id}`,
        category: 'compliance',
        priority: expiringSoon ? 'critical' : 'medium',
        what: `Renew ${property.title} before it expires`,
        why: `Expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'} — renew now to avoid a listing gap.`,
        impact: dependentCount > 1 ? `This affects ${dependentCount} active listings tied to the same license.` : 'The listing goes dark once the license lapses.',
        recommendedAction: 'One-click renew.',
        deadline: `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`,
        expectedOutcome: 'The listing stays live with no visibility gap.',
        linkTo: `/properties/${property.id}`,
        linkLabel: 'Open property',
      });
    }

    if (property.status === 'expired') {
      recommendations.push({
        id: `rec-property-expired-${property.id}`,
        category: 'compliance',
        priority: 'high',
        what: `Renew ${property.title} — expired`,
        why: `Expired on ${property.expiryDate ?? 'an earlier date'}.`,
        impact: 'This listing is currently invisible to buyers until renewed.',
        recommendedAction: 'Renew now to restore visibility.',
        expectedOutcome: 'Listing visibility is restored immediately on renewal.',
        linkTo: `/properties/${property.id}`,
        linkLabel: 'Open property',
      });
    }
  }

  return recommendations;
}
