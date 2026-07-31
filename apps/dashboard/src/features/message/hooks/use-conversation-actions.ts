import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ConversationListResponse } from '@rpg/contracts'

import {
  notificationsInboxQueryKey,
  notificationsListQueryKey,
  NOTIFICATION_LIST_LIMIT,
} from '@/features/notification'

import {
  createDirectConversation,
  markConversationRead,
  sendConversationMessage,
} from '../api/conversations'
import { applyConversationEnvelopeToList } from '../lib/conversation-cache'
import {
  conversationMessagesQueryKey,
  conversationsListQueryKey,
} from '../lib/conversation-query-keys'
import { CONVERSATION_LIST_LIMIT } from './use-conversations'

export function useConversationActions(conversationId?: string) {
  const queryClient = useQueryClient()

  const invalidateConversationQueries = () => {
    void queryClient.invalidateQueries({
      queryKey: conversationsListQueryKey(CONVERSATION_LIST_LIMIT),
    })
    if (conversationId) {
      void queryClient.invalidateQueries({
        queryKey: conversationMessagesQueryKey(conversationId),
      })
    }
    void queryClient.invalidateQueries({
      queryKey: notificationsListQueryKey(NOTIFICATION_LIST_LIMIT),
    })
    void queryClient.invalidateQueries({ queryKey: notificationsInboxQueryKey })
  }

  const createConversation = useMutation({
    mutationFn: createDirectConversation,
    onSuccess: () => {
      invalidateConversationQueries()
    },
  })

  const sendMessage = useMutation({
    mutationFn: (input: { content: { kind: 'text'; text: string }; clientMessageId?: string }) =>
      sendConversationMessage(conversationId!, input),
    onSuccess: () => {
      invalidateConversationQueries()
    },
  })

  const markRead = useMutation({
    mutationFn: (lastReadMessageId?: string) =>
      markConversationRead(conversationId!, {
        ...(lastReadMessageId ? { lastReadMessageId } : {}),
      }),
    onSuccess: ({ conversation }) => {
      queryClient.setQueryData(
        conversationsListQueryKey(CONVERSATION_LIST_LIMIT),
        (current: ConversationListResponse | undefined) =>
          applyConversationEnvelopeToList(current, {
            conversation,
            version: conversation.version,
          }),
      )
      void queryClient.invalidateQueries({
        queryKey: notificationsListQueryKey(NOTIFICATION_LIST_LIMIT),
      })
      void queryClient.invalidateQueries({ queryKey: notificationsInboxQueryKey })
    },
  })

  return {
    createConversation,
    sendMessage,
    markRead,
  }
}
