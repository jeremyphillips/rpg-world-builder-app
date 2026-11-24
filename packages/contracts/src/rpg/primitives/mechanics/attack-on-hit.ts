import { z } from 'zod'

import { addCustomRefinementIssue } from '../../../lib/add-custom-refinement-issue'
import { orderedEffectSchema, orderedEffectsSchema } from './ordered-effect'

/**
 * Additional effects that apply when an attack hits, in authored order.
 * Primary attack damage stays on the attack. Conditions and notes do not
 * change the attack bonus or the damage total.
 */
export const attackOnHitEffectSchema = orderedEffectSchema

export const attackOnHitSchema = z
  .object({
    effects: orderedEffectsSchema.min(1),
  })
  .superRefine((value, ctx) => {
    value.effects.forEach((effect, index) => {
      if (effect.kind !== 'condition') return
      if (!effect.replacesConditionId) return
      addCustomRefinementIssue(
        ctx,
        'Condition replacement is not allowed on attack on-hit effects.',
        ['effects', index, 'replacesConditionId'],
      )
    })
  })

export type AttackOnHit = z.infer<typeof attackOnHitSchema>
