import { useQuery } from '@tanstack/react-query'

import { useSession } from '@/features/auth'
import { useRealtimeStatus } from '@/features/realtime'
import { useDocumentVisible } from '@/lib/react/use-document-visible'

import { listConversations } from '../api/conversations'
import { conversationsListQueryKey } from '../lib/conversation-query-keys'

export const CONVERSATION_LIST_LIMIT = 20
export const CONVERSATION_POLL_INTERVAL_MS = 30_000
export const CONVERSATION_SLOW_POLL_INTERVAL_MS = 90_000

export function useConversations(campaignId?: string, options: { enabled?: boolean } = {}) {
  const { data: session } = useSession()
  const { isConnected: isRealtimeConnected } = useRealtimeStatus()
  const isDocumentVisible = useDocumentVisible()
  const isAuthenticated = Boolean(session?.user)

  const pollIntervalMs = isRealtimeConnected
    ? CONVERSATION_SLOW_POLL_INTERVAL_MS
    : CONVERSATION_POLL_INTERVAL_MS

  const queryOptions = { limit: CONVERSATION_LIST_LIMIT, campaignId }

  return useQuery({
    queryKey: conversationsListQueryKey(queryOptions),
    queryFn: () => listConversations(queryOptions),
    enabled: isAuthenticated && (options.enabled ?? true),
    refetchInterval:
      isAuthenticated && isDocumentVisible && (options.enabled ?? true) ? pollIntervalMs : false,
    refetchOnWindowFocus: true,
  })
}
