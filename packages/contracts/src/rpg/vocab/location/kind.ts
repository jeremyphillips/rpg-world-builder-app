import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

export const LOCATION_KIND_TERM = {
  label: 'Location Kind',
  description: 'The structural role of a location in the world hierarchy.',
  sentence: {
    singular: 'location kind',
    plural: 'location kinds',
  },
} as const satisfies VocabularyTerm

export const LOCATION_KIND_ENTRIES = {
  plane: {
    label: 'Plane',
    description: 'A distinct plane of existence, such as the Material Plane or an Outer Plane.',
  },
  world: {
    label: 'World',
    description: 'A planet, realm, or other world-scale setting.',
  },
  region: {
    label: 'Region',
    description: 'A large geographic area within a world, such as a continent or forest.',
  },
  settlement: {
    label: 'Settlement',
    description: 'A town, city, or other population center.',
  },
  district: {
    label: 'District',
    description: 'A neighborhood, ward, or quarter within a settlement.',
  },
  site: {
    label: 'Site',
    description: 'A specific place or point of interest, such as a ruin or dungeon entrance.',
  },
  structure: {
    label: 'Structure',
    description: 'A building or constructed edifice at a site or within a settlement.',
  },
  interior: {
    label: 'Interior',
    description: 'An indoor space within a structure or site.',
  },
} as const satisfies Record<string, GameTermEntry>

export type LocationKind = keyof typeof LOCATION_KIND_ENTRIES

export const LOCATION_KIND_IDS = keysFromEntries(LOCATION_KIND_ENTRIES)

export const locationKindSchema = vocabEnumFromEntries(LOCATION_KIND_ENTRIES)

/** Returns the reference entry for a location kind id, if known. */
export function getLocationKindEntry(id: string): GameTermEntry | undefined {
  return LOCATION_KIND_ENTRIES[id as LocationKind]
}

/** Returns the display label for a location kind. Falls back to the raw id. */
export function getLocationKindLabel(id: string): string {
  return getLocationKindEntry(id)?.label ?? id
}
