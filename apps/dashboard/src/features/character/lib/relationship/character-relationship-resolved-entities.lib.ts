import type {
  Location,
  Organization,
  OrganizationReferenceResolution,
  CharacterLocationReferenceResolution,
} from '@rpg/contracts'

/** Catalog orgs plus nested membership resolutions, so read-only sheets keep names. */
export function mergeOrganizationsById(
  catalogOrganizations: readonly Organization[],
  memberships: readonly OrganizationReferenceResolution[],
): Map<string, Organization> {
  const byId = new Map<string, Organization>()
  for (const organization of catalogOrganizations) {
    byId.set(organization.id, organization)
  }
  for (const membership of memberships) {
    if (membership.organization) {
      byId.set(membership.organizationId, membership.organization as Organization)
    }
  }
  return byId
}

/** Catalog locations plus nested residence resolutions, so read-only sheets keep names. */
export function mergeLocationsById(
  catalogLocations: readonly Location[],
  residences: readonly CharacterLocationReferenceResolution[],
): Map<string, Location> {
  const byId = new Map<string, Location>()
  for (const location of catalogLocations) {
    byId.set(location.id, location)
  }
  for (const residence of residences) {
    if (residence.location && !byId.has(residence.connection.locationId)) {
      byId.set(residence.connection.locationId, residence.location as Location)
    }
  }
  return byId
}

/** Playable ids when editing; resolved membership ids when viewing. */
export function resolveAvailableOrganizationIdSet(input: {
  canEdit: boolean
  playableOrganizationIds: readonly string[]
  memberships: readonly OrganizationReferenceResolution[]
}): Set<string> {
  if (input.canEdit) {
    return new Set(input.playableOrganizationIds)
  }
  return new Set(
    input.memberships
      .filter((membership) => membership.organization)
      .map((membership) => membership.organizationId),
  )
}

/** Eligible picker ids when editing; resolved residence ids when viewing. */
export function resolveAvailableResidenceIdSet(input: {
  canEdit: boolean
  eligibleLocationIds: readonly string[]
  residences: readonly CharacterLocationReferenceResolution[]
}): Set<string> {
  if (input.canEdit) {
    return new Set(input.eligibleLocationIds)
  }
  return new Set(
    input.residences
      .filter((residence) => residence.location)
      .map((residence) => residence.connection.locationId),
  )
}
