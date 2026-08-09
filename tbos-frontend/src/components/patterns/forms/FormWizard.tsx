import type { ReactNode } from 'react';
import { StepIndicator } from './StepIndicator';
import { Button } from '@/components/ui/Button';

export interface WizardStep {
  title: string;
  content: ReactNode;
  /** A step never lets the user proceed only to reveal a hard-blocking
   * requirement later (Design Principle 4, front-loaded requirements) — the
   * caller sets this from real validation state, FormWizard just disables Next. */
  isValid?: boolean;
}

export interface FormWizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onSubmit: () => void;
  submitLabel?: string;
  saving?: boolean;
}

/**
 * TBOS-PAT-FORM-002 — the Wizard/Stepper pattern backing PROP-03/PROJ-03/
 * ONB-01. Composes StepIndicator + step body + back/next/submit row.
 */
export function FormWizard({ steps, currentStep, onStepChange, onSubmit, submitLabel = 'Publish', saving }: FormWizardProps) {
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  if (!step) return null;

  return (
    <div className="flex flex-col gap-6">
      <StepIndicator steps={steps.map((s) => s.title)} currentStep={currentStep} />
      <div>{step.content}</div>
      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button variant="secondary" size="sm" disabled={isFirst} onClick={() => onStepChange(currentStep - 1)}>
          Back
        </Button>
        {isLast ? (
          <Button size="sm" disabled={step.isValid === false || saving} onClick={onSubmit}>
            {saving ? 'Saving…' : submitLabel}
          </Button>
        ) : (
          <Button size="sm" disabled={step.isValid === false} onClick={() => onStepChange(currentStep + 1)}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
