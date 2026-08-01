import { useQuery } from '@tanstack/react-query'

import {
  campaignInvitesMineQueryKey,
  listPendingCampaignInvitesMine,
} from '../api/campaign-invite-client'

export function usePendingCampaignInvites() {
  return useQuery({
    queryKey: campaignInvitesMineQueryKey,
    queryFn: listPendingCampaignInvitesMine,
  })
}
