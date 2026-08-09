import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import axe from 'axe-core';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/feedback/EmptyState';

/**
 * axe-core's jsdom support covers static/structural rules (labels, roles,
 * landmarks) but not rendering-dependent ones (real contrast needs a painted
 * layout) — see TESTING.md "Accessibility testing" for why full-page a11y
 * sweeps belong in a real-browser pass (e.g. Playwright + axe), not here.
 */
async function expectNoAxeViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
  });
  expect(results.violations).toEqual([]);
}

describe('accessibility — static structure (axe-core, jsdom)', () => {
  it('Button has no accessible-name/role violations', async () => {
    const { container } = render(<Button>Save changes</Button>);
    await expectNoAxeViolations(container);
  });

  it('Badge text content is not hidden from assistive tech', async () => {
    const { container } = render(<Badge tone="success">Active</Badge>);
    await expectNoAxeViolations(container);
  });

  it('EmptyState with actions has no violations', async () => {
    const { container } = render(
      <EmptyState title="No leads yet" body="Leads will appear here." primaryAction={{ label: 'Add Lead', onClick: () => {} }} />,
    );
    await expectNoAxeViolations(container);
  });
});
