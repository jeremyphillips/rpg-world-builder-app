import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CampaignNpcListItem, CampaignParticipatingCharacterStatusPatch } from '@rpg/contracts'

import { mapNpcDetailToListItem, patchNpcStatus } from '../api/npc-client'
import { npcQueryKey, npcsQueryKey } from './use-npcs'

export function useUpdateNpcStatus(campaignId: string, npcId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (patch: CampaignParticipatingCharacterStatusPatch) =>
      patchNpcStatus(campaignId, npcId, patch),
    onSuccess: (npcDetail) => {
      queryClient.setQueryData(npcQueryKey(campaignId, npcId), npcDetail)
      queryClient.setQueryData<CampaignNpcListItem[]>(npcsQueryKey(campaignId), (current) =>
        current?.map((row) =>
          row.character.id === npcDetail.character.id ? mapNpcDetailToListItem(npcDetail) : row,
        ),
      )
    },
  })
}

export {
  toCampaignParticipatingCharacterStatusEditorValues as toNpcStatusEditorValues,
  toCampaignParticipatingCharacterStatusPatch as toNpcStatusPatch,
  type CampaignParticipatingCharacterStatusEditorValues as NpcStatusEditorValues,
} from '../../lib/campaign-participating-character-status.lib'
