import {
  isValidParentKind,
  LOCATION_KIND_ENTRIES,
  LOCATION_KIND_IDS,
  midSentenceLabel,
  STRUCTURE_TYPE_ENTRIES,
  STRUCTURE_TYPE_IDS,
  type LocationKind,
  type StructureType,
} from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import {
  LOCATION_AUTHORING_TYPE_IDS,
  UNCLASSIFIED_STRUCTURE_AUTHORING_TYPE,
  UNCLASSIFIED_STRUCTURE_LABEL,
  type LocationAuthoringType,
} from './location-authoring-type'

export const LOCATION_CREATE_TYPE_SEARCH_PARAM = 'type'
export const LOCATION_CREATE_PARENT_SEARCH_PARAM = 'parent'

/** UI preference — promoted overview shortcuts referencing the authoring-type registry. */
export const LOCATION_CREATE_PROMOTED_AUTHORING_TYPES = [
  'building',
  'settlement',
  'site',
  'region',
] as const satisfies readonly LocationAuthoringType[]

/** UI preference — menu ordering for derived child-location shortcuts. */
export const LOCATION_CHILD_AUTHORING_TYPE_MENU_ORDER = [
  ...LOCATION_CREATE_PROMOTED_AUTHORING_TYPES,
  'district',
  'interior',
  'fortification',
  'infrastructure',
  'monument',
  'vessel',
  UNCLASSIFIED_STRUCTURE_AUTHORING_TYPE,
  'plane',
  'world',
] as const satisfies readonly LocationAuthoringType[]

type NonStructureLocationKind = Exclude<LocationKind, 'structure'>

/** Sheet title for contained create — e.g. "Add building", "Add district". */
export function formatLocationAuthoringTypeAddHeading(type: LocationAuthoringType): string {
  return `Add ${midSentenceLabel(getLocationAuthoringTypeLabel(type))}`
}

export function getLocationAuthoringTypeLabel(type: LocationAuthoringType): string {
  if (type === UNCLASSIFIED_STRUCTURE_AUTHORING_TYPE) {
    return UNCLASSIFIED_STRUCTURE_LABEL
  }

  if ((STRUCTURE_TYPE_IDS as readonly string[]).includes(type)) {
    return STRUCTURE_TYPE_ENTRIES[type as StructureType].label
  }

  return LOCATION_KIND_ENTRIES[type as NonStructureLocationKind].label
}

function authoringTypesForChildKind(kind: LocationKind): LocationAuthoringType[] {
  if (kind === 'structure') {
    return [...STRUCTURE_TYPE_IDS, UNCLASSIFIED_STRUCTURE_AUTHORING_TYPE]
  }

  return [kind]
}

function sortAuthoringTypes(types: readonly LocationAuthoringType[]): LocationAuthoringType[] {
  const order = new Map(
    LOCATION_CHILD_AUTHORING_TYPE_MENU_ORDER.map((type, index) => [type, index]),
  )

  return [...types].sort(
    (left, right) =>
      (order.get(left) ?? Number.MAX_SAFE_INTEGER) - (order.get(right) ?? Number.MAX_SAFE_INTEGER),
  )
}

/** Derives child authoring types valid under a parent location kind via contracts hierarchy. */
export function childAuthoringTypesForParentKind(
  parentKind: LocationKind,
): LocationAuthoringType[] {
  const types = new Set<LocationAuthoringType>()

  for (const childKind of LOCATION_KIND_IDS) {
    if (!isValidParentKind(childKind, parentKind)) continue
    for (const authoringType of authoringTypesForChildKind(childKind)) {
      types.add(authoringType)
    }
  }

  return sortAuthoringTypes([...types])
}

export function buildLocationCreateHref(
  campaignId: string,
  prefill?: {
    authoringType?: LocationAuthoringType
    parentLocationId?: string
  },
): string {
  const base = ROUTES.content.locations.create(campaignId)
  const params = new URLSearchParams()

  if (prefill?.authoringType) {
    params.set(LOCATION_CREATE_TYPE_SEARCH_PARAM, prefill.authoringType)
  }
  if (prefill?.parentLocationId) {
    params.set(LOCATION_CREATE_PARENT_SEARCH_PARAM, prefill.parentLocationId)
  }

  const query = params.toString()
  return query ? `${base}?${query}` : base
}

/** Soft-validates create-route search params — unknown values are ignored. */
export function parseLocationCreatePrefill(searchParams: URLSearchParams): {
  authoringType?: LocationAuthoringType
  parentLocationId?: string
} {
  const result: {
    authoringType?: LocationAuthoringType
    parentLocationId?: string
  } = {}

  const typeParam = searchParams.get(LOCATION_CREATE_TYPE_SEARCH_PARAM)
  if (typeParam && (LOCATION_AUTHORING_TYPE_IDS as readonly string[]).includes(typeParam)) {
    result.authoringType = typeParam as LocationAuthoringType
  }

  const parentParam = searchParams.get(LOCATION_CREATE_PARENT_SEARCH_PARAM)
  if (parentParam) {
    result.parentLocationId = parentParam
  }

  return result
}

export function buildLocationCreateInitialValues(
  prefill: ReturnType<typeof parseLocationCreatePrefill>,
  defaults?: { parentLocationId?: string },
): Record<string, unknown> | undefined {
  const parentLocationId = prefill.parentLocationId ?? defaults?.parentLocationId
  const initialValues: Record<string, unknown> = {}

  if (parentLocationId) {
    initialValues.parentLocationId = parentLocationId
  }
  if (prefill.authoringType) {
    initialValues.authoringType = prefill.authoringType
  }

  return Object.keys(initialValues).length > 0 ? initialValues : undefined
}
