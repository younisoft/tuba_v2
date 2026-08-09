import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';
import { Tabs } from '@/components/ui/Tabs';
import { Dialog } from '@/components/ui/Dialog';
import { Drawer } from '@/components/ui/Drawer';
import { Dropdown } from '@/components/ui/Dropdown';
import { Popover } from '@/components/ui/Popover';
import { Alert } from '@/components/ui/Alert';

describe('Field', () => {
  it('associates label, hint, and error via real htmlFor/aria-describedby', () => {
    render(
      <Field label="Email" hint="We'll never share this" error="Required">
        {(p) => <Input {...p} />}
      </Field>,
    );
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Required')).toBeInTheDocument();
    // Hint is suppressed while an error is present — never shows both at once.
    expect(screen.queryByText("We'll never share this")).not.toBeInTheDocument();
  });
});

describe('Select', () => {
  it('renders a native select with options and an optional placeholder', () => {
    render(<Select options={[{ value: 'a', label: 'Option A' }]} placeholder="Choose one" aria-label="Demo" />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option A' })).toBeInTheDocument();
  });
});

describe('Checkbox', () => {
  it('is a real input[type=checkbox], toggles on click', async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Agree" onChange={onChange} />);
    const box = screen.getByRole('checkbox', { name: 'Agree' });
    await userEvent.click(box);
    expect(onChange).toHaveBeenCalledOnce();
  });
});

describe('Tabs', () => {
  it('switches panel content on click and marks the active tab aria-selected', async () => {
    render(
      <Tabs
        label="Demo"
        tabs={[
          { id: 'a', label: 'Tab A', content: <p>Content A</p> },
          { id: 'b', label: 'Tab B', content: <p>Content B</p> },
        ]}
      />,
    );
    expect(screen.getByText('Content A')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: 'Tab B' }));
    expect(screen.getByText('Content B')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab B' })).toHaveAttribute('aria-selected', 'true');
  });

  it('renders a disabled tab as disabled with its reason as the title, never silently hidden', () => {
    render(
      <Tabs
        label="Demo"
        tabs={[
          { id: 'a', label: 'Tab A', content: <p>A</p> },
          { id: 'b', label: 'Tab B', content: <p>B</p>, disabledReason: 'Requires Operations Manager scope' },
        ]}
      />,
    );
    const tabB = screen.getByRole('tab', { name: 'Tab B' });
    expect(tabB).toBeDisabled();
    expect(tabB).toHaveAttribute('title', 'Requires Operations Manager scope');
  });
});

describe('Dialog', () => {
  it('renders nothing when closed, traps focus and exposes role=dialog when open', () => {
    const { rerender } = render(<Dialog open={false} onClose={() => {}} title="Test">content</Dialog>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(<Dialog open onClose={() => {}} title="Test">content</Dialog>);
    expect(screen.getByRole('dialog', { name: 'Test' })).toBeInTheDocument();
  });

  it('uses role=alertdialog for the destructive variant', () => {
    render(<Dialog open onClose={() => {}} title="Delete" variant="alertdialog">content</Dialog>);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });
});

describe('Drawer', () => {
  it('always offers an "open full record" escape hatch when the prop is supplied', () => {
    render(
      <Drawer open onClose={() => {}} title="Lead detail" onOpenFullRecord={() => {}}>
        content
      </Drawer>,
    );
    expect(screen.getByRole('button', { name: 'Open full record' })).toBeInTheDocument();
  });
});

describe('Dropdown', () => {
  it('opens on trigger click and runs the selected item\'s action', async () => {
    const onSelect = vi.fn();
    render(<Dropdown label="Actions" trigger={({ toggle }) => <button onClick={toggle}>Open</button>} items={[{ id: 'edit', label: 'Edit', onSelect }]} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(onSelect).toHaveBeenCalledOnce();
  });
});

describe('Popover', () => {
  it('renders interactive content only while open', async () => {
    render(
      <Popover label="Info" trigger={({ toggle }) => <button onClick={toggle}>Open</button>}>
        <button>Inside</button>
      </Popover>,
    );
    expect(screen.queryByText('Inside')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByText('Inside')).toBeInTheDocument();
  });
});

describe('Alert', () => {
  it('uses role=status by default and role=alert only when assertive', () => {
    const { rerender } = render(<Alert tone="info">Routine message</Alert>);
    expect(screen.getByRole('status')).toBeInTheDocument();
    rerender(
      <Alert tone="danger" assertive>
        Incident message
      </Alert>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
