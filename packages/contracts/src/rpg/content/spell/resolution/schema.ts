import { z } from 'zod'

import { areaGeometrySchema } from '../../../primitives/area-geometry'
import { rollSchema } from '../../../primitives/mechanics/roll'
import { abilitySchema } from '../../../vocab/ability'
import { damageTypeIdSchema } from '../../../vocab/damage/vocabulary'
import { normalizeSpellResolutionInput } from './normalize-resolution'
import { validateSpellResolutionMethodCompatibility } from './selection-method-compatibility'
import { validateSpellResolutionModeFields } from './selection-mode-validation'
import {
  SPELL_RESOLUTION_APPLICATION_AMOUNTS,
  SPELL_RESOLUTION_ATTACK_TYPES,
  SPELL_RESOLUTION_OUTCOME_RESULTS,
  SPELL_RESOLUTION_SELECTION_MODES,
  SPELL_RESOLUTION_TARGET_COUNT_KINDS,
  SPELL_RESOLUTION_TARGET_KINDS,
  type SpellResolutionOutcomeResult,
  type SpellResolutionSelectionMode,
} from './vocab'
import {
  getOutcomeResultsForMethod,
  hasMeaningfulOutcomeContent,
  supportsPartialApplicationForEffectKind,
} from './outcome-slots'
import { isEffectKindAllowedForTarget } from './effect-target-compatibility'
import { isResolutionEffectKind } from './selection-availability'
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

export const spellResolutionExternalTargetProximitySchema = z.discriminatedUnion('kind', [
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

export type SpellResolutionExternalTargetProximity = z.infer<
  typeof spellResolutionExternalTargetProximitySchema
>

/** Includes legacy `self` for normalization input only. */
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
  countKind: z.enum(SPELL_RESOLUTION_TARGET_COUNT_KINDS).optional(),
  kind: z.enum(SPELL_RESOLUTION_TARGET_KINDS),
  proximity: spellResolutionExternalTargetProximitySchema,
})

export type SpellResolutionTarget = z.infer<typeof spellResolutionTargetSchema>

/** Legacy input shape — accepts `proximity.self` before normalization. */
export const spellResolutionLegacyTargetSchema = z.object({
  count: z.number().int().min(1),
  countKind: z.enum(SPELL_RESOLUTION_TARGET_COUNT_KINDS).optional(),
  kind: z.enum(SPELL_RESOLUTION_TARGET_KINDS),
  proximity: spellResolutionTargetProximitySchema,
})

export const spellResolutionOriginSchema = z.object({
  proximity: z.object({
    kind: z.literal('distance'),
    distance: spellResolutionDistanceSchema,
  }),
})

export type SpellResolutionOrigin = z.infer<typeof spellResolutionOriginSchema>

export const spellResolutionSelectionModeSchema = z.enum(SPELL_RESOLUTION_SELECTION_MODES)

export const spellApplicationPatternUnitLabelSchema = z.object({
  singular: z.string().min(1),
  plural: z.string().min(1),
})

export type SpellApplicationPatternUnitLabel = z.infer<
  typeof spellApplicationPatternUnitLabelSchema
>

export const spellApplicationPatternFixedCountSchema = z.object({
  type: z.literal('fixed'),
  value: z.number().int().min(1),
})

export type SpellApplicationPatternFixedCount = z.infer<
  typeof spellApplicationPatternFixedCountSchema
>

export const spellApplicationPatternProjectilesSchema = z.object({
  kind: z.literal('projectiles'),
  count: spellApplicationPatternFixedCountSchema,
  unitLabel: spellApplicationPatternUnitLabelSchema.optional(),
  applicationMode: z.literal('per-projectile'),
})

export type SpellApplicationPatternProjectiles = z.infer<
  typeof spellApplicationPatternProjectilesSchema
>

export const spellApplicationPatternSchema = z.discriminatedUnion('kind', [
  spellApplicationPatternProjectilesSchema,
])

export type SpellApplicationPattern = z.infer<typeof spellApplicationPatternSchema>

function allowedOutcomeResultsForMethod(
  method: SpellResolutionMethod,
): readonly SpellResolutionOutcomeResult[] {
  return getOutcomeResultsForMethod(method)
}

export type SpellResolutionValidationInput = {
  selectionMode: SpellResolutionSelectionMode
  target?: SpellResolutionTarget
  origin?: SpellResolutionOrigin
  areaOfEffect?: z.infer<typeof areaGeometrySchema>
  method: SpellResolutionMethod
  effects: readonly SpellResolutionEffect[]
  outcomes: readonly {
    result: SpellResolutionOutcomeResult
    applications: readonly { effectId: SpellResolutionEffectId; amount: string }[]
    note?: string
  }[]
}

export function validateSpellResolutionReferences(
  resolution: SpellResolutionValidationInput,
  ctx: z.RefinementCtx,
): void {
  validateSpellResolutionModeFields(resolution, ctx)
  validateSpellResolutionMethodCompatibility(
    {
      selectionMode: resolution.selectionMode,
      hasAreaOfEffect: Boolean(resolution.areaOfEffect),
      method: resolution.method,
    },
    ctx,
  )

  const effectById = new Map(resolution.effects.map((effect) => [effect.id, effect]))
  const effectIds = resolution.effects.map((effect) => effect.id)
  const uniqueEffectIds = new Set(effectIds)
  if (uniqueEffectIds.size !== effectIds.length) {
    ctx.addIssue({
      code: 'custom',
      message: spellResolutionValidationMessages.duplicateEffectId(),
      path: ['effects'],
    })
  }

  const targetCompatibilityContext = {
    selectionMode: resolution.selectionMode,
    hasAreaOfEffect: Boolean(resolution.areaOfEffect),
    proximityKind: resolution.target?.proximity.kind,
    targetKind: resolution.target?.kind,
  }
  resolution.effects.forEach((effect, effectIndex) => {
    if (!isResolutionEffectKind(effect.kind)) return
    if (isEffectKindAllowedForTarget(effect.kind, targetCompatibilityContext)) return

    ctx.addIssue({
      code: 'custom',
      message: spellResolutionValidationMessages.effectKindIncompatibleWithTarget({
        kind: effect.kind,
        targetKind: resolution.target?.kind ?? 'creature',
      }),
      path: ['effects', effectIndex, 'kind'],
    })
  })

  if (!resolution.outcomes.some(hasMeaningfulOutcomeContent)) {
    ctx.addIssue({
      code: 'custom',
      message: spellResolutionValidationMessages.resolutionRequiresMeaningfulOutcome(),
      path: ['outcomes'],
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

    const applicationEffectIds = outcome.applications.map((application) => application.effectId)
    const uniqueApplicationEffectIds = new Set(applicationEffectIds)
    if (uniqueApplicationEffectIds.size !== applicationEffectIds.length) {
      ctx.addIssue({
        code: 'custom',
        message: spellResolutionValidationMessages.duplicateOutcomeApplicationEffectId(),
        path: ['outcomes', outcomeIndex, 'applications'],
      })
    }

    outcome.applications.forEach((application, applicationIndex) => {
      const effect = effectById.get(application.effectId)
      if (!effect) {
        ctx.addIssue({
          code: 'custom',
          message: spellResolutionValidationMessages.unknownEffectReference({
            effectId: application.effectId,
          }),
          path: ['outcomes', outcomeIndex, 'applications', applicationIndex, 'effectId'],
        })
        return
      }

      if (application.amount === 'half' && !supportsPartialApplicationForEffectKind(effect.kind)) {
        ctx.addIssue({
          code: 'custom',
          message: spellResolutionValidationMessages.halfNotSupportedForEffectKind({
            kind: effect.kind,
          }),
          path: ['outcomes', outcomeIndex, 'applications', applicationIndex, 'amount'],
        })
      }
    })
  })
}

const spellResolutionObjectSchema = z
  .object({
    selectionMode: spellResolutionSelectionModeSchema,
    target: spellResolutionTargetSchema.optional(),
    origin: spellResolutionOriginSchema.optional(),
    areaOfEffect: areaGeometrySchema.optional(),
    method: spellResolutionMethodSchema,
    applicationPattern: spellApplicationPatternSchema.optional(),
    effects: z.array(spellResolutionEffectSchema).min(1),
    outcomes: z.array(spellResolutionOutcomeSchema).min(1),
  })
  .superRefine(validateSpellResolutionReferences)

const spellResolutionInputSchema = z
  .object({
    selectionMode: spellResolutionSelectionModeSchema.optional(),
    target: spellResolutionLegacyTargetSchema.optional(),
    origin: spellResolutionOriginSchema.optional(),
    areaOfEffect: areaGeometrySchema.optional(),
    method: spellResolutionMethodSchema,
    applicationPattern: spellApplicationPatternSchema.optional(),
    effects: z.array(spellResolutionEffectSchema).min(1),
    outcomes: z.array(spellResolutionOutcomeSchema).min(1),
  })
  .transform((value) => normalizeSpellResolutionInput(value))

export const spellResolutionSchema = spellResolutionInputSchema.pipe(spellResolutionObjectSchema)

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
