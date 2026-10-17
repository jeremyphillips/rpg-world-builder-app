import { vocabEnumFromEntries, keysFromEntries } from './enum-schema'
import type { GameTermEntry, VocabularyTerm } from './types'

// ---------------------------------------------------------------------------
// Action economy — turn-scoped action costs shared by spells and monster actions.
// ---------------------------------------------------------------------------

export const ACTION_ECONOMY_TERM = {
  label: 'Action Economy',
  description: 'When during a turn an ability can be used.',
  sentence: {
    singular: 'action economy slot',
    plural: 'action economy slots',
  },
} as const satisfies VocabularyTerm

export const ACTION_ECONOMY_ENTRIES = {
  action: {
    label: 'Action',
    description: 'Uses an action on your turn.',
  },
  'bonus-action': {
    label: 'Bonus action',
    description: 'Uses a bonus action on your turn.',
  },
  reaction: {
    label: 'Reaction',
    description: 'Uses your reaction, usually in response to a trigger.',
  },
} as const satisfies Record<string, GameTermEntry>

export type ActionEconomyId = keyof typeof ACTION_ECONOMY_ENTRIES

export const ACTION_ECONOMY_IDS = keysFromEntries(ACTION_ECONOMY_ENTRIES)

export const actionEconomySchema = vocabEnumFromEntries(ACTION_ECONOMY_ENTRIES)

/** Returns the display label for an action economy id. Falls back to the raw value. */
export function getActionEconomyLabel(id: string): string {
  return ACTION_ECONOMY_ENTRIES[id as ActionEconomyId]?.label ?? id
}
