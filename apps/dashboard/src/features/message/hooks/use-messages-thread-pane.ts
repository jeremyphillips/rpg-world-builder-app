import * as React from 'react'

import { useSetBreadcrumbLabel } from '@/components/layout/breadcrumb/use-breadcrumb-label'
import { useSession } from '@/features/auth'
import { useRealtimeStatus } from '@/features/realtime'

import { useConversationActions } from './use-conversation-actions'
import { useConversationMessages } from './use-conversation-messages'
import { useConversations } from './use-conversations'
import { useMessageThreadMarkRead } from './use-message-thread-mark-read'
import { flattenConversationMessages } from '../lib/sort-messages-chronologically'

export function useMessagesThreadPane({
  conversationId,
  campaignId,
  isAttentionEligible,
  isPaneVisible,
}: {
  conversationId: string
  campaignId?: string
  isAttentionEligible: boolean
  isPaneVisible: boolean
}) {
  const { data: session } = useSession()
  const { setActiveConversationId } = useRealtimeStatus()
  const { data: conversationsData } = useConversations(campaignId)
  const conversationInScopedList = conversationsData?.items.some(
    (item) => item.id === conversationId,
  )
  const { data: unscopedConversationsData } = useConversations(undefined, {
    enabled: Boolean(campaignId && conversationsData && !conversationInScopedList),
  })
  const messagesQuery = useConversationMessages(conversationId)
  const { sendMessage, markRead } = useConversationActions(conversationId)

  const conversation =
    conversationsData?.items.find((item) => item.id === conversationId) ??
    unscopedConversationsData?.items.find((item) => item.id === conversationId)
  const peerDisplayName = conversation?.peer.displayName
  useSetBreadcrumbLabel(peerDisplayName)
  const messages = flattenConversationMessages(messagesQuery.data?.pages)
  const latestMessage = messages.at(-1)

  useMessageThreadMarkRead({
    conversationId,
    latestMessageId: latestMessage?.id,
    latestMessageSenderUserId: latestMessage?.senderUserId,
    currentUserId: session?.user?.id,
    isAttentionEligible: isAttentionEligible && isPaneVisible,
    isLoaded: !messagesQuery.isPending && !messagesQuery.isError,
    markRead,
  })

  React.useEffect(() => {
    setActiveConversationId(conversationId)
    return () => setActiveConversationId(null)
  }, [conversationId, setActiveConversationId])

  return {
    session,
    conversation,
    peerDisplayName,
    messages,
    sendMessage,
    ...messagesQuery,
  }
}
