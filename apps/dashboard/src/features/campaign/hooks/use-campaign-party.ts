import { useQuery } from '@tanstack/react-query'

import { listCampaignParty } from '../api/campaign-overview-client'

export const campaignPartyQueryKey = (campaignId: string) =>
  ['campaigns', campaignId, 'party'] as const

export function useCampaignParty(campaignId: string | undefined) {
  return useQuery({
    queryKey: campaignPartyQueryKey(campaignId ?? ''),
    queryFn: () => listCampaignParty(campaignId!),
    enabled: Boolean(campaignId),
  })
}
