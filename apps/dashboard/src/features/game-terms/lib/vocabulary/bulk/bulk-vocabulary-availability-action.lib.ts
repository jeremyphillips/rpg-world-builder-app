import {
  createEligibleActionTarget,
  getErrorMessage,
  getVocabularySetCapability,
  isApiError,
  mapVocabularyDisableAvailabilityBatchResponse,
  type ActionApplyOutcome,
  type ActionTargetFailure,
  type ActionTargetIdentity,
  type ActionValidationResult,
  type ContentUsageBlocker,
  type VocabularyOptionSetId,
  type VocabularyOptionStatus,
  type VocabularyOptionWithUsage,
} from '@rpg/contracts'

import {
  createBatchValidateStrategy,
  mergeBatchValidationTargets,
  resolveActionBatchValidationForLifecycle,
} from '@/lib/actions'
import {
  fetchVocabularyDisableAvailabilityBatch,
  updateVocabularyEntry,
} from '@/features/vocabulary'

export const VOCABULARY_BULK_UPDATE_CONCURRENCY = 5

export function vocabularyAvailabilityRequiresValidation(
  setId: VocabularyOptionSetId,
  status: VocabularyOptionStatus,
): boolean {
  const capability = getVocabularySetCapability(setId)
  return status === 'disabled' && capability.disableGuard
}

export function resolveVocabularyAvailabilityApplicableRows(
  rows: readonly VocabularyOptionWithUsage[],
  status: VocabularyOptionStatus,
): VocabularyOptionWithUsage[] {
  return rows.filter((row) => row.status !== status)
}

function toTargetIdentity(row: VocabularyOptionWithUsage): ActionTargetIdentity {
  return { targetId: row.id, targetName: row.label }
}

function parsePatchBlockedError(err: unknown): ContentUsageBlocker[] | null {
  if (!isApiError(err) || err.status !== 409 || err.code !== 'in_use') {
    return null
  }

  const details = err.details
  if (typeof details !== 'object' || details === null || !('blockers' in details)) {
    return null
  }

  const blockers = (details as { blockers?: unknown }).blockers
  return Array.isArray(blockers) ? (blockers as ContentUsageBlocker[]) : null
}

export async function validateBulkVocabularyAvailability(
  rows: readonly VocabularyOptionWithUsage[],
  status: VocabularyOptionStatus,
  campaignId: string,
  setId: VocabularyOptionSetId,
): Promise<ActionValidationResult<ContentUsageBlocker>> {
  const applicableRows = resolveVocabularyAvailabilityApplicableRows(rows, status)
  const targetNamesById = new Map(applicableRows.map((row) => [row.id, row.label] as const))

  if (!vocabularyAvailabilityRequiresValidation(setId, status)) {
    return mergeBatchValidationTargets(
      applicableRows.map((row) => ({ targetId: row.id })),
      new Map(
        applicableRows.map((row) => [row.id, createEligibleActionTarget(toTargetIdentity(row))]),
      ),
      { targets: [] },
    )
  }

  const strategy = createBatchValidateStrategy<
    VocabularyOptionWithUsage,
    Awaited<ReturnType<typeof fetchVocabularyDisableAvailabilityBatch>>,
    ContentUsageBlocker
  >({
    getTargetId: (row) => row.id,
    fetchBatch: (validationRows) =>
      fetchVocabularyDisableAvailabilityBatch(
        campaignId,
        setId,
        validationRows.map((row) => row.id),
      ),
    mapResponse: (requestedIds, response) =>
      mapVocabularyDisableAvailabilityBatchResponse(requestedIds, response),
    batchFailureMessage: 'Could not check vocabulary disable availability.',
  })

  const batchResult = await strategy.validate(applicableRows)

  resolveActionBatchValidationForLifecycle(batchResult, targetNamesById)

  return mergeBatchValidationTargets(
    applicableRows.map((row) => ({ targetId: row.id })),
    new Map(),
    batchResult.validation,
  )
}

export async function applyBulkVocabularyAvailabilityToTargets(
  rows: readonly VocabularyOptionWithUsage[],
  targetIds: readonly string[],
  status: VocabularyOptionStatus,
  campaignId: string,
  setId: VocabularyOptionSetId,
): Promise<ActionApplyOutcome<ContentUsageBlocker, ActionTargetFailure>[]> {
  const targetIdSet = new Set(targetIds)
  const applicableRows = rows.filter((row) => targetIdSet.has(row.id) && row.status !== status)

  if (applicableRows.length === 0) {
    return []
  }

  const outcomes: ActionApplyOutcome<ContentUsageBlocker, ActionTargetFailure>[] = []

  for (let index = 0; index < applicableRows.length; index += VOCABULARY_BULK_UPDATE_CONCURRENCY) {
    const batch = applicableRows.slice(index, index + VOCABULARY_BULK_UPDATE_CONCURRENCY)
    const batchResults = await Promise.allSettled(
      batch.map(async (row) => {
        await updateVocabularyEntry(campaignId, setId, row.id, { status })
        return row.id
      }),
    )

    for (let batchIndex = 0; batchIndex < batchResults.length; batchIndex += 1) {
      const settled = batchResults[batchIndex]!
      const row = batch[batchIndex]!

      if (settled.status === 'fulfilled') {
        outcomes.push({ status: 'updated', targetId: settled.value })
        continue
      }

      const blockers = parsePatchBlockedError(settled.reason)
      if (blockers) {
        outcomes.push({ status: 'blocked', targetId: row.id, blockers })
        continue
      }

      outcomes.push({
        status: 'failed',
        targetId: row.id,
        failure: {
          code: 'request_error',
          message: getErrorMessage(settled.reason, 'Could not update vocabulary availability.'),
        },
      })
    }
  }

  return outcomes
}
