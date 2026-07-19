import { useMutation, useQueryClient } from '@tanstack/react-query'

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
    onSuccess: (_result, { campaignId, npcId }) => {
      void queryClient.invalidateQueries({ queryKey: npcsQueryKey(campaignId) })
      void queryClient.removeQueries({ queryKey: npcQueryKey(campaignId, npcId) })
    },
  })
}
