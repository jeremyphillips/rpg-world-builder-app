import mongoose, { type InferSchemaType, type Model } from 'mongoose'

import {
  ORGANIZATION_DOMAIN_IDS,
  ORGANIZATION_FORM_IDS,
  ORGANIZATION_FUNCTION_IDS,
  ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES,
  ORGANIZATION_PRACTICE_IDS,
  ORGANIZATION_AUTHORING_PRESET_IDS,
  NPC_AUTHORING_TEMPLATE_IDS,
  MAX_CHARACTER_LEVEL,
} from '@rpg/contracts'

import {
  homebrewCampaignSlugIndex,
  homebrewContentIdentityFields,
} from '../lib/homebrew-content-schema'

const { model, models, Schema } = mongoose

const homebrewOrganizationSchema = new Schema(
  {
    ...homebrewContentIdentityFields,
    organizationDomain: { type: String, enum: [...ORGANIZATION_DOMAIN_IDS] },
    organizationForm: { type: String, enum: [...ORGANIZATION_FORM_IDS] },
    functions: {
      type: [{ type: String, enum: [...ORGANIZATION_FUNCTION_IDS] }],
      default: [],
    },
    practices: {
      type: [{ type: String, enum: [...ORGANIZATION_PRACTICE_IDS] }],
      default: [],
    },
    members: {
      classAffinityIds: {
        type: [{ type: String }],
        default: [],
      },
      speciesAffinityIds: {
        type: [{ type: String }],
        default: [],
      },
      titles: {
        type: [
          {
            _id: false,
            id: { type: String, required: true },
            sourceTitleId: { type: String },
            label: { type: String, required: true },
            description: { type: String },
            priority: {
              type: Number,
              enum: [...ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES],
              required: true,
            },
            npcRecommendation: {
              _id: false,
              type: {
                templateId: { type: String, enum: [...NPC_AUTHORING_TEMPLATE_IDS], required: true },
                level: { type: Number, required: true, min: 0, max: MAX_CHARACTER_LEVEL },
              },
            },
          },
        ],
        default: [],
      },
    },
    sourcePresetId: { type: String, enum: [...ORGANIZATION_AUTHORING_PRESET_IDS] },
    connections: {
      locations: [
        {
          _id: false,
          id: { type: String, required: true },
          locationId: { type: String, required: true },
          kind: { type: String, required: true },
        },
      ],
    },
  },
  { timestamps: true },
)

homebrewCampaignSlugIndex(homebrewOrganizationSchema)

export type HomebrewOrganizationSchemaType = InferSchemaType<typeof homebrewOrganizationSchema>

export const HomebrewOrganizationModel: Model<HomebrewOrganizationSchemaType> =
  (models.HomebrewOrganization as Model<HomebrewOrganizationSchemaType>) ??
  model<HomebrewOrganizationSchemaType>('HomebrewOrganization', homebrewOrganizationSchema)
