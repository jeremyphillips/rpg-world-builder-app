import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

export const INTERIOR_TYPE_TERM = {
  label: 'Interior Type',
  description: 'The layout role of an indoor space.',
  sentence: {
    singular: 'interior type',
    plural: 'interior types',
  },
} as const satisfies VocabularyTerm

export const INTERIOR_TYPE_ENTRIES = {
  room: {
    label: 'Room',
    description: 'A single enclosed chamber.',
  },
  floor: {
    label: 'Floor',
    description: 'A level or story within a structure.',
  },
  corridor: {
    label: 'Corridor',
    description: 'A hallway or passage connecting other spaces.',
  },
  chamber: {
    label: 'Chamber',
    description: 'A large or significant enclosed space.',
  },
  hall: {
    label: 'Hall',
    description: 'A grand room or assembly space.',
  },
  cellar: {
    label: 'Cellar',
    description: 'An underground or basement level.',
  },
  attic: {
    label: 'Attic',
    description: 'An upper storage or loft space.',
  },
  balcony: {
    label: 'Balcony',
    description: 'An elevated platform or overlook.',
  },
} as const satisfies Record<string, GameTermEntry>

export type InteriorType = keyof typeof INTERIOR_TYPE_ENTRIES

export const INTERIOR_TYPE_IDS = keysFromEntries(INTERIOR_TYPE_ENTRIES)

export const interiorTypeSchema = vocabEnumFromEntries(INTERIOR_TYPE_ENTRIES)

/** Returns the reference entry for an interior type id, if known. */
export function getInteriorTypeEntry(id: string): GameTermEntry | undefined {
  return INTERIOR_TYPE_ENTRIES[id as InteriorType]
}

/** Returns the display label for an interior type. Falls back to the raw id. */
export function getInteriorTypeLabel(id: string): string {
  return getInteriorTypeEntry(id)?.label ?? id
}
