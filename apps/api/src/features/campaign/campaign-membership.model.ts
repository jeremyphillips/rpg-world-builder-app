import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

import { CAMPAIGN_ROLES } from '@rpg/contracts'

const campaignMembershipSchema = new Schema(
  {
    campaignId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    campaignRole: { type: String, enum: CAMPAIGN_ROLES, required: true },
    controlledCharacterIds: { type: [String], default: [] },
    invitedAt: { type: Date, required: true },
    joinedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

// One membership record per (campaign, user) pair.
campaignMembershipSchema.index({ campaignId: 1, userId: 1 }, { unique: true })

export type CampaignMembershipSchemaType = InferSchemaType<typeof campaignMembershipSchema>

export const CampaignMembershipModel: Model<CampaignMembershipSchemaType> =
  (models.CampaignMembership as Model<CampaignMembershipSchemaType>) ??
  model<CampaignMembershipSchemaType>('CampaignMembership', campaignMembershipSchema)
