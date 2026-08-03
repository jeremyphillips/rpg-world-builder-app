import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

export const REGION_TYPE_TERM = {
  label: 'Region Type',
  description: 'The geographic character of a region.',
  sentence: {
    singular: 'region type',
    plural: 'region types',
  },
} as const satisfies VocabularyTerm

export const REGION_TYPE_ENTRIES = {
  continent: {
    label: 'Continent',
    description: 'A large landmass spanning a substantial part of a world.',
  },
  island: {
    label: 'Island',
    description: 'An isolated landmass surrounded by water.',
  },
  archipelago: {
    label: 'Archipelago',
    description: 'A cluster of islands treated as one region.',
  },
  mountain_range: {
    label: 'Mountain Range',
    description: 'A connected chain of mountains or highlands.',
  },
  forest: {
    label: 'Forest',
    description: 'A wooded or jungle region.',
  },
  desert: {
    label: 'Desert',
    description: 'An arid or sandy expanse.',
  },
  swamp: {
    label: 'Swamp',
    description: 'A marsh, bog, or wetland region.',
  },
  tundra: {
    label: 'Tundra',
    description: 'A cold, open, or permafrost region.',
  },
  coast: {
    label: 'Coast',
    description: 'A shoreline or maritime border region.',
  },
  sea: {
    label: 'Sea',
    description: 'A named body of water treated as a navigable region.',
  },
  underground: {
    label: 'Underground',
    description: 'A subterranean region such as the Underdark.',
  },
} as const satisfies Record<string, GameTermEntry>

export type RegionType = keyof typeof REGION_TYPE_ENTRIES

export const REGION_TYPE_IDS = keysFromEntries(REGION_TYPE_ENTRIES)

export const regionTypeSchema = vocabEnumFromEntries(REGION_TYPE_ENTRIES)

/** Returns the reference entry for a region type id, if known. */
export function getRegionTypeEntry(id: string): GameTermEntry | undefined {
  return REGION_TYPE_ENTRIES[id as RegionType]
}

/** Returns the display label for a region type. Falls back to the raw id. */
export function getRegionTypeLabel(id: string): string {
  return getRegionTypeEntry(id)?.label ?? id
}
