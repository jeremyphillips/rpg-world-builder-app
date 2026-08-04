import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ContentDeletionResult } from '@rpg/contracts'

import { deleteNpc } from '../api/npc-client'
import { npcQueryKey, npcsQueryKey } from './use-npcs'

type DeleteNpcVariables = {
  campaignId: string
  npcId: string
}

/** Delete a campaign NPC and refresh NPC queries. Navigation is the caller's responsibility. */
export function useDeleteNpc() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ campaignId, npcId }: DeleteNpcVariables) => deleteNpc(campaignId, npcId),
    onSuccess: (result, { campaignId, npcId }) => {
      if (result.status !== 'deleted') return
      void queryClient.invalidateQueries({ queryKey: npcsQueryKey(campaignId) })
      void queryClient.removeQueries({ queryKey: npcQueryKey(campaignId, npcId) })
    },
  })
}

export type DeleteNpcMutationResult = ContentDeletionResult
