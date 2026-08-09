import mongoose, { type InferSchemaType, type Model } from 'mongoose'

import { ORGANIZATION_KIND_IDS, ORGANIZATION_SUBTYPE_IDS } from '@rpg/contracts'

import {
  homebrewCampaignSlugIndex,
  homebrewContentIdentityFields,
} from '../lib/homebrew-content-schema'

const { model, models, Schema } = mongoose

const homebrewOrganizationSchema = new Schema(
  {
    ...homebrewContentIdentityFields,
    organizationKind: { type: String, enum: [...ORGANIZATION_KIND_IDS] },
    organizationSubtype: { type: String, enum: [...ORGANIZATION_SUBTYPE_IDS] },
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
