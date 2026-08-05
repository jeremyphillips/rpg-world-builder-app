import type { OrganizationConnectedRegionsResponse } from '@rpg/contracts'

import { request } from '@/lib/api-client'

import { ORGANIZATION_CONNECTED_REGIONS_LOAD_ERROR } from '../lib/organization-connected-regions.constants'

export async function getOrganizationConnectedRegions(
  campaignId: string,
  organizationId: string,
  pagination: { page: number; pageSize: number },
): Promise<OrganizationConnectedRegionsResponse> {
  const params = new URLSearchParams({
    page: String(pagination.page),
    pageSize: String(pagination.pageSize),
  })

  return request<OrganizationConnectedRegionsResponse>(
    `/api/campaigns/${campaignId}/content/organizations/${organizationId}/connected-regions?${params.toString()}`,
    undefined,
    ORGANIZATION_CONNECTED_REGIONS_LOAD_ERROR,
  )
}
