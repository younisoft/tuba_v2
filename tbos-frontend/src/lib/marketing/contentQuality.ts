import type { Property } from '@/types/entities';

export type ContentQualityScore = 'good' | 'needs_attention';

export interface PropertyContentQualityResult {
  score: ContentQualityScore;
  hasEnoughPhotos: boolean;
  hasDescription: boolean;
  hasPrice: boolean;
  /** Which of the three rubric components are missing, worst-listing-first
   * sort key elsewhere is this array's length. */
  missingItems: Array<'photos' | 'description' | 'price'>;
}

const MIN_APPROVED_PHOTOS = 3;
const MIN_DESCRIPTION_LENGTH = 30;

/**
 * A transparent, deterministic completeness check — not a fabricated AI
 * score. Mirrors the exact three components tbos-blueprint/
 * 08_AI_INTERACTION_BLUEPRINT.md's Property Quality capability names:
 * "photos present, description length/quality, pricing present"
 * (TBOS_MARKETING_UX_AUDIT.md P3-1). `hasPrice` is trivially always true
 * today (Property.priceSar is a required field) — kept in the rubric for
 * fidelity to the source's three-part description, not because it currently
 * discriminates anything.
 */
export function evaluatePropertyContentQuality(property: Property, approvedMediaCount: number): PropertyContentQualityResult {
  const hasEnoughPhotos = approvedMediaCount >= MIN_APPROVED_PHOTOS;
  const hasDescription = (property.description?.trim().length ?? 0) >= MIN_DESCRIPTION_LENGTH;
  const hasPrice = property.priceSar > 0;

  const missingItems: PropertyContentQualityResult['missingItems'] = [];
  if (!hasEnoughPhotos) missingItems.push('photos');
  if (!hasDescription) missingItems.push('description');
  if (!hasPrice) missingItems.push('price');

  return {
    score: missingItems.length === 0 ? 'good' : 'needs_attention',
    hasEnoughPhotos,
    hasDescription,
    hasPrice,
    missingItems,
  };
}
