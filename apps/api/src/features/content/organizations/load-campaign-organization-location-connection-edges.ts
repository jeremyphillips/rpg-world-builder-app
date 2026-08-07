import type {
  OrganizationLocationConnection,
  OrganizationLocationConnectionEdgeAtLocation,
} from '@rpg/contracts'

import { HomebrewOrganizationModel } from './homebrew-organization.model'

type OrganizationLocationConnectionHit = {
  _id: unknown
  name: string
  connections?: {
    locations?: OrganizationLocationConnection[]
  }
}

/** Loads all organization location connection edges in a campaign, grouped by location id. */
export async function loadCampaignOrganizationLocationConnectionEdges(
  campaignId: string,
): Promise<Record<string, OrganizationLocationConnectionEdgeAtLocation[]>> {
  const hits = await HomebrewOrganizationModel.find({
    campaignId,
    'connections.locations.0': { $exists: true },
  })
    .select({ name: 1, connections: 1 })
    .lean<OrganizationLocationConnectionHit[]>()

  const edgesByLocationId: Record<string, OrganizationLocationConnectionEdgeAtLocation[]> = {}

  for (const hit of hits) {
    const organizationId = String(hit._id)
    for (const connection of hit.connections?.locations ?? []) {
      const edge: OrganizationLocationConnectionEdgeAtLocation = {
        organizationId,
        connectionId: connection.id,
        locationId: connection.locationId,
        kind: connection.kind,
        subjectName: hit.name,
      }
      const existing = edgesByLocationId[connection.locationId] ?? []
      existing.push(edge)
      edgesByLocationId[connection.locationId] = existing
    }
  }

  return edgesByLocationId
}
