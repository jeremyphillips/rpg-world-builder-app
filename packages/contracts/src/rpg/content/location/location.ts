import { z } from 'zod'

import { LOCATION_KIND_IDS } from '../../vocab/location/region/kind'
import { formatUnionBranchDescription } from '../../vocab/enum-schema'
import { createDraftInputSchema } from '../lib/content-input-schemas'
import { LOCATION_CONTENT_TYPE_TERM } from '../lib/content-type-terms'
import { draftAuthoredContentBodySchema } from '../lib/draft-authored-content'
import { contentMetaSchema, slugSchema } from '../lib/envelope'
import { locationBaseSchema } from './base'
import { districtLocationKindFields } from './district-variant'
import {
  interiorBodySchema,
  interiorLocationKindFields,
  refineInteriorBodyClassification,
} from './interior-body'
import { planeLocationKindFields } from './plane-variant'
import { regionLocationKindFields } from './region-variant'
import {
  refineStructureBodyClassification,
  structureBodySchema,
  structureLocationKindFields,
} from './structure-body'
import { settlementLocationKindFields } from './settlement-variant'
import { siteLocationKindFields } from './site-variant'
import { worldLocationKindFields } from './world-variant'
import { interiorTypeSchema } from '../../vocab/location/building/interior-type'
import { planeTypeSchema } from '../../vocab/location/region/plane-type'
import { regionClassificationSchema } from './region-classification'
import { buildingClassificationSchema } from './building-classification'
import { interiorClassificationSchema } from './interior-classification'
import { settlementTypeSchema } from '../../vocab/location/region/settlement-type'
import { siteTypeSchema } from '../../vocab/location/region/site-type'
import { structureTypeSchema } from '../../vocab/location/building/structure-type'

// ---------------------------------------------------------------------------
// Location — campaign-authored content type discriminated by `kind`. Each
// structural kind carries only kind-meaningful fields; subtype fields are
// optional closed-vocab refinements with no `other` bucket.
// ---------------------------------------------------------------------------

const planeLocationBodyFields = locationBaseSchema.extend(planeLocationKindFields)
const worldLocationBodyFields = locationBaseSchema.extend(worldLocationKindFields)
const regionLocationBodyFields = locationBaseSchema.extend(regionLocationKindFields).strict()
const settlementLocationBodyFields = locationBaseSchema.extend(settlementLocationKindFields)
const districtLocationBodyFields = locationBaseSchema.extend(districtLocationKindFields)
const siteLocationBodyFields = locationBaseSchema.extend(siteLocationKindFields)
const structureLocationBodyFields = locationBaseSchema.extend(structureLocationKindFields)
const interiorLocationBodyFields = locationBaseSchema.extend(interiorLocationKindFields)

export const planeBodySchema = planeLocationBodyFields
export const worldBodySchema = worldLocationBodyFields
export const regionBodySchema = regionLocationBodyFields
export const settlementBodySchema = settlementLocationBodyFields
export const districtBodySchema = districtLocationBodyFields
export const siteBodySchema = siteLocationBodyFields
const structureLocationBodySchema = structureLocationBodyFields
const interiorLocationBodySchema = interiorLocationBodyFields

export { structureBodySchema } from './structure-body'
export { interiorBodySchema } from './interior-body'

const locationBodyVariants = [
  planeBodySchema,
  worldBodySchema,
  regionBodySchema,
  settlementBodySchema,
  districtBodySchema,
  siteBodySchema,
  structureLocationBodySchema,
  interiorLocationBodySchema,
] as const

/** Publish-complete editable body for every location kind. */
export const locationBodySchema = z
  .discriminatedUnion('kind', [...locationBodyVariants])
  .describe(formatUnionBranchDescription('kind', [...LOCATION_KIND_IDS]))
  .superRefine((data, ctx) => {
    if (data.kind === 'structure') {
      refineStructureBodyClassification(data, ctx)
    }
    if (data.kind === 'interior') {
      refineInteriorBodyClassification(data, ctx)
    }
  })

export type LocationBody = z.infer<typeof locationBodySchema>

/** Stored published location = ownership envelope + complete body, per variant. */
export const locationSchema = z
  .discriminatedUnion('kind', [
    contentMetaSchema.extend(planeLocationBodyFields.shape),
    contentMetaSchema.extend(worldLocationBodyFields.shape),
    contentMetaSchema.extend(regionLocationBodyFields.shape),
    contentMetaSchema.extend(settlementLocationBodyFields.shape),
    contentMetaSchema.extend(districtLocationBodyFields.shape),
    contentMetaSchema.extend(siteLocationBodyFields.shape),
    contentMetaSchema.extend(structureLocationBodyFields.shape),
    contentMetaSchema.extend(interiorLocationBodyFields.shape),
  ])
  .describe(formatUnionBranchDescription('kind', [...LOCATION_KIND_IDS]))

export type Location = z.infer<typeof locationSchema>

export const createLocationInputSchema = z.discriminatedUnion('kind', [
  planeBodySchema.extend({ slug: slugSchema }),
  worldBodySchema.extend({ slug: slugSchema }),
  regionBodySchema.extend({ slug: slugSchema }),
  settlementBodySchema.extend({ slug: slugSchema }),
  districtBodySchema.extend({ slug: slugSchema }),
  siteBodySchema.extend({ slug: slugSchema }),
  structureBodySchema.extend({ slug: slugSchema }),
  interiorBodySchema.extend({ slug: slugSchema }),
])

export type CreateLocationInput = z.infer<typeof createLocationInputSchema>

// ---------------------------------------------------------------------------
// Draft body variants — kind required; subtypes and parent may remain unset.
// ---------------------------------------------------------------------------

const locationBaseDraftSchema = draftAuthoredContentBodySchema(
  LOCATION_CONTENT_TYPE_TERM.label,
).extend({
  parentLocationId: z.string().min(1).optional(),
})

const planeLocationBodyDraftFields = locationBaseDraftSchema.extend({
  kind: z.literal('plane'),
  planeType: planeTypeSchema.optional(),
})

const worldLocationBodyDraftFields = locationBaseDraftSchema.extend({
  kind: z.literal('world'),
})

const regionLocationBodyDraftFields = locationBaseDraftSchema.extend({
  kind: z.literal('region'),
  classification: regionClassificationSchema.optional(),
})

const settlementLocationBodyDraftFields = locationBaseDraftSchema.extend({
  kind: z.literal('settlement'),
  settlementType: settlementTypeSchema.optional(),
})

const districtLocationBodyDraftFields = locationBaseDraftSchema.extend({
  kind: z.literal('district'),
})

const siteLocationBodyDraftFields = locationBaseDraftSchema.extend({
  kind: z.literal('site'),
  siteType: siteTypeSchema.optional(),
})

const structureLocationBodyDraftFields = locationBaseDraftSchema.extend({
  kind: z.literal('structure'),
  structureType: structureTypeSchema.optional(),
  classification: buildingClassificationSchema.optional(),
})

const interiorLocationBodyDraftFields = locationBaseDraftSchema.extend({
  kind: z.literal('interior'),
  interiorType: interiorTypeSchema.optional(),
  classification: interiorClassificationSchema.optional(),
})

export const planeBodyDraftSchema = planeLocationBodyDraftFields
export const worldBodyDraftSchema = worldLocationBodyDraftFields
export const regionBodyDraftSchema = regionLocationBodyDraftFields
export const settlementBodyDraftSchema = settlementLocationBodyDraftFields
export const districtBodyDraftSchema = districtLocationBodyDraftFields
export const siteBodyDraftSchema = siteLocationBodyDraftFields
export const structureBodyDraftSchema = structureLocationBodyDraftFields
export const interiorBodyDraftSchema = interiorLocationBodyDraftFields

const locationBodyDraftVariants = [
  planeBodyDraftSchema,
  worldBodyDraftSchema,
  regionBodyDraftSchema,
  settlementBodyDraftSchema,
  districtBodyDraftSchema,
  siteBodyDraftSchema,
  structureBodyDraftSchema,
  interiorBodyDraftSchema,
] as const

export const locationBodyDraftSchema = z
  .discriminatedUnion('kind', [...locationBodyDraftVariants])
  .describe(formatUnionBranchDescription('kind', [...LOCATION_KIND_IDS]))
  .superRefine((data, ctx) => {
    if (data.kind === 'structure') {
      refineStructureBodyClassification(data, ctx)
    }
    if (data.kind === 'interior') {
      refineInteriorBodyClassification(data, ctx)
    }
  })

export type LocationBodyDraft = z.infer<typeof locationBodyDraftSchema>

export const locationDraftStoredSchema = z
  .discriminatedUnion('kind', [
    contentMetaSchema.extend(planeLocationBodyDraftFields.shape),
    contentMetaSchema.extend(worldLocationBodyDraftFields.shape),
    contentMetaSchema.extend(regionLocationBodyDraftFields.shape),
    contentMetaSchema.extend(settlementLocationBodyDraftFields.shape),
    contentMetaSchema.extend(districtLocationBodyDraftFields.shape),
    contentMetaSchema.extend(siteLocationBodyDraftFields.shape),
    contentMetaSchema.extend(structureLocationBodyDraftFields.shape),
    contentMetaSchema.extend(interiorLocationBodyDraftFields.shape),
  ])
  .describe(formatUnionBranchDescription('kind', [...LOCATION_KIND_IDS]))

export type LocationDraft = z.infer<typeof locationDraftStoredSchema>

export const createLocationDraftInputSchema = z.discriminatedUnion('kind', [
  createDraftInputSchema(planeLocationBodyDraftFields),
  createDraftInputSchema(worldLocationBodyDraftFields),
  createDraftInputSchema(regionLocationBodyDraftFields),
  createDraftInputSchema(settlementLocationBodyDraftFields),
  createDraftInputSchema(districtLocationBodyDraftFields),
  createDraftInputSchema(siteLocationBodyDraftFields),
  createDraftInputSchema(structureLocationBodyDraftFields),
  createDraftInputSchema(interiorLocationBodyDraftFields),
])

export type CreateLocationDraftInput = z.infer<typeof createLocationDraftInputSchema>

export const updateLocationDraftInputSchema = z.discriminatedUnion('kind', [
  planeLocationBodyDraftFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: planeLocationKindFields.kind }),
  worldLocationBodyDraftFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: worldLocationKindFields.kind }),
  regionLocationBodyDraftFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: regionLocationKindFields.kind }),
  settlementLocationBodyDraftFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: settlementLocationKindFields.kind }),
  districtLocationBodyDraftFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: districtLocationKindFields.kind }),
  siteLocationBodyDraftFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: siteLocationKindFields.kind }),
  structureLocationBodyDraftFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: structureLocationKindFields.kind }),
  interiorLocationBodyDraftFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: interiorLocationKindFields.kind }),
])

export type UpdateLocationDraftInput = z.infer<typeof updateLocationDraftInputSchema>

export const updateLocationInputSchema = z.discriminatedUnion('kind', [
  planeLocationBodyFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: planeLocationKindFields.kind }),
  worldLocationBodyFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: worldLocationKindFields.kind }),
  regionLocationBodyFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: regionLocationKindFields.kind }),
  settlementLocationBodyFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: settlementLocationKindFields.kind }),
  districtLocationBodyFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: districtLocationKindFields.kind }),
  siteLocationBodyFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: siteLocationKindFields.kind }),
  structureLocationBodyFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: structureLocationKindFields.kind }),
  interiorLocationBodyFields
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: interiorLocationKindFields.kind }),
])

export type UpdateLocationInput = z.infer<typeof updateLocationInputSchema>

export type PlaneLocation = Extract<Location, { kind: 'plane' }>
export type WorldLocation = Extract<Location, { kind: 'world' }>
export type RegionLocation = Extract<Location, { kind: 'region' }>
export type SettlementLocation = Extract<Location, { kind: 'settlement' }>
export type DistrictLocation = Extract<Location, { kind: 'district' }>
export type SiteLocation = Extract<Location, { kind: 'site' }>
export type StructureLocation = Extract<Location, { kind: 'structure' }>
export type InteriorLocation = Extract<Location, { kind: 'interior' }>
