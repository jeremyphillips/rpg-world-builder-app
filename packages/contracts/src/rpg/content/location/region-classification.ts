import { z } from 'zod'

import { geographicRegionTypeSchema } from '../../vocab/location/geographic-region-type'
import { politicalRegionTypeSchema } from '../../vocab/location/political-region-type'
import {
  getRegionTypeEntry,
  type RegionClassificationKind,
} from '../../vocab/location/region-classification-definitions'

const politicalRegionClassificationSchema = z.object({
  kind: z.literal('political'),
  type: politicalRegionTypeSchema,
})

const geographicRegionClassificationSchema = z.object({
  kind: z.literal('geographic'),
  type: geographicRegionTypeSchema,
})

export const regionClassificationSchema = z.discriminatedUnion('kind', [
  politicalRegionClassificationSchema,
  geographicRegionClassificationSchema,
])

export type RegionClassification = z.infer<typeof regionClassificationSchema>

/** Returns the type entry for a stored region classification, if known. */
export function getRegionClassificationTypeEntry(classification: RegionClassification) {
  return getRegionTypeEntry(classification.kind, classification.type)
}

export function isRegionClassificationKind(value: string): value is RegionClassificationKind {
  return value === 'political' || value === 'geographic'
}
