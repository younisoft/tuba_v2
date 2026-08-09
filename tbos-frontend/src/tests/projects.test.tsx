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

const photoFile = (name = 'villa.jpg') => new File(['fake-image-bytes'], name, { type: 'image/jpeg' });

describe('Properties/Projects Creation Wizards + Projects Vertical Slice — PROP-03, PROJ-01 → PROJ-02 → PROJ-03', () => {
  beforeEach(() => {
    localStorage.clear();
    useSessionStore.setState({ status: 'unauthenticated', user: null, error: null });
  });

  describe('PROP-03 — Create/Edit Property', () => {
    it('denies a role with no properties.create grant at the route level', async () => {
      await loginAs('tm-faisal'); // SM — no properties.* grant at all
      await renderAt('/properties/new');
      expect(await screen.findByText(/don't have access/i)).toBeInTheDocument();
    });

    it('blocks publish with a specific, never-a-dead-end reason when no photo has been uploaded, and the fix link returns to the Media step', async () => {
      const user = userEvent.setup();
      await loginAs('tm-sara'); // AO
      await renderAt('/properties/new');
      expect(await screen.findByRole('heading', { level: 1, name: 'New listing' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Next' })); // Requirements -> Details
      await user.type(screen.getByLabelText('Listing title'), 'Villa 77, Al Yasmin');
      await user.type(screen.getByLabelText('District'), 'Al Yasmin');
      await user.type(screen.getByLabelText('City'), 'Riyadh');
      await user.selectOptions(screen.getByLabelText('Owner'), 'o-1');
      await user.type(screen.getByLabelText('Price (SAR)'), '1500000');
      await user.click(screen.getByRole('button', { name: 'Next' })); // Details -> Compliance (creates the Draft)

      await user.type(await screen.findByLabelText('FAL License reference'), 'FAL-2026-00001');
      await user.type(screen.getByLabelText('REGA Ad License reference'), 'REGA-AD-000001');
      await user.click(screen.getByRole('button', { name: 'Next' })); // Compliance -> Media
      await user.click(await screen.findByRole('button', { name: 'Next' })); // Media -> Review, no photo uploaded

      expect(await screen.findByText('This listing can’t publish yet — fix the following:')).toBeInTheDocument();
      const publishButton = screen.getByRole('button', { name: 'Publish' });
      expect(publishButton).toBeDisabled();

      await user.click(screen.getByRole('button', { name: 'Add at least one photo' }));
      expect(await screen.findByLabelText('Select files')).toBeInTheDocument(); // back on the Media step
    });

    it('lets an Agency Owner complete the full wizard and publishes to Active once every requirement is met', async () => {
      const user = userEvent.setup();
      await loginAs('tm-sara');
      await renderAt('/properties/new');
      expect(await screen.findByRole('heading', { level: 1, name: 'New listing' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.type(screen.getByLabelText('Listing title'), 'Villa 77, Al Yasmin');
      await user.type(screen.getByLabelText('District'), 'Al Yasmin');
      await user.type(screen.getByLabelText('City'), 'Riyadh');
      await user.selectOptions(screen.getByLabelText('Owner'), 'o-1');
      await user.type(screen.getByLabelText('Price (SAR)'), '1500000');
      await user.click(screen.getByRole('button', { name: 'Next' }));

      await user.type(await screen.findByLabelText('FAL License reference'), 'FAL-2026-00001');
      await user.type(screen.getByLabelText('REGA Ad License reference'), 'REGA-AD-000001');
      await user.click(screen.getByRole('button', { name: 'Next' }));

      await user.upload(await screen.findByLabelText('Select files'), photoFile());
      await waitFor(() => expect(screen.getByText('Approved')).toBeInTheDocument(), { timeout: 2000 });
      await user.click(screen.getByRole('button', { name: 'Next' }));

      expect(await screen.findByText('Villa 77, Al Yasmin')).toBeInTheDocument();
      const publishButton = screen.getByRole('button', { name: 'Publish' });
      expect(publishButton).not.toBeDisabled();
      await user.click(publishButton);

      expect(await screen.findByText('Published — this listing is now Active.')).toBeInTheDocument();
    });
  });

  describe('PROJ-01 — Projects List', () => {
    it('scopes a Property Consultant to only projects they broker, never a teammate’s', async () => {
      await loginAs('tm-reem'); // PC — brokers proj-1
      await renderAt('/projects');
      expect(await screen.findByRole('heading', { level: 1, name: 'Projects' })).toBeInTheDocument();
      expect(await screen.findByText('Al Nakheel Residences')).toBeInTheDocument(); // proj-1, tm-reem
      expect(screen.queryByText('Olaya Business Tower')).not.toBeInTheDocument(); // proj-2, tm-sara's
    });

    it('gives an Agency Owner visibility across the whole agency’s projects, never another agency’s', async () => {
      await loginAs('tm-sara'); // AO, agency-1
      await renderAt('/projects');
      expect(await screen.findByText('Al Nakheel Residences')).toBeInTheDocument();
      expect(await screen.findByText('Olaya Business Tower')).toBeInTheDocument();
      expect(screen.queryByText('Al Rawdah Townhomes')).not.toBeInTheDocument(); // proj-3, agency-2
    });

    it('denies a role with no projects.view grant at the route level', async () => {
      await loginAs('tm-faisal'); // SM — no projects.* grant at all
      await renderAt('/projects');
      expect(await screen.findByText(/don't have access/i)).toBeInTheDocument();
    });
  });

  describe('PROJ-02 — Project Detail', () => {
    it('denies record-level access to a project outside the viewer’s agency, even for an agency-wide role (P0 regression)', async () => {
      // tm-sara is AO — agency-wide within agency-1, but proj-3 belongs to
      // agency-2. Applied proactively from day one, the same P0 pattern
      // fixed across Property/Owner/Customer/Lead/Contract/Campaign in
      // Phases 8-9.
      await loginAs('tm-sara');
      await renderAt('/projects/proj-3');
      expect(await screen.findByText(/don't have access/i)).toBeInTheDocument();
    });

    it('shows a project Active while one of its units is Sold/Rented, exactly matching the documented lifecycle relationship', async () => {
      await loginAs('tm-sara');
      await renderAt('/projects/proj-1');
      const heading = await screen.findByRole('heading', { level: 1, name: 'Al Nakheel Residences' });
      // Project-level status badge sits alongside the h1 in EntityDetailHeader.
      expect(within(heading.parentElement!).getByText('Active')).toBeInTheDocument();
      const soldUnitRow = (await screen.findByText('3BR')).closest('li')!;
      expect(within(soldUnitRow).getByText('Sold / Rented')).toBeInTheDocument(); // unit-level status, independently tracked
    });

    it('lets the viewer add a unit through the Slide-over Panel, reflected immediately in the Units list', async () => {
      const user = userEvent.setup();
      await loginAs('tm-sara');
      await renderAt('/projects/proj-1');
      expect(await screen.findByRole('heading', { level: 1, name: 'Al Nakheel Residences' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Add unit' }));
      const dialog = await screen.findByRole('dialog', { name: 'Add unit' });
      await user.type(within(dialog).getByLabelText('Floor plan'), '4BR Penthouse');
      await user.type(within(dialog).getByLabelText('Price (SAR)'), '2400000');
      await user.click(within(dialog).getByRole('button', { name: 'Save' }));

      expect(await screen.findByText('4BR Penthouse')).toBeInTheDocument();
    });
  });

  describe('PROJ-03 — Create/Edit Project', () => {
    it('denies a role with no projects.create grant at the route level', async () => {
      await loginAs('tm-reem'); // PC — projects.view only, no projects.create
      await renderAt('/projects/new');
      expect(await screen.findByText(/don't have access/i)).toBeInTheDocument();
    });

    it('blocks publish when zero units exist, and lets a Marketing Manager complete the full project-plus-units flow', async () => {
      const user = userEvent.setup();
      await loginAs('tm-noura'); // MM — projects.create at agency scope
      await renderAt('/projects/new');
      expect(await screen.findByRole('heading', { level: 1, name: 'New project' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Next' })); // Requirements -> Details
      await user.type(screen.getByLabelText('Listing title'), 'Al Malqa Heights');
      await user.type(screen.getByLabelText('District'), 'Al Malqa');
      await user.type(screen.getByLabelText('City'), 'Riyadh');
      await user.selectOptions(screen.getByLabelText('Owner'), 'o-1');
      await user.click(screen.getByRole('button', { name: 'Next' })); // Details -> Units (creates the Draft)

      expect(await screen.findByText('Add at least one unit — a project needs one to publish.')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Next' })); // skip straight to Compliance with zero units
      await user.type(await screen.findByLabelText('FAL License reference'), 'FAL-2026-00002');
      await user.type(screen.getByLabelText('REGA Ad License reference'), 'REGA-AD-000002');
      await user.click(screen.getByRole('button', { name: 'Next' })); // -> Media
      await user.click(await screen.findByRole('button', { name: 'Next' })); // -> Review, zero units + zero photos

      expect(await screen.findByText('This listing can’t publish yet — fix the following:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add at least one unit' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();

      // Fix both: add a unit, then a photo.
      await user.click(screen.getByRole('button', { name: 'Add at least one unit' }));
      await user.type(await screen.findByLabelText('Floor plan'), '2BR');
      await user.type(screen.getByLabelText('Price (SAR)'), '1100000');
      await user.click(screen.getByRole('button', { name: 'Add unit' }));
      expect(await screen.findByText(/2BR/)).toBeInTheDocument();

      // Step indicator: jump forward to Media (step 5) then Review (step 6).
      await user.click(screen.getByRole('button', { name: 'Next' })); // Units -> Compliance
      await user.click(screen.getByRole('button', { name: 'Next' })); // Compliance -> Media (fields already valid)
      await user.upload(await screen.findByLabelText('Select files'), photoFile());
      await waitFor(() => expect(screen.getByText('Approved')).toBeInTheDocument(), { timeout: 2000 });
      await user.click(screen.getByRole('button', { name: 'Next' })); // -> Review

      const publishButton = await screen.findByRole('button', { name: 'Publish' });
      expect(publishButton).not.toBeDisabled();
      await user.click(publishButton);

      expect(await screen.findByText('Published — this listing is now Active.')).toBeInTheDocument();
    });
  });
});
