import { z } from 'zod'

import { regionClassificationSchema } from './region-classification'
import { territorialAuthorityRelationshipsSchema } from './territorial-authority'

/** Kind-specific fields for `kind: 'region'`. */
export const regionLocationKindFields = {
  kind: z.literal('region'),
  classification: regionClassificationSchema.optional(),
  territorialAuthority: territorialAuthorityRelationshipsSchema,
} as const

export const regionLocationKindSchema = z.object(regionLocationKindFields)

export type RegionLocationKindFields = z.infer<typeof regionLocationKindSchema>
