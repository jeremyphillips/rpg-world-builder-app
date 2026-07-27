import { z } from 'zod'

import { createCharacterInputSchema } from '../runtime/character/create-input'
import { characterCampaignEligibilitySchema } from './eligibility/character-campaign-eligibility'

// ---------------------------------------------------------------------------
// Campaign onboarding DTOs — membership-scoped continuation (no invite coupling).
// ---------------------------------------------------------------------------

export const campaignOnboardingIncompleteContextSchema = z.object({
  status: z.literal('onboarding_incomplete'),
  campaignId: z.string().min(1),
  campaign: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
  }),
  startingLevel: z.number().int().min(1),
})

export type CampaignOnboardingIncompleteContext = z.infer<
  typeof campaignOnboardingIncompleteContextSchema
>

export const campaignOnboardingCompleteContextSchema = z.object({
  status: z.literal('complete'),
  campaignId: z.string().min(1),
  characterId: z.string().min(1).optional(),
})

export type CampaignOnboardingCompleteContext = z.infer<
  typeof campaignOnboardingCompleteContextSchema
>

export const campaignOnboardingContextSchema = z.discriminatedUnion('status', [
  campaignOnboardingIncompleteContextSchema,
  campaignOnboardingCompleteContextSchema,
])

export type CampaignOnboardingContext = z.infer<typeof campaignOnboardingContextSchema>

export const campaignOnboardingEligibleCharacterSchema = z.object({
  characterId: z.string().min(1),
  name: z.string().min(1),
  summary: z.string(),
  eligibility: characterCampaignEligibilitySchema,
})

export type CampaignOnboardingEligibleCharacter = z.infer<
  typeof campaignOnboardingEligibleCharacterSchema
>

export const campaignOnboardingEligibleCharactersResponseSchema = z.object({
  characters: z.array(campaignOnboardingEligibleCharacterSchema),
})

export type CampaignOnboardingEligibleCharactersResponse = z.infer<
  typeof campaignOnboardingEligibleCharactersResponseSchema
>

export const completeCampaignOnboardingWithExistingCharacterInputSchema = z.object({
  source: z.literal('existing'),
  characterId: z.string().min(1),
})

export type CompleteCampaignOnboardingWithExistingCharacterInput = z.infer<
  typeof completeCampaignOnboardingWithExistingCharacterInputSchema
>

export const completeCampaignOnboardingWithNewCharacterInputSchema = z.object({
  source: z.literal('new'),
  character: createCharacterInputSchema,
})

export type CompleteCampaignOnboardingWithNewCharacterInput = z.infer<
  typeof completeCampaignOnboardingWithNewCharacterInputSchema
>

export const completeCampaignOnboardingInputSchema = z.discriminatedUnion('source', [
  completeCampaignOnboardingWithExistingCharacterInputSchema,
  completeCampaignOnboardingWithNewCharacterInputSchema,
])

export type CompleteCampaignOnboardingInput = z.infer<typeof completeCampaignOnboardingInputSchema>

export const completeCampaignOnboardingResultSchema = z.object({
  campaignId: z.string().min(1),
  characterId: z.string().min(1),
})

export type CompleteCampaignOnboardingResult = z.infer<
  typeof completeCampaignOnboardingResultSchema
>
