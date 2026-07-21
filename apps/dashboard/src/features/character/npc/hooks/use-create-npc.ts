import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createNpc } from '../api/npc-client'
import { npcQueryKey, npcsQueryKey } from './use-npcs'

type CreateNpcVariables = {
  campaignId: string
  input: Parameters<typeof createNpc>[1]
}

/** Create a campaign NPC and refresh NPC queries. Navigation is the caller's responsibility. */
export function useCreateNpc() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ campaignId, input }: CreateNpcVariables) => createNpc(campaignId, input),
    onSuccess: (npc, { campaignId }) => {
      void queryClient.invalidateQueries({ queryKey: npcsQueryKey(campaignId) })
      void queryClient.setQueryData(npcQueryKey(campaignId, npc.id), npc)
    },
  })
}
