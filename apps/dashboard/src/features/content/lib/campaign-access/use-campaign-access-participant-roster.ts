import { useQuery } from '@tanstack/react-query'

import { fetchCampaignAccessParticipantRoster } from './campaign-access-api'

export function campaignAccessParticipantRosterQueryKey(campaignId: string) {
  return ['campaigns', campaignId, 'content-access-participants'] as const
}

/** Pickable campaign PCs for `specific_players` campaign-access grants. */
export function useCampaignAccessParticipantRoster(campaignId: string | undefined) {
  return useQuery({
    queryKey: campaignId ? campaignAccessParticipantRosterQueryKey(campaignId) : [],
    queryFn: () => fetchCampaignAccessParticipantRoster(campaignId!),
    enabled: Boolean(campaignId),
  })
}
