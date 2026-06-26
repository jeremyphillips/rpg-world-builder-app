import mongoose, { type InferSchemaType, type Model } from 'mongoose'

import {
  ABILITY_IDS,
  ARMOR_MATERIALS,
  EQUIPMENT_KINDS,
  GEAR_KINDS,
  MAGIC_ITEM_CATEGORIES,
  MAGIC_ITEM_RARITIES,
  PHYSICAL_DAMAGE_TYPE_IDS,
  SERVICE_CATEGORIES,
  HOLY_SYMBOL_USAGES,
  TOOL_CATEGORIES,
  VEHICLE_CATEGORIES,
  WEAPON_MASTERIES,
  WEAPON_MODES,
} from '@rpg/contracts'

import {
  homebrewCampaignSlugIndex,
  homebrewContentIdentityFields,
} from '../lib/homebrew-content-schema'

const { model, models, Schema } = mongoose

const homebrewEquipmentSchema = new Schema(
  {
    ...homebrewContentIdentityFields,
    kind: { type: String, enum: [...EQUIPMENT_KINDS], required: true },
    cost: { type: Schema.Types.Mixed, required: true },
    weight: { type: Schema.Types.Mixed },
    tags: [{ type: String }],
    // weapon + armor share `category`; only one applies per record.
    category: { type: String },
    // weapon
    mode: { type: String, enum: [...WEAPON_MODES] },
    damage: { type: Schema.Types.Mixed },
    damageType: { type: String, enum: [...PHYSICAL_DAMAGE_TYPE_IDS] },
    versatileDamage: { type: Schema.Types.Mixed },
    properties: [{ type: String }],
    mastery: { type: String, enum: [...WEAPON_MASTERIES] },
    range: { type: Schema.Types.Mixed },
    specialRules: { type: String },
    // armor
    material: { type: String, enum: [...ARMOR_MATERIALS] },
    baseAc: { type: Number },
    acBonus: { type: Number },
    addDexModifier: { type: Boolean },
    maxDexBonus: { type: Number },
    stealthDisadvantage: { type: Boolean },
    strengthRequirement: { type: Number },
    // adventuring gear
    gearKind: { type: String, enum: [...GEAR_KINDS] },
    bundleSize: { type: Number },
    storage: { type: String },
    capacity: { type: Schema.Types.Mixed },
    holySymbolUsage: [{ type: String, enum: [...HOLY_SYMBOL_USAGES] }],
    alsoWeaponSlug: { type: String, trim: true },
    // tool
    toolCategory: { type: String, enum: [...TOOL_CATEGORIES] },
    ability: { type: String, enum: [...ABILITY_IDS] },
    utilizes: [
      {
        description: { type: String, required: true },
        dc: { type: Number, required: true },
      },
    ],
    crafts: [{ type: String }],
    // mount
    carryingCapacity: { type: Schema.Types.Mixed },
    speed: { type: Schema.Types.Mixed },
    // vehicle
    vehicleCategory: { type: String, enum: [...VEHICLE_CATEGORIES] },
    crew: { type: Number },
    passengers: { type: Number },
    cargoCapacity: { type: Schema.Types.Mixed },
    ac: { type: Number },
    hp: { type: Number },
    damageThreshold: { type: Number },
    // service
    serviceCategory: { type: String, enum: [...SERVICE_CATEGORIES] },
    duration: { type: String },
    notes: { type: String },
    // magic item
    rarity: { type: String, enum: [...MAGIC_ITEM_RARITIES] },
    requiresAttunement: { type: Boolean },
    attunementRequirement: { type: String },
    magicItemCategory: { type: String, enum: [...MAGIC_ITEM_CATEGORIES] },
    baseEquipmentId: { type: String },
  },
  { timestamps: true },
)

homebrewCampaignSlugIndex(homebrewEquipmentSchema)

export type HomebrewEquipmentSchemaType = InferSchemaType<typeof homebrewEquipmentSchema>

export const HomebrewEquipmentModel: Model<HomebrewEquipmentSchemaType> =
  (models.HomebrewEquipment as Model<HomebrewEquipmentSchemaType>) ??
  model<HomebrewEquipmentSchemaType>('HomebrewEquipment', homebrewEquipmentSchema)
