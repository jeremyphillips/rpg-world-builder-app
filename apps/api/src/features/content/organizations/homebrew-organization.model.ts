import mongoose, { type InferSchemaType, type Model } from 'mongoose'

import { ORGANIZATION_KIND_IDS } from '@rpg/contracts'

import {
  homebrewCampaignSlugIndex,
  homebrewContentIdentityFields,
} from '../lib/homebrew-content-schema'

const { model, models, Schema } = mongoose

const homebrewOrganizationSchema = new Schema(
  {
    ...homebrewContentIdentityFields,
    organizationKind: { type: String, enum: [...ORGANIZATION_KIND_IDS] },
  },
  { timestamps: true },
)

homebrewCampaignSlugIndex(homebrewOrganizationSchema)

export type HomebrewOrganizationSchemaType = InferSchemaType<typeof homebrewOrganizationSchema>

export const HomebrewOrganizationModel: Model<HomebrewOrganizationSchemaType> =
  (models.HomebrewOrganization as Model<HomebrewOrganizationSchemaType>) ??
  model<HomebrewOrganizationSchemaType>('HomebrewOrganization', homebrewOrganizationSchema)
