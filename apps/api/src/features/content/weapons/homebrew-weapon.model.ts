import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

import {
  PHYSICAL_DAMAGE_TYPE_IDS,
  SYSTEM_RULESET_IDS,
  WEAPON_CATEGORIES,
  WEAPON_MASTERIES,
  WEAPON_MODES,
  WEAPON_PROPERTIES,
} from '@rpg/contracts'

const homebrewWeaponSchema = new Schema(
  {
    slug: { type: String, required: true, trim: true },
    rulesetId: { type: String, enum: [...SYSTEM_RULESET_IDS], required: true },
    campaignId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    imageKey: { type: String },
    description: { type: String },
    category: { type: String, enum: [...WEAPON_CATEGORIES], required: true },
    mode: { type: String, enum: [...WEAPON_MODES], required: true },
    cost: { type: Schema.Types.Mixed, required: true },
    weight: { type: Schema.Types.Mixed },
    damage: { type: Schema.Types.Mixed },
    damageType: { type: String, enum: [...PHYSICAL_DAMAGE_TYPE_IDS] },
    versatileDamage: { type: Schema.Types.Mixed },
    properties: [{ type: String, enum: [...WEAPON_PROPERTIES] }],
    mastery: { type: String, enum: [...WEAPON_MASTERIES], required: true },
    range: { type: Schema.Types.Mixed },
    specialRules: { type: String },
  },
  { timestamps: true },
)

homebrewWeaponSchema.index({ campaignId: 1, rulesetId: 1, slug: 1 }, { unique: true })

export type HomebrewWeaponSchemaType = InferSchemaType<typeof homebrewWeaponSchema>

export const HomebrewWeaponModel: Model<HomebrewWeaponSchemaType> =
  (models.HomebrewWeapon as Model<HomebrewWeaponSchemaType>) ??
  model<HomebrewWeaponSchemaType>('HomebrewWeapon', homebrewWeaponSchema)
