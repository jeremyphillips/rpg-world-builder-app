'use client'

import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  partitionApplyOutcomes,
  type ActionTargetFailure,
  type ActionTargetIdentity,
  type Location,
  type LocationParentAssignmentBlocker,
} from '@rpg/contracts'
import { toast } from '@rpg/ui'

import type { ActionLifecycleCloseEvent } from '@/lib/actions/action-lifecycle.types'
import { patchContentOverviewListLocationParent } from '@/features/content/lib/overview/content-overview-list-cache.lib'

import { formatBulkChangeParentSuccessToast } from './bulk-change-parent-labels'
import {
  applyBulkChangeParentToTargets,
  validateBulkChangeParent,
  type BulkChangeParentRow,
} from './bulk-change-parent-action.lib'
import type { BulkChangeParentConfig } from './build-bulk-change-parent-fields'

export type UseBulkChangeParentActionOptions = {
  campaignId: string
  rows: BulkChangeParentRow[]
  campaignLocations: readonly Location[]
}

export function useBulkChangeParentAction({
  campaignId,
  rows,
  campaignLocations,
}: UseBulkChangeParentActionOptions) {
  const queryClient = useQueryClient()

  const updateCachedParent = useCallback(
    (entityId: string, parentLocationId: string | undefined) => {
      patchContentOverviewListLocationParent(queryClient, campaignId, entityId, parentLocationId)
    },
    [campaignId, queryClient],
  )

  const validate = useCallback(
    async (_targets: readonly ActionTargetIdentity[], config: BulkChangeParentConfig) => {
      return validateBulkChangeParent(rows, config, campaignLocations)
    },
    [campaignLocations, rows],
  )

  const apply = useCallback(
    async (targetIds: readonly string[], config: BulkChangeParentConfig) => {
      const { outcomes, updates } = await applyBulkChangeParentToTargets(
        rows,
        targetIds,
        config,
        campaignId,
      )

      updates.forEach((update) => {
        try {
          updateCachedParent(update.rowId, update.parentLocationId)
        } catch {
          // Cache sync is best-effort; server state is authoritative.
        }
      })

      return outcomes
    },
    [campaignId, rows, updateCachedParent],
  )

  const notifyClose = useCallback(
    (
      event: ActionLifecycleCloseEvent<LocationParentAssignmentBlocker, ActionTargetFailure>,
      config: BulkChangeParentConfig | null,
    ) => {
      if (event.reason === 'cancel' || event.outcomes.length === 0) {
        return
      }

      const { updated, blocked } = partitionApplyOutcomes(event.outcomes)
      if (updated.length === 0) {
        return
      }

      const parentName =
        config?.proposedParentId != null
          ? campaignLocations.find((location) => location.id === config.proposedParentId)?.name
          : undefined

      const toastCopy = formatBulkChangeParentSuccessToast({
        updatedCount: updated.length,
        blockedCount: blocked.length,
        parentName,
        isClearing: config?.proposedParentId === null,
      })

      if (toastCopy.tone === 'warning') {
        toast.warning(toastCopy.title, { description: toastCopy.description })
        return
      }

      toast.success(toastCopy.title, { description: toastCopy.description })
    },
    [campaignLocations],
  )

  return {
    validate,
    apply,
    notifyClose,
  }
}

export type { BulkChangeParentRow }
