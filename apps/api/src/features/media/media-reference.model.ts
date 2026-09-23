import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

const mediaReferenceSchema = new Schema(
  {
    _id: { type: String, required: true },
    assetId: { type: String, required: true, index: true },
    subjectKind: { type: String, required: true, enum: ['content', 'character'], index: true },
    subjectId: { type: String, required: true, index: true },
    scopeKey: { type: String, required: true },
    attachmentId: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
)

mediaReferenceSchema.index({ subjectKind: 1, subjectId: 1 })
mediaReferenceSchema.index(
  { assetId: 1, subjectKind: 1, subjectId: 1, attachmentId: 1 },
  { unique: true },
)

export type MediaReferenceDoc = InferSchemaType<typeof mediaReferenceSchema> & {
  _id: string
  createdAt: Date
}

export const MediaReferenceModel: Model<MediaReferenceDoc> =
  (models.MediaReference as Model<MediaReferenceDoc>) ??
  model<MediaReferenceDoc>('MediaReference', mediaReferenceSchema)
