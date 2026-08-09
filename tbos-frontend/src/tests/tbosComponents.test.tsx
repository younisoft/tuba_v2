import { describe, expect, it, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/tbos/status/StatusBadge';
import { PropertyStatusBadge } from '@/components/tbos/status/PropertyStatusBadge';
import { MetricCard } from '@/components/tbos/data/MetricCard';
import { AIConfidence } from '@/components/tbos/ai/AIConfidence';
import { PermissionGate } from '@/components/tbos/permissions/PermissionGate';
import { TestProviders } from './testUtils';
import { useSessionStore } from '@/state/session.store';

describe('StatusBadge', () => {
  it('always pairs an icon with its text label — never renders color alone', () => {
    const { container } = render(<StatusBadge label="Active" meaning="success" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it("distinguishes Sold/Rented from Active with a different icon despite sharing the 'success' meaning", () => {
    const { container: activeC } = render(<PropertyStatusBadge status="active" />);
    const { container: soldC } = render(<PropertyStatusBadge status="sold_rented" />);
    expect(activeC.querySelector('svg path')?.getAttribute('d')).not.toEqual(soldC.querySelector('svg path')?.getAttribute('d'));
  });
});

describe('MetricCard', () => {
  it('renders a skeleton in loading state, never the real value', () => {
    render(<MetricCard label="Active Listings" value="24" state="loading" />);
    expect(screen.queryByText('24')).not.toBeInTheDocument();
  });

  it('degrades gracefully per-tile on error without throwing', () => {
    render(<MetricCard label="Active Listings" value="24" state="error" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Unavailable right now');
  });

  it('states the metric\'s plain-language meaning in its accessible name, not just the number', () => {
    render(<MetricCard label="Active Listings" value="24" delta={{ value: '12%', direction: 'up' }} />);
    expect(screen.getByLabelText('Active Listings: 24, up 12%')).toBeInTheDocument();
  });
});

describe('AIConfidence', () => {
  it('always shows a text label, never hidden behind hover', () => {
    render(<AIConfidence confidence="low" />);
    expect(screen.getByText(/Low confidence/)).toBeInTheDocument();
  });
});

describe('PermissionGate', () => {
  beforeEach(() => {
    localStorage.clear();
    useSessionStore.setState({ status: 'unauthenticated', user: null, error: null });
  });

  it('hides content by default when the user lacks the permission', async () => {
    await act(async () => {
      await useSessionStore.getState().login('tm-reem'); // Property Consultant
    });
    render(
      <TestProviders>
        <PermissionGate permission="settings.roles.manage">
          <button>Manage Roles</button>
        </PermissionGate>
      </TestProviders>,
    );
    expect(screen.queryByRole('button', { name: 'Manage Roles' })).not.toBeInTheDocument();
  });

  it('renders content when the user holds the permission', async () => {
    await act(async () => {
      await useSessionStore.getState().login('tm-sara'); // Agency Owner
    });
    render(
      <TestProviders>
        <PermissionGate permission="settings.roles.manage">
          <button>Manage Roles</button>
        </PermissionGate>
      </TestProviders>,
    );
    expect(screen.getByRole('button', { name: 'Manage Roles' })).toBeInTheDocument();
  });

  it('disable mode renders the control inert rather than removing it', async () => {
    await act(async () => {
      await useSessionStore.getState().login('tm-reem');
    });
    render(
      <TestProviders>
        <PermissionGate permission="settings.roles.manage" mode="disable">
          <button>Manage Roles</button>
        </PermissionGate>
      </TestProviders>,
    );
    expect(screen.getByRole('button', { name: 'Manage Roles' })).toBeDisabled();
  });
});
