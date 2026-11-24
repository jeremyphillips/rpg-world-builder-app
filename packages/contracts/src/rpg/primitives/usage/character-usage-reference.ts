import { z } from 'zod'

import { characterTypeSchema } from '../../runtime/character/pc-npc-identity'

/** Character-shaped usage reference shared by blockers and informational usage reads. */
export const characterUsageReferenceSchema = z.object({
  kind: z.literal('character'),
  id: z.string(),
  label: z.string(),
  characterType: characterTypeSchema,
  /** Present for NPCs; omitted for standalone PCs. Dashboard uses for link resolution. */
  campaignId: z.string().optional(),
})

export type CharacterUsageReference = z.infer<typeof characterUsageReferenceSchema>
