import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

const contentDuplicationIdempotencySchema = new Schema(
  {
    campaignId: { type: String, required: true },
    idempotencyKey: { type: String, required: true },
    contentType: { type: String, required: true },
    sourceEntityId: { type: String, required: true },
    createdEntityId: { type: String, required: true },
  },
  { timestamps: true },
)

contentDuplicationIdempotencySchema.index({ campaignId: 1, idempotencyKey: 1 }, { unique: true })

export type ContentDuplicationIdempotencyDoc = InferSchemaType<
  typeof contentDuplicationIdempotencySchema
>

export const ContentDuplicationIdempotencyModel: Model<ContentDuplicationIdempotencyDoc> =
  (models.ContentDuplicationIdempotency as Model<ContentDuplicationIdempotencyDoc>) ??
  model<ContentDuplicationIdempotencyDoc>(
    'ContentDuplicationIdempotency',
    contentDuplicationIdempotencySchema,
  )
