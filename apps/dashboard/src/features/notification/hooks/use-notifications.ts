import { useQuery } from '@tanstack/react-query'

import { useSession } from '@/features/auth'
import { useDocumentVisible } from '@/lib/react/use-document-visible'

import { listNotifications } from '../api/notifications'
import { notificationsListQueryKey } from '../lib/notification-query-keys'

export const NOTIFICATION_LIST_LIMIT = 10
export const NOTIFICATION_POLL_INTERVAL_MS = 30_000

export function useNotifications() {
  const { data: session } = useSession()
  const isDocumentVisible = useDocumentVisible()
  const isAuthenticated = Boolean(session?.user)

  return useQuery({
    queryKey: notificationsListQueryKey(NOTIFICATION_LIST_LIMIT),
    // Phase 1: first page only — ignore list response nextCursor until load-more UI exists.
    queryFn: () => listNotifications({ limit: NOTIFICATION_LIST_LIMIT }),
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated && isDocumentVisible ? NOTIFICATION_POLL_INTERVAL_MS : false,
    refetchOnWindowFocus: true,
  })
}
