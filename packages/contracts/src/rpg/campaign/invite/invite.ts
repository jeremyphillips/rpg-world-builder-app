import { z } from 'zod'

import { campaignInviteDeliveryStatusSchema } from '../../vocab/campaign-invite-delivery-status'
import { campaignInviteStatusSchema } from '../../vocab/campaign-invite-status'

// ---------------------------------------------------------------------------
// Campaign invite — persistence shape for player onboarding invitations.
// Raw tokens are never stored; only tokenHash is persisted.
// ---------------------------------------------------------------------------

export const CAMPAIGN_INVITE_EXPIRY_DAYS = 7

export const campaignInviteRecipientInputSchema = z.object({
  email: z.email(),
})

export type CampaignInviteRecipientInput = z.infer<typeof campaignInviteRecipientInputSchema>

export const campaignInviteSchema = z.object({
  id: z.string().min(1),
  campaignId: z.string().min(1),
  email: z.string().email(),
  normalizedEmail: z.string().min(1),
  status: campaignInviteStatusSchema,
  deliveryStatus: campaignInviteDeliveryStatusSchema,
  tokenHash: z.string().min(1),
  expiresAt: z.iso.datetime(),
  invitedByUserId: z.string().min(1),
  acceptedByUserId: z.string().min(1).optional(),
  acceptedAt: z.iso.datetime().optional(),
  completedAt: z.iso.datetime().optional(),
  completedCharacterId: z.string().min(1).optional(),
  sentAt: z.iso.datetime().optional(),
  deliveryErrorCode: z.string().min(1).optional(),
  deliveryAttempts: z.number().int().min(0),
  lastDeliveryAttemptAt: z.iso.datetime().optional(),
  revokedAt: z.iso.datetime().optional(),
  revokedByUserId: z.string().min(1).optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type CampaignInvite = z.infer<typeof campaignInviteSchema>

export const createCampaignInviteInputSchema = z.object({
  campaignId: z.string().min(1),
  email: z.string().email(),
  normalizedEmail: z.string().min(1),
  tokenHash: z.string().min(1),
  expiresAt: z.iso.datetime(),
  invitedByUserId: z.string().min(1),
})

export type CreateCampaignInviteInput = z.infer<typeof createCampaignInviteInputSchema>

export const campaignInviteEmailsInputSchema = z.array(campaignInviteRecipientInputSchema).max(10)

export type CampaignInviteEmailsInput = z.infer<typeof campaignInviteEmailsInputSchema>
