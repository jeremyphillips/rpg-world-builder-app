import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

const campaignCharacterParticipationSchema = new Schema(
  {
    campaignId: { type: String, required: true, index: true },
    characterId: { type: String, required: true },
    roster: { type: Schema.Types.Mixed, required: true },
    joinedAt: { type: Date, required: true },
    leftAt: { type: Date, required: false },
  },
  { timestamps: true },
)

// At most one open participation per character (leftAt omitted = open).
campaignCharacterParticipationSchema.index(
  { characterId: 1 },
  { unique: true, partialFilterExpression: { leftAt: { $exists: false } } },
)

// Dominant list query: open participations for a campaign.
campaignCharacterParticipationSchema.index({ campaignId: 1, leftAt: 1 })

// Campaign-scoped validation and roster patch lookup.
campaignCharacterParticipationSchema.index({ campaignId: 1, characterId: 1 })

export type CampaignCharacterParticipationSchemaType = InferSchemaType<
  typeof campaignCharacterParticipationSchema
>

export const CampaignCharacterParticipationModel: Model<CampaignCharacterParticipationSchemaType> =
  (models.CampaignCharacterParticipation as Model<CampaignCharacterParticipationSchemaType>) ??
  model<CampaignCharacterParticipationSchemaType>(
    'CampaignCharacterParticipation',
    campaignCharacterParticipationSchema,
  )
