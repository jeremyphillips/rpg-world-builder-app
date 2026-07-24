'use client'

import { useCallback, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  getErrorMessage,
  type BulkCampaignAccessFormValues,
  type ContentTypeKey,
  type ContentUsageBlocker,
  type ResolvedContentCampaignAccess,
} from '@rpg/contracts'

import {
  executeBulkCampaignAccessApply,
  type BulkCampaignAccessApplyResult,
  type BulkUpdateRow,
} from './bulk-apply-campaign-access.lib'

function contentListQueryKey(campaignId: string, contentTypeKey: ContentTypeKey) {
  return ['campaigns', campaignId, 'content', contentTypeKey] as const
}

export type UseBulkUpdateCampaignAccessOptions = {
  campaignId: string
  contentTypeKey: ContentTypeKey
}

function createSkippedApplyResult(rows: BulkUpdateRow[]): BulkCampaignAccessApplyResult {
  return {
    updatedIds: [],
    blockedIds: [],
    failedIds: [],
    unchangedIds: rows.map((row) => row.id),
    summary: null,
    fullSuccess: false,
    firstBlockedBlockers: null,
    updates: [],
  }
}

export function useBulkUpdateCampaignAccess({
  campaignId,
  contentTypeKey,
}: UseBulkUpdateCampaignAccessOptions) {
  const queryClient = useQueryClient()
  const [pending, setPending] = useState(false)
  const [resultSummary, setResultSummary] = useState<string | null>(null)
  const [blockedOpen, setBlockedOpen] = useState(false)
  const [blockers, setBlockers] = useState<ContentUsageBlocker[]>([])
  const pendingRef = useRef(false)

  const updateCachedAccess = useCallback(
    (entityId: string, nextAccess: ResolvedContentCampaignAccess) => {
      queryClient.setQueryData<BulkUpdateRow[]>(
        contentListQueryKey(campaignId, contentTypeKey),
        (current) =>
          current?.map((row) =>
            row.id === entityId ? { ...row, campaignAccess: nextAccess } : row,
          ),
      )
    },
    [campaignId, contentTypeKey, queryClient],
  )

  const apply = useCallback(
    async (
      rows: BulkUpdateRow[],
      formValues: BulkCampaignAccessFormValues,
    ): Promise<BulkCampaignAccessApplyResult> => {
      if (pendingRef.current) {
        return createSkippedApplyResult(rows)
      }

      pendingRef.current = true
      setPending(true)
      setResultSummary(null)

      try {
        const result = await executeBulkCampaignAccessApply(
          rows,
          formValues,
          campaignId,
          contentTypeKey,
        )

        result.updates.forEach((update) => {
          updateCachedAccess(update.rowId, update.campaignAccess)
        })

        // TODO: Show bulk campaign-access result toast when shared toast UI is available.
        setResultSummary(result.summary)

        if (result.firstBlockedBlockers) {
          setBlockers(result.firstBlockedBlockers)
          setBlockedOpen(true)
        }

        return result
      } catch (err) {
        const message = getErrorMessage(err, 'Could not update campaign access.')
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
    [campaignId, contentTypeKey, updateCachedAccess],
  )

  return {
    apply,
    pending,
    resultSummary,
    blockedOpen,
    blockers,
    setBlockedOpen,
  }
}

export type { BulkCampaignAccessApplyResult } from './bulk-apply-campaign-access.lib'
