import { z } from 'zod'

// ---------------------------------------------------------------------------
// Character build acquisition — stable wire/context shape for builder entry.
// ---------------------------------------------------------------------------

export const characterBuildAcquisitionSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('standalone') }),
  z.object({
    kind: z.literal('campaign_npc'),
    campaignId: z.string().min(1),
  }),
  z.object({
    kind: z.literal('campaign_pc_onboarding'),
    campaignId: z.string().min(1),
  }),
])

export type CharacterBuildAcquisition = z.infer<typeof characterBuildAcquisitionSchema>
