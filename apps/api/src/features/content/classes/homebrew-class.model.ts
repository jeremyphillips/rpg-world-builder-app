import mongoose, { type InferSchemaType, type Model } from 'mongoose'

import { ABILITY_IDS, CLASS_HIT_DICE } from '@rpg/contracts'

import {
  homebrewCampaignSlugIndex,
  homebrewContentIdentityFields,
} from '../lib/homebrew-content-schema'

// Mongoose is CommonJS; under ESM, Node's static export analysis doesn't expose
// some bindings (e.g. `models`) as named exports, so destructure from default.
const { model, models, Schema } = mongoose

// Homebrew (campaign-owned) classes. `source` is always 'homebrew'; system
// classes live in the seed, not Mongo. Scalars are typed; the deeply-nested
// body parts (spellcasting/proficiencies/features) are stored as Mixed and
// validated by the Zod contract at the service boundary before insert.
const homebrewClassSchema = new Schema(
  {
    ...homebrewContentIdentityFields,
    primaryAbilities: [{ type: String, enum: [...ABILITY_IDS] }],
    hitDie: { type: Number, enum: [...CLASS_HIT_DICE] },
    spellcasting: { type: Schema.Types.Mixed },
    proficiencies: { type: Schema.Types.Mixed },
    characterCreation: { type: Schema.Types.Mixed },
    features: { type: [Schema.Types.Mixed], default: [] },
  },
  { timestamps: true },
)

// Homebrew slug uniqueness within a campaign's ruleset (shadowing of system
// slugs is enforced separately by `assertSlugAvailable`).
homebrewCampaignSlugIndex(homebrewClassSchema)

export type HomebrewClassSchemaType = InferSchemaType<typeof homebrewClassSchema>

export const HomebrewClassModel: Model<HomebrewClassSchemaType> =
  (models.HomebrewClass as Model<HomebrewClassSchemaType>) ??
  model<HomebrewClassSchemaType>('HomebrewClass', homebrewClassSchema)
