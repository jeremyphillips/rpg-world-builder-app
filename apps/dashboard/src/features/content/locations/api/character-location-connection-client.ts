import type {
  CreateCharacterLocationConnectionInput,
  CharacterLocationConnection,
  UpdateCharacterLocationConnectionInput,
} from '@rpg/contracts'

import { deleteJson, patchJson, postJson } from '@/lib/api-client'

const locationConnectionsPath = (
  campaignId: string,
  characterId: string,
  connectionId?: string,
) => {
  const base = `/api/campaigns/${campaignId}/content/characters/${characterId}/location-connections`
  return connectionId ? `${base}/${connectionId}` : base
}

export async function createCharacterLocationConnection(
  campaignId: string,
  characterId: string,
  input: CreateCharacterLocationConnectionInput,
): Promise<{ locationConnection: CharacterLocationConnection }> {
  return postJson(
    locationConnectionsPath(campaignId, characterId),
    input,
    'Could not add this location connection.',
  )
}

export async function updateCharacterLocationConnection(
  campaignId: string,
  characterId: string,
  connectionId: string,
  input: UpdateCharacterLocationConnectionInput,
): Promise<{ locationConnection: CharacterLocationConnection }> {
  return patchJson(
    locationConnectionsPath(campaignId, characterId, connectionId),
    input,
    'Could not update this location connection.',
  )
}

export async function deleteCharacterLocationConnection(
  campaignId: string,
  characterId: string,
  connectionId: string,
): Promise<{ ok: true }> {
  return deleteJson(
    locationConnectionsPath(campaignId, characterId, connectionId),
    'Could not remove this location connection.',
  )
}
