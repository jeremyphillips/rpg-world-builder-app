import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  type ActionTargetFailure,
  type ActionTargetIdentity,
  type ContentUsageBlocker,
  type VocabularyOptionSetId,
  type VocabularyOptionStatus,
  type VocabularyOptionWithUsage,
} from '@rpg/contracts'

import { notifyActionOutcomes, type ActionLifecycleCloseEvent } from '@/lib/actions'
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
      notifyActionOutcomes({
        outcomes: event.outcomes,
        closeReason: event.reason,
        nounPlural: 'entries',
        nounSingular: 'entry',
      })
    },
    [],
  )

  return {
    validate,
    apply,
    notifyClose,
  }
}
