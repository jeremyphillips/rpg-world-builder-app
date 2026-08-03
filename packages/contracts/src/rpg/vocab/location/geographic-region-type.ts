import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

export const GEOGRAPHIC_REGION_TYPE_TERM = {
  label: 'Geographic Region Type',
  description: 'The physical or ecological character of a region.',
  sentence: {
    singular: 'geographic region type',
    plural: 'geographic region types',
  },
} as const satisfies VocabularyTerm

export const GEOGRAPHIC_REGION_TYPE_ENTRIES = {
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

export type GeographicRegionType = keyof typeof GEOGRAPHIC_REGION_TYPE_ENTRIES

export const GEOGRAPHIC_REGION_TYPE_IDS = keysFromEntries(GEOGRAPHIC_REGION_TYPE_ENTRIES)

export const geographicRegionTypeSchema = vocabEnumFromEntries(GEOGRAPHIC_REGION_TYPE_ENTRIES)

/** Returns the reference entry for a geographic region type id, if known. */
export function getGeographicRegionTypeEntry(id: string): GameTermEntry | undefined {
  return GEOGRAPHIC_REGION_TYPE_ENTRIES[id as GeographicRegionType]
}

/** Returns the display label for a geographic region type. Falls back to the raw id. */
export function getGeographicRegionTypeLabel(id: string): string {
  return getGeographicRegionTypeEntry(id)?.label ?? id
}
