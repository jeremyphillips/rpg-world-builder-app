import type {
  CharacterOrganizationConnection,
  CreateCharacterOrganizationMembershipInput,
  UpdateCharacterOrganizationMembershipInput,
} from '@rpg/contracts'

import { deleteJson, patchJson, postJson } from '@/lib/api-client'

const membershipsPath = (campaignId: string, characterId: string, organizationId?: string) => {
  const base = `/api/campaigns/${campaignId}/content/characters/${characterId}/organization-memberships`
  return organizationId ? `${base}/${organizationId}` : base
}

export async function createCharacterOrganizationMembership(
  campaignId: string,
  characterId: string,
  input: CreateCharacterOrganizationMembershipInput,
): Promise<{ organizationMembership: CharacterOrganizationConnection }> {
  return postJson(
    membershipsPath(campaignId, characterId),
    input,
    'Could not add this organization membership.',
  )
}

export async function updateCharacterOrganizationMembership(
  campaignId: string,
  characterId: string,
  organizationId: string,
  input: UpdateCharacterOrganizationMembershipInput,
): Promise<{ organizationMembership: CharacterOrganizationConnection }> {
  return patchJson(
    membershipsPath(campaignId, characterId, organizationId),
    input,
    'Could not update this organization membership.',
  )
}

export async function deleteCharacterOrganizationMembership(
  campaignId: string,
  characterId: string,
  organizationId: string,
): Promise<{ ok: true }> {
  return deleteJson(
    membershipsPath(campaignId, characterId, organizationId),
    'Could not remove this organization membership.',
  )
}
