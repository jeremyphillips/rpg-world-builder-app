import type {
  CreateTerritorialAuthorityRelationshipInput,
  Location,
  TerritorialAuthorityRelationship,
  UpdateTerritorialAuthorityRelationshipInput,
} from '@rpg/contracts'

import { deleteJson, patchJson, postJson } from '@/lib/api-client'

const territorialAuthoritiesPath = (
  campaignId: string,
  locationId: string,
  relationshipId?: string,
) => {
  const base = `/api/campaigns/${campaignId}/content/locations/${locationId}/territorial-authorities`
  return relationshipId ? `${base}/${relationshipId}` : base
}

export async function createTerritorialAuthority(
  campaignId: string,
  locationId: string,
  input: CreateTerritorialAuthorityRelationshipInput,
): Promise<{ location: Location; relationship: TerritorialAuthorityRelationship }> {
  return postJson(
    territorialAuthoritiesPath(campaignId, locationId),
    input,
    'Could not add territorial authority to this region.',
  )
}

export async function updateTerritorialAuthority(
  campaignId: string,
  locationId: string,
  relationshipId: string,
  input: UpdateTerritorialAuthorityRelationshipInput,
): Promise<{ location: Location; relationship: TerritorialAuthorityRelationship }> {
  return patchJson(
    territorialAuthoritiesPath(campaignId, locationId, relationshipId),
    input,
    'Could not update territorial authority on this region.',
  )
}

export async function deleteTerritorialAuthority(
  campaignId: string,
  locationId: string,
  relationshipId: string,
): Promise<{ locations: Location }> {
  return deleteJson(
    territorialAuthoritiesPath(campaignId, locationId, relationshipId),
    'Could not remove territorial authority from this region.',
  )
}
