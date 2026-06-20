import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

import { ABILITY_IDS, SYSTEM_RULESET_IDS } from '@rpg/contracts'

const homebrewSkillProficiencySchema = new Schema(
  {
    slug: { type: String, required: true, trim: true },
    rulesetId: { type: String, enum: [...SYSTEM_RULESET_IDS], required: true },
    campaignId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    imageKey: { type: String },
    description: { type: String },
    ability: { type: String, enum: [...ABILITY_IDS], required: true },
    suggestedClasses: [{ type: String }],
  },
  { timestamps: true },
)

homebrewSkillProficiencySchema.index({ campaignId: 1, rulesetId: 1, slug: 1 }, { unique: true })

export type HomebrewSkillProficiencySchemaType = InferSchemaType<
  typeof homebrewSkillProficiencySchema
>

export const HomebrewSkillProficiencyModel: Model<HomebrewSkillProficiencySchemaType> =
  (models.HomebrewSkillProficiency as Model<HomebrewSkillProficiencySchemaType>) ??
  model<HomebrewSkillProficiencySchemaType>(
    'HomebrewSkillProficiency',
    homebrewSkillProficiencySchema,
  )
