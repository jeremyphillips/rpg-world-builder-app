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
import { notifyBulkCampaignAccessResult } from '@/lib/notify'
import { contentOverviewListQueryKey } from '../../overview/content-overview-query-keys'

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
  const [blockedOpen, setBlockedOpen] = useState(false)
  const [blockers, setBlockers] = useState<ContentUsageBlocker[]>([])
  const pendingRef = useRef(false)

  const updateCachedAccess = useCallback(
    (entityId: string, nextAccess: ResolvedContentCampaignAccess) => {
      queryClient.setQueryData<BulkUpdateRow[]>(
        contentOverviewListQueryKey(campaignId, contentTypeKey),
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

        notifyBulkCampaignAccessResult(result)

        if (result.firstBlockedBlockers) {
          setBlockers(result.firstBlockedBlockers)
          setBlockedOpen(true)
        }

        return result
      } catch (err) {
        const message = getErrorMessage(err, 'Could not update campaign access.')
        const failureResult = {
          ...createSkippedApplyResult(rows),
          failedIds: rows.map((row) => row.id),
          summary: message,
        }
        notifyBulkCampaignAccessResult(failureResult)
        return failureResult
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
    blockedOpen,
    blockers,
    setBlockedOpen,
  }
}

export type { BulkCampaignAccessApplyResult } from './bulk-apply-campaign-access.lib'
