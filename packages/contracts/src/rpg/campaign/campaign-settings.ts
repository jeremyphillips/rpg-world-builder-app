import { z } from 'zod'

/** Usage blocker code when a world is referenced as the campaign primary world. */
export const CAMPAIGN_PRIMARY_WORLD_RULE_CODE = 'campaign.settings.primaryWorldId' as const

export const campaignSettingsSchema = z.object({
  /** Optional default world for location authoring — multiple worlds remain allowed. */
  primaryWorldId: z.string().min(1).optional(),
})

export type CampaignSettings = z.infer<typeof campaignSettingsSchema>

/** Partial settings patch — `null` clears `primaryWorldId`. */
export const updateCampaignSettingsInputSchema = z.object({
  primaryWorldId: z.union([z.string().min(1), z.null()]).optional(),
})

export type UpdateCampaignSettingsInput = z.infer<typeof updateCampaignSettingsInputSchema>
