import { useQuery } from '@tanstack/react-query'
import { listWeapons } from '../api/weapons-api'

export const weaponsQueryKey = (campaignId: string) =>
  ['campaigns', campaignId, 'content', 'weapons'] as const

/** Load all weapons available in the given campaign (system seed + homebrew). */
export function useWeapons(campaignId: string | undefined) {
  return useQuery({
    queryKey: campaignId ? weaponsQueryKey(campaignId) : [],
    queryFn: () => listWeapons(campaignId!),
    enabled: Boolean(campaignId),
  })
}
