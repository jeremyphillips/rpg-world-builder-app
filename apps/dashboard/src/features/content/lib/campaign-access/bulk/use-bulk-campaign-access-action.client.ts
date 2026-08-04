'use client'

import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  partitionApplyOutcomes,
  type ActionApplyOutcome,
  type ActionTargetFailure,
  type ActionTargetIdentity,
  type BulkCampaignAccessFormValues,
  type ContentTypeKey,
  type ContentUsageBlocker,
  type ResolvedContentCampaignAccess,
} from '@rpg/contracts'

import { notifyActionOutcomes } from '@/lib/actions/action-outcome-notify.lib'
import type { ActionLifecycleCloseEvent } from '@/lib/actions/action-lifecycle.types'
import { formatCampaignAccessAvailabilityToast } from '../campaign-access-labels'
import { patchContentOverviewListCampaignAccess } from '../../overview/content-overview-list-cache.lib'

import {
  applyBulkCampaignAccessToTargets,
  validateBulkCampaignAccess,
} from './bulk-campaign-access-action.lib'
import type { BulkUpdateRow } from './bulk-apply-campaign-access.lib'

export type UseBulkCampaignAccessActionOptions = {
  campaignId: string
  contentTypeKey: ContentTypeKey
  rows: BulkUpdateRow[]
}

function resolveBulkAvailabilityTarget(
  formValues: BulkCampaignAccessFormValues,
): boolean | undefined {
  if (formValues.available.kind === 'set') {
    return formValues.available.value
  }
  return undefined
}

export function useBulkCampaignAccessAction({
  campaignId,
  contentTypeKey,
  rows,
}: UseBulkCampaignAccessActionOptions) {
  const queryClient = useQueryClient()

  const updateCachedAccess = useCallback(
    (entityId: string, nextAccess: ResolvedContentCampaignAccess) => {
      patchContentOverviewListCampaignAccess(
        queryClient,
        campaignId,
        contentTypeKey,
        entityId,
        nextAccess,
      )
    },
    [campaignId, contentTypeKey, queryClient],
  )

  const validate = useCallback(
    async (_targets: readonly ActionTargetIdentity[], config: BulkCampaignAccessFormValues) => {
      return validateBulkCampaignAccess(rows, config, campaignId, contentTypeKey)
    },
    [campaignId, contentTypeKey, rows],
  )

  const apply = useCallback(
    async (targetIds: readonly string[], config: BulkCampaignAccessFormValues) => {
      const { outcomes, updates } = await applyBulkCampaignAccessToTargets(
        rows,
        targetIds,
        config,
        campaignId,
        contentTypeKey,
      )

      updates.forEach((update) => {
        try {
          updateCachedAccess(update.rowId, update.campaignAccess)
        } catch {
          // Cache sync is best-effort; server state is authoritative.
        }
      })

      return outcomes
    },
    [campaignId, contentTypeKey, rows, updateCachedAccess],
  )

  const notifyClose = useCallback(
    (
      event: ActionLifecycleCloseEvent<ContentUsageBlocker, ActionTargetFailure>,
      config: BulkCampaignAccessFormValues | null,
    ) => {
      if (event.reason === 'cancel' || event.outcomes.length === 0) {
        return
      }

      const available = config ? resolveBulkAvailabilityTarget(config) : undefined

      notifyActionOutcomes({
        outcomes: event.outcomes,
        nounPlural: 'items',
        nounSingular: 'item',
        formatSuccess:
          available != null
            ? (updatedCount) =>
                formatCampaignAccessAvailabilityToast({ count: updatedCount, available })
            : undefined,
      })
    },
    [],
  )

  const toLegacyResult = useCallback(
    (outcomes: ActionApplyOutcome<ContentUsageBlocker, ActionTargetFailure>[]) => {
      const { updated, blocked, failed } = partitionApplyOutcomes(outcomes)

      return {
        updatedIds: updated.map((outcome) => outcome.targetId),
        blockedIds: blocked.map((outcome) => outcome.targetId),
        failedIds: failed.map((outcome) => outcome.targetId),
        fullSuccess: updated.length > 0 && blocked.length === 0 && failed.length === 0,
      }
    },
    [],
  )

  return {
    validate,
    apply,
    notifyClose,
    toLegacyResult,
  }
}

export type { BulkUpdateRow } from './bulk-apply-campaign-access.lib'
