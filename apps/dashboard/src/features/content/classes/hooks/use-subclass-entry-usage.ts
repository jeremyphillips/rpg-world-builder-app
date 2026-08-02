import { useQuery } from '@tanstack/react-query'

import { fetchSubclassUsage } from '../api/subclasses-api'

export function subclassEntryUsageQueryKey(
  campaignId: string,
  classId: string,
  subclassId: string,
) {
  return [
    'campaigns',
    campaignId,
    'content',
    'classes',
    classId,
    'subclasses',
    subclassId,
    'usage',
  ] as const
}

export function useSubclassEntryUsage(
  campaignId: string | undefined,
  classId: string | undefined,
  subclassId: string | undefined,
) {
  return useQuery({
    queryKey:
      campaignId && classId && subclassId
        ? subclassEntryUsageQueryKey(campaignId, classId, subclassId)
        : [],
    queryFn: () => fetchSubclassUsage(campaignId!, classId!, subclassId!),
    enabled: Boolean(campaignId && classId && subclassId),
  })
}
