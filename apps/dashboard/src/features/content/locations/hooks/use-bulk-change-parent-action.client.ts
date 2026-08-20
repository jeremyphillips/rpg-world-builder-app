'use client'

import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  type ActionTargetFailure,
  type ActionTargetIdentity,
  type Location,
  type LocationParentAssignmentBlocker,
} from '@rpg/contracts'

import { notifyActionOutcomes } from '@/lib/actions/action-outcome-notify.lib'
import type { ActionLifecycleCloseEvent } from '@/lib/actions/action-lifecycle.types'
import { patchContentOverviewListLocationParent } from '@/features/content/lib/overview/content-overview-list-cache.lib'

import { invalidateLocationHierarchyQueries } from '../lib/invalidate-location-hierarchy-queries'
import { formatBulkChangeParentSuccessToast } from '../lib/bulk/bulk-change-parent-labels'
import {
  applyBulkChangeParentToTargets,
  validateBulkChangeParent,
  type BulkChangeParentRow,
} from '../lib/bulk/bulk-change-parent-action.lib'
import type { BulkChangeParentConfig } from '../lib/bulk/build-bulk-change-parent-fields'

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
    async (subjectIds: readonly string[], config: BulkChangeParentConfig) => {
      const { outcomes, updates } = await applyBulkChangeParentToTargets(
        rows,
        subjectIds,
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

      if (updates.length > 0) {
        invalidateLocationHierarchyQueries(queryClient, campaignId)
      }

      return outcomes
    },
    [campaignId, queryClient, rows, updateCachedParent],
  )

  const notifyClose = useCallback(
    (
      event: ActionLifecycleCloseEvent<LocationParentAssignmentBlocker, ActionTargetFailure>,
      config: BulkChangeParentConfig | null,
    ) => {
      const parentName =
        config?.proposedParentId != null
          ? campaignLocations.find((location) => location.id === config.proposedParentId)?.name
          : undefined

      notifyActionOutcomes({
        outcomes: event.outcomes,
        closeReason: event.reason,
        nounPlural: 'locations',
        nounSingular: 'location',
        formatSuccess: (updatedCount) =>
          formatBulkChangeParentSuccessToast({
            updatedCount,
            blockedCount: 0,
            parentName,
            isClearing: config?.proposedParentId === null,
          }).title,
      })
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
