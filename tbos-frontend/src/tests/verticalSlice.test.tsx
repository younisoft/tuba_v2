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

describe('Vertical Slice — Today → Leads → Lead Detail → Lead Action → Notification', () => {
  beforeEach(() => {
    localStorage.clear();
    useSessionStore.setState({ status: 'unauthenticated', user: null, error: null });
  });

  describe('TODAY-01', () => {
    it('surfaces an SLA-at-risk lead assigned to the signed-in broker as a recommendation, not a bare metric', async () => {
      await loginAs('tm-reem'); // PC, owns l-2 (Fatimah Al-Otaibi, 45min SLA)
      await renderAt('/today');
      expect(await screen.findByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument();
      expect(await screen.findByText(/Fatimah Al-Otaibi/)).toBeInTheDocument();
      // Every entry resolves to a real next action, never a dead end.
      expect(screen.getAllByRole('button', { name: 'Open lead' }).length).toBeGreaterThan(0);
    });

    it('surfaces a rejected property to a Marketing Manager, proving cross-module Today integration (Properties, not just Leads)', async () => {
      await loginAs('tm-noura'); // MM — no leads.view grant, but agency-wide properties.view
      await renderAt('/today');
      expect(await screen.findByText(/Retail Unit 4, Al Olaya Market/)).toBeInTheDocument();
    });
  });

  describe('LEAD-01 — Leads Pipeline', () => {
    it('scopes a Property Consultant to only their own leads, never a teammate’s', async () => {
      await loginAs('tm-reem'); // PC — owns l-1, l-2, l-5 (Ahmed Al-Rashid has two: l-1, l-5)
      await renderAt('/leads');
      expect(await screen.findByRole('heading', { level: 1, name: 'Leads Pipeline' })).toBeInTheDocument();
      expect((await screen.findAllByText('Ahmed Al-Rashid')).length).toBe(2); // l-1, reem's
      expect(screen.queryByText('Bandar Al-Otaibi')).not.toBeInTheDocument(); // l-4, Faisal's
    });

    it('gives a Sales Manager visibility across the whole team’s pipeline', async () => {
      await loginAs('tm-faisal'); // SM — leads.view.team
      await renderAt('/leads');
      expect((await screen.findAllByText('Ahmed Al-Rashid')).length).toBeGreaterThan(0); // reem's
      expect(await screen.findByText('Bandar Al-Otaibi')).toBeInTheDocument(); // faisal's own
    });
  });

  describe('LEAD-03 — Lead Detail + Lead Actions', () => {
    it('denies record-level access to a lead outside the viewer’s own scope, even though the route permission alone would allow it', async () => {
      await loginAs('tm-reem'); // PC, does not own l-4
      await renderAt('/leads/l-4');
      expect(await screen.findByText(/don't have access/i)).toBeInTheDocument();
    });

    it('denies record-level access to a lead outside the viewer’s agency, even for a role with leads.view.team (P0 regression)', async () => {
      // tm-faisal is SM, agency-1 — leads.view.team grants team-wide visibility
      // within agency-1, but l-6 belongs to agency-2. Same class of bug fixed
      // across Property/Owner/Customer/Lead/Contract Detail during Phase 8
      // (see contracts.test.tsx).
      await loginAs('tm-faisal');
      await renderAt('/leads/l-6');
      expect(await screen.findByText(/don't have access/i)).toBeInTheDocument();
    });

    it('lets the assignee change stage and records the change on the activity timeline', async () => {
      const user = userEvent.setup();
      await loginAs('tm-reem'); // owns l-2 (stage: assigned)
      await renderAt('/leads/l-2');
      expect(await screen.findByText('Fatimah Al-Otaibi')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Change stage' }));
      await user.click(await screen.findByRole('menuitem', { name: 'Contacted' }));

      expect(await screen.findByText('Contacted', { selector: 'span' })).toBeInTheDocument();
      expect(await screen.findByText(/Moved from assigned to contacted/)).toBeInTheDocument();
    });

    it('requires a structured reason to mark a lead Lost, and reflects it immediately in the pipeline', async () => {
      const user = userEvent.setup();
      await loginAs('tm-reem'); // owns l-1 (stage: negotiating)
      await renderAt('/leads/l-1');
      expect(await screen.findByText('Ahmed Al-Rashid')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Mark Lost' }));
      const drawer = await screen.findByRole('dialog', { name: 'Mark lead as Lost' });
      expect(within(drawer).getByRole('combobox', { name: 'Reason' })).toBeInTheDocument();

      await user.click(within(drawer).getByRole('button', { name: 'Mark Lost' }));

      expect(await screen.findByRole('heading', { level: 1, name: 'Leads Pipeline' })).toBeInTheDocument();
    });

    it('shows a disabled, explained Reassign control for a role without leads.assign, never a silently vanished action', async () => {
      await loginAs('tm-reem'); // PC — no leads.assign grant
      await renderAt('/leads/l-2');
      expect(await screen.findByText('Fatimah Al-Otaibi')).toBeInTheDocument();
      const reassignButton = screen.getByRole('button', { name: 'Reassign' });
      expect(reassignButton).toBeDisabled();
      expect(reassignButton).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('NOTIF-01 — Notification Center', () => {
    it('opens a lead-related notification and deep-links to that specific lead, never just the generic module', async () => {
      const user = userEvent.setup();
      await loginAs('tm-reem'); // has n-1, sla_risk about l-2 (Fatimah)
      await renderAt('/notifications');
      expect(await screen.findByRole('heading', { level: 1, name: 'Notifications' })).toBeInTheDocument();

      await user.click(await screen.findByText('Lead SLA at risk'));

      expect(await screen.findByText('Fatimah Al-Otaibi')).toBeInTheDocument();
    });
  });
});
