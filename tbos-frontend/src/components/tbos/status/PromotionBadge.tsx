import { Badge } from '@/components/ui/Badge';
import { useTranslation } from '@/lib/i18n/useTranslation';

/**
 * Promotion tier — deliberately a separate badge from Property/Advertisement
 * status (TBOS_MY_PROPERTIES_UX_ARCHITECTURE.md Part 05). Basic (the default,
 * `undefined`) renders nothing — an always-on "Basic" tag on the majority of
 * rows would be exactly the badge clutter the C1 quality bar rules out; the
 * *absence* of this badge already communicates "not promoted."
 */
export function PromotionBadge({ tier }: { tier?: 'featured' | 'pro' }) {
  const { t } = useTranslation();
  if (!tier) return null;
  return (
    <Badge tone="brand" icon="zap">
      {t(tier === 'pro' ? 'properties.promotion.pro' : 'properties.promotion.featured')}
    </Badge>
  );
}
