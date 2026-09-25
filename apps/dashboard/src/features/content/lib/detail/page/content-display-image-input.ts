import type {
  CharacterClass,
  ContentMedia,
  ContentSource,
  ContentTypeKey,
  MediaRole,
  Species,
} from '@rpg/contracts'

import type { ResolveDashboardContentDisplayImageInput } from './content-display-image'

export type ContentDisplayImageRecord = {
  media?: ContentMedia | null
  imageKey?: string
  slug: string
  source: ContentSource
  rulesetId?: string
}

/** Preview forms carry the same identity image fields as persisted content records. */
export type ContentPreviewDisplayImageValues = {
  media?: ContentMedia | null
  imageKey?: string
  slug?: string
}

/** Maps a content record to the shared display-image resolver input. */
export function buildContentDisplayImageInput(
  contentType: ContentTypeKey,
  record: ContentDisplayImageRecord,
  role?: MediaRole,
): ResolveDashboardContentDisplayImageInput {
  return {
    media: record.media,
    imageKey: record.imageKey,
    contentType,
    slug: record.slug,
    contentSource: record.source,
    rulesetId: record.rulesetId,
    role,
  }
}

export function buildClassContentDisplayImageInput(
  characterClass: CharacterClass,
  role?: MediaRole,
): ResolveDashboardContentDisplayImageInput {
  return buildContentDisplayImageInput(
    'classes',
    {
      media: characterClass.media,
      imageKey: characterClass.imageKey,
      slug: characterClass.slug,
      source: characterClass.source,
      rulesetId: characterClass.rulesetId,
    },
    role,
  )
}

export function buildSpeciesContentDisplayImageInput(
  species: Species,
  role?: MediaRole,
): ResolveDashboardContentDisplayImageInput {
  return buildContentDisplayImageInput(
    'species',
    {
      media: species.media,
      imageKey: species.imageKey,
      slug: species.slug,
      source: species.source,
      rulesetId: species.rulesetId,
    },
    role,
  )
}
