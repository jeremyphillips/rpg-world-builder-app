'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CharacterLifecycle, CharacterLifecyclePatch, NpcCharacter } from '@rpg/contracts'

import { patchNpcLifecycle } from '../../npc/api/npc-client'
import { npcQueryKey, npcsQueryKey } from '../../npc/hooks/use-npcs'

export function useUpdateNpcLifecycle(campaignId: string, npcId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (patch: CharacterLifecyclePatch) => patchNpcLifecycle(campaignId, npcId, patch),
    onSuccess: (npc) => {
      queryClient.setQueryData(npcQueryKey(campaignId, npcId), npc)
      queryClient.setQueryData<NpcCharacter[]>(npcsQueryKey(campaignId), (current) =>
        current?.map((row) => (row.id === npc.id ? npc : row)),
      )
    },
  })
}

export type NpcLifecycleEditorValues = {
  rosterStatus: CharacterLifecycle['roster']['status']
  vitalStatus: CharacterLifecycle['vital']['status']
  rosterNote: string
  vitalNote: string
}

export function toNpcLifecycleEditorValues(
  lifecycle: CharacterLifecycle,
): NpcLifecycleEditorValues {
  return {
    rosterStatus: lifecycle.roster.status,
    vitalStatus: lifecycle.vital.status,
    rosterNote: lifecycle.roster.note ?? '',
    vitalNote: lifecycle.vital.note ?? '',
  }
}

export function toNpcLifecyclePatch(values: NpcLifecycleEditorValues): CharacterLifecyclePatch {
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
