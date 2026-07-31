import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import type {
  Conversation,
  ConversationListResponse,
  DirectMessage,
  MessageListResponse,
} from '@rpg/contracts'
import { DIRECT_MESSAGE_PREVIEW_MAX_LENGTH } from '@rpg/contracts'

import {
  notificationsInboxQueryKey,
  notificationsListQueryKey,
  NOTIFICATION_LIST_LIMIT,
} from '@/features/notification'

import {
  markConversationRead,
  sendConversationMessage,
  sendFirstDirectMessage,
} from '../api/conversations'
import {
  applyConversationEnvelopeToList,
  applyConversationEnvelopeToThread,
} from '../lib/conversation-cache'
import { conversationMessagesQueryKey, conversationsQueryKey } from '../lib/conversation-query-keys'

function buildMessagePreview(text: string): string {
  const normalized = text.trim().replace(/\s+/g, ' ')
  if (normalized.length <= DIRECT_MESSAGE_PREVIEW_MAX_LENGTH) return normalized
  return `${normalized.slice(0, DIRECT_MESSAGE_PREVIEW_MAX_LENGTH - 1)}…`
}

function buildSentMessageListEnvelope(
  conversation: Conversation,
  message: DirectMessage,
): Parameters<typeof applyConversationEnvelopeToList>[1] {
  return {
    conversation: {
      ...conversation,
      latestMessage: {
        messageId: message.id,
        senderUserId: message.senderUserId,
        preview: buildMessagePreview(message.content.text),
        createdAt: message.createdAt,
      },
      updatedAt: message.createdAt,
    },
    message,
    version: conversation.version,
  }
}

export function useConversationActions(conversationId?: string) {
  const queryClient = useQueryClient()

  const invalidateNotificationQueries = () => {
    void queryClient.invalidateQueries({
      queryKey: notificationsListQueryKey(NOTIFICATION_LIST_LIMIT),
    })
    void queryClient.invalidateQueries({ queryKey: notificationsInboxQueryKey })
  }

  const sendFirstMessage = useMutation({
    mutationFn: sendFirstDirectMessage,
    onSuccess: ({ conversation, message }) => {
      const envelope = buildSentMessageListEnvelope(conversation, message)
      queryClient.setQueriesData<ConversationListResponse>(
        { queryKey: conversationsQueryKey },
        (current) => applyConversationEnvelopeToList(current, envelope),
      )
      queryClient.setQueryData<InfiniteData<MessageListResponse>>(
        conversationMessagesQueryKey(conversation.id),
        (current) => applyConversationEnvelopeToThread(current, envelope),
      )
      invalidateNotificationQueries()
    },
  })

  const sendMessage = useMutation({
    mutationFn: (input: { content: { kind: 'text'; text: string }; clientMessageId?: string }) =>
      sendConversationMessage(conversationId!, input),
    onSuccess: ({ message }) => {
      if (!conversationId) return

      const listData = queryClient.getQueriesData<ConversationListResponse>({
        queryKey: conversationsQueryKey,
      })
      const cachedConversation = listData
        .flatMap(([, data]) => data?.items ?? [])
        .find((item) => item.id === conversationId)
      const envelope = cachedConversation
        ? buildSentMessageListEnvelope(cachedConversation, message)
        : {
            conversation: {
              id: conversationId,
              kind: 'direct' as const,
              participantUserIds: [message.senderUserId, ''] as [string, string],
              peer: { userId: '', displayName: '' },
              sharedCampaigns: [],
              unreadCount: 0,
              createdAt: message.createdAt,
              updatedAt: message.createdAt,
              version: 1,
            },
            message,
            version: 1,
          }

      queryClient.setQueryData<InfiniteData<MessageListResponse>>(
        conversationMessagesQueryKey(conversationId),
        (current) => applyConversationEnvelopeToThread(current, envelope),
      )

      if (cachedConversation) {
        queryClient.setQueriesData<ConversationListResponse>(
          { queryKey: conversationsQueryKey },
          (current) => applyConversationEnvelopeToList(current, envelope),
        )
      }

      invalidateNotificationQueries()
    },
  })

  const markRead = useMutation({
    mutationFn: (lastReadMessageId?: string) =>
      markConversationRead(conversationId!, {
        ...(lastReadMessageId ? { lastReadMessageId } : {}),
      }),
    onSuccess: ({ conversation }) => {
      queryClient.setQueriesData<ConversationListResponse>(
        { queryKey: conversationsQueryKey },
        (current) =>
          applyConversationEnvelopeToList(current, {
            conversation,
            version: conversation.version,
          }),
      )
      invalidateNotificationQueries()
    },
  })

  return {
    sendFirstMessage,
    sendMessage,
    markRead,
  }
}
