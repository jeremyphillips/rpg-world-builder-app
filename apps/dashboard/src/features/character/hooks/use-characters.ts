import { useQuery } from '@tanstack/react-query'

import { listCharacters } from '../api/character-client'

/** Query key for the current user's character list. */
export const charactersQueryKey = ['characters', 'list'] as const

/** Load every standalone PC owned by the current user. */
export function useCharacters() {
  return useQuery({
    queryKey: charactersQueryKey,
    queryFn: listCharacters,
  })
}
