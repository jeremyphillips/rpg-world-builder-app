import { z } from 'zod'

import { usageFrequencySchema } from '../usage-frequency'

// ---------------------------------------------------------------------------
// Spell grant casting entitlement — slotless casting via usage frequency.
// ---------------------------------------------------------------------------

export const spellGrantCastingSchema = z.object({
  mode: z.literal('free_cast'),
  frequency: usageFrequencySchema,
  /** When true, the grant also permits casting via compatible spell slots (requires availability in v1). */
  allowsSlotCasting: z.boolean().optional(),
})

export type SpellGrantCasting = z.infer<typeof spellGrantCastingSchema>
