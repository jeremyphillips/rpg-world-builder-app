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
  type BuildingFacilityAuthoringGroup,
  type BuildingForm,
  type LocationKind,
  type RegionClassification,
  type SettlementType,
  type SiteType,
  type StructureType,
} from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import {
  buildBuildingClassificationFromCreateSetup,
  isBuildingFacilityAuthoringGroup,
  isBuildingForm,
} from './setup/location-building-create-setup.lib'
import {
  isDeferredLocationAuthoringType,
  LOCATION_AUTHORING_TYPE_IDS,
  UNCLASSIFIED_STRUCTURE_AUTHORING_TYPE,
  UNCLASSIFIED_STRUCTURE_LABEL,
  type LocationAuthoringType,
} from '../location-authoring-type'
import { resolveRegionRelationshipLabel } from '../location-contextual-terminology.lib'
import type { LocationCreateSetupResult } from './session/location-create-session'
import type { LocationFixedCreateContext } from '../forms/location-form-ctx'

export const LOCATION_CREATE_TYPE_SEARCH_PARAM = 'type'
export const LOCATION_CREATE_PARENT_SEARCH_PARAM = 'parent'
export const LOCATION_CREATE_SETTLEMENT_TYPE_SEARCH_PARAM = 'settlementType'
export const LOCATION_CREATE_SITE_TYPE_SEARCH_PARAM = 'siteType'
export const LOCATION_CREATE_REGION_CLASSIFICATION_KIND_SEARCH_PARAM = 'regionClassificationKind'
export const LOCATION_CREATE_REGION_TYPE_SEARCH_PARAM = 'regionType'
export const LOCATION_CREATE_BUILDING_FORM_SEARCH_PARAM = 'buildingForm'
export const LOCATION_CREATE_FACILITY_GROUP_SEARCH_PARAM = 'facilityGroup'

/** UI preference — menu ordering for derived child-location shortcuts. */
export const LOCATION_CHILD_AUTHORING_TYPE_MENU_ORDER = [
  'building',
  'settlement',
  'site',
  'region',
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

export type LocationCreatePrefill = {
  authoringType?: LocationAuthoringType
  parentLocationId?: string
  settlementType?: SettlementType
  siteType?: SiteType
  classification?: RegionClassification
  buildingForm?: BuildingForm
  facilityGroup?: BuildingFacilityAuthoringGroup
}

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

  return sortAuthoringTypes([...types]).filter((type) => !isDeferredLocationAuthoringType(type))
}

function parseAuthoringTypeParam(searchParams: URLSearchParams): LocationAuthoringType | undefined {
  const typeParam = searchParams.get(LOCATION_CREATE_TYPE_SEARCH_PARAM)
  if (!typeParam || !(LOCATION_AUTHORING_TYPE_IDS as readonly string[]).includes(typeParam)) {
    return undefined
  }
  const authoringType = typeParam as LocationAuthoringType
  if (isDeferredLocationAuthoringType(authoringType)) {
    return undefined
  }
  return authoringType
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

function parseBuildingFormParam(searchParams: URLSearchParams): BuildingForm | undefined {
  const value = searchParams.get(LOCATION_CREATE_BUILDING_FORM_SEARCH_PARAM)
  return value && isBuildingForm(value) ? value : undefined
}

function parseFacilityGroupParam(
  searchParams: URLSearchParams,
): BuildingFacilityAuthoringGroup | undefined {
  const value = searchParams.get(LOCATION_CREATE_FACILITY_GROUP_SEARCH_PARAM)
  return value && isBuildingFacilityAuthoringGroup(value) ? value : undefined
}

/** Parses editable create-page prefill from URL search params (no setup gate). */
export function parseLocationCreatePrefillFromSearchParams(
  searchParams: URLSearchParams,
): LocationCreatePrefill {
  const authoringType = parseAuthoringTypeParam(searchParams)
  const parentLocationId = parseLocationCreateSoftParent(searchParams)
  const prefill: LocationCreatePrefill = {}

  if (authoringType) prefill.authoringType = authoringType
  if (parentLocationId) prefill.parentLocationId = parentLocationId

  const settlementType = parseSettlementTypeParam(searchParams)
  if (settlementType) prefill.settlementType = settlementType

  const siteType = parseSiteTypeParam(searchParams)
  if (siteType) prefill.siteType = siteType

  const classification = parseRegionClassificationParam(searchParams)
  if (classification) prefill.classification = classification

  const buildingForm = parseBuildingFormParam(searchParams)
  if (buildingForm) prefill.buildingForm = buildingForm

  const facilityGroup = parseFacilityGroupParam(searchParams)
  if (facilityGroup) prefill.facilityGroup = facilityGroup

  return prefill
}

/** Soft parent prefill for the create page — editable unless fixed in contained create. */
export function parseLocationCreateSoftParent(searchParams: URLSearchParams): string | undefined {
  const parentParam = searchParams.get(LOCATION_CREATE_PARENT_SEARCH_PARAM)
  return parentParam || undefined
}

export function buildLocationCreatePrefillHref(
  campaignId: string,
  prefill: LocationCreatePrefill,
  softParentLocationId?: string,
): string {
  const base = ROUTES.content.locations.create(campaignId)
  const params = new URLSearchParams()

  if (prefill.authoringType) {
    params.set(LOCATION_CREATE_TYPE_SEARCH_PARAM, prefill.authoringType)
  }
  if (prefill.settlementType) {
    params.set(LOCATION_CREATE_SETTLEMENT_TYPE_SEARCH_PARAM, prefill.settlementType)
  }
  if (prefill.siteType) {
    params.set(LOCATION_CREATE_SITE_TYPE_SEARCH_PARAM, prefill.siteType)
  }
  if (prefill.classification) {
    params.set(LOCATION_CREATE_REGION_CLASSIFICATION_KIND_SEARCH_PARAM, prefill.classification.kind)
    params.set(LOCATION_CREATE_REGION_TYPE_SEARCH_PARAM, prefill.classification.type)
  }
  if (prefill.buildingForm) {
    params.set(LOCATION_CREATE_BUILDING_FORM_SEARCH_PARAM, prefill.buildingForm)
  }
  if (prefill.facilityGroup) {
    params.set(LOCATION_CREATE_FACILITY_GROUP_SEARCH_PARAM, prefill.facilityGroup)
  }

  const parentLocationId = prefill.parentLocationId ?? softParentLocationId
  if (parentLocationId) {
    params.set(LOCATION_CREATE_PARENT_SEARCH_PARAM, parentLocationId)
  }

  const query = params.toString()
  return query ? `${base}?${query}` : base
}

export function buildLocationFixedCreateHref(
  campaignId: string,
  fixedCreate: LocationFixedCreateContext,
  softParentLocationId?: string,
): string {
  return buildLocationCreatePrefillHref(
    campaignId,
    {
      authoringType: fixedCreate.authoringType,
      settlementType: fixedCreate.settlementType,
      siteType: fixedCreate.siteType,
      classification: fixedCreate.classification,
      parentLocationId:
        fixedCreate.parent?.kind === 'fixed' ? fixedCreate.parent.locationId : softParentLocationId,
    },
    softParentLocationId,
  )
}

export function buildLocationCreateHandoffHref(
  campaignId: string,
  fixedCreate: LocationFixedCreateContext,
  setupResult: LocationCreateSetupResult,
  softParentLocationId?: string,
): string {
  const prefill: LocationCreatePrefill = {
    authoringType: fixedCreate.authoringType,
    settlementType: fixedCreate.settlementType,
    siteType: fixedCreate.siteType,
    classification: fixedCreate.classification,
    parentLocationId:
      fixedCreate.parent?.kind === 'fixed' ? fixedCreate.parent.locationId : softParentLocationId,
  }

  if (setupResult.kind === 'building') {
    if (setupResult.form) prefill.buildingForm = setupResult.form
    if (setupResult.facilityAuthoringGroup) {
      prefill.facilityGroup = setupResult.facilityAuthoringGroup
    }
  }

  return buildLocationCreatePrefillHref(campaignId, prefill, softParentLocationId)
}

function buildingSetupProjectionFromPrefill(prefill: LocationCreatePrefill) {
  if (!prefill.buildingForm && !prefill.facilityGroup) return undefined
  return buildBuildingClassificationFromCreateSetup({
    ...(prefill.buildingForm ? { form: prefill.buildingForm } : {}),
    ...(prefill.facilityGroup ? { facilityAuthoringGroup: prefill.facilityGroup } : {}),
  })
}

export function buildLocationCreateInitialValues(
  prefill: LocationCreatePrefill,
  defaults?: { parentLocationId?: string },
): Record<string, unknown> | undefined {
  const parentLocationId = prefill.parentLocationId ?? defaults?.parentLocationId
  const initialValues: Record<string, unknown> = {}

  if (parentLocationId) initialValues.parentLocationId = parentLocationId
  if (prefill.authoringType) initialValues.authoringType = prefill.authoringType
  if (prefill.settlementType) initialValues.settlementType = prefill.settlementType
  if (prefill.siteType) initialValues.siteType = prefill.siteType
  if (prefill.classification) {
    initialValues.classification = {
      kind: prefill.classification.kind,
      type: prefill.classification.type,
    }
  }

  const buildingClassification = buildingSetupProjectionFromPrefill(prefill)
  if (buildingClassification) initialValues.classification = buildingClassification

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
