import { z } from 'zod'

/** Campaign character GET — delete UI gated via canDelete from the access resolver. */
export const campaignCharacterCapabilitiesSchema = z.object({
  canEdit: z.boolean(),
  canManage: z.boolean(),
  canDelete: z.boolean(),
})

export type CampaignCharacterGetCapabilities = z.infer<typeof campaignCharacterCapabilitiesSchema>
