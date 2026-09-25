import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

const mediaUploadSessionSchema = new Schema(
  {
    _id: { type: String, required: true },
    scopeKind: {
      type: String,
      required: true,
      enum: ['campaign-content', 'campaign-identity', 'campaign-npc', 'campaign-pc', 'user-pc'],
    },
    scopeKey: { type: String, required: true, index: true },
    campaignId: { type: String },
    userId: { type: String },
    createdByUserId: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
)

export type MediaUploadSessionDoc = InferSchemaType<typeof mediaUploadSessionSchema> & {
  _id: string
  createdAt: Date
}

export const MediaUploadSessionModel: Model<MediaUploadSessionDoc> =
  (models.MediaUploadSession as Model<MediaUploadSessionDoc>) ??
  model<MediaUploadSessionDoc>('MediaUploadSession', mediaUploadSessionSchema)
