import mongoose, { type InferSchemaType, type Model } from 'mongoose'

import { SYSTEM_RULESET_IDS } from '@rpg/contracts'

const { model, models, Schema } = mongoose

const characterSchema = new Schema(
  {
    characterType: { type: String, enum: ['pc', 'npc'], required: true },
    userId: { type: String, index: true },
    campaignId: { type: String, index: true },
    name: { type: String, required: true, trim: true },
    imageKey: { type: String },
    rulesetId: { type: String, enum: SYSTEM_RULESET_IDS, required: true },
    classes: { type: [Schema.Types.Mixed], required: true },
    species: { type: Schema.Types.Mixed, required: true },
    alignment: { type: String, required: true },
    xp: { type: Number, default: null },
    abilityScores: { type: Schema.Types.Mixed, required: true },
    hitPoints: { type: Schema.Types.Mixed, required: true },
    proficiencies: { type: Schema.Types.Mixed, required: true },
    spells: { type: [Schema.Types.Mixed], default: [] },
    equipment: { type: Schema.Types.Mixed, required: true },
    wealth: { type: Schema.Types.Mixed, required: true },
    narrative: { type: Schema.Types.Mixed },
    feats: { type: [Schema.Types.Mixed], default: [] },
    lifecycle: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
)

characterSchema.index({ userId: 1, characterType: 1, updatedAt: -1 })
characterSchema.index({ campaignId: 1, characterType: 1, updatedAt: -1 })

export type CharacterSchemaType = InferSchemaType<typeof characterSchema>

export const CharacterModel: Model<CharacterSchemaType> =
  (models.Character as Model<CharacterSchemaType>) ??
  model<CharacterSchemaType>('Character', characterSchema)
