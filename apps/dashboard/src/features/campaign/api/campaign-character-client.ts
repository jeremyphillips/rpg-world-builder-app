import type { CampaignCharacterGetResponse } from '@rpg/contracts'

import { request } from '@/lib/api-client'

const GET_CAMPAIGN_CHARACTER_ERROR = 'Could not load character.'

export async function getCampaignCharacter(
  campaignId: string,
  characterId: string,
): Promise<CampaignCharacterGetResponse> {
  return request<CampaignCharacterGetResponse>(
    `/api/campaigns/${encodeURIComponent(campaignId)}/characters/${encodeURIComponent(characterId)}`,
    undefined,
    GET_CAMPAIGN_CHARACTER_ERROR,
  )
}
