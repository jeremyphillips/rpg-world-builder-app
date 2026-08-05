import {
  getOrganizationLocationConnectionFamily,
  getOrganizationLocationConnectionMaxSubjectsPerLocation,
  ORGANIZATION_LOCATION_CONNECTION_FAMILY_CARDINALITY,
  type OrganizationLocationConnectionFamily,
  type OrganizationLocationConnectionFamilyCardinality,
  type OrganizationLocationConnectionKind,
} from '../../vocab/location/organization-location-connection'

import {
  organizationLocationConnectionLocationSubjectBlocked,
  type OrganizationLocationConnectionEdgeAtLocation,
} from './organization-location-connection-location-occupancy'

export type OrganizationLocationConnectionLike = {
  id?: string
  locationId: string
  kind: OrganizationLocationConnectionKind
}

export type { OrganizationLocationConnectionEdgeAtLocation }

/** Returns the cardinality rule for a connection family, when one applies per-org. */
export function getOrganizationLocationConnectionFamilyCardinality(
  family: OrganizationLocationConnectionFamily,
): OrganizationLocationConnectionFamilyCardinality | undefined {
  return ORGANIZATION_LOCATION_CONNECTION_FAMILY_CARDINALITY[
    family as keyof typeof ORGANIZATION_LOCATION_CONNECTION_FAMILY_CARDINALITY
  ]
}

/** User-facing validation message when a one-per-family rule is violated. */
export function organizationLocationConnectionFamilyViolationMessage(
  family: OrganizationLocationConnectionFamily,
): string {
  switch (family) {
    case 'geographic_presence':
      return 'Each location may have at most one geographic presence connection.'
    default:
      return 'Each location may have at most one connection of this type family.'
  }
}

function connectionsForLocation(
  connections: readonly OrganizationLocationConnectionLike[],
  locationId: string,
  excludeConnectionId?: string,
): OrganizationLocationConnectionLike[] {
  return connections.filter(
    (connection) =>
      connection.locationId === locationId &&
      (!excludeConnectionId || connection.id !== excludeConnectionId),
  )
}

/** Whether a kind is blocked for one organization at a location (per-org connections only). */
export function organizationLocationConnectionKindBlockedForOrganizationAtLocation(input: {
  locationId: string
  kind: OrganizationLocationConnectionKind
  connections: readonly OrganizationLocationConnectionLike[]
  excludeConnectionId?: string
}): boolean {
  const { locationId, kind, connections, excludeConnectionId } = input
  const family = getOrganizationLocationConnectionFamily(kind)
  const cardinality = getOrganizationLocationConnectionFamilyCardinality(family)
  const existing = connectionsForLocation(connections, locationId, excludeConnectionId)

  if (
    cardinality === 'one_per_kind' ||
    getOrganizationLocationConnectionMaxSubjectsPerLocation(kind) !== null
  ) {
    return existing.some((connection) => connection.kind === kind)
  }

  if (cardinality === 'one_per_family') {
    return existing.some(
      (connection) => getOrganizationLocationConnectionFamily(connection.kind) === family,
    )
  }

  return false
}

/** Whether a kind is blocked for a subject at a location (per-org + cross-org occupancy). */
export function organizationLocationConnectionKindBlockedForLocation(input: {
  locationId: string
  kind: OrganizationLocationConnectionKind
  subjectOrganizationId: string
  connections: readonly OrganizationLocationConnectionLike[]
  edgesAtLocation?: readonly OrganizationLocationConnectionEdgeAtLocation[]
  excludeConnectionId?: string
}): boolean {
  if (
    organizationLocationConnectionKindBlockedForOrganizationAtLocation({
      locationId: input.locationId,
      kind: input.kind,
      connections: input.connections,
      excludeConnectionId: input.excludeConnectionId,
    })
  ) {
    return true
  }

  if (!input.edgesAtLocation) {
    return false
  }

  return organizationLocationConnectionLocationSubjectBlocked({
    locationId: input.locationId,
    kind: input.kind,
    subjectOrganizationId: input.subjectOrganizationId,
    edgesAtLocation: input.edgesAtLocation,
    excludeConnectionId: input.excludeConnectionId,
  })
}

/** Whether any eligible kind remains available for a subject at a location. */
export function organizationLocationConnectionHasAvailableKindInFamily(input: {
  locationId: string
  kinds: readonly OrganizationLocationConnectionKind[]
  subjectOrganizationId: string
  connections: readonly OrganizationLocationConnectionLike[]
  edgesAtLocation?: readonly OrganizationLocationConnectionEdgeAtLocation[]
  excludeConnectionId?: string
}): boolean {
  return input.kinds.some(
    (kind) =>
      !organizationLocationConnectionKindBlockedForLocation({
        locationId: input.locationId,
        kind,
        subjectOrganizationId: input.subjectOrganizationId,
        connections: input.connections,
        edgesAtLocation: input.edgesAtLocation,
        excludeConnectionId: input.excludeConnectionId,
      }),
  )
}

/** Whether a singleton kind slot at a location is occupied by any organization. */
export function organizationLocationConnectionKindSlotOccupiedAtLocation(input: {
  locationId: string
  kind: OrganizationLocationConnectionKind
  edgesAtLocation: readonly OrganizationLocationConnectionEdgeAtLocation[]
  excludeConnectionId?: string
}): boolean {
  const maxSubjects = getOrganizationLocationConnectionMaxSubjectsPerLocation(input.kind)
  if (maxSubjects !== 1) {
    return false
  }

  return (
    edgesForLocationAndKind(
      input.edgesAtLocation,
      input.locationId,
      input.kind,
      input.excludeConnectionId,
    ).length > 0
  )
}

function edgesForLocationAndKind(
  edgesAtLocation: readonly OrganizationLocationConnectionEdgeAtLocation[],
  locationId: string,
  kind: OrganizationLocationConnectionKind,
  excludeConnectionId?: string,
): OrganizationLocationConnectionEdgeAtLocation[] {
  return edgesAtLocation.filter(
    (edge) =>
      edge.locationId === locationId &&
      edge.kind === kind &&
      (!excludeConnectionId || edge.connectionId !== excludeConnectionId),
  )
}
