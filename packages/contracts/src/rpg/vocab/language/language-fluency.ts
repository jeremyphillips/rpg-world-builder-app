import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Creature language fluency — speaks vs understands-only (stat-block + authoring).
// ---------------------------------------------------------------------------

export const CREATURE_LANGUAGE_FLUENCY_ENTRIES = {
  speaks: {
    label: 'Speaks',
    description: 'The creature can speak the language aloud.',
  },
  'understands-only': {
    label: 'Understands only',
    description: 'The creature understands the language but cannot speak it.',
  },
} as const satisfies Record<string, GameTermEntry>

export type CreatureLanguageFluency = keyof typeof CREATURE_LANGUAGE_FLUENCY_ENTRIES

export const CREATURE_LANGUAGE_FLUENCIES = keysFromEntries(CREATURE_LANGUAGE_FLUENCY_ENTRIES)

export const creatureLanguageFluencySchema = vocabEnumFromEntries(CREATURE_LANGUAGE_FLUENCY_ENTRIES)

export function getCreatureLanguageFluencyLabel(id: string): string {
  return CREATURE_LANGUAGE_FLUENCY_ENTRIES[id as CreatureLanguageFluency]?.label ?? id
}
