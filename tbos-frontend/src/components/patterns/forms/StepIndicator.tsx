import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

export interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

/**
 * TBOS-PAT-FORM-001 — replaces a breadcrumb on Wizard/Stepper flows
 * (design-system/12_COMPONENT_GUIDELINES.md §3), e.g. "Step 2 of 4:
 * Compliance." Step change is announced to screen readers via the
 * `aria-current` move, not a separate live region (avoids double-announcing).
 */
export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <ol aria-label={`Step ${currentStep + 1} of ${steps.length}`} className="flex items-center gap-2">
      {steps.map((step, i) => {
        const isComplete = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              aria-current={isCurrent ? 'step' : undefined}
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-micro font-semibold',
                isComplete && 'bg-bg-brand text-text-on-brand',
                isCurrent && 'border-2 border-border-brand text-text-brand',
                !isComplete && !isCurrent && 'bg-bg-sunken text-text-muted',
              )}
            >
              {isComplete ? <Icon name="check" className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={cn('text-caption', isCurrent ? 'font-semibold text-text-primary' : 'text-text-muted')}>{step}</span>
            {i < steps.length - 1 && <span aria-hidden="true" className="h-px w-4 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}
