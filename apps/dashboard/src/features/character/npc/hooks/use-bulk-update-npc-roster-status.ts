'use client'

import { useCallback, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  getErrorMessage,
  type CharacterBulkRosterFormValues,
  type NpcCharacter,
} from '@rpg/contracts'

import { npcsQueryKey } from '../hooks/use-npcs'
import {
  executeBulkRosterStatusApply,
  type BulkRosterStatusApplyResult,
} from '../lib/bulk/execute-bulk-roster-status-apply.lib'

export type UseBulkUpdateNpcRosterStatusOptions = {
  campaignId: string
}

function createSkippedApplyResult(rows: NpcCharacter[]): BulkRosterStatusApplyResult {
  return {
    updatedIds: [],
    failedIds: [],
    unchangedIds: rows.map((row) => row.id),
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
    (npc: NpcCharacter) => {
      queryClient.setQueryData<NpcCharacter[]>(npcsQueryKey(campaignId), (current) =>
        current?.map((row) => (row.id === npc.id ? npc : row)),
      )
      queryClient.setQueryData<NpcCharacter>(['campaigns', campaignId, 'npcs', npc.id], npc)
    },
    [campaignId, queryClient],
  )

  const apply = useCallback(
    async (
      rows: NpcCharacter[],
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
          updateCachedNpc(update.npc)
        })

        setResultSummary(result.summary)
        return result
      } catch (err) {
        const message = getErrorMessage(err, 'Could not update roster status.')
        setResultSummary(message)
        return {
          ...createSkippedApplyResult(rows),
          failedIds: rows.map((row) => row.id),
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
