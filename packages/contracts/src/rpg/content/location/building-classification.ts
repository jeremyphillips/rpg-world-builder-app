import { z } from 'zod'

import { keysFromEntries } from '../../vocab/enum-schema'
import {
  BUILDING_TYPE_DEFINITIONS,
  BUILDING_TYPE_IDS,
  getBuildingSubtypeEntry,
  getBuildingSubtypeIds,
  getBuildingSubtypeLabel,
  getBuildingTypeEntry,
  getBuildingTypeLabel,
  type BuildingSubtype,
  type BuildingType,
} from '../../vocab/location/building-type-definitions'
import { getStructureTypeLabel } from '../../vocab/location/structure-type'

function buildingClassificationBranch(type: BuildingType) {
  const subtypeIds = getBuildingSubtypeIds(type)
  if (subtypeIds.length === 0) {
    return z.object({ type: z.literal(type) })
  }

  const subtypeEntries = BUILDING_TYPE_DEFINITIONS[type].subtypes
  const subtypeSchema = z.enum(keysFromEntries(subtypeEntries)).optional()

  return z.object({
    type: z.literal(type),
    subtype: subtypeSchema,
  })
}

export const buildingClassificationSchema = z.discriminatedUnion(
  'type',
  BUILDING_TYPE_IDS.map((type) => buildingClassificationBranch(type)) as [
    ReturnType<typeof buildingClassificationBranch>,
    ...ReturnType<typeof buildingClassificationBranch>[],
  ],
)

export type BuildingClassification = z.infer<typeof buildingClassificationSchema>

export function isBuildingSubtypeValid(type: BuildingType, subtype: string | undefined): boolean {
  if (!subtype) return true
  return (getBuildingSubtypeIds(type) as readonly string[]).includes(subtype)
}

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

  const typeLabel = getBuildingTypeLabel(input.classification.type)
  const subtype =
    'subtype' in input.classification && typeof input.classification.subtype === 'string'
      ? input.classification.subtype
      : undefined
  if (subtype) {
    return `${coarseLabel} · ${typeLabel} · ${getBuildingSubtypeLabel(
      input.classification.type,
      subtype,
    )}`
  }

  return `${coarseLabel} · ${typeLabel}`
}

export function getBuildingClassificationTypeEntry(classification: BuildingClassification) {
  return getBuildingTypeEntry(classification.type)
}

export function getBuildingClassificationSubtypeEntry(classification: BuildingClassification) {
  if (!('subtype' in classification) || typeof classification.subtype !== 'string') return undefined
  return getBuildingSubtypeEntry(classification.type, classification.subtype)
}

export type { BuildingSubtype, BuildingType }
