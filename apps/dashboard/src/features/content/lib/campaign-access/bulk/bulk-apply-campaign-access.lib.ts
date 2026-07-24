import {
  applyBulkCampaignAccessOperations,
  isBulkCampaignAccessNoOp,
  type BulkCampaignAccessFormValues,
  type ContentTypeKey,
  type ContentUsageBlocker,
  type ResolvedContentCampaignAccess,
  type WithCampaignAccess,
} from '@rpg/contracts'

import { updateRouteContentCampaignAccess } from '../campaign-access-api'
import {
  formatBulkCampaignAccessFullSuccess,
  formatBulkCampaignAccessPartialSuccess,
} from '../campaign-access-labels'
import type { ContentBase } from '../../overview/content-table-config'

const BULK_UPDATE_CONCURRENCY = 5

export type BulkUpdateRow = WithCampaignAccess<ContentBase & { id: string }>

export type BulkCampaignAccessApplyResult = {
  updatedIds: string[]
  blockedIds: string[]
  failedIds: string[]
  unchangedIds: string[]
  summary: string | null
  fullSuccess: boolean
  firstBlockedBlockers: ContentUsageBlocker[] | null
  updates: Array<{ rowId: string; campaignAccess: ResolvedContentCampaignAccess }>
}

type BulkApplyOutcome =
  | { rowId: string; status: 'updated'; campaignAccess: ResolvedContentCampaignAccess }
  | { rowId: string; status: 'blocked'; blockers: ContentUsageBlocker[] }
  | { rowId: string; status: 'failed' }

function partitionApplicableRows(rows: BulkUpdateRow[], formValues: BulkCampaignAccessFormValues) {
  const unchangedIds: string[] = []
  const applicableRows = rows.filter((row) => {
    if (isBulkCampaignAccessNoOp(row.campaignAccess, formValues)) {
      unchangedIds.push(row.id)
      return false
    }
    return true
  })

  return { applicableRows, unchangedIds }
}

async function applyRowsWithConcurrency(
  rows: BulkUpdateRow[],
  formValues: BulkCampaignAccessFormValues,
  campaignId: string,
  contentTypeKey: ContentTypeKey,
) {
  const outcomes: BulkApplyOutcome[] = []

  for (let index = 0; index < rows.length; index += BULK_UPDATE_CONCURRENCY) {
    const batch = rows.slice(index, index + BULK_UPDATE_CONCURRENCY)
    const batchResults = await Promise.allSettled(
      batch.map(async (row) => {
        const patch = applyBulkCampaignAccessOperations(row.campaignAccess, formValues)
        const result = await updateRouteContentCampaignAccess(
          campaignId,
          contentTypeKey,
          row.id,
          patch,
        )
        return { rowId: row.id, result }
      }),
    )

    for (let batchIndex = 0; batchIndex < batchResults.length; batchIndex += 1) {
      const settled = batchResults[batchIndex]!
      const row = batch[batchIndex]!

      if (settled.status === 'rejected') {
        outcomes.push({ rowId: row.id, status: 'failed' })
        continue
      }

      const { rowId, result } = settled.value
      if (result.status === 'updated') {
        outcomes.push({ rowId, status: 'updated', campaignAccess: result.campaignAccess })
      } else {
        outcomes.push({ rowId, status: 'blocked', blockers: result.blockers })
      }
    }
  }

  return outcomes
}

function aggregateBulkApplyOutcomes(outcomes: BulkApplyOutcome[]) {
  const updatedIds: string[] = []
  const blockedIds: string[] = []
  const failedIds: string[] = []
  let firstBlockedBlockers: ContentUsageBlocker[] | null = null

  for (const outcome of outcomes) {
    if (outcome.status === 'updated') {
      updatedIds.push(outcome.rowId)
      continue
    }

    if (outcome.status === 'blocked') {
      blockedIds.push(outcome.rowId)
      firstBlockedBlockers ??= outcome.blockers
      continue
    }

    failedIds.push(outcome.rowId)
  }

  const summary =
    blockedIds.length > 0
      ? formatBulkCampaignAccessPartialSuccess(updatedIds.length, blockedIds.length)
      : updatedIds.length > 0
        ? formatBulkCampaignAccessFullSuccess(updatedIds.length)
        : null

  return {
    updatedIds,
    blockedIds,
    failedIds,
    summary,
    firstBlockedBlockers,
    fullSuccess: updatedIds.length > 0 && blockedIds.length === 0 && failedIds.length === 0,
  }
}

export async function executeBulkCampaignAccessApply(
  rows: BulkUpdateRow[],
  formValues: BulkCampaignAccessFormValues,
  campaignId: string,
  contentTypeKey: ContentTypeKey,
): Promise<BulkCampaignAccessApplyResult> {
  const { applicableRows, unchangedIds } = partitionApplicableRows(rows, formValues)
  const outcomes = await applyRowsWithConcurrency(
    applicableRows,
    formValues,
    campaignId,
    contentTypeKey,
  )
  const aggregated = aggregateBulkApplyOutcomes(outcomes)

  return {
    ...aggregated,
    unchangedIds,
    updates: outcomes
      .filter((outcome): outcome is Extract<BulkApplyOutcome, { status: 'updated' }> => {
        return outcome.status === 'updated'
      })
      .map((outcome) => ({
        rowId: outcome.rowId,
        campaignAccess: outcome.campaignAccess,
      })),
  }
}

export function collectUpdatedCampaignAccess(
  outcomes: BulkApplyOutcome[],
): Array<{ rowId: string; campaignAccess: ResolvedContentCampaignAccess }> {
  return outcomes
    .filter((outcome): outcome is Extract<BulkApplyOutcome, { status: 'updated' }> => {
      return outcome.status === 'updated'
    })
    .map((outcome) => ({
      rowId: outcome.rowId,
      campaignAccess: outcome.campaignAccess,
    }))
}
