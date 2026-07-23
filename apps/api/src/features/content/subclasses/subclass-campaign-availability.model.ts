import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

const subclassCampaignAvailabilitySchema = new Schema(
  {
    campaignId: { type: String, required: true, index: true },
    targetId: { type: String, required: true },
    activeInCampaign: { type: Boolean, required: true },
  },
  { timestamps: true },
)

subclassCampaignAvailabilitySchema.index({ campaignId: 1, targetId: 1 }, { unique: true })

export type SubclassCampaignAvailabilitySchemaType = InferSchemaType<
  typeof subclassCampaignAvailabilitySchema
>

export const SubclassCampaignAvailabilityModel: Model<SubclassCampaignAvailabilitySchemaType> =
  (models.SubclassCampaignAvailability as Model<SubclassCampaignAvailabilitySchemaType>) ??
  model<SubclassCampaignAvailabilitySchemaType>(
    'SubclassCampaignAvailability',
    subclassCampaignAvailabilitySchema,
  )
