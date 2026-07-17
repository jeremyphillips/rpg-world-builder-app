import type { GameTermEntry } from '../types'
import { vocabEnumFromEntries } from '../enum-schema'

// ---------------------------------------------------------------------------
// Spell grant availability — per-spell access granted by traits and features.
// Distinct from class spellcasting.preparation (prepared | known | full_list).
// ---------------------------------------------------------------------------

export const SPELL_GRANT_AVAILABILITY_ENTRIES = {
  always_prepared: {
    label: 'Always prepared',
    description:
      'The spell is always on the character prepared list for this grant; cast with normal spell slots unless a separate free-cast entitlement applies.',
    sentence: {
      singular: 'always prepared',
      plural: 'always prepared',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export type SpellGrantAvailability = keyof typeof SPELL_GRANT_AVAILABILITY_ENTRIES

export const SPELL_GRANT_AVAILABILITIES = Object.keys(SPELL_GRANT_AVAILABILITY_ENTRIES) as [
  SpellGrantAvailability,
  ...SpellGrantAvailability[],
]

export const spellGrantAvailabilitySchema = vocabEnumFromEntries(SPELL_GRANT_AVAILABILITY_ENTRIES)

/** Returns the reference entry for a spell grant availability id, if known. */
export function getSpellGrantAvailabilityEntry(id: string): GameTermEntry | undefined {
  return SPELL_GRANT_AVAILABILITY_ENTRIES[id as SpellGrantAvailability]
}

/** Returns the display label for a spell grant availability. Falls back to the raw value. */
export function getSpellGrantAvailabilityLabel(id: string): string {
  return getSpellGrantAvailabilityEntry(id)?.label ?? id
}
