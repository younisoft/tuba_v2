import type { Property } from '@/types/entities';
import type { Locale } from '@/state/locale.store';
import { formatDate, daysUntil } from './propertyFormat';

/**
 * Per-state broker-facing message, following tbos-blueprint/06_STATE_
 * ARCHITECTURE.md §2's exact table (researched verbatim for this phase — see
 * TBOS_PRODUCT_UI_CONSISTENCY_AUDIT.md's Properties research): Draft "Not yet
 * published," Pending Compliance "Waiting on [requirement]," Active "Live
 * since [date]," Expiring "Expires in [N] days," Expired "Expired on [date],"
 * Rejected "Rejected: [reason]," Sold/Rented "Marked Sold/Rented on [date],"
 * Archived (Universal Archived state). Composed here rather than in the
 * dictionary since every branch needs an interpolated date/day-count, which
 * t() doesn't support (documented constraint, TBOS_PRODUCT_UI_CONSISTENCY_
 * AUDIT.md / TBOS_UI_INTEGRATION_AUDIT.md).
 */
export function lifecycleMessage(property: Property, locale: Locale): string {
  const ar = locale === 'ar';
  switch (property.status) {
    case 'draft':
      return ar ? 'لم يُنشر بعد.' : 'Not yet published.';
    case 'pending_compliance':
      return ar ? 'بانتظار استيفاء متطلبات الامتثال قبل النشر.' : 'Waiting on compliance requirements before this can go live.';
    case 'active':
      return property.listedDate ? (ar ? `منشور منذ ${formatDate(property.listedDate, locale)}.` : `Live since ${formatDate(property.listedDate, locale)}.`) : '';
    case 'expiring': {
      if (!property.expiryDate) return '';
      const days = Math.max(0, daysUntil(property.expiryDate));
      return ar ? `تنتهي خلال ${days} يومًا — جدد الآن لتجنب انقطاع النشر.` : `Expires in ${days} day${days === 1 ? '' : 's'} — renew now to avoid a gap.`;
    }
    case 'expired':
      return property.expiryDate ? (ar ? `انتهت في ${formatDate(property.expiryDate, locale)}.` : `Expired on ${formatDate(property.expiryDate, locale)}.`) : '';
    case 'rejected':
      return property.rejectionReason ?? (ar ? 'تم الرفض.' : 'Rejected.');
    case 'sold_rented':
      return ar ? 'تم وضع علامة مباع/مؤجر.' : 'Marked Sold/Rented.';
    case 'archived':
      return ar ? 'مؤرشف — غير مرئي في نتائج البحث أو المخزون النشط.' : 'Archived — not visible in search or active inventory.';
    default:
      return '';
  }
}
