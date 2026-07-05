import { z } from 'zod'

import { abilitySchema } from '../../vocab/ability'
import { absoluteLevelSchema } from '../../primitives/level'

// ---------------------------------------------------------------------------
// Spellcasting — progressions and preparation modes shared by class records
// and spell-slot lookup tables.
// ---------------------------------------------------------------------------

export const SPELLCASTING_PROGRESSIONS = ['full', 'half', 'pact'] as const
export type SpellcastingProgression = (typeof SPELLCASTING_PROGRESSIONS)[number]

export const SPELL_PREPARATION_MODE_LABELS = {
  prepared: 'Prepared',
  known: 'Known',
  always_prepared: 'Always prepared',
} as const

export type SpellPreparationMode = keyof typeof SPELL_PREPARATION_MODE_LABELS

export const SPELL_PREPARATION_MODES = Object.keys(SPELL_PREPARATION_MODE_LABELS) as [
  SpellPreparationMode,
  ...SpellPreparationMode[],
]

export const spellPreparationModeSchema = z.enum(SPELL_PREPARATION_MODES)

/**
 * Cantrips known is tabular data, not a closed taxonomy, so the schema stores an
 * inline, self-contained progression. This stays open to homebrew/patches:
 * authoring a class just means editing the array (no closed enum, no shared
 * registry, no id collisions). Heuristic: `z.enum` for mechanics the engine
 * branches on; inline data for lookup tables like this one.
 */
export const cantripsKnownEntrySchema = z.object({
  level: absoluteLevelSchema,
  known: z.number().int().min(0),
})

export const cantripsProgressionSchema = z.array(cantripsKnownEntrySchema)

export const spellsAvailableEntrySchema = z.object({
  level: absoluteLevelSchema,
  count: z.number().int().min(0),
})

export const spellsAvailableProgressionSchema = z.array(spellsAvailableEntrySchema)

export const DEFAULT_SPELLCASTING_LEVEL = 1 as const

export const spellcastingSchema = z.object({
  /** First class level at which this class's spellcasting block is active. Defaults to 1. */
  level: absoluteLevelSchema.default(DEFAULT_SPELLCASTING_LEVEL),
  /** SRD rules prose for the class's spellcasting feature (body HTML only). */
  description: z.string().optional(),
  progression: z.enum(SPELLCASTING_PROGRESSIONS),
  ability: abilitySchema,
  preparation: spellPreparationModeSchema,
  cantrips: cantripsProgressionSchema.optional(),
  spellsAvailable: spellsAvailableProgressionSchema.optional(),
})

export type Spellcasting = z.infer<typeof spellcastingSchema>

/** Class level at which spellcasting unlocks; undefined when the class is not a caster. */
export function spellcastingUnlockLevel(
  spellcasting: Spellcasting | undefined,
): number | undefined {
  return spellcasting?.level
}

export function isSpellcastingActiveAtLevel(
  spellcasting: Spellcasting | undefined,
  classLevel: number,
): boolean {
  const unlock = spellcastingUnlockLevel(spellcasting)
  return unlock !== undefined && classLevel >= unlock
}

/** Progression-table label derived from progression type (Pact Magic vs Spellcasting). */
export function spellcastingFeatureLabel(progression: SpellcastingProgression): string {
  return progression === 'pact' ? 'Pact Magic' : 'Spellcasting'
}
