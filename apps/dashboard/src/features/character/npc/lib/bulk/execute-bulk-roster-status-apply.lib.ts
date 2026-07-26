import {
  applyBulkRosterStatusOperations,
  isBulkRosterStatusNoOp,
  type CharacterBulkRosterFormValues,
  type NpcCharacter,
} from '@rpg/contracts'

import { patchNpcLifecycle } from '../../api/npc-client'

const BULK_UPDATE_CONCURRENCY = 5

export type BulkRosterStatusApplyResult = {
  updatedIds: string[]
  failedIds: string[]
  unchangedIds: string[]
  summary: string | null
  fullSuccess: boolean
  updates: Array<{ rowId: string; npc: NpcCharacter }>
}

type BulkApplyOutcome =
  | { rowId: string; status: 'updated'; npc: NpcCharacter }
  | { rowId: string; status: 'failed' }

function partitionApplicableRows(rows: NpcCharacter[], formValues: CharacterBulkRosterFormValues) {
  const unchangedIds: string[] = []
  const applicableRows = rows.filter((row) => {
    if (isBulkRosterStatusNoOp(row.lifecycle, formValues)) {
      unchangedIds.push(row.id)
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
  rows: NpcCharacter[],
  formValues: CharacterBulkRosterFormValues,
  campaignId: string,
) {
  const outcomes: BulkApplyOutcome[] = []

  for (let index = 0; index < rows.length; index += BULK_UPDATE_CONCURRENCY) {
    const batch = rows.slice(index, index + BULK_UPDATE_CONCURRENCY)
    const batchResults = await Promise.allSettled(
      batch.map(async (row) => {
        const patch = applyBulkRosterStatusOperations(row.lifecycle, formValues)
        const npc = await patchNpcLifecycle(campaignId, row.id, patch)
        return { rowId: row.id, npc }
      }),
    )

    for (let batchIndex = 0; batchIndex < batchResults.length; batchIndex += 1) {
      const settled = batchResults[batchIndex]!
      const row = batch[batchIndex]!

      if (settled.status === 'rejected') {
        outcomes.push({ rowId: row.id, status: 'failed' })
        continue
      }

      outcomes.push({ rowId: settled.value.rowId, status: 'updated', npc: settled.value.npc })
    }
  }

  return outcomes
}

export async function executeBulkRosterStatusApply(
  rows: NpcCharacter[],
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
      .map((outcome) => ({ rowId: outcome.rowId, npc: outcome.npc })),
  }
}
