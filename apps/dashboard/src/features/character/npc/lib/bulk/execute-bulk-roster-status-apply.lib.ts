import {
  applyBulkRosterStatusOperations,
  isBulkRosterStatusNoOp,
  type CampaignNpcListItem,
  type CharacterBulkRosterFormValues,
} from '@rpg/contracts'

import { mapNpcDetailToListItem, patchNpcStatus } from '../../api/npc-client'
import type { CampaignNpcDetail } from '../../api/npc-client'

const BULK_UPDATE_CONCURRENCY = 5

export type BulkRosterStatusApplyResult = {
  updatedIds: string[]
  failedIds: string[]
  unchangedIds: string[]
  summary: string | null
  fullSuccess: boolean
  updates: Array<{ rowId: string; npcDetail: CampaignNpcDetail }>
}

type BulkApplyOutcome =
  | { rowId: string; status: 'updated'; npcDetail: CampaignNpcDetail }
  | { rowId: string; status: 'failed' }

function partitionApplicableRows(
  rows: CampaignNpcListItem[],
  formValues: CharacterBulkRosterFormValues,
) {
  const unchangedIds: string[] = []
  const applicableRows = rows.filter((row) => {
    if (isBulkRosterStatusNoOp(row.participation.roster, formValues)) {
      unchangedIds.push(row.character.id)
      return false
    }
    return true
  })

  return { applicableRows, unchangedIds }
}

function formatBulkRosterStatusFullSuccess(count: number) {
  return `Updated roster status for ${count} NPC${count === 1 ? '' : 's'}.`
}

function formatBulkRosterStatusPartialSuccess(updatedCount: number, failedCount: number) {
  return `Updated ${updatedCount} NPC${updatedCount === 1 ? '' : 's'}. ${failedCount} failed.`
}

async function applyRowsWithConcurrency(
  rows: CampaignNpcListItem[],
  formValues: CharacterBulkRosterFormValues,
  campaignId: string,
) {
  const outcomes: BulkApplyOutcome[] = []

  for (let index = 0; index < rows.length; index += BULK_UPDATE_CONCURRENCY) {
    const batch = rows.slice(index, index + BULK_UPDATE_CONCURRENCY)
    const batchResults = await Promise.allSettled(
      batch.map(async (row) => {
        const rosterPatch = applyBulkRosterStatusOperations(row.participation.roster, formValues)
        const npcDetail = await patchNpcStatus(campaignId, row.character.id, {
          roster: rosterPatch,
        })
        return { rowId: row.character.id, npcDetail }
      }),
    )

    for (let batchIndex = 0; batchIndex < batchResults.length; batchIndex += 1) {
      const settled = batchResults[batchIndex]!
      const row = batch[batchIndex]!

      if (settled.status === 'rejected') {
        outcomes.push({ rowId: row.character.id, status: 'failed' })
        continue
      }

      outcomes.push({
        rowId: settled.value.rowId,
        status: 'updated',
        npcDetail: settled.value.npcDetail,
      })
    }
  }

  return outcomes
}

export async function executeBulkRosterStatusApply(
  rows: CampaignNpcListItem[],
  formValues: CharacterBulkRosterFormValues,
  campaignId: string,
): Promise<BulkRosterStatusApplyResult> {
  const { applicableRows, unchangedIds } = partitionApplicableRows(rows, formValues)
  const outcomes = await applyRowsWithConcurrency(applicableRows, formValues, campaignId)

  const updatedIds: string[] = []
  const failedIds: string[] = []

  for (const outcome of outcomes) {
    if (outcome.status === 'updated') {
      updatedIds.push(outcome.rowId)
    } else {
      failedIds.push(outcome.rowId)
    }
  }

  const summary =
    failedIds.length > 0
      ? formatBulkRosterStatusPartialSuccess(updatedIds.length, failedIds.length)
      : updatedIds.length > 0
        ? formatBulkRosterStatusFullSuccess(updatedIds.length)
        : null

  return {
    updatedIds,
    failedIds,
    unchangedIds,
    summary,
    fullSuccess: updatedIds.length > 0 && failedIds.length === 0,
    updates: outcomes
      .filter((outcome): outcome is Extract<BulkApplyOutcome, { status: 'updated' }> => {
        return outcome.status === 'updated'
      })
      .map((outcome) => ({ rowId: outcome.rowId, npcDetail: outcome.npcDetail })),
  }
}

export { mapNpcDetailToListItem }
