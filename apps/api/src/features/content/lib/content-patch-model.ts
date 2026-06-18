import mongoose, { type InferSchemaType, type Model } from 'mongoose'

// Mongoose is CommonJS; under ESM, Node's static export analysis doesn't expose
// some bindings (e.g. `models`) as named exports, so destructure from default.
const { model, models, Schema } = mongoose

/**
 * Shared schema shape for all content-type patch models. Every content type's
 * per-campaign overlay patch stores the same envelope: which campaign issued
 * it, which system record it targets, and the partial body to deep-merge at
 * read time. The `patch` body is validated by the contract (`*PatchSchema`)
 * before insert; Mongoose treats it as opaque `Mixed` here.
 */
function buildPatchSchema() {
  const schema = new Schema(
    {
      campaignId: { type: String, required: true, index: true },
      targetId: { type: String, required: true },
      patch: { type: Schema.Types.Mixed, required: true },
    },
    { timestamps: true },
  )
  // At most one overlay per record per campaign.
  schema.index({ campaignId: 1, targetId: 1 }, { unique: true })
  return schema
}

export type ContentPatchSchemaType = InferSchemaType<ReturnType<typeof buildPatchSchema>>

/**
 * Returns (or re-uses) a typed Mongoose model for a content-type's patch
 * collection. Each content type gets its own collection via a distinct
 * `modelName` (e.g. `'ClassPatch'`, `'SkillProficiencyPatch'`), keeping
 * unique indexes and queries clean.
 *
 * @example
 * export const ClassPatchModel = createContentPatchModel('ClassPatch')
 */
export function createContentPatchModel(modelName: string): Model<ContentPatchSchemaType> {
  return (
    (models[modelName] as Model<ContentPatchSchemaType>) ??
    model<ContentPatchSchemaType>(modelName, buildPatchSchema())
  )
}
