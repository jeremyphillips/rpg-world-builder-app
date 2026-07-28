import { type z } from 'zod'

import { keysFromEntries, termOptionsFromEntries, vocabEnumFromEntries } from './enum-schema'
import type { GameTermEntry, VocabularyTerm } from './types'

// ---------------------------------------------------------------------------
// Character vital status — whether a PC or NPC is alive, deceased, or unknown.
// Shared by PCs and NPCs; not a content publication state.
// ---------------------------------------------------------------------------

export const CHARACTER_VITAL_STATUS_TERM = {
  label: 'Vital status',
  description: 'Whether the character is alive, deceased, or unknown.',
  sentence: {
    singular: 'vital status',
    plural: 'vital statuses',
  },
} as const satisfies VocabularyTerm

export const CHARACTER_VITAL_STATUS_ENTRIES = {
  alive: {
    label: 'Alive',
    description: 'The character is alive.',
    sentence: {
      singular: 'alive vital status',
      plural: 'alive vital statuses',
    },
  },
  deceased: {
    label: 'Deceased',
    description: 'The character has died.',
    sentence: {
      singular: 'deceased vital status',
      plural: 'deceased vital statuses',
    },
  },
  unknown: {
    label: 'Unknown',
    description: 'The character’s fate is not established.',
    sentence: {
      singular: 'unknown vital status',
      plural: 'unknown vital statuses',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export const CHARACTER_VITAL_STATUSES = keysFromEntries(CHARACTER_VITAL_STATUS_ENTRIES)

export const characterVitalStatusSchema = vocabEnumFromEntries(CHARACTER_VITAL_STATUS_ENTRIES)

export type CharacterVitalStatus = z.infer<typeof characterVitalStatusSchema>

export const CHARACTER_VITAL_STATUS_OPTIONS = termOptionsFromEntries(CHARACTER_VITAL_STATUS_ENTRIES)
