import {
  getTermCollectionLabel,
  type GameTermEntry,
  type VocabularyTerm,
} from '../../../vocab/types'

import { CHARACTER_TYPES, type CharacterType } from '../sheet/core'

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
    collectionLabel: 'PCs',
    description: 'A player character controlled by a campaign participant.',
    sentence: {
      singular: 'player character',
      plural: 'player characters',
    },
  },
  npc: {
    label: 'NPC',
    collectionLabel: 'NPCs',
    description: 'A non-player character controlled by the game master.',
    sentence: {
      singular: 'non-player character',
      plural: 'non-player characters',
    },
  },
} as const satisfies Record<CharacterType, GameTermEntry>

export type CharacterTypeBulkActionDescriptor = {
  nounSingular: string
  nounPlural: string
}

/** Returns the display label for a character type id. Falls back to the raw value. */
export function getCharacterTypeLabel(characterType: CharacterType | string): string {
  return CHARACTER_TYPE_ENTRIES[characterType as CharacterType]?.label ?? characterType
}

/** Collection nav and overview heading — e.g. NPCs. Falls back to the raw value. */
export function getCharacterTypeCollectionLabel(characterType: CharacterType | string): string {
  const entry = CHARACTER_TYPE_ENTRIES[characterType as CharacterType]
  return entry ? getTermCollectionLabel(entry) : characterType
}

/** Singular/plural nouns for bulk action toasts and resolve copy. */
export function getCharacterTypeBulkActionDescriptor(
  characterType: CharacterType,
): CharacterTypeBulkActionDescriptor {
  const entry = CHARACTER_TYPE_ENTRIES[characterType]
  return {
    nounSingular: entry.label,
    nounPlural: getTermCollectionLabel(entry),
  }
}

/** Closed character type ids in canonical order. */
export const CHARACTER_TYPE_IDS = CHARACTER_TYPES
