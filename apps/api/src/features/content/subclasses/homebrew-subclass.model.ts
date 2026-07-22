import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

import {
  homebrewCampaignSlugIndex,
  homebrewContentIdentityFields,
} from '../lib/homebrew-content-schema'

const homebrewSubclassSchema = new Schema(
  {
    ...homebrewContentIdentityFields,
    classId: { type: String, required: true, index: true },
    tagline: { type: String },
    features: { type: Schema.Types.Mixed, default: [] },
  },
  { timestamps: true },
)

homebrewCampaignSlugIndex(homebrewSubclassSchema)

export type HomebrewSubclassSchemaType = InferSchemaType<typeof homebrewSubclassSchema>

export const HomebrewSubclassModel: Model<HomebrewSubclassSchemaType> =
  (models.HomebrewSubclass as Model<HomebrewSubclassSchemaType>) ??
  model<HomebrewSubclassSchemaType>('HomebrewSubclass', homebrewSubclassSchema)
