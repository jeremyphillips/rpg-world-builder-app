import { useInfiniteQuery } from '@tanstack/react-query'
import * as React from 'react'

import { useSession } from '@/features/auth'

import { listConversationMessages } from '../api/conversations'
import { conversationMessagesQueryKey } from '../lib/conversation-query-keys'

export const CONVERSATION_MESSAGE_PAGE_LIMIT = 50
export const CONVERSATION_MESSAGE_POLL_INTERVAL_MS = 15_000

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

export function useConversationMessages(conversationId: string | undefined) {
  const { data: session } = useSession()
  const isDocumentVisible = useDocumentVisible()
  const isAuthenticated = Boolean(session?.user)

  return useInfiniteQuery({
    queryKey: conversationMessagesQueryKey(conversationId ?? ''),
    queryFn: ({ pageParam }) =>
      listConversationMessages(conversationId!, {
        limit: CONVERSATION_MESSAGE_PAGE_LIMIT,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: isAuthenticated && Boolean(conversationId),
    refetchInterval:
      isAuthenticated && isDocumentVisible && conversationId
        ? CONVERSATION_MESSAGE_POLL_INTERVAL_MS
        : false,
    refetchOnWindowFocus: true,
  })
}
