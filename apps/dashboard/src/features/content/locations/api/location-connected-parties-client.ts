import type { LocationConnectedPartiesResponse } from '@rpg/contracts'

import { request } from '@/lib/api-client'

const GET_CONNECTED_PARTIES_ERROR = 'Could not load connected parties for this location.'

export async function getLocationConnectedParties(
  campaignId: string,
  locationId: string,
  page = 1,
  pageSize = 50,
): Promise<LocationConnectedPartiesResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })

  return request<LocationConnectedPartiesResponse>(
    `/api/campaigns/${campaignId}/content/locations/${locationId}/connected-parties?${params.toString()}`,
    undefined,
    GET_CONNECTED_PARTIES_ERROR,
  )
}
