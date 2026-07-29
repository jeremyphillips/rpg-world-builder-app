import type { OrganizationReferenceResolution } from '@rpg/contracts'

import { request } from '@/lib/api-client'

const GET_ORGANIZATION_REFERENCES_ERROR = 'Could not load organization connections.'

export async function getCharacterOrganizationReferences(
  campaignId: string,
  characterId: string,
): Promise<OrganizationReferenceResolution[]> {
  const { organizationReferences } = await request<{
    organizationReferences: OrganizationReferenceResolution[]
  }>(
    `/api/campaigns/${campaignId}/content/organizations/references/${characterId}`,
    undefined,
    GET_ORGANIZATION_REFERENCES_ERROR,
  )
  return organizationReferences
}
