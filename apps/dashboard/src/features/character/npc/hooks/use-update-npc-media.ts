import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CharacterMediaPatchInput } from '@rpg/contracts'

import { patchNpcMedia } from '../api/npc-client'
import { npcQueryKey } from './use-npcs'

export function useUpdateNpcMedia(campaignId: string | undefined, npcId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (patch: CharacterMediaPatchInput) => patchNpcMedia(campaignId!, npcId!, patch),
    onSuccess: (npc) => {
      if (campaignId && npcId) {
        queryClient.setQueryData(npcQueryKey(campaignId, npcId), npc)
      }
    },
  })
}
