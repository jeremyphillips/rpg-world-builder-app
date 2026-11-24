import { z } from 'zod'

import { characterTypeSchema } from '../pc-npc-identity'
import { characterCardSummarySchema } from './character-card-dtos'

/** A character that references campaign content from its saved sheet. */
export const referencingCharacterSummarySchema = z.object({
  characterType: characterTypeSchema,
  character: characterCardSummarySchema,
})

export type ReferencingCharacterSummary = z.infer<typeof referencingCharacterSummarySchema>
