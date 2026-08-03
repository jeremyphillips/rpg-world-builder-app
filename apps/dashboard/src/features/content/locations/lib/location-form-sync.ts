import {
  BUILDING_ARCHETYPE_IDS,
  getBuildingArchetypeFunctions,
  getRegionTypeIds,
  INTERIOR_TYPE_DEFINITIONS,
  type BuildingArchetype,
  type BuildingFunctionFamily,
  type InteriorClassificationType,
  type RegionClassificationKind,
} from '@rpg/contracts'
import type { FormValueSync } from '@rpg/ui/form'

import {
  clearInvalidFieldsForAuthoringType,
  resolveAuthoringTypeFromFormValues,
} from './location-authoring-type'

type ClassificationFormSlice = {
  kind?: string
  type?: string
  archetype?: string
  functionOverride?: string
  specialization?: string
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

function syncBuildingArchetypeChange(
  values: Record<string, unknown>,
): Partial<Record<string, unknown>> | undefined {
  const classification = readClassification(values)
  const patch: Partial<ClassificationFormSlice> = {}

  if (classification.specialization) {
    patch.specialization = undefined
  }
  if (classification.functionOverride) {
    patch.functionOverride = undefined
  }

  return Object.keys(patch).length > 0 ? classificationPatch(values, patch) : undefined
}

function syncRedundantFunctionOverride(
  values: Record<string, unknown>,
): Partial<Record<string, unknown>> | undefined {
  const classification = readClassification(values)
  const { archetype, functionOverride } = classification
  if (!archetype || !functionOverride) return undefined
  if (!BUILDING_ARCHETYPE_IDS.includes(archetype as BuildingArchetype)) return undefined

  const defaultFunctions = getBuildingArchetypeFunctions(archetype as BuildingArchetype)
  if (!defaultFunctions.includes(functionOverride as BuildingFunctionFamily)) return undefined

  return classificationPatch(values, { functionOverride: undefined })
}

/** Clears specialization and function override when the building archetype changes. */
export function applyBuildingArchetypeValueSync(
  values: Record<string, unknown>,
): Partial<Record<string, unknown>> | undefined {
  return syncBuildingArchetypeChange(values)
}

/** Clears subtype and classification fields invalid for the selected authoring type. */
export function applyAuthoringTypeValueSync(
  values: Record<string, unknown>,
): Partial<Record<string, unknown>> | undefined {
  return clearInvalidFieldsForAuthoringType(values, resolveAuthoringTypeFromFormValues(values))
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

function isBuildingAuthoringType(values: Record<string, unknown>): boolean {
  return resolveAuthoringTypeFromFormValues(values) === 'building'
}

/** Pass to `<Form valueSyncs={…}>` on location create/edit routes. */
export const locationFormValueSyncs: FormValueSync[] = [
  {
    dependsOn: ['authoringType'],
    apply: (values, changedKeys) =>
      changedKeys.includes('authoringType') ? applyAuthoringTypeValueSync(values) : undefined,
  },
  {
    dependsOn: ['classification.archetype'],
    apply: (values, changedKeys) => {
      if (!changedKeys.includes('classification.archetype')) return undefined
      if (isBuildingAuthoringType(values)) {
        return syncBuildingArchetypeChange(values)
      }
      return undefined
    },
  },
  {
    dependsOn: ['classification.archetype', 'classification.functionOverride'],
    apply: (values, changedKeys) => {
      if (!isBuildingAuthoringType(values)) return undefined
      if (
        !changedKeys.includes('classification.archetype') &&
        !changedKeys.includes('classification.functionOverride')
      ) {
        return undefined
      }
      return syncRedundantFunctionOverride(values)
    },
  },
  {
    dependsOn: ['classification.kind'],
    apply: (values, changedKeys) =>
      changedKeys.includes('classification.kind') &&
      resolveAuthoringTypeFromFormValues(values) === 'region'
        ? syncRegionClassificationKindChange(values)
        : undefined,
  },
  {
    dependsOn: ['interiorType'],
    apply: (values, changedKeys) =>
      changedKeys.includes('interiorType') ? syncInteriorTypeChange(values) : undefined,
  },
]
