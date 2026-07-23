import mongoose, { type InferSchemaType, type Model } from 'mongoose'

import type { ContentAccessTargetType, ContentVisibilityMode } from '@rpg/contracts'

const { model, models, Schema } = mongoose

const contentCampaignAccessSchema = new Schema(
  {
    campaignId: { type: String, required: true, index: true },
    targetType: { type: String, required: true },
    targetId: { type: String, required: true },
    available: { type: Boolean, required: true },
    visibilityMode: { type: String, required: true },
    participantIds: { type: [String], required: true, default: [] },
  },
  { timestamps: true },
)

contentCampaignAccessSchema.index({ campaignId: 1, targetType: 1, targetId: 1 }, { unique: true })

export type ContentCampaignAccessDoc = InferSchemaType<typeof contentCampaignAccessSchema> & {
  targetType: ContentAccessTargetType
  visibilityMode: ContentVisibilityMode
}

export const ContentCampaignAccessModel: Model<ContentCampaignAccessDoc> =
  (models.ContentCampaignAccess as Model<ContentCampaignAccessDoc>) ??
  model<ContentCampaignAccessDoc>('ContentCampaignAccess', contentCampaignAccessSchema)
