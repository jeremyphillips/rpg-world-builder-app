import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

const mediaAssetSchema = new Schema(
  {
    _id: { type: String, required: true },
    sessionId: { type: String, required: true, index: true },
    scopeKind: {
      type: String,
      required: true,
      enum: ['campaign-content', 'campaign-identity', 'campaign-npc', 'campaign-pc', 'user-pc'],
    },
    scopeKey: { type: String, required: true, index: true },
    campaignId: { type: String },
    userId: { type: String },
    createdByUserId: { type: String, required: true, index: true },
    storageKey: { type: String, required: true },
    originalFilename: { type: String, required: true },
    mimeType: { type: String, required: true },
    byteSize: { type: Number, required: true },
    orientedWidth: { type: Number, required: true },
    orientedHeight: { type: Number, required: true },
    contentHash: { type: String, required: true },
    animated: { type: Boolean, required: true, default: false },
    lifecycle: {
      type: String,
      required: true,
      enum: ['ready', 'expired', 'deleting'],
      default: 'ready',
    },
    referenceCount: { type: Number, required: true, default: 0 },
    leaseExpiresAt: { type: Date, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    versionKey: false,
  },
)

mediaAssetSchema.index({ scopeKey: 1, contentHash: 1 })

export type MediaAssetDoc = InferSchemaType<typeof mediaAssetSchema> & {
  _id: string
  createdAt: Date
  updatedAt: Date
}

export const MediaAssetModel: Model<MediaAssetDoc> =
  (models.MediaAsset as Model<MediaAssetDoc>) ??
  model<MediaAssetDoc>('MediaAsset', mediaAssetSchema)
