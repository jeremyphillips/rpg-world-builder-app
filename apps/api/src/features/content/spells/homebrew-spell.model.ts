import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

import { SPELL_DELIVERY_METHODS } from '@rpg/contracts'

import {
  homebrewCampaignSlugIndex,
  homebrewContentIdentityFields,
} from '../lib/homebrew-content-schema'

const homebrewSpellSchema = new Schema(
  {
    ...homebrewContentIdentityFields,
    school: { type: String, required: true, trim: true },
    level: { type: Number, min: 0, max: 9 },
    classIds: [{ type: String }],
    tags: { type: Schema.Types.Mixed },
    castingTime: { type: Schema.Types.Mixed },
    range: { type: Schema.Types.Mixed },
    duration: { type: Schema.Types.Mixed },
    components: { type: Schema.Types.Mixed },
    areaOfEffect: { type: Schema.Types.Mixed },
    cantripScaling: { type: String },
    higherLevelSlotEffect: { type: String },
    resolution: { type: Schema.Types.Mixed },
    deliveryMethod: { type: String, enum: [...SPELL_DELIVERY_METHODS] },
  },
  { timestamps: true },
)

homebrewCampaignSlugIndex(homebrewSpellSchema)

export type HomebrewSpellSchemaType = InferSchemaType<typeof homebrewSpellSchema>

export const HomebrewSpellModel: Model<HomebrewSpellSchemaType> =
  (models.HomebrewSpell as Model<HomebrewSpellSchemaType>) ??
  model<HomebrewSpellSchemaType>('HomebrewSpell', homebrewSpellSchema)
