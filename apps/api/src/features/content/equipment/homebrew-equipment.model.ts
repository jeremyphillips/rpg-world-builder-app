import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

import { EQUIPMENT_KINDS, SYSTEM_RULESET_IDS } from '@rpg/contracts'

const homebrewEquipmentSchema = new Schema(
  {
    slug: { type: String, required: true, trim: true },
    rulesetId: { type: String, enum: [...SYSTEM_RULESET_IDS], required: true },
    campaignId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    imageKey: { type: String },
    description: { type: String },
    kind: { type: String, enum: [...EQUIPMENT_KINDS], required: true },
    cost: { type: Schema.Types.Mixed, required: true },
    body: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
)

homebrewEquipmentSchema.index({ campaignId: 1, rulesetId: 1, slug: 1 }, { unique: true })

export type HomebrewEquipmentSchemaType = InferSchemaType<typeof homebrewEquipmentSchema>

export const HomebrewEquipmentModel: Model<HomebrewEquipmentSchemaType> =
  (models.HomebrewEquipment as Model<HomebrewEquipmentSchemaType>) ??
  model<HomebrewEquipmentSchemaType>('HomebrewEquipment', homebrewEquipmentSchema)
