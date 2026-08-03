import mongoose, { type InferSchemaType, type Model } from 'mongoose'

import {
  INTERIOR_TYPE_IDS,
  LOCATION_KIND_IDS,
  PLANE_TYPE_IDS,
  REGION_TYPE_IDS,
  SETTLEMENT_TYPE_IDS,
  SITE_TYPE_IDS,
  STRUCTURE_TYPE_IDS,
} from '@rpg/contracts'

import {
  homebrewCampaignSlugIndex,
  homebrewContentIdentityFields,
} from '../lib/homebrew-content-schema'

const { model, models, Schema } = mongoose

const homebrewLocationSchema = new Schema(
  {
    ...homebrewContentIdentityFields,
    kind: { type: String, enum: [...LOCATION_KIND_IDS], required: true },
    parentLocationId: { type: String, index: true },
    planeType: { type: String, enum: [...PLANE_TYPE_IDS] },
    regionType: { type: String, enum: [...REGION_TYPE_IDS] },
    settlementType: { type: String, enum: [...SETTLEMENT_TYPE_IDS] },
    siteType: { type: String, enum: [...SITE_TYPE_IDS] },
    structureType: { type: String, enum: [...STRUCTURE_TYPE_IDS] },
    interiorType: { type: String, enum: [...INTERIOR_TYPE_IDS] },
  },
  { timestamps: true },
)

homebrewCampaignSlugIndex(homebrewLocationSchema)
homebrewLocationSchema.index({ campaignId: 1, parentLocationId: 1 })

export type HomebrewLocationSchemaType = InferSchemaType<typeof homebrewLocationSchema>

export const HomebrewLocationModel: Model<HomebrewLocationSchemaType> =
  (models.HomebrewLocation as Model<HomebrewLocationSchemaType>) ??
  model<HomebrewLocationSchemaType>('HomebrewLocation', homebrewLocationSchema)
