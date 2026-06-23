import mongoose, { type InferSchemaType, type Model } from 'mongoose'

// Mongoose is CommonJS; under ESM, Node's static export analysis doesn't expose
// some bindings (e.g. `models`) as named exports, so destructure from default.
const { model, models, Schema } = mongoose

import { ABILITY_IDS, CLASS_HIT_DICE, SYSTEM_RULESET_IDS } from '@rpg/contracts'

// Homebrew (campaign-owned) classes. `source` is always 'homebrew'; system
// classes live in the seed, not Mongo. Scalars are typed; the deeply-nested
// body parts (spellcasting/proficiencies/features) are stored as Mixed and
// validated by the Zod contract at the service boundary before insert.
const homebrewClassSchema = new Schema(
  {
    slug: { type: String, required: true, trim: true },
    rulesetId: { type: String, enum: [...SYSTEM_RULESET_IDS], required: true },
    campaignId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    imageKey: { type: String },
    description: { type: String },
    primaryAbilities: [{ type: String, enum: [...ABILITY_IDS] }],
    hitDie: { type: Number, enum: [...CLASS_HIT_DICE], required: true },
    subclassChoiceLevel: { type: Number, required: false },
    spellcasting: { type: Schema.Types.Mixed },
    proficiencies: { type: Schema.Types.Mixed, required: true },
    features: { type: [Schema.Types.Mixed], default: [] },
  },
  { timestamps: true },
)

// Homebrew slug uniqueness within a campaign's ruleset (shadowing of system
// slugs is enforced separately by `assertSlugAvailable`).
homebrewClassSchema.index({ campaignId: 1, rulesetId: 1, slug: 1 }, { unique: true })

export type HomebrewClassSchemaType = InferSchemaType<typeof homebrewClassSchema>

export const HomebrewClassModel: Model<HomebrewClassSchemaType> =
  (models.HomebrewClass as Model<HomebrewClassSchemaType>) ??
  model<HomebrewClassSchemaType>('HomebrewClass', homebrewClassSchema)
