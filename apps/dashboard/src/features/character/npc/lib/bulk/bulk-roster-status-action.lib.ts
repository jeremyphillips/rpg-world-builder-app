import {
  applyBulkRosterStatusOperations,
  getErrorMessage,
  isBulkRosterStatusNoOp,
  type ActionApplyOutcome,
  type ActionTargetFailure,
  type CampaignNpcListItem,
  type CharacterBulkRosterFormValues,
} from '@rpg/contracts'

import { patchNpcStatus } from '../../api/npc-client'
import type { CampaignNpcDetail } from '../../api/npc-client'

const BULK_UPDATE_CONCURRENCY = 5

export type BulkRosterStatusApplyUpdates = Array<{
  rowId: string
  npcDetail: CampaignNpcDetail
}>

export async function applyBulkRosterStatusToTargets(
  rows: readonly CampaignNpcListItem[],
  targetIds: readonly string[],
  formValues: CharacterBulkRosterFormValues,
  campaignId: string,
): Promise<{
  outcomes: ActionApplyOutcome<never, ActionTargetFailure>[]
  updates: BulkRosterStatusApplyUpdates
}> {
  const targetIdSet = new Set(targetIds)
  const applicableRows = rows.filter(
    (row) =>
      targetIdSet.has(row.character.id) &&
      !isBulkRosterStatusNoOp(row.participation.roster, formValues),
  )

  if (applicableRows.length === 0) {
    return { outcomes: [], updates: [] }
  }

  const outcomes: ActionApplyOutcome<never, ActionTargetFailure>[] = []
  const updates: BulkRosterStatusApplyUpdates = []

  for (let index = 0; index < applicableRows.length; index += BULK_UPDATE_CONCURRENCY) {
    const batch = applicableRows.slice(index, index + BULK_UPDATE_CONCURRENCY)
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
        outcomes.push({
          status: 'failed',
          targetId: row.character.id,
          failure: {
            code: 'request_error',
            message: getErrorMessage(settled.reason, 'Could not update roster status.'),
          },
        })
        continue
      }

      outcomes.push({ status: 'updated', targetId: settled.value.rowId })
      updates.push(settled.value)
    }
  }

  return { outcomes, updates }
}
