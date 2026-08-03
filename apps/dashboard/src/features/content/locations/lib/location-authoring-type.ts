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
  type LocationKind,
  type StructureType,
} from '@rpg/contracts'
import type { FieldOption, SelectFieldOptionListItem } from '@rpg/ui/form'

type NonStructureLocationKind = Exclude<LocationKind, 'structure'>

/** Generic unclassified structure — maps to `kind: 'structure'` with no `structureType`. */
export const UNCLASSIFIED_STRUCTURE_AUTHORING_TYPE = 'structure' as const

export const UNCLASSIFIED_STRUCTURE_LABEL = 'Unclassified structure'

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
  const worldAndRegions = [
    'plane',
    'world',
    'region',
  ] as const satisfies readonly NonStructureLocationKind[]
  const settlements = [
    'settlement',
    'district',
  ] as const satisfies readonly NonStructureLocationKind[]
  const sites = ['site'] as const satisfies readonly NonStructureLocationKind[]
  const interiors = ['interior'] as const satisfies readonly NonStructureLocationKind[]

  return [
    {
      kind: 'group',
      label: 'World & regions',
      options: worldAndRegions.map(nonStructureKindOption),
    },
    {
      kind: 'group',
      label: 'Settlements',
      options: settlements.map(nonStructureKindOption),
    },
    {
      kind: 'group',
      label: 'Sites',
      options: sites.map(nonStructureKindOption),
    },
    {
      kind: 'group',
      label: 'Structures',
      options: [...STRUCTURE_TYPE_IDS, UNCLASSIFIED_STRUCTURE_AUTHORING_TYPE].map(
        structureAuthoringTypeOption,
      ),
    },
    {
      kind: 'group',
      label: 'Interiors',
      options: interiors.map(nonStructureKindOption),
    },
  ]
}
