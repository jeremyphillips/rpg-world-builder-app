import { z } from 'zod'

import { campaignInviteDeliveryStatusSchema } from '../../vocab/campaign-invite-delivery-status'
import { campaignInviteStatusSchema } from '../../vocab/campaign-invite-status'
import { type campaignRoleSchema } from '../../../shared/roles'

// ---------------------------------------------------------------------------
// Campaign invite DTOs — client-facing shapes; never expose persistence fields.
// ---------------------------------------------------------------------------

export const campaignInvitePublicResolutionSchema = z.object({
  campaignId: z.string().min(1),
  campaignName: z.string().min(1),
  inviterDisplayName: z.string().min(1),
  /** Full invited address — only returned to callers that already hold the invite token. */
  invitedEmail: z.string().email(),
  invitedEmailMasked: z.string().min(1).optional(),
  status: campaignInviteStatusSchema,
  expiresAt: z.iso.datetime(),
})

export type CampaignInvitePublicResolution = z.infer<typeof campaignInvitePublicResolutionSchema>

/** Authenticated invite-by-id resolve — no full invited email (anti-probing). */
export const campaignInviteAuthenticatedResolutionSchema = z.object({
  inviteId: z.string().min(1),
  campaignId: z.string().min(1),
  campaignName: z.string().min(1),
  inviterDisplayName: z.string().min(1),
  status: campaignInviteStatusSchema,
  expiresAt: z.iso.datetime(),
})

export type CampaignInviteAuthenticatedResolution = z.infer<
  typeof campaignInviteAuthenticatedResolutionSchema
>

export const acceptCampaignInviteResultSchema = z.object({
  inviteId: z.string().min(1),
  campaignId: z.string().min(1),
})

export type AcceptCampaignInviteResult = z.infer<typeof acceptCampaignInviteResultSchema>

export const campaignInviteAdminListItemSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  status: campaignInviteStatusSchema,
  deliveryStatus: campaignInviteDeliveryStatusSchema,
  expiresAt: z.iso.datetime(),
  sentAt: z.iso.datetime().optional(),
  acceptedAt: z.iso.datetime().optional(),
  completedAt: z.iso.datetime().optional(),
})

export type CampaignInviteAdminListItem = z.infer<typeof campaignInviteAdminListItemSchema>

export const campaignInviteShareLinkResultSchema = z.object({
  inviteUrl: z.url(),
})

export type CampaignInviteShareLinkResult = z.infer<typeof campaignInviteShareLinkResultSchema>

export const campaignInviteInviteeListItemSchema = z.object({
  inviteId: z.string().min(1),
  campaignId: z.string().min(1),
  campaignName: z.string().min(1),
  inviterDisplayName: z.string().min(1),
  expiresAt: z.iso.datetime(),
})

export type CampaignInviteInviteeListItem = z.infer<typeof campaignInviteInviteeListItemSchema>

export const campaignInviteInviteeListResponseSchema = z.object({
  invites: z.array(campaignInviteInviteeListItemSchema),
})

export type CampaignInviteInviteeListResponse = z.infer<
  typeof campaignInviteInviteeListResponseSchema
>

/** Onboarding membership role is always `pc` for campaign invites. */
export const CAMPAIGN_INVITE_MEMBERSHIP_ROLE = 'pc' as const satisfies z.infer<
  typeof campaignRoleSchema
>
