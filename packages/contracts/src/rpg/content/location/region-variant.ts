import { z } from 'zod'

import { regionClassificationSchema } from './region-classification'

/** Kind-specific fields for `kind: 'region'`. */
export const regionLocationKindFields = {
  kind: z.literal('region'),
  classification: regionClassificationSchema.optional(),
} as const

export const regionLocationKindSchema = z.object(regionLocationKindFields)

export type RegionLocationKindFields = z.infer<typeof regionLocationKindSchema>
