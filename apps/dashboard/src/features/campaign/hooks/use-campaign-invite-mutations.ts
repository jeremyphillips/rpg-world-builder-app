import { useMutation, useQueryClient } from '@tanstack/react-query'

import { revokeCampaignInvite, shareCampaignInviteLink } from '../api/campaign-overview-client'
import { campaignInvitesQueryKey } from './use-campaign-invites'

const SHARE_INVITE_LINK_ERROR = 'Could not share invite link.'
const REVOKE_INVITE_ERROR = 'Could not revoke invitation.'

export function useShareCampaignInviteLink(campaignId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (inviteId: string) => shareCampaignInviteLink(campaignId!, inviteId),
    onSuccess: async () => {
      if (!campaignId) return
      await queryClient.invalidateQueries({ queryKey: campaignInvitesQueryKey(campaignId) })
    },
    meta: {
      fallbackMessage: SHARE_INVITE_LINK_ERROR,
    },
  })
}

export function useRevokeCampaignInvite(campaignId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (inviteId: string) => revokeCampaignInvite(campaignId!, inviteId),
    onSuccess: async () => {
      if (!campaignId) return
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: campaignInvitesQueryKey(campaignId) }),
        queryClient.invalidateQueries({ queryKey: ['campaigns', campaignId, 'members'] }),
      ])
    },
    meta: {
      fallbackMessage: REVOKE_INVITE_ERROR,
    },
  })
}
