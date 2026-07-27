import { z } from 'zod'

import { campaignRoleSchema } from '../../shared/roles'
import { pcCharacterSchema } from '../runtime/character/sheet'

// ---------------------------------------------------------------------------
// Campaign overview — composed list DTOs for the dashboard overview route.
// ---------------------------------------------------------------------------

export const campaignOverviewMemberOnboardingStateSchema = z.enum([
  'character_added',
  'onboarding_incomplete',
])

export type CampaignOverviewMemberOnboardingState = z.infer<
  typeof campaignOverviewMemberOnboardingStateSchema
>

export const campaignOverviewMemberListItemSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  role: campaignRoleSchema,
  onboardingState: campaignOverviewMemberOnboardingStateSchema.optional(),
  inviteAcceptedAt: z.iso.datetime().optional(),
})

export type CampaignOverviewMemberListItem = z.infer<typeof campaignOverviewMemberListItemSchema>

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

export const pcCharacterListItemSchema = pcCharacterSchema.extend({
  campaign: characterCardCampaignSchema.optional(),
})

export type PcCharacterListItem = z.infer<typeof pcCharacterListItemSchema>
