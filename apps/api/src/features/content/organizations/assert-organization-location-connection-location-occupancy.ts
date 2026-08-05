import type { OrganizationLocationConnectionKind } from '@rpg/contracts'
import {
  organizationLocationConnectionLocationOccupancyViolationMessage,
  organizationLocationConnectionLocationSubjectBlocked,
  type OrganizationLocationConnectionEdgeAtLocation,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'

export function assertOrganizationLocationConnectionLocationOccupancy(input: {
  locationId: string
  kind: OrganizationLocationConnectionKind
  subjectOrganizationId: string
  edgesAtLocation: readonly OrganizationLocationConnectionEdgeAtLocation[]
  excludeConnectionId?: string
}): void {
  if (
    organizationLocationConnectionLocationSubjectBlocked({
      locationId: input.locationId,
      kind: input.kind,
      subjectOrganizationId: input.subjectOrganizationId,
      edgesAtLocation: input.edgesAtLocation,
      excludeConnectionId: input.excludeConnectionId,
    })
  ) {
    const occupant = input.edgesAtLocation.find(
      (edge) =>
        edge.locationId === input.locationId &&
        edge.kind === input.kind &&
        edge.organizationId !== input.subjectOrganizationId &&
        (!input.excludeConnectionId || edge.connectionId !== input.excludeConnectionId),
    )

    throw new HttpError(
      400,
      'validation_error',
      organizationLocationConnectionLocationOccupancyViolationMessage({
        kind: input.kind,
        occupantName: occupant?.subjectName,
      }),
    )
  }
}
