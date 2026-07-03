import mongoose, { type InferSchemaType, type Model } from 'mongoose'

const { model, models, Schema } = mongoose

import {
  ARMOR_CLASS_BASES,
  ARMOR_CLASS_MODES,
  ATTACK_RESOLUTION_MODE_IDS,
  CREATURE_TYPE_POLICY_MODES,
  EDITION_PRESET_IDS,
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

const primaryAbilityMinimumRequirementSchema = new Schema(
  {
    enabled: { type: Boolean },
    minimumScore: { type: Number },
  },
  { _id: false },
)

const speciesPolicyRequirementSchema = new Schema(
  {
    enabled: { type: Boolean },
  },
  { _id: false },
)

const speciesLevelLimitsRequirementSchema = new Schema(
  {
    enabled: { type: Boolean },
  },
  { _id: false },
)

const multiclassingRequirementsSchema = new Schema(
  {
    primaryAbilityMinimum: { type: primaryAbilityMinimumRequirementSchema, default: undefined },
    speciesPolicy: { type: speciesPolicyRequirementSchema, default: undefined },
    speciesLevelLimits: { type: speciesLevelLimitsRequirementSchema, default: undefined },
  },
  { _id: false },
)

const multiclassingSchema = new Schema(
  {
    enabled: { type: Boolean },
    requirements: { type: multiclassingRequirementsSchema, default: undefined },
  },
  { _id: false },
)

const subclassingSchema = new Schema(
  {
    enabled: { type: Boolean },
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
    multiclassing: { type: multiclassingSchema, default: undefined },
    subclasses: { type: subclassingSchema, default: undefined },
    startingWealth: { type: Schema.Types.Mixed, default: undefined },
  },
  { _id: false },
)

const mechanicsSchema = new Schema(
  {
    editionPreset: {
      id: { type: String, enum: EDITION_PRESET_IDS },
      modified: { type: Boolean },
      appliedAt: { type: Date },
    },
    armorClass: {
      mode: { type: String, enum: ARMOR_CLASS_MODES },
      base: { type: Number, enum: ARMOR_CLASS_BASES },
    },
    attackResolution: {
      mode: { type: String, enum: ATTACK_RESOLUTION_MODE_IDS },
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
    mechanics: { type: mechanicsSchema, default: undefined },
  },
  { timestamps: true },
)

campaignRulesetPatchSchema.index({ campaignId: 1, rulesetId: 1 }, { unique: true })

export type CampaignRulesetPatchSchemaType = InferSchemaType<typeof campaignRulesetPatchSchema>

export const CampaignRulesetPatchModel: Model<CampaignRulesetPatchSchemaType> =
  (models.CampaignRulesetPatch as Model<CampaignRulesetPatchSchemaType>) ??
  model<CampaignRulesetPatchSchemaType>('CampaignRulesetPatch', campaignRulesetPatchSchema)
