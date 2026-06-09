import mongoose, { type InferSchemaType, type Model } from 'mongoose'

// Mongoose is CommonJS; under ESM, Node's static export analysis doesn't expose
// some bindings (e.g. `models`) as named exports, so destructure from default.
const { model, models, Schema } = mongoose

import {
  CAMPAIGN_STATUSES,
  CAMPAIGN_VISIBILITY,
  DIFFICULTIES,
  IMPORTED_CHARACTERS_POLICIES,
  MAGIC_LEVELS,
  MOODS,
  PLAY_STYLES,
} from '@rpg/contracts'

const campaignSchema = new Schema(
  {
    identity: {
      name: { type: String, required: true, trim: true },
      description: { type: String, trim: true },
      imageKey: { type: String },
    },
    configuration: {
      settings: {
        characterCreation: {
          startingLevel: { type: Number, default: 1 },
          importedCharacters: {
            policy: {
              type: String,
              enum: IMPORTED_CHARACTERS_POLICIES,
              default: 'disabled',
            },
          },
        },
      },
      flavor: {
        playStyle: [{ type: String, enum: PLAY_STYLES }],
        mood: [{ type: String, enum: MOODS }],
        magicLevel: { type: String, enum: MAGIC_LEVELS },
        difficulty: { type: String, enum: DIFFICULTIES },
      },
    },
    status: { type: String, enum: CAMPAIGN_STATUSES, required: true, default: 'draft' },
    visibility: { type: String, enum: CAMPAIGN_VISIBILITY, required: true, default: 'private' },
    /** userId of the creator. Immutable after creation; distinct from the current owner. */
    createdBy: { type: String, required: true, index: true },
  },
  { timestamps: true },
)

// Powers the public landing page query: { status: 'active', visibility: 'public' }
campaignSchema.index({ status: 1, visibility: 1 })

export type CampaignSchemaType = InferSchemaType<typeof campaignSchema>

// Reuse an already-compiled model across hot reloads / repeated test imports.
export const CampaignModel: Model<CampaignSchemaType> =
  (models.Campaign as Model<CampaignSchemaType>) ??
  model<CampaignSchemaType>('Campaign', campaignSchema)
