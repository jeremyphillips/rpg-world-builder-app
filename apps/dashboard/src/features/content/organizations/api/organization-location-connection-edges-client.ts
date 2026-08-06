import type { CampaignOrganizationLocationConnectionEdges } from '@rpg/contracts'

import { request } from '@/lib/api-client'

const GET_CAMPAIGN_ORGANIZATION_LOCATION_CONNECTION_EDGES_ERROR =
  'Could not load organization location connection occupancy.'

export async function getCampaignOrganizationLocationConnectionEdges(
  campaignId: string,
): Promise<CampaignOrganizationLocationConnectionEdges['edgesByLocationId']> {
  const { edgesByLocationId } = await request<CampaignOrganizationLocationConnectionEdges>(
    `/api/campaigns/${campaignId}/content/organization-location-connection-edges`,
    undefined,
    GET_CAMPAIGN_ORGANIZATION_LOCATION_CONNECTION_EDGES_ERROR,
  )
  return edgesByLocationId
}
