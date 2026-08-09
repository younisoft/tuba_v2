import { describe, expect, it, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { AppRouter } from '@/app/router';
import { TestProviders } from './testUtils';
import { useSessionStore } from '@/state/session.store';
import { PERSONA_OPTIONS, CONSOLE_PERSONA_OPTIONS } from '@/lib/auth/personas';

async function renderAt(path: string) {
  render(
    <TestProviders initialEntries={[path]}>
      <AppRouter />
    </TestProviders>,
  );
}

/**
 * Constitution Article V: Broker OS and Platform Console are "different route
 * space, different login surface, different session." These tests verify the
 * boundary holds in both directions, not just that PC-01 requires a permission.
 */
describe('Broker OS / Platform Console architectural separation', () => {
  beforeEach(() => {
    localStorage.clear();
    useSessionStore.setState({ status: 'unauthenticated', user: null, error: null });
  });

  it('the Broker OS sign-in screen never lists a platform (ADM) persona', () => {
    expect(PERSONA_OPTIONS.some((p) => p.roleCode === 'ADM')).toBe(false);
  });

  it('the Console sign-in screen only lists platform personas', () => {
    expect(CONSOLE_PERSONA_OPTIONS.every((p) => p.roleCode === 'ADM')).toBe(true);
    expect(CONSOLE_PERSONA_OPTIONS.length).toBeGreaterThan(0);
  });

  it('an unauthenticated visitor to /console lands on the Console sign-in, never the Broker OS one', async () => {
    await renderAt('/console');
    expect(await screen.findByText('Tuba Platform Console')).toBeInTheDocument();
  });

  it('an unauthenticated visitor to a Broker OS route lands on the Broker OS sign-in, never the Console one', async () => {
    await renderAt('/today');
    expect(await screen.findByText(/choose a persona/i)).toBeInTheDocument();
  });

  it('a signed-in Administrator reaches the Console and never the Broker OS shell', async () => {
    await act(async () => {
      await useSessionStore.getState().login('tm-layla'); // Layla is ADM
    });
    await renderAt('/console/moderation');
    expect(await screen.findByText('PC-01')).toBeInTheDocument();
  });

  it('a signed-in Broker OS user hitting a Console URL is bounced to the Broker OS, never shown a Console screen', async () => {
    await act(async () => {
      await useSessionStore.getState().login('tm-reem'); // Property Consultant
    });
    await renderAt('/console/moderation');
    expect(await screen.findByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument();
    expect(screen.queryByText('PC-01')).not.toBeInTheDocument();
  });

  it('a signed-in Administrator hitting a Broker OS URL is bounced to the Console, never shown a Broker OS screen', async () => {
    await act(async () => {
      await useSessionStore.getState().login('tm-layla');
    });
    await renderAt('/today');
    expect(await screen.findByText('PC-01')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1, name: 'Today' })).not.toBeInTheDocument();
  });
});
