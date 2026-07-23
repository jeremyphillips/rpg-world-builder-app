import { z } from 'zod'

import { keysFromEntries, termOptionsFromEntries, vocabEnumFromEntries } from './enum-schema'
import type { GameTermEntry, VocabularyTerm } from './types'

// ---------------------------------------------------------------------------
// Content visibility — player-oriented campaign access modes.
// ---------------------------------------------------------------------------

export const CONTENT_VISIBILITY_MODE_TERM = {
  label: 'Player access',
  description: 'Controls which players can discover and select this content while it is available.',
  sentence: {
    singular: 'player access',
    plural: 'player access settings',
  },
} as const satisfies VocabularyTerm

export const CONTENT_VISIBILITY_MODE_ENTRIES = {
  all_players: {
    label: 'All players',
    description:
      'Every player in the campaign can discover and select this content while it is available.',
    sentence: {
      singular: 'all players visibility',
      plural: 'all players visibility modes',
    },
  },
  dm_only: {
    label: 'DM only',
    description:
      'Only campaign managers can discover and select this content while it is available.',
    sentence: {
      singular: 'DM only visibility',
      plural: 'DM only visibility modes',
    },
  },
  specific_players: {
    label: 'Specific players',
    description:
      'Only selected campaign participants can discover and select this content while it is available.',
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

/**
 * @deprecated Prefer dashboard `CAMPAIGN_ACCESS_PLAYER_ACCESS_HINT` or
 * `resolveCampaignAccessPlayerAccessHint` — kept for legacy imports.
 */
export const CONTENT_VISIBILITY_SELECT_HINT = CONTENT_VISIBILITY_MODE_TERM.description
