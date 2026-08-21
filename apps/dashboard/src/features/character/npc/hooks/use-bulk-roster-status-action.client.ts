'use client'

import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  type ActionTargetFailure,
  type CampaignNpcDetail,
  type CampaignNpcListItem,
  type CharacterBulkRosterFormValues,
} from '@rpg/contracts'

import {
  notifyActionOutcomes,
  NPC_ROSTER_STATUS_ACTION,
  type ActionLifecycleCloseEvent,
} from '@/lib/actions'

import { mapNpcDetailToListItem } from '../api/npc-client'
import { npcQueryKey, npcsQueryKey } from './use-npcs'
import { applyBulkRosterStatusToTargets } from '../lib/bulk/bulk-roster-status-action.lib'

export type UseBulkRosterStatusActionOptions = {
  campaignId: string
  rows: CampaignNpcListItem[]
}

export function useBulkRosterStatusAction({ campaignId, rows }: UseBulkRosterStatusActionOptions) {
  const queryClient = useQueryClient()

  const updateCachedNpc = useCallback(
    (listItem: CampaignNpcListItem) => {
      queryClient.setQueryData<CampaignNpcListItem[]>(npcsQueryKey(campaignId), (current) =>
        current?.map((entry) => (entry.character.id === listItem.character.id ? listItem : entry)),
      )
      queryClient.setQueryData<CampaignNpcDetail | undefined>(
        npcQueryKey(campaignId, listItem.character.id),
        (current) => {
          if (!current) return current

          return {
            ...current,
            character: { ...current.character, vital: listItem.character.vital },
            participation: { ...current.participation, roster: listItem.participation.roster },
          }
        },
      )
    },
    [campaignId, queryClient],
  )

  const apply = useCallback(
    async (targetIds: readonly string[], formValues: CharacterBulkRosterFormValues) => {
      const { outcomes, updates } = await applyBulkRosterStatusToTargets(
        rows,
        targetIds,
        formValues,
        campaignId,
      )

      updates.forEach((update) => {
        updateCachedNpc(mapNpcDetailToListItem(update.npcDetail))
      })

      return outcomes
    },
    [campaignId, rows, updateCachedNpc],
  )

  const notifyClose = useCallback(
    (event: ActionLifecycleCloseEvent<never, ActionTargetFailure>) => {
      notifyActionOutcomes({
        outcomes: event.outcomes,
        closeReason: event.reason,
        nounPlural: NPC_ROSTER_STATUS_ACTION.nounPlural,
        nounSingular: NPC_ROSTER_STATUS_ACTION.nounSingular,
      })
    },
    [],
  )

  return {
    apply,
    notifyClose,
  }
}
