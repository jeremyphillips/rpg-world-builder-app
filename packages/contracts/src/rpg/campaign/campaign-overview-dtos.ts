import { z } from 'zod'

import { campaignRoleSchema } from '../../shared/roles'

// ---------------------------------------------------------------------------
// Campaign overview — member list DTOs for the dashboard overview route.
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
