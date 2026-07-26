'use client'

import { useCallback, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { CampaignNpcDetail, CampaignNpcListItem } from '@rpg/contracts'
import { getErrorMessage, type CharacterBulkRosterFormValues } from '@rpg/contracts'

import { mapNpcDetailToListItem } from '../api/npc-client'
import { npcQueryKey, npcsQueryKey } from './use-npcs'
import {
  executeBulkRosterStatusApply,
  type BulkRosterStatusApplyResult,
} from '../lib/bulk/execute-bulk-roster-status-apply.lib'

export type UseBulkUpdateNpcRosterStatusOptions = {
  campaignId: string
}

function createSkippedApplyResult(rows: CampaignNpcListItem[]): BulkRosterStatusApplyResult {
  return {
    updatedIds: [],
    failedIds: [],
    unchangedIds: rows.map((row) => row.character.id),
    summary: null,
    fullSuccess: false,
    updates: [],
  }
}

export function useBulkUpdateNpcRosterStatus({ campaignId }: UseBulkUpdateNpcRosterStatusOptions) {
  const queryClient = useQueryClient()
  const [pending, setPending] = useState(false)
  const [resultSummary, setResultSummary] = useState<string | null>(null)
  const pendingRef = useRef(false)

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
    async (
      rows: CampaignNpcListItem[],
      formValues: CharacterBulkRosterFormValues,
    ): Promise<BulkRosterStatusApplyResult> => {
      if (pendingRef.current) {
        return createSkippedApplyResult(rows)
      }

      pendingRef.current = true
      setPending(true)
      setResultSummary(null)

      try {
        const result = await executeBulkRosterStatusApply(rows, formValues, campaignId)

        result.updates.forEach((update) => {
          updateCachedNpc(mapNpcDetailToListItem(update.npcDetail))
        })

        setResultSummary(result.summary)
        return result
      } catch (err) {
        const message = getErrorMessage(err, 'Could not update roster status.')
        setResultSummary(message)
        return {
          ...createSkippedApplyResult(rows),
          failedIds: rows.map((row) => row.character.id),
          summary: message,
        }
      } finally {
        pendingRef.current = false
        setPending(false)
      }
    },
    [campaignId, updateCachedNpc],
  )

  return {
    apply,
    pending,
    resultSummary,
  }
}
