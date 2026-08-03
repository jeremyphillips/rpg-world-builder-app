import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

export const INTERIOR_TYPE_TERM = {
  label: 'Interior Type',
  description: 'The structural role of a location within an interior.',
  sentence: {
    singular: 'interior type',
    plural: 'interior types',
  },
} as const satisfies VocabularyTerm

export const INTERIOR_TYPE_ENTRIES = {
  level: {
    label: 'Level',
    description: 'A vertical slice or story within a structure.',
  },
  space: {
    label: 'Space',
    description: 'An enclosed or bounded room-like area.',
  },
  passage: {
    label: 'Passage',
    description: 'A connecting route between other interior spaces.',
  },
  vertical_access: {
    label: 'Vertical Access',
    description: 'Stairs, ladders, or other means of moving between levels.',
  },
  overlook: {
    label: 'Overlook',
    description: 'An elevated platform or viewing area.',
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
