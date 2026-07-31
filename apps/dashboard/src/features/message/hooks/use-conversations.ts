import { useQuery } from '@tanstack/react-query'

import { useSession } from '@/features/auth'
import { useDocumentVisible } from '@/lib/react/use-document-visible'

import { listConversations } from '../api/conversations'
import { conversationsListQueryKey } from '../lib/conversation-query-keys'

export const CONVERSATION_LIST_LIMIT = 20
export const CONVERSATION_POLL_INTERVAL_MS = 30_000

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
