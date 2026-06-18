import { useQuery } from '@tanstack/react-query'
import { listArmor } from '../api/armor-api'

export const armorQueryKey = (campaignId: string) =>
  ['campaigns', campaignId, 'content', 'armor'] as const

/** Load all armor available in the given campaign (system seed + homebrew). */
export function useArmor(campaignId: string | undefined) {
  return useQuery({
    queryKey: campaignId ? armorQueryKey(campaignId) : [],
    queryFn: () => listArmor(campaignId!),
    enabled: Boolean(campaignId),
  })
}
