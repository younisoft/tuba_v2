import type { Contract } from '@/types/entities';
import type { TodayRecommendation } from '@/types/today';

export interface ContractRecommendationInputs {
  contracts: Contract[];
  /** Only contracts.approve holders (OM/AO) get actionable contract
   * recommendations — master prompt §13: "If a contract cannot be acted upon
   * because of permission, do not expose a misleading actionable
   * recommendation." A Property Consultant can see their contract's status
   * on CONT-02 but never performs the compliance-approval action itself
   * (tbos-blueprint/03_USER_JOURNEYS.md), so Today stays silent for them. */
  canApprove: boolean;
}

/**
 * TODAY-01's contract-sourced entries. tbos-blueprint/01_EXPERIENCE_
 * ARCHITECTURE.md WF-CONTRACT-NEW: "Compliance blockers interrupt
 * appropriately — a contract cannot silently sit non-compliant; it shows in
 * TODAY-01 for Operations Manager until resolved." Renewal Due inherits "the
 * same reminder cadence as WF-RENEWAL" per 06_STATE_ARCHITECTURE.md. No
 * worked Today-card example exists in the source for either signal (confirmed
 * by exhaustive search of both Decision Support docs) — copy here follows the
 * same What/Why/Impact/Action contract every other Today card already uses,
 * every entry traces to a real Contract record, never fabricated.
 */
export function computeContractRecommendations({ contracts, canApprove }: ContractRecommendationInputs): TodayRecommendation[] {
  if (!canApprove) return [];

  const recommendations: TodayRecommendation[] = [];

  for (const contract of contracts) {
    if (contract.status === 'pending_compliance') {
      recommendations.push({
        id: `rec-contract-compliance-${contract.id}`,
        category: 'compliance',
        priority: 'high',
        what: `Resolve compliance on Contract #${contract.id}`,
        why: 'This contract cannot become Active until every compliance requirement is resolved.',
        impact: 'A contract stuck at Pending Compliance blocks the deal from closing and delays commission recognition.',
        recommendedAction: 'Review the specific blocking requirement and resolve it.',
        expectedOutcome: 'The contract becomes eligible for activation.',
        linkTo: `/contracts/${contract.id}`,
        linkLabel: 'Open contract',
      });
    }

    if (contract.status === 'renewal_due' && contract.renewalDueDate) {
      const daysLeft = Math.max(0, Math.ceil((new Date(contract.renewalDueDate).getTime() - Date.now()) / 86_400_000));
      recommendations.push({
        id: `rec-contract-renewal-${contract.id}`,
        category: 'compliance',
        priority: daysLeft <= 14 ? 'high' : 'medium',
        what: `Renew Contract #${contract.id}`,
        why: `Renews in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`,
        impact: 'An unrenewed contract lapses, ending the active relationship with no automatic continuation.',
        recommendedAction: 'Renew, or decline with a reason if the relationship is ending.',
        deadline: `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`,
        expectedOutcome: 'The contract stays active with no gap.',
        linkTo: `/contracts/${contract.id}`,
        linkLabel: 'Open contract',
      });
    }
  }

  return recommendations;
}
