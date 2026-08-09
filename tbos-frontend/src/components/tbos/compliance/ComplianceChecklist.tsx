import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

export interface ComplianceChecklistItem {
  id: string;
  /** Plain-language requirement text, front-loaded before the gate is hit —
   * "compliance is never a checkbox exercise," tbos-definition/20_NON_GOALS.md #9. */
  requirement: string;
  status: 'incomplete' | 'complete' | 'blocked';
  /** Required when status is 'blocked' — the specific reason, never a bare red X. */
  blockedReason?: string;
  /** Optional per-item resolve/view action (e.g. CONT-02's "Resolve" button on
   * a blocked requirement) — additive, backward-compatible; omit for a
   * read-only checklist. */
  action?: ReactNode;
}

const STATUS_CONFIG = {
  incomplete: { icon: 'circle', className: 'text-icon-muted' },
  complete: { icon: 'check', className: 'text-text-success' },
  blocked: { icon: 'x', className: 'text-text-danger' },
} as const;

/**
 * TBOS-CMP-COMPLIANCE-003 — the Compliance Checklist (design-system/
 * 12_COMPONENT_GUIDELINES.md §3): a real ordered list (`role="list"`), each
 * item's checked-state announced, every requirement stated in plain language.
 * Used by PROP-03/CONT-02/SET-04.
 */
export function ComplianceChecklist({ items }: { items: ComplianceChecklistItem[] }) {
  return (
    <ol className="flex flex-col gap-2">
      {items.map((item) => {
        const config = STATUS_CONFIG[item.status];
        return (
          <li key={item.id} className="flex items-start gap-2.5 rounded-md border border-border p-3">
            <Icon name={config.icon} className={cn('mt-0.5 h-4 w-4 shrink-0', config.className)} aria-hidden="true" />
            <div className="flex-1">
              <p className="text-body text-text-primary">{item.requirement}</p>
              {item.status === 'blocked' && item.blockedReason && <p className="mt-0.5 text-caption text-text-danger">{item.blockedReason}</p>}
            </div>
            {item.action}
            <span className="sr-only">{item.status}</span>
          </li>
        );
      })}
    </ol>
  );
}
