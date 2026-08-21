import {
  applyBulkCampaignAccessOperations,
  createEligibleActionTarget,
  fetchCsrfToken,
  getErrorMessage,
  isBulkCampaignAccessNoOp,
  mapContentCampaignAccessAvailabilityBatchResponse,
  mapContentCampaignAccessUpdateResultToApplyOutcome,
  type ActionApplyOutcome,
  type ActionTargetFailure,
  type ActionTargetIdentity,
  type ActionValidationResult,
  type BulkCampaignAccessFormValues,
  type ContentTypeKey,
  type ContentUsageBlocker,
  type ResolvedContentCampaignAccess,
} from '@rpg/contracts'

import {
  createBatchValidateStrategy,
  mergeBatchValidationTargets,
  resolveActionBatchValidationForLifecycle,
} from '@/lib/actions'

import {
  fetchContentCampaignAccessAvailabilityBatch,
  updateRouteContentCampaignAccess,
} from '../campaign-access-api'
import type { ContentBase } from '../../overview/content-table-config'
import type { WithCampaignAccess } from '@rpg/contracts'

const BULK_UPDATE_CONCURRENCY = 5

export type BulkUpdateRow = WithCampaignAccess<ContentBase & { id: string }>

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
  options?: { classId?: string },
): Promise<ActionValidationResult<ContentUsageBlocker>> {
  const applicableRows = resolveBulkCampaignAccessApplicableRows(rows, formValues)
  const targetNamesById = new Map(applicableRows.map((row) => [row.id, row.name] as const))
  const preEligibleById = new Map<string, ReturnType<typeof createEligibleActionTarget>>()
  const rowsRequiringValidation: BulkUpdateRow[] = []

  for (const row of applicableRows) {
    if (!bulkCampaignAccessRowRequiresAvailabilityValidation(row, formValues)) {
      preEligibleById.set(row.id, createEligibleActionTarget(toTargetIdentity(row)))
      continue
    }

    rowsRequiringValidation.push(row)
  }

  if (rowsRequiringValidation.length === 0) {
    return mergeBatchValidationTargets(
      applicableRows.map((row) => ({ targetId: row.id })),
      preEligibleById,
      { targets: [] },
    )
  }

  const strategy = createBatchValidateStrategy<
    BulkUpdateRow,
    Awaited<ReturnType<typeof fetchContentCampaignAccessAvailabilityBatch>>,
    ContentUsageBlocker
  >({
    getTargetId: (row) => row.id,
    fetchBatch: (validationRows) =>
      fetchContentCampaignAccessAvailabilityBatch(
        campaignId,
        contentTypeKey,
        validationRows.map((row) => row.id),
        { classId: options?.classId },
      ),
    mapResponse: (requestedIds, response) =>
      mapContentCampaignAccessAvailabilityBatchResponse(requestedIds, response),
    batchFailureMessage: 'Could not check campaign access availability.',
  })

  const batchResult = await strategy.validate(rowsRequiringValidation)

  resolveActionBatchValidationForLifecycle(batchResult, targetNamesById)

  return mergeBatchValidationTargets(
    applicableRows.map((row) => ({ targetId: row.id })),
    preEligibleById,
    batchResult.validation,
  )
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
