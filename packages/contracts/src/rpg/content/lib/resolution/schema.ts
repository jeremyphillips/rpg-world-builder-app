import { z } from 'zod'

import { addCustomRefinementIssue } from '../../../../lib/add-custom-refinement-issue'
import { overlayOrderedList, overlayRestoreIdRows } from '../system-overlay/overlay-presets'
import { areaGeometrySchema } from '../../../primitives/area-geometry'
import { rollSchema } from '../../../primitives/mechanics/roll'
import { abilitySchema } from '../../../vocab/ability'
import { damageTypeIdSchema } from '../../../vocab/damage/vocabulary'
import {
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
import type { OrderedConditionEffect } from '../../../primitives/mechanics/ordered-effect'
import {
  resolutionOutcomeEffectSchema,
  type ResolutionOutcomeEffect,
} from './resolution-outcome-effect'

export {
  resolutionEffectReferenceSchema,
  resolutionOutcomeEffectSchema,
  type ResolutionEffectReference,
  type ResolutionOutcomeEffect,
} from './resolution-outcome-effect'
import { resolutionEffectIdSchema, type ResolutionEffectId } from './resolution-effect-id'
import {
  getAllowedOutcomeResultsForMethod,
  hasMeaningfulOutcomeContent,
  supportsPartialApplicationForEffectKind,
} from './outcome-slots'
import {
  hasMeaningfulRepeatSaveSecondFailure,
  repeatSaveSchema,
  type RepeatSave,
} from './repeat-save'
import { validateResolutionMethodCompatibility } from './selection-method-compatibility'
import { validateResolutionModeFields } from './selection-mode-validation'
import { isResolutionEffectKind } from './selection-availability'
import {
  refineRequirementsForTargetKind,
  resolutionTargetRequirementsSchema,
} from './target-requirements'
import { spellResolutionValidationMessages } from './validation-messages'

const resolutionDistanceSchema = z.object({
  value: z.number().int().positive(),
  unit: z.literal('ft').default('ft'),
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

export { resolutionEffectIdSchema, type ResolutionEffectId } from './resolution-effect-id'

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

export const resolutionOutcomeSchema = z.object({
  result: z.enum(RESOLUTION_OUTCOME_RESULTS),
  effects: overlayOrderedList(resolutionOutcomeEffectSchema).default([]),
  repeatSave: repeatSaveSchema.optional(),
})

export type ResolutionOutcome = z.infer<typeof resolutionOutcomeSchema>

export const resolutionTargetSchema = z
  .object({
    count: z.number().int().min(1),
    countKind: z.enum(RESOLUTION_TARGET_COUNT_KINDS).optional(),
    kind: z.enum(RESOLUTION_TARGET_KINDS),
    proximity: resolutionTargetProximitySchema,
    requirements: resolutionTargetRequirementsSchema.optional(),
  })
  .superRefine((value, ctx) => {
    value.countKind = inferResolutionTargetCountKind(value.count, value.countKind)
    refineRequirementsForTargetKind(value.kind, value.requirements, ctx)
  })

export type ResolutionTarget = z.infer<typeof resolutionTargetSchema>

/** Authoring default for creature targets at a distance — one creature within 5 feet. */
export const DEFAULT_RESOLUTION_TARGET = {
  count: 1,
  countKind: 'exact',
  kind: 'creature',
  proximity: { kind: 'distance', distance: { value: 5, unit: 'ft' } },
} as const satisfies ResolutionTarget

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
  occupantRequirements: resolutionTargetRequirementsSchema.optional(),
  effects: overlayRestoreIdRows(resolutionEffectSchema),
  outcomes: overlayOrderedList(resolutionOutcomeSchema).min(1),
}

export type EffectResolutionValidationInput = {
  selectionMode: ResolutionSelectionMode
  target?: ResolutionTarget
  origin?: ResolutionOrigin
  areaOfEffect?: z.infer<typeof areaGeometrySchema>
  occupantRequirements?: z.infer<typeof resolutionTargetRequirementsSchema>
  method: { kind: ResolutionMethodKind }
  effects: readonly ResolutionEffect[]
  outcomes: readonly {
    result: ResolutionOutcomeResult
    effects?: readonly ResolutionOutcomeEffect[]
    repeatSave?: RepeatSave
  }[]
}

function refineOccupantRequirementsFields(
  resolution: EffectResolutionValidationInput,
  ctx: z.RefinementCtx,
): void {
  const requirements = resolution.occupantRequirements
  if (!requirements) return

  const hasArea = Boolean(resolution.areaOfEffect)
  const areaAllowed = resolution.selectionMode === 'self' || resolution.selectionMode === 'point'
  if (!hasArea || !areaAllowed) {
    addCustomRefinementIssue(
      ctx,
      spellResolutionValidationMessages.occupantRequirementsRequireArea(),
      ['occupantRequirements'],
    )
    return
  }

  refineRequirementsForTargetKind('creature', requirements, ctx, ['occupantRequirements'])
}

type EffectResolutionValidationOptions = {
  /** Publish rejects dangling effect ids. Draft normalize leaves them in place. */
  requireKnownEffectIds?: boolean
}

function outcomeEffectLists(outcome: EffectResolutionValidationInput['outcomes'][number]): Array<{
  effects: readonly ResolutionOutcomeEffect[]
  path: (string | number)[]
}> {
  return [
    { effects: outcome.effects ?? [], path: ['effects'] },
    {
      effects: outcome.repeatSave?.secondFailure.effects ?? [],
      path: ['repeatSave', 'secondFailure', 'effects'],
    },
  ]
}

function validateOutcomeEffectList(
  outcomeIndex: number,
  effects: readonly ResolutionOutcomeEffect[],
  path: (string | number)[],
  effectById: Map<ResolutionEffectId, ResolutionEffect>,
  ctx: z.RefinementCtx,
  options: EffectResolutionValidationOptions,
): void {
  const seenReferenceIds = new Set<string>()
  effects.forEach((effect, effectIndex) => {
    if (effect.kind !== 'effect-reference') return
    if (seenReferenceIds.has(effect.effectId)) {
      addCustomRefinementIssue(
        ctx,
        spellResolutionValidationMessages.duplicateOutcomeApplicationEffectId(),
        ['outcomes', outcomeIndex, ...path],
      )
    }
    seenReferenceIds.add(effect.effectId)

    const definition = effectById.get(effect.effectId)
    if (!definition) {
      if (options.requireKnownEffectIds === false) return
      addCustomRefinementIssue(
        ctx,
        spellResolutionValidationMessages.unknownEffectReference({
          effectId: effect.effectId,
        }),
        ['outcomes', outcomeIndex, ...path, effectIndex, 'effectId'],
      )
      return
    }

    if (effect.amount === 'half' && !supportsPartialApplicationForEffectKind(definition.kind)) {
      addCustomRefinementIssue(
        ctx,
        spellResolutionValidationMessages.halfNotSupportedForEffectKind({
          kind: definition.kind,
        }),
        ['outcomes', outcomeIndex, ...path, effectIndex, 'amount'],
      )
    }
  })
}

export function validateEffectResolution(
  resolution: EffectResolutionValidationInput,
  ctx: z.RefinementCtx,
  options: EffectResolutionValidationOptions = {},
): void {
  validateResolutionModeFields(resolution, ctx)
  refineOccupantRequirementsFields(resolution, ctx)
  validateResolutionMethodCompatibility(
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

  const allowedResults = getAllowedOutcomeResultsForMethod(resolution.method)
  const failedSaveOutcome = resolution.outcomes.find((outcome) => outcome.result === 'failed-save')
  const firstFailureConditionIds = new Set(
    (failedSaveOutcome?.effects ?? [])
      .filter((effect): effect is OrderedConditionEffect => effect.kind === 'condition')
      .map((effect) => effect.conditionId),
  )

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

    for (const list of outcomeEffectLists(outcome)) {
      validateOutcomeEffectList(outcomeIndex, list.effects, list.path, effectById, ctx, options)
    }

    if (outcome.repeatSave && outcome.result !== 'failed-save') {
      addCustomRefinementIssue(
        ctx,
        spellResolutionValidationMessages.repeatSaveOnlyOnFailedSave(),
        ['outcomes', outcomeIndex, 'repeatSave'],
      )
    }

    outcome.repeatSave?.secondFailure.effects?.forEach((effect, effectIndex) => {
      if (effect.kind !== 'condition' || !effect.replacesConditionId) return
      if (!firstFailureConditionIds.has(effect.replacesConditionId)) {
        addCustomRefinementIssue(
          ctx,
          spellResolutionValidationMessages.invalidConditionReplacementReference({
            conditionId: effect.replacesConditionId,
          }),
          [
            'outcomes',
            outcomeIndex,
            'repeatSave',
            'secondFailure',
            'effects',
            effectIndex,
            'replacesConditionId',
          ],
        )
      }
    })
  })
}

/** Publish-only: repeat-save must include a meaningful second failure tier. */
export function refineRepeatSaveSecondFailureForPublish(
  resolution: EffectResolutionValidationInput,
  ctx: z.RefinementCtx,
): void {
  resolution.outcomes.forEach((outcome, outcomeIndex) => {
    if (
      outcome.repeatSave &&
      !hasMeaningfulRepeatSaveSecondFailure(outcome.repeatSave.secondFailure)
    ) {
      addCustomRefinementIssue(
        ctx,
        spellResolutionValidationMessages.repeatSaveRequiresSecondFailure(),
        ['outcomes', outcomeIndex, 'repeatSave', 'secondFailure'],
      )
    }
  })
}

export const effectResolutionSchema = z
  .object({
    ...effectResolutionFieldShape,
    method: effectResolutionMethodSchema,
  })
  .strict()
  .superRefine(validateEffectResolution)
  .superRefine(refineRepeatSaveSecondFailureForPublish)

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
