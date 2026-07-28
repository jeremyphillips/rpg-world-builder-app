import { useMutation, useQueryClient } from '@tanstack/react-query'

import { removeIncompleteCampaignMember } from '../api/campaign-overview-client'
import { campaignsQueryKey } from './use-campaigns'
import { campaignInvitesQueryKey } from './use-campaign-invites'
import { campaignMembersQueryKey } from './use-campaign-members'

const REMOVE_MEMBER_ERROR = 'Could not remove this member.'

export function useRemoveIncompleteCampaignMember(campaignId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (membershipId: string) => removeIncompleteCampaignMember(campaignId!, membershipId),
    onSuccess: async () => {
      if (!campaignId) return
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: campaignMembersQueryKey(campaignId) }),
        queryClient.invalidateQueries({ queryKey: campaignInvitesQueryKey(campaignId) }),
        queryClient.invalidateQueries({ queryKey: campaignsQueryKey }),
      ])
    },
    meta: {
      fallbackMessage: REMOVE_MEMBER_ERROR,
    },
  })
}
