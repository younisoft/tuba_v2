import { Icon, type IconName } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import type { StatusMeaning } from '@/types/status';

const MEANING_CLASSES: Record<StatusMeaning, string> = {
  neutral: 'bg-bg-sunken text-text-secondary',
  info: 'bg-bg-info-subtle text-text-info',
  warning: 'bg-bg-warning-subtle text-text-warning',
  success: 'bg-bg-success-subtle text-text-success',
  danger: 'bg-bg-danger-subtle text-text-danger',
};

/** One default icon per meaning — overridable so two same-meaning states (e.g.
 * Property's Active vs. Sold/Rented, both "success") stay visually distinct
 * per design-system/03_COLOR_SYSTEM.md §3's explicit Property table footnote. */
const MEANING_DEFAULT_ICON: Record<StatusMeaning, IconName> = {
  neutral: 'circle',
  info: 'clock',
  warning: 'alert-triangle',
  success: 'check',
  danger: 'x',
};

export interface StatusBadgeProps {
  /** The real state name shown to the user — "Active", "Expiring", "Won", etc.
   * Never the raw enum key (design-system/16_CONTENT_GUIDELINES.md — no leaked tokens). */
  label: string;
  meaning: StatusMeaning;
  icon?: IconName;
  size?: 'sm' | 'md';
}

/**
 * TBOS-CMP-STATUS-001 — the one Status Badge component every module's
 * lifecycle renders through (design-system/12_COMPONENT_GUIDELINES.md §2:
 * "One component, per-module state map — never a per-module badge
 * implementation"). Icon + text always paired, color is never the only
 * signal — binding accessibility rule, verified structurally here since the
 * `icon` prop can never be omitted from render (only its glyph is overridable).
 */
export function StatusBadge({ label, meaning, icon, size = 'md' }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-micro' : 'px-3 py-0.5 text-label',
        MEANING_CLASSES[meaning],
      )}
    >
      <Icon name={icon ?? MEANING_DEFAULT_ICON[meaning]} className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {label}
    </span>
  );
}
