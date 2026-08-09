import type { ContractStatus, ContractType } from '@/types/entities';
import type { StatusMeaning } from '@/types/status';
import type { TranslationKey } from '@/lib/i18n/dictionaries';

/** tbos-blueprint/06_STATE_ARCHITECTURE.md "Contract lifecycle (CONT-02)" —
 * the complete, closed 6-state set, mapped onto the same five-meaning system
 * every other module's lifecycle uses (03_COLOR_SYSTEM.md §3). Closed is the
 * table's own "terminal, positive" state (success, like Sold/Rented);
 * Cancelled is the negative terminal (danger, like Lost). */
export const CONTRACT_STATUS_MEANING: Record<ContractStatus, StatusMeaning> = {
  draft: 'neutral',
  pending_compliance: 'info',
  active: 'success',
  renewal_due: 'warning',
  closed: 'success',
  cancelled: 'danger',
};

export const CONTRACT_STATUS_KEY: Record<ContractStatus, TranslationKey> = {
  draft: 'contract.status.draft',
  pending_compliance: 'contract.status.pending_compliance',
  active: 'contract.status.active',
  renewal_due: 'contract.status.renewal_due',
  closed: 'contract.status.closed',
  cancelled: 'contract.status.cancelled',
};

/** The only contract types named anywhere in the source docs
 * (tbos-definition/09_WORKFLOW_ARCHITECTURE.md). */
export const CONTRACT_TYPE_KEY: Record<ContractType, TranslationKey> = {
  brokerage_agreement: 'contract.type.brokerage_agreement',
  sale: 'contract.type.sale',
  lease: 'contract.type.lease',
};
