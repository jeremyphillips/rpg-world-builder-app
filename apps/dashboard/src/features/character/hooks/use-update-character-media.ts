import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CharacterMediaPatchInput, PcCharacter } from '@rpg/contracts'

import { campaignCharacterQueryKey } from '@/features/campaign'

import { patchCharacterMedia } from '../api/character-client'
import { characterQueryKey } from './use-character'

export function useUpdateCharacterMedia(characterId: string | undefined, campaignId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (patch: CharacterMediaPatchInput) => patchCharacterMedia(characterId!, patch),
    onSuccess: (character: PcCharacter) => {
      if (characterId) {
        queryClient.setQueryData(characterQueryKey(characterId), character)
      }
      if (campaignId && characterId) {
        queryClient.invalidateQueries({
          queryKey: campaignCharacterQueryKey(campaignId, characterId),
        })
      }
    },
  })
}
