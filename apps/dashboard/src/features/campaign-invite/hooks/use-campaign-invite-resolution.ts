import { useQuery } from '@tanstack/react-query'

import { resolveCampaignInviteById } from '../api/campaign-invite-client'

export const campaignInviteResolutionQueryKey = (inviteId: string) =>
  ['campaign-invite', 'resolution', 'inviteId', inviteId] as const

export function useCampaignInviteResolution(inviteId: string | undefined) {
  return useQuery({
    queryKey: inviteId
      ? campaignInviteResolutionQueryKey(inviteId)
      : (['campaign-invite', 'resolution', 'disabled'] as const),
    queryFn: () => resolveCampaignInviteById(inviteId!),
    enabled: Boolean(inviteId),
    retry: false,
  })
}
