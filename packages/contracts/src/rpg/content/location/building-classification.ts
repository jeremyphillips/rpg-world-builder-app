import { z } from 'zod'

import {
  buildingArchetypeSchema,
  getBuildingArchetypeLabel,
  type BuildingArchetype,
} from '../../vocab/location/building-archetype'
import { buildingFunctionFamilySchema } from '../../vocab/location/building-function-family'
import { getStructureTypeLabel } from '../../vocab/location/structure-type'

export const buildingClassificationSchema = z.object({
  archetype: buildingArchetypeSchema,
  functionOverride: buildingFunctionFamilySchema.optional(),
  specialization: z.string().trim().min(1).max(80).optional(),
})

export type BuildingClassification = z.infer<typeof buildingClassificationSchema>

/** Composes a display label for structure classification from registry entries. */
export function getStructureClassificationLabel(input: {
  structureType?: string
  classification?: BuildingClassification
}): string | undefined {
  if (!input.structureType) return undefined

  const coarseLabel = getStructureTypeLabel(input.structureType)
  if (input.structureType !== 'building' || !input.classification) {
    return coarseLabel
  }

  const archetypeLabel = getBuildingArchetypeLabel(input.classification.archetype)
  if (input.classification.specialization) {
    return `${coarseLabel} · ${archetypeLabel} · ${input.classification.specialization}`
  }

  return `${coarseLabel} · ${archetypeLabel}`
}

export type { BuildingArchetype }
