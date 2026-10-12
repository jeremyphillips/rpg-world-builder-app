import { vocabEnumFromEntries, keysFromEntries } from './enum-schema'
import type { GameTermEntry, VocabularyTerm } from './types'

export const CREATURE_ARMOR_CLASS_KIND_TERM = {
  label: 'Armor Class',
  description: 'How a creature’s Armor Class is calculated.',
  sentence: {
    singular: 'Armor Class source',
    plural: 'Armor Class sources',
  },
} as const satisfies VocabularyTerm

export const CREATURE_ARMOR_CLASS_KIND_ENTRIES = {
  unarmored: {
    label: 'Unarmored',
    description: '10 plus Dexterity, plus shields.',
  },
  natural: {
    label: 'Natural',
    description: '10 plus Dexterity plus a natural armor bonus, plus shields.',
  },
  equipment: {
    label: 'Armor',
    description: 'Calculated from equipped body armor and shields.',
  },
  fixed: {
    label: 'Fixed',
    description: 'An authored Armor Class that ignores abilities and equipment.',
  },
} as const satisfies Record<string, GameTermEntry>

export type CreatureArmorClassKind = keyof typeof CREATURE_ARMOR_CLASS_KIND_ENTRIES

export const CREATURE_ARMOR_CLASS_KINDS = keysFromEntries(CREATURE_ARMOR_CLASS_KIND_ENTRIES)

export const creatureArmorClassKindSchema = vocabEnumFromEntries(CREATURE_ARMOR_CLASS_KIND_ENTRIES)

export function getCreatureArmorClassKindLabel(id: string): string {
  return CREATURE_ARMOR_CLASS_KIND_ENTRIES[id as CreatureArmorClassKind]?.label ?? id
}
