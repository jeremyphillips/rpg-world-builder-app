import { z } from 'zod'

import { interiorTypeSchema } from '../../vocab/location/interior-type'

/** Kind-specific fields for `kind: 'interior'`. */
export const interiorLocationKindFields = {
  kind: z.literal('interior'),
  interiorType: interiorTypeSchema.optional(),
} as const

export const interiorLocationKindSchema = z.object(interiorLocationKindFields)

export type InteriorLocationKindFields = z.infer<typeof interiorLocationKindSchema>
