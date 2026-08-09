import type { Location } from '@rpg/contracts'

import type { LocationAuthoringType } from './location-authoring-type'

/** Child locations that organize a settlement into neighborhoods or wards. */
export function isSettlementDistrictChild(location: Location): boolean {
  return location.kind === 'district'
}

/** Child locations placed directly under a settlement rather than within a district. */
export function isSettlementDirectPlaceChild(location: Location): boolean {
  return location.kind !== 'district'
}

export function partitionSettlementChildLocations(locations: readonly Location[]): {
  districts: Location[]
  directPlaces: Location[]
} {
  const districts: Location[] = []
  const directPlaces: Location[] = []

  for (const location of locations) {
    if (isSettlementDistrictChild(location)) {
      districts.push(location)
    } else {
      directPlaces.push(location)
    }
  }

  districts.sort((left, right) => left.name.localeCompare(right.name))
  directPlaces.sort((left, right) => left.name.localeCompare(right.name))

  return { districts, directPlaces }
}

/** Whether a child authoring type is the District structural subdivision under a settlement. */
export function isDistrictAuthoringTypeForSettlement(authoringType: string): boolean {
  return authoringType === 'district'
}

/**
 * Whether a child authoring type is a direct place under a settlement (non-District).
 * Matches {@link isSettlementDirectPlaceChild} for persisted children: District is the only
 * structural subdivision type; every other eligible child kind is a direct location.
 */
export function isDirectPlaceAuthoringTypeForSettlement(authoringType: string): boolean {
  return authoringType !== 'district'
}

/**
 * Projects canonical settlement child-authoring eligibility into City structure UI buckets.
 * Callers pass one `childAuthoringTypesForParentKind` result — do not re-evaluate hierarchy here.
 */
export function resolveSettlementStructureChildAuthoringOptions(
  eligibleTypes: readonly LocationAuthoringType[],
): {
  district?: 'district'
  direct: LocationAuthoringType[]
} {
  return {
    district: eligibleTypes.some(isDistrictAuthoringTypeForSettlement) ? 'district' : undefined,
    direct: eligibleTypes.filter(isDirectPlaceAuthoringTypeForSettlement),
  }
}
