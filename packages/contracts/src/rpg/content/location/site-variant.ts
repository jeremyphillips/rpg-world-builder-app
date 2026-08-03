import { z } from 'zod'

import { siteTypeSchema } from '../../vocab/location/site-type'

/** Kind-specific fields for `kind: 'site'`. */
export const siteLocationKindFields = {
  kind: z.literal('site'),
  siteType: siteTypeSchema.optional(),
} as const

export const siteLocationKindSchema = z.object(siteLocationKindFields)

export type SiteLocationKindFields = z.infer<typeof siteLocationKindSchema>
