import type { BulkFieldOperation } from '../../../lib/bulk-field-operation'
import {
  ACTION_PLAN_UNCHANGED_REASONS,
  type ActionPlanResult,
  type ActionPlanUnchangedReason,
  type ActionTargetIdentity,
} from '../../../lib/action-validation'
import type { ContentVisibilityMode } from '../../vocab/content-visibility'

import {
  contentCampaignAccessPatchSchema,
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  type ContentCampaignAccessPatch,
  type ResolvedContentCampaignAccess,
} from './campaign-access'

export type { BulkFieldOperation } from '../../../lib/bulk-field-operation'

export type BulkCampaignAccessFormValues = {
  available: BulkFieldOperation<boolean>
  visibilityMode: BulkFieldOperation<ContentVisibilityMode>
}

export const BULK_CAMPAIGN_ACCESS_FORM_DEFAULT: BulkCampaignAccessFormValues = {
  available: { kind: 'unchanged' },
  visibilityMode: { kind: 'unchanged' },
}

function resolveBulkField<T>(operation: BulkFieldOperation<T>, current: T, defaultValue: T): T {
  switch (operation.kind) {
    case 'unchanged':
      return current
    case 'set':
      return operation.value
    case 'reset':
      return defaultValue
  }
}

function resolvedAccessToPatch(access: ResolvedContentCampaignAccess): ContentCampaignAccessPatch {
  return {
    available: access.available,
    visibilityMode: access.visibilityMode,
    participantIds: [...access.participantIds, ...access.unavailableParticipantIds],
  }
}

function patchesEqual(a: ContentCampaignAccessPatch, b: ContentCampaignAccessPatch): boolean {
  if (a.available !== b.available || a.visibilityMode !== b.visibilityMode) {
    return false
  }

  if (a.participantIds.length !== b.participantIds.length) {
    return false
  }

  return a.participantIds.every((id, index) => id === b.participantIds[index])
}

export function applyBulkCampaignAccessOperations(
  current: ResolvedContentCampaignAccess,
  bulk: BulkCampaignAccessFormValues,
): ContentCampaignAccessPatch {
  const available = resolveBulkField(
    bulk.available,
    current.available,
    DEFAULT_CONTENT_CAMPAIGN_ACCESS.available,
  )
  const visibilityMode = resolveBulkField(
    bulk.visibilityMode,
    current.visibilityMode,
    DEFAULT_CONTENT_CAMPAIGN_ACCESS.visibilityMode,
  )
  const participantIds = [...current.participantIds, ...current.unavailableParticipantIds]

  return contentCampaignAccessPatchSchema.parse({
    available,
    visibilityMode,
    participantIds,
  })
}

export function isBulkCampaignAccessNoOp(
  current: ResolvedContentCampaignAccess,
  bulk: BulkCampaignAccessFormValues,
): boolean {
  const currentPatch = resolvedAccessToPatch(current)
  const nextPatch = applyBulkCampaignAccessOperations(current, bulk)
  return patchesEqual(currentPatch, nextPatch)
}

export function hasBulkCampaignAccessChanges(bulk: BulkCampaignAccessFormValues): boolean {
  return bulk.available.kind !== 'unchanged' || bulk.visibilityMode.kind !== 'unchanged'
}

export function countBulkCampaignAccessChanges(
  selected: ReadonlyArray<{ campaignAccess: ResolvedContentCampaignAccess }>,
  bulk: BulkCampaignAccessFormValues,
): { wouldChangeCount: number; unchangedCount: number } {
  let wouldChangeCount = 0
  let unchangedCount = 0

  for (const row of selected) {
    if (isBulkCampaignAccessNoOp(row.campaignAccess, bulk)) {
      unchangedCount += 1
    } else {
      wouldChangeCount += 1
    }
  }

  return { wouldChangeCount, unchangedCount }
}

export function resolveBulkCampaignAccessUnchangedReason(
  current: ResolvedContentCampaignAccess,
  bulk: BulkCampaignAccessFormValues,
): ActionPlanUnchangedReason {
  const availabilityTouched = bulk.available.kind !== 'unchanged'
  const visibilityTouched = bulk.visibilityMode.kind !== 'unchanged'

  if (availabilityTouched && visibilityTouched) {
    return ACTION_PLAN_UNCHANGED_REASONS.already_matches
  }

  if (availabilityTouched) {
    const nextAvailable = resolveBulkField(
      bulk.available,
      current.available,
      DEFAULT_CONTENT_CAMPAIGN_ACCESS.available,
    )

    return nextAvailable
      ? ACTION_PLAN_UNCHANGED_REASONS.already_available
      : ACTION_PLAN_UNCHANGED_REASONS.already_unavailable
  }

  return ACTION_PLAN_UNCHANGED_REASONS.already_matches
}

export function buildBulkCampaignAccessPlan(
  selected: ReadonlyArray<{ campaignAccess: ResolvedContentCampaignAccess } & ActionTargetIdentity>,
  bulk: BulkCampaignAccessFormValues,
): ActionPlanResult {
  return {
    targets: selected.map((row) => {
      if (isBulkCampaignAccessNoOp(row.campaignAccess, bulk)) {
        return {
          status: 'unchanged' as const,
          targetId: row.targetId,
          targetName: row.targetName,
          reason: resolveBulkCampaignAccessUnchangedReason(row.campaignAccess, bulk),
        }
      }

      return {
        status: 'wouldChange' as const,
        targetId: row.targetId,
        targetName: row.targetName,
      }
    }),
  }
}
