import {
  applyBulkCampaignAccessOperations,
  createActionValidationResult,
  createEligibleActionTarget,
  fetchCsrfToken,
  getErrorMessage,
  isBulkCampaignAccessNoOp,
  mapContentCampaignAccessUpdateResultToApplyOutcome,
  mapUsageGuardAvailabilityToActionTarget,
  type ActionApplyOutcome,
  type ActionTargetFailure,
  type ActionTargetIdentity,
  type ActionValidationResult,
  type BulkCampaignAccessFormValues,
  type ContentTypeKey,
  type ContentUsageBlocker,
  type ResolvedContentCampaignAccess,
} from '@rpg/contracts'

import { fanOutValidate } from '@/lib/actions/fan-out-validate'

import {
  fetchContentCampaignAccessAvailability,
  updateRouteContentCampaignAccess,
} from '../campaign-access-api'
import type { BulkUpdateRow } from './bulk-apply-campaign-access.lib'

const BULK_UPDATE_CONCURRENCY = 5

export function bulkCampaignAccessTurnsUnavailable(
  formValues: BulkCampaignAccessFormValues,
): boolean {
  return formValues.available.kind === 'set' && formValues.available.value === false
}

export function bulkCampaignAccessRowRequiresAvailabilityValidation(
  row: BulkUpdateRow,
  formValues: BulkCampaignAccessFormValues,
): boolean {
  if (!bulkCampaignAccessTurnsUnavailable(formValues)) {
    return false
  }

  if (isBulkCampaignAccessNoOp(row.campaignAccess, formValues)) {
    return false
  }

  if (!row.campaignAccess.available) {
    return false
  }

  const patch = applyBulkCampaignAccessOperations(row.campaignAccess, formValues)
  return patch.available === false
}

function toTargetIdentity(row: BulkUpdateRow): ActionTargetIdentity {
  return { targetId: row.id, targetName: row.name }
}

export function resolveBulkCampaignAccessApplicableRows(
  rows: readonly BulkUpdateRow[],
  formValues: BulkCampaignAccessFormValues,
): BulkUpdateRow[] {
  return rows.filter((row) => !isBulkCampaignAccessNoOp(row.campaignAccess, formValues))
}

export async function validateBulkCampaignAccess(
  rows: readonly BulkUpdateRow[],
  formValues: BulkCampaignAccessFormValues,
  campaignId: string,
  contentTypeKey: ContentTypeKey,
): Promise<ActionValidationResult<ContentUsageBlocker>> {
  const applicableRows = resolveBulkCampaignAccessApplicableRows(rows, formValues)

  const targets = await fanOutValidate({
    targets: applicableRows,
    validateTarget: async (row) => {
      const target = toTargetIdentity(row)

      if (!bulkCampaignAccessRowRequiresAvailabilityValidation(row, formValues)) {
        return createEligibleActionTarget(target)
      }

      const availability = await fetchContentCampaignAccessAvailability(
        campaignId,
        contentTypeKey,
        row.id,
      )

      return mapUsageGuardAvailabilityToActionTarget(target, availability)
    },
    concurrency: BULK_UPDATE_CONCURRENCY,
  })

  return createActionValidationResult(targets)
}

export type BulkCampaignAccessApplyUpdates = Array<{
  rowId: string
  campaignAccess: ResolvedContentCampaignAccess
}>

export async function applyBulkCampaignAccessToTargets(
  rows: readonly BulkUpdateRow[],
  targetIds: readonly string[],
  formValues: BulkCampaignAccessFormValues,
  campaignId: string,
  contentTypeKey: ContentTypeKey,
): Promise<{
  outcomes: ActionApplyOutcome<ContentUsageBlocker, ActionTargetFailure>[]
  updates: BulkCampaignAccessApplyUpdates
}> {
  const targetIdSet = new Set(targetIds)
  const applicableRows = rows.filter(
    (row) => targetIdSet.has(row.id) && !isBulkCampaignAccessNoOp(row.campaignAccess, formValues),
  )

  if (applicableRows.length === 0) {
    return { outcomes: [], updates: [] }
  }

  const csrfToken = await fetchCsrfToken()
  const outcomes: ActionApplyOutcome<ContentUsageBlocker, ActionTargetFailure>[] = []
  const updates: BulkCampaignAccessApplyUpdates = []

  for (let index = 0; index < applicableRows.length; index += BULK_UPDATE_CONCURRENCY) {
    const batch = applicableRows.slice(index, index + BULK_UPDATE_CONCURRENCY)
    const batchResults = await Promise.allSettled(
      batch.map(async (row) => {
        const patch = applyBulkCampaignAccessOperations(row.campaignAccess, formValues)
        const result = await updateRouteContentCampaignAccess(
          campaignId,
          contentTypeKey,
          row.id,
          patch,
          { csrfToken },
        )
        return { rowId: row.id, result }
      }),
    )

    for (let batchIndex = 0; batchIndex < batchResults.length; batchIndex += 1) {
      const settled = batchResults[batchIndex]!
      const row = batch[batchIndex]!

      if (settled.status === 'rejected') {
        outcomes.push({
          status: 'failed',
          targetId: row.id,
          failure: {
            code: 'request_error',
            message: getErrorMessage(settled.reason, 'Could not update campaign access.'),
          },
        })
        continue
      }

      const { rowId, result } = settled.value
      const outcome = mapContentCampaignAccessUpdateResultToApplyOutcome(rowId, result)
      outcomes.push(outcome)

      if (outcome.status === 'updated') {
        updates.push({
          rowId,
          campaignAccess: result.status === 'updated' ? result.campaignAccess : row.campaignAccess,
        })
      }
    }
  }

  return { outcomes, updates }
}
