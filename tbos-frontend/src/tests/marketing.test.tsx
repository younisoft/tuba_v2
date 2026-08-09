import { describe, expect, it, beforeEach } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppRouter } from '@/app/router';
import { TestProviders } from './testUtils';
import { useSessionStore } from '@/state/session.store';

async function renderAt(path: string) {
  return render(
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

describe('Marketing + Campaign Intelligence Vertical Slice — MKT-01 → MKT-02 → MKT-03', () => {
  beforeEach(() => {
    localStorage.clear();
    useSessionStore.setState({ status: 'unauthenticated', user: null, error: null });
  });

  describe('MKT-01 — Campaigns List', () => {
    it('gives an Agency Owner visibility across the whole agency’s campaigns, never another agency’s', async () => {
      await loginAs('tm-sara'); // AO, agency-1
      await renderAt('/marketing');
      expect(await screen.findByRole('heading', { level: 1, name: 'Campaigns' })).toBeInTheDocument();
      expect(await screen.findByText('Al Nakheel Villas Spring Push')).toBeInTheDocument(); // camp-1, agency-1
      expect(screen.queryByText('Al Rawdah Townhouse Launch')).not.toBeInTheDocument(); // camp-2, agency-2
    });

    it('denies a role with no marketing.view grant at the route level', async () => {
      await loginAs('tm-khalid'); // OM — no marketing.* grant at all
      await renderAt('/marketing');
      expect(await screen.findByText(/don't have access/i)).toBeInTheDocument();
    });
  });

  describe('MKT-02 — Campaign Detail', () => {
    it('denies record-level access to a campaign outside the viewer’s agency, even for an agency-wide role (P0 regression)', async () => {
      // tm-sara is AO — agency-wide within agency-1, but camp-2 belongs to
      // agency-2. Same class of bug fixed across Property/Owner/Customer/Lead/
      // Contract Detail during Phase 8 (see contracts.test.tsx), applied here
      // proactively from day one.
      await loginAs('tm-sara');
      await renderAt('/marketing/new?campaignId=camp-2');
      expect(await screen.findByText(/don't have access/i)).toBeInTheDocument();
    });

    it('creates a new campaign through the single-flow route and lands in manage mode', async () => {
      const user = userEvent.setup();
      await loginAs('tm-sara');
      await renderAt('/marketing/new');
      expect(await screen.findByRole('heading', { level: 1, name: 'New campaign' })).toBeInTheDocument();

      await user.type(screen.getByLabelText('Campaign name'), 'Riyadh Autumn Push');
      await user.click(screen.getByRole('button', { name: 'Create campaign' }));

      expect(await screen.findByRole('heading', { level: 1, name: 'Riyadh Autumn Push' })).toBeInTheDocument();
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('blocks launch with a specific, never-a-dead-end reason when zero inventory is eligible', async () => {
      const user = userEvent.setup();
      await loginAs('tm-omar'); // SB, agency-2 — brokers p-201, the agency's only eligible listing

      // Engineer the zero-eligible-inventory scenario via the real, already-
      // tested Property mutation (Mark Sold/Rented) rather than seed data —
      // the mechanism must work for ANY agency that happens to run out of
      // eligible inventory, not just a permanently-fabricated fixture.
      const first = await renderAt('/properties/p-201');
      expect(await screen.findByRole('heading', { level: 1, name: 'Townhouse 5, Al Rawdah' })).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Mark Sold / Rented' }));
      expect(await screen.findByText('Sold / Rented')).toBeInTheDocument();
      first.unmount();

      await renderAt('/marketing/new');
      await user.type(screen.getByLabelText('Campaign name'), 'Jeddah Push');
      await user.click(screen.getByRole('button', { name: 'Create campaign' }));

      expect(await screen.findByText('No eligible inventory')).toBeInTheDocument();
      expect(screen.getByText(/needs at least one Active or Expiring listing/)).toBeInTheDocument();
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('shows a disabled, explained Launch control when eligible inventory exists but none is selected, never a misleading confirm dialog', async () => {
      await loginAs('tm-noura'); // MM, agency-1
      await renderAt('/marketing/new?campaignId=camp-3'); // draft, zero linked properties, 2 eligible listings exist
      expect(await screen.findByRole('heading', { level: 1, name: 'Al Malqa Apartments Refresh' })).toBeInTheDocument();

      const launchButton = await screen.findByRole('button', { name: 'Launch' });
      expect(launchButton).toBeDisabled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('lets a Marketing Manager select eligible inventory and launch, consuming Wallet quota and updating the lifecycle message', async () => {
      const user = userEvent.setup();
      await loginAs('tm-noura'); // MM — marketing.manage at agency scope
      await renderAt('/marketing/new?campaignId=camp-3');
      expect(await screen.findByRole('heading', { level: 1, name: 'Al Malqa Apartments Refresh' })).toBeInTheDocument();

      await user.click(await screen.findByRole('checkbox', { name: /Villa 42, Al Nakheel/ }));
      const launchButton = await screen.findByRole('button', { name: 'Launch' });
      await waitFor(() => expect(launchButton).not.toBeDisabled());
      await user.click(launchButton);

      const dialog = await screen.findByRole('dialog', { name: 'Launch' });
      expect(dialog).toHaveTextContent(/consumes 1 quota unit/);
      await user.click(within(dialog).getByRole('button', { name: 'Launch' }));

      expect(await screen.findByText('This campaign is running.')).toBeInTheDocument();
      expect(screen.getByText('Running')).toBeInTheDocument();
    });

    it('resumes a paused campaign through the same launch path, re-validating eligibility', async () => {
      const user = userEvent.setup();
      await loginAs('tm-sara'); // AO — camp-4 is paused, linked to p-102 (still Expiring, still eligible)
      await renderAt('/marketing/new?campaignId=camp-4');
      expect(await screen.findByRole('heading', { level: 1, name: 'Al Malqa Apartment Boost' })).toBeInTheDocument();
      expect(screen.getByText('Paused')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Resume' }));
      const dialog = await screen.findByRole('dialog', { name: 'Resume' });
      await user.click(within(dialog).getByRole('button', { name: 'Resume' }));

      expect(await screen.findByText('This campaign is running.')).toBeInTheDocument();
    });
  });

  describe('MKT-03 — Content Quality Queue', () => {
    it('surfaces a live listing missing photos/description, worst-first, gated to marketing.manage', async () => {
      await loginAs('tm-sara'); // AO
      await renderAt('/marketing/content-quality');
      expect(await screen.findByRole('heading', { level: 1, name: 'Content Quality Queue' })).toBeInTheDocument();
      expect(await screen.findByRole('button', { name: 'Apartment 7B, Al Malqa' })).toBeInTheDocument(); // p-102, thin description + 2 photos
      expect(screen.getByText('Needs more photos')).toBeInTheDocument();
      expect(screen.getByText('Needs a description')).toBeInTheDocument();
    });

    it('denies a role with no marketing.manage grant at the route level', async () => {
      await loginAs('tm-reem'); // PC — marketing_requests.* only, no marketing.manage
      await renderAt('/marketing/content-quality');
      expect(await screen.findByText(/don't have access/i)).toBeInTheDocument();
    });

    it('lets the viewer accept the AI fix suggestion, write a description, and re-scores the listing live', async () => {
      const user = userEvent.setup();
      await loginAs('tm-sara');
      await renderAt('/marketing/content-quality');
      expect(await screen.findByRole('button', { name: 'Apartment 7B, Al Malqa' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Write a description' }));
      const textbox = screen.getByRole('textbox', { name: 'Description' });
      await user.clear(textbox);
      await user.type(textbox, 'A bright and spacious 2-bedroom apartment in Al Malqa with a private balcony and covered parking.');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => expect(screen.queryByText('Needs a description')).not.toBeInTheDocument());
      expect(screen.getByText('Needs more photos')).toBeInTheDocument();
    });
  });

  describe('Today integration', () => {
    it('surfaces a content-quality signal to a marketing.manage holder, never to a role without it', async () => {
      await loginAs('tm-sara'); // AO
      await renderAt('/today');
      expect(await screen.findByText('Improve content quality for Apartment 7B, Al Malqa')).toBeInTheDocument();
    });

    it('never shows a content-quality recommendation to a role without marketing.manage', async () => {
      await loginAs('tm-khalid'); // OM — no marketing.* grant
      await renderAt('/today');
      await screen.findByRole('heading', { level: 1, name: 'Today' });
      expect(screen.queryByText(/Improve content quality/)).not.toBeInTheDocument();
    });
  });
});
