import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteCharacter } from '../api/character-client'
import { characterQueryKey } from './use-character'
import { charactersQueryKey } from './use-characters'

/**
 * Delete a standalone PC and refresh character queries. Navigation is the
 * caller's responsibility.
 */
export function useDeleteCharacter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCharacter,
    onSuccess: (_result, characterId) => {
      void queryClient.invalidateQueries({ queryKey: charactersQueryKey })
      void queryClient.removeQueries({ queryKey: characterQueryKey(characterId) })
    },
  })
}
