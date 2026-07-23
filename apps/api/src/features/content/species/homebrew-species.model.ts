import mongoose, { type InferSchemaType, type Model } from 'mongoose'

import {
  CREATURE_SIZES,
  SPECIES_CLASS_POLICY_MODES,
  SPECIES_MULTICLASS_POLICIES,
} from '@rpg/contracts'

import {
  homebrewCampaignSlugIndex,
  homebrewContentIdentityFields,
} from '../lib/homebrew-content-schema'

const { model, models, Schema } = mongoose

const speciesClassPolicySchema = new Schema(
  {
    mode: { type: String, enum: SPECIES_CLASS_POLICY_MODES, required: true },
    classIds: [{ type: String, trim: true }],
  },
  { _id: false },
)

const speciesMulticlassingSchema = new Schema(
  {
    policy: { type: String, enum: SPECIES_MULTICLASS_POLICIES, required: true },
    classPolicy: { type: speciesClassPolicySchema, required: true },
  },
  { _id: false },
)

const speciesClassLevelCapSchema = new Schema(
  {
    classId: { type: String, trim: true, required: true },
    maxLevel: { type: Number, required: true },
  },
  { _id: false },
)

const speciesLevelLimitsSchema = new Schema(
  {
    maxCharacterLevel: { type: Number, default: null },
    classLevelCaps: { type: [speciesClassLevelCapSchema], default: [] },
  },
  { _id: false },
)

const speciesCharacterCreationSchema = new Schema(
  {
    multiclassing: { type: speciesMulticlassingSchema, default: undefined },
    levelLimits: { type: speciesLevelLimitsSchema, default: undefined },
  },
  { _id: false },
)

const homebrewSpeciesSchema = new Schema(
  {
    ...homebrewContentIdentityFields,
    creatureType: { type: String, required: true, trim: true },
    sizes: [{ type: String, enum: [...CREATURE_SIZES] }],
    movement: { type: Schema.Types.Mixed, default: {} },
    traits: { type: [Schema.Types.Mixed], default: [] },
    heritage: { type: Schema.Types.Mixed },
    characterCreation: { type: speciesCharacterCreationSchema, default: undefined },
  },
  { timestamps: true },
)

homebrewCampaignSlugIndex(homebrewSpeciesSchema)

export type HomebrewSpeciesSchemaType = InferSchemaType<typeof homebrewSpeciesSchema>

export const HomebrewSpeciesModel: Model<HomebrewSpeciesSchemaType> =
  (models.HomebrewSpecies as Model<HomebrewSpeciesSchemaType>) ??
  model<HomebrewSpeciesSchemaType>('HomebrewSpecies', homebrewSpeciesSchema)
