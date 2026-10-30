import type {
  CharacterClass,
  ContentMedia,
  CatalogLayer,
  ContentTypeKey,
  Monster,
  Species,
} from '@rpg/contracts'

import type { ResolveDashboardContentDisplayInput } from './content-display-image'

export type ContentDisplayImageRecord = {
  media?: ContentMedia | null
  slug: string
  catalogLayer: CatalogLayer
  rulesetId?: string
}

/** Preview forms carry the same identity image fields as persisted content records. */
export type ContentPreviewDisplayImageValues = {
  media?: ContentMedia | null
  slug?: string
}

/** Maps a content record to the shared display-image resolver input. */
export function buildContentDisplayImageInput(
  contentType: ContentTypeKey,
  record: ContentDisplayImageRecord,
  surface: ResolveDashboardContentDisplayInput['surface'] = 'detail',
): ResolveDashboardContentDisplayInput {
  return {
    media: record.media,
    contentType,
    slug: record.slug,
    catalogLayer: record.catalogLayer,
    rulesetId: record.rulesetId,
    surface,
  }
}

export function buildClassContentDisplayImageInput(
  characterClass: CharacterClass,
  surface: ResolveDashboardContentDisplayInput['surface'] = 'detail',
): ResolveDashboardContentDisplayInput {
  return buildContentDisplayImageInput(
    'classes',
    {
      media: characterClass.media,
      slug: characterClass.slug,
      catalogLayer: characterClass.catalogLayer,
      rulesetId: characterClass.rulesetId,
    },
    surface,
  )
}

export function buildMonsterContentDisplayImageInput(
  monster: Monster,
  surface: ResolveDashboardContentDisplayInput['surface'] = 'detail',
): ResolveDashboardContentDisplayInput {
  return buildContentDisplayImageInput(
    'monsters',
    {
      media: monster.media,
      slug: monster.slug,
      catalogLayer: monster.catalogLayer,
      rulesetId: monster.rulesetId,
    },
    surface,
  )
}

export function buildSpeciesContentDisplayImageInput(
  species: Species,
  surface: ResolveDashboardContentDisplayInput['surface'] = 'detail',
): ResolveDashboardContentDisplayInput {
  return buildContentDisplayImageInput(
    'species',
    {
      media: species.media,
      slug: species.slug,
      catalogLayer: species.catalogLayer,
      rulesetId: species.rulesetId,
    },
    surface,
  )
}

export function buildLocationContentDisplayImageInput(
  location: Pick<ContentDisplayImageRecord, 'media' | 'slug' | 'catalogLayer' | 'rulesetId'>,
  surface: ResolveDashboardContentDisplayInput['surface'] = 'compact',
): ResolveDashboardContentDisplayInput {
  return buildContentDisplayImageInput('locations', location, surface)
}

export function buildOrganizationContentDisplayImageInput(
  organization: Pick<ContentDisplayImageRecord, 'media' | 'slug' | 'catalogLayer' | 'rulesetId'>,
  surface: ResolveDashboardContentDisplayInput['surface'] = 'compact',
): ResolveDashboardContentDisplayInput {
  return buildContentDisplayImageInput('organizations', organization, surface)
}

export function buildEquipmentContentDisplayImageInput(
  equipment: Pick<ContentDisplayImageRecord, 'media' | 'slug' | 'catalogLayer' | 'rulesetId'>,
  surface: ResolveDashboardContentDisplayInput['surface'] = 'compact',
): ResolveDashboardContentDisplayInput {
  return buildContentDisplayImageInput('equipment', equipment, surface)
}
