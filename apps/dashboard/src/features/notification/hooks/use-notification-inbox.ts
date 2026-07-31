import { useInfiniteQuery } from '@tanstack/react-query'

import { useSession } from '@/features/auth'
import { useRealtimeStatus } from '@/features/realtime'
import { useDocumentVisible } from '@/lib/react/use-document-visible'

import { listNotifications } from '../api/notifications'
import {
  NOTIFICATION_INBOX_PAGE_LIMIT,
  notificationsInboxQueryKey,
  type NotificationInboxQueryFilters,
} from '../lib/notification-query-keys'
import {
  NOTIFICATION_POLL_INTERVAL_MS,
  NOTIFICATION_SLOW_POLL_INTERVAL_MS,
} from './use-notifications'

export function useNotificationInbox(filters: NotificationInboxQueryFilters = {}) {
  const { data: session } = useSession()
  const { isConnected: isRealtimeConnected } = useRealtimeStatus()
  const isDocumentVisible = useDocumentVisible()
  const isAuthenticated = Boolean(session?.user)

  const pollIntervalMs = isRealtimeConnected
    ? NOTIFICATION_SLOW_POLL_INTERVAL_MS
    : NOTIFICATION_POLL_INTERVAL_MS

  return useInfiniteQuery({
    queryKey: notificationsInboxQueryKey(filters),
    queryFn: ({ pageParam }) =>
      listNotifications({
        limit: NOTIFICATION_INBOX_PAGE_LIMIT,
        cursor: pageParam,
        ...filters,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated && isDocumentVisible ? pollIntervalMs : false,
    refetchOnWindowFocus: true,
  })
}
