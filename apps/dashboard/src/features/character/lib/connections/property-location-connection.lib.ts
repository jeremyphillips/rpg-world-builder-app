import {
  resolveLocationConnectionEligibility,
  type Location,
  type LocationConnectionEligibilityInput,
} from '@rpg/contracts'

const PROPERTY_CONNECTION_KINDS = new Set(['owns', 'tenant', 'operator', 'works_at'])

function toLocationConnectionEligibilityInput(
  location: Location,
): LocationConnectionEligibilityInput {
  if (location.kind === 'structure') {
    return { kind: location.kind, structureType: location.structureType }
  }
  return { kind: location.kind }
}

export function isPropertyEligibleLocation(location: Location): boolean {
  const eligibility = resolveLocationConnectionEligibility(
    toLocationConnectionEligibilityInput(location),
  )
  return eligibility.characterKinds.some((kind) => PROPERTY_CONNECTION_KINDS.has(kind))
}

export function filterPropertyEligibleLocations(locations: readonly Location[]): Location[] {
  return locations.filter(isPropertyEligibleLocation)
}
