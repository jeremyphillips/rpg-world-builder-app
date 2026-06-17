import { useQuery } from '@tanstack/react-query'
import { fetchSubclasses } from '../api/subclasses-api'

export const subclassesQueryKey = (campaignId: string, classId: string) =>
  ['campaigns', campaignId, 'content', 'classes', classId, 'subclasses'] as const

/** Load all subclasses for a given class within a campaign's ruleset. */
export function useSubclasses(campaignId: string | undefined, classId: string | undefined) {
  return useQuery({
    queryKey: campaignId && classId ? subclassesQueryKey(campaignId, classId) : [],
    queryFn: () => fetchSubclasses(campaignId!, classId!),
    enabled: Boolean(campaignId) && Boolean(classId),
  })
}
