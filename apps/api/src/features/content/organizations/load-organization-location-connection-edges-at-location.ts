import type {
  OrganizationLocationConnection,
  OrganizationLocationConnectionEdgeAtLocation,
} from '@rpg/contracts'

import { HomebrewOrganizationModel } from './homebrew-organization.model'

type OrganizationLocationConnectionHit = {
  _id: unknown
  connections?: {
    locations?: OrganizationLocationConnection[]
  }
}

/** Loads all organization location connection edges referencing a location in a campaign. */
export async function loadOrganizationLocationConnectionEdgesAtLocation(
  campaignId: string,
  locationId: string,
): Promise<OrganizationLocationConnectionEdgeAtLocation[]> {
  const hits = await HomebrewOrganizationModel.find({
    campaignId,
    'connections.locations.locationId': locationId,
  })
    .select({ connections: 1 })
    .lean<OrganizationLocationConnectionHit[]>()

  const edges: OrganizationLocationConnectionEdgeAtLocation[] = []

  for (const hit of hits) {
    const organizationId = String(hit._id)
    for (const connection of hit.connections?.locations ?? []) {
      if (connection.locationId !== locationId) {
        continue
      }
      edges.push({
        organizationId,
        connectionId: connection.id,
        locationId: connection.locationId,
        kind: connection.kind,
      })
    }
  }

  return edges
}
