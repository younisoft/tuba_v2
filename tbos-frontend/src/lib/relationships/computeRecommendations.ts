import type { MarketingRequest, Owner } from '@/types/entities';
import type { TodayRecommendation } from '@/types/today';

export interface RelationshipRecommendationInputs {
  marketingRequests: MarketingRequest[];
  owners: Owner[];
}

/**
 * TODAY-01's relationship-sourced entries. tbos-blueprint/04_SCREEN_INVENTORY.md
 * OWN-03: Marketing Requests are "structurally embedded inside Owners; also
 * derived-surfaced on TODAY-01 (the platform's one deliberate cross-surface
 * exception)." Only the 'open' state is time-sensitive enough to surface here
 * (tbos-blueprint/06_STATE_ARCHITECTURE.md's Marketing Request state table —
 * In Progress/Won/Lost have no "surface on Today" behavior documented). Every
 * entry traces to a real MarketingRequest record.
 */
export function computeRelationshipRecommendations({ marketingRequests, owners }: RelationshipRecommendationInputs): TodayRecommendation[] {
  const ownerName = (id: string) => owners.find((o) => o.id === id)?.name ?? 'Unknown owner';

  return marketingRequests
    .filter((request) => request.status === 'open')
    .map((request) => ({
      id: `rec-marketing-request-${request.id}`,
      category: 'relationship' as const,
      priority: 'medium' as const,
      what: `Respond to ${ownerName(request.ownerId)}'s marketing request`,
      why: `New request — ${request.propertyContext}.`,
      impact: 'An unclaimed marketing request leaves a paying owner without a response, risking the relationship and the monetized request itself.',
      recommendedAction: 'Review and claim the request.',
      expectedOutcome: 'The owner sees their request acknowledged and moving forward.',
      linkTo: `/owners/${request.ownerId}`,
      linkLabel: 'Open owner',
    }));
}
