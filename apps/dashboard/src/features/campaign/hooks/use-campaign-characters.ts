import { useQuery } from '@tanstack/react-query'

import { listCampaignCharacters } from '../api/campaign-characters-client'

export const campaignCharactersListQueryKey = (campaignId: string) =>
  ['campaigns', campaignId, 'characters', 'list'] as const

/** Load campaign-scoped character rows for the current viewer's list scope. */
export function useCampaignCharacters(campaignId: string | undefined) {
  return useQuery({
    queryKey: campaignCharactersListQueryKey(campaignId ?? ''),
    queryFn: () => listCampaignCharacters(campaignId!),
    enabled: Boolean(campaignId),
  })
}
