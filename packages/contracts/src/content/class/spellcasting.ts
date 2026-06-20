import { z } from 'zod'

import { abilitySchema } from '../../vocab/ability'
import { levelSchema } from '../../primitives/level'

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

/**
 * Cantrips known is tabular data, not a closed taxonomy, so the schema stores an
 * inline, self-contained progression. This stays open to homebrew/patches:
 * authoring a class just means editing the array (no closed enum, no shared
 * registry, no id collisions). Heuristic: `z.enum` for mechanics the engine
 * branches on; inline data for lookup tables like this one.
 */
export const cantripsKnownEntrySchema = z.object({
  level: levelSchema,
  known: z.number().int().min(0),
})

export const cantripsProgressionSchema = z.array(cantripsKnownEntrySchema)

export const spellsAvailableEntrySchema = z.object({
  level: levelSchema,
  count: z.number().int().min(0),
})

export const spellsAvailableProgressionSchema = z.array(spellsAvailableEntrySchema)

export const spellcastingSchema = z.object({
  progression: z.enum(SPELLCASTING_PROGRESSIONS),
  ability: abilitySchema,
  preparation: z.enum(SPELL_PREPARATION_MODES),
  cantrips: cantripsProgressionSchema.optional(),
  spellsAvailable: spellsAvailableProgressionSchema.optional(),
})

export type Spellcasting = z.infer<typeof spellcastingSchema>
