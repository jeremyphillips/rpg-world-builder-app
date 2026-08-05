import type { Location, LocationConnectionEligibilityInput } from '@rpg/contracts'

/** Maps a persisted location body to the contracts eligibility resolver input. */
export function toLocationConnectionEligibilityInput(
  location: Location,
): LocationConnectionEligibilityInput {
  if (location.kind === 'structure') {
    return { kind: location.kind, structureType: location.structureType }
  }
  return { kind: location.kind }
}
