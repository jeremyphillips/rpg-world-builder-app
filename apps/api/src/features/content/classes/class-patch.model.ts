import mongoose, { type InferSchemaType, type Model } from 'mongoose'

// Mongoose is CommonJS; under ESM, Node's static export analysis doesn't expose
// some bindings (e.g. `models`) as named exports, so destructure from default.
const { model, models, Schema } = mongoose

// A per-campaign overlay patch on a system class. `targetId` is the base class's
// opaque id; `patch` is a partial class body (validated by `classPatchSchema`
// before insert) deep-merged onto the base at read time.
const classPatchSchema = new Schema(
  {
    campaignId: { type: String, required: true, index: true },
    targetId: { type: String, required: true },
    patch: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
)

// At most one overlay per class per campaign.
classPatchSchema.index({ campaignId: 1, targetId: 1 }, { unique: true })

export type ClassPatchSchemaType = InferSchemaType<typeof classPatchSchema>

export const ClassPatchModel: Model<ClassPatchSchemaType> =
  (models.ClassPatch as Model<ClassPatchSchemaType>) ??
  model<ClassPatchSchemaType>('ClassPatch', classPatchSchema)
