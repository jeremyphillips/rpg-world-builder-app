import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

const mediaUploadIdempotencySchema = new Schema(
  {
    sessionId: { type: String, required: true },
    idempotencyKey: { type: String, required: true },
    contentHash: { type: String, required: true },
    assetId: { type: String, required: true },
  },
  { timestamps: true },
)

mediaUploadIdempotencySchema.index({ sessionId: 1, idempotencyKey: 1 }, { unique: true })

export type MediaUploadIdempotencyDoc = InferSchemaType<typeof mediaUploadIdempotencySchema>

export const MediaUploadIdempotencyModel: Model<MediaUploadIdempotencyDoc> =
  (models.MediaUploadIdempotency as Model<MediaUploadIdempotencyDoc>) ??
  model<MediaUploadIdempotencyDoc>('MediaUploadIdempotency', mediaUploadIdempotencySchema)
