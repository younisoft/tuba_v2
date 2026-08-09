import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { cn } from '@/lib/cn';

export type AlertTone = 'neutral' | 'info' | 'warning' | 'danger' | 'success';

const TONE_CONFIG: Record<AlertTone, { className: string; icon: IconName }> = {
  neutral: { className: 'bg-bg-sunken text-text-primary', icon: 'info' },
  info: { className: 'bg-bg-info-subtle text-text-info', icon: 'info' },
  warning: { className: 'bg-bg-warning-subtle text-text-warning', icon: 'alert-triangle' },
  danger: { className: 'bg-bg-danger-subtle text-text-danger', icon: 'alert-triangle' },
  success: { className: 'bg-bg-success-subtle text-text-success', icon: 'check' },
};

export interface AlertProps {
  tone: AlertTone;
  children: ReactNode;
  action?: ReactNode;
  /** Page/section-level alerts use `role="alert"`; routine inline messages
   * (e.g. a saved-filter note) should pass `false` to avoid over-announcing —
   * design-system/11_ACCESSIBILITY.md §3 "role=alert reserved for page/
   * incident-level errors only." */
  assertive?: boolean;
}

/** TBOS-CMP-FEEDBACK-001 — the Banner/Alert/InlineMessage primitive (master
 * prompt §32). One component, tone-driven, never a bespoke per-screen banner. */
export function Alert({ tone, children, action, assertive = false }: AlertProps) {
  const config = TONE_CONFIG[tone];
  return (
    <div role={assertive ? 'alert' : 'status'} className={cn('flex items-start gap-2 rounded-md p-3 text-body', config.className)}>
      <Icon name={config.icon} className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">{children}</div>
      {action}
    </div>
  );
}
