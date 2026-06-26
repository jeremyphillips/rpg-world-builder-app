import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

import { STARTING_WEALTH_SCOPE_KINDS, SYSTEM_RULESET_IDS } from '@rpg/contracts'

const homebrewStartingWealthSchema = new Schema(
  {
    slug: { type: String, required: true, trim: true },
    rulesetId: { type: String, enum: [...SYSTEM_RULESET_IDS], required: true },
    campaignId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    imageKey: { type: String },
    description: { type: String },
    scope: {
      kind: { type: String, enum: [...STARTING_WEALTH_SCOPE_KINDS], required: true },
    },
    tiers: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
)

homebrewStartingWealthSchema.index({ campaignId: 1, rulesetId: 1, slug: 1 }, { unique: true })

export type HomebrewStartingWealthSchemaType = InferSchemaType<typeof homebrewStartingWealthSchema>

export const HomebrewStartingWealthModel: Model<HomebrewStartingWealthSchemaType> =
  (models.HomebrewStartingWealth as Model<HomebrewStartingWealthSchemaType>) ??
  model<HomebrewStartingWealthSchemaType>('HomebrewStartingWealth', homebrewStartingWealthSchema)
