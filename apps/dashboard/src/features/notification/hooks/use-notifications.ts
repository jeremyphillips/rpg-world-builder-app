import { useQuery } from '@tanstack/react-query'
import * as React from 'react'

import { useSession } from '@/features/auth'

import { listNotifications } from '../api/notifications'
import { notificationsListQueryKey } from '../lib/notification-query-keys'

export const NOTIFICATION_LIST_LIMIT = 10
export const NOTIFICATION_POLL_INTERVAL_MS = 30_000

function useDocumentVisible(): boolean {
  const [visible, setVisible] = React.useState(
    () => typeof document !== 'undefined' && document.visibilityState === 'visible',
  )

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      setVisible(document.visibilityState === 'visible')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return visible
}

export function useNotifications() {
  const { data: session } = useSession()
  const isDocumentVisible = useDocumentVisible()
  const isAuthenticated = Boolean(session?.user)

  return useQuery({
    queryKey: notificationsListQueryKey(NOTIFICATION_LIST_LIMIT),
    queryFn: () => listNotifications({ limit: NOTIFICATION_LIST_LIMIT }),
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated && isDocumentVisible ? NOTIFICATION_POLL_INTERVAL_MS : false,
    refetchOnWindowFocus: true,
  })
}
