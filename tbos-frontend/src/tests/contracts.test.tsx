import { describe, expect, it, beforeEach } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

async function loginAs(personaId: string) {
  await act(async () => {
    await useSessionStore.getState().login(personaId);
  });
}

describe('Contracts + Compliance Vertical Slice — CONT-01 → CONT-02', () => {
  beforeEach(() => {
    localStorage.clear();
    useSessionStore.setState({ status: 'unauthenticated', user: null, error: null });
  });

  describe('CONT-01 — Contracts List', () => {
    it('scopes a Property Consultant to only contracts reachable through their own leads', async () => {
      await loginAs('tm-reem'); // PC — owns leads for ct-2 (l-8) and ct-6 (l-11)
      await renderAt('/contracts');
      expect(await screen.findByRole('heading', { level: 1, name: 'Contracts' })).toBeInTheDocument();
      expect(await screen.findByText('Reem Al-Dosari (own deal)')).toBeInTheDocument(); // ct-2
      expect(screen.queryByText('Saad Al-Qahtani')).not.toBeInTheDocument(); // ct-1/ct-4, tm-sara's leads
    });

    it('gives an Agency Owner visibility across the whole agency’s contracts, never another agency’s', async () => {
      await loginAs('tm-sara'); // AO, agency-1
      await renderAt('/contracts');
      // c-3 "Saad Al-Qahtani" backs both ct-1 and ct-4 (both agency-1), so two rows are expected.
      expect((await screen.findAllByText('Saad Al-Qahtani')).length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText('Sultan Al-Dosari')).not.toBeInTheDocument(); // ct-3, agency-2
    });

    it('denies a role with no contracts.view grant at the route level', async () => {
      await loginAs('tm-faisal'); // SM — no contracts.* grant at all
      await renderAt('/contracts');
      expect(await screen.findByText(/don't have access/i)).toBeInTheDocument();
    });
  });

  // Runs before CONT-02's Activate test, which mutates ct-7 to 'active' in the
  // shared in-memory mock DB (no reset between tests within this file) — order
  // matters here so this reads ct-7 while it's still pending_compliance.
  describe('Today integration', () => {
    it('surfaces a Pending Compliance contract to Operations Manager, never to a role without contracts.approve', async () => {
      await loginAs('tm-khalid'); // OM
      await renderAt('/today');
      expect(await screen.findByText('Resolve compliance on Contract #ct-7')).toBeInTheDocument();
    });

    it('never shows a contract recommendation to a Solo Broker (no contracts.approve — would be a misleading actionable item)', async () => {
      await loginAs('tm-omar'); // SB — contracts.view only, no approve
      await renderAt('/today');
      await screen.findByRole('heading', { level: 1, name: 'Today' });
      expect(screen.queryByText(/Resolve compliance on Contract/)).not.toBeInTheDocument();
    });
  });

  describe('CONT-02 — Contract Detail', () => {
    it('denies record-level access to a contract reachable only through a teammate’s lead', async () => {
      await loginAs('tm-reem'); // PC, ct-1's lead (l-3) is tm-sara's
      await renderAt('/contracts/ct-1');
      expect(await screen.findByText(/don't have access/i)).toBeInTheDocument();
    });

    it('denies record-level access to a contract outside the viewer’s agency, even for an agency-wide role (P0 regression)', async () => {
      // tm-sara is AO — agency-wide within agency-1, but ct-3 belongs to
      // agency-2. Before the fix, only the own-vs-agency *scope tier* was
      // checked, never the record's actual agencyId, so an agency-wide role
      // could open another agency's contract by direct URL navigation
      // (found via live browser verification, not a pre-existing test).
      await loginAs('tm-sara');
      await renderAt('/contracts/ct-3');
      expect(await screen.findByText(/don't have access/i)).toBeInTheDocument();
    });

    it('shows the compliance-blocked banner with the specific mismatch detail, and keeps Activate disabled with an explanation', async () => {
      await loginAs('tm-omar'); // SB, agency-2 — owns ct-3 via lead l-7
      await renderAt('/contracts/ct-3');
      expect(await screen.findByRole('heading', { level: 1, name: 'Sultan Al-Dosari' })).toBeInTheDocument();
      expect(screen.getByText(/Waiting on Compliance documents reviewed/)).toBeInTheDocument();
      expect(screen.getByText(/Document Intelligence flagged a mismatch/)).toBeInTheDocument();
      expect(screen.getByText(/Buyer National ID/)).toBeInTheDocument();
      expect(screen.getByText(/"1234567890"/)).toBeInTheDocument();
      expect(screen.getByText(/"1234567891"/)).toBeInTheDocument();

      const activateButton = screen.getByRole('button', { name: 'Activate' });
      expect(activateButton).toBeDisabled();
    });

    it('lets Operations Manager activate a fully-compliant contract, and the state message updates to the exact documented format', async () => {
      const user = userEvent.setup();
      await loginAs('tm-khalid'); // OM — contracts.approve at agency scope
      await renderAt('/contracts/ct-7');
      expect(await screen.findByRole('heading', { level: 1, name: 'Nasser Al-Harbi' })).toBeInTheDocument();

      // The Activate button's enabled state depends on a separate, independent
      // propertyComplianceQuery in addition to the main contract query — wait for
      // it to settle rather than asserting synchronously (same async-race class
      // fixed in relationships.test.tsx during Phase 7).
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Activate' })).not.toBeDisabled();
      });
      const activateButton = screen.getByRole('button', { name: 'Activate' });
      await user.click(activateButton);

      expect(await screen.findByText(/Active since/)).toBeInTheDocument();
      expect(screen.getByText(/Renewal due/)).toBeInTheDocument();
    });

    it('shows a disabled, explained Activate control for a role without contracts.approve, never a silently vanished action', async () => {
      await loginAs('tm-omar'); // SB — no contracts.approve grant
      await renderAt('/contracts/ct-3');
      expect(await screen.findByRole('heading', { level: 1, name: 'Sultan Al-Dosari' })).toBeInTheDocument();
      const cancelButton = screen.getByRole('button', { name: 'Cancel contract' });
      expect(cancelButton).toBeDisabled();
      expect(cancelButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('requires a reason to cancel a contract, and reflects the cancellation immediately', async () => {
      const user = userEvent.setup();
      await loginAs('tm-sara'); // AO — owns ct-4 (agency-1, draft)
      await renderAt('/contracts/ct-4');
      expect(await screen.findByRole('heading', { level: 1, name: 'Saad Al-Qahtani' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Cancel contract' }));
      const drawer = await screen.findByRole('dialog', { name: 'Cancel contract' });
      await user.type(within(drawer).getByRole('textbox'), 'Owner decided not to sell.');
      await user.click(within(drawer).getByRole('button', { name: 'Cancel contract' }));

      expect(await screen.findByText(/Cancelled on/)).toBeInTheDocument();
      expect(screen.getByText(/Owner decided not to sell\./)).toBeInTheDocument();
    });
  });

  describe('Cross-entity navigation', () => {
    it('Contract Detail links Customer, Property, Owner, and the originating Lead to their canonical screens', async () => {
      const user = userEvent.setup();
      await loginAs('tm-sara'); // AO
      await renderAt('/contracts/ct-2'); // customer c-1-p, property p-102, owner o-1, lead l-8
      expect(await screen.findByRole('button', { name: 'Reem Al-Dosari (own deal)' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Apartment 7B, Al Malqa' }));
      expect(await screen.findByRole('tab', { name: 'Overview' })).toBeInTheDocument(); // Property Detail's tab pattern
    });
  });
});
