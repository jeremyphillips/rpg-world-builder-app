import {
  resolveLocationClassificationDisplay,
  resolveLocationConnectionEligibility,
  type CharacterLocationConnection,
  type Location,
  type LocationConnectionEligibilityInput,
} from '@rpg/contracts'

function toLocationConnectionEligibilityInput(
  location: Location,
): LocationConnectionEligibilityInput {
  if (location.kind === 'structure') {
    return { kind: location.kind, structureType: location.structureType }
  }
  return { kind: location.kind }
}

export const RESIDENCE_CONNECTION_KIND = 'resides_at' as const

export function isResidenceEligibleLocation(location: Location): boolean {
  return resolveLocationConnectionEligibility(
    toLocationConnectionEligibilityInput(location),
  ).characterKinds.includes(RESIDENCE_CONNECTION_KIND)
}

export function filterResidenceEligibleLocations(locations: readonly Location[]): Location[] {
  return locations.filter(isResidenceEligibleLocation)
}

export function getResidenceConnections(
  connections: readonly CharacterLocationConnection[],
): CharacterLocationConnection[] {
  return connections.filter((connection) => connection.kind === RESIDENCE_CONNECTION_KIND)
}

export function createResidenceLocationConnection(locationId: string): CharacterLocationConnection {
  return {
    id: crypto.randomUUID(),
    locationId,
    kind: RESIDENCE_CONNECTION_KIND,
  }
}

export function getResidenceLocationSearchText(location: Location): string {
  const classification = resolveLocationClassificationDisplay(location)
  return `${location.name} ${classification.text}`.trim()
}
