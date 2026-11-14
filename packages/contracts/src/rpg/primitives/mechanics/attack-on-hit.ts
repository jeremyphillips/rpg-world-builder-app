import { z } from 'zod'

import { effectConditionSchema } from '../../vocab/effect-condition'
import { damageRollValueSchema } from './effect-value'

const optionalEffectDescriptionSchema = z.string().trim().min(1).optional()

const damageEffectSchema = damageRollValueSchema.extend({
  kind: z.literal('damage'),
  description: optionalEffectDescriptionSchema,
})

const conditionEffectSchema = z.object({
  kind: z.literal('condition'),
  conditionId: effectConditionSchema,
  description: optionalEffectDescriptionSchema,
})

const noteEffectSchema = z.object({
  kind: z.literal('note'),
  description: z.string().trim().min(1),
})

/**
 * Additional effects that apply when an attack hits, in authored order.
 * Primary attack damage stays on the attack. Conditions and notes do not
 * change the attack bonus or the damage total.
 */
export const attackOnHitEffectSchema = z.discriminatedUnion('kind', [
  damageEffectSchema,
  conditionEffectSchema,
  noteEffectSchema,
])

export const attackOnHitSchema = z.object({
  effects: z.array(attackOnHitEffectSchema).min(1),
})

export type AttackOnHitEffect = z.infer<typeof attackOnHitEffectSchema>
export type AttackOnHit = z.infer<typeof attackOnHitSchema>
