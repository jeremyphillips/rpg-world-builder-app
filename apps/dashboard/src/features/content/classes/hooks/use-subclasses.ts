import { useQuery } from '@tanstack/react-query'

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

/** Usage envelope metadata for subclass list rows (shared query cache with {@link useSubclasses}). */
export function useSubclassesUsageMeta(
  campaignId: string | undefined,
  classId: string | undefined,
) {
  return useQuery({
    queryKey: campaignId && classId ? subclassesQueryKey(campaignId, classId) : [],
    queryFn: () => fetchSubclasses(campaignId!, classId!),
    enabled: Boolean(campaignId) && Boolean(classId),
    select: (result): Pick<SubclassesListResult, 'usageSummaryLabels' | 'overviewUsageScope'> => ({
      usageSummaryLabels: result.usageSummaryLabels,
      overviewUsageScope: result.overviewUsageScope,
    }),
  })
}
