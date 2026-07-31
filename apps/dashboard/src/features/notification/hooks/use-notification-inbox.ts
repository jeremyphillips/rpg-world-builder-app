import { useInfiniteQuery } from '@tanstack/react-query'

import { useSession } from '@/features/auth'
import { useRealtimeStatus } from '@/features/realtime'
import { useDocumentVisible } from '@/lib/react/use-document-visible'

import { listNotifications } from '../api/notifications'
import {
  NOTIFICATION_INBOX_PAGE_LIMIT,
  notificationsInboxQueryKey,
} from '../lib/notification-query-keys'
import {
  NOTIFICATION_POLL_INTERVAL_MS,
  NOTIFICATION_SLOW_POLL_INTERVAL_MS,
} from './use-notifications'

export function useNotificationInbox() {
  const { data: session } = useSession()
  const { isConnected: isRealtimeConnected } = useRealtimeStatus()
  const isDocumentVisible = useDocumentVisible()
  const isAuthenticated = Boolean(session?.user)

  const pollIntervalMs = isRealtimeConnected
    ? NOTIFICATION_SLOW_POLL_INTERVAL_MS
    : NOTIFICATION_POLL_INTERVAL_MS

  return useInfiniteQuery({
    queryKey: notificationsInboxQueryKey,
    queryFn: ({ pageParam }) =>
      listNotifications({
        limit: NOTIFICATION_INBOX_PAGE_LIMIT,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated && isDocumentVisible ? pollIntervalMs : false,
    refetchOnWindowFocus: true,
  })
}
