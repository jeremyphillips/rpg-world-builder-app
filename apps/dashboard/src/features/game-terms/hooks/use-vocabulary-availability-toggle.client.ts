'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type {
  ContentUsageBlocker,
  ResolvedVocabularyOptionSet,
  VocabularyOptionSetId,
  VocabularyOptionStatus,
  VocabularyOptionWithUsage,
} from '@rpg/contracts'

import {
  notifyVocabularyAvailabilityUpdateFailed,
  notifyVocabularyAvailabilityUpdated,
} from '@/lib/notify'

import {
  fetchVocabularyDisableAvailability,
  updateVocabularyEntry,
  vocabularySetQueryKey,
} from '@/features/vocabulary'

export type UseVocabularyAvailabilityToggleOptions = {
  campaignId: string
  setId: VocabularyOptionSetId
  entry: VocabularyOptionWithUsage
}

export function useVocabularyAvailabilityToggle({
  campaignId,
  setId,
  entry,
}: UseVocabularyAvailabilityToggleOptions) {
  const queryClient = useQueryClient()
  const queryKey = vocabularySetQueryKey(campaignId, setId)
  const [pending, setPending] = useState(false)
  const [blockedOpen, setBlockedOpen] = useState(false)
  const [blockers, setBlockers] = useState<ContentUsageBlocker[]>([])
  const entryLabelRef = useRef(entry.label)

  useEffect(() => {
    entryLabelRef.current = entry.label
  })

  const updateCachedSet = useCallback(
    (nextSet: ResolvedVocabularyOptionSet) => {
      queryClient.setQueryData(queryKey, nextSet)
    },
    [queryClient, queryKey],
  )

  const updateCachedStatus = useCallback(
    (nextStatus: VocabularyOptionStatus) => {
      queryClient.setQueryData<ResolvedVocabularyOptionSet>(queryKey, (current) => {
        if (!current) return current

        return {
          ...current,
          options: current.options.map((option) =>
            option.id === entry.id ? { ...option, status: nextStatus } : option,
          ),
        }
      })
    },
    [entry.id, queryClient, queryKey],
  )

  const handleAvailableChangeRef = useRef<((nextAvailable: boolean) => Promise<void>) | null>(null)

  const handleAvailableChange = useCallback(
    async (nextAvailable: boolean) => {
      if (pending) return

      const previousStatus = entry.status
      const nextStatus = nextAvailable ? 'active' : 'disabled'

      if (!nextAvailable) {
        setPending(true)
        try {
          const availability = await fetchVocabularyDisableAvailability(campaignId, setId, entry.id)
          if (availability.status === 'blocked') {
            setBlockers(availability.blockers)
            setBlockedOpen(true)
            return
          }
        } catch (err) {
          notifyVocabularyAvailabilityUpdateFailed(
            entryLabelRef.current,
            nextAvailable,
            err,
            () => {
              void handleAvailableChangeRef.current?.(nextAvailable)
            },
          )
          return
        } finally {
          setPending(false)
        }
      } else {
        updateCachedStatus(nextStatus)
      }

      setPending(true)
      try {
        const nextSet = await updateVocabularyEntry(campaignId, setId, entry.id, {
          status: nextStatus,
        })
        updateCachedSet(nextSet)
        notifyVocabularyAvailabilityUpdated(entryLabelRef.current, nextAvailable)
      } catch (err) {
        updateCachedStatus(previousStatus)
        notifyVocabularyAvailabilityUpdateFailed(entryLabelRef.current, nextAvailable, err, () => {
          void handleAvailableChangeRef.current?.(nextAvailable)
        })
      } finally {
        setPending(false)
      }
    },
    [campaignId, entry.id, entry.status, pending, setId, updateCachedSet, updateCachedStatus],
  )

  useEffect(() => {
    handleAvailableChangeRef.current = handleAvailableChange
  })

  return {
    pending,
    blockedOpen,
    setBlockedOpen,
    blockers,
    handleAvailableChange,
  }
}
