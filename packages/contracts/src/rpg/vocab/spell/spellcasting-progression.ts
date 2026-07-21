import type { GameTermEntry } from '../types'
import { vocabEnumFromEntries, keysFromEntries } from '../enum-schema'

// ---------------------------------------------------------------------------
// Spellcasting progression — full, half, and pact magic advancement tables.
// ---------------------------------------------------------------------------

export const SPELLCASTING_PROGRESSION_TERM = {
  label: 'Spellcasting Progression',
  description: 'Full, half, or pact magic slot advancement.',
  sentence: {
    singular: 'spellcasting progression',
    plural: 'spellcasting progressions',
  },
} as const satisfies GameTermEntry

export const SPELLCASTING_PROGRESSION_ENTRIES = {
  full: {
    label: 'Full caster',
    description: 'Full spell slot progression (e.g. Wizard, Cleric, Druid).',
    sentence: {
      singular: 'full caster',
      plural: 'full casters',
    },
  },
  half: {
    label: 'Half caster',
    description: 'Half spell slot progression (e.g. Paladin, Ranger).',
    sentence: {
      singular: 'half caster',
      plural: 'half casters',
    },
  },
  pact: {
    label: 'Pact Magic',
    description: 'Warlock pact magic with short-rest slot recovery.',
    sentence: {
      singular: 'pact caster',
      plural: 'pact casters',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export type SpellcastingProgression = keyof typeof SPELLCASTING_PROGRESSION_ENTRIES

export const SPELLCASTING_PROGRESSIONS = keysFromEntries(SPELLCASTING_PROGRESSION_ENTRIES)

export const spellcastingProgressionSchema = vocabEnumFromEntries(SPELLCASTING_PROGRESSION_ENTRIES)

/** Returns the reference entry for a spellcasting progression id, if known. */
export function getSpellcastingProgressionEntry(id: string): GameTermEntry | undefined {
  return SPELLCASTING_PROGRESSION_ENTRIES[id as SpellcastingProgression]
}

/** Returns the display label for a spellcasting progression. Falls back to the raw value. */
export function getSpellcastingProgressionLabel(id: string): string {
  return getSpellcastingProgressionEntry(id)?.label ?? id
}

/** Progression-table label derived from progression type (Pact Magic vs Spellcasting). */
export function spellcastingFeatureLabel(progression: SpellcastingProgression): string {
  return progression === 'pact' ? 'Pact Magic' : 'Spellcasting'
}
