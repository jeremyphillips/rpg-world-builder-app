import { useQuery } from '@tanstack/react-query'

import { listCampaignMembers } from '../api/campaign-overview-client'

export const campaignMembersQueryKey = (campaignId: string) =>
  ['campaigns', campaignId, 'members'] as const

export function useCampaignMembers(campaignId: string | undefined) {
  return useQuery({
    queryKey: campaignMembersQueryKey(campaignId ?? ''),
    queryFn: () => listCampaignMembers(campaignId!),
    enabled: Boolean(campaignId),
  })
}
