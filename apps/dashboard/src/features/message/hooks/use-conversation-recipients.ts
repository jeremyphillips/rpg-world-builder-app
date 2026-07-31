import { useQuery } from '@tanstack/react-query'

import { useSession } from '@/features/auth'

import { listConversationRecipients } from '../api/conversations'
import { conversationRecipientsQueryKey } from '../lib/conversation-query-keys'

export function useConversationRecipients(campaignId?: string) {
  const { data: session } = useSession()

  const queryOptions = { campaignId }

  return useQuery({
    queryKey: conversationRecipientsQueryKey(queryOptions),
    queryFn: () => listConversationRecipients(queryOptions),
    enabled: Boolean(session?.user),
  })
}
