import type { CharacterLocationReferenceResolution } from '@rpg/contracts'

import { request } from '@/lib/api-client'

const GET_LOCATION_REFERENCES_ERROR = 'Could not load location connections.'

export async function getCharacterLocationReferences(
  campaignId: string,
  characterId: string,
): Promise<CharacterLocationReferenceResolution[]> {
  const { locationReferences } = await request<{
    locationReferences: CharacterLocationReferenceResolution[]
  }>(
    `/api/campaigns/${campaignId}/content/locations/references/${characterId}`,
    undefined,
    GET_LOCATION_REFERENCES_ERROR,
  )
  return locationReferences
}
