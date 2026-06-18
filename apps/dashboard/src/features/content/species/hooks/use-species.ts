import { useQuery } from '@tanstack/react-query'
import { listSpecies } from '../api/species-api'

export const speciesQueryKey = (campaignId: string) =>
  ['campaigns', campaignId, 'content', 'species'] as const

/** Load all species available in the given campaign (system seed + homebrew). */
export function useSpecies(campaignId: string | undefined) {
  return useQuery({
    queryKey: campaignId ? speciesQueryKey(campaignId) : [],
    queryFn: () => listSpecies(campaignId!),
    enabled: Boolean(campaignId),
  })
}
