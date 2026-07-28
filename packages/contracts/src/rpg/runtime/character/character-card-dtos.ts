import { z } from 'zod'

// ---------------------------------------------------------------------------
// Character list card — RPG view model for player-facing character pickers.
// ---------------------------------------------------------------------------

export const characterCardCampaignSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
})

export type CharacterCardCampaign = z.infer<typeof characterCardCampaignSchema>

export const characterCardViewModelSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  summary: z.string(),
  campaign: characterCardCampaignSchema.optional(),
})

export type CharacterCardViewModelDto = z.infer<typeof characterCardViewModelSchema>
