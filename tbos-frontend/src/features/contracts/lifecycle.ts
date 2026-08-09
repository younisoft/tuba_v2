import type { Contract } from '@/types/entities';
import type { Locale } from '@/state/locale.store';
import { formatDate, daysUntil } from '@/features/properties/propertyFormat';

/**
 * Per-state broker-facing message, following tbos-blueprint/06_STATE_
 * ARCHITECTURE.md's "Contract lifecycle (CONT-02)" table verbatim (researched
 * for this phase — see TBOS_CONTRACTS_COMPLIANCE_UX_AUDIT.md): Draft "Terms
 * captured — compliance checklist not yet started," Pending Compliance
 * "Waiting on [specific document/verification]," Active "Active since [date].
 * Renewal due [date]," Renewal Due "Renews in [N] days," Closed "Closed on
 * [date]," Cancelled "Cancelled on [date]: [reason]." Composed here rather
 * than in the dictionary since every branch needs an interpolated date/
 * day-count/reason, which t() doesn't support (documented constraint).
 */
export function contractLifecycleMessage(contract: Contract, locale: Locale, blockingReason?: string): string {
  const ar = locale === 'ar';
  switch (contract.status) {
    case 'draft':
      return ar ? 'تم تسجيل الشروط — لم تبدأ قائمة الامتثال بعد.' : 'Terms captured — compliance checklist not yet started.';
    case 'pending_compliance':
      return blockingReason
        ? ar
          ? `بانتظار: ${blockingReason}`
          : `Waiting on ${blockingReason}.`
        : ar
          ? 'بانتظار استيفاء متطلبات الامتثال.'
          : 'Waiting on compliance requirements.';
    case 'active':
      if (!contract.activeSince) return ar ? 'نشط.' : 'Active.';
      return ar
        ? `نشط منذ ${formatDate(contract.activeSince, locale)}${contract.renewalDueDate ? `. التجديد مستحق في ${formatDate(contract.renewalDueDate, locale)}` : ''}.`
        : `Active since ${formatDate(contract.activeSince, locale)}.${contract.renewalDueDate ? ` Renewal due ${formatDate(contract.renewalDueDate, locale)}.` : ''}`;
    case 'renewal_due': {
      if (!contract.renewalDueDate) return ar ? 'التجديد مستحق.' : 'Renewal due.';
      const days = Math.max(0, daysUntil(contract.renewalDueDate));
      return ar ? `يتجدد خلال ${days} يومًا.` : `Renews in ${days} day${days === 1 ? '' : 's'}.`;
    }
    case 'closed':
      return contract.closedDate ? (ar ? `مغلق في ${formatDate(contract.closedDate, locale)}.` : `Closed on ${formatDate(contract.closedDate, locale)}.`) : ar ? 'مغلق.' : 'Closed.';
    case 'cancelled':
      return contract.cancelledDate
        ? ar
          ? `أُلغي في ${formatDate(contract.cancelledDate, locale)}${contract.cancellationReason ? `: ${contract.cancellationReason}` : ''}.`
          : `Cancelled on ${formatDate(contract.cancelledDate, locale)}${contract.cancellationReason ? `: ${contract.cancellationReason}` : ''}.`
        : ar
          ? 'ملغى.'
          : 'Cancelled.';
    default:
      return '';
  }
}
