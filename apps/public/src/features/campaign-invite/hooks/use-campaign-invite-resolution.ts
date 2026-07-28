import { useQuery } from '@tanstack/react-query'

import { resolveCampaignInvite } from '../api/campaign-invite-client'

export const campaignInviteResolutionQueryKey = (token: string) =>
  ['campaign-invite', 'resolution', token] as const

export function useCampaignInviteResolution(token: string | undefined) {
  return useQuery({
    queryKey: campaignInviteResolutionQueryKey(token ?? ''),
    queryFn: () => resolveCampaignInvite(token!),
    enabled: Boolean(token),
    retry: false,
  })
}
