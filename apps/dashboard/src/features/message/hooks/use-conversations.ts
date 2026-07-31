import { useQuery } from '@tanstack/react-query'
import * as React from 'react'

import { useSession } from '@/features/auth'

import { listConversations } from '../api/conversations'
import { conversationsListQueryKey } from '../lib/conversation-query-keys'

export const CONVERSATION_LIST_LIMIT = 20
export const CONVERSATION_POLL_INTERVAL_MS = 30_000

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

export function useConversations() {
  const { data: session } = useSession()
  const isDocumentVisible = useDocumentVisible()
  const isAuthenticated = Boolean(session?.user)

  return useQuery({
    queryKey: conversationsListQueryKey(CONVERSATION_LIST_LIMIT),
    queryFn: () => listConversations({ limit: CONVERSATION_LIST_LIMIT }),
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated && isDocumentVisible ? CONVERSATION_POLL_INTERVAL_MS : false,
    refetchOnWindowFocus: true,
  })
}
