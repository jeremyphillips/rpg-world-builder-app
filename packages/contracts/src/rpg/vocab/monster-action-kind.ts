import { vocabEnumFromEntries, keysFromEntries } from './enum-schema'
import type { GameTermEntry, VocabularyTerm } from './types'

// ---------------------------------------------------------------------------
// Monster action kinds — discriminant for stat-block action variants.
// ---------------------------------------------------------------------------

export const MONSTER_ACTION_KIND_TERM = {
  label: 'Monster Action Kind',
  description: 'Whether a monster action uses equipment, a natural weapon, or special prose.',
  sentence: {
    singular: 'monster action kind',
    plural: 'monster action kinds',
  },
} as const satisfies VocabularyTerm

export const MONSTER_ACTION_KIND_ENTRIES = {
  weapon: {
    label: 'Weapon',
    description: 'Uses a catalog weapon referenced from the monster equipment list.',
  },
  'natural-weapon': {
    label: 'Natural weapon',
    description: 'An innate attack such as a claw or bite with authored damage.',
  },
  special: {
    label: 'Special',
    description: 'A named special action described in prose.',
  },
} as const satisfies Record<string, GameTermEntry>

export type MonsterActionKind = keyof typeof MONSTER_ACTION_KIND_ENTRIES

export const MONSTER_ACTION_KINDS = keysFromEntries(MONSTER_ACTION_KIND_ENTRIES)

export const monsterActionKindSchema = vocabEnumFromEntries(MONSTER_ACTION_KIND_ENTRIES)

/** Returns the display label for a monster action kind. Falls back to the raw value. */
export function getMonsterActionKindLabel(id: string): string {
  return MONSTER_ACTION_KIND_ENTRIES[id as MonsterActionKind]?.label ?? id
}
