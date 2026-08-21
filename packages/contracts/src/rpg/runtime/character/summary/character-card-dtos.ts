import { z } from 'zod'

import { characterRouteContextSchema } from '../../campaign/character-route-context'

// ---------------------------------------------------------------------------
// Character list card — reusable transport DTOs for player-facing pickers.
// ---------------------------------------------------------------------------

export const characterCardSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  summary: z.string(),
  classIds: z.array(z.string().min(1)).default([]),
  speciesId: z.string().min(1).optional(),
})

export type CharacterCardSummaryDto = z.infer<typeof characterCardSummarySchema>

export const characterCardCampaignSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
})

export type CharacterCardCampaign = z.infer<typeof characterCardCampaignSchema>

export const campaignCharacterCardSchema = characterCardSummarySchema.extend({
  campaign: characterCardCampaignSchema.optional(),
})

export type CampaignCharacterCardDto = z.infer<typeof campaignCharacterCardSchema>

export const personalCharacterCardSchema = characterCardSummarySchema.extend({
  routeContext: characterRouteContextSchema,
})

export type PersonalCharacterCardDto = z.infer<typeof personalCharacterCardSchema>

export const organizationCharacterCardSchema = characterCardSummarySchema.extend({
  characterType: z.enum(['pc', 'npc']),
})

export type OrganizationCharacterCardDto = z.infer<typeof organizationCharacterCardSchema>

/** Transport summary for a character sheet row. Not a UI view model. */
export const characterSummaryDtoSchema = characterCardSummarySchema

export type CharacterSummaryDto = z.infer<typeof characterSummaryDtoSchema>
