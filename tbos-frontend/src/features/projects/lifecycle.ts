import type { Project } from '@/types/entities';
import type { Locale } from '@/state/locale.store';
import { formatDate, daysUntil } from '@/features/properties/propertyFormat';

/**
 * Project reuses Property's exact 8-state lifecycle verbatim
 * (tbos-definition/16_MODULE_SPECIFICATIONS.md: "Required States: same set
 * as Properties"), so this mirrors features/properties/lifecycle.ts's
 * per-state message table exactly — duplicated rather than shared because
 * the two types don't structurally overlap enough for one function to type
 * against both without casting.
 */
export function projectLifecycleMessage(project: Project, locale: Locale): string {
  const ar = locale === 'ar';
  switch (project.status) {
    case 'draft':
      return ar ? 'لم يُنشر بعد.' : 'Not yet published.';
    case 'pending_compliance':
      return ar ? 'بانتظار استيفاء متطلبات الامتثال قبل النشر.' : 'Waiting on compliance requirements before this can go live.';
    case 'active':
      return project.listedDate ? (ar ? `منشور منذ ${formatDate(project.listedDate, locale)}.` : `Live since ${formatDate(project.listedDate, locale)}.`) : '';
    case 'expiring': {
      if (!project.expiryDate) return '';
      const days = Math.max(0, daysUntil(project.expiryDate));
      return ar ? `تنتهي خلال ${days} يومًا — جدد الآن لتجنب انقطاع النشر.` : `Expires in ${days} day${days === 1 ? '' : 's'} — renew now to avoid a gap.`;
    }
    case 'expired':
      return project.expiryDate ? (ar ? `انتهت في ${formatDate(project.expiryDate, locale)}.` : `Expired on ${formatDate(project.expiryDate, locale)}.`) : '';
    case 'rejected':
      return project.rejectionReason ?? (ar ? 'تم الرفض.' : 'Rejected.');
    case 'sold_rented':
      return ar ? 'تم وضع علامة مباع/مؤجر.' : 'Marked Sold/Rented.';
    case 'archived':
      return ar ? 'مؤرشف — غير مرئي في نتائج البحث أو المخزون النشط.' : 'Archived — not visible in search or active inventory.';
    default:
      return '';
  }
}
