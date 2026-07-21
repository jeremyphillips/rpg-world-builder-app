import { useQuery } from '@tanstack/react-query'

import { listCampaignTemplates } from '../api/campaign-client'

export const campaignTemplatesQueryKey = ['campaigns', 'templates'] as const

/** Load immutable shipped campaign templates for a future creation chooser. */
export function useCampaignTemplates() {
  return useQuery({
    queryKey: campaignTemplatesQueryKey,
    queryFn: listCampaignTemplates,
    staleTime: Number.POSITIVE_INFINITY,
  })
}
