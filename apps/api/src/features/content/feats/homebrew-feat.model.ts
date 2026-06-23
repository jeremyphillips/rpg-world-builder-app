import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

import { FEAT_CATEGORY_IDS, SYSTEM_RULESET_IDS } from '@rpg/contracts'

const featRepeatableSubSchema = new Schema(
  {
    allowed: { type: Boolean, required: true },
    notes: { type: String },
  },
  { _id: false },
)

const homebrewFeatSchema = new Schema(
  {
    slug: { type: String, required: true, trim: true },
    rulesetId: { type: String, enum: [...SYSTEM_RULESET_IDS], required: true },
    campaignId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    imageKey: { type: String },
    description: { type: String },
    category: { type: String, enum: [...FEAT_CATEGORY_IDS], required: true },
    prerequisite: { type: Schema.Types.Mixed },
    repeatable: {
      type: featRepeatableSubSchema,
      required: true,
      default: () => ({ allowed: false }),
    },
    benefit: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
)

homebrewFeatSchema.index({ campaignId: 1, rulesetId: 1, slug: 1 }, { unique: true })

export type HomebrewFeatSchemaType = InferSchemaType<typeof homebrewFeatSchema>

export const HomebrewFeatModel: Model<HomebrewFeatSchemaType> =
  (models.HomebrewFeat as Model<HomebrewFeatSchemaType>) ??
  model<HomebrewFeatSchemaType>('HomebrewFeat', homebrewFeatSchema)
