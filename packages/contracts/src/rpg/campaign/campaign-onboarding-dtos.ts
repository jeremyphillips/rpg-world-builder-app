import { z } from 'zod'

import {
  campaignEligibleCharacterSchema,
  campaignEligibleCharactersResponseSchema,
  type CampaignEligibleCharacter,
  type CampaignEligibleCharactersResponse,
} from './campaign-character-assignment-dtos'

// ---------------------------------------------------------------------------
// Campaign onboarding DTOs — membership-scoped continuation (no invite coupling).
// ---------------------------------------------------------------------------

export const CAMPAIGN_ONBOARDING_MODES = ['initial', 'reconnect'] as const

export const campaignOnboardingModeSchema = z.enum(CAMPAIGN_ONBOARDING_MODES)

export type CampaignOnboardingMode = z.infer<typeof campaignOnboardingModeSchema>

export const campaignOnboardingIncompleteContextSchema = z.object({
  status: z.literal('onboarding_incomplete'),
  mode: campaignOnboardingModeSchema,
  staleCharacterId: z.string().min(1).optional(),
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

export const campaignOnboardingEligibleCharacterSchema = campaignEligibleCharacterSchema

export type CampaignOnboardingEligibleCharacter = CampaignEligibleCharacter

export const campaignOnboardingEligibleCharactersResponseSchema =
  campaignEligibleCharactersResponseSchema

export type CampaignOnboardingEligibleCharactersResponse = CampaignEligibleCharactersResponse
