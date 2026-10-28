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
    description: 'Ruleset Armor Class base plus Dexterity.',
  },
  natural: {
    label: 'Natural',
    description: 'Unarmored Armor Class plus a natural armor bonus.',
  },
  armor: {
    label: 'Armor',
    description: 'Calculated from equipped body armor.',
  },
  fixed: {
    label: 'Fixed',
    description: 'An authored Armor Class that replaces the calculated value.',
  },
} as const satisfies Record<string, GameTermEntry>

export type CreatureArmorClassKind = keyof typeof CREATURE_ARMOR_CLASS_KIND_ENTRIES

export const CREATURE_ARMOR_CLASS_KINDS = keysFromEntries(CREATURE_ARMOR_CLASS_KIND_ENTRIES)

export const creatureArmorClassKindSchema = vocabEnumFromEntries(CREATURE_ARMOR_CLASS_KIND_ENTRIES)

export function getCreatureArmorClassKindLabel(id: string): string {
  return CREATURE_ARMOR_CLASS_KIND_ENTRIES[id as CreatureArmorClassKind]?.label ?? id
}

/** Field label for natural armor bonus on monster authoring surfaces. */
export function getNaturalArmorBonusFieldLabel(): string {
  return `${CREATURE_ARMOR_CLASS_KIND_ENTRIES.natural.label} armor bonus`
}
