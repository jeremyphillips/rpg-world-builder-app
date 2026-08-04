'use client'

import * as React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from '@rpg/ui'
import type { Notification } from '@rpg/contracts'

import { useCampaigns } from '@/features/campaign'
import {
  INVALID_CAMPAIGN_SCOPE_COPY,
  parseCampaignIdFromSearch,
  useFilterUrlState,
  useInvalidCampaignScopeNotice,
} from '@/lib/filters'

import { activateNotification } from '../lib/activate-notification'
import { mapNotificationsToPreviewItems } from '../lib/map-notifications-to-preview-items.client'
import {
  createNotificationInboxFilterSchema,
  toNotificationListQueryFilters,
} from '../lib/notification-inbox-filter-schema'
import { NOTIFICATION_COPY } from '../lib/notification-copy'
import { useNotificationActions } from './use-notification-actions'
import { useNotificationInbox } from './use-notification-inbox'

const NOTIFICATION_ACTION_FAILED_MESSAGE = 'Could not update notification.'

export function useNotificationInboxPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: campaigns = [], isPending: campaignsPending } = useCampaigns()
  const campaignsSettled = !campaignsPending
  const rawCampaignId = React.useMemo(
    () => parseCampaignIdFromSearch(location.search),
    [location.search],
  )

  const campaignOptions = React.useMemo(
    () => campaigns.map((campaign) => ({ value: campaign.id, label: campaign.identity.name })),
    [campaigns],
  )

  const schema = React.useMemo(
    () => createNotificationInboxFilterSchema(campaignOptions),
    [campaignOptions],
  )

  const { filters, setFilterValue, resetFilters, clearFilterField } = useFilterUrlState({
    schema,
  })

  const accessibleCampaignIds = React.useMemo(
    () => campaigns.map((campaign) => campaign.id),
    [campaigns],
  )

  const invalidScope = useInvalidCampaignScopeNotice(rawCampaignId, accessibleCampaignIds, {
    campaignsSettled,
  })

  const listFilters = React.useMemo(() => toNotificationListQueryFilters(filters), [filters])

  const {
    data,
    isPending,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useNotificationInbox(listFilters, {
    enabled: campaignsSettled || !rawCampaignId,
  })
  const { markRead, markAllRead } = useNotificationActions()

  const items = React.useMemo(
    () => (data?.pages ? data.pages.flatMap((page) => page.items) : []),
    [data],
  )
  const unreadCount = data?.pages[0]?.unreadCount ?? 0

  const handleActivate = React.useCallback(
    (notification: Notification) => {
      activateNotification({
        notification,
        markRead,
        navigate,
        campaignId: filters.campaignId,
        onFailure: () => {
          toast.error(NOTIFICATION_ACTION_FAILED_MESSAGE)
          void refetch()
        },
      })
    },
    [filters.campaignId, markRead, navigate, refetch],
  )

  const handleMarkAllRead = React.useCallback(() => {
    void markAllRead.mutateAsync().catch(() => {
      toast.error(NOTIFICATION_ACTION_FAILED_MESSAGE)
      void refetch()
    })
  }, [markAllRead, refetch])

  const previewItems = React.useMemo(
    () => mapNotificationsToPreviewItems(items, handleActivate),
    [items, handleActivate],
  )

  const handleLoadMore = React.useCallback(() => {
    void fetchNextPage().catch(() => {
      toast.error('Could not load more notifications.')
    })
  }, [fetchNextPage])

  return {
    schema,
    filters,
    setFilterValue,
    resetFilters,
    clearFilterField,
    unreadCount,
    invalidScopeNotice: {
      show: invalidScope.showInvalidScopeNotice,
      dismiss: invalidScope.dismissInvalidScopeNotice,
      copy: INVALID_CAMPAIGN_SCOPE_COPY,
    },
    isPending: isPending || (Boolean(rawCampaignId) && !campaignsSettled),
    isError,
    refetch,
    previewItems,
    itemCount: items.length,
    handleMarkAllRead,
    markAllReadPending: markAllRead.isPending,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    isFetchNextPageError,
    handleLoadMore,
    emptyTitle: NOTIFICATION_COPY.caughtUpTitle,
  }
}
