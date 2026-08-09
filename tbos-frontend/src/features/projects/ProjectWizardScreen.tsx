import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useProjectWizard } from '@/lib/projects/useProjectWizard';
import { useProjectLookups } from '@/lib/projects/useProjectLookups';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { projectsApi } from '@/lib/api/endpoints/projects';
import { FormWizard, type WizardStep } from '@/components/patterns/forms/FormWizard';
import { MediaUploader } from '@/components/patterns/forms/MediaUploader';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { formatPriceSar } from '@/features/properties/propertyFormat';
import type { TranslationKey } from '@/lib/i18n/dictionaries';

const REQUIREMENT_ITEM_KEYS: TranslationKey[] = ['propertyWizard.requirements.license', 'propertyWizard.requirements.media', 'propertyWizard.requirements.pricing', 'propertyWizard.requirements.time'];

/**
 * PROJ-03 — Create/Edit Project (tbos-blueprint/04_SCREEN_INVENTORY.md:
 * "guided creation flow, project-plus-units"). Mirrors PROP-03's exact
 * single-flow `?projectId=` architecture and step-reorder ASSUMPTION
 * (Requirements → Details → Units → Compliance → Media → Review — one more
 * step than Property's wizard for Units, the one Projects-specific
 * completeness rule tbos-blueprint/04_SCREEN_INVENTORY.md PROJ-03 adds: "at
 * least one unit required to publish").
 */
export function ProjectWizardScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') ?? undefined;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  const { owners } = useProjectLookups();
  const { createProject, addMedia, addUnit } = useProjectWizard();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(0);
  const [title, setTitle] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [description, setDescription] = useState('');
  const [falRef, setFalRef] = useState('');
  const [regaRef, setRegaRef] = useState('');
  const [approvedPhotoCount, setApprovedPhotoCount] = useState(0);
  const [unitFloorPlan, setUnitFloorPlan] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [addedUnits, setAddedUnits] = useState<{ floorPlan: string; priceSar: number }[]>([]);
  const [publishResult, setPublishResult] = useState<'active' | 'pending_compliance' | null>(null);
  const [saving, setSaving] = useState(false);

  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const res = await projectsApi.get(projectId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!projectId,
  });
  const project = projectQuery.data;

  const unitsQuery = useQuery({
    queryKey: ['project', projectId, 'units'],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await projectsApi.units(projectId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!projectId,
  });

  const mediaQuery = useQuery({
    queryKey: ['project', projectId, 'media'],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await projectsApi.media(projectId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!projectId,
  });

  useEffect(() => {
    if (mediaQuery.data) setApprovedPhotoCount(mediaQuery.data.filter((m) => m.status === 'approved').length);
  }, [mediaQuery.data]);

  useEffect(() => {
    if (!project) return;
    setTitle(project.title);
    setDistrict(project.district);
    setCity(project.city);
    setOwnerId(project.ownerId);
    setDescription(project.description ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once when the record arrives
  }, [project?.id]);

  const totalUnitCount = (unitsQuery.data?.length ?? 0) + addedUnits.length;

  const ensureCreated = async (): Promise<string> => {
    if (projectId) return projectId;
    if (!user) throw new Error('Not authenticated');
    const created = await createProject({ agencyId: user.agencyId, brokerId: user.id, ownerId, title, district, city, description: description.trim() || undefined });
    setSearchParams({ projectId: created.id }, { replace: true });
    return created.id;
  };

  const missingItems: { key: string; label: string; step: number }[] = [];
  if (totalUnitCount === 0) missingItems.push({ key: 'units', label: t('projectWizard.missing.units'), step: 2 });
  if (approvedPhotoCount === 0) missingItems.push({ key: 'photos', label: t('propertyWizard.missing.photos'), step: 4 });

  const steps: WizardStep[] = [
    {
      title: t('propertyWizard.step.requirements'),
      isValid: true,
      content: (
        <div className="flex flex-col gap-3">
          <p className="text-body text-text-secondary">{t('propertyWizard.requirements.intro')}</p>
          <ul className="flex flex-col gap-2">
            {REQUIREMENT_ITEM_KEYS.map((key) => (
              <li key={key} className="flex items-start gap-2 rounded-md border border-border p-3 text-body text-text-primary">
                {t(key)}
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      title: t('propertyWizard.step.details'),
      isValid: title.trim().length > 0 && district.trim().length > 0 && city.trim().length > 0 && !!ownerId,
      content: (
        <div className="flex flex-col gap-4">
          <Field label={t('propertyWizard.details.title')}>{(field) => <Input {...field} value={title} onChange={(e) => setTitle(e.target.value)} />}</Field>
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
            <Field label={t('propertyWizard.details.district')}>{(field) => <Input {...field} value={district} onChange={(e) => setDistrict(e.target.value)} />}</Field>
            <Field label={t('propertyWizard.details.city')}>{(field) => <Input {...field} value={city} onChange={(e) => setCity(e.target.value)} />}</Field>
          </div>
          <Field label={t('propertyWizard.details.owner')}>
            {(field) => (
              <Select
                {...field}
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                placeholder={t('propertyWizard.details.ownerPlaceholder')}
                options={owners.map((o) => ({ value: o.id, label: o.name }))}
              />
            )}
          </Field>
          <Field label={t('propertyWizard.details.description')}>{(field) => <Textarea {...field} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />}</Field>
        </div>
      ),
    },
    {
      title: t('projectWizard.step.units'),
      isValid: true,
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-body text-text-secondary">{t('projectWizard.units.intro')}</p>
          {(unitsQuery.data ?? []).length + addedUnits.length > 0 && (
            <ul className="flex flex-col gap-2">
              {(unitsQuery.data ?? []).map((u) => (
                <li key={u.id} className="rounded-md border border-border p-3 text-body text-text-primary">
                  {u.floorPlan} — {formatPriceSar(u.priceSar, locale)}
                </li>
              ))}
              {addedUnits.map((u, i) => (
                <li key={`pending-${i}`} className="rounded-md border border-border p-3 text-body text-text-primary">
                  {u.floorPlan} — {formatPriceSar(u.priceSar, locale)}
                </li>
              ))}
            </ul>
          )}
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
            <Field label={t('projectDetail.unitDrawer.floorPlan')}>{(field) => <Input {...field} value={unitFloorPlan} onChange={(e) => setUnitFloorPlan(e.target.value)} />}</Field>
            <Field label={t('projectDetail.unitDrawer.price')}>{(field) => <Input {...field} type="number" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />}</Field>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="self-start"
            onClick={async () => {
              const price = Number(unitPrice);
              if (!unitFloorPlan.trim() || !price || price <= 0) return;
              if (projectId) {
                await addUnit({ projectId, floorPlan: unitFloorPlan.trim(), priceSar: price });
                queryClient.invalidateQueries({ queryKey: ['project', projectId, 'units'] });
              } else {
                setAddedUnits((prev) => [...prev, { floorPlan: unitFloorPlan.trim(), priceSar: price }]);
              }
              setUnitFloorPlan('');
              setUnitPrice('');
            }}
          >
            {t('projectWizard.action.addUnit')}
          </Button>
        </div>
      ),
    },
    {
      title: t('propertyWizard.step.compliance'),
      isValid: falRef.trim().length > 0 && regaRef.trim().length > 0,
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-body text-text-secondary">{t('propertyWizard.compliance.intro')}</p>
          <Field label={t('propertyWizard.compliance.fal')}>{(field) => <Input {...field} value={falRef} onChange={(e) => setFalRef(e.target.value)} placeholder="FAL-2026-XXXXX" />}</Field>
          <Field label={t('propertyWizard.compliance.rega')}>{(field) => <Input {...field} value={regaRef} onChange={(e) => setRegaRef(e.target.value)} placeholder="REGA-AD-XXXXXX" />}</Field>
        </div>
      ),
    },
    {
      title: t('propertyWizard.step.media'),
      isValid: true,
      content: (
        <MediaUploader
          approvedCount={approvedPhotoCount}
          onUploaded={async (caption) => {
            if (!projectId) return;
            await addMedia({ projectId, caption });
            setApprovedPhotoCount((c) => c + 1);
          }}
        />
      ),
    },
    {
      title: t('propertyWizard.step.review'),
      isValid: missingItems.length === 0,
      content: (
        <div className="flex flex-col gap-4">
          <dl className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
            <div>
              <dt className="text-caption text-text-secondary">{t('propertyWizard.details.title')}</dt>
              <dd className="text-body text-text-primary">{title || '—'}</dd>
            </div>
            <div>
              <dt className="text-caption text-text-secondary">{t('projectWizard.step.units')}</dt>
              <dd className="text-body text-text-primary">{totalUnitCount}</dd>
            </div>
          </dl>
          {missingItems.length > 0 ? (
            <Alert tone="warning">
              <div className="flex flex-col gap-2">
                <span>{t('propertyWizard.review.incomplete')}</span>
                {missingItems.map((item) => (
                  <Button key={item.key} size="sm" variant="secondary" onClick={() => setCurrentStep(item.step)}>
                    {item.label}
                  </Button>
                ))}
              </div>
            </Alert>
          ) : publishResult ? (
            <Alert tone="success">{publishResult === 'active' ? t('propertyWizard.review.publishedActive') : t('propertyWizard.review.publishedPending')}</Alert>
          ) : null}
        </div>
      ),
    },
  ];

  const handleStepChange = async (nextStep: number) => {
    if (nextStep === 2 && !projectId) {
      const id = await ensureCreated();
      for (const u of addedUnits) {
        await addUnit({ projectId: id, floorPlan: u.floorPlan, priceSar: u.priceSar });
      }
      setAddedUnits([]);
      queryClient.invalidateQueries({ queryKey: ['project', id, 'units'] });
    }
    setCurrentStep(nextStep);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const id = await ensureCreated();
      if (falRef.trim() && regaRef.trim()) {
        const complianceRes = await projectsApi.compliance(id);
        if (complianceRes.status === 'success') {
          for (const req of complianceRes.data) {
            const ref = req.name === 'FAL License' ? falRef : req.name === 'REGA Ad License' ? regaRef : 'NAFATH-AUTO';
            await projectsApi.resolveComplianceRequirement(req.id, ref, user?.name ?? 'Unknown');
          }
        }
      }
      const publishRes = await projectsApi.publish(id, user?.name ?? 'Unknown');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      if (publishRes.status === 'success' && publishRes.data) {
        setPublishResult(publishRes.data.status === 'active' ? 'active' : 'pending_compliance');
      }
    } finally {
      setSaving(false);
    }
  };

  if (projectId && projectQuery.isLoading) return null;
  if (project && (project.status !== 'draft' || publishResult)) {
    return (
      <div className="mx-auto max-w-content">
        <Alert tone="success">{project.status === 'active' ? t('propertyWizard.review.publishedActive') : t('propertyWizard.review.publishedPending')}</Alert>
        <Button className="mt-4" size="sm" onClick={() => navigate(`/projects/${project.id}`)}>
          {t('propertyWizard.action.viewListing')}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content">
      <h1 className="text-h1 text-text-primary">{t('projectWizard.title')}</h1>
      <p className="mt-1 text-body-lg text-text-secondary">{t('projectWizard.subtitle')}</p>
      <div className="mt-6">
        <FormWizard steps={steps} currentStep={currentStep} onStepChange={handleStepChange} onSubmit={handleSubmit} submitLabel={t('propertyWizard.action.publish')} saving={saving} />
      </div>
    </div>
  );
}
