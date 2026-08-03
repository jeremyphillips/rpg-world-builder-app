import { z } from 'zod'

import { planeTypeSchema } from '../../vocab/location/plane-type'

/** Kind-specific fields for `kind: 'plane'`. */
export const planeLocationKindFields = {
  kind: z.literal('plane'),
  planeType: planeTypeSchema.optional(),
} as const

export const planeLocationKindSchema = z.object(planeLocationKindFields)

export type PlaneLocationKindFields = z.infer<typeof planeLocationKindSchema>
