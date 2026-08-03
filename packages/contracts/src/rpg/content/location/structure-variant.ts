import { z } from 'zod'

import { structureTypeSchema } from '../../vocab/location/structure-type'

/** Kind-specific fields for `kind: 'structure'`. */
export const structureLocationKindFields = {
  kind: z.literal('structure'),
  structureType: structureTypeSchema.optional(),
} as const

export const structureLocationKindSchema = z.object(structureLocationKindFields)

export type StructureLocationKindFields = z.infer<typeof structureLocationKindSchema>
