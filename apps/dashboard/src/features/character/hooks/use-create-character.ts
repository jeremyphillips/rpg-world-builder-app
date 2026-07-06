import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createCharacter } from '../api/character-client'
import { characterQueryKey } from './use-character'
import { charactersQueryKey } from './use-characters'

/**
 * Create a standalone PC and refresh character queries. Navigation and draft
 * cleanup are the caller's responsibility.
 */
export function useCreateCharacter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCharacter,
    onSuccess: (character) => {
      void queryClient.invalidateQueries({ queryKey: charactersQueryKey })
      void queryClient.setQueryData(characterQueryKey(character.id), character)
    },
  })
}
