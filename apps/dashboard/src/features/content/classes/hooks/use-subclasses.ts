import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import { fetchSubclasses, type SubclassesListResult } from '../api/subclasses-api'

export const subclassesQueryKey = (campaignId: string, classId: string) =>
  ['campaigns', campaignId, 'content', 'classes', classId, 'subclasses'] as const

/** Load all subclasses for a given class within a campaign's resolved catalog. */
export function useSubclasses(campaignId: string | undefined, classId: string | undefined) {
  return useQuery({
    queryKey: campaignId && classId ? subclassesQueryKey(campaignId, classId) : [],
    queryFn: () => fetchSubclasses(campaignId!, classId!),
    enabled: Boolean(campaignId) && Boolean(classId),
    select: (result) => result.subclasses,
  })
}

export function useSubclassesListResult(
  campaignId: string | undefined,
  classId: string | undefined,
): UseQueryResult<SubclassesListResult> {
  return useQuery({
    queryKey: campaignId && classId ? subclassesQueryKey(campaignId, classId) : [],
    queryFn: () => fetchSubclasses(campaignId!, classId!),
    enabled: Boolean(campaignId) && Boolean(classId),
  })
}
