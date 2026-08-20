import type { OrganizationMembersResponse } from '@rpg/contracts'

import { request } from '@/lib/api-client'

import { ORGANIZATION_MEMBERS_LOAD_ERROR } from '../lib/members/organization-members.constants'

export async function getOrganizationMembers(
  campaignId: string,
  organizationId: string,
  pagination: { page: number; pageSize: number },
): Promise<OrganizationMembersResponse> {
  const params = new URLSearchParams({
    page: String(pagination.page),
    pageSize: String(pagination.pageSize),
  })

  return request<OrganizationMembersResponse>(
    `/api/campaigns/${campaignId}/content/organizations/${organizationId}/members?${params.toString()}`,
    undefined,
    ORGANIZATION_MEMBERS_LOAD_ERROR,
  )
}
