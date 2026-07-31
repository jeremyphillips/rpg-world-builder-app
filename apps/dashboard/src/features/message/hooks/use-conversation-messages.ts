import { useInfiniteQuery } from '@tanstack/react-query'

import { useSession } from '@/features/auth'
import { useRealtimeStatus } from '@/features/realtime'
import { useDocumentVisible } from '@/lib/react/use-document-visible'

import { listConversationMessages } from '../api/conversations'
import { conversationMessagesQueryKey } from '../lib/conversation-query-keys'

export const CONVERSATION_MESSAGE_PAGE_LIMIT = 50
export const CONVERSATION_MESSAGE_POLL_INTERVAL_MS = 15_000
export const CONVERSATION_MESSAGE_SLOW_POLL_INTERVAL_MS = 60_000

export function useConversationMessages(conversationId: string | undefined) {
  const { data: session } = useSession()
  const { isConnected: isRealtimeConnected } = useRealtimeStatus()
  const isDocumentVisible = useDocumentVisible()
  const isAuthenticated = Boolean(session?.user)

  const pollIntervalMs = isRealtimeConnected
    ? CONVERSATION_MESSAGE_SLOW_POLL_INTERVAL_MS
    : CONVERSATION_MESSAGE_POLL_INTERVAL_MS

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
      isAuthenticated && isDocumentVisible && conversationId ? pollIntervalMs : false,
    refetchOnWindowFocus: true,
  })
}
