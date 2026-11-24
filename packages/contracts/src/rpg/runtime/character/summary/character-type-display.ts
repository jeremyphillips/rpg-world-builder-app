import {
  getTermCollectionLabel,
  type GameTermEntry,
  type VocabularyTerm,
} from '../../../vocab/types'

import { type CharacterKind, type CharacterType } from '../pc-npc-identity'

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
} as const satisfies Record<CharacterKind, GameTermEntry>

export type CharacterTypeBulkActionDescriptor = {
  nounSingular: string
  nounPlural: string
}

/** Returns the display label for a known character type id. */
export function getCharacterTypeLabel(characterType: CharacterType): string {
  return CHARACTER_TYPE_ENTRIES[characterType].label
}

/** Collection nav and overview heading — e.g. NPCs. */
export function getCharacterTypeCollectionLabel(characterType: CharacterType): string {
  return getTermCollectionLabel(CHARACTER_TYPE_ENTRIES[characterType])
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

/** Display label for an unparsed or legacy character type string. */
export function formatUnknownCharacterTypeLabel(value: string): string {
  const entry = CHARACTER_TYPE_ENTRIES[value as CharacterType]
  return entry?.label ?? value
}
