import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** View-toggle buttons, "Mark all read," etc. — same slot every list-type
   * screen already puts at the header's logical end. */
  actions?: ReactNode;
}

/**
 * TBOS-PAT-LAYOUT-001 — the page header every list-type screen (TODAY-01,
 * LEAD-01, LEAD-02, NOTIF-01) had hand-duplicated identically (h1 title +
 * text-body-lg subtitle, optional actions row) — extracted during the
 * Product UI Consistency Audit (TBOS_PRODUCT_UI_CONSISTENCY_AUDIT.md §finding
 * "page header duplication") so a 5th screen (PROP-01) doesn't repeat it a
 * fifth time. Record-detail screens (LEAD-03, PROP-02) use EntityDetailHeader
 * instead — a different, appropriate pattern for a single record, not a list.
 */
export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-h1 text-text-primary">{title}</h1>
        {subtitle && <p className="mt-1 text-body-lg text-text-secondary">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
