import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table/DataTable';
import { ConfirmationDialog } from '@/components/patterns/feedback/ConfirmationDialog';
import { BulkActionBar } from '@/components/patterns/feedback/BulkActionBar';
import { FilterBar } from '@/components/patterns/filters/FilterBar';
import { FormWizard } from '@/components/patterns/forms/FormWizard';
import { KanbanBoard } from '@/components/patterns/kanban/KanbanBoard';

interface Row {
  id: string;
  name: string;
}
const ROWS: Row[] = [
  { id: '1', name: 'Villa 42' },
  { id: '2', name: 'Apartment 7B' },
];
const COLUMNS: DataTableColumn<Row>[] = [{ id: 'name', header: 'Name', render: (r) => r.name }];

describe('DataTable', () => {
  it('renders real <table>/<th scope> semantics, not a styled div grid', () => {
    render(<DataTable columns={COLUMNS} rows={ROWS} getRowId={(r) => r.id} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
  });

  it('renders the caller-supplied EmptyState instead of a bare table when rows are empty', () => {
    render(<DataTable columns={COLUMNS} rows={[]} getRowId={(r) => r.id} emptyState={{ title: 'No properties yet', body: 'Add one to get started.' }} />);
    expect(screen.getByText('No properties yet')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders ErrorState and never a table when state=error', () => {
    render(<DataTable columns={COLUMNS} rows={[]} getRowId={(r) => r.id} state="error" error={{ code: 'server_error', message: 'Could not load properties.' }} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load properties.');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('selection checkboxes are individually labeled with the record name, never just "row N"', async () => {
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        getRowId={(r) => r.id}
        getRowLabel={(r) => r.name}
        selectedIds={new Set()}
        onSelectionChange={onSelectionChange}
      />,
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Villa 42' }));
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(['1']));
    // Each row's checkbox has a distinct id — never a duplicate DOM id across rows.
    expect(screen.getByRole('checkbox', { name: 'Select Villa 42' })).toHaveAttribute('id', 'select-row-1');
    expect(screen.getByRole('checkbox', { name: 'Select Apartment 7B' })).toHaveAttribute('id', 'select-row-2');
  });
});

describe('ConfirmationDialog', () => {
  it('states the specific, scoped consequence — never a generic "Are you sure?"', () => {
    render(
      <ConfirmationDialog
        open
        onClose={() => {}}
        onConfirm={() => {}}
        title="Delete Property"
        consequence="This will remove Villa 42 and its 2 linked leads."
        destructive
      />,
    );
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('This will remove Villa 42 and its 2 linked leads.')).toBeInTheDocument();
  });

  it('calls onConfirm then onClose when the confirm button is pressed', async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(<ConfirmationDialog open onClose={onClose} onConfirm={onConfirm} title="Delete" consequence="This deletes the record." confirmLabel="Delete" />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('BulkActionBar', () => {
  it('renders nothing when nothing is selected', () => {
    const { container } = render(<BulkActionBar selectedCount={0} onClearSelection={() => {}} actions={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('announces the selection count via a live region when items are selected', () => {
    render(<BulkActionBar selectedCount={3} onClearSelection={() => {}} actions={<button>Archive</button>} />);
    expect(screen.getByText('3 selected')).toBeInTheDocument();
  });
});

describe('FilterBar', () => {
  it('renders each active filter as a removable chip and calls onRemoveFilter with its id', async () => {
    const onRemoveFilter = vi.fn();
    render(
      <FilterBar
        searchValue=""
        onSearchChange={() => {}}
        activeFilters={[{ id: 'status', label: 'Status: Active' }]}
        onRemoveFilter={onRemoveFilter}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Remove filter: Status: Active' }));
    expect(onRemoveFilter).toHaveBeenCalledWith('status');
  });
});

describe('FormWizard', () => {
  it('front-loads validity — Next is disabled until the current step reports valid', () => {
    render(
      <FormWizard
        steps={[
          { title: 'Details', content: <p>Step 1</p>, isValid: false },
          { title: 'Review', content: <p>Step 2</p> },
        ]}
        currentStep={0}
        onStepChange={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('advances to the next step on click when valid', async () => {
    const onStepChange = vi.fn();
    render(
      <FormWizard
        steps={[
          { title: 'Details', content: <p>Step 1</p> },
          { title: 'Review', content: <p>Step 2</p> },
        ]}
        currentStep={0}
        onStepChange={onStepChange}
        onSubmit={() => {}}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onStepChange).toHaveBeenCalledWith(1);
  });
});

describe('KanbanBoard', () => {
  it('gives every card a keyboard-operable "move to stage" menu, never drag-only', () => {
    render(
      <KanbanBoard
        columns={[
          { id: 'new', title: 'New', meaning: 'info', cards: [{ id: 'l1', name: 'Ahmed' }] },
          { id: 'won', title: 'Won', meaning: 'success', cards: [] },
        ]}
        getCardId={(c) => c.id}
        renderCard={(c) => <span>{c.name}</span>}
        onMoveCard={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Move to stage' })).toBeInTheDocument();
  });

  it('shows an explicit empty-column message rather than a blank column', () => {
    render(
      <KanbanBoard
        columns={[{ id: 'won', title: 'Won', meaning: 'success', cards: [] }]}
        getCardId={(c: { id: string }) => c.id}
        renderCard={() => null}
        onMoveCard={() => {}}
      />,
    );
    expect(screen.getByText(/No won leads/i)).toBeInTheDocument();
  });
});
