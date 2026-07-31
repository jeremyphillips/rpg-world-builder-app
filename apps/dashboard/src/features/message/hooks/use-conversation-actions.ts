import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ConversationListResponse } from '@rpg/contracts'

import { notificationsListQueryKey } from '@/features/notification/lib/notification-query-keys'
import { NOTIFICATION_LIST_LIMIT } from '@/features/notification/hooks/use-notifications'

import {
  createDirectConversation,
  markConversationRead,
  sendConversationMessage,
} from '../api/conversations'
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
        (current: ConversationListResponse | undefined) => {
          if (!current) return current
          return {
            ...current,
            items: current.items.map((item) => (item.id === conversation.id ? conversation : item)),
          }
        },
      )
      void queryClient.invalidateQueries({
        queryKey: notificationsListQueryKey(NOTIFICATION_LIST_LIMIT),
      })
    },
  })

  return {
    createConversation,
    sendMessage,
    markRead,
  }
}
