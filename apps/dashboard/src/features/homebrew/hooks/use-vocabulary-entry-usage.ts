import { useQuery } from '@tanstack/react-query'
import type { VocabularyOptionSetId } from '@rpg/contracts'

import { fetchVocabularyEntryUsage } from '../api/vocabulary-api'

export function vocabularyEntryUsageQueryKey(
  campaignId: string,
  setId: VocabularyOptionSetId,
  entryId: string,
) {
  return ['campaigns', campaignId, 'vocabulary', setId, 'entries', entryId, 'usage'] as const
}

export function useVocabularyEntryUsage(
  campaignId: string | undefined,
  setId: VocabularyOptionSetId | undefined,
  entryId: string | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey:
      campaignId && setId && entryId
        ? vocabularyEntryUsageQueryKey(campaignId, setId, entryId)
        : [],
    queryFn: () => fetchVocabularyEntryUsage(campaignId!, setId!, entryId!),
    enabled: Boolean(campaignId && setId && entryId && enabled),
  })
}
