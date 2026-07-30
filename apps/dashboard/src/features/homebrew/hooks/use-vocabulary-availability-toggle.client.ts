'use client'

import { useCallback, useRef, useState } from 'react'
import type {
  CampaignAvailabilityFilter,
  ContentUsageBlocker,
  VocabularyOptionSetId,
  VocabularyOptionWithUsage,
} from '@rpg/contracts'

import { notifyCampaignAccessUpdateFailed, notifyCampaignAccessUpdated } from '@/lib/notify'

import { fetchVocabularyDisableAvailability, updateVocabularyEntry } from '../api/vocabulary-api'

export type UseVocabularyAvailabilityToggleOptions = {
  campaignId: string
  setId: VocabularyOptionSetId
  entry: VocabularyOptionWithUsage
  campaignAvailabilityFilter: CampaignAvailabilityFilter
  onStatusChanged?: () => void
}

export function useVocabularyAvailabilityToggle({
  campaignId,
  setId,
  entry,
  campaignAvailabilityFilter,
  onStatusChanged,
}: UseVocabularyAvailabilityToggleOptions) {
  const [pending, setPending] = useState(false)
  const [blockedOpen, setBlockedOpen] = useState(false)
  const [blockers, setBlockers] = useState<ContentUsageBlocker[]>([])
  const onStatusChangedRef = useRef(onStatusChanged)
  onStatusChangedRef.current = onStatusChanged

  const handleAvailableChange = useCallback(
    async (nextAvailable: boolean) => {
      if (pending) return

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
          notifyCampaignAccessUpdateFailed(entry.label, nextAvailable, err, () => {
            void handleAvailableChange(nextAvailable)
          })
          return
        } finally {
          setPending(false)
        }
      }

      setPending(true)
      try {
        await updateVocabularyEntry(campaignId, setId, entry.id, { status: nextStatus })
        notifyCampaignAccessUpdated(entry.label, nextAvailable)

        if (!nextAvailable && campaignAvailabilityFilter === 'available') {
          onStatusChangedRef.current?.()
        }
      } catch (err) {
        notifyCampaignAccessUpdateFailed(entry.label, nextAvailable, err, () => {
          void handleAvailableChange(nextAvailable)
        })
      } finally {
        setPending(false)
      }
    },
    [campaignAvailabilityFilter, campaignId, entry.id, entry.label, pending, setId],
  )

  return {
    pending,
    blockedOpen,
    setBlockedOpen,
    blockers,
    handleAvailableChange,
  }
}
