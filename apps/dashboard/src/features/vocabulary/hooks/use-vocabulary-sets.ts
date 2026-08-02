import { useQuery } from '@tanstack/react-query'

import { listVocabularySets } from '../api/vocabulary-api'

export function vocabularySetsQueryKey(campaignId: string) {
  return ['campaigns', campaignId, 'vocabulary'] as const
}

/** Load all resolved vocabulary sets for hub counts. */
export function useVocabularySets(campaignId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: campaignId ? vocabularySetsQueryKey(campaignId) : [],
    queryFn: () => listVocabularySets(campaignId!),
    enabled: Boolean(campaignId && enabled),
  })
}
