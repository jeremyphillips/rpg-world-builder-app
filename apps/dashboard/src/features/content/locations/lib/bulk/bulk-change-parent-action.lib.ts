import {
  ACTION_PLAN_UNCHANGED_REASONS,
  createBlockedActionTarget,
  createEligibleActionTarget,
  createActionValidationResult,
  getErrorMessage,
  inferLocationParentAssignmentBlockerFromMessage,
  isApiError,
  isLocationParentAssignmentBlockerCode,
  LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES,
  validateLocationParentAssignment,
  type ActionApplyOutcome,
  type ActionPlanResult,
  type ActionPlanUnchangedReason,
  type ActionTargetFailure,
  type ActionTargetIdentity,
  type ActionValidationResult,
  type Location,
  type LocationKind,
  type LocationParentAssignmentBlocker,
} from '@rpg/contracts'

import { updateContent } from '../../../lib/list/content-client'
import { buildLocationHierarchyGraph } from '../build-location-hierarchy-graph'
import type { BulkChangeParentConfig } from './build-bulk-change-parent-fields'

const BULK_UPDATE_CONCURRENCY = 5

export type BulkChangeParentRow = {
  id: string
  name: string
  kind: LocationKind
  parentLocationId?: string
}

function toTargetIdentity(row: BulkChangeParentRow): ActionTargetIdentity {
  return { targetId: row.id, targetName: row.name }
}

export function isBulkChangeParentNoOp(
  row: BulkChangeParentRow,
  config: BulkChangeParentConfig,
): boolean {
  const currentParentId = row.parentLocationId ?? null
  return currentParentId === config.proposedParentId
}

export function resolveBulkChangeParentUnchangedReason(
  _row: BulkChangeParentRow,
  config: BulkChangeParentConfig,
): ActionPlanUnchangedReason {
  if (config.proposedParentId === null) {
    return ACTION_PLAN_UNCHANGED_REASONS.already_top_level
  }

  return ACTION_PLAN_UNCHANGED_REASONS.already_target_parent
}

export function buildBulkChangeParentPlan(
  rows: readonly BulkChangeParentRow[],
  config: BulkChangeParentConfig,
): ActionPlanResult {
  return {
    targets: rows.map((row) => {
      if (isBulkChangeParentNoOp(row, config)) {
        return {
          status: 'unchanged' as const,
          targetId: row.id,
          targetName: row.name,
          reason: resolveBulkChangeParentUnchangedReason(row, config),
        }
      }

      return {
        status: 'wouldChange' as const,
        targetId: row.id,
        targetName: row.name,
      }
    }),
  }
}

export function resolveBulkChangeParentApplicableRows(
  rows: readonly BulkChangeParentRow[],
  config: BulkChangeParentConfig,
): BulkChangeParentRow[] {
  return rows.filter((row) => !isBulkChangeParentNoOp(row, config))
}

export function validateBulkChangeParent(
  rows: readonly BulkChangeParentRow[],
  config: BulkChangeParentConfig,
  campaignLocations: readonly Location[],
): ActionValidationResult<LocationParentAssignmentBlocker> {
  const applicableRows = resolveBulkChangeParentApplicableRows(rows, config)
  const locationsById = buildLocationHierarchyGraph(campaignLocations)

  const targets = applicableRows.map((row) => {
    const blockers = validateLocationParentAssignment({
      locationId: row.id,
      locationKind: row.kind,
      proposedParentId: config.proposedParentId,
      locationsById,
    })

    if (blockers.length > 0) {
      return createBlockedActionTarget(toTargetIdentity(row), blockers)
    }

    return createEligibleActionTarget(toTargetIdentity(row))
  })

  return createActionValidationResult(targets)
}

function parsePatchHierarchyBlockedError(err: unknown): LocationParentAssignmentBlocker[] | null {
  if (!isApiError(err) || err.status !== 400) {
    return null
  }

  if (err.code !== 'invalid_hierarchy' && err.code !== 'invalid_parent') {
    return null
  }

  const details = err.details
  const blockerCodeFromApi =
    typeof details === 'object' && details !== null && 'blockerCode' in details
      ? (details as { blockerCode?: unknown }).blockerCode
      : undefined

  if (
    typeof blockerCodeFromApi === 'string' &&
    isLocationParentAssignmentBlockerCode(blockerCodeFromApi)
  ) {
    return [{ kind: 'rule', code: blockerCodeFromApi, message: err.message }]
  }

  if (err.code === 'invalid_parent') {
    return [
      {
        kind: 'rule',
        code: LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.parent_not_found,
        message: err.message,
      },
    ]
  }

  return [inferLocationParentAssignmentBlockerFromMessage(err.message)]
}

export type BulkChangeParentApplyUpdate = {
  rowId: string
  parentLocationId: string | undefined
}

export async function applyBulkChangeParentToTargets(
  rows: readonly BulkChangeParentRow[],
  targetIds: readonly string[],
  config: BulkChangeParentConfig,
  campaignId: string,
): Promise<{
  outcomes: ActionApplyOutcome<LocationParentAssignmentBlocker, ActionTargetFailure>[]
  updates: BulkChangeParentApplyUpdate[]
}> {
  const targetIdSet = new Set(targetIds)
  const applicableRows = rows.filter(
    (row) => targetIdSet.has(row.id) && !isBulkChangeParentNoOp(row, config),
  )

  if (applicableRows.length === 0) {
    return { outcomes: [], updates: [] }
  }

  const patchBody =
    config.proposedParentId === null
      ? { parentLocationId: null }
      : { parentLocationId: config.proposedParentId }

  const outcomes: ActionApplyOutcome<LocationParentAssignmentBlocker, ActionTargetFailure>[] = []
  const updates: BulkChangeParentApplyUpdate[] = []

  for (let index = 0; index < applicableRows.length; index += BULK_UPDATE_CONCURRENCY) {
    const batch = applicableRows.slice(index, index + BULK_UPDATE_CONCURRENCY)
    const batchResults = await Promise.allSettled(
      batch.map(async (row) => {
        await updateContent(campaignId, 'locations', row.id, {
          kind: row.kind,
          ...patchBody,
        })
        return row
      }),
    )

    for (let batchIndex = 0; batchIndex < batchResults.length; batchIndex += 1) {
      const settled = batchResults[batchIndex]!
      const row = batch[batchIndex]!

      if (settled.status === 'fulfilled') {
        const parentLocationId =
          config.proposedParentId === null ? undefined : config.proposedParentId
        outcomes.push({ status: 'updated', targetId: row.id })
        updates.push({ rowId: row.id, parentLocationId })
        continue
      }

      const blockers = parsePatchHierarchyBlockedError(settled.reason)
      if (blockers) {
        outcomes.push({ status: 'blocked', targetId: row.id, blockers })
        continue
      }

      outcomes.push({
        status: 'failed',
        targetId: row.id,
        failure: {
          code: 'request_error',
          message: getErrorMessage(settled.reason, 'Could not update parent location.'),
        },
      })
    }
  }

  return { outcomes, updates }
}
