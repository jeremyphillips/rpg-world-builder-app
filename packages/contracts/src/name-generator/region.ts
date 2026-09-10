import { keysFromEntries } from '../rpg/vocab/enum-schema'
import { formatVocabularySlugLabel } from '../rpg/vocab/format-slug-label'
import type { GameTermEntry, VocabularyTerm } from '../rpg/vocab/types'

// ---------------------------------------------------------------------------
// Name regions — real-world browsing facet for standalone naming cultures.
// ---------------------------------------------------------------------------

export const NAME_REGION_TERM = {
  label: 'Name Region',
  description: 'A real-world region associated with a naming tradition.',
  sentence: {
    singular: 'name region',
    plural: 'name regions',
  },
} as const satisfies VocabularyTerm

export const NAME_REGION_ENTRIES = {
  'west-africa': {
    label: 'West Africa',
    description: 'Naming traditions of West Africa.',
    sentence: {
      singular: 'West African region',
      plural: 'West African regions',
    },
  },
  scandinavia: {
    label: 'Scandinavia',
    description: 'Naming traditions of Scandinavia.',
    sentence: {
      singular: 'Scandinavian region',
      plural: 'Scandinavian regions',
    },
  },
  'british-isles': {
    label: 'British Isles',
    description: 'Naming traditions of the British Isles.',
    sentence: {
      singular: 'British Isles region',
      plural: 'British Isles regions',
    },
  },
  'east-asia': {
    label: 'East Asia',
    description: 'Naming traditions of East Asia.',
    sentence: {
      singular: 'East Asian region',
      plural: 'East Asian regions',
    },
  },
  'eastern-europe': {
    label: 'Eastern Europe',
    description: 'Naming traditions of Eastern Europe.',
    sentence: {
      singular: 'Eastern European region',
      plural: 'Eastern European regions',
    },
  },
  mediterranean: {
    label: 'Mediterranean',
    description: 'Naming traditions of the Mediterranean.',
    sentence: {
      singular: 'Mediterranean region',
      plural: 'Mediterranean regions',
    },
  },
  'near-east': {
    label: 'Near East',
    description: 'Naming traditions of the Near East.',
    sentence: {
      singular: 'Near Eastern region',
      plural: 'Near Eastern regions',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export type NameRegionId = keyof typeof NAME_REGION_ENTRIES

export const NAME_REGION_IDS = keysFromEntries(NAME_REGION_ENTRIES)

/** Returns a display label — title-cased slug fallback when the region is unknown. */
export function getNameRegionLabel(id: string): string {
  const entry = NAME_REGION_ENTRIES[id as NameRegionId]
  return entry?.label ?? formatVocabularySlugLabel(id)
}
