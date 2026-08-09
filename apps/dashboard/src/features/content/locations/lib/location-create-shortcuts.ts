import {
  getSiteTypeLabel,
  isValidParentKind,
  LOCATION_KIND_ENTRIES,
  LOCATION_KIND_IDS,
  midSentenceLabel,
  SETTLEMENT_TYPE_IDS,
  SITE_TYPE_IDS,
  getSettlementTypeLabel,
  getRegionTypeLabelForKind,
  STRUCTURE_TYPE_ENTRIES,
  STRUCTURE_TYPE_IDS,
  isRegionClassificationKind,
  getRegionTypeIds,
  type LocationKind,
  type RegionClassification,
  type SettlementType,
  type SiteType,
  type StructureType,
} from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import {
  LOCATION_AUTHORING_TYPE_IDS,
  UNCLASSIFIED_STRUCTURE_AUTHORING_TYPE,
  UNCLASSIFIED_STRUCTURE_LABEL,
  requiresLocationCreateSetup,
  type LocationAuthoringType,
} from './location-authoring-type'
import { resolveRegionRelationshipLabel } from './location-contextual-terminology.lib'
import {
  completeLocationCreateSetup,
  fixedCreateFromIntent,
  type LocationCreateIntent,
  type LocationCreateSetupResult,
} from './location-create-session'
import type { LocationFixedCreateContext } from './location-form-ctx'

export const LOCATION_CREATE_TYPE_SEARCH_PARAM = 'type'
export const LOCATION_CREATE_PARENT_SEARCH_PARAM = 'parent'
export const LOCATION_CREATE_SETTLEMENT_TYPE_SEARCH_PARAM = 'settlementType'
export const LOCATION_CREATE_SITE_TYPE_SEARCH_PARAM = 'siteType'
export const LOCATION_CREATE_REGION_CLASSIFICATION_KIND_SEARCH_PARAM = 'regionClassificationKind'
export const LOCATION_CREATE_REGION_TYPE_SEARCH_PARAM = 'regionType'

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

export type LocationCreateSessionParseResult =
  | { kind: 'unrestricted' }
  | { kind: 'needsSetup'; intent: LocationCreateIntent }
  | { kind: 'ready'; fixedCreate: LocationFixedCreateContext }

type NonStructureLocationKind = Exclude<LocationKind, 'structure'>

/** Modal details heading — Create-prefix via existing type label resolvers. */
export function formatLocationFixedCreateHeading(fixedCreate: LocationFixedCreateContext): string {
  if (fixedCreate.authoringType === 'settlement' && fixedCreate.settlementType) {
    return `Create ${midSentenceLabel(getSettlementTypeLabel(fixedCreate.settlementType))}`
  }

  if (fixedCreate.authoringType === 'site' && fixedCreate.siteType) {
    return `Create ${midSentenceLabel(getSiteTypeLabel(fixedCreate.siteType))}`
  }

  if (fixedCreate.authoringType === 'region' && fixedCreate.classification) {
    return `Create ${midSentenceLabel(
      getRegionTypeLabelForKind(fixedCreate.classification.kind, fixedCreate.classification.type),
    )}`
  }

  return `Create ${midSentenceLabel(
    getLocationAuthoringTypeLabel(fixedCreate.authoringType, {
      parentKind: fixedCreate.parentKind,
    }),
  )}`
}

/** Sheet title for contained create — e.g. "Add building", "Add subregion". */
export function formatLocationAuthoringTypeAddHeading(
  type: LocationAuthoringType,
  context: { parentKind?: LocationKind } = {},
): string {
  return `Add ${midSentenceLabel(getLocationAuthoringTypeLabel(type, context))}`
}

export function getLocationAuthoringTypeLabel(
  type: LocationAuthoringType,
  context: { parentKind?: LocationKind } = {},
): string {
  if (type === 'region') {
    return resolveRegionRelationshipLabel(context.parentKind)
  }

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

function parseAuthoringTypeParam(searchParams: URLSearchParams): LocationAuthoringType | undefined {
  const typeParam = searchParams.get(LOCATION_CREATE_TYPE_SEARCH_PARAM)
  if (!typeParam || !(LOCATION_AUTHORING_TYPE_IDS as readonly string[]).includes(typeParam)) {
    return undefined
  }
  return typeParam as LocationAuthoringType
}

function parseSettlementTypeParam(searchParams: URLSearchParams): SettlementType | undefined {
  const settlementTypeParam = searchParams.get(LOCATION_CREATE_SETTLEMENT_TYPE_SEARCH_PARAM)
  if (
    !settlementTypeParam ||
    !(SETTLEMENT_TYPE_IDS as readonly string[]).includes(settlementTypeParam)
  ) {
    return undefined
  }
  return settlementTypeParam as SettlementType
}

function parseSiteTypeParam(searchParams: URLSearchParams): SiteType | undefined {
  const siteTypeParam = searchParams.get(LOCATION_CREATE_SITE_TYPE_SEARCH_PARAM)
  if (!siteTypeParam || !(SITE_TYPE_IDS as readonly string[]).includes(siteTypeParam)) {
    return undefined
  }
  return siteTypeParam as SiteType
}

function parseRegionClassificationParam(
  searchParams: URLSearchParams,
): RegionClassification | undefined {
  const kindParam = searchParams.get(LOCATION_CREATE_REGION_CLASSIFICATION_KIND_SEARCH_PARAM)
  const typeParam = searchParams.get(LOCATION_CREATE_REGION_TYPE_SEARCH_PARAM)
  if (!kindParam || !typeParam || !isRegionClassificationKind(kindParam)) {
    return undefined
  }

  const typeIds = getRegionTypeIds(kindParam)
  if (!(typeIds as readonly string[]).includes(typeParam)) {
    return undefined
  }

  return { kind: kindParam, type: typeParam } as RegionClassification
}

function parseSetupResultFromSearchParams(
  authoringType: LocationAuthoringType,
  searchParams: URLSearchParams,
): LocationCreateSetupResult | undefined {
  if (authoringType === 'settlement') {
    const settlementType = parseSettlementTypeParam(searchParams)
    return settlementType ? { kind: 'settlement', settlementType } : undefined
  }

  if (authoringType === 'site') {
    const siteType = parseSiteTypeParam(searchParams)
    return siteType ? { kind: 'site', siteType } : undefined
  }

  if (authoringType === 'region') {
    const classification = parseRegionClassificationParam(searchParams)
    return classification ? { kind: 'region', classification } : undefined
  }

  return undefined
}

/**
 * Parses create-route search params into an authoritative fixed session, setup gate, or
 * unrestricted create. Uses the same setup rules as `resolveLocationCreateSession`.
 */
export function parseLocationCreateSessionFromSearchParams(
  searchParams: URLSearchParams,
): LocationCreateSessionParseResult {
  const authoringType = parseAuthoringTypeParam(searchParams)
  if (!authoringType) {
    return { kind: 'unrestricted' }
  }

  const intent: LocationCreateIntent = { authoringType }

  if (requiresLocationCreateSetup(authoringType)) {
    const setupResult = parseSetupResultFromSearchParams(authoringType, searchParams)
    if (!setupResult) {
      return { kind: 'needsSetup', intent }
    }

    return {
      kind: 'ready',
      fixedCreate: completeLocationCreateSetup(intent, setupResult),
    }
  }

  return {
    kind: 'ready',
    fixedCreate: fixedCreateFromIntent(intent),
  }
}

/** Soft parent prefill for the create page — editable unless fixed in contained create. */
export function parseLocationCreateSoftParent(searchParams: URLSearchParams): string | undefined {
  const parentParam = searchParams.get(LOCATION_CREATE_PARENT_SEARCH_PARAM)
  return parentParam || undefined
}

export function buildLocationFixedCreateHref(
  campaignId: string,
  fixedCreate: LocationFixedCreateContext,
  softParentLocationId?: string,
): string {
  const base = ROUTES.content.locations.create(campaignId)
  const params = new URLSearchParams()

  params.set(LOCATION_CREATE_TYPE_SEARCH_PARAM, fixedCreate.authoringType)
  if (fixedCreate.settlementType) {
    params.set(LOCATION_CREATE_SETTLEMENT_TYPE_SEARCH_PARAM, fixedCreate.settlementType)
  }
  if (fixedCreate.siteType) {
    params.set(LOCATION_CREATE_SITE_TYPE_SEARCH_PARAM, fixedCreate.siteType)
  }
  if (fixedCreate.classification) {
    params.set(
      LOCATION_CREATE_REGION_CLASSIFICATION_KIND_SEARCH_PARAM,
      fixedCreate.classification.kind,
    )
    params.set(LOCATION_CREATE_REGION_TYPE_SEARCH_PARAM, fixedCreate.classification.type)
  }
  if (softParentLocationId) {
    params.set(LOCATION_CREATE_PARENT_SEARCH_PARAM, softParentLocationId)
  }

  return `${base}?${params.toString()}`
}

export function buildLocationCreateInitialValues(
  prefill: {
    authoringType?: LocationAuthoringType
    parentLocationId?: string
    settlementType?: SettlementType
    siteType?: SiteType
    classification?: RegionClassification
  },
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
  if (prefill.settlementType) {
    initialValues.settlementType = prefill.settlementType
  }
  if (prefill.siteType) {
    initialValues.siteType = prefill.siteType
  }
  if (prefill.classification) {
    initialValues.classification = {
      kind: prefill.classification.kind,
      type: prefill.classification.type,
    }
  }

  return Object.keys(initialValues).length > 0 ? initialValues : undefined
}

export function fixedCreateToInitialValues(
  fixedCreate: LocationFixedCreateContext,
  softParentLocationId?: string,
): Record<string, unknown> | undefined {
  return buildLocationCreateInitialValues({
    authoringType: fixedCreate.authoringType,
    settlementType: fixedCreate.settlementType,
    siteType: fixedCreate.siteType,
    classification: fixedCreate.classification,
    parentLocationId:
      fixedCreate.parent?.kind === 'fixed' ? fixedCreate.parent.locationId : softParentLocationId,
  })
}
