import { z } from 'zod'

import { keysFromEntries, termOptionsFromEntries, vocabEnumFromEntries } from './enum-schema'
import type { GameTermEntry, VocabularyTerm } from './types'

// ---------------------------------------------------------------------------
// Content visibility — player-oriented campaign access modes.
// ---------------------------------------------------------------------------

export const CONTENT_VISIBILITY_MODE_TERM = {
  label: 'Visibility',
  description: 'Controls which players can discover and select this content.',
  sentence: {
    singular: 'visibility mode',
    plural: 'visibility modes',
  },
} as const satisfies VocabularyTerm

export const CONTENT_VISIBILITY_MODE_ENTRIES = {
  all_players: {
    label: 'All players',
    description: 'Every player in the campaign can discover and select this content.',
    sentence: {
      singular: 'all players visibility',
      plural: 'all players visibility modes',
    },
  },
  dm_only: {
    label: 'DM only',
    description: 'Only campaign managers can discover and select this content.',
    sentence: {
      singular: 'DM only visibility',
      plural: 'DM only visibility modes',
    },
  },
  specific_players: {
    label: 'Specific players',
    description: 'Only selected campaign participants can discover and select this content.',
    sentence: {
      singular: 'specific players visibility',
      plural: 'specific players visibility modes',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export const CONTENT_VISIBILITY_MODES = keysFromEntries(CONTENT_VISIBILITY_MODE_ENTRIES)

export const contentVisibilityModeSchema = vocabEnumFromEntries(CONTENT_VISIBILITY_MODE_ENTRIES)

export type ContentVisibilityMode = z.infer<typeof contentVisibilityModeSchema>

export const CONTENT_VISIBILITY_MODE_OPTIONS = termOptionsFromEntries(
  CONTENT_VISIBILITY_MODE_ENTRIES,
)

/** Hint copy for the visibility select in campaign access UI. */
export const CONTENT_VISIBILITY_SELECT_HINT =
  'Controls which players can discover and select this content.'
