import { useQuery } from '@tanstack/react-query'

import { getCharacterRoutingContext } from '../api/character-client'

export function characterRoutingContextQueryKey(characterId: string | undefined) {
  return ['characters', 'routing-context', characterId] as const
}

/** Resolve whether a standalone character URL should canonicalize to a campaign route. */
export function useCharacterRoutingContext(
  characterId: string | undefined,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? Boolean(characterId)

  return useQuery({
    queryKey: characterRoutingContextQueryKey(characterId),
    queryFn: () => getCharacterRoutingContext(characterId!),
    enabled: enabled && Boolean(characterId),
  })
}
