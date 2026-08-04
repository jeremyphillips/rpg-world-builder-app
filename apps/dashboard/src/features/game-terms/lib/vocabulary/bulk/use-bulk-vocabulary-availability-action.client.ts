'use client'

import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  partitionApplyOutcomes,
  type ActionApplyOutcome,
  type ActionTargetFailure,
  type ActionTargetIdentity,
  type ContentUsageBlocker,
  type VocabularyOptionSetId,
  type VocabularyOptionStatus,
  type VocabularyOptionWithUsage,
} from '@rpg/contracts'

import { notifyActionOutcomes } from '@/lib/actions/action-outcome-notify.lib'
import type { ActionLifecycleCloseEvent } from '@/lib/actions/action-lifecycle.types'
import { vocabularySetQueryKey } from '@/features/vocabulary'

import {
  applyBulkVocabularyAvailabilityToTargets,
  validateBulkVocabularyAvailability,
} from './bulk-vocabulary-availability-action.lib'

export type UseBulkVocabularyAvailabilityActionOptions = {
  campaignId: string
  setId: VocabularyOptionSetId
  rows: VocabularyOptionWithUsage[]
}

export function useBulkVocabularyAvailabilityAction({
  campaignId,
  setId,
  rows,
}: UseBulkVocabularyAvailabilityActionOptions) {
  const queryClient = useQueryClient()
  const queryKey = vocabularySetQueryKey(campaignId, setId)

  const validate = useCallback(
    async (_targets: readonly ActionTargetIdentity[], status: VocabularyOptionStatus) => {
      return validateBulkVocabularyAvailability(rows, status, campaignId, setId)
    },
    [campaignId, rows, setId],
  )

  const apply = useCallback(
    async (targetIds: readonly string[], status: VocabularyOptionStatus) => {
      const outcomes = await applyBulkVocabularyAvailabilityToTargets(
        rows,
        targetIds,
        status,
        campaignId,
        setId,
      )

      if (outcomes.some((outcome) => outcome.status === 'updated')) {
        void queryClient.invalidateQueries({ queryKey })
      }

      return outcomes
    },
    [campaignId, queryClient, queryKey, rows, setId],
  )

  const notifyClose = useCallback(
    (event: ActionLifecycleCloseEvent<ContentUsageBlocker, ActionTargetFailure>) => {
      if (event.reason === 'cancel' || event.outcomes.length === 0) {
        return
      }

      notifyActionOutcomes({
        outcomes: event.outcomes,
        nounPlural: 'entries',
        nounSingular: 'entry',
      })
    },
    [],
  )

  const toLegacyResult = useCallback(
    (outcomes: ActionApplyOutcome<ContentUsageBlocker, ActionTargetFailure>[]) => {
      const { updated, blocked, failed } = partitionApplyOutcomes(outcomes)

      return {
        updatedIds: updated.map((outcome) => outcome.targetId),
        blockedResults: blocked.map((outcome) => ({
          rowId: outcome.targetId,
          label: rows.find((row) => row.id === outcome.targetId)?.label ?? outcome.targetId,
          blockers: outcome.blockers,
        })),
        failedIds: failed.map((outcome) => outcome.targetId),
        fullSuccess: updated.length > 0 && blocked.length === 0 && failed.length === 0,
      }
    },
    [rows],
  )

  return {
    validate,
    apply,
    notifyClose,
    toLegacyResult,
  }
}
