import { useQuery } from '@tanstack/react-query'

import { listCampaigns } from '@/features/campaign/api/campaign-client'

/** Query key for the current user's campaign list. */
export const campaignsQueryKey = ['campaigns', 'list'] as const

/** Load every campaign the current user owns or belongs to. */
export function useCampaigns() {
  return useQuery({
    queryKey: campaignsQueryKey,
    queryFn: listCampaigns,
  })
}
