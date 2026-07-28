import { type z } from 'zod'

import { keysFromEntries, termOptionsFromEntries, vocabEnumFromEntries } from './enum-schema'
import type { GameTermEntry, VocabularyTerm } from './types'

// ---------------------------------------------------------------------------
// Character roster status — whether a PC or NPC is active on the campaign roster.
// Shared by PCs and NPCs; not a content publication state.
// ---------------------------------------------------------------------------

export const CHARACTER_ROSTER_STATUS_TERM = {
  label: 'Roster status',
  description: 'Whether the character is active on the campaign roster.',
  sentence: {
    singular: 'roster status',
    plural: 'roster statuses',
  },
} as const satisfies VocabularyTerm

export const CHARACTER_ROSTER_STATUS_ENTRIES = {
  active: {
    label: 'Active',
    description: 'The character is currently on the campaign roster.',
    sentence: {
      singular: 'active roster status',
      plural: 'active roster statuses',
    },
  },
  inactive: {
    label: 'Inactive',
    description: 'The character is off the roster but not retired.',
    sentence: {
      singular: 'inactive roster status',
      plural: 'inactive roster statuses',
    },
  },
  retired: {
    label: 'Retired',
    description: 'The character has left the roster permanently.',
    sentence: {
      singular: 'retired roster status',
      plural: 'retired roster statuses',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export const CHARACTER_ROSTER_STATUSES = keysFromEntries(CHARACTER_ROSTER_STATUS_ENTRIES)

export const characterRosterStatusSchema = vocabEnumFromEntries(CHARACTER_ROSTER_STATUS_ENTRIES)

export type CharacterRosterStatus = z.infer<typeof characterRosterStatusSchema>

export const CHARACTER_ROSTER_STATUS_OPTIONS = termOptionsFromEntries(
  CHARACTER_ROSTER_STATUS_ENTRIES,
)
