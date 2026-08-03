import { z } from 'zod'

import { regionTypeSchema } from '../../vocab/location/region-type'

/** Kind-specific fields for `kind: 'region'`. */
export const regionLocationKindFields = {
  kind: z.literal('region'),
  regionType: regionTypeSchema.optional(),
} as const

export const regionLocationKindSchema = z.object(regionLocationKindFields)

export type RegionLocationKindFields = z.infer<typeof regionLocationKindSchema>
