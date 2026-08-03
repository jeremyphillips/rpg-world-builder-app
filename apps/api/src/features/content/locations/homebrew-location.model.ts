import mongoose, { type InferSchemaType, type Model } from 'mongoose'

import {
  BUILDING_TYPE_IDS,
  GEOGRAPHIC_REGION_TYPE_IDS,
  INTERIOR_TYPE_IDS,
  LOCATION_KIND_IDS,
  PLANE_TYPE_IDS,
  POLITICAL_REGION_TYPE_IDS,
  REGION_CLASSIFICATION_KIND_IDS,
  SETTLEMENT_TYPE_IDS,
  SITE_TYPE_IDS,
  STRUCTURE_TYPE_IDS,
  getBuildingSubtypeIds,
  getInteriorSubtypeIds,
  type InteriorClassificationType,
} from '@rpg/contracts'

import {
  homebrewCampaignSlugIndex,
  homebrewContentIdentityFields,
} from '../lib/homebrew-content-schema'

const { model, models, Schema } = mongoose

const buildingSubtypeIds = BUILDING_TYPE_IDS.flatMap((type) => [...getBuildingSubtypeIds(type)])
const interiorClassificationTypeIds = (
  ['level', 'space', 'passage', 'vertical_access', 'overlook'] as const
).flatMap((interiorType) => [...getInteriorSubtypeIds(interiorType as InteriorClassificationType)])

const homebrewLocationSchema = new Schema(
  {
    ...homebrewContentIdentityFields,
    kind: { type: String, enum: [...LOCATION_KIND_IDS], required: true },
    parentLocationId: { type: String, index: true },
    planeType: { type: String, enum: [...PLANE_TYPE_IDS] },
    classification: {
      kind: { type: String, enum: [...REGION_CLASSIFICATION_KIND_IDS] },
      type: {
        type: String,
        enum: [
          ...POLITICAL_REGION_TYPE_IDS,
          ...GEOGRAPHIC_REGION_TYPE_IDS,
          ...BUILDING_TYPE_IDS,
          ...interiorClassificationTypeIds,
        ],
      },
      subtype: { type: String, enum: [...buildingSubtypeIds] },
    },
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
