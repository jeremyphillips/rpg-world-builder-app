import mongoose, { type InferSchemaType, type Model } from 'mongoose'

import { CAMPAIGN_INVITE_DELIVERY_STATUSES, CAMPAIGN_INVITE_STATUSES } from '@rpg/contracts'

const { model, models, Schema } = mongoose

const campaignInviteSchema = new Schema(
  {
    campaignId: { type: String, required: true, index: true },
    email: { type: String, required: true },
    normalizedEmail: { type: String, required: true },
    status: { type: String, enum: CAMPAIGN_INVITE_STATUSES, required: true },
    deliveryStatus: {
      type: String,
      enum: CAMPAIGN_INVITE_DELIVERY_STATUSES,
      required: true,
    },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    invitedByUserId: { type: String, required: true },
    acceptedByUserId: { type: String, default: null },
    acceptedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    completedCharacterId: { type: String, default: null },
    sentAt: { type: Date, default: null },
    deliveryErrorCode: { type: String, default: null },
    deliveryAttempts: { type: Number, default: 0 },
    lastDeliveryAttemptAt: { type: Date, default: null },
  },
  { timestamps: true },
)

campaignInviteSchema.index({ tokenHash: 1 }, { unique: true })
campaignInviteSchema.index(
  { campaignId: 1, normalizedEmail: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'accepted'] } },
  },
)

export type CampaignInviteSchemaType = InferSchemaType<typeof campaignInviteSchema>

export const CampaignInviteModel: Model<CampaignInviteSchemaType> =
  (models.CampaignInvite as Model<CampaignInviteSchemaType>) ??
  model<CampaignInviteSchemaType>('CampaignInvite', campaignInviteSchema)
