import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePropertyWizard } from '@/lib/properties/usePropertyWizard';
import { usePropertyLookups } from '@/lib/properties/usePropertyLookups';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { propertiesApi } from '@/lib/api/endpoints/properties';
import { FormWizard, type WizardStep } from '@/components/patterns/forms/FormWizard';
import { MediaUploader } from '@/components/patterns/forms/MediaUploader';
import { AISuggestion } from '@/components/tbos/ai/AISuggestion';
import { AIActionBar } from '@/components/tbos/ai/AIActionBar';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { formatPriceSar, PROPERTY_TYPE_KEY } from '@/features/properties/propertyFormat';
import type { PropertyType } from '@/types/entities';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const PROPERTY_TYPES: PropertyType[] = ['apartment', 'villa', 'townhouse', 'land', 'office', 'retail'];
const AMENITY_SUGGESTIONS = ['Covered parking', 'Private garden', 'Maid’s room', 'Storage room', 'Elevator access'];
const REQUIREMENT_ITEM_KEYS: TranslationKey[] = ['propertyWizard.requirements.license', 'propertyWizard.requirements.media', 'propertyWizard.requirements.pricing', 'propertyWizard.requirements.time'];

/**
 * PROP-03 — Create/Edit Property (tbos-blueprint/04_SCREEN_INVENTORY.md:
 * "guided, front-loaded creation/edit wizard," WF-PROPERTY-NEW). The
 * registered route (`/properties/new`, no dynamic segment) uses the same
 * single-flow `?propertyId=` query-param architecture established for MKT-02
 * in Phase 9. Step order deviates from the source's literal prose
 * (Requirements → Compliance → Details → Media → Review here, vs.
 * Requirements → Compliance → Details in tbos-definition/
 * 09_WORKFLOW_ARCHITECTURE.md) — an explicit, documented ASSUMPTION: the
 * record must exist with real identifying data (title/type/district/price)
 * before compliance reference numbers can be attached to it, a data
 * dependency the source's prose doesn't address.
 */
export function PropertyWizardScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId') ?? undefined;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  const { owners } = usePropertyLookups();
  const { createProperty, addMedia } = usePropertyWizard();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(0);
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [priceSar, setPriceSar] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [description, setDescription] = useState('');
  const [amenityTags, setAmenityTags] = useState<string[]>([]);
  const [amenitySuggestionAccepted, setAmenitySuggestionAccepted] = useState(false);
  const [falRef, setFalRef] = useState('');
  const [regaRef, setRegaRef] = useState('');
  const [approvedPhotoCount, setApprovedPhotoCount] = useState(0);
  const [publishResult, setPublishResult] = useState<'active' | 'pending_compliance' | null>(null);
  const [saving, setSaving] = useState(false);

  const propertyQuery = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      const res = await propertiesApi.get(propertyId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!propertyId,
  });
  const property = propertyQuery.data;

  const mediaQuery = useQuery({
    queryKey: ['property', propertyId, 'media'],
    queryFn: async () => {
      if (!propertyId) return [];
      const res = await propertiesApi.media(propertyId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!propertyId,
  });

  useEffect(() => {
    if (mediaQuery.data) setApprovedPhotoCount(mediaQuery.data.filter((m) => m.status === 'approved').length);
  }, [mediaQuery.data]);

  // Resuming an existing Draft (propertyId present on load) — hydrate the
  // form from the real record instead of starting blank.
  useEffect(() => {
    if (!property) return;
    setTitle(property.title);
    setPropertyType(property.propertyType);
    setDistrict(property.district);
    setCity(property.city);
    setPriceSar(property.priceSar ? String(property.priceSar) : '');
    setOwnerId(property.ownerId);
    setDescription(property.description ?? '');
    if (property.amenityTags) {
      setAmenityTags(property.amenityTags);
      setAmenitySuggestionAccepted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once when the record arrives, not on every local-state change
  }, [property?.id]);

  const ensureCreated = async (): Promise<string> => {
    if (propertyId) return propertyId;
    if (!user) throw new Error('Not authenticated');
    const created = await createProperty({
      agencyId: user.agencyId,
      brokerId: user.id,
      ownerId,
      title,
      propertyType,
      district,
      city,
      priceSar: Number(priceSar) || 0,
      description: description.trim() || undefined,
      amenityTags: amenityTags.length > 0 ? amenityTags : undefined,
    });
    setSearchParams({ propertyId: created.id }, { replace: true });
    return created.id;
  };

  const missingItems: { key: string; label: string; step: number }[] = [];
  if (approvedPhotoCount === 0) missingItems.push({ key: 'photos', label: t('propertyWizard.missing.photos'), step: 3 });

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
      isValid: title.trim().length > 0 && district.trim().length > 0 && city.trim().length > 0 && Number(priceSar) > 0 && !!ownerId,
      content: (
        <div className="flex flex-col gap-4">
          <Field label={t('propertyWizard.details.title')}>{(field) => <Input {...field} value={title} onChange={(e) => setTitle(e.target.value)} />}</Field>
          <Field label={t('propertyWizard.details.type')}>
            {(field) => (
              <Select {...field} value={propertyType} onChange={(e) => setPropertyType(e.target.value as PropertyType)} options={PROPERTY_TYPES.map((pt) => ({ value: pt, label: t(PROPERTY_TYPE_KEY[pt]) }))} />
            )}
          </Field>
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
          <Field label={t('propertyWizard.details.price')}>{(field) => <Input {...field} type="number" value={priceSar} onChange={(e) => setPriceSar(e.target.value)} />}</Field>
          <Field label={t('propertyWizard.details.description')}>{(field) => <Textarea {...field} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />}</Field>
          {!amenitySuggestionAccepted ? (
            <AISuggestion
              confidence="medium"
              actions={
                <AIActionBar
                  acceptLabel={t('propertyWizard.ai.acceptAmenities')}
                  onAccept={() => {
                    setAmenityTags(AMENITY_SUGGESTIONS.slice(0, 3));
                    setAmenitySuggestionAccepted(true);
                  }}
                  onDiscard={() => setAmenitySuggestionAccepted(true)}
                />
              }
            >
              {t('propertyWizard.ai.amenitiesSuggestion')}
            </AISuggestion>
          ) : amenityTags.length > 0 ? (
            <p className="rounded-md border border-border bg-bg-sunken p-3 text-body text-text-secondary">{amenityTags.join(', ')}</p>
          ) : null}
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
            if (!propertyId) return;
            await addMedia({ propertyId, caption });
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
              <dt className="text-caption text-text-secondary">{t('propertyWizard.details.price')}</dt>
              <dd className="text-body text-text-primary">{priceSar ? formatPriceSar(Number(priceSar), locale) : '—'}</dd>
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
    if (nextStep === 2 && !propertyId) {
      await ensureCreated();
    }
    setCurrentStep(nextStep);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const id = await ensureCreated();
      if (falRef.trim() && regaRef.trim()) {
        const complianceRes = await propertiesApi.compliance(id);
        if (complianceRes.status === 'success') {
          for (const req of complianceRes.data) {
            const ref = req.name === 'FAL License' ? falRef : req.name === 'REGA Ad License' ? regaRef : 'NAFATH-AUTO';
            await propertiesApi.resolveComplianceRequirement(req.id, ref, user?.name ?? 'Unknown');
          }
        }
      }
      const publishRes = await propertiesApi.publish(id, user?.name ?? 'Unknown');
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', id] });
      if (publishRes.status === 'success' && publishRes.data) {
        setPublishResult(publishRes.data.status === 'active' ? 'active' : 'pending_compliance');
      }
    } finally {
      setSaving(false);
    }
  };

  if (propertyId && propertyQuery.isLoading) return null;
  if (property && (property.status !== 'draft' || publishResult)) {
    return (
      <div className="mx-auto max-w-content">
        <Alert tone="success">{property.status === 'active' ? t('propertyWizard.review.publishedActive') : t('propertyWizard.review.publishedPending')}</Alert>
        <Button className="mt-4" size="sm" onClick={() => navigate(`/properties/${property.id}`)}>
          {t('propertyWizard.action.viewListing')}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content">
      <h1 className="text-h1 text-text-primary">{t('propertyWizard.title')}</h1>
      <p className="mt-1 text-body-lg text-text-secondary">{t('propertyWizard.subtitle')}</p>
      <div className="mt-6">
        <FormWizard steps={steps} currentStep={currentStep} onStepChange={handleStepChange} onSubmit={handleSubmit} submitLabel={t('propertyWizard.action.publish')} saving={saving} />
      </div>
    </div>
  );
}
