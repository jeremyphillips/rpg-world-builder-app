import { useQuery } from '@tanstack/react-query'

import { resolveCampaignInviteByToken } from '../api/campaign-invite-client'

export const campaignInviteResolutionQueryKey = (token: string) =>
  ['campaign-invite', 'resolution', 'token', token] as const

export function useCampaignInviteResolution(token: string | null) {
  return useQuery({
    queryKey: token
      ? campaignInviteResolutionQueryKey(token)
      : (['campaign-invite', 'resolution', 'disabled'] as const),
    queryFn: () => resolveCampaignInviteByToken(token!),
    enabled: Boolean(token),
    retry: false,
  })
}
