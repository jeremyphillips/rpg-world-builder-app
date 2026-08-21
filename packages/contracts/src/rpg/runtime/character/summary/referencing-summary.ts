import { z } from 'zod'

import { characterCardSummarySchema } from './character-card-dtos'

/** A character that references campaign content from its saved sheet. */
export const referencingCharacterSummarySchema = z.object({
  characterType: z.enum(['pc', 'npc']),
  character: characterCardSummarySchema,
})

export type ReferencingCharacterSummary = z.infer<typeof referencingCharacterSummarySchema>
