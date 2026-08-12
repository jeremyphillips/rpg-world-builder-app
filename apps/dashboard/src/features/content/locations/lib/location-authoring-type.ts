/**
 * Dashboard form projection — **not vocabulary**.
 *
 * `LocationAuthoringType` ids combine canonical `kind` + `structureType` for
 * authoring UX only. They must never be persisted or consumed by hierarchy or
 * domain logic outside the form layer.
 */
import {
  LOCATION_KIND_ENTRIES,
  LOCATION_KIND_IDS,
  STRUCTURE_TYPE_ENTRIES,
  STRUCTURE_TYPE_IDS,
  UNCLASSIFIED_STRUCTURE_LABEL,
  type LocationKind,
  type StructureType,
} from '@rpg/contracts'
import type { FieldOption, SelectFieldOptionListItem } from '@rpg/ui/form'

import { LOCATION_KIND_BROWSE_FAMILIES } from './location-kind-browse-families'

type NonStructureLocationKind = Exclude<LocationKind, 'structure'>

/** Generic unclassified structure — maps to `kind: 'structure'` with no `structureType`. */
export const UNCLASSIFIED_STRUCTURE_AUTHORING_TYPE = 'structure' as const

export { UNCLASSIFIED_STRUCTURE_LABEL } from '@rpg/contracts'

const NON_STRUCTURE_LOCATION_KIND_IDS = LOCATION_KIND_IDS.filter(
  (id): id is NonStructureLocationKind => id !== 'structure',
)

/** Every selectable location type in the authoring form, derived from contracts id arrays. */
export const LOCATION_AUTHORING_TYPE_IDS = [
  ...NON_STRUCTURE_LOCATION_KIND_IDS,
  ...STRUCTURE_TYPE_IDS,
  UNCLASSIFIED_STRUCTURE_AUTHORING_TYPE,
] as const

export type LocationAuthoringType = (typeof LOCATION_AUTHORING_TYPE_IDS)[number]

/** Authoring types that require a setup step before opening create. */
export const LOCATION_AUTHORING_TYPES_WITH_CREATE_SETUP = [
  'settlement',
  'region',
  'site',
] as const satisfies readonly LocationAuthoringType[]

export type LocationAuthoringTypeWithCreateSetup =
  (typeof LOCATION_AUTHORING_TYPES_WITH_CREATE_SETUP)[number]

/** Whether typed create for this authoring type requires setup before a fixed session. */
export function requiresLocationCreateSetup(
  type: LocationAuthoringType,
): type is LocationAuthoringTypeWithCreateSetup {
  return (LOCATION_AUTHORING_TYPES_WITH_CREATE_SETUP as readonly string[]).includes(type)
}

function isStructureAuthoringType(
  type: LocationAuthoringType,
): type is StructureType | typeof UNCLASSIFIED_STRUCTURE_AUTHORING_TYPE {
  return (
    type === UNCLASSIFIED_STRUCTURE_AUTHORING_TYPE ||
    (STRUCTURE_TYPE_IDS as readonly string[]).includes(type)
  )
}

/** Maps a form authoring type to canonical persisted fields. */
export function canonicalFieldsForAuthoringType(type: LocationAuthoringType): {
  kind: LocationKind
  structureType?: StructureType
} {
  if (isStructureAuthoringType(type)) {
    if (type === UNCLASSIFIED_STRUCTURE_AUTHORING_TYPE) {
      return { kind: 'structure' }
    }
    return { kind: 'structure', structureType: type }
  }

  return { kind: type }
}

/** Hydrates the form authoring type from a persisted location shape. */
export function resolveLocationAuthoringType(entity: {
  kind: LocationKind
  structureType?: StructureType
}): LocationAuthoringType {
  if (entity.kind === 'structure') {
    return entity.structureType ?? UNCLASSIFIED_STRUCTURE_AUTHORING_TYPE
  }

  return entity.kind
}

export function visibleForAuthoringType(...types: LocationAuthoringType[]) {
  const allowed = new Set<string>(types)

  return {
    dependsOn: ['authoringType'],
    visibleWhen: (watched: Record<string, unknown>) => {
      const authoringType = watched['authoringType']
      return typeof authoringType === 'string' && allowed.has(authoringType)
    },
  }
}

/** Top-level location form fields governed by authoring type validity. */
export type LocationAuthoringTopLevelField =
  | 'planeType'
  | 'settlementType'
  | 'siteType'
  | 'interiorType'

/** Nested classification keys governed by authoring type validity. */
export type LocationAuthoringClassificationField = 'kind' | 'type' | 'form' | 'facilityType'

export interface LocationAuthoringFieldValidity {
  topLevel: ReadonlySet<LocationAuthoringTopLevelField>
  classification: ReadonlySet<LocationAuthoringClassificationField>
}

const ALL_TOP_LEVEL_FIELDS: LocationAuthoringTopLevelField[] = [
  'planeType',
  'settlementType',
  'siteType',
  'interiorType',
]

const ALL_CLASSIFICATION_FIELDS: LocationAuthoringClassificationField[] = [
  'kind',
  'type',
  'form',
  'facilityType',
]

/** Which form fields remain valid for a selected authoring type. */
export function formFieldsValidForAuthoringType(
  type: LocationAuthoringType,
): LocationAuthoringFieldValidity {
  const topLevel = new Set<LocationAuthoringTopLevelField>()
  const classification = new Set<LocationAuthoringClassificationField>()

  switch (type) {
    case 'plane':
      topLevel.add('planeType')
      break
    case 'settlement':
      topLevel.add('settlementType')
      break
    case 'site':
      topLevel.add('siteType')
      break
    case 'region':
      classification.add('kind')
      classification.add('type')
      break
    case 'building':
      classification.add('form')
      classification.add('facilityType')
      break
    case 'interior':
      topLevel.add('interiorType')
      classification.add('type')
      break
    default:
      break
  }

  return { topLevel, classification }
}

/** Parses a watched form value into a known authoring type, if present. */
export function resolveAuthoringTypeFromFormValues(
  values: Record<string, unknown>,
): LocationAuthoringType | undefined {
  const authoringType = values['authoringType']
  if (
    typeof authoringType !== 'string' ||
    authoringType === '' ||
    !(LOCATION_AUTHORING_TYPE_IDS as readonly string[]).includes(authoringType)
  ) {
    return undefined
  }
  return authoringType as LocationAuthoringType
}

function clearInvalidTopLevelFields(
  values: Record<string, unknown>,
  validTopLevel: ReadonlySet<LocationAuthoringTopLevelField>,
): Partial<Record<string, unknown>> {
  const patch: Partial<Record<string, unknown>> = {}

  for (const field of ALL_TOP_LEVEL_FIELDS) {
    if (!validTopLevel.has(field) && values[field] !== undefined) {
      patch[field] = undefined
    }
  }

  return patch
}

function clearInvalidClassificationFields(
  values: Record<string, unknown>,
  validClassification: ReadonlySet<LocationAuthoringClassificationField>,
): Partial<Record<string, unknown>> {
  const classification = values['classification']
  if (!classification || typeof classification !== 'object') {
    return validClassification.size || classification === undefined
      ? {}
      : { classification: undefined }
  }

  const current = classification as Record<string, unknown>
  const classificationPatch: Record<string, undefined> = {}

  for (const field of ALL_CLASSIFICATION_FIELDS) {
    if (!validClassification.has(field) && current[field] !== undefined) {
      classificationPatch[field] = undefined
    }
  }

  if (Object.keys(classificationPatch).length === 0) {
    return {}
  }

  return {
    classification: {
      ...current,
      ...classificationPatch,
    },
  }
}

/** Clears form values that are invalid for the selected authoring type. */
export function clearInvalidFieldsForAuthoringType(
  values: Record<string, unknown>,
  authoringType: LocationAuthoringType | undefined,
): Partial<Record<string, unknown>> | undefined {
  if (!authoringType) return undefined

  const { topLevel, classification } = formFieldsValidForAuthoringType(authoringType)
  const patch = {
    ...clearInvalidTopLevelFields(values, topLevel),
    ...clearInvalidClassificationFields(values, classification),
  }

  return Object.keys(patch).length > 0 ? patch : undefined
}

function nonStructureKindOption(id: NonStructureLocationKind): FieldOption {
  return { value: id, label: LOCATION_KIND_ENTRIES[id].label }
}

function structureAuthoringTypeOption(
  id: StructureType | typeof UNCLASSIFIED_STRUCTURE_AUTHORING_TYPE,
): FieldOption {
  if (id === UNCLASSIFIED_STRUCTURE_AUTHORING_TYPE) {
    return { value: id, label: UNCLASSIFIED_STRUCTURE_LABEL }
  }

  return { value: id, label: STRUCTURE_TYPE_ENTRIES[id].label }
}

/** Grouped location type options for the authoring select. */
export function buildLocationAuthoringTypeOptions(): SelectFieldOptionListItem[] {
  return LOCATION_KIND_BROWSE_FAMILIES.map((family) => {
    if (family.id === 'structures') {
      return {
        kind: 'group' as const,
        label: family.label,
        options: [...STRUCTURE_TYPE_IDS, UNCLASSIFIED_STRUCTURE_AUTHORING_TYPE].map(
          structureAuthoringTypeOption,
        ),
      }
    }

    return {
      kind: 'group' as const,
      label: family.label,
      options: family.kinds.map((kind) => nonStructureKindOption(kind)),
    }
  })
}
