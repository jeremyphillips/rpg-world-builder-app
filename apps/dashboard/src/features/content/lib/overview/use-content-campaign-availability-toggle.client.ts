'use client'

import { useCallback, useRef, useState } from 'react'
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
} from '../campaign-access/campaign-access-api'
import { resolvedToCampaignAccessPatch } from '../campaign-access/campaign-access-state'
import { notifyCampaignAccessUpdated, notifyCampaignAccessUpdateFailed } from '@/lib/notify'
import type { ContentBase } from './content-table-config'
import { contentOverviewListQueryKey } from './content-overview-query-keys'

function contentListQueryKey(campaignId: string, contentTypeKey: ContentTypeKey) {
  return contentOverviewListQueryKey(campaignId, contentTypeKey)
}

export type UseContentCampaignAvailabilityToggleOptions = {
  campaignId: string
  contentTypeKey: ContentTypeKey
  entityId: string
  entityName: string
  campaignAccess: ResolvedContentCampaignAccess
  campaignAvailabilityFilter: CampaignAvailabilityFilter
  onRowRemoved?: () => void
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
  onRowRemovedRef.current = onRowRemoved
  const entityNameRef = useRef(entityName)
  entityNameRef.current = entityName

  const resolveEntityName = useCallback(() => {
    const rows = queryClient.getQueryData<WithCampaignAccess<ContentBase & { id: string }>[]>(
      contentListQueryKey(campaignId, contentTypeKey),
    )
    return rows?.find((row) => row.id === entityId)?.name ?? entityNameRef.current
  }, [campaignId, contentTypeKey, entityId, queryClient])

  const updateCachedAccess = useCallback(
    (nextAccess: ResolvedContentCampaignAccess) => {
      queryClient.setQueryData<WithCampaignAccess<ContentBase & { id: string }>[]>(
        contentListQueryKey(campaignId, contentTypeKey),
        (current) =>
          current?.map((row) =>
            row.id === entityId ? { ...row, campaignAccess: nextAccess } : row,
          ),
      )
    },
    [campaignId, contentTypeKey, entityId, queryClient],
  )

  const handleAvailableChange = useCallback(
    async (nextAvailable: boolean) => {
      if (pending) return

      if (!nextAvailable) {
        setPending(true)
        try {
          const availability = await fetchContentCampaignAccessAvailability(
            campaignId,
            contentTypeKey,
            entityId,
          )
          if (availability.status === 'blocked') {
            setBlockers(availability.blockers)
            setBlockedOpen(true)
            return
          }
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
        const patch = resolvedToCampaignAccessPatch({
          ...campaignAccess,
          available: nextAvailable,
        })
        const result = await updateRouteContentCampaignAccess(
          campaignId,
          contentTypeKey,
          entityId,
          patch,
        )

        if (result.status === 'blocked') {
          if (nextAvailable) {
            updateCachedAccess(campaignAccess)
          }
          setBlockers(result.blockers)
          setBlockedOpen(true)
          return
        }

        updateCachedAccess(result.campaignAccess)

        if (!nextAvailable && campaignAvailabilityFilter === 'available') {
          onRowRemovedRef.current?.()
        }

        notifyCampaignAccessUpdated(resolveEntityName(), nextAvailable)
      } catch (err) {
        if (nextAvailable) {
          updateCachedAccess(campaignAccess)
        }
        notifyCampaignAccessUpdateFailed(entityId, nextAvailable, err, () => {
          void handleAvailableChange(nextAvailable)
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

  return {
    pending,
    blockedOpen,
    setBlockedOpen,
    blockers,
    handleAvailableChange,
  }
}
