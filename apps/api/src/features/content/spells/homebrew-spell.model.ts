import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

import { SPELL_DELIVERY_METHODS, SPELL_SCHOOLS, SYSTEM_RULESET_IDS } from '@rpg/contracts'

const homebrewSpellSchema = new Schema(
  {
    slug: { type: String, required: true, trim: true },
    rulesetId: { type: String, enum: [...SYSTEM_RULESET_IDS], required: true },
    campaignId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    imageKey: { type: String },
    description: { type: String },
    school: { type: String, enum: [...SPELL_SCHOOLS], required: true },
    level: { type: Number, required: true, min: 0, max: 9 },
    classIds: [{ type: String, required: true }],
    tags: { type: Schema.Types.Mixed },
    castingTime: { type: Schema.Types.Mixed, required: true },
    range: { type: Schema.Types.Mixed, required: true },
    duration: { type: Schema.Types.Mixed, required: true },
    components: { type: Schema.Types.Mixed, required: true },
    deliveryMethod: { type: String, enum: [...SPELL_DELIVERY_METHODS] },
  },
  { timestamps: true },
)

homebrewSpellSchema.index({ campaignId: 1, rulesetId: 1, slug: 1 }, { unique: true })

export type HomebrewSpellSchemaType = InferSchemaType<typeof homebrewSpellSchema>

export const HomebrewSpellModel: Model<HomebrewSpellSchemaType> =
  (models.HomebrewSpell as Model<HomebrewSpellSchemaType>) ??
  model<HomebrewSpellSchemaType>('HomebrewSpell', homebrewSpellSchema)
