import { useQuery } from '@tanstack/react-query'

import { useSession } from '@/features/auth'

import { getConversation } from '../api/conversations'
import { conversationDetailQueryKey } from '../lib/conversation-query-keys'

export function useConversation(
  conversationId: string | undefined,
  options: { enabled?: boolean } = {},
) {
  const { data: session } = useSession()
  const isAuthenticated = Boolean(session?.user)

  return useQuery({
    queryKey: conversationDetailQueryKey(conversationId ?? ''),
    queryFn: () => getConversation(conversationId!),
    enabled: isAuthenticated && Boolean(conversationId) && (options.enabled ?? true),
    select: (response) => response.conversation,
  })
}
