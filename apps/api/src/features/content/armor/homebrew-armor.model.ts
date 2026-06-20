import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

import { ARMOR_CATEGORIES, ARMOR_MATERIALS, SYSTEM_RULESET_IDS } from '@rpg/contracts'

const homebrewArmorSchema = new Schema(
  {
    slug: { type: String, required: true, trim: true },
    rulesetId: { type: String, enum: [...SYSTEM_RULESET_IDS], required: true },
    campaignId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    imageKey: { type: String },
    description: { type: String },
    category: { type: String, enum: [...ARMOR_CATEGORIES], required: true },
    cost: { type: Schema.Types.Mixed, required: true },
    weight: { type: Schema.Types.Mixed },
    material: { type: String, enum: [...ARMOR_MATERIALS] },
    baseAc: { type: Number },
    acBonus: { type: Number },
    addDexModifier: { type: Boolean, required: true },
    maxDexBonus: { type: Number },
    stealthDisadvantage: { type: Boolean, required: true },
    strengthRequirement: { type: Number },
  },
  { timestamps: true },
)

homebrewArmorSchema.index({ campaignId: 1, rulesetId: 1, slug: 1 }, { unique: true })

export type HomebrewArmorSchemaType = InferSchemaType<typeof homebrewArmorSchema>

export const HomebrewArmorModel: Model<HomebrewArmorSchemaType> =
  (models.HomebrewArmor as Model<HomebrewArmorSchemaType>) ??
  model<HomebrewArmorSchemaType>('HomebrewArmor', homebrewArmorSchema)
