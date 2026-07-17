import type { GameTermEntry } from '../types'
import { vocabEnumFromEntries } from '../enum-schema'

// ---------------------------------------------------------------------------
// Spell grant casting mode — how trait- and feature-granted spells are cast.
// Shared by catalog grants, dashboard forms, and JSON Schema authoring.
// ---------------------------------------------------------------------------

export const SPELL_GRANT_CASTING_MODE_ENTRIES = {
  free_cast: {
    label: 'Free cast',
    description:
      'Slotless casting via a usage frequency (e.g. racial lineage spells cast at will or per long rest).',
    sentence: {
      singular: 'free cast',
      plural: 'free cast',
    },
  },
  always_prepared: {
    label: 'Always prepared',
    description:
      'Always on the prepared list; cast with normal spell slots when used (e.g. high-level class features).',
    sentence: {
      singular: 'always prepared',
      plural: 'always prepared',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export type SpellGrantCastingMode = keyof typeof SPELL_GRANT_CASTING_MODE_ENTRIES

export const SPELL_GRANT_CASTING_MODES = Object.keys(SPELL_GRANT_CASTING_MODE_ENTRIES) as [
  SpellGrantCastingMode,
  ...SpellGrantCastingMode[],
]

export const spellGrantCastingModeSchema = vocabEnumFromEntries(SPELL_GRANT_CASTING_MODE_ENTRIES)

/** Returns the reference entry for a spell grant casting mode id, if known. */
export function getSpellGrantCastingModeEntry(id: string): GameTermEntry | undefined {
  return SPELL_GRANT_CASTING_MODE_ENTRIES[id as SpellGrantCastingMode]
}

/** Returns the display label for a spell grant casting mode. Falls back to the raw value. */
export function getSpellGrantCastingModeLabel(id: string): string {
  return getSpellGrantCastingModeEntry(id)?.label ?? id
}
