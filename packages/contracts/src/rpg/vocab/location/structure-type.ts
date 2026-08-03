import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

export const STRUCTURE_TYPE_TERM = {
  label: 'Structure Type',
  description: 'The built form or primary use of a structure.',
  sentence: {
    singular: 'structure type',
    plural: 'structure types',
  },
} as const satisfies VocabularyTerm

export const STRUCTURE_TYPE_ENTRIES = {
  building: {
    label: 'Building',
    description: 'A general-purpose enclosed structure.',
  },
  tower: {
    label: 'Tower',
    description: 'A tall or fortified vertical structure.',
  },
  fortress: {
    label: 'Fortress',
    description: 'A defensive stronghold or keep.',
  },
  temple: {
    label: 'Temple',
    description: 'A religious or ceremonial structure.',
  },
  manor: {
    label: 'Manor',
    description: 'A noble estate or large residence.',
  },
  tavern: {
    label: 'Tavern',
    description: 'An inn, tavern, or similar hospitality venue.',
  },
  shop: {
    label: 'Shop',
    description: 'A storefront or workshop.',
  },
  warehouse: {
    label: 'Warehouse',
    description: 'A storage or logistics structure.',
  },
  ship: {
    label: 'Ship',
    description: 'A vessel treated as a visitable structure.',
  },
  wall: {
    label: 'Wall',
    description: 'A defensive wall, gatehouse, or barrier segment.',
  },
} as const satisfies Record<string, GameTermEntry>

export type StructureType = keyof typeof STRUCTURE_TYPE_ENTRIES

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
