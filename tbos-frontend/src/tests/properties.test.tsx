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

describe('Properties Vertical Slice — PROP-01 → PROP-02 → Compliance/Media/Performance/History → Action', () => {
  beforeEach(() => {
    localStorage.clear();
    useSessionStore.setState({ status: 'unauthenticated', user: null, error: null });
  });

  describe('PROP-01 — Properties List', () => {
    it('scopes a Property Consultant to only their own listings, never a teammate’s', async () => {
      const user = userEvent.setup();
      await loginAs('tm-reem'); // PC — owns p-101, p-103, p-105, p-107
      await renderAt('/properties');
      expect(await screen.findByRole('heading', { level: 1, name: 'My Properties' })).toBeInTheDocument();
      expect(await screen.findByText('Villa 42, Al Nakheel')).toBeInTheDocument(); // p-101, reem's
      expect(screen.queryByText('Apartment 7B, Al Malqa')).not.toBeInTheDocument(); // p-102, Sara's

      await user.type(screen.getByRole('searchbox', { name: /search properties/i }), 'zzzznoresults');
      // A filtered-to-zero result is a distinct empty state from "no properties
      // exist at all" (TBOS_MY_PROPERTIES_UX_ARCHITECTURE.md Part 17) — never
      // the same generic message.
      expect(await screen.findByText('No properties match your filters')).toBeInTheDocument();
    });

    it('gives an Agency Owner visibility across the whole agency’s inventory', async () => {
      await loginAs('tm-sara'); // AO (+PC) — defaults to AO, agency-wide scope
      await renderAt('/properties');
      expect(await screen.findByText('Villa 42, Al Nakheel')).toBeInTheDocument(); // reem's
      expect(await screen.findByText('Apartment 7B, Al Malqa')).toBeInTheDocument(); // Sara's own
    });
  });

  describe('PROP-02 — Property Detail', () => {
    it('denies record-level access to a property outside a Property Consultant’s own scope', async () => {
      await loginAs('tm-reem'); // PC, does not own p-102
      await renderAt('/properties/p-102');
      expect(await screen.findByText(/don't have access/i)).toBeInTheDocument();
    });

    it('denies record-level access to a property outside the viewer’s agency, even for an agency-wide role (P0 regression)', async () => {
      // tm-sara is AO — agency-wide within agency-1, but p-201 belongs to
      // agency-2. Before the fix, record-level checks only verified the
      // own-vs-agency *scope tier*, never the record's actual agencyId, so an
      // agency-wide role could open another agency's property by direct URL
      // navigation (found via live browser verification during Phase 8).
      await loginAs('tm-sara');
      await renderAt('/properties/p-201');
      expect(await screen.findByText(/don't have access/i)).toBeInTheDocument();
    });

    it('shows the compliance-blocked banner and the specific missing requirement for a Pending Compliance listing', async () => {
      const user = userEvent.setup();
      await loginAs('tm-reem'); // owns p-103 (Office Suite 12, pending_compliance)
      await renderAt('/properties/p-103');
      expect(await screen.findByText('Office Suite 12, Olaya')).toBeInTheDocument();
      expect(screen.getByText(/waiting on compliance requirements/i)).toBeInTheDocument();

      await user.click(screen.getByRole('tab', { name: 'Compliance' }));
      expect(await screen.findByText("This listing can't go live yet")).toBeInTheDocument();
      expect(screen.getByText('REGA Ad License')).toBeInTheDocument();
      expect(within(screen.getByText('REGA Ad License').closest('li')!).getByText('Missing')).toBeInTheDocument();
    });

    it('shows a disabled, explained Reassign control for a role without properties.delete, never a silently vanished action', async () => {
      await loginAs('tm-reem'); // PC — no properties.delete grant
      await renderAt('/properties/p-101');
      expect(await screen.findByText('Villa 42, Al Nakheel')).toBeInTheDocument();
      const reassignButton = screen.getByRole('button', { name: 'Reassign' });
      expect(reassignButton).toBeDisabled();
      expect(reassignButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('lets Operations Manager (compliance-write scope) verify a requirement, moving the listing toward Active', async () => {
      const user = userEvent.setup();
      await loginAs('tm-khalid'); // OM — properties.compliance.edit at agency scope
      await renderAt('/properties/p-103');
      expect(await screen.findByText('Office Suite 12, Olaya')).toBeInTheDocument();

      await user.click(screen.getByRole('tab', { name: 'Compliance' }));
      const regaRow = (await screen.findByText('REGA Ad License')).closest('li')!;
      await user.click(within(regaRow).getByRole('button', { name: 'View compliance' }));

      const drawer = await screen.findByRole('dialog', { name: 'Verify requirement' });
      await user.type(within(drawer).getByRole('textbox'), 'REGA-AD-990001');
      await user.click(within(drawer).getByRole('button', { name: 'Mark verified' }));

      // REGA moves from Missing to Verified; FAL (still pending_verification)
      // keeps the listing blocked — resolving one requirement never silently
      // resolves the others.
      expect(await within(regaRow).findByText('Verified')).toBeInTheDocument();
      expect(screen.getByText('FAL License').closest('li')).toHaveTextContent('Pending verification');
    });

    it('archives a property with an explicit, scoped consequence and reflects it immediately in the list', async () => {
      const user = userEvent.setup();
      await loginAs('tm-sara'); // AO — owns p-104 (Draft), has properties.delete
      await renderAt('/properties/p-104');
      expect(await screen.findByText('Villa 9, Al Yasmin')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Archive' }));
      const dialog = await screen.findByRole('alertdialog', { name: 'Archive this property' });
      expect(within(dialog).getByText(/removes the listing from active inventory/i)).toBeInTheDocument();
      await user.click(within(dialog).getByRole('button', { name: 'Archive' }));

      expect(await screen.findByRole('heading', { level: 1, name: 'My Properties' })).toBeInTheDocument();
    });
  });
});
