import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

import {
  CREATURE_TYPE_POLICY_MODES,
  IMPORTED_CHARACTERS_POLICIES,
  SYSTEM_RULESET_IDS,
  VOCABULARY_OPTION_SET_IDS,
  VOCABULARY_OPTION_STATUSES,
} from '@rpg/contracts'

const vocabularySystemEntryPatchEntrySchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    label: { type: String, trim: true },
    description: { type: String },
    status: { type: String, enum: VOCABULARY_OPTION_STATUSES },
  },
  { _id: false },
)

const vocabularyCampaignEntrySchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    description: { type: String },
    status: { type: String, enum: VOCABULARY_OPTION_STATUSES, default: 'active' },
  },
  { _id: false },
)

const vocabularyOptionSetPatchSchema = new Schema(
  {
    setId: { type: String, enum: VOCABULARY_OPTION_SET_IDS, required: true },
    systemEntryPatches: { type: [vocabularySystemEntryPatchEntrySchema], default: undefined },
    campaignEntries: { type: [vocabularyCampaignEntrySchema], default: undefined },
    removedCampaignEntryIds: { type: [String], default: undefined },
  },
  { _id: false },
)

const characterCreationProgressionSchema = new Schema(
  {
    maxCharacterLevel: { type: Number },
    extendedProgression: {
      tierName: { type: String, trim: true },
      maxLevel: { type: Number },
    },
  },
  { _id: false },
)

const characterCreationSchema = new Schema(
  {
    startingLevel: { type: Number },
    importedCharacters: {
      policy: { type: String, enum: IMPORTED_CHARACTERS_POLICIES },
    },
    progression: { type: characterCreationProgressionSchema, default: undefined },
    species: {
      creatureTypePolicy: {
        mode: { type: String, enum: CREATURE_TYPE_POLICY_MODES },
        ids: [{ type: String, trim: true }],
      },
    },
  },
  { _id: false },
)

const campaignRulesetPatchSchema = new Schema(
  {
    campaignId: { type: String, required: true, index: true },
    rulesetId: { type: String, enum: SYSTEM_RULESET_IDS, required: true },
    vocabulary: { type: [vocabularyOptionSetPatchSchema], default: undefined },
    characterCreation: { type: characterCreationSchema, default: undefined },
  },
  { timestamps: true },
)

campaignRulesetPatchSchema.index({ campaignId: 1, rulesetId: 1 }, { unique: true })

export type CampaignRulesetPatchSchemaType = InferSchemaType<typeof campaignRulesetPatchSchema>

export const CampaignRulesetPatchModel: Model<CampaignRulesetPatchSchemaType> =
  (models.CampaignRulesetPatch as Model<CampaignRulesetPatchSchemaType>) ??
  model<CampaignRulesetPatchSchemaType>('CampaignRulesetPatch', campaignRulesetPatchSchema)
