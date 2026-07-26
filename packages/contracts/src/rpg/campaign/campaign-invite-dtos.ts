import { z } from 'zod'

import { campaignInviteDeliveryStatusSchema } from '../vocab/campaign-invite-delivery-status'
import { campaignInviteStatusSchema } from '../vocab/campaign-invite-status'
import { campaignRoleSchema } from '../../shared/roles'

// ---------------------------------------------------------------------------
// Campaign invite DTOs — client-facing shapes; never expose persistence fields.
// ---------------------------------------------------------------------------

export const campaignInvitePublicResolutionSchema = z.object({
  campaignName: z.string().min(1),
  inviterDisplayName: z.string().min(1),
  invitedEmailMasked: z.string().min(1).optional(),
  status: campaignInviteStatusSchema,
  expiresAt: z.iso.datetime(),
})

export type CampaignInvitePublicResolution = z.infer<typeof campaignInvitePublicResolutionSchema>

export const campaignInviteAdminListItemSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  status: campaignInviteStatusSchema,
  deliveryStatus: campaignInviteDeliveryStatusSchema,
  expiresAt: z.iso.datetime(),
  acceptedAt: z.iso.datetime().optional(),
  completedAt: z.iso.datetime().optional(),
})

export type CampaignInviteAdminListItem = z.infer<typeof campaignInviteAdminListItemSchema>

export const campaignInviteOnboardingAcceptedContextSchema = z.object({
  status: z.literal('accepted'),
  inviteId: z.string().min(1),
  campaign: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
  }),
  membership: z.object({
    id: z.string().min(1),
    role: z.literal('pc'),
  }),
  startingLevel: z.number().int().min(1),
  expiresAt: z.iso.datetime(),
})

export type CampaignInviteOnboardingAcceptedContext = z.infer<
  typeof campaignInviteOnboardingAcceptedContextSchema
>

export const campaignInviteOnboardingCompletedContextSchema = z.object({
  status: z.literal('completed'),
  campaignId: z.string().min(1),
  characterId: z.string().min(1),
})

export type CampaignInviteOnboardingCompletedContext = z.infer<
  typeof campaignInviteOnboardingCompletedContextSchema
>

export const campaignInviteOnboardingContextSchema = z.discriminatedUnion('status', [
  campaignInviteOnboardingAcceptedContextSchema,
  campaignInviteOnboardingCompletedContextSchema,
])

export type CampaignInviteOnboardingContext = z.infer<typeof campaignInviteOnboardingContextSchema>

export const campaignPartyPcListItemSchema = z.object({
  character: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    summary: z.string(),
    campaign: z
      .object({
        id: z.string().min(1),
        name: z.string().min(1),
      })
      .optional(),
  }),
  member: z.object({
    id: z.string().min(1),
    displayName: z.string().min(1),
  }),
  roster: z.object({
    status: z.enum(['active', 'inactive', 'retired']),
    notes: z.string().optional(),
  }),
})

export type CampaignPartyPcListItem = z.infer<typeof campaignPartyPcListItemSchema>

/** Onboarding membership role is always `pc` for campaign invites. */
export const CAMPAIGN_INVITE_MEMBERSHIP_ROLE = 'pc' as const satisfies z.infer<
  typeof campaignRoleSchema
>
