import { z } from 'zod'

import { abilitySchema } from '../../../vocab/ability'
import { absoluteLevelSchema } from '../../../primitives/level'
import {
  spellcastingFocusGearKindSchema,
  spellcastingGearKindSchema,
} from '../../../vocab/equipment/spellcasting-gear-kind'

import { classSpellSelectionSchema } from './class-spell-selection'
import {
  classSpellcastingProgressionDraftSchema,
  classSpellcastingProgressionSchema,
} from './class-spellcasting-progression'
import { refinePublishedSpellcasting } from './spellcasting-validation'

// ---------------------------------------------------------------------------
// Spellcasting — class-owned slot reference, selection rules, and progression.
// ---------------------------------------------------------------------------

export const DEFAULT_SPELLCASTING_LEVEL = 1 as const

/** Stable progression id for the class-owned cantrip ChoiceSet. */
export const CLASS_CANTRIP_CHOICE_SET_PROGRESSION_ID = 'cantrips' as const

/** Stable progression id suffixes for class spellcasting ChoiceSets. */
export const CLASS_SPELLCASTING_CHOICE_SUFFIXES = {
  cantrips: 'cantrips',
  repertoire: 'repertoire',
  prepared: 'prepared',
  spellbook: 'spellbook',
} as const

export type ClassSpellcastingChoiceSuffix =
  (typeof CLASS_SPELLCASTING_CHOICE_SUFFIXES)[keyof typeof CLASS_SPELLCASTING_CHOICE_SUFFIXES]

export const spellcastingSchema = z
  .object({
    /** Ruleset slot progression id (Full / Half / Pact / custom). */
    slotProgressionId: z.string().min(1),
    /** L1+ spell selection semantics (repertoire, prepared, spellbook). */
    spellSelection: classSpellSelectionSchema.optional(),
    /** Independent sparse capacity curves (cantrips, repertoire, prepared spells). */
    progression: classSpellcastingProgressionSchema.optional(),
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
  .superRefine((spellcasting, ctx) => {
    refinePublishedSpellcasting(spellcasting, ctx)
  })

export type Spellcasting = z.infer<typeof spellcastingSchema>

/** Draft spellcasting — same keys as published, without publish-time cross-field refines. */
export const spellcastingDraftSchema = z.object({
  slotProgressionId: z.string().min(1),
  spellSelection: classSpellSelectionSchema.optional(),
  progression: classSpellcastingProgressionDraftSchema.optional(),
  level: absoluteLevelSchema.default(DEFAULT_SPELLCASTING_LEVEL),
  description: z.string().optional(),
  ability: abilitySchema,
  requiredGear: z.array(spellcastingGearKindSchema).min(1).optional(),
  focusKinds: z.array(spellcastingFocusGearKindSchema).min(1).optional(),
  recommendedGear: z.array(spellcastingGearKindSchema).min(1).optional(),
})

export type SpellcastingDraft = z.infer<typeof spellcastingDraftSchema>

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
