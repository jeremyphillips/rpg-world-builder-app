import type { GameTermEntry, VocabularyTerm } from '../../vocab/types'

import { CHARACTER_TYPES, type CharacterType } from './core'

export const CHARACTER_TYPE_TERM = {
  label: 'Character type',
  description: 'Whether a character is a player character or a non-player character.',
  sentence: {
    singular: 'character type',
    plural: 'character types',
  },
} as const satisfies VocabularyTerm

export const CHARACTER_TYPE_ENTRIES = {
  pc: {
    label: 'PC',
    description: 'A player character controlled by a campaign participant.',
    sentence: {
      singular: 'player character',
      plural: 'player characters',
    },
  },
  npc: {
    label: 'NPC',
    description: 'A non-player character controlled by the game master.',
    sentence: {
      singular: 'non-player character',
      plural: 'non-player characters',
    },
  },
} as const satisfies Record<CharacterType, GameTermEntry>

/** Returns the display label for a character type id. Falls back to the raw value. */
export function getCharacterTypeLabel(characterType: CharacterType | string): string {
  return CHARACTER_TYPE_ENTRIES[characterType as CharacterType]?.label ?? characterType
}

/** Closed character type ids in canonical order. */
export const CHARACTER_TYPE_IDS = CHARACTER_TYPES
