import { keysFromEntries, vocabEnumFromEntries } from '../../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../../types'

export const STRUCTURE_TYPE_TERM = {
  label: 'Structure Type',
  description: 'The built form or primary role of a structure.',
  sentence: {
    singular: 'structure type',
    plural: 'structure types',
  },
} as const satisfies VocabularyTerm

export const STRUCTURE_TYPE_ENTRIES = {
  building: {
    label: 'Building',
    description: 'An enclosed structure that can be further classified by use.',
  },
  fortification: {
    label: 'Fortification',
    description: 'A defensive structure such as a wall, tower, or keep.',
  },
  infrastructure: {
    label: 'Infrastructure',
    description: 'A constructed utility or transport work such as a bridge or aqueduct.',
  },
  monument: {
    label: 'Monument',
    description: 'A commemorative or symbolic constructed landmark.',
  },
  vessel: {
    label: 'Vessel',
    description: 'A ship or other mobile craft treated as a visitable structure.',
  },
} as const satisfies Record<string, GameTermEntry>

export type StructureType = keyof typeof STRUCTURE_TYPE_ENTRIES

/** Generic unclassified structure — maps to `kind: 'structure'` with no `structureType`. */
export const UNCLASSIFIED_STRUCTURE_LABEL = 'Unclassified structure' as const

export const STRUCTURE_TYPE_IDS = keysFromEntries(STRUCTURE_TYPE_ENTRIES)

export const structureTypeSchema = vocabEnumFromEntries(STRUCTURE_TYPE_ENTRIES)

/** Returns the reference entry for a structure type id, if known. */
export function getStructureTypeEntry(id: string): GameTermEntry | undefined {
  return STRUCTURE_TYPE_ENTRIES[id as StructureType]
}

/** Returns the display label for a structure type. Falls back to the raw id. */
export function getStructureTypeLabel(id: string): string {
  return getStructureTypeEntry(id)?.label ?? id
}
