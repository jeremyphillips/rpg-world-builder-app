'use client'

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ContentDeletionBlocker, ContentSource, ContentTypeKey } from '@rpg/contracts'
import { getErrorMessage } from '@rpg/contracts'

import type { AnyContentFormDef } from '../forms/content-form-registry'
import { fetchContentDeletionAvailability, useDeleteContent } from '../list/use-content-mutations'

type UseContentDeleteFlowOptions = {
  def: Pick<AnyContentFormDef, 'routeKey' | 'queryKey' | 'invalidateQueryKeys'>
  campaignId: string
  entityId: string
  entityName: string
  entitySource: ContentSource
  contentTypeKey: ContentTypeKey
  overviewHref: string
}

export function useContentDeleteFlow({
  def,
  campaignId,
  entityId,
  entityName,
  entitySource,
  contentTypeKey,
  overviewHref,
}: UseContentDeleteFlowOptions) {
  const navigate = useNavigate()
  const deleteMutation = useDeleteContent(def, campaignId)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [blockedOpen, setBlockedOpen] = useState(false)
  const [blockers, setBlockers] = useState<ContentDeletionBlocker[]>([])
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    setConfirmOpen(false)
    setBlockedOpen(false)
    setBlockers([])
    setDeleteError(null)
    setCheckingAvailability(false)
  }, [entityId])

  const handleDeleteClick = useCallback(async () => {
    if (entitySource !== 'homebrew' || checkingAvailability) return

    setDeleteError(null)
    setCheckingAvailability(true)
    try {
      const availability = await fetchContentDeletionAvailability(
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
      setDeleteError(getErrorMessage(err, 'Could not check whether this item can be deleted.'))
    } finally {
      setCheckingAvailability(false)
    }
  }, [campaignId, checkingAvailability, def.routeKey, entityId, entitySource])

  const handleConfirmDelete = useCallback(async () => {
    setDeleteError(null)
    try {
      const result = await deleteMutation.mutateAsync(entityId)
      if (result.status === 'blocked') {
        setConfirmOpen(false)
        setBlockers(result.blockers)
        setBlockedOpen(true)
        return
      }

      setConfirmOpen(false)
      // TODO: success toast once toast infra lands
      // TODO: preserve existing overview search/filter state when navigating back after delete
      navigate(overviewHref)
    } catch (err) {
      setConfirmOpen(false)
      setDeleteError(getErrorMessage(err, 'Could not delete this item.'))
    }
  }, [deleteMutation, entityId, navigate, overviewHref])

  const canDelete = entitySource === 'homebrew'
  const deletePending = checkingAvailability || deleteMutation.isPending

  return {
    canDelete,
    deletePending,
    checkingAvailability,
    deleteError,
    confirmOpen,
    blockedOpen,
    blockers,
    contentTypeKey,
    entityName,
    setConfirmOpen,
    setBlockedOpen,
    handleDeleteClick,
    handleConfirmDelete,
  }
}
