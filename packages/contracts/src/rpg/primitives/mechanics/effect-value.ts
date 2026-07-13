import { z } from 'zod'

import { damageTypeIdSchema } from '../../vocab/damage/vocabulary'
import { rollSchema } from './roll'

// ---------------------------------------------------------------------------
// Roll-bearing value shapes — composable blocks for content-type effect unions.
// ---------------------------------------------------------------------------

/** Damage roll plus open damage-type vocabulary id. */
export const damageRollValueSchema = z.object({
  roll: rollSchema,
  damageType: damageTypeIdSchema,
})

export type DamageRollValue = z.infer<typeof damageRollValueSchema>

/** Healing or other non-typed roll-only payloads. */
export const healingRollValueSchema = z.object({
  roll: rollSchema,
})

export type HealingRollValue = z.infer<typeof healingRollValueSchema>
