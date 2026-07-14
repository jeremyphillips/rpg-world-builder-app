import { z } from 'zod'

import {
  abilitySchema,
  damageTypeIdSchema,
  SPELL_RESOLUTION_ATTACK_TYPES,
  SPELL_RESOLUTION_RANGE_KINDS,
  SPELL_RESOLUTION_TARGET_KINDS,
} from '@rpg/contracts'

import { rollFormObjectSchema } from '../../../lib/forms/mechanics/roll-form-values'
import { resolutionFormValidationMessages } from './resolution-form-messages'

export const RESOLUTION_METHOD_KINDS = ['attack', 'saving-throw'] as const

export type ResolutionMethodKind = (typeof RESOLUTION_METHOD_KINDS)[number]

export const resolutionFormSchema = z
  .object({
    targetCount: z.coerce.number().int().min(1),
    targetKind: z.enum(SPELL_RESOLUTION_TARGET_KINDS),
    methodKind: z.enum(RESOLUTION_METHOD_KINDS),
    attackType: z.enum(SPELL_RESOLUTION_ATTACK_TYPES).optional(),
    saveAbility: abilitySchema.optional(),
    rangeKind: z.enum(SPELL_RESOLUTION_RANGE_KINDS),
    rangeDistanceFt: z.coerce.number().min(0).optional(),
    reachDistanceFt: z.coerce.number().min(0).optional(),
    damageRoll: rollFormObjectSchema,
    damageType: damageTypeIdSchema.optional(),
    hitNote: z.string().optional(),
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

    if (values.rangeKind === 'distance' && values.rangeDistanceFt === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: resolutionFormValidationMessages.rangeDistanceRequired(),
        path: ['rangeDistanceFt'],
      })
    }
  })

export type ResolutionFormValues = z.infer<typeof resolutionFormSchema>

export const optionalResolutionFormSchema = resolutionFormSchema.optional()

export type OptionalResolutionFormValues = z.infer<typeof optionalResolutionFormSchema>
