import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExplainabilityPopover } from '@/components/ai/ExplainabilityPopover';

const CONTRACT = {
  why: 'Scored 78/100 — high stated budget, fast responder.',
  howCalculated: 'Budget vs. listing price, response latency, engagement recency.',
  whatChanged: 'Up 12 points since yesterday.',
  recommendedAction: 'Call within the next 2 hours to keep momentum.',
  businessImpact: 'High-scoring leads convert 3x more often when contacted within an hour.',
};

describe('ExplainabilityPopover', () => {
  it('is closed by default and opens via a real keyboard-operable button', async () => {
    render(<ExplainabilityPopover triggerLabel="Why is this scored 78?" contract={CONTRACT} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.tab();
    await userEvent.keyboard('{Enter}');

    expect(screen.getByRole('dialog', { name: 'Why is this scored 78?' })).toBeInTheDocument();
  });

  it('answers all five Explainability questions, not just the metric value', async () => {
    render(<ExplainabilityPopover triggerLabel="Why is this scored 78?" contract={CONTRACT} />);
    await userEvent.click(screen.getByRole('button', { name: 'Why is this scored 78?' }));

    expect(screen.getByText(CONTRACT.why)).toBeInTheDocument();
    expect(screen.getByText(CONTRACT.howCalculated)).toBeInTheDocument();
    expect(screen.getByText(CONTRACT.whatChanged)).toBeInTheDocument();
    expect(screen.getByText(CONTRACT.recommendedAction)).toBeInTheDocument();
    expect(screen.getByText(CONTRACT.businessImpact)).toBeInTheDocument();
  });
});
