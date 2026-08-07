import { z } from 'zod'

import {
  buildingArchetypeSchema,
  type BuildingArchetype,
} from '../../vocab/location/building-archetype'
import { buildingFunctionFamilySchema } from '../../vocab/location/building-function-family'

export const buildingClassificationSchema = z.object({
  archetype: buildingArchetypeSchema,
  functionOverride: buildingFunctionFamilySchema.optional(),
  specialization: z.string().trim().min(1).max(80).optional(),
})

export type BuildingClassification = z.infer<typeof buildingClassificationSchema>

export type { BuildingArchetype }
