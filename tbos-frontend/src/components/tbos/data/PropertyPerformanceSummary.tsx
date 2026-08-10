import { Icon, type IconName } from '@/components/ui/Icon';
import { Tooltip } from '@/components/ui/Tooltip';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface MetricSlot {
  icon: IconName;
  label: string;
  /** Present only for currently-verified metrics — never a fabricated number. */
  value?: number;
}

/**
 * TBOS-CMP-DATA — PROP-01's quick performance summary
 * (TBOS_MY_PROPERTIES_UX_ARCHITECTURE.md §8.6: "Reach and Views as compact
 * inline numbers... Leads and every future metric reserved for Detail").
 * Refined in Phase C1: Leads is the only metric with a real data source
 * anywhere in this codebase (computed from actual Lead↔Property links, same
 * discipline as `propertyPerformanceForProperty`). Reach/Views have no real
 * tracking pipeline in TBOS today — showing a static number for them would be
 * exactly the fabrication TBOS_MY_PROPERTIES_STATE_MATRIX.md §8.4 and the C1
 * brief's Decision 02 forbid, so they render an honest "not tracked yet"
 * state instead. The slot list is intentionally open-ended (Part 21 — future-
 * ready without a redesign) rather than three hardcoded props.
 */
export function PropertyPerformanceSummary({ leadsGenerated }: { leadsGenerated: number }) {
  const { t } = useTranslation();

  const slots: MetricSlot[] = [
    { icon: 'users', label: t('properties.performance.leads'), value: leadsGenerated },
    { icon: 'trending-up', label: t('properties.performance.reach') },
    { icon: 'bar-chart', label: t('properties.performance.views') },
  ];

  return (
    <ul className="flex items-center gap-3">
      {slots.map((slot) => (
        <li key={slot.label} className="flex items-center gap-1 text-caption text-text-secondary">
          <Icon name={slot.icon} className="h-3.5 w-3.5 text-icon-muted" />
          {slot.value !== undefined ? (
            <span aria-label={`${slot.label}: ${slot.value}`} className="tabular-nums">
              {slot.value}
            </span>
          ) : (
            <Tooltip content={t('properties.performance.notTrackedYet')}>
              <span tabIndex={0} aria-label={`${slot.label}: ${t('properties.performance.notTrackedYet')}`} className="cursor-default text-text-muted">
                —
              </span>
            </Tooltip>
          )}
        </li>
      ))}
    </ul>
  );
}
