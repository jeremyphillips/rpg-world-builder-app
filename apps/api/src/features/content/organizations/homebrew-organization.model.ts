import mongoose, { type InferSchemaType, type Model } from 'mongoose'

import {
  ORGANIZATION_ACTIVITY_IDS,
  ORGANIZATION_DOMAIN_IDS,
  ORGANIZATION_FORM_IDS,
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
    activities: {
      type: [{ type: String, enum: [...ORGANIZATION_ACTIVITY_IDS] }],
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
