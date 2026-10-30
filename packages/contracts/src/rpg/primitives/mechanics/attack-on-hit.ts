import { z } from 'zod'

import { damageRollValueSchema } from './effect-value'

/**
 * Additional effects that apply when an attack hits.
 * Only additional damage is modeled. Later on-hit effects extend this object.
 */
export const attackOnHitSchema = z.object({
  additionalDamage: z.array(damageRollValueSchema).min(1),
})

export type AttackOnHit = z.infer<typeof attackOnHitSchema>
