import { useQuery } from '@tanstack/react-query'

import { listCampaignInvites } from '../api/campaign-overview-client'

export const campaignInvitesQueryKey = (campaignId: string) =>
  ['campaigns', campaignId, 'invites'] as const

export function useCampaignInvites(campaignId: string | undefined) {
  return useQuery({
    queryKey: campaignInvitesQueryKey(campaignId ?? ''),
    queryFn: () => listCampaignInvites(campaignId!),
    enabled: Boolean(campaignId),
  })
}
