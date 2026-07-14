import { z } from 'zod'

import { rollSchema } from '../../../primitives/mechanics/roll'
import { abilitySchema } from '../../../vocab/ability'
import { damageTypeIdSchema } from '../../../vocab/damage/vocabulary'
import {
  SPELL_RESOLUTION_APPLICATION_AMOUNTS,
  SPELL_RESOLUTION_ATTACK_TYPES,
  SPELL_RESOLUTION_OUTCOME_RESULTS,
  SPELL_RESOLUTION_OUTCOME_RESULTS_BY_METHOD,
  SPELL_RESOLUTION_TARGET_KINDS,
  type SpellResolutionOutcomeResult,
} from './vocab'
import { spellResolutionValidationMessages } from './validation-messages'

// ---------------------------------------------------------------------------
// Spell resolution — contextual envelope for targets (with proximity), method,
// effects, and outcome applications. Optional on spell body until persistence lands.
// ---------------------------------------------------------------------------

export const spellResolutionEffectIdSchema = z.string().min(1).brand<'SpellResolutionEffectId'>()

export type SpellResolutionEffectId = z.infer<typeof spellResolutionEffectIdSchema>

export const spellResolutionMethodSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('attack'),
    attackType: z.enum(SPELL_RESOLUTION_ATTACK_TYPES),
  }),
  z.object({
    kind: z.literal('saving-throw'),
    ability: abilitySchema,
  }),
  z.object({
    kind: z.literal('automatic'),
  }),
])

export type SpellResolutionMethod = z.infer<typeof spellResolutionMethodSchema>

const spellResolutionDistanceSchema = z.object({
  value: z.number().min(0),
  unit: z.literal('ft'),
})

export const spellResolutionTargetProximitySchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('self') }),
  z.object({ kind: z.literal('touch') }),
  z.object({
    kind: z.literal('reach'),
    distance: spellResolutionDistanceSchema.optional(),
  }),
  z.object({
    kind: z.literal('distance'),
    distance: spellResolutionDistanceSchema,
  }),
])

export type SpellResolutionTargetProximity = z.infer<typeof spellResolutionTargetProximitySchema>

/** @deprecated Use spellResolutionTargetProximitySchema */
export const spellResolutionRangeSchema = spellResolutionTargetProximitySchema

/** @deprecated Use SpellResolutionTargetProximity */
export type SpellResolutionRange = SpellResolutionTargetProximity

export const spellResolutionDamageEffectSchema = z.object({
  id: spellResolutionEffectIdSchema,
  kind: z.literal('damage'),
  roll: rollSchema,
  damageType: damageTypeIdSchema,
})

export type SpellResolutionDamageEffect = z.infer<typeof spellResolutionDamageEffectSchema>

export const spellResolutionHealingEffectSchema = z.object({
  id: spellResolutionEffectIdSchema,
  kind: z.literal('healing'),
  roll: rollSchema,
})

export type SpellResolutionHealingEffect = z.infer<typeof spellResolutionHealingEffectSchema>

export const spellResolutionTemporaryHitPointsEffectSchema = z.object({
  id: spellResolutionEffectIdSchema,
  kind: z.literal('temporary-hit-points'),
  roll: rollSchema,
})

export type SpellResolutionTemporaryHitPointsEffect = z.infer<
  typeof spellResolutionTemporaryHitPointsEffectSchema
>

export const spellResolutionEffectSchema = z.discriminatedUnion('kind', [
  spellResolutionDamageEffectSchema,
  spellResolutionHealingEffectSchema,
  spellResolutionTemporaryHitPointsEffectSchema,
])

export type SpellResolutionEffect = z.infer<typeof spellResolutionEffectSchema>

export const spellResolutionApplicationSchema = z.object({
  effectId: spellResolutionEffectIdSchema,
  amount: z.enum(SPELL_RESOLUTION_APPLICATION_AMOUNTS),
})

export type SpellResolutionApplication = z.infer<typeof spellResolutionApplicationSchema>

export const spellResolutionOutcomeSchema = z
  .object({
    result: z.enum(SPELL_RESOLUTION_OUTCOME_RESULTS),
    note: z.string().trim().optional(),
    applications: z.array(spellResolutionApplicationSchema).default([]),
  })
  .refine((value) => value.applications.length > 0 || Boolean(value.note?.trim()), {
    message: spellResolutionValidationMessages.outcomeRequiresApplicationOrNote(),
  })

export type SpellResolutionOutcome = z.infer<typeof spellResolutionOutcomeSchema>

export const spellResolutionTargetSchema = z.object({
  count: z.number().int().min(1),
  kind: z.enum(SPELL_RESOLUTION_TARGET_KINDS),
  proximity: spellResolutionTargetProximitySchema,
})

export type SpellResolutionTarget = z.infer<typeof spellResolutionTargetSchema>

function allowedOutcomeResultsForMethod(
  method: SpellResolutionMethod,
): readonly SpellResolutionOutcomeResult[] {
  return SPELL_RESOLUTION_OUTCOME_RESULTS_BY_METHOD[method.kind]
}

export function validateSpellResolutionReferences(
  resolution: {
    method: SpellResolutionMethod
    effects: readonly { id: SpellResolutionEffectId }[]
    outcomes: readonly {
      result: SpellResolutionOutcomeResult
      applications: readonly { effectId: SpellResolutionEffectId }[]
    }[]
  },
  ctx: z.RefinementCtx,
): void {
  const effectIds = resolution.effects.map((effect) => effect.id)
  const uniqueEffectIds = new Set(effectIds)
  if (uniqueEffectIds.size !== effectIds.length) {
    ctx.addIssue({
      code: 'custom',
      message: spellResolutionValidationMessages.duplicateEffectId(),
      path: ['effects'],
    })
  }

  const outcomeResults = resolution.outcomes.map((outcome) => outcome.result)
  const uniqueOutcomeResults = new Set(outcomeResults)
  if (uniqueOutcomeResults.size !== outcomeResults.length) {
    ctx.addIssue({
      code: 'custom',
      message: spellResolutionValidationMessages.duplicateOutcomeResult(),
      path: ['outcomes'],
    })
  }

  const allowedResults = allowedOutcomeResultsForMethod(resolution.method)

  resolution.outcomes.forEach((outcome, outcomeIndex) => {
    if (!allowedResults.includes(outcome.result)) {
      ctx.addIssue({
        code: 'custom',
        message: spellResolutionValidationMessages.outcomeResultNotAllowedForMethod({
          result: outcome.result,
        }),
        path: ['outcomes', outcomeIndex, 'result'],
      })
    }

    outcome.applications.forEach((application, applicationIndex) => {
      if (!uniqueEffectIds.has(application.effectId)) {
        ctx.addIssue({
          code: 'custom',
          message: spellResolutionValidationMessages.unknownEffectReference({
            effectId: application.effectId,
          }),
          path: ['outcomes', outcomeIndex, 'applications', applicationIndex, 'effectId'],
        })
      }
    })
  })
}

export const spellResolutionSchema = z
  .object({
    target: spellResolutionTargetSchema,
    method: spellResolutionMethodSchema,
    effects: z.array(spellResolutionEffectSchema).min(1),
    outcomes: z.array(spellResolutionOutcomeSchema).min(1),
  })
  .superRefine(validateSpellResolutionReferences)

export type SpellResolution = z.infer<typeof spellResolutionSchema>

/** Primary damage effect id used by MVP authoring presets. */
export const SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID =
  spellResolutionEffectIdSchema.parse('damage')

/** Primary healing effect id used by catalog resolution seeds. */
export const SPELL_RESOLUTION_PRIMARY_HEALING_EFFECT_ID =
  spellResolutionEffectIdSchema.parse('healing')

/** Primary temporary hit points effect id used by catalog resolution seeds. */
export const SPELL_RESOLUTION_PRIMARY_TEMPORARY_HIT_POINTS_EFFECT_ID =
  spellResolutionEffectIdSchema.parse('temporary-hit-points')
