import mongoose, { type InferSchemaType, type Model } from 'mongoose'

import { ABILITY_IDS } from '@rpg/contracts'

import {
  homebrewCampaignSlugIndex,
  homebrewContentIdentityFields,
} from '../lib/homebrew-content-schema'

const { model, models, Schema } = mongoose

const homebrewSkillProficiencySchema = new Schema(
  {
    ...homebrewContentIdentityFields,
    ability: { type: String, enum: [...ABILITY_IDS], required: true },
    examples: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => Array.isArray(value) && value.length >= 1,
        message: 'At least one example is required.',
      },
    },
  },
  { timestamps: true },
)

homebrewCampaignSlugIndex(homebrewSkillProficiencySchema)

export type HomebrewSkillProficiencySchemaType = InferSchemaType<
  typeof homebrewSkillProficiencySchema
>

export const HomebrewSkillProficiencyModel: Model<HomebrewSkillProficiencySchemaType> =
  (models.HomebrewSkillProficiency as Model<HomebrewSkillProficiencySchemaType>) ??
  model<HomebrewSkillProficiencySchemaType>(
    'HomebrewSkillProficiency',
    homebrewSkillProficiencySchema,
  )
