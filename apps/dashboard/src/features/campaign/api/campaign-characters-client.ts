import type { CampaignCharacterListResponse } from '@rpg/contracts'

import { request } from '@/lib/api-client'

const LIST_CAMPAIGN_CHARACTERS_ERROR = 'Could not load characters.'

export async function listCampaignCharacters(
  campaignId: string,
): Promise<CampaignCharacterListResponse['characters']> {
  const { characters } = await request<CampaignCharacterListResponse>(
    `/api/campaigns/${encodeURIComponent(campaignId)}/characters`,
    undefined,
    LIST_CAMPAIGN_CHARACTERS_ERROR,
  )
  return characters
}
