import type { Location } from '@rpg/contracts'

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

/** Whether a child authoring type is typically added as a district under a settlement. Deferred Add-IA menus do not consume this yet. */
export function isDistrictAuthoringTypeForSettlement(authoringType: string): boolean {
  return authoringType === 'district'
}

/** Whether a child authoring type is typically added as a direct place under a settlement. Deferred Add-IA menus do not consume this yet. */
export function isDirectPlaceAuthoringTypeForSettlement(authoringType: string): boolean {
  return authoringType !== 'district'
}
