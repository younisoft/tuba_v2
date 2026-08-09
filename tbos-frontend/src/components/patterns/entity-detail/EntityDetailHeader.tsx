import type { ReactNode } from 'react';
import { EntityMeta, type EntityMetaItem } from '@/components/tbos/entity/EntityMeta';

export interface EntityDetailHeaderProps {
  /** Usually a string; may be a link-styled button (see LeadDetailScreen) when
   * the title itself stands in for a related, separately-navigable entity. */
  title: ReactNode;
  status?: ReactNode;
  meta?: EntityMetaItem[];
  /** Primary action never collapses; secondary actions collapse into an
   * overflow menu below tablet width — design-system/12_COMPONENT_GUIDELINES.md
   * §2 Detail Header responsive rule. Caller supplies both slots already
   * composed (e.g. primary=<Button/>, secondary=<Dropdown/>) since the exact
   * action set is screen-specific business logic this pattern doesn't own. */
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
}

/**
 * TBOS-PAT-ENTITY-001 — the Detail Header anatomy every *-02 screen
 * (PROP-02, LEAD-03, CUST-02, OWN-02, CONT-02, MKT-02, RPT-02, WAL-02) uses:
 * record title (`h1`) + Status Badge + primary/secondary actions row. No
 * breadcrumb here — ScreenPlaceholder/future screens render that separately
 * per ROUTING.md's documented breadcrumb decision.
 */
export function EntityDetailHeader({ title, status, meta, primaryAction, secondaryActions }: EntityDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4 tablet:flex-row tablet:items-start tablet:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-h1 text-text-primary">{title}</h1>
          {status}
        </div>
        {meta && (
          <div className="mt-2">
            <EntityMeta items={meta} />
          </div>
        )}
      </div>
      {(primaryAction || secondaryActions) && (
        <div className="flex shrink-0 items-center gap-2">
          {secondaryActions}
          {primaryAction}
        </div>
      )}
    </div>
  );
}
