import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

import { CREATURE_SIZES, CREATURE_TYPES, SYSTEM_RULESET_IDS } from '@rpg/contracts'

const homebrewSpeciesSchema = new Schema(
  {
    slug: { type: String, required: true, trim: true },
    rulesetId: { type: String, enum: [...SYSTEM_RULESET_IDS], required: true },
    campaignId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    imageKey: { type: String },
    description: { type: String },
    creatureType: { type: String, enum: [...CREATURE_TYPES], required: true },
    sizes: [{ type: String, enum: [...CREATURE_SIZES] }],
    speed: { type: Schema.Types.Mixed, required: true },
    traits: { type: [Schema.Types.Mixed], default: [] },
    heritage: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
)

homebrewSpeciesSchema.index({ campaignId: 1, rulesetId: 1, slug: 1 }, { unique: true })

export type HomebrewSpeciesSchemaType = InferSchemaType<typeof homebrewSpeciesSchema>

export const HomebrewSpeciesModel: Model<HomebrewSpeciesSchemaType> =
  (models.HomebrewSpecies as Model<HomebrewSpeciesSchemaType>) ??
  model<HomebrewSpeciesSchemaType>('HomebrewSpecies', homebrewSpeciesSchema)
