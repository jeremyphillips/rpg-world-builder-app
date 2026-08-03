import {
  getBuildingSubtypeIds,
  getRegionTypeIds,
  INTERIOR_TYPE_DEFINITIONS,
  type BuildingType,
  type InteriorClassificationType,
  type LocationKind,
  type RegionClassificationKind,
} from '@rpg/contracts'
import type { FormValueSync } from '@rpg/ui/form'

type ClassificationFormSlice = {
  kind?: string
  type?: string
  subtype?: string
}

function readClassification(values: Record<string, unknown>): ClassificationFormSlice {
  const classification = values['classification']
  if (!classification || typeof classification !== 'object') {
    return {}
  }
  return classification as ClassificationFormSlice
}

function classificationPatch(
  values: Record<string, unknown>,
  patch: Partial<ClassificationFormSlice> | undefined,
): Partial<Record<string, unknown>> | undefined {
  if (patch === undefined) return undefined
  const current = readClassification(values)
  return {
    classification: {
      ...current,
      ...patch,
    },
  }
}

function clearClassificationFieldsInvalidForKind(
  kind: LocationKind | undefined,
): Partial<Record<string, unknown>> | undefined {
  const patch: Partial<Record<string, unknown>> = {}

  if (kind !== 'region' && kind !== 'structure' && kind !== 'interior') {
    patch.classification = undefined
  }

  if (kind !== 'structure') {
    patch.structureType = undefined
  }

  if (kind !== 'interior') {
    patch.interiorType = undefined
  }

  return Object.keys(patch).length > 0 ? patch : undefined
}

function syncStructureTypeChange(
  values: Record<string, unknown>,
): Partial<Record<string, unknown>> | undefined {
  const structureType = values['structureType']
  if (structureType === 'building') {
    return undefined
  }

  return { classification: undefined }
}

function syncBuildingClassificationTypeChange(
  values: Record<string, unknown>,
): Partial<Record<string, unknown>> | undefined {
  const classification = readClassification(values)
  const type = classification.type
  if (!type) {
    return classification.subtype ? classificationPatch(values, { subtype: undefined }) : undefined
  }

  const subtype = classification.subtype
  if (!subtype) return undefined

  if (!(getBuildingSubtypeIds(type as BuildingType) as readonly string[]).includes(subtype)) {
    return classificationPatch(values, { subtype: undefined })
  }

  return undefined
}

function syncRegionClassificationKindChange(
  values: Record<string, unknown>,
): Partial<Record<string, unknown>> | undefined {
  const classification = readClassification(values)
  const kind = classification.kind
  if (!kind) {
    return classification.type ? classificationPatch(values, { type: undefined }) : undefined
  }

  const type = classification.type
  if (!type) return undefined

  if (!(getRegionTypeIds(kind as RegionClassificationKind) as readonly string[]).includes(type)) {
    return classificationPatch(values, { type: undefined })
  }

  return undefined
}

function syncInteriorTypeChange(
  values: Record<string, unknown>,
): Partial<Record<string, unknown>> | undefined {
  const interiorType = values['interiorType']
  if (typeof interiorType !== 'string') {
    return readClassification(values).type
      ? classificationPatch(values, { type: undefined })
      : undefined
  }

  const classification = readClassification(values)
  const type = classification.type
  if (!type) return undefined

  const validTypes = Object.keys(
    INTERIOR_TYPE_DEFINITIONS[interiorType as InteriorClassificationType].subtypes,
  )
  if (!validTypes.includes(type)) {
    return classificationPatch(values, { type: undefined })
  }

  return undefined
}

/** Pass to `<Form valueSyncs={…}>` on location create/edit routes. */
export const locationFormValueSyncs: FormValueSync[] = [
  {
    dependsOn: ['kind'],
    apply: (values, changedKeys) =>
      changedKeys.includes('kind')
        ? clearClassificationFieldsInvalidForKind(values['kind'] as LocationKind | undefined)
        : undefined,
  },
  {
    dependsOn: ['structureType'],
    apply: (values, changedKeys) =>
      changedKeys.includes('structureType') ? syncStructureTypeChange(values) : undefined,
  },
  {
    dependsOn: ['classification.type'],
    apply: (values, changedKeys) => {
      if (!changedKeys.includes('classification.type')) return undefined
      if (values['kind'] === 'structure' && values['structureType'] === 'building') {
        return syncBuildingClassificationTypeChange(values)
      }
      return undefined
    },
  },
  {
    dependsOn: ['classification.kind'],
    apply: (values, changedKeys) =>
      changedKeys.includes('classification.kind') && values['kind'] === 'region'
        ? syncRegionClassificationKindChange(values)
        : undefined,
  },
  {
    dependsOn: ['interiorType'],
    apply: (values, changedKeys) =>
      changedKeys.includes('interiorType') ? syncInteriorTypeChange(values) : undefined,
  },
]
