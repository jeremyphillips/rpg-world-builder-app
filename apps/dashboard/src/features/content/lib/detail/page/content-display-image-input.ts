import type {
  CharacterClass,
  ContentMedia,
  ContentSource,
  ContentTypeKey,
  Species,
} from '@rpg/contracts'

import type { ResolveDashboardContentDisplayInput } from './content-display-image'

export type ContentDisplayImageRecord = {
  media?: ContentMedia | null
  slug: string
  source: ContentSource
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
    contentSource: record.source,
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
      source: characterClass.source,
      rulesetId: characterClass.rulesetId,
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
      source: species.source,
      rulesetId: species.rulesetId,
    },
    surface,
  )
}

export function buildLocationContentDisplayImageInput(
  location: Pick<ContentDisplayImageRecord, 'media' | 'slug' | 'source' | 'rulesetId'>,
  surface: ResolveDashboardContentDisplayInput['surface'] = 'compact',
): ResolveDashboardContentDisplayInput {
  return buildContentDisplayImageInput('locations', location, surface)
}

export function buildOrganizationContentDisplayImageInput(
  organization: Pick<ContentDisplayImageRecord, 'media' | 'slug' | 'source' | 'rulesetId'>,
  surface: ResolveDashboardContentDisplayInput['surface'] = 'compact',
): ResolveDashboardContentDisplayInput {
  return buildContentDisplayImageInput('organizations', organization, surface)
}

export function buildEquipmentContentDisplayImageInput(
  equipment: Pick<ContentDisplayImageRecord, 'media' | 'slug' | 'source' | 'rulesetId'>,
  surface: ResolveDashboardContentDisplayInput['surface'] = 'compact',
): ResolveDashboardContentDisplayInput {
  return buildContentDisplayImageInput('equipment', equipment, surface)
}
