'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  type CampaignAvailabilityFilter,
  type ContentTypeKey,
  type ContentUsageBlocker,
  type ResolvedContentCampaignAccess,
  type WithCampaignAccess,
} from '@rpg/contracts'

import {
  fetchContentCampaignAccessAvailability,
  updateRouteContentCampaignAccess,
} from '../../campaign-access/campaign-access-api'
import { resolvedToCampaignAccessPatch } from '../../campaign-access/campaign-access-state'
import { notifyCampaignAccessUpdated, notifyCampaignAccessUpdateFailed } from '@/lib/notify'
import type { ContentBase } from '../content-table-config'
import { patchContentOverviewListCampaignAccess } from '../content-overview-list-cache.lib'
import { contentOverviewListQueryKey } from '../content-overview-query-keys'

export type UseContentCampaignAvailabilityToggleOptions = {
  campaignId: string
  contentTypeKey: ContentTypeKey
  entityId: string
  entityName: string
  campaignAccess: ResolvedContentCampaignAccess
  campaignAvailabilityFilter: CampaignAvailabilityFilter
  onRowRemoved?: () => void
}

type AvailabilityToggleContext = {
  campaignId: string
  contentTypeKey: ContentTypeKey
  entityId: string
  campaignAccess: ResolvedContentCampaignAccess
  campaignAvailabilityFilter: CampaignAvailabilityFilter
  updateCachedAccess: (nextAccess: ResolvedContentCampaignAccess) => void
  resolveEntityName: () => string
  onRowRemoved?: () => void
  setBlockers: (blockers: ContentUsageBlocker[]) => void
  setBlockedOpen: (open: boolean) => void
}

async function precheckMarkUnavailable(
  ctx: Pick<AvailabilityToggleContext, 'campaignId' | 'contentTypeKey' | 'entityId'>,
): Promise<{ status: 'clear' } | { status: 'blocked'; blockers: ContentUsageBlocker[] }> {
  const availability = await fetchContentCampaignAccessAvailability(
    ctx.campaignId,
    ctx.contentTypeKey,
    ctx.entityId,
  )
  if (availability.status === 'blocked') {
    return { status: 'blocked', blockers: availability.blockers }
  }
  return { status: 'clear' }
}

async function persistAvailabilityChange(
  ctx: AvailabilityToggleContext,
  nextAvailable: boolean,
): Promise<void> {
  const patch = resolvedToCampaignAccessPatch({
    ...ctx.campaignAccess,
    available: nextAvailable,
  })
  const result = await updateRouteContentCampaignAccess(
    ctx.campaignId,
    ctx.contentTypeKey,
    ctx.entityId,
    patch,
  )

  if (result.status === 'blocked') {
    if (nextAvailable) {
      ctx.updateCachedAccess(ctx.campaignAccess)
    }
    ctx.setBlockers(result.blockers)
    ctx.setBlockedOpen(true)
    return
  }

  ctx.updateCachedAccess(result.campaignAccess)

  if (!nextAvailable && ctx.campaignAvailabilityFilter === 'available') {
    ctx.onRowRemoved?.()
  }

  notifyCampaignAccessUpdated(ctx.resolveEntityName(), nextAvailable)
}

export function useContentCampaignAvailabilityToggle({
  campaignId,
  contentTypeKey,
  entityId,
  entityName,
  campaignAccess,
  campaignAvailabilityFilter,
  onRowRemoved,
}: UseContentCampaignAvailabilityToggleOptions) {
  const queryClient = useQueryClient()
  const [pending, setPending] = useState(false)
  const [blockedOpen, setBlockedOpen] = useState(false)
  const [blockers, setBlockers] = useState<ContentUsageBlocker[]>([])
  const onRowRemovedRef = useRef(onRowRemoved)
  const entityNameRef = useRef(entityName)

  useEffect(() => {
    onRowRemovedRef.current = onRowRemoved
    entityNameRef.current = entityName
  })

  const resolveEntityName = useCallback(() => {
    const cached = queryClient.getQueryData<{
      items?: Array<WithCampaignAccess<ContentBase & { id: string }>>
    }>(contentOverviewListQueryKey(campaignId, contentTypeKey))
    return cached?.items?.find((row) => row.id === entityId)?.name ?? entityNameRef.current
  }, [campaignId, contentTypeKey, entityId, queryClient])

  const updateCachedAccess = useCallback(
    (nextAccess: ResolvedContentCampaignAccess) => {
      patchContentOverviewListCampaignAccess(
        queryClient,
        campaignId,
        contentTypeKey,
        entityId,
        nextAccess,
      )
    },
    [campaignId, contentTypeKey, entityId, queryClient],
  )

  const handleAvailableChangeRef = useRef<((nextAvailable: boolean) => Promise<void>) | null>(null)

  const handleAvailableChange = useCallback(
    async (nextAvailable: boolean) => {
      if (pending) return

      const toggleCtx: AvailabilityToggleContext = {
        campaignId,
        contentTypeKey,
        entityId,
        campaignAccess,
        campaignAvailabilityFilter,
        updateCachedAccess,
        resolveEntityName,
        onRowRemoved: () => onRowRemovedRef.current?.(),
        setBlockers,
        setBlockedOpen,
      }

      if (!nextAvailable) {
        setPending(true)
        try {
          const precheck = await precheckMarkUnavailable(toggleCtx)
          if (precheck.status === 'blocked') {
            setBlockers(precheck.blockers)
            setBlockedOpen(true)
            return
          }
        } catch (err) {
          notifyCampaignAccessUpdateFailed(entityId, nextAvailable, err, () => {
            void handleAvailableChangeRef.current?.(nextAvailable)
          })
          return
        } finally {
          setPending(false)
        }
      } else {
        updateCachedAccess({
          ...campaignAccess,
          available: true,
          effectiveAudience: campaignAccess.visibilityMode,
        })
      }

      setPending(true)
      try {
        await persistAvailabilityChange(toggleCtx, nextAvailable)
      } catch (err) {
        if (nextAvailable) {
          updateCachedAccess(campaignAccess)
        }
        notifyCampaignAccessUpdateFailed(entityId, nextAvailable, err, () => {
          void handleAvailableChangeRef.current?.(nextAvailable)
        })
      } finally {
        setPending(false)
      }
    },
    [
      campaignAccess,
      campaignAvailabilityFilter,
      campaignId,
      contentTypeKey,
      entityId,
      pending,
      resolveEntityName,
      updateCachedAccess,
    ],
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
