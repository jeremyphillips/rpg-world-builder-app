import { useQuery } from '@tanstack/react-query'

import { useSession } from '@/features/auth'

import { listConversationRecipients } from '../api/conversations'
import { conversationRecipientsQueryKey } from '../lib/conversation-query-keys'

export function useConversationRecipients() {
  const { data: session } = useSession()

  return useQuery({
    queryKey: conversationRecipientsQueryKey,
    queryFn: listConversationRecipients,
    enabled: Boolean(session?.user),
  })
}
