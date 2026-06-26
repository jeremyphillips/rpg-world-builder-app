import { useQuery } from '@tanstack/react-query'

import { getHomebrewSummary } from '../api/homebrew-api'

export function homebrewSummaryQueryKey(campaignId: string) {
  return ['campaigns', campaignId, 'homebrew', 'summary'] as const
}

/** Load content counts for the Homebrew hub cards. */
export function useHomebrewSummary(campaignId: string | undefined) {
  return useQuery({
    queryKey: campaignId ? homebrewSummaryQueryKey(campaignId) : [],
    queryFn: () => getHomebrewSummary(campaignId!),
    enabled: Boolean(campaignId),
  })
}
