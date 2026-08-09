import { describe, expect, it, beforeEach } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
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

describe('Relationship Vertical Slice — CUST-01 → CUST-02 ↔ OWN-01 → OWN-02 ↔ Marketing Requests', () => {
  beforeEach(() => {
    localStorage.clear();
    useSessionStore.setState({ status: 'unauthenticated', user: null, error: null });
  });

  describe('CUST-01 — Customers List', () => {
    it('scopes a Property Consultant to only customers reachable through their own leads', async () => {
      await loginAs('tm-reem'); // PC — owns leads for c-1, c-2, c-1-p
      await renderAt('/customers');
      expect(await screen.findByRole('heading', { level: 1, name: 'Customers' })).toBeInTheDocument();
      expect(await screen.findByText('Ahmed Al-Rashid')).toBeInTheDocument(); // c-1
      expect(screen.queryByText('Saad Al-Qahtani')).not.toBeInTheDocument(); // c-3, tm-sara's lead
      expect(screen.queryByText('Bandar Al-Otaibi')).not.toBeInTheDocument(); // c-5, tm-faisal's lead
    });

    it('gives an Agency Owner visibility across the whole agency’s customers', async () => {
      await loginAs('tm-sara'); // AO — agency-wide
      await renderAt('/customers');
      expect(await screen.findByText('Ahmed Al-Rashid')).toBeInTheDocument();
      expect(await screen.findByText('Saad Al-Qahtani')).toBeInTheDocument();
    });

    it('denies a role with no customers.view grant at the route level', async () => {
      await loginAs('tm-faisal'); // SM — no customers.* grant at all
      await renderAt('/customers');
      expect(await screen.findByText(/don't have access/i)).toBeInTheDocument();
    });
  });

  describe('CUST-02 — Customer Detail', () => {
    it('denies record-level access to a customer reachable only through a teammate’s lead', async () => {
      await loginAs('tm-reem'); // PC, c-3’s only lead (l-3) is tm-sara’s
      await renderAt('/customers/c-3');
      expect(await screen.findByText(/don't have access/i)).toBeInTheDocument();
    });

    it('denies record-level access to a customer outside the viewer’s agency, even for an agency-wide role (P0 regression)', async () => {
      // tm-sara is AO — agency-wide within agency-1, but c-4 belongs to
      // agency-2. Same class of bug fixed across Property/Owner/Customer/Lead/
      // Contract Detail during Phase 8 (see contracts.test.tsx).
      await loginAs('tm-sara');
      await renderAt('/customers/c-4');
      expect(await screen.findByText(/don't have access/i)).toBeInTheDocument();
    });

    it('renders linked leads as actionable relationships and navigates to the canonical Lead Detail', async () => {
      const user = userEvent.setup();
      await loginAs('tm-reem'); // owns c-1 (Ahmed Al-Rashid) via l-1/l-5
      await renderAt('/customers/c-1');
      expect(await screen.findByRole('heading', { level: 1, name: 'Ahmed Al-Rashid' })).toBeInTheDocument();
      expect(await screen.findByText('Villa 42, Al Nakheel')).toBeInTheDocument();

      await user.click(await screen.findByRole('button', { name: /Villa 42, Al Nakheel/ }));
      // Lead-Detail-specific content proves navigation actually happened,
      // not just that the customer's name happens to render in both places.
      expect(await screen.findByRole('button', { name: 'Change stage' })).toBeInTheDocument();
    });

    it('lets the viewer log an interaction, recorded on the relationship timeline', async () => {
      const user = userEvent.setup();
      await loginAs('tm-reem');
      await renderAt('/customers/c-1');
      expect(await screen.findByRole('heading', { level: 1, name: 'Ahmed Al-Rashid' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Log interaction' }));
      const drawer = await screen.findByRole('dialog', { name: 'Log interaction' });
      await user.type(within(drawer).getByRole('textbox'), 'Sent updated financing options.');
      await user.click(within(drawer).getByRole('button', { name: 'Save' }));

      expect(await screen.findByText(/Sent updated financing options\./)).toBeInTheDocument();
    });
  });

  describe('OWN-01 — Owners List', () => {
    it('never surfaces another agency’s owners', async () => {
      await loginAs('tm-reem'); // PC, agency-1
      await renderAt('/owners');
      expect(await screen.findByRole('heading', { level: 1, name: 'Owners' })).toBeInTheDocument();
      expect(await screen.findByText('Abdullah Al-Ghamdi')).toBeInTheDocument(); // o-1, agency-1
      expect(screen.queryByText('Huda Al-Zahrani')).not.toBeInTheDocument(); // o-4, agency-2
    });
  });

  describe('Today integration', () => {
    it('surfaces an open Marketing Request as a Relationship recommendation, deep-linking to the owner', async () => {
      const user = userEvent.setup();
      await loginAs('tm-sara'); // AO — sees agency-wide recommendations
      await renderAt('/today');
      expect(await screen.findByText(/Respond to Abdullah Al-Ghamdi's marketing request/)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Open owner' }));
      expect(await screen.findByRole('heading', { level: 1, name: 'Abdullah Al-Ghamdi' })).toBeInTheDocument();
    });
  });

  describe('OWN-02 — Owner Detail', () => {
    it('denies record-level access to an owner outside the viewer’s agency', async () => {
      await loginAs('tm-reem'); // PC, agency-1 — brokers none of o-4’s (agency-2) properties
      await renderAt('/owners/o-4');
      expect(await screen.findByText(/don't have access/i)).toBeInTheDocument();
    });

    it('denies record-level access to an owner outside the viewer’s agency, even for an agency-wide role (P0 regression)', async () => {
      // tm-sara is AO — agency-wide within agency-1, but o-4 belongs to
      // agency-2. Same class of bug fixed across Property/Owner/Customer/Lead/
      // Contract Detail during Phase 8 (see contracts.test.tsx).
      await loginAs('tm-sara');
      await renderAt('/owners/o-4');
      expect(await screen.findByText(/don't have access/i)).toBeInTheDocument();
    });

    it('shows every linked property via the authoritative FK, including one the stored array had drifted on (P1-3 regression)', async () => {
      await loginAs('tm-sara'); // AO — agency-wide
      await renderAt('/owners/o-1');
      expect(await screen.findByRole('heading', { level: 1, name: 'Abdullah Al-Ghamdi' })).toBeInTheDocument();
      expect(await screen.findByText('Villa 42, Al Nakheel')).toBeInTheDocument(); // p-101
      expect(screen.getByText('Apartment 7B, Al Malqa')).toBeInTheDocument(); // p-102
      // p-107 was missing from o-1.linkedPropertyIds before the P1-3 fix —
      // only reachable now because it's derived from Property.ownerId.
      expect(screen.getByText('Apartment 2C, Al Nakheel')).toBeInTheDocument(); // p-107
    });

    it('lets the viewer respond to an open Marketing Request, moving it toward Won/Lost', async () => {
      const user = userEvent.setup();
      await loginAs('tm-sara'); // AO — marketing_requests.respond at agency scope
      await renderAt('/owners/o-1');
      expect(await screen.findByRole('heading', { level: 1, name: 'Abdullah Al-Ghamdi' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Respond' }));

      await user.click(screen.getByRole('tab', { name: 'Marketing Requests' }));
      const row = (await screen.findByText(/Villa 42, Al Nakheel — repaint/)).closest('li')!;
      expect(await within(row).findByText('In Progress')).toBeInTheDocument();
      expect(within(row).getByRole('button', { name: 'Mark Won' })).toBeInTheDocument();
    });
  });

  describe('Cross-entity navigation', () => {
    it('Property Detail links its Owner to the canonical Owner Detail screen', async () => {
      const user = userEvent.setup();
      await loginAs('tm-sara'); // AO
      await renderAt('/properties/p-103'); // owned by o-2, Mona Al-Subaie
      expect(await screen.findByText('Office Suite 12, Olaya')).toBeInTheDocument();

      await user.click(await screen.findByRole('button', { name: 'Mona Al-Subaie' }));
      // Owner-Detail-specific content (her phone number, never shown on
      // Property Detail) proves navigation actually happened.
      expect(await screen.findByText('+966501110002')).toBeInTheDocument();
    });

    it('Lead Detail links its Customer to the canonical Customer Detail screen', async () => {
      const user = userEvent.setup();
      await loginAs('tm-reem'); // owns l-2 (Fatimah Al-Otaibi / c-2)
      await renderAt('/leads/l-2');
      expect(await screen.findByRole('button', { name: 'Fatimah Al-Otaibi' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Fatimah Al-Otaibi' }));
      // Customer-Detail-specific content proves navigation actually happened,
      // not just that the same name renders on both screens.
      expect(await screen.findByRole('button', { name: 'Log interaction' })).toBeInTheDocument();
    });
  });
});
