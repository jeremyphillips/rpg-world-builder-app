import { z } from 'zod'

import { completeCampaignCharacterAssignmentResultSchema } from '../campaign/campaign-character-assignment-dtos'
import { createCharacterInputSchema } from './character/create-input'

// ---------------------------------------------------------------------------
// Campaign onboarding completion input — runtime layer (references create-input).
// Context/eligibility DTOs stay in rpg/campaign/.
// ---------------------------------------------------------------------------

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

export const completeCampaignOnboardingResultSchema =
  completeCampaignCharacterAssignmentResultSchema

export type CompleteCampaignOnboardingResult = z.infer<
  typeof completeCampaignOnboardingResultSchema
>
