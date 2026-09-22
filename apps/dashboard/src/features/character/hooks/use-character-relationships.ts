import { useQuery } from '@tanstack/react-query'

import type { CharacterRelationshipsListQuery } from '@rpg/contracts'

import { listCharacterRelationships } from '../api/character-relationship-client'

export function characterRelationshipsQueryKey(
  campaignId: string | undefined,
  characterId: string | undefined,
  query?: CharacterRelationshipsListQuery,
) {
  return [
    'campaigns',
    campaignId,
    'characters',
    characterId,
    'relationships',
    query?.kinds ?? null,
    query?.cursor ?? null,
    query?.limit ?? null,
  ] as const
}

export function useCharacterRelationships(
  campaignId: string | undefined,
  characterId: string | undefined,
  query?: CharacterRelationshipsListQuery,
  enabled = true,
) {
  const relationshipsQuery = useQuery({
    queryKey: characterRelationshipsQueryKey(campaignId, characterId, query),
    queryFn: () => listCharacterRelationships(campaignId!, characterId!, query),
    enabled: Boolean(enabled && campaignId && characterId),
  })

  return {
    ...relationshipsQuery,
    isPending: enabled && relationshipsQuery.isPending,
    isError: enabled && relationshipsQuery.isError,
    error: enabled ? relationshipsQuery.error : null,
  }
}
