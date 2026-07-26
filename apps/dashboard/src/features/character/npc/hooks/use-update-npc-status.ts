'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  CampaignNpcListItem,
  CampaignNpcStatusPatch,
  CharacterRosterState,
  CharacterVitalState,
} from '@rpg/contracts'

import { mapNpcDetailToListItem, patchNpcStatus } from '../api/npc-client'
import { npcQueryKey, npcsQueryKey } from './use-npcs'

export function useUpdateNpcStatus(campaignId: string, npcId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (patch: CampaignNpcStatusPatch) => patchNpcStatus(campaignId, npcId, patch),
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

export type NpcStatusEditorValues = {
  rosterStatus: CharacterRosterState['status']
  vitalStatus: CharacterVitalState['status']
  rosterNote: string
  vitalNote: string
}

export function toNpcStatusEditorValues(input: {
  vital: CharacterVitalState
  roster: CharacterRosterState
}): NpcStatusEditorValues {
  return {
    rosterStatus: input.roster.status,
    vitalStatus: input.vital.status,
    rosterNote: input.roster.note ?? '',
    vitalNote: input.vital.note ?? '',
  }
}

export function toNpcStatusPatch(values: NpcStatusEditorValues): CampaignNpcStatusPatch {
  return {
    roster: {
      status: values.rosterStatus,
      note: values.rosterNote.trim() === '' ? '' : values.rosterNote.trim(),
    },
    vital: {
      status: values.vitalStatus,
      note: values.vitalNote.trim() === '' ? '' : values.vitalNote.trim(),
    },
  }
}
