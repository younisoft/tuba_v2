import { useRef, useState } from 'react';
import { useFocusTrap } from '@/lib/a11y/useFocusTrap';
import { Icon } from '@/components/ui/Icon';
import type { ExplainabilityContract } from '@/types/explainability';

interface ExplainabilityPopoverProps {
  /** Accessible name for the trigger — should name the metric/score being explained, e.g. "Why is this scored 78?" */
  triggerLabel: string;
  contract: ExplainabilityContract;
}

const ROWS: { key: keyof ExplainabilityContract; label: string }[] = [
  { key: 'why', label: 'Why' },
  { key: 'howCalculated', label: 'How calculated' },
  { key: 'whatChanged', label: 'What changed' },
  { key: 'recommendedAction', label: 'Recommended action' },
  { key: 'businessImpact', label: 'Business impact' },
];

/**
 * The one reusable surface for the Explainability five-question contract
 * (tbos-definition/14_EXPLAINABILITY_SYSTEM.md), used identically wherever a
 * metric, score, status, or AI output needs to answer it — design-system/
 * 17_COMPONENT_CATALOG.md "Explainability Popover". Triggered by a real
 * button (never hover-only, per 05_COMPONENT_MAPPING.md's accessibility rule)
 * so keyboard/touch users get equal access.
 */
export function ExplainabilityPopover({ triggerLabel, contract }: ExplainabilityPopoverProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);
  useFocusTrap(containerRef, open, close);

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={triggerLabel}
        aria-expanded={open}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-icon-muted hover:bg-bg-sunken hover:text-icon"
      >
        <Icon name="info" className="h-4 w-4" />
      </button>

      {open && (
        <div
          ref={containerRef}
          role="dialog"
          aria-label={triggerLabel}
          className="absolute start-0 top-full z-popover mt-2 w-72 rounded-lg border border-border bg-bg-surface p-3 shadow-3"
        >
          <dl className="space-y-2">
            {ROWS.map(({ key, label }) => (
              <div key={key}>
                <dt className="text-micro uppercase tracking-wide text-text-muted">{label}</dt>
                <dd className="text-caption text-text-primary">{contract[key] as string}</dd>
              </div>
            ))}
          </dl>
          {contract.knowledgeArticleId && (
            <p className="mt-2 border-t border-border pt-2 text-caption text-text-link underline">Learn more in Knowledge</p>
          )}
        </div>
      )}
    </span>
  );
}
