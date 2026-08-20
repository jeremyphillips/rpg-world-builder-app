import {
  getInteriorSubtypeIds,
  getRegionTypeIds,
  INTERIOR_TYPE_IDS,
  isRegionClassificationKind,
  type InteriorClassificationType,
} from '@rpg/contracts'
import type { FormValueSync } from '@rpg/ui/form'

import {
  clearInvalidFieldsForAuthoringType,
  resolveAuthoringTypeFromFormValues,
} from '../location-authoring-type'

type ClassificationFormSlice = {
  kind?: string
  type?: string
  form?: string
  facilityType?: string
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

  if (!isRegionClassificationKind(kind)) {
    return classificationPatch(values, { type: undefined })
  }

  if (!(getRegionTypeIds(kind) as readonly string[]).includes(type)) {
    return classificationPatch(values, { type: undefined })
  }

  return undefined
}

function syncInteriorTypeChange(
  values: Record<string, unknown>,
): Partial<Record<string, unknown>> | undefined {
  const interiorType = values['interiorType']
  if (
    typeof interiorType !== 'string' ||
    !(INTERIOR_TYPE_IDS as readonly string[]).includes(interiorType)
  ) {
    return readClassification(values).type
      ? classificationPatch(values, { type: undefined })
      : undefined
  }

  const classification = readClassification(values)
  const type = classification.type
  if (!type) return undefined

  const validTypes = getInteriorSubtypeIds(interiorType as InteriorClassificationType)
  if (!(validTypes as readonly string[]).includes(type)) {
    return classificationPatch(values, { type: undefined })
  }

  return undefined
}

/** Pass to `<Form valueSyncs={…}>` on location create/edit routes. */
export const locationFormValueSyncs: FormValueSync[] = [
  {
    dependsOn: ['authoringType'],
    apply: (values, changedKeys) =>
      changedKeys.includes('authoringType') ? applyAuthoringTypeValueSync(values) : undefined,
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
