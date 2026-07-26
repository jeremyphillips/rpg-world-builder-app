import { z } from 'zod'

import { characterRosterStatusSchema } from '../vocab/character-roster-status'

export const characterRosterStateSchema = z.object({
  status: characterRosterStatusSchema,
  note: z.string().optional(),
  changedAt: z.string().datetime().optional(),
})

export type CharacterRosterState = z.infer<typeof characterRosterStateSchema>
