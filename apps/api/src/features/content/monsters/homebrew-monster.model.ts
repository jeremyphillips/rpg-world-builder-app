import mongoose, { type InferSchemaType, type Model } from 'mongoose'

import { CREATURE_SIZES } from '@rpg/contracts'

import {
  homebrewCampaignSlugIndex,
  homebrewContentIdentityFields,
} from '../lib/homebrew-content-schema'

const { model, models, Schema } = mongoose

const homebrewMonsterSchema = new Schema(
  {
    ...homebrewContentIdentityFields,
    sizes: { type: [{ type: String, enum: [...CREATURE_SIZES] }], default: [] },
    creatureType: { type: String },
    alignment: { type: String },
    abilityScores: { type: Schema.Types.Mixed },
    armorClass: { type: Schema.Types.Mixed },
    hitPoints: { type: Schema.Types.Mixed },
    movement: { type: Schema.Types.Mixed },
    hover: { type: Boolean },
    senses: { type: [Schema.Types.Mixed], default: [] },
    communication: { type: Schema.Types.Mixed },
    challengeRating: { type: String },
    experiencePointsOverride: { type: Number },
    proficiencies: { type: Schema.Types.Mixed },
    defenses: { type: Schema.Types.Mixed },
    equipment: { type: [Schema.Types.Mixed], default: [] },
    traits: { type: [Schema.Types.Mixed], default: [] },
    actions: { type: [Schema.Types.Mixed], default: [] },
    bonusActions: { type: [Schema.Types.Mixed], default: [] },
    reactions: { type: [Schema.Types.Mixed], default: [] },
  },
  { timestamps: true },
)

homebrewCampaignSlugIndex(homebrewMonsterSchema)

export type HomebrewMonsterSchemaType = InferSchemaType<typeof homebrewMonsterSchema>

export const HomebrewMonsterModel: Model<HomebrewMonsterSchemaType> =
  (models.HomebrewMonster as Model<HomebrewMonsterSchemaType>) ??
  model<HomebrewMonsterSchemaType>('HomebrewMonster', homebrewMonsterSchema)
