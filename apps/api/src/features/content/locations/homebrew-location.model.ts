import mongoose, { type InferSchemaType, type Model } from 'mongoose'

import {
  BUILDING_ARCHETYPE_IDS,
  BUILDING_FUNCTION_FAMILY_IDS,
  GEOGRAPHIC_REGION_TYPE_IDS,
  INTERIOR_TYPE_IDS,
  LOCATION_KIND_IDS,
  PLANE_TYPE_IDS,
  POLITICAL_REGION_TYPE_IDS,
  REGION_CLASSIFICATION_KIND_IDS,
  SETTLEMENT_TYPE_IDS,
  SITE_TYPE_IDS,
  STRUCTURE_TYPE_IDS,
  getInteriorSubtypeIds,
  type InteriorClassificationType,
} from '@rpg/contracts'

import {
  homebrewCampaignSlugIndex,
  homebrewContentIdentityFields,
} from '../lib/homebrew-content-schema'

const { model, models, Schema } = mongoose

const interiorClassificationTypeIds = (
  ['level', 'space', 'passage', 'vertical_access', 'overlook'] as const
).flatMap((interiorType) => [...getInteriorSubtypeIds(interiorType as InteriorClassificationType)])

/**
 * Classification subdoc mirrors storage shape only.
 * `kind`/`type` discriminate region and interior branches; building fields are Model E.
 * Zod contracts own cross-field classification validity — do not duplicate here.
 */
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
          ...interiorClassificationTypeIds,
        ],
      },
      archetype: { type: String, enum: [...BUILDING_ARCHETYPE_IDS] },
      functionOverride: { type: String, enum: [...BUILDING_FUNCTION_FAMILY_IDS] },
      specialization: { type: String },
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
