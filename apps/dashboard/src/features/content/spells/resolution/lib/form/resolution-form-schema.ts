import {
  abilitySchema,
  damageTypeIdSchema,
  SPELL_RESOLUTION_APPLICATION_AMOUNTS,
  SPELL_RESOLUTION_ATTACK_TYPES,
  SPELL_RESOLUTION_EXTERNAL_PROXIMITY_KINDS,
  SPELL_RESOLUTION_OUTCOME_RESULTS,
  SPELL_RESOLUTION_SELECTION_MODES,
  SPELL_RESOLUTION_TARGET_COUNT_KINDS,
  SPELL_RESOLUTION_TARGET_KINDS,
} from '@rpg/contracts'
import { z } from 'zod'

import { rollFormObjectSchema } from '../../../../lib/forms/mechanics/roll-form-values'
import { RESOLUTION_APPLICATION_PATTERN_FORM_KINDS } from '../application-pattern/resolution-application-pattern.lib'
import { validateResolutionFormSelection } from './resolution-form-selection-validation'

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

const resolutionAreaFormSchema = z.object({
  shape: z.string(),
  radius: z.object({ value: z.coerce.number(), unit: z.literal('ft').optional() }).optional(),
  length: z.object({ value: z.coerce.number(), unit: z.literal('ft').optional() }).optional(),
  width: z.object({ value: z.coerce.number(), unit: z.literal('ft').optional() }).optional(),
  size: z.object({ value: z.coerce.number(), unit: z.literal('ft').optional() }).optional(),
  height: z.object({ value: z.coerce.number(), unit: z.literal('ft').optional() }).optional(),
  description: z.string().optional(),
})

export const resolutionFormSchema = z
  .object({
    selectionMode: z.enum(SPELL_RESOLUTION_SELECTION_MODES).default('targets'),
    targetCount: z.coerce.number().int().min(1).default(1),
    countKind: z.enum(SPELL_RESOLUTION_TARGET_COUNT_KINDS).optional(),
    targetKind: z.enum(SPELL_RESOLUTION_TARGET_KINDS).default('creature-or-object'),
    proximityKind: z.enum(SPELL_RESOLUTION_EXTERNAL_PROXIMITY_KINDS).default('touch'),
    proximityDistanceFt: z.coerce.number().min(0).optional(),
    proximityReachDistanceFt: z.coerce.number().min(0).optional(),
    originDistanceFt: z.coerce.number().min(0).optional(),
    areaOfEffect: resolutionAreaFormSchema.optional(),
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
  .superRefine(validateResolutionFormSelection)

export type ResolutionFormValues = z.infer<typeof resolutionFormSchema>

export const optionalResolutionFormSchema = resolutionFormSchema.optional()

export type OptionalResolutionFormValues = z.infer<typeof optionalResolutionFormSchema>
