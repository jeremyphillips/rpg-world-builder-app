import { z } from 'zod'

import {
  abilitySchema,
  damageTypeIdSchema,
  SPELL_RESOLUTION_APPLICATION_AMOUNTS,
  SPELL_RESOLUTION_ATTACK_TYPES,
  SPELL_RESOLUTION_OUTCOME_RESULTS,
  SPELL_RESOLUTION_PROXIMITY_KINDS,
  SPELL_RESOLUTION_TARGET_KINDS,
} from '@rpg/contracts'

import { rollFormObjectSchema } from '../../../../lib/forms/mechanics/roll-form-values'
import { RESOLUTION_APPLICATION_PATTERN_FORM_KINDS } from '../application-pattern/resolution-application-pattern.lib'
import { validateResolutionFormOutcomes } from './resolution-form-outcome-validation'
import { resolutionFormValidationMessages } from './resolution-form-messages'

export const RESOLUTION_METHOD_KINDS = ['attack', 'saving-throw', 'automatic'] as const

export type ResolutionMethodKind = (typeof RESOLUTION_METHOD_KINDS)[number]

const resolutionDamageEffectFormSchema = z.object({
  id: z.string().min(1),
  kind: z.literal('damage'),
  roll: rollFormObjectSchema,
  damageType: damageTypeIdSchema,
})

const resolutionHealingEffectFormSchema = z.object({
  id: z.string().min(1),
  kind: z.literal('healing'),
  roll: rollFormObjectSchema,
})

const resolutionTemporaryHitPointsEffectFormSchema = z.object({
  id: z.string().min(1),
  kind: z.literal('temporary-hit-points'),
  roll: rollFormObjectSchema,
})

export const resolutionEffectFormItemSchema = z.discriminatedUnion('kind', [
  resolutionDamageEffectFormSchema,
  resolutionHealingEffectFormSchema,
  resolutionTemporaryHitPointsEffectFormSchema,
])

export type ResolutionEffectFormItem = z.infer<typeof resolutionEffectFormItemSchema>

export const resolutionOutcomeApplicationFormSchema = z.object({
  effectId: z.string().min(1),
  amount: z.enum(SPELL_RESOLUTION_APPLICATION_AMOUNTS),
})

export type ResolutionOutcomeApplicationFormItem = z.infer<
  typeof resolutionOutcomeApplicationFormSchema
>

export const resolutionOutcomeFormItemSchema = z.object({
  result: z.enum(SPELL_RESOLUTION_OUTCOME_RESULTS),
  note: z.string().optional(),
  applications: z.array(resolutionOutcomeApplicationFormSchema).default([]),
})

export type ResolutionOutcomeFormItem = z.infer<typeof resolutionOutcomeFormItemSchema>

export const resolutionFormSchema = z
  .object({
    targetCount: z.coerce.number().int().min(1),
    targetKind: z.enum(SPELL_RESOLUTION_TARGET_KINDS),
    proximityKind: z.enum(SPELL_RESOLUTION_PROXIMITY_KINDS),
    proximityDistanceFt: z.coerce.number().min(0).optional(),
    proximityReachDistanceFt: z.coerce.number().min(0).optional(),
    methodKind: z.enum(RESOLUTION_METHOD_KINDS),
    attackType: z.enum(SPELL_RESOLUTION_ATTACK_TYPES).optional(),
    saveAbility: abilitySchema.optional(),
    applicationPatternKind: z.enum(RESOLUTION_APPLICATION_PATTERN_FORM_KINDS).default('none'),
    projectileCount: z.coerce.number().int().min(1).optional(),
    projectileUnitLabelSingular: z.string().trim().min(1).optional(),
    projectileUnitLabelPlural: z.string().trim().min(1).optional(),
    effects: z.array(resolutionEffectFormItemSchema).min(1),
    outcomes: z.array(resolutionOutcomeFormItemSchema).optional(),
  })
  .superRefine((values, ctx) => {
    if (values.methodKind === 'attack' && !values.attackType) {
      ctx.addIssue({
        code: 'custom',
        message: resolutionFormValidationMessages.attackTypeRequired(),
        path: ['attackType'],
      })
    }

    if (values.methodKind === 'saving-throw' && !values.saveAbility) {
      ctx.addIssue({
        code: 'custom',
        message: resolutionFormValidationMessages.saveAbilityRequired(),
        path: ['saveAbility'],
      })
    }

    if (values.proximityKind === 'distance' && values.proximityDistanceFt === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: resolutionFormValidationMessages.proximityDistanceRequired(),
        path: ['proximityDistanceFt'],
      })
    }

    if (values.applicationPatternKind === 'projectiles') {
      if (values.projectileCount === undefined) {
        ctx.addIssue({
          code: 'custom',
          message: resolutionFormValidationMessages.projectileCountRequired(),
          path: ['projectileCount'],
        })
      }
    }

    validateResolutionFormOutcomes(values, ctx)
  })

export type ResolutionFormValues = z.infer<typeof resolutionFormSchema>

export const optionalResolutionFormSchema = resolutionFormSchema.optional()

export type OptionalResolutionFormValues = z.infer<typeof optionalResolutionFormSchema>
