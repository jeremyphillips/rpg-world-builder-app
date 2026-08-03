import { z } from 'zod'

/** Kind-specific fields for `kind: 'district'`. */
export const districtLocationKindFields = {
  kind: z.literal('district'),
} as const

export const districtLocationKindSchema = z.object(districtLocationKindFields)

export type DistrictLocationKindFields = z.infer<typeof districtLocationKindSchema>
