import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

const monsterPatchSchema = new Schema(
  {
    campaignId: { type: String, required: true, index: true },
    targetId: { type: String, required: true, index: true },
    patch: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
)

monsterPatchSchema.index({ campaignId: 1, targetId: 1 }, { unique: true })

export type MonsterPatchSchemaType = InferSchemaType<typeof monsterPatchSchema>

export const MonsterPatchModel: Model<MonsterPatchSchemaType> =
  (models.MonsterPatch as Model<MonsterPatchSchemaType>) ??
  model<MonsterPatchSchemaType>('MonsterPatch', monsterPatchSchema)
