import { useQuery } from '@tanstack/react-query'

import { getCharacterOrganizationReferences } from '../api/organization-reference-client'

export function characterOrganizationReferencesQueryKey(
  campaignId: string | undefined,
  characterId: string | undefined,
) {
  return ['campaigns', campaignId, 'characters', characterId, 'organization-references'] as const
}

export function useCharacterOrganizationReferences(
  campaignId: string | undefined,
  characterId: string | undefined,
  enabled = true,
) {
  const query = useQuery({
    queryKey: characterOrganizationReferencesQueryKey(campaignId, characterId),
    queryFn: () => getCharacterOrganizationReferences(campaignId!, characterId!),
    enabled: Boolean(enabled && campaignId && characterId),
  })

  return {
    ...query,
    isPending: enabled && query.isPending,
    isError: enabled && query.isError,
    error: enabled ? query.error : null,
  }
}
