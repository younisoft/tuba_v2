import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from './Icon';

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'ai';

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-bg-sunken text-text-secondary',
  brand: 'bg-bg-brand-subtle text-text-brand',
  success: 'bg-bg-success-subtle text-text-success',
  warning: 'bg-bg-warning-subtle text-text-warning',
  danger: 'bg-bg-danger-subtle text-text-danger',
  info: 'bg-bg-info-subtle text-text-info',
  ai: 'bg-bg-ai-subtle text-text-ai',
};

/**
 * Status/urgency is never color alone (tbos-blueprint/11_ACCESSIBILITY_BLUEPRINT.md §3)
 * — every Badge carries visible text; `icon` is decorative reinforcement, not the
 * sole signal.
 */
export function Badge({ tone = 'neutral', icon, children }: { tone?: BadgeTone; icon?: IconName; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-label font-semibold', TONE_CLASSES[tone])}>
      {icon && <Icon name={icon} className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
}
