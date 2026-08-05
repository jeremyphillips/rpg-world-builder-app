import type { OrganizationLocationReferenceResolution } from '@rpg/contracts'

import { request } from '@/lib/api-client'

const GET_ORGANIZATION_LOCATION_REFERENCES_ERROR =
  'Could not load organization location connections.'

export async function getOrganizationLocationReferences(
  campaignId: string,
  organizationId: string,
): Promise<OrganizationLocationReferenceResolution[]> {
  const { locationReferences } = await request<{
    locationReferences: OrganizationLocationReferenceResolution[]
  }>(
    `/api/campaigns/${campaignId}/content/organizations/${organizationId}/location-references`,
    undefined,
    GET_ORGANIZATION_LOCATION_REFERENCES_ERROR,
  )
  return locationReferences
}
