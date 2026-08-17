import mongoose, { type InferSchemaType, type Model } from 'mongoose'

import {
  ORGANIZATION_DOMAIN_IDS,
  ORGANIZATION_FORM_IDS,
  ORGANIZATION_FUNCTION_IDS,
  ORGANIZATION_PRACTICE_IDS,
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
    memberClassAffinityIds: {
      type: [{ type: String }],
      default: [],
    },
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
