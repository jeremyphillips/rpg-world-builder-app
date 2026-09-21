import { z } from 'zod'

import { abilitySchema } from '../../../vocab/ability'
import {
  spellcastingFocusGearKindSchema,
  spellcastingGearKindSchema,
} from '../../../vocab/equipment/spellcasting-gear-kind'

import { classSpellSelectionSchema } from './class-spell-selection'
import {
  classSpellcastingProgressionDraftSchema,
  classSpellcastingProgressionSchema,
} from './class-spellcasting-progression'
import { spellRecommendationSchema } from './spell-recommendation'
import { refinePublishedSpellcasting } from './spellcasting-validation'

// ---------------------------------------------------------------------------
// Spellcasting — class-owned slot reference, selection rules, and progression.
// Activation level lives on the managed Spellcasting / Pact Magic feature grant.
// ---------------------------------------------------------------------------

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
    /** Advisory starting spell suggestions keyed by semantic target, not selection model. */
    recommendations: z.array(spellRecommendationSchema).optional(),
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
  ability: abilitySchema,
  requiredGear: z.array(spellcastingGearKindSchema).min(1).optional(),
  focusKinds: z.array(spellcastingFocusGearKindSchema).min(1).optional(),
  recommendedGear: z.array(spellcastingGearKindSchema).min(1).optional(),
  recommendations: z.array(spellRecommendationSchema).optional(),
})

export type SpellcastingDraft = z.infer<typeof spellcastingDraftSchema>
