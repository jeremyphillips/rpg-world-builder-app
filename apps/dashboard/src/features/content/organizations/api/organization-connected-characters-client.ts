import type { OrganizationConnectedCharactersResponse } from '@rpg/contracts'

import { request } from '@/lib/api-client'

const GET_ORGANIZATION_CONNECTED_CHARACTERS_ERROR =
  'Could not load connected characters for this organization.'

export async function getOrganizationConnectedCharacters(
  campaignId: string,
  organizationId: string,
  pagination: { page: number; pageSize: number },
): Promise<OrganizationConnectedCharactersResponse> {
  const params = new URLSearchParams({
    page: String(pagination.page),
    pageSize: String(pagination.pageSize),
  })

  return request<OrganizationConnectedCharactersResponse>(
    `/api/campaigns/${campaignId}/content/organizations/${organizationId}/members?${params.toString()}`,
    undefined,
    GET_ORGANIZATION_CONNECTED_CHARACTERS_ERROR,
  )
}
