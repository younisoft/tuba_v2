import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  /** States what would normally be here and why it's empty — never a bare
   * "no data" (tbos-blueprint/06_STATE_ARCHITECTURE.md §1 Empty). */
  body: string;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  /** TODAY-01/NOTIF-01's "you're all caught up" style — positive framing, no CTA needed. */
  tone?: 'neutral' | 'positive';
  children?: ReactNode;
}

export function EmptyState({ icon = 'info', title, body, primaryAction, secondaryAction, tone = 'neutral', children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <span
        className={
          tone === 'positive'
            ? 'flex h-10 w-10 items-center justify-center rounded-full bg-bg-success-subtle text-text-success'
            : 'flex h-10 w-10 items-center justify-center rounded-full bg-bg-sunken text-icon-muted'
        }
      >
        <Icon name={tone === 'positive' ? 'check' : icon} className="h-5 w-5" />
      </span>
      <h3 className="text-h3 text-text-primary">{title}</h3>
      <p className="max-w-sm text-body text-text-secondary">{body}</p>
      {children}
      {(primaryAction || secondaryAction) && (
        <div className="mt-2 flex gap-3">
          {primaryAction && (
            <Button size="sm" onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button size="sm" variant="secondary" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
