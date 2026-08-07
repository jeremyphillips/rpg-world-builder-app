import { useQuery } from '@tanstack/react-query'

import { getCharacterLocationReferences } from '../api/location-reference-client'

export function characterLocationReferencesQueryKey(
  campaignId: string | undefined,
  characterId: string | undefined,
) {
  return ['campaigns', campaignId, 'characters', characterId, 'location-references'] as const
}

export function useCharacterLocationReferences(
  campaignId: string | undefined,
  characterId: string | undefined,
  enabled = true,
) {
  const query = useQuery({
    queryKey: characterLocationReferencesQueryKey(campaignId, characterId),
    queryFn: () => getCharacterLocationReferences(campaignId!, characterId!),
    enabled: Boolean(enabled && campaignId && characterId),
  })

  return {
    ...query,
    isPending: enabled && query.isPending,
    isError: enabled && query.isError,
    error: enabled ? query.error : null,
  }
}
