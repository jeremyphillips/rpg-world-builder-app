import { useMutation, useQueryClient } from '@tanstack/react-query'

import { sendCampaignInvite } from '../api/campaign-overview-client'
import { campaignInvitesQueryKey } from './use-campaign-invites'
import { INVITE_MEMBER_DIALOG_COPY } from '../lib/overview/campaign-overview-labels'

export function useSendCampaignInvite(campaignId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (email: string) => sendCampaignInvite(campaignId!, { email }),
    onSuccess: async () => {
      if (!campaignId) return
      await queryClient.invalidateQueries({ queryKey: campaignInvitesQueryKey(campaignId) })
    },
    meta: {
      fallbackMessage: INVITE_MEMBER_DIALOG_COPY.fallbackError,
    },
  })
}
