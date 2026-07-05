import { useQuery } from '@tanstack/react-query'

import { getCharacter } from '../api/character-client'

export function characterQueryKey(characterId: string | undefined) {
  return ['characters', 'detail', characterId] as const
}

/** Load a single PC by id (owner-only). */
export function useCharacter(characterId: string | undefined) {
  return useQuery({
    queryKey: characterQueryKey(characterId),
    queryFn: () => getCharacter(characterId!),
    enabled: Boolean(characterId),
  })
}
