import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProject } from '@/lib/projects/useProject';
import { useProjectLookups } from '@/lib/projects/useProjectLookups';
import { useAuth } from '@/lib/auth/AuthProvider';
import { scopeFor } from '@/lib/permissions/evaluate';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { EntityDetailHeader } from '@/components/patterns/entity-detail/EntityDetailHeader';
import { PropertyStatusBadge } from '@/components/tbos/status/PropertyStatusBadge';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { ConfirmationDialog } from '@/components/patterns/feedback/ConfirmationDialog';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { Select } from '@/components/ui/Select';
import { MetricWithExplanation } from '@/components/tbos/data/MetricWithExplanation';
import { ActivityTimeline } from '@/components/tbos/activity/ActivityTimeline';
import { PermissionGate } from '@/components/tbos/permissions/PermissionGate';
import { EmptyState } from '@/components/feedback/EmptyState';
import { NoPermissionState } from '@/components/feedback/NoPermissionState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPriceSar, formatDate, PROPERTY_STATUS_KEY } from '@/features/properties/propertyFormat';
import { projectLifecycleMessage } from '@/features/projects/lifecycle';
import type { ComplianceRequirementStatus, PropertyMediaStatus, PropertyStatus } from '@/types/entities';
import type { StatusMeaning } from '@/types/status';
import type { TranslationKey } from '@/lib/i18n/dictionaries';

const COMPLIANCE_MEANING: Record<ComplianceRequirementStatus, StatusMeaning> = {
  missing: 'neutral',
  pending_verification: 'info',
  verified: 'success',
  expiring: 'warning',
  expired: 'danger',
};
const COMPLIANCE_KEY: Record<ComplianceRequirementStatus, TranslationKey> = {
  missing: 'propertyDetail.compliance.requirement.missing',
  pending_verification: 'propertyDetail.compliance.requirement.pending_verification',
  verified: 'propertyDetail.compliance.requirement.verified',
  expiring: 'propertyDetail.compliance.requirement.expiring',
  expired: 'propertyDetail.compliance.requirement.expired',
};
const MEDIA_MEANING: Record<PropertyMediaStatus, StatusMeaning> = {
  missing: 'neutral',
  uploading: 'info',
  uploaded: 'info',
  processing: 'info',
  approved: 'success',
  rejected: 'danger',
};
const MEDIA_KEY: Record<PropertyMediaStatus, TranslationKey> = {
  missing: 'propertyDetail.media.status.missing',
  uploading: 'propertyDetail.media.status.uploading',
  uploaded: 'propertyDetail.media.status.uploaded',
  processing: 'propertyDetail.media.status.processing',
  approved: 'propertyDetail.media.status.approved',
  rejected: 'propertyDetail.media.status.rejected',
};
const UNIT_STATUS_OPTIONS: PropertyStatus[] = ['draft', 'pending_compliance', 'active', 'expiring', 'expired', 'sold_rented', 'archived'];

/**
 * PROJ-02 — Project Detail (tbos-blueprint/04_SCREEN_INVENTORY.md: "single
 * source of truth for a project and its units"). Mirrors PROP-02's exact tab
 * anatomy (Overview/Media/Compliance/Performance/History — the same
 * component-mapping row, screenComponentMap.ts). Units render on the
 * Overview tab as a list, opened for add/edit in a Slide-over Panel (Drawer)
 * — no separate Unit-detail screen exists anywhere in the source (confirmed
 * absent from 04_SCREEN_INVENTORY.md), an inferred-but-consistent reading,
 * not a literal citation.
 *
 * Action set is intentionally smaller than PROP-02's: only Publish/Archive
 * are implemented (no Resubmit/Renew/MarkSoldRented/Reassign — no seed
 * Project currently reaches Rejected/Expiring/Sold-Rented, and `projects.
 * delete` has no permission key in permissionRegistry.ts to gate a Reassign
 * action against). Deferred, not silently dropped — see the phase report.
 */
export function ProjectDetailScreen() {
  const { projectId = '' } = useParams();
  const { project, isLoading, error, compliance, media, activities, performance, units, publish, archive, resolveComplianceRequirement, addUnit, updateUnitStatus, updateUnitPrice } =
    useProject(projectId);
  const { owners, teamMembers } = useProjectLookups();
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  const [archiveOpen, setArchiveOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState<string | null>(null);
  const [resolveRef, setResolveRef] = useState('');
  const [unitDrawerOpen, setUnitDrawerOpen] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [unitFloorPlan, setUnitFloorPlan] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [unitStatus, setUnitStatus] = useState<PropertyStatus>('active');

  if (isLoading) {
    return (
      <div className="mx-auto max-w-content space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) return <ErrorState error={error} />;
  if (!project) return <ErrorState error={{ code: 'not_found', message: 'This project could not be found.' }} />;

  // Record-level scope check — the exact pattern every Detail screen uses
  // since the Phase 8 P0 cross-agency finding.
  const sameAgency = project.agencyId === user?.agencyId;
  const ownScopeOnly = scopeFor(user?.activeRole ?? null, 'projects.view') === 'own';
  const canViewThisProject = sameAgency && (!ownScopeOnly || project.brokerId === user?.id);
  if (!canViewThisProject) return <NoPermissionState />;

  const owner = owners.find((o) => o.id === project.ownerId);
  const broker = teamMembers.find((m) => m.id === project.brokerId);
  const message = projectLifecycleMessage(project, locale);

  const openAddUnit = () => {
    setEditingUnitId(null);
    setUnitFloorPlan('');
    setUnitPrice('');
    setUnitStatus('active');
    setUnitDrawerOpen(true);
  };

  const openEditUnit = (unitId: string) => {
    const unit = units.find((u) => u.id === unitId);
    if (!unit) return;
    setEditingUnitId(unitId);
    setUnitFloorPlan(unit.floorPlan);
    setUnitPrice(String(unit.priceSar));
    setUnitStatus(unit.status);
    setUnitDrawerOpen(true);
  };

  const overviewTab = (
    <div className="flex flex-col gap-4">
      {message && <Alert tone={project.status === 'rejected' || project.status === 'expired' ? 'danger' : project.status === 'pending_compliance' || project.status === 'expiring' ? 'warning' : 'neutral'}>{message}</Alert>}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-h3 text-text-primary">{t('projectDetail.section.units')}</h2>
          <PermissionGate permission="projects.edit" mode="disable">
            <Button size="sm" variant="secondary" onClick={openAddUnit}>
              {t('projectDetail.action.addUnit')}
            </Button>
          </PermissionGate>
        </div>
        {units.length === 0 ? (
          <EmptyState title={t('projectDetail.units.empty.title')} body={t('projectDetail.units.empty.body')} />
        ) : (
          <ul className="flex flex-col gap-2">
            {units.map((unit) => (
              <li key={unit.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3">
                <div>
                  <p className="font-semibold text-text-primary">{unit.floorPlan}</p>
                  <p className="text-caption text-text-secondary">{formatPriceSar(unit.priceSar, locale)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <PropertyStatusBadge status={unit.status} />
                  <PermissionGate permission="projects.edit" mode="disable">
                    <Button size="sm" variant="secondary" onClick={() => openEditUnit(unit.id)}>
                      {t('projectDetail.action.editUnit')}
                    </Button>
                  </PermissionGate>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  const complianceTab = (
    <div className="flex flex-col gap-3">
      {compliance.every((r) => r.status === 'verified') ? (
        <Alert tone="success">{t('propertyDetail.compliance.allVerified')}</Alert>
      ) : (
        (project.status === 'pending_compliance' || project.status === 'rejected') && <Alert tone="warning">{t('propertyDetail.compliance.blockedTitle')}</Alert>
      )}
      <ul className="flex flex-col gap-2">
        {compliance.map((req) => (
          <li key={req.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3">
            <div>
              <p className="font-semibold text-text-primary">{req.name}</p>
              {req.referenceNumber && <p className="text-caption text-text-secondary">{req.referenceNumber}</p>}
              {req.expiryDate && <p className="text-caption text-text-muted">{formatDate(req.expiryDate, locale)}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={COMPLIANCE_MEANING[req.status]}>{t(COMPLIANCE_KEY[req.status])}</Badge>
              {req.status !== 'verified' && (
                <PermissionGate permission="projects.edit" mode="disable">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setResolveOpen(req.id);
                      setResolveRef('');
                    }}
                  >
                    {t('propertyDetail.action.viewCompliance')}
                  </Button>
                </PermissionGate>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  const mediaTab = (
    <div>
      {media.length === 0 ? (
        <p className="text-body text-text-muted">{t('propertyDetail.media.empty')}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 tablet:grid-cols-4">
          {media.map((item) => (
            <div key={item.id} className="flex flex-col gap-2 rounded-md border border-border p-3">
              <div className="flex h-20 items-center justify-center rounded-sm bg-bg-sunken">
                <Icon name="layers" className="h-8 w-8 text-icon-muted" />
              </div>
              <Badge tone={MEDIA_MEANING[item.status]}>{t(MEDIA_KEY[item.status])}</Badge>
              <p className="truncate text-caption text-text-secondary">{item.caption}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const performanceTab = (
    <div className="grid grid-cols-1 gap-4 tablet:grid-cols-3">
      <MetricWithExplanation
        label={t('propertyDetail.performance.leadsGenerated')}
        value={String(performance?.leadsGenerated ?? 0)}
        contract={{
          why: 'How many leads have been linked to this specific project.',
          howCalculated: 'A direct count of leads whose source property is this project — never estimated.',
          whatChanged: 'Increases automatically whenever a new lead references this project.',
          recommendedAction: performance && performance.leadsGenerated === 0 ? 'Consider reviewing photos/unit pricing — zero leads on a live project is worth investigating.' : 'Keep responding quickly to leads from this project.',
          businessImpact: 'Leads generated is the clearest signal this project is doing its job.',
        }}
      />
      {performance?.daysOnMarket !== null && performance?.daysOnMarket !== undefined ? (
        <MetricWithExplanation
          label={t('propertyDetail.performance.daysOnMarket')}
          value={String(performance.daysOnMarket)}
          contract={{
            why: 'How many days this project has been live.',
            howCalculated: `Days since ${project.listedDate ? formatDate(project.listedDate, locale) : 'its listed date'}.`,
            whatChanged: 'Increases by one each day the project stays active.',
            recommendedAction: 'A project extended well beyond comparable district norms may signal overpricing.',
            businessImpact: 'Extended time-on-market measurably reduces buyer interest over time.',
          }}
        />
      ) : (
        <div className="rounded-lg border border-dashed border-border p-4 text-center">
          <p className="text-body font-semibold text-text-primary">{t('propertyDetail.performance.notEnoughData')}</p>
          <p className="mt-1 text-caption text-text-secondary">{t('propertyDetail.performance.notEnoughDataBody')}</p>
        </div>
      )}
    </div>
  );

  const historyTab = (
    <ActivityTimeline
      items={activities.map((a) => ({
        id: a.id,
        actorKind: a.actorKind,
        actorName: a.actorName,
        action: a.detail,
        timestamp: new Date(a.timestamp).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US'),
      }))}
    />
  );

  return (
    <div className="mx-auto max-w-content">
      <EntityDetailHeader
        title={project.title}
        status={<PropertyStatusBadge status={project.status} />}
        meta={[
          owner ? { icon: 'user-check', label: owner.name, onClick: () => navigate(`/owners/${owner.id}`) } : { icon: 'user-check', label: project.ownerId },
          { icon: 'user-check', label: broker?.name ?? project.brokerId },
          { icon: 'sparkles', label: `${project.district}, ${project.city}` },
        ]}
        primaryAction={
          project.status === 'draft' || project.status === 'pending_compliance' ? (
            <PermissionGate permission="projects.edit" mode="disable">
              <Button size="sm" onClick={() => publish()}>
                {t('projectDetail.action.publish')}
              </Button>
            </PermissionGate>
          ) : undefined
        }
        secondaryActions={
          project.status !== 'archived' && (
            <PermissionGate permission="projects.edit" mode="disable">
              <Button variant="danger" size="sm" onClick={() => setArchiveOpen(true)}>
                {t('propertyDetail.action.archive')}
              </Button>
            </PermissionGate>
          )
        }
      />

      <div className="mt-6">
        <Tabs
          label={t('projects.list.title')}
          tabs={[
            { id: 'overview', label: t('propertyDetail.tab.overview'), content: overviewTab },
            { id: 'media', label: t('propertyDetail.tab.media'), content: mediaTab },
            { id: 'compliance', label: t('propertyDetail.tab.compliance'), content: complianceTab },
            { id: 'performance', label: t('propertyDetail.tab.performance'), content: performanceTab },
            { id: 'history', label: t('propertyDetail.tab.history'), content: historyTab },
          ]}
        />
      </div>

      <Drawer
        open={unitDrawerOpen}
        onClose={() => setUnitDrawerOpen(false)}
        title={editingUnitId ? t('projectDetail.unitDrawer.editTitle') : t('projectDetail.unitDrawer.addTitle')}
        footer={
          <Button
            size="sm"
            onClick={() => {
              const price = Number(unitPrice);
              if (!unitFloorPlan.trim() || !price || price <= 0) return;
              if (editingUnitId) {
                updateUnitPrice({ unitId: editingUnitId, priceSar: price });
                updateUnitStatus({ unitId: editingUnitId, status: unitStatus });
              } else {
                addUnit({ floorPlan: unitFloorPlan.trim(), priceSar: price });
              }
              setUnitDrawerOpen(false);
            }}
          >
            {t('projectDetail.unitDrawer.save')}
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label={t('projectDetail.unitDrawer.floorPlan')}>{(field) => <Input {...field} value={unitFloorPlan} onChange={(e) => setUnitFloorPlan(e.target.value)} disabled={!!editingUnitId} readOnly={!!editingUnitId} />}</Field>
          <Field label={t('projectDetail.unitDrawer.price')}>{(field) => <Input {...field} type="number" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />}</Field>
          {editingUnitId && (
            <Field label={t('projectDetail.unitDrawer.status')}>
              {(field) => (
                <Select {...field} value={unitStatus} onChange={(e) => setUnitStatus(e.target.value as PropertyStatus)} options={UNIT_STATUS_OPTIONS.map((s) => ({ value: s, label: t(PROPERTY_STATUS_KEY[s]) }))} />
              )}
            </Field>
          )}
        </div>
      </Drawer>

      <Drawer
        open={!!resolveOpen}
        onClose={() => setResolveOpen(null)}
        title={t('propertyDetail.resolve.title')}
        footer={
          <Button
            size="sm"
            onClick={() => {
              if (!resolveOpen) return;
              resolveComplianceRequirement({ requirementId: resolveOpen, referenceNumber: resolveRef.trim() });
              setResolveOpen(null);
            }}
          >
            {t('propertyDetail.resolve.save')}
          </Button>
        }
      >
        <Field label={t('propertyDetail.resolve.label')}>{(field) => <Input {...field} value={resolveRef} onChange={(e) => setResolveRef(e.target.value)} />}</Field>
      </Drawer>

      <ConfirmationDialog
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        onConfirm={() => {
          archive();
          navigate('/projects');
        }}
        title={t('propertyDetail.archive.title')}
        consequence={t('propertyDetail.archive.consequence')}
        confirmLabel={t('propertyDetail.archive.confirm')}
        cancelLabel={t('propertyDetail.cancel')}
        destructive
      />
    </div>
  );
}
