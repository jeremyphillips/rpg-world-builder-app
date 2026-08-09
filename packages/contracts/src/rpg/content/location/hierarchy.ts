import { LOCATION_KIND_IDS, type LocationKind } from '../../vocab/location/kind'

export type LocationParentRequirement = 'required' | 'optional' | 'forbidden'

export type LocationKindDefinition = {
  allowedParents: readonly LocationKind[]
  parentRequirement: LocationParentRequirement
}

/** Single SSOT for location hierarchy rules — allowed parents and parent requirement per kind. */
export const LOCATION_KIND_DEFINITIONS = {
  plane: { allowedParents: [], parentRequirement: 'forbidden' },
  world: { allowedParents: ['plane'], parentRequirement: 'optional' },
  region: { allowedParents: ['world', 'region'], parentRequirement: 'required' },
  settlement: { allowedParents: ['world', 'region'], parentRequirement: 'required' },
  district: { allowedParents: ['settlement'], parentRequirement: 'required' },
  site: {
    allowedParents: ['world', 'region', 'settlement', 'district', 'site'],
    parentRequirement: 'required',
  },
  structure: {
    allowedParents: ['settlement', 'district', 'site', 'structure'],
    parentRequirement: 'required',
  },
  interior: {
    allowedParents: ['structure', 'interior', 'site'],
    parentRequirement: 'required',
  },
} as const satisfies Record<LocationKind, LocationKindDefinition>

/** Returns the parent kinds allowed for a child location kind. */
export function getAllowedParentKinds(kind: LocationKind): readonly LocationKind[] {
  return LOCATION_KIND_DEFINITIONS[kind].allowedParents
}

/** Returns whether a parent kind may contain a child of the given kind. */
export function isValidParentKind(childKind: LocationKind, parentKind: LocationKind): boolean {
  return getAllowedParentKinds(childKind).includes(parentKind)
}

/** Returns whether a parent reference is required, optional, or forbidden for a kind. */
export function getParentRequirement(kind: LocationKind): LocationParentRequirement {
  return LOCATION_KIND_DEFINITIONS[kind].parentRequirement
}

/** Validates parent presence against kind policy. Returns an error message when invalid. */
export function validateLocationParentRequirement(
  kind: LocationKind,
  parentLocationId: string | undefined,
): string | undefined {
  const requirement = getParentRequirement(kind)

  if (requirement === 'forbidden' && parentLocationId !== undefined) {
    return 'This location kind cannot have a parent.'
  }

  if (requirement === 'required' && parentLocationId === undefined) {
    return 'This location kind requires a parent location.'
  }

  return undefined
}

/** Every registered kind has a hierarchy definition. */
export const LOCATION_KINDS_WITH_DEFINITIONS = LOCATION_KIND_IDS
