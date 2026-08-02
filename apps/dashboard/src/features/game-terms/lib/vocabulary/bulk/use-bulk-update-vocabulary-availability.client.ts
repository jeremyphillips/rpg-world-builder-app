'use client'

import { useCallback, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type {
  VocabularyOptionSetId,
  VocabularyOptionStatus,
  VocabularyOptionWithUsage,
} from '@rpg/contracts'

import { notifyBulkVocabularyAvailabilityResult } from '@/lib/notify'

import { vocabularySetQueryKey } from '@/features/vocabulary'
import {
  createSkippedBulkVocabularyAvailabilityResult,
  executeBulkVocabularyAvailabilityApply,
  type BulkVocabularyAvailabilityApplyResult,
  type BulkVocabularyAvailabilityBlockedResult,
} from './bulk-apply-vocabulary-availability.lib'

export type UseBulkUpdateVocabularyAvailabilityOptions = {
  campaignId: string
  setId: VocabularyOptionSetId
}

export function useBulkUpdateVocabularyAvailability({
  campaignId,
  setId,
}: UseBulkUpdateVocabularyAvailabilityOptions) {
  const queryClient = useQueryClient()
  const queryKey = vocabularySetQueryKey(campaignId, setId)
  const [pending, setPending] = useState(false)
  const [blockedOpen, setBlockedOpen] = useState(false)
  const [blockedResults, setBlockedResults] = useState<BulkVocabularyAvailabilityBlockedResult[]>(
    [],
  )
  const pendingRef = useRef(false)

  const apply = useCallback(
    async (
      selectedRows: VocabularyOptionWithUsage[],
      status: VocabularyOptionStatus,
    ): Promise<BulkVocabularyAvailabilityApplyResult> => {
      if (pendingRef.current) {
        return createSkippedBulkVocabularyAvailabilityResult(selectedRows.map((row) => row.id))
      }

      pendingRef.current = true
      setPending(true)

      try {
        const result = await executeBulkVocabularyAvailabilityApply({
          campaignId,
          setId,
          selectedRows,
          status,
        })

        if (result.updatedIds.length > 0) {
          void queryClient.invalidateQueries({ queryKey })
        }

        notifyBulkVocabularyAvailabilityResult(result)

        if (result.blockedResults.length > 0) {
          setBlockedResults(result.blockedResults)
          setBlockedOpen(true)
        }

        return result
      } finally {
        pendingRef.current = false
        setPending(false)
      }
    },
    [campaignId, queryClient, queryKey, setId],
  )

  return {
    apply,
    pending,
    blockedOpen,
    blockedResults,
    setBlockedOpen,
  }
}

export type { BulkVocabularyAvailabilityApplyResult } from './bulk-apply-vocabulary-availability.lib'
