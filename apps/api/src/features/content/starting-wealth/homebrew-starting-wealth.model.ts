import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

import { STARTING_WEALTH_SCOPE_KINDS } from '@rpg/contracts'

import {
  homebrewCampaignSlugIndex,
  homebrewContentIdentityFields,
} from '../lib/homebrew-content-schema'

const homebrewStartingWealthSchema = new Schema(
  {
    ...homebrewContentIdentityFields,
    scope: {
      kind: { type: String, enum: [...STARTING_WEALTH_SCOPE_KINDS], required: true },
    },
    tiers: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
)

homebrewCampaignSlugIndex(homebrewStartingWealthSchema)

export type HomebrewStartingWealthSchemaType = InferSchemaType<typeof homebrewStartingWealthSchema>

export const HomebrewStartingWealthModel: Model<HomebrewStartingWealthSchemaType> =
  (models.HomebrewStartingWealth as Model<HomebrewStartingWealthSchemaType>) ??
  model<HomebrewStartingWealthSchemaType>('HomebrewStartingWealth', homebrewStartingWealthSchema)
