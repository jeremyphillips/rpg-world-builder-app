import { z } from 'zod'

import { restLimitedUseSchema } from '../../primitives/limited-use'

// ---------------------------------------------------------------------------
// Spell grant casting entitlement — slotless casting with an optional rest limit.
// Absent limitedUse means the spell can be cast at will.
// ---------------------------------------------------------------------------

export const spellGrantCastingSchema = z.object({
  mode: z.literal('free_cast'),
  limitedUse: restLimitedUseSchema.optional(),
  /** When true, the grant also permits casting via compatible spell slots (requires availability in v1). */
  allowsSlotCasting: z.boolean().optional(),
})

export type SpellGrantCasting = z.infer<typeof spellGrantCastingSchema>
