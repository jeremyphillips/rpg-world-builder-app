import {
  getVocabularySetCapability,
  isApiError,
  type ContentUsageBlocker,
  type VocabularyOptionSetId,
  type VocabularyOptionStatus,
  type VocabularyOptionWithUsage,
} from '@rpg/contracts'

import { fetchVocabularyDisableAvailability, updateVocabularyEntry } from '@/features/vocabulary'

import {
  formatBulkVocabularyAvailabilityFullSuccess,
  formatBulkVocabularyAvailabilityPartialSuccess,
} from '../../labels'

export const VOCABULARY_BULK_UPDATE_CONCURRENCY = 5

export type BulkVocabularyAvailabilityBlockedResult = {
  rowId: string
  label: string
  blockers: ContentUsageBlocker[]
}

export type BulkVocabularyAvailabilityApplyResult = {
  updatedIds: string[]
  blockedResults: BulkVocabularyAvailabilityBlockedResult[]
  failedIds: string[]
  unchangedIds: string[]
  summary: string | null
  hasBlocked: boolean
  hasFailed: boolean
  fullSuccess: boolean
}

type BulkApplyOutcome =
  | { rowId: string; status: 'updated' }
  | { rowId: string; status: 'blocked'; label: string; blockers: ContentUsageBlocker[] }
  | { rowId: string; status: 'failed' }

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

async function applyVocabularyAvailabilityRow(input: {
  campaignId: string
  setId: VocabularyOptionSetId
  row: VocabularyOptionWithUsage
  status: VocabularyOptionStatus
}): Promise<BulkApplyOutcome> {
  const capability = getVocabularySetCapability(input.setId)

  if (input.status === 'disabled' && capability.disableGuard && input.row.status === 'active') {
    const availability = await fetchVocabularyDisableAvailability(
      input.campaignId,
      input.setId,
      input.row.id,
    )
    if (availability.status === 'blocked') {
      return {
        rowId: input.row.id,
        status: 'blocked',
        label: input.row.label,
        blockers: availability.blockers,
      }
    }
  }

  try {
    await updateVocabularyEntry(input.campaignId, input.setId, input.row.id, {
      status: input.status,
    })
    return { rowId: input.row.id, status: 'updated' }
  } catch (err) {
    const blockers = parsePatchBlockedError(err)
    if (blockers) {
      return {
        rowId: input.row.id,
        status: 'blocked',
        label: input.row.label,
        blockers,
      }
    }
    return { rowId: input.row.id, status: 'failed' }
  }
}

async function applyRowsWithConcurrency(
  rows: VocabularyOptionWithUsage[],
  status: VocabularyOptionStatus,
  campaignId: string,
  setId: VocabularyOptionSetId,
): Promise<BulkApplyOutcome[]> {
  const outcomes: BulkApplyOutcome[] = []

  for (let index = 0; index < rows.length; index += VOCABULARY_BULK_UPDATE_CONCURRENCY) {
    const batch = rows.slice(index, index + VOCABULARY_BULK_UPDATE_CONCURRENCY)
    const batchResults = await Promise.all(
      batch.map((row) => applyVocabularyAvailabilityRow({ campaignId, setId, row, status })),
    )
    outcomes.push(...batchResults)
  }

  return outcomes
}

function aggregateBulkApplyOutcomes(
  outcomes: BulkApplyOutcome[],
  unchangedIds: string[],
): BulkVocabularyAvailabilityApplyResult {
  const updatedIds: string[] = []
  const blockedResults: BulkVocabularyAvailabilityBlockedResult[] = []
  const failedIds: string[] = []

  for (const outcome of outcomes) {
    if (outcome.status === 'updated') {
      updatedIds.push(outcome.rowId)
      continue
    }
    if (outcome.status === 'blocked') {
      blockedResults.push({
        rowId: outcome.rowId,
        label: outcome.label,
        blockers: outcome.blockers,
      })
      continue
    }
    failedIds.push(outcome.rowId)
  }

  const hasBlocked = blockedResults.length > 0
  const hasFailed = failedIds.length > 0
  const summary =
    hasBlocked || hasFailed
      ? formatBulkVocabularyAvailabilityPartialSuccess(
          updatedIds.length,
          blockedResults.length,
          failedIds.length,
        )
      : updatedIds.length > 0
        ? formatBulkVocabularyAvailabilityFullSuccess(updatedIds.length)
        : null

  return {
    updatedIds,
    blockedResults,
    failedIds,
    unchangedIds,
    summary,
    hasBlocked,
    hasFailed,
    fullSuccess: updatedIds.length > 0 && !hasBlocked && !hasFailed,
  }
}

export function createSkippedBulkVocabularyAvailabilityResult(
  unchangedIds: string[],
): BulkVocabularyAvailabilityApplyResult {
  return {
    updatedIds: [],
    blockedResults: [],
    failedIds: [],
    unchangedIds,
    summary: null,
    hasBlocked: false,
    hasFailed: false,
    fullSuccess: false,
  }
}

export async function executeBulkVocabularyAvailabilityApply(input: {
  campaignId: string
  setId: VocabularyOptionSetId
  selectedRows: VocabularyOptionWithUsage[]
  status: VocabularyOptionStatus
}): Promise<BulkVocabularyAvailabilityApplyResult> {
  const unchangedIds = input.selectedRows
    .filter((row) => row.status === input.status)
    .map((row) => row.id)
  const applicableRows = input.selectedRows.filter((row) => row.status !== input.status)

  if (applicableRows.length === 0) {
    return createSkippedBulkVocabularyAvailabilityResult(unchangedIds)
  }

  const outcomes = await applyRowsWithConcurrency(
    applicableRows,
    input.status,
    input.campaignId,
    input.setId,
  )

  return aggregateBulkApplyOutcomes(outcomes, unchangedIds)
}
