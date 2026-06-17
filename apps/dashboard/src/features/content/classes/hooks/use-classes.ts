import { useQuery } from '@tanstack/react-query'
import { listClasses } from '../api/classes-api'

export const classesQueryKey = (campaignId: string) =>
  ['campaigns', campaignId, 'content', 'classes'] as const

/** Load all classes available in the given campaign (system seed + homebrew). */
export function useClasses(campaignId: string | undefined) {
  return useQuery({
    queryKey: campaignId ? classesQueryKey(campaignId) : [],
    queryFn: () => listClasses(campaignId!),
    enabled: Boolean(campaignId),
  })
}
