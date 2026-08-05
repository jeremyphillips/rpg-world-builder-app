import {
  getOrganizationLocationConnectionMaxSubjectsPerLocation,
  getOrganizationLocationConnectionLabel,
  type OrganizationLocationConnectionKind,
} from '../../vocab/location/organization-location-connection'

export type OrganizationLocationConnectionEdgeAtLocation = {
  organizationId: string
  connectionId: string
  locationId: string
  kind: OrganizationLocationConnectionKind
  subjectName?: string
}

/** User-facing message when a location subject slot is occupied by another organization. */
export function organizationLocationConnectionLocationOccupancyViolationMessage(input: {
  kind: OrganizationLocationConnectionKind
  occupantName?: string
}): string {
  const kindLabel = getOrganizationLocationConnectionLabel(input.kind).toLowerCase()
  if (input.occupantName) {
    return `${input.occupantName} already ${kindLabel} this location.`
  }
  return `Another organization already ${kindLabel} this location.`
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

/** Whether another organization already occupies a singleton kind slot at this location. */
export function organizationLocationConnectionLocationSubjectBlocked(input: {
  locationId: string
  kind: OrganizationLocationConnectionKind
  subjectOrganizationId: string
  edgesAtLocation: readonly OrganizationLocationConnectionEdgeAtLocation[]
  excludeConnectionId?: string
}): boolean {
  const maxSubjects = getOrganizationLocationConnectionMaxSubjectsPerLocation(input.kind)
  if (maxSubjects === null) {
    return false
  }

  const occupyingEdges = edgesForLocationAndKind(
    input.edgesAtLocation,
    input.locationId,
    input.kind,
    input.excludeConnectionId,
  )

  if (maxSubjects === 1) {
    return occupyingEdges.some((edge) => edge.organizationId !== input.subjectOrganizationId)
  }

  const distinctOrganizations = new Set(occupyingEdges.map((edge) => edge.organizationId))
  if (distinctOrganizations.has(input.subjectOrganizationId)) {
    distinctOrganizations.delete(input.subjectOrganizationId)
  }
  return distinctOrganizations.size >= maxSubjects
}

/** Returns the occupying edge when a singleton slot is taken, if any. */
export function resolveOrganizationLocationConnectionLocationOccupant(input: {
  locationId: string
  kind: OrganizationLocationConnectionKind
  edgesAtLocation: readonly OrganizationLocationConnectionEdgeAtLocation[]
  excludeConnectionId?: string
}): OrganizationLocationConnectionEdgeAtLocation | undefined {
  const maxSubjects = getOrganizationLocationConnectionMaxSubjectsPerLocation(input.kind)
  if (maxSubjects !== 1) {
    return undefined
  }

  return edgesForLocationAndKind(
    input.edgesAtLocation,
    input.locationId,
    input.kind,
    input.excludeConnectionId,
  )[0]
}
