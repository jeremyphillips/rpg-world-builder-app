import { useQuery } from '@tanstack/react-query'

import { getCampaignCharacter } from '../api/campaign-character-client'

export function campaignCharacterQueryKey(
  campaignId: string | undefined,
  characterId: string | undefined,
) {
  return ['campaigns', campaignId, 'characters', characterId] as const
}

/** Load a campaign-scoped PC sheet for any authorized campaign member. */
export function useCampaignCharacter(
  campaignId: string | undefined,
  characterId: string | undefined,
) {
  return useQuery({
    queryKey: campaignCharacterQueryKey(campaignId, characterId),
    queryFn: () => getCampaignCharacter(campaignId!, characterId!),
    enabled: Boolean(campaignId && characterId),
  })
}
