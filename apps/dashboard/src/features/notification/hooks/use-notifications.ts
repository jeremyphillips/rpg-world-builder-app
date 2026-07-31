import { useQuery } from '@tanstack/react-query'

import { useSession } from '@/features/auth'
import { useRealtimeStatus } from '@/features/realtime'
import { useDocumentVisible } from '@/lib/react/use-document-visible'

import { listNotifications } from '../api/notifications'
import { NOTIFICATION_LIST_LIMIT, notificationsListQueryKey } from '../lib/notification-query-keys'

/** Fast poll while the socket is disconnected or still handshaking. */
export const NOTIFICATION_POLL_INTERVAL_MS = 30_000
/** Slow fallback poll while the realtime socket is connected. */
export const NOTIFICATION_SLOW_POLL_INTERVAL_MS = 90_000

export function useNotifications() {
  const { data: session } = useSession()
  const { isConnected: isRealtimeConnected } = useRealtimeStatus()
  const isDocumentVisible = useDocumentVisible()
  const isAuthenticated = Boolean(session?.user)

  const pollIntervalMs = isRealtimeConnected
    ? NOTIFICATION_SLOW_POLL_INTERVAL_MS
    : NOTIFICATION_POLL_INTERVAL_MS

  return useQuery({
    queryKey: notificationsListQueryKey(NOTIFICATION_LIST_LIMIT),
    // Phase 1: first page only — ignore list response nextCursor until load-more UI exists.
    queryFn: () => listNotifications({ limit: NOTIFICATION_LIST_LIMIT }),
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated && isDocumentVisible ? pollIntervalMs : false,
    refetchOnWindowFocus: true,
  })
}

export { NOTIFICATION_LIST_LIMIT }
