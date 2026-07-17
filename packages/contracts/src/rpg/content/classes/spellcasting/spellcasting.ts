import { z } from 'zod'

import { abilitySchema } from '../../../vocab/ability'
import { absoluteLevelSchema } from '../../../primitives/level'
import {
  spellcastingFocusGearKindSchema,
  spellcastingGearKindSchema,
} from '../../../vocab/equipment/spellcasting-gear-kind'
import { spellPreparationModeSchema } from '../../../vocab/spell/preparation-mode'
import { spellcastingProgressionSchema } from '../../../vocab/spell/spellcasting-progression'

// ---------------------------------------------------------------------------
// Spellcasting — progressions and preparation modes shared by class records
// and spell-slot lookup tables.
// ---------------------------------------------------------------------------

export {
  SPELL_PREPARATION_MODE_ENTRIES,
  SPELL_PREPARATION_MODE_LABELS,
  SPELL_PREPARATION_MODES,
  getSpellPreparationModeEntry,
  getSpellPreparationModeLabel,
  spellPreparationModeSchema,
  type SpellPreparationMode,
} from '../../../vocab/spell/preparation-mode'

export {
  SPELLCASTING_PROGRESSION_ENTRIES,
  SPELLCASTING_PROGRESSIONS,
  getSpellcastingProgressionEntry,
  getSpellcastingProgressionLabel,
  spellcastingFeatureLabel,
  spellcastingProgressionSchema,
  type SpellcastingProgression,
} from '../../../vocab/spell/spellcasting-progression'

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
  progression: spellcastingProgressionSchema,
  ability: abilitySchema,
  preparation: spellPreparationModeSchema,
  /**
   * Class-critical spellcasting gear (e.g. Wizard spellbook). Drives essential
   * equipment picker recommendations; not level-gated by spellcasting unlock.
   */
  requiredGear: z.array(spellcastingGearKindSchema).min(1).optional(),
  /**
   * Spellcasting focus kinds this class can use (arcane/druidic focus, holy
   * symbol). Drives equipment picker recommendations; when absent, focus kinds
   * are inferred from starting-equipment package contents.
   */
  focusKinds: z.array(spellcastingFocusGearKindSchema).min(1).optional(),
  /** Strong-tier spellcasting gear suggestions beyond required gear and foci. */
  recommendedGear: z.array(spellcastingGearKindSchema).min(1).optional(),
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
