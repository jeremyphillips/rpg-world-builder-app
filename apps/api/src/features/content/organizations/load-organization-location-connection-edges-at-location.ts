import type {
  OrganizationLocationConnection,
  OrganizationLocationConnectionEdgeAtLocation,
} from '@rpg/contracts'
import type { ClientSession } from 'mongoose'

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
  session?: ClientSession,
): Promise<OrganizationLocationConnectionEdgeAtLocation[]> {
  const query = HomebrewOrganizationModel.find({
    campaignId,
    'connections.locations.locationId': locationId,
  }).select({ connections: 1 })
  if (session) query.session(session)
  const hits = await query.lean<OrganizationLocationConnectionHit[]>()

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
