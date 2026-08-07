import { getBuildingArchetypeLabel } from '../../vocab/location/building-archetype'
import { getInteriorTypeLabel } from '../../vocab/location/interior-type'
import {
  getInteriorSubtypeLabel,
  INTERIOR_TYPE_DEFINITIONS,
  type InteriorClassificationType,
} from '../../vocab/location/interior-type-definitions'
import { getLocationKindLabel } from '../../vocab/location/kind'
import { getPlaneTypeLabel } from '../../vocab/location/plane-type'
import { getRegionTypeLabelForKind } from '../../vocab/location/region-classification-definitions'
import { getSettlementTypeLabel } from '../../vocab/location/settlement-type'
import { getSiteTypeLabel } from '../../vocab/location/site-type'
import { getStructureTypeLabel } from '../../vocab/location/structure-type'
import type { BuildingClassification } from './building-classification'
import type { Location } from './location'

export const LOCATION_DISPLAY_SUMMARY_SEPARATOR = ' · ' as const

export type LocationDisplaySummary = {
  typeLabel: string
  classificationLabel?: string
  specializationLabel?: string
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
  classificationLabel?: string
  specializationLabel?: string
} {
  if (!classification?.archetype) return {}

  const classificationLabel = getBuildingArchetypeLabel(classification.archetype)
  const specializationLabel = classification.specialization?.trim() || undefined

  return { classificationLabel, specializationLabel }
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

function resolveBuildingStructureClassificationLabel(
  location: Extract<Location, { kind: 'structure' }>,
): string | undefined {
  if (location.structureType !== 'building') return undefined
  return resolveBuildingClassificationLabels(location.classification).classificationLabel
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
  structure: resolveBuildingStructureClassificationLabel,
  interior: resolveInteriorClassificationLabel,
}

function resolveClassificationLabel(location: Location): string | undefined {
  const resolve = CLASSIFICATION_LABEL_BY_KIND[location.kind] as
    | ((value: Location) => string | undefined)
    | undefined

  if (!resolve) return undefined
  return resolve(location)
}

function resolveSpecializationLabel(location: Location): string | undefined {
  if (location.kind !== 'structure' || location.structureType !== 'building') return undefined
  return location.classification?.specialization?.trim() || undefined
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

/** Resolves semantic display labels for a location without presentation field names. */
export function resolveLocationDisplaySummary(location: Location): LocationDisplaySummary {
  return {
    typeLabel: resolveTypeLabel(location),
    classificationLabel: resolveClassificationLabel(location),
    specializationLabel: resolveSpecializationLabel(location),
  }
}

/** Resolves the compact classification line shared by tables, search, and pickers. */
export function resolveLocationClassificationDisplay(
  location: Location,
): LocationClassificationDisplay {
  const summary = resolveLocationDisplaySummary(location)
  const parts = [summary.typeLabel, summary.classificationLabel].filter(
    (segment): segment is string => Boolean(segment),
  )

  return {
    parts,
    text: parts.join(LOCATION_DISPLAY_SUMMARY_SEPARATOR),
  }
}

/**
 * Lexicographic compare of classification parts for table sorting.
 * Missing indices at a position are treated as empty strings, so equal-prefix
 * classifications sort shorter-first (for example `Building` before `Building · Guildhall`).
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
      return location.structureType === 'building' ? 'Archetype' : undefined
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
