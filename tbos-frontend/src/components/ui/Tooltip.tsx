import { useId, useState, type ReactElement, cloneElement } from 'react';
import { cn } from '@/lib/cn';

export interface TooltipProps {
  content: string;
  children: ReactElement<{ 'aria-describedby'?: string }>;
  side?: 'top' | 'bottom';
}

/**
 * TBOS-CMP-OVERLAY-001 — non-interactive supplementary text only (a disabled
 * Tab Group tab's reason, a collapsed Rail Nav item's label). Never the sole
 * carrier of information a user needs to act (design-system/12_COMPONENT_GUIDELINES.md
 * §5 Confidence Indicator rule generalizes here) — if the content is
 * interactive or essential, use Popover instead. Shows on hover *and* keyboard
 * focus, never hover-only.
 */
export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)} onFocus={() => setVisible(true)} onBlur={() => setVisible(false)}>
      {cloneElement(children, { 'aria-describedby': visible ? id : undefined })}
      {visible && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            'pointer-events-none absolute start-1/2 z-tooltip w-max max-w-56 -translate-x-1/2 rounded-sm bg-slate-900 px-2 py-1 text-caption text-slate-50 shadow-2 rtl:translate-x-1/2',
            side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
