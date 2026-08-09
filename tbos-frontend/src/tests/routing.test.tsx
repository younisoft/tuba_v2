import { describe, expect, it, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { AppRouter } from '@/app/router';
import { TestProviders } from './testUtils';
import { useSessionStore } from '@/state/session.store';

async function renderAt(path: string) {
  render(
    <TestProviders initialEntries={[path]}>
      <AppRouter />
    </TestProviders>,
  );
}

describe('routing + auth/RBAC guards', () => {
  beforeEach(() => {
    localStorage.clear();
    useSessionStore.setState({ status: 'unauthenticated', user: null, error: null });
  });

  it('redirects an unauthenticated visitor to /login', async () => {
    await renderAt('/today');
    expect(await screen.findByText(/choose a persona/i)).toBeInTheDocument();
  });

  it('lands an authenticated Sales Manager on their permitted Today screen', async () => {
    await act(async () => {
      await useSessionStore.getState().login('tm-faisal');
    });
    await renderAt('/today');
    expect(await screen.findByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument();
  });

  it('shows the No Permission state when a Property Consultant hits an Agency-Owner-only route directly', async () => {
    await act(async () => {
      await useSessionStore.getState().login('tm-reem'); // Reem is PC-only
    });
    await renderAt('/settings/roles');
    expect(await screen.findByText(/don't have access/i)).toBeInTheDocument();
  });

  it('renders the real screen when the role does hold the required permission', async () => {
    await act(async () => {
      await useSessionStore.getState().login('tm-sara'); // Sara is AO (+PC)
    });
    await renderAt('/settings/roles');
    expect(await screen.findByText('SET-02')).toBeInTheDocument();
  });

  // Platform Console boundary behavior (redirect, not a denied-in-place screen)
  // is covered in depth by tests/consoleIsolation.test.tsx.
});
