import mongoose, { type InferSchemaType, type Model } from 'mongoose'

import { CREATURE_SIZES } from '@rpg/contracts'

import {
  homebrewCampaignSlugIndex,
  homebrewContentIdentityFields,
} from '../lib/homebrew-content-schema'

const { model, models, Schema } = mongoose

const homebrewSpeciesSchema = new Schema(
  {
    ...homebrewContentIdentityFields,
    creatureType: { type: String, required: true, trim: true },
    sizes: [{ type: String, enum: [...CREATURE_SIZES] }],
    speed: { type: Schema.Types.Mixed, required: true },
    traits: { type: [Schema.Types.Mixed], default: [] },
    heritage: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
)

homebrewCampaignSlugIndex(homebrewSpeciesSchema)

export type HomebrewSpeciesSchemaType = InferSchemaType<typeof homebrewSpeciesSchema>

export const HomebrewSpeciesModel: Model<HomebrewSpeciesSchemaType> =
  (models.HomebrewSpecies as Model<HomebrewSpeciesSchemaType>) ??
  model<HomebrewSpeciesSchemaType>('HomebrewSpecies', homebrewSpeciesSchema)
