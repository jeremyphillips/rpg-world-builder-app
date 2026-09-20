import { z } from 'zod'

import { abilitySchema } from '../../../vocab/ability'
import { absoluteLevelSchema } from '../../../primitives/level'
import {
  spellcastingFocusGearKindSchema,
  spellcastingGearKindSchema,
} from '../../../vocab/equipment/spellcasting-gear-kind'

// ---------------------------------------------------------------------------
// Spellcasting — class reference to a ruleset spellcasting profile plus
// class-owned ability, gear, unlock level, and prose.
// ---------------------------------------------------------------------------

export const DEFAULT_SPELLCASTING_LEVEL = 1 as const

export const spellcastingSchema = z.object({
  /** Ruleset spellcasting profile id (see spellcasting progression seed). */
  profileId: z.string().min(1),
  /** First class level at which this class's spellcasting block is active. Defaults to 1. */
  level: absoluteLevelSchema.default(DEFAULT_SPELLCASTING_LEVEL),
  /** SRD rules prose for the class's spellcasting feature (body HTML only). */
  description: z.string().optional(),
  ability: abilitySchema,
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
