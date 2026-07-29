import { z } from 'zod'

/** Campaign character GET v1 — delete UI not shipped yet. */
export const campaignCharacterCapabilitiesSchema = z.object({
  canEdit: z.boolean(),
  canManage: z.boolean(),
})

export type CampaignCharacterGetCapabilities = z.infer<typeof campaignCharacterCapabilitiesSchema>
