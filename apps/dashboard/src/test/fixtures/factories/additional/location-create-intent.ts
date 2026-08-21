import type { LocationKind } from '@rpg/contracts'

import type { LocationAuthoringType } from '@/features/content/locations/lib/location-authoring-type'
import type { LocationCreateIntent } from '@/features/content/locations/lib/create/session/location-create-session'

export type LocationCreateIntentOverrides = Partial<LocationCreateIntent> & {
  authoringType: LocationAuthoringType
}

/** Synthetic location create-flow intent for modal and session tests. */
export function makeLocationCreateIntent(
  overrides: LocationCreateIntentOverrides,
): LocationCreateIntent {
  return {
    parentLocationId: overrides.parentLocationId,
    parentKind: overrides.parentKind,
    ...overrides,
  }
}

/** Building create intent anchored to a parent location. */
export function makeBuildingLocationCreateIntent(input: {
  parentLocationId: string
  parentKind: LocationKind
}): LocationCreateIntent {
  return makeLocationCreateIntent({
    authoringType: 'building',
    parentLocationId: input.parentLocationId,
    parentKind: input.parentKind,
  })
}

/** Settlement create intent anchored to a parent location. */
export function makeSettlementLocationCreateIntent(input: {
  parentLocationId: string
  parentKind: LocationKind
}): LocationCreateIntent {
  return makeLocationCreateIntent({
    authoringType: 'settlement',
    parentLocationId: input.parentLocationId,
    parentKind: input.parentKind,
  })
}

/** Region create intent anchored to a parent location. */
export function makeRegionLocationCreateIntent(input: {
  parentLocationId: string
  parentKind: LocationKind
}): LocationCreateIntent {
  return makeLocationCreateIntent({
    authoringType: 'region',
    parentLocationId: input.parentLocationId,
    parentKind: input.parentKind,
  })
}
