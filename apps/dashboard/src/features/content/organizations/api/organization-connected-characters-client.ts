import type { OrganizationConnectedCharactersResponse } from '@rpg/contracts'

import { request } from '@/lib/api-client'

import { ORGANIZATION_CONNECTED_CHARACTERS_LOAD_ERROR } from '../lib/organization-connected-characters.constants'

const GET_ORGANIZATION_CONNECTED_CHARACTERS_ERROR = ORGANIZATION_CONNECTED_CHARACTERS_LOAD_ERROR

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
    `/api/campaigns/${campaignId}/content/organizations/${organizationId}/connected-characters?${params.toString()}`,
    undefined,
    GET_ORGANIZATION_CONNECTED_CHARACTERS_ERROR,
  )
}
