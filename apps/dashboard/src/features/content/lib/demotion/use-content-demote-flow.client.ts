'use client'

import { useCallback, useState } from 'react'
import type { ContentUsageBlocker, ContentSource } from '@rpg/contracts'
import { getErrorMessage } from '@rpg/contracts'

import type { AnyContentFormDef } from '../forms/content-form-registry'
import { fetchContentDemotionAvailability, useDemoteContent } from '../list/use-content-mutations'

type UseContentDemoteFlowOptions = {
  def: Pick<AnyContentFormDef, 'routeKey' | 'queryKey' | 'invalidateQueryKeys'>
  campaignId: string
  entityId: string
  entityName: string
  entitySource: ContentSource
  entityStatus: 'draft' | 'published'
}

export function useContentDemoteFlow({
  def,
  campaignId,
  entityId,
  entityName,
  entitySource,
  entityStatus,
}: UseContentDemoteFlowOptions) {
  const demoteMutation = useDemoteContent(def, campaignId)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [blockedOpen, setBlockedOpen] = useState(false)
  const [blockers, setBlockers] = useState<ContentUsageBlocker[]>([])
  const [demoteError, setDemoteError] = useState<string | null>(null)

  const [trackedEntityId, setTrackedEntityId] = useState(entityId)
  if (entityId !== trackedEntityId) {
    setTrackedEntityId(entityId)
    setConfirmOpen(false)
    setBlockedOpen(false)
    setBlockers([])
    setDemoteError(null)
    setCheckingAvailability(false)
  }

  const handleDemoteClick = useCallback(async () => {
    if (entitySource !== 'homebrew' || entityStatus !== 'published' || checkingAvailability) return

    setDemoteError(null)
    setCheckingAvailability(true)
    try {
      const availability = await fetchContentDemotionAvailability(
        campaignId,
        def.routeKey,
        entityId,
      )
      if (availability.status === 'blocked') {
        setBlockers(availability.blockers)
        setBlockedOpen(true)
        return
      }
      setConfirmOpen(true)
    } catch (err) {
      setDemoteError(
        getErrorMessage(err, 'Could not check whether this item can be moved to draft.'),
      )
    } finally {
      setCheckingAvailability(false)
    }
  }, [campaignId, checkingAvailability, def.routeKey, entityId, entitySource, entityStatus])

  const handleConfirmDemote = useCallback(async () => {
    setDemoteError(null)
    try {
      const result = await demoteMutation.mutateAsync(entityId)
      if (result.status === 'blocked') {
        setConfirmOpen(false)
        setBlockers(result.blockers)
        setBlockedOpen(true)
        return
      }

      setConfirmOpen(false)
    } catch (err) {
      setConfirmOpen(false)
      setDemoteError(getErrorMessage(err, 'Could not move this item to draft.'))
    }
  }, [demoteMutation, entityId])

  const canDemote = entitySource === 'homebrew' && entityStatus === 'published'
  const demotePending = checkingAvailability || demoteMutation.isPending

  return {
    canDemote,
    demotePending,
    checkingAvailability,
    demoteError,
    confirmOpen,
    blockedOpen,
    blockers,
    entityName,
    setConfirmOpen,
    setBlockedOpen,
    handleDemoteClick,
    handleConfirmDemote,
  }
}
