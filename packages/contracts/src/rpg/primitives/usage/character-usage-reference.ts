import { z } from 'zod'

/** Character-shaped usage reference shared by blockers and informational usage reads. */
export const characterUsageReferenceSchema = z.object({
  kind: z.literal('character'),
  id: z.string(),
  label: z.string(),
  characterType: z.enum(['pc', 'npc']),
  /** Present for NPCs; omitted for standalone PCs. Dashboard uses for link resolution. */
  campaignId: z.string().optional(),
})

export type CharacterUsageReference = z.infer<typeof characterUsageReferenceSchema>
