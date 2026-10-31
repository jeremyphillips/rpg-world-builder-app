import { z } from 'zod'

import { addCustomRefinementIssue } from '../../../../lib/add-custom-refinement-issue'
import { areaGeometrySchema } from '../../../primitives/area-geometry'
import { rollSchema } from '../../../primitives/mechanics/roll'
import { abilitySchema } from '../../../vocab/ability'
import { damageTypeIdSchema } from '../../../vocab/damage/vocabulary'
import {
  RESOLUTION_APPLICATION_AMOUNTS,
  RESOLUTION_OUTCOME_RESULTS,
  RESOLUTION_SELECTION_MODES,
  RESOLUTION_TARGET_COUNT_KINDS,
  RESOLUTION_TARGET_KINDS,
  inferResolutionTargetCountKind,
  type ResolutionMethodKind,
  type ResolutionOutcomeResult,
  type ResolutionSelectionMode,
} from '../../../vocab/resolution'
import { isEffectKindAllowedForTarget } from './effect-target-compatibility'
import {
  getOutcomeResultsForMethod,
  hasMeaningfulOutcomeContent,
  supportsPartialApplicationForEffectKind,
} from './outcome-slots'
import { validateSpellResolutionMethodCompatibility } from './selection-method-compatibility'
import { validateSpellResolutionModeFields } from './selection-mode-validation'
import { isResolutionEffectKind } from './selection-availability'
import { spellResolutionValidationMessages } from './validation-messages'

const resolutionDistanceSchema = z.object({
  value: z.number().min(0),
  unit: z.literal('ft'),
})

export const resolutionSavingThrowMethodSchema = z.object({
  kind: z.literal('saving-throw'),
  ability: abilitySchema,
})

export const resolutionAutomaticMethodSchema = z.object({
  kind: z.literal('automatic'),
})

export const effectResolutionMethodSchema = z.discriminatedUnion('kind', [
  resolutionSavingThrowMethodSchema,
  resolutionAutomaticMethodSchema,
])

export type EffectResolutionMethod = z.infer<typeof effectResolutionMethodSchema>

export const resolutionEffectIdSchema = z.string().min(1).brand<'ResolutionEffectId'>()

export type ResolutionEffectId = z.infer<typeof resolutionEffectIdSchema>

export const resolutionTargetProximitySchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('touch') }),
  z.object({
    kind: z.literal('reach'),
    distance: resolutionDistanceSchema.optional(),
  }),
  z.object({
    kind: z.literal('distance'),
    distance: resolutionDistanceSchema,
  }),
])

export type ResolutionTargetProximity = z.infer<typeof resolutionTargetProximitySchema>

export const resolutionDamageEffectSchema = z.object({
  id: resolutionEffectIdSchema,
  kind: z.literal('damage'),
  roll: rollSchema,
  damageType: damageTypeIdSchema,
})

export type ResolutionDamageEffect = z.infer<typeof resolutionDamageEffectSchema>

export const resolutionHealingEffectSchema = z.object({
  id: resolutionEffectIdSchema,
  kind: z.literal('healing'),
  roll: rollSchema,
})

export type ResolutionHealingEffect = z.infer<typeof resolutionHealingEffectSchema>

export const resolutionTemporaryHitPointsEffectSchema = z.object({
  id: resolutionEffectIdSchema,
  kind: z.literal('temporary-hit-points'),
  roll: rollSchema,
})

export type ResolutionTemporaryHitPointsEffect = z.infer<
  typeof resolutionTemporaryHitPointsEffectSchema
>

export const resolutionEffectSchema = z.discriminatedUnion('kind', [
  resolutionDamageEffectSchema,
  resolutionHealingEffectSchema,
  resolutionTemporaryHitPointsEffectSchema,
])

export type ResolutionEffect = z.infer<typeof resolutionEffectSchema>

export const resolutionApplicationSchema = z.object({
  effectId: resolutionEffectIdSchema,
  amount: z.enum(RESOLUTION_APPLICATION_AMOUNTS),
})

export type ResolutionApplication = z.infer<typeof resolutionApplicationSchema>

export const resolutionOutcomeSchema = z
  .object({
    result: z.enum(RESOLUTION_OUTCOME_RESULTS),
    note: z.string().trim().optional(),
    applications: z.array(resolutionApplicationSchema).default([]),
  })
  .refine((value) => value.applications.length > 0 || Boolean(value.note?.trim()), {
    message: spellResolutionValidationMessages.outcomeRequiresApplicationOrNote(),
  })

export type ResolutionOutcome = z.infer<typeof resolutionOutcomeSchema>

export const resolutionTargetSchema = z
  .object({
    count: z.number().int().min(1),
    countKind: z.enum(RESOLUTION_TARGET_COUNT_KINDS).optional(),
    kind: z.enum(RESOLUTION_TARGET_KINDS),
    proximity: resolutionTargetProximitySchema,
  })
  .superRefine((value) => {
    value.countKind = inferResolutionTargetCountKind(value.count, value.countKind)
  })

export type ResolutionTarget = z.infer<typeof resolutionTargetSchema>

export const resolutionOriginSchema = z.object({
  proximity: z.object({
    kind: z.literal('distance'),
    distance: resolutionDistanceSchema,
  }),
})

export type ResolutionOrigin = z.infer<typeof resolutionOriginSchema>

export const resolutionSelectionModeSchema = z.enum(RESOLUTION_SELECTION_MODES)

export const effectResolutionFieldShape = {
  selectionMode: resolutionSelectionModeSchema,
  target: resolutionTargetSchema.optional(),
  origin: resolutionOriginSchema.optional(),
  areaOfEffect: areaGeometrySchema.optional(),
  effects: z.array(resolutionEffectSchema).min(1),
  outcomes: z.array(resolutionOutcomeSchema).min(1),
}

export type EffectResolutionValidationInput = {
  selectionMode: ResolutionSelectionMode
  target?: ResolutionTarget
  origin?: ResolutionOrigin
  areaOfEffect?: z.infer<typeof areaGeometrySchema>
  method: { kind: ResolutionMethodKind }
  effects: readonly ResolutionEffect[]
  outcomes: readonly {
    result: ResolutionOutcomeResult
    applications: readonly { effectId: ResolutionEffectId; amount: string }[]
    note?: string
  }[]
}

export function validateEffectResolution(
  resolution: EffectResolutionValidationInput,
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
    addCustomRefinementIssue(ctx, spellResolutionValidationMessages.duplicateEffectId(), [
      'effects',
    ])
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

    addCustomRefinementIssue(
      ctx,
      spellResolutionValidationMessages.effectKindIncompatibleWithTarget({
        kind: effect.kind,
        targetKind: resolution.target?.kind ?? 'creature',
      }),
      ['effects', effectIndex, 'kind'],
    )
  })

  if (!resolution.outcomes.some(hasMeaningfulOutcomeContent)) {
    addCustomRefinementIssue(
      ctx,
      spellResolutionValidationMessages.resolutionRequiresMeaningfulOutcome(),
      ['outcomes'],
    )
  }

  const outcomeResults = resolution.outcomes.map((outcome) => outcome.result)
  const uniqueOutcomeResults = new Set(outcomeResults)
  if (uniqueOutcomeResults.size !== outcomeResults.length) {
    addCustomRefinementIssue(ctx, spellResolutionValidationMessages.duplicateOutcomeResult(), [
      'outcomes',
    ])
  }

  const allowedResults = getOutcomeResultsForMethod(resolution.method)

  resolution.outcomes.forEach((outcome, outcomeIndex) => {
    if (!allowedResults.includes(outcome.result)) {
      addCustomRefinementIssue(
        ctx,
        spellResolutionValidationMessages.outcomeResultNotAllowedForMethod({
          result: outcome.result,
        }),
        ['outcomes', outcomeIndex, 'result'],
      )
    }

    const applicationEffectIds = outcome.applications.map((application) => application.effectId)
    const uniqueApplicationEffectIds = new Set(applicationEffectIds)
    if (uniqueApplicationEffectIds.size !== applicationEffectIds.length) {
      addCustomRefinementIssue(
        ctx,
        spellResolutionValidationMessages.duplicateOutcomeApplicationEffectId(),
        ['outcomes', outcomeIndex, 'applications'],
      )
    }

    outcome.applications.forEach((application, applicationIndex) => {
      const effect = effectById.get(application.effectId)
      if (!effect) {
        addCustomRefinementIssue(
          ctx,
          spellResolutionValidationMessages.unknownEffectReference({
            effectId: application.effectId,
          }),
          ['outcomes', outcomeIndex, 'applications', applicationIndex, 'effectId'],
        )
        return
      }

      if (application.amount === 'half' && !supportsPartialApplicationForEffectKind(effect.kind)) {
        addCustomRefinementIssue(
          ctx,
          spellResolutionValidationMessages.halfNotSupportedForEffectKind({
            kind: effect.kind,
          }),
          ['outcomes', outcomeIndex, 'applications', applicationIndex, 'amount'],
        )
      }
    })
  })
}

export const effectResolutionSchema = z
  .object({
    ...effectResolutionFieldShape,
    method: effectResolutionMethodSchema,
  })
  .strict()
  .superRefine(validateEffectResolution)

export type EffectResolution = z.infer<typeof effectResolutionSchema>

/** Envelope fields shared by spell resolution and monster saving-throw actions. */
export type ResolutionEnvelopeBase = Omit<EffectResolution, 'method'>

/** Formatter input. Attack methods are included so spell resolutions stay assignable. */
export type ResolutionFormatInput = ResolutionEnvelopeBase & {
  method: { kind: ResolutionMethodKind }
}

export const RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID = resolutionEffectIdSchema.parse('damage')

export const RESOLUTION_PRIMARY_HEALING_EFFECT_ID = resolutionEffectIdSchema.parse('healing')

export const RESOLUTION_PRIMARY_TEMPORARY_HIT_POINTS_EFFECT_ID =
  resolutionEffectIdSchema.parse('temporary-hit-points')
