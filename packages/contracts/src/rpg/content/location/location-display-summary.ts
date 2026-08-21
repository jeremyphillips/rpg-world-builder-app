import { getBuildingFacilityTypeLabel } from '../../vocab/location/building/building-facility-type'
import { getBuildingFormLabel } from '../../vocab/location/building/building-form'
import { getInteriorTypeLabel } from '../../vocab/location/building/interior-type'
import {
  getInteriorSubtypeLabel,
  INTERIOR_TYPE_DEFINITIONS,
  type InteriorClassificationType,
} from '../../vocab/location/building/interior-type-definitions'
import { getLocationKindLabel } from '../../vocab/location/region/kind'
import { getPlaneTypeLabel } from '../../vocab/location/region/plane-type'
import { getRegionTypeLabelForKind } from '../../vocab/location/region/region-classification-definitions'
import { getSettlementTypeLabel } from '../../vocab/location/region/settlement-type'
import { getSiteTypeLabel } from '../../vocab/location/region/site-type'
import { getStructureTypeLabel } from '../../vocab/location/building/structure-type'
import type { BuildingClassification } from './building-classification'
import type { Location } from './location'

export const LOCATION_DISPLAY_SUMMARY_SEPARATOR = ' · ' as const

export type LocationDisplaySummary = {
  typeLabel: string
  classificationLabel?: string
  buildingFormLabel?: string
  buildingFacilityTypeLabel?: string
}

export type LocationClassificationDisplay = {
  parts: readonly string[]
  text: string
}

function resolveStructureTypeLabel(structureType: string | undefined): string {
  if (!structureType) return getLocationKindLabel('structure')
  return getStructureTypeLabel(structureType)
}

function resolveBuildingClassificationLabels(classification: BuildingClassification | undefined): {
  buildingFormLabel?: string
  buildingFacilityTypeLabel?: string
} {
  if (!classification) return {}
  return {
    buildingFormLabel: classification.form ? getBuildingFormLabel(classification.form) : undefined,
    buildingFacilityTypeLabel: classification.facilityType
      ? getBuildingFacilityTypeLabel(classification.facilityType)
      : undefined,
  }
}

function resolvePlaneClassificationLabel(
  location: Extract<Location, { kind: 'plane' }>,
): string | undefined {
  return location.planeType ? getPlaneTypeLabel(location.planeType) : undefined
}

function resolveRegionClassificationLabel(
  location: Extract<Location, { kind: 'region' }>,
): string | undefined {
  if (!location.classification) return undefined
  return getRegionTypeLabelForKind(location.classification.kind, location.classification.type)
}

function resolveSettlementClassificationLabel(
  location: Extract<Location, { kind: 'settlement' }>,
): string | undefined {
  return location.settlementType ? getSettlementTypeLabel(location.settlementType) : undefined
}

function resolveSiteClassificationLabel(
  location: Extract<Location, { kind: 'site' }>,
): string | undefined {
  return location.siteType ? getSiteTypeLabel(location.siteType) : undefined
}

function resolveInteriorClassificationLabel(
  location: Extract<Location, { kind: 'interior' }>,
): string | undefined {
  if (!location.interiorType || !location.classification?.type) return undefined
  return getInteriorSubtypeLabel(
    location.interiorType as InteriorClassificationType,
    location.classification.type,
  )
}

const CLASSIFICATION_LABEL_BY_KIND: Partial<{
  [Kind in Location['kind']]: (location: Extract<Location, { kind: Kind }>) => string | undefined
}> = {
  plane: resolvePlaneClassificationLabel,
  region: resolveRegionClassificationLabel,
  settlement: resolveSettlementClassificationLabel,
  site: resolveSiteClassificationLabel,
  interior: resolveInteriorClassificationLabel,
}

function resolveClassificationLabel(location: Location): string | undefined {
  const resolve = CLASSIFICATION_LABEL_BY_KIND[location.kind] as
    | ((value: Location) => string | undefined)
    | undefined

  if (!resolve) return undefined
  return resolve(location)
}

function resolveBuildingLabels(location: Location): {
  buildingFormLabel?: string
  buildingFacilityTypeLabel?: string
} {
  if (location.kind !== 'structure' || location.structureType !== 'building') return {}
  return resolveBuildingClassificationLabels(location.classification)
}

function resolveTypeLabel(location: Location): string {
  if (location.kind === 'structure') {
    return resolveStructureTypeLabel(location.structureType)
  }

  if (location.kind === 'interior') {
    return location.interiorType
      ? getInteriorTypeLabel(location.interiorType)
      : getLocationKindLabel('interior')
  }

  return getLocationKindLabel(location.kind)
}

/** Lowercase prose noun for inverse relationship copy — same type tier as compact classification. */
export function resolveLocationReferenceNoun(location: Location): string {
  return resolveTypeLabel(location).toLowerCase()
}

/**
 * Noun for Structure panel headings (`${noun} structure`).
 * Reuses the same type/classification resolution as {@link resolveLocationDisplaySummary}:
 * settlement and site prefer their primary subtype label; other kinds use typeLabel
 * (kind label, or structure/interior subtype already on typeLabel).
 */
export function resolveLocationStructureHeadingNoun(location: Location): string {
  const summary = resolveLocationDisplaySummary(location)

  if (location.kind === 'settlement' || location.kind === 'site') {
    return summary.classificationLabel ?? summary.typeLabel
  }

  return summary.typeLabel
}

/** Resolves semantic display labels for a location without presentation field names. */
export function resolveLocationDisplaySummary(location: Location): LocationDisplaySummary {
  return {
    typeLabel: resolveTypeLabel(location),
    classificationLabel: resolveClassificationLabel(location),
    ...resolveBuildingLabels(location),
  }
}

/** Resolves the compact classification line shared by tables, search, and pickers. */
export function resolveLocationClassificationDisplay(
  location: Location,
): LocationClassificationDisplay {
  const summary = resolveLocationDisplaySummary(location)
  const parts = [
    summary.typeLabel,
    summary.buildingFormLabel,
    summary.buildingFacilityTypeLabel,
    summary.classificationLabel,
  ].filter((segment): segment is string => Boolean(segment))

  return {
    parts,
    text: parts.join(LOCATION_DISPLAY_SUMMARY_SEPARATOR),
  }
}

/**
 * Lexicographic compare of classification parts for table sorting.
 * Missing indices at a position are treated as empty strings, so equal-prefix
 * classifications sort shorter-first (for example `Building` before `Building · House`).
 */
export function compareLocationClassificationParts(
  left: readonly string[],
  right: readonly string[],
): number {
  const maxLength = Math.max(left.length, right.length)

  for (let index = 0; index < maxLength; index += 1) {
    const comparison = (left[index] ?? '').localeCompare(right[index] ?? '')
    if (comparison !== 0) return comparison
  }

  return 0
}

/** Detail/read row label for the location classification field, when present. */
export function resolveLocationDetailClassificationFieldLabel(
  location: Location,
): string | undefined {
  switch (location.kind) {
    case 'structure':
      return undefined
    case 'settlement':
    case 'region':
      return 'Classification'
    case 'site':
      return 'Site type'
    case 'plane':
      return 'Plane type'
    case 'interior': {
      const interiorType = location.interiorType
      if (interiorType && interiorType in INTERIOR_TYPE_DEFINITIONS) {
        return `${INTERIOR_TYPE_DEFINITIONS[interiorType as InteriorClassificationType].label} type`
      }
      return 'Interior type'
    }
    default:
      return undefined
  }
}
