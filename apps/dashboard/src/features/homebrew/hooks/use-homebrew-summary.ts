import { useQuery } from '@tanstack/react-query'

import { homebrewSummaryQueryKey } from '@/lib/query-keys/homebrew-summary'

import { getHomebrewSummary } from '../api/homebrew-api'

export { homebrewSummaryQueryKey } from '@/lib/query-keys/homebrew-summary'

/** Load content counts for the Homebrew hub cards. */
export function useHomebrewSummary(campaignId: string | undefined) {
  return useQuery({
    queryKey: campaignId ? homebrewSummaryQueryKey(campaignId) : [],
    queryFn: () => getHomebrewSummary(campaignId!),
    enabled: Boolean(campaignId),
  })
}
