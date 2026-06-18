import { useQuery } from '@tanstack/react-query'
import { listEquipment } from '../api/equipment-api'

export const equipmentQueryKey = (campaignId: string) =>
  ['campaigns', campaignId, 'content', 'equipment'] as const

/** Load all equipment available in the given campaign (system seed + homebrew). */
export function useEquipment(campaignId: string | undefined) {
  return useQuery({
    queryKey: campaignId ? equipmentQueryKey(campaignId) : [],
    queryFn: () => listEquipment(campaignId!),
    enabled: Boolean(campaignId),
  })
}
