import { z } from 'zod'

import { characterCampaignEligibilitySchema } from './eligibility/character-campaign-eligibility'

// ---------------------------------------------------------------------------
// Shared campaign character assignment DTOs — used by invite and membership flows.
// ---------------------------------------------------------------------------

export const campaignEligibleCharacterSchema = z.object({
  characterId: z.string().min(1),
  name: z.string().min(1),
  summary: z.string(),
  eligibility: characterCampaignEligibilitySchema,
})

export type CampaignEligibleCharacter = z.infer<typeof campaignEligibleCharacterSchema>

export const campaignEligibleCharactersResponseSchema = z.object({
  characters: z.array(campaignEligibleCharacterSchema),
})

export type CampaignEligibleCharactersResponse = z.infer<
  typeof campaignEligibleCharactersResponseSchema
>

export const completeCampaignCharacterAssignmentResultSchema = z.object({
  campaignId: z.string().min(1),
  characterId: z.string().min(1),
})

export type CompleteCampaignCharacterAssignmentResult = z.infer<
  typeof completeCampaignCharacterAssignmentResultSchema
>
