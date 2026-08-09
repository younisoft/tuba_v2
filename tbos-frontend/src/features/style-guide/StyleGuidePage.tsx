import { useState, type ReactNode } from 'react';
import { useThemeStore } from '@/state/theme.store';
import { useLocaleStore } from '@/state/locale.store';
import { COMPONENT_REGISTRY } from '@/registry/components/componentRegistry';
import { validateComponentRegistry } from '@/registry/components/validateComponentRegistry';

import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Radio } from '@/components/ui/Radio';
import { Avatar } from '@/components/ui/Avatar';
import { Divider } from '@/components/ui/Divider';
import { Progress } from '@/components/ui/Progress';
import { Tooltip } from '@/components/ui/Tooltip';
import { Popover } from '@/components/ui/Popover';
import { Dialog } from '@/components/ui/Dialog';
import { Drawer } from '@/components/ui/Drawer';
import { Dropdown } from '@/components/ui/Dropdown';
import { Tabs } from '@/components/ui/Tabs';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { Spinner } from '@/components/ui/Spinner';

import { StatusBadge } from '@/components/tbos/status/StatusBadge';
import { PropertyStatusBadge } from '@/components/tbos/status/PropertyStatusBadge';
import { LeadStageBadge } from '@/components/tbos/lead/LeadStageBadge';
import { MetricCard } from '@/components/tbos/data/MetricCard';
import { QuotaBalanceMeter } from '@/components/tbos/data/QuotaBalanceMeter';
import { EntityAvatar } from '@/components/tbos/entity/EntityAvatar';
import { EntityCard } from '@/components/tbos/entity/EntityCard';
import { AIConfidence } from '@/components/tbos/ai/AIConfidence';
import { AISuggestion } from '@/components/tbos/ai/AISuggestion';
import { AIActionBar } from '@/components/tbos/ai/AIActionBar';
import { AIInsight } from '@/components/tbos/ai/AIInsight';
import { ComplianceChecklist } from '@/components/tbos/compliance/ComplianceChecklist';
import { PermissionGate } from '@/components/tbos/permissions/PermissionGate';
import { ActivityTimeline } from '@/components/tbos/activity/ActivityTimeline';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { RestrictedState } from '@/components/feedback/RestrictedState';
import { OfflineState } from '@/components/feedback/OfflineState';

import { DataTable, type DataTableColumn } from '@/components/patterns/data-table/DataTable';
import { FilterBar } from '@/components/patterns/filters/FilterBar';
import { KanbanBoard } from '@/components/patterns/kanban/KanbanBoard';
import { EntityDetailHeader } from '@/components/patterns/entity-detail/EntityDetailHeader';
import { ConfirmationDialog } from '@/components/patterns/feedback/ConfirmationDialog';
import { BulkActionBar } from '@/components/patterns/feedback/BulkActionBar';
import { FormWizard } from '@/components/patterns/forms/FormWizard';

const DEMO_PROPERTIES = [
  { id: 'p-1', title: 'Villa 42, Al Nakheel', district: 'Al Nakheel', price: 2_300_000, status: 'active' as const },
  { id: 'p-2', title: 'Apartment 7B, Al Malqa', district: 'Al Malqa', price: 1_650_000, status: 'expiring' as const },
  { id: 'p-3', title: 'Office Suite 12, Olaya', district: 'Olaya', price: 3_100_000, status: 'pending_compliance' as const },
];

function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-b border-border pb-10 pt-10 first:pt-0">
      <h2 className="text-h1 text-text-primary">{title}</h2>
      {description && <p className="mt-1 max-w-2xl text-body text-text-secondary">{description}</p>}
      <div className="mt-6 flex flex-col gap-6">{children}</div>
    </section>
  );
}

function Example({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-label text-text-muted">{label}</p>
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-border p-4">{children}</div>
    </div>
  );
}

const NAV_SECTIONS = [
  ['primitives', 'Primitives'],
  ['tbos', 'TBOS Components'],
  ['patterns', 'Product Patterns'],
  ['registry', 'Registry'],
] as const;

/**
 * The Component Library's development environment (master prompt §42) — not
 * Storybook (avoiding a new build-tool dependency for a foundation-scale
 * library), an internal route instead. Every section here uses the app's real
 * ThemeProvider/LocaleProvider state, so the Light/Dark and EN/AR toggles at
 * the top re-render every example live — no separate screenshot pass needed
 * to verify a component in all four combinations.
 */
export function StyleGuidePage() {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [wizardStep, setWizardStep] = useState(0);
  const [search, setSearch] = useState('');

  const registryCheck = validateComponentRegistry();

  const columns: DataTableColumn<(typeof DEMO_PROPERTIES)[number]>[] = [
    { id: 'title', header: 'Property', render: (r) => r.title },
    { id: 'district', header: 'District', render: (r) => r.district },
    { id: 'price', header: 'Price', align: 'end', render: (r) => `${r.price.toLocaleString()} SAR` },
    { id: 'status', header: 'Status', render: (r) => <PropertyStatusBadge status={r.status} /> },
  ];

  return (
    <div className="flex min-h-dvh">
      <nav className="sticky top-0 hidden h-dvh w-56 shrink-0 overflow-y-auto border-e border-border bg-bg-surface p-4 tablet:block">
        <h1 className="mb-4 text-h3 text-text-primary">TBOS Components</h1>
        <ul className="flex flex-col gap-1">
          {NAV_SECTIONS.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="block rounded-md px-2 py-1.5 text-body text-text-secondary hover:bg-bg-sunken hover:text-text-primary">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0 flex-1 overflow-x-hidden px-6 py-6 desktop:px-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-bg-surface p-4">
          <div>
            <h1 className="text-h2 text-text-primary">TBOS Component Library</h1>
            <p className="text-caption text-text-secondary">
              {COMPONENT_REGISTRY.length} registered components — registry {registryCheck.valid ? 'valid' : `INVALID (${registryCheck.errors.length} errors, see console)`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setPreference(preference === 'dark' ? 'light' : 'dark')}>
              Theme: {preference}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}>
              {locale === 'en' ? 'اعرض بالعربي' : 'Show in English'}
            </Button>
          </div>
        </header>

        {/* ============ PRIMITIVES ============ */}
        <Section id="primitives" title="Primitives" description="Level 1 — generic, TBOS-styled building blocks.">
          <Example label="Button — variants">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Disabled</Button>
          </Example>
          <Example label="IconButton + Tooltip">
            <IconButton icon="bell" label="Notifications" />
            <Tooltip content="Shows on hover and keyboard focus">
              <IconButton icon="info" label="Info" />
            </Tooltip>
          </Example>
          <Example label="Badge — tones">
            <Badge tone="neutral">Neutral</Badge>
            <Badge tone="brand">Brand</Badge>
            <Badge tone="success">Success</Badge>
            <Badge tone="warning">Warning</Badge>
            <Badge tone="danger">Danger</Badge>
            <Badge tone="info">Info</Badge>
            <Badge tone="ai">AI</Badge>
          </Example>
          <Example label="Form controls">
            <div className="grid w-full max-w-sm gap-4">
              <Field label="Email" hint="We'll never share this">
                {(p) => <Input type="email" placeholder="you@agency.sa" {...p} />}
              </Field>
              <Field label="Notes">{(p) => <Textarea placeholder="Optional notes…" {...p} />}</Field>
              <Field label="District">{(p) => <Select placeholder="Choose a district" options={[{ value: 'al-nakheel', label: 'Al Nakheel' }, { value: 'olaya', label: 'Olaya' }]} {...p} />}</Field>
              <Checkbox label="I agree to the terms" />
              <Radio name="demo-radio" label="Option A" defaultChecked />
              <Radio name="demo-radio" label="Option B" />
              <Switch checked={search.length > 0} onChange={(v) => setSearch(v ? 'on' : '')} label="Auto-save" />
            </div>
          </Example>
          <Example label="Avatar sizes + Divider">
            <Avatar name="Sara Al-Otaibi" size="sm" />
            <Avatar name="Sara Al-Otaibi" size="md" />
            <Avatar name="Sara Al-Otaibi" size="lg" />
            <Avatar name="Sara Al-Otaibi" size="xl" />
            <Divider orientation="vertical" className="h-8" />
            <Progress value={62} label="Quota used" tone="warning" className="w-40" />
          </Example>
          <Example label="Overlays">
            <Popover label="Example popover" trigger={({ toggle }) => <Button size="sm" variant="secondary" onClick={toggle}>Open Popover</Button>}>
              <p className="text-body text-text-primary">Interactive popover content.</p>
            </Popover>
            <Button size="sm" variant="secondary" onClick={() => setDialogOpen(true)}>Open Dialog</Button>
            <Button size="sm" variant="secondary" onClick={() => setDrawerOpen(true)}>Open Drawer</Button>
            <Dropdown
              label="Example menu"
              trigger={({ toggle }) => <Button size="sm" variant="secondary" onClick={toggle}>Open Dropdown</Button>}
              items={[
                { id: 'a', label: 'Edit', icon: 'settings', onSelect: () => {} },
                { id: 'b', label: 'Delete', icon: 'x', danger: true, onSelect: () => {} },
              ]}
            />
          </Example>
          <Example label="Tabs">
            <Tabs
              label="Example tabs"
              tabs={[
                { id: 'overview', label: 'Overview', content: <p className="text-body text-text-secondary">Overview content.</p> },
                { id: 'media', label: 'Media', content: <p className="text-body text-text-secondary">Media content.</p> },
                { id: 'compliance', label: 'Compliance', content: <p className="text-body text-text-secondary">Compliance content.</p>, disabledReason: 'Requires Operations Manager scope' },
              ]}
            />
          </Example>
          <Example label="Alert tones">
            <div className="flex w-full flex-col gap-2">
              <Alert tone="info">Informational message.</Alert>
              <Alert tone="warning">Warning message.</Alert>
              <Alert tone="danger" assertive>
                Error message (assertive).
              </Alert>
              <Alert tone="success">Success message.</Alert>
            </div>
          </Example>
          <Example label="Loading">
            <Skeleton className="h-8 w-32" />
            <Spinner />
          </Example>
        </Section>

        {/* ============ TBOS COMPONENTS ============ */}
        <Section id="tbos" title="TBOS Components" description="Level 2 — recurring TBOS concepts, one component per-module state map.">
          <Example label="StatusBadge — five meanings">
            <StatusBadge label="Draft" meaning="neutral" />
            <StatusBadge label="Pending" meaning="info" />
            <StatusBadge label="Expiring" meaning="warning" />
            <StatusBadge label="Active" meaning="success" />
            <StatusBadge label="Expired" meaning="danger" />
          </Example>
          <Example label="Module-specific status wrappers">
            <PropertyStatusBadge status="active" />
            <PropertyStatusBadge status="sold_rented" />
            <LeadStageBadge stage="negotiating" />
            <LeadStageBadge stage="won" />
          </Example>
          <Example label="MetricCard states">
            <MetricCard label="Active Listings" value="24" delta={{ value: '12%', direction: 'up' }} asOf="2 min ago" />
            <MetricCard label="Loading" value="" state="loading" />
            <MetricCard label="Error" value="" state="error" />
          </Example>
          <Example label="QuotaBalanceMeter">
            <div className="w-full max-w-sm">
              <QuotaBalanceMeter label="Listing quota" used={34} total={50} />
            </div>
          </Example>
          <Example label="EntityAvatar — person vs. record">
            <EntityAvatar kind="person" name="Reem Al-Dosari" />
            <EntityAvatar kind="record" icon="building" />
          </Example>
          <Example label="EntityCard">
            <EntityCard
              avatar={{ kind: 'record', icon: 'building' }}
              title="Villa 42, Al Nakheel"
              subtitle="Al Nakheel, Riyadh"
              meta={[{ icon: 'banknote', label: '2,300,000 SAR' }]}
              status={<PropertyStatusBadge status="active" />}
              onClick={() => {}}
              className="max-w-sm"
            />
          </Example>
          <Example label="AI components">
            <div className="flex w-full max-w-md flex-col gap-3">
              <AIConfidence confidence="high" />
              <AIInsight text="Response time is trending down 12% this week — 3 leads answered within the hour." />
              <AISuggestion confidence="medium" actions={<AIActionBar onAccept={() => {}} onRegenerate={() => {}} onDiscard={() => {}} />}>
                A well-maintained villa in a sought-after district, offering generous living space and easy access to the city centre.
              </AISuggestion>
            </div>
          </Example>
          <Example label="ComplianceChecklist">
            <ComplianceChecklist
              items={[
                { id: '1', requirement: 'REGA ad license uploaded', status: 'complete' },
                { id: '2', requirement: 'FAL brokerage certificate valid', status: 'incomplete' },
                { id: '3', requirement: 'Nafath identity verification', status: 'blocked', blockedReason: 'Name mismatch with national ID record' },
              ]}
            />
          </Example>
          <Example label="PermissionGate — hide vs. disable">
            <PermissionGate permission="settings.roles.manage" mode="hide" fallback={<span className="text-caption text-text-muted">(hidden — no permission)</span>}>
              <Button size="sm">Manage Roles</Button>
            </PermissionGate>
            <PermissionGate permission="settings.roles.manage" mode="disable">
              <Button size="sm">Manage Roles (disabled if unauthorized)</Button>
            </PermissionGate>
          </Example>
          <Example label="ActivityTimeline">
            <ActivityTimeline
              items={[
                { id: '1', actorKind: 'human', actorName: 'Reem Al-Dosari', action: 'changed the price to 2,300,000 SAR', timestamp: '2 hours ago' },
                { id: '2', actorKind: 'ai', actorName: 'AI Copilot', action: 'drafted a reply to Ahmed Al-Rashid', timestamp: 'Yesterday' },
                { id: '3', actorKind: 'system', actorName: 'Automation', action: 'auto-routed a new lead to Reem', timestamp: '2 days ago' },
              ]}
            />
          </Example>
          <Example label="Universal states">
            <div className="grid w-full gap-4 tablet:grid-cols-2">
              <EmptyState title="No properties yet" body="Add your first listing to get started." primaryAction={{ label: 'Add Property', onClick: () => {} }} />
              <ErrorState error={{ code: 'server_error', message: 'Something went wrong on our end. Please try again.', recoveryAction: 'retry' }} onRetry={() => {}} />
              <RestrictedState reason="Publishing is paused — you've used 50 of 50 listing slots." onUpgrade={() => {}} onViewAvailable={() => {}} />
              <OfflineState asOf="10:42 AM" onRetry={() => {}} />
            </div>
          </Example>
        </Section>

        {/* ============ PRODUCT PATTERNS ============ */}
        <Section id="patterns" title="Product Patterns" description="Level 3 — reusable interaction structures composed from primitives + TBOS components.">
          <Example label="EntityDetailHeader">
            <EntityDetailHeader
              title="Villa 42, Al Nakheel"
              status={<PropertyStatusBadge status="active" />}
              meta={[{ icon: 'banknote', label: '2,300,000 SAR' }, { icon: 'building', label: 'Al Nakheel, Riyadh' }]}
              primaryAction={<Button size="sm">Edit</Button>}
              secondaryActions={<Button size="sm" variant="secondary">Archive</Button>}
            />
          </Example>
          <Example label="FilterBar">
            <FilterBar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search properties…"
              activeFilters={[{ id: 'status', label: 'Status: Active' }]}
              onRemoveFilter={() => {}}
              onClearAll={() => {}}
            />
          </Example>
          <Example label="DataTable — selectable, sortable">
            <div className="w-full">
              {selected.size > 0 && (
                <div className="mb-2">
                  <BulkActionBar selectedCount={selected.size} onClearSelection={() => setSelected(new Set())} actions={<Button size="sm" variant="secondary">Archive selected</Button>} />
                </div>
              )}
              <DataTable columns={columns} rows={DEMO_PROPERTIES} getRowId={(r) => r.id} getRowLabel={(r) => r.title} selectedIds={selected} onSelectionChange={setSelected} />
            </div>
          </Example>
          <Example label="KanbanBoard">
            <KanbanBoard
              columns={[
                { id: 'new', title: 'New', meaning: 'info', cards: [{ id: 'l1', name: 'Fatimah Al-Otaibi' }] },
                { id: 'negotiating', title: 'Negotiating', meaning: 'warning', cards: [{ id: 'l2', name: 'Ahmed Al-Rashid' }] },
                { id: 'won', title: 'Won', meaning: 'success', cards: [] },
              ]}
              getCardId={(c) => c.id}
              renderCard={(c) => <span className="text-body text-text-primary">{c.name}</span>}
              onMoveCard={() => {}}
            />
          </Example>
          <Example label="ConfirmationDialog (destructive)">
            <Button size="sm" variant="danger" onClick={() => setConfirmOpen(true)}>
              Delete Property
            </Button>
          </Example>
          <Example label="FormWizard">
            <div className="w-full max-w-lg">
              <FormWizard
                steps={[
                  { title: 'Details', content: <p className="text-body text-text-secondary">Step 1 content.</p> },
                  { title: 'Media', content: <p className="text-body text-text-secondary">Step 2 content.</p> },
                  { title: 'Review', content: <p className="text-body text-text-secondary">Step 3 content.</p> },
                ]}
                currentStep={wizardStep}
                onStepChange={setWizardStep}
                onSubmit={() => {}}
              />
            </div>
          </Example>
        </Section>

        {/* ============ REGISTRY ============ */}
        <Section id="registry" title="Component Registry" description="Every entry in registry/components/componentRegistry.ts.">
          <div className="w-full overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-caption">
              <thead>
                <tr className="border-b border-border bg-bg-sunken text-start">
                  <th scope="col" className="px-3 py-2 text-start">ID</th>
                  <th scope="col" className="px-3 py-2 text-start">Name</th>
                  <th scope="col" className="px-3 py-2 text-start">Level</th>
                  <th scope="col" className="px-3 py-2 text-start">Category</th>
                  <th scope="col" className="px-3 py-2 text-start">Status</th>
                </tr>
              </thead>
              <tbody>
                {COMPONENT_REGISTRY.map((c) => (
                  <tr key={c.componentId} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-1.5 font-mono text-text-muted">{c.componentId}</td>
                    <td className="px-3 py-1.5 text-text-primary">{c.name}</td>
                    <td className="px-3 py-1.5 text-text-secondary">{c.level}</td>
                    <td className="px-3 py-1.5 text-text-secondary">{c.category}</td>
                    <td className="px-3 py-1.5">
                      <Badge tone={c.status === 'ready' ? 'success' : 'warning'}>{c.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Example Dialog" footer={<Button size="sm" onClick={() => setDialogOpen(false)}>Close</Button>}>
        <p className="text-body text-text-primary">Generic modal content.</p>
      </Dialog>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Example Drawer" onOpenFullRecord={() => setDrawerOpen(false)}>
        <p className="text-body text-text-primary">Slide-over panel content.</p>
      </Drawer>
      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {}}
        title="Delete Property"
        consequence="This will permanently delete Villa 42, Al Nakheel and its 2 linked leads. This can be undone within 30 days."
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
