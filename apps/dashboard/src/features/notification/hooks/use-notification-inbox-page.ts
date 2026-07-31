'use client'

import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from '@rpg/ui'
import type { Notification } from '@rpg/contracts'

import { useCampaigns } from '@/features/campaign/hooks/use-campaigns'
import {
  INVALID_CAMPAIGN_SCOPE_COPY,
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
  const { data: campaigns = [] } = useCampaigns()

  const campaignOptions = React.useMemo(
    () => campaigns.map((campaign) => ({ value: campaign.id, label: campaign.identity.name })),
    [campaigns],
  )

  const schema = React.useMemo(
    () => createNotificationInboxFilterSchema(campaignOptions),
    [campaignOptions],
  )

  const { filters, setFilterValue, resetFilters } = useFilterUrlState({
    schema,
  })

  const accessibleCampaignIds = React.useMemo(
    () => campaigns.map((campaign) => campaign.id),
    [campaigns],
  )

  const invalidScope = useInvalidCampaignScopeNotice(filters.campaignId, accessibleCampaignIds)

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
  } = useNotificationInbox(listFilters)
  const { markRead, markAllRead } = useNotificationActions()

  const items = React.useMemo(
    () => (data?.pages ? data.pages.flatMap((page) => page.items) : []),
    [data?.pages],
  )
  const unreadCount = data?.pages[0]?.unreadCount ?? 0

  const handleActivate = React.useCallback(
    (notification: Notification) => {
      activateNotification({
        notification,
        markRead,
        navigate,
        onFailure: () => {
          toast.error(NOTIFICATION_ACTION_FAILED_MESSAGE)
          void refetch()
        },
      })
    },
    [markRead, navigate, refetch],
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
    unreadCount,
    invalidScopeNotice: {
      show: invalidScope.showInvalidScopeNotice,
      dismiss: invalidScope.dismissInvalidScopeNotice,
      copy: INVALID_CAMPAIGN_SCOPE_COPY,
    },
    isPending,
    isError,
    refetch,
    previewItems,
    itemCount: items.length,
    unreadCountForLabel: unreadCount,
    handleMarkAllRead,
    markAllReadPending: markAllRead.isPending,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    isFetchNextPageError,
    handleLoadMore,
    emptyTitle: NOTIFICATION_COPY.caughtUpTitle,
  }
}
