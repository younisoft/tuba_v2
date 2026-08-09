import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Switch } from '@/components/ui/Switch';

describe('feedback / data-state components', () => {
  it('EmptyState renders a working primary action, never a dead link', async () => {
    const onClick = vi.fn();
    render(<EmptyState title="No properties yet" body="Add your first listing." primaryAction={{ label: 'Add Property', onClick }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add Property' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('ErrorState surfaces the plain-language message as an alert, not raw error detail', () => {
    render(
      <ErrorState
        error={{ code: 'server_error', message: 'Something went wrong on our end. Please try again.', recoveryAction: 'retry' }}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong on our end');
  });

  it('Switch uses a real role="switch" with aria-checked, never a bare styled div', async () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} label="Email notifications" />);
    const control = screen.getByRole('switch', { name: 'Email notifications' });
    expect(control).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(control);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
