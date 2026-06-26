import mongoose, { type InferSchemaType, type Model } from 'mongoose'

import { FEAT_CATEGORY_IDS } from '@rpg/contracts'

import {
  homebrewCampaignSlugIndex,
  homebrewContentIdentityFields,
} from '../lib/homebrew-content-schema'

const { model, models, Schema } = mongoose

const featRepeatableSubSchema = new Schema(
  {
    allowed: { type: Boolean, required: true },
    notes: { type: String },
  },
  { _id: false },
)

const homebrewFeatSchema = new Schema(
  {
    ...homebrewContentIdentityFields,
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

homebrewCampaignSlugIndex(homebrewFeatSchema)

export type HomebrewFeatSchemaType = InferSchemaType<typeof homebrewFeatSchema>

export const HomebrewFeatModel: Model<HomebrewFeatSchemaType> =
  (models.HomebrewFeat as Model<HomebrewFeatSchemaType>) ??
  model<HomebrewFeatSchemaType>('HomebrewFeat', homebrewFeatSchema)
