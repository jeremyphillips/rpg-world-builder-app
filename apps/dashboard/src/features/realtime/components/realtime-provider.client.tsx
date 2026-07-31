'use client'

import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io, type Socket } from 'socket.io-client'
import type { ConversationListResponse, NotificationListResponse } from '@rpg/contracts'

import {
  applyConversationEnvelopeToList,
  applyConversationEnvelopeToThread,
  CONVERSATION_LIST_LIMIT,
  conversationsListQueryKey,
  conversationMessagesQueryKey,
  type ConversationActivityPayload,
} from '@/features/message'
import {
  applyNotificationRead,
  applyNotificationUpserted,
  NOTIFICATION_LIST_LIMIT,
  notificationsInboxQueryKey,
  notificationsListQueryKey,
  type NotificationReadPayload,
  type NotificationUpsertedPayload,
} from '@/features/notification'

import { RealtimeContextProvider } from '../context/realtime-context'
import { REALTIME_EVENTS, SOCKET_IO_PATH } from '../lib/realtime-events'

type RealtimeProviderProps = {
  userId: string
  children: React.ReactNode
}

export function RealtimeProvider({ userId, children }: RealtimeProviderProps) {
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = React.useState(false)
  const activeConversationIdRef = React.useRef<string | null>(null)

  const setActiveConversationId = React.useCallback((conversationId: string | null) => {
    activeConversationIdRef.current = conversationId
  }, [])

  React.useEffect(() => {
    const socket: Socket = io({
      path: SOCKET_IO_PATH,
      withCredentials: true,
    })

    const invalidateInboxIfCached = () => {
      if (queryClient.getQueryData(notificationsInboxQueryKey) === undefined) return
      void queryClient.invalidateQueries({ queryKey: notificationsInboxQueryKey })
    }

    const handleConnect = () => {
      setIsConnected(true)
      void queryClient.invalidateQueries({
        queryKey: notificationsListQueryKey(NOTIFICATION_LIST_LIMIT),
      })
      void queryClient.invalidateQueries({
        queryKey: conversationsListQueryKey(CONVERSATION_LIST_LIMIT),
      })

      const activeConversationId = activeConversationIdRef.current
      if (activeConversationId) {
        void queryClient.invalidateQueries({
          queryKey: conversationMessagesQueryKey(activeConversationId),
        })
      }

      invalidateInboxIfCached()
    }

    const handleDisconnect = () => {
      setIsConnected(false)
    }

    const handleNotificationUpserted = (payload: NotificationUpsertedPayload) => {
      queryClient.setQueryData<NotificationListResponse>(
        notificationsListQueryKey(NOTIFICATION_LIST_LIMIT),
        (current) => applyNotificationUpserted(current, payload),
      )
      invalidateInboxIfCached()
    }

    const handleNotificationRead = (payload: NotificationReadPayload) => {
      queryClient.setQueryData<NotificationListResponse>(
        notificationsListQueryKey(NOTIFICATION_LIST_LIMIT),
        (current) => applyNotificationRead(current, payload),
      )
      invalidateInboxIfCached()
    }

    const handleConversationActivity = (payload: ConversationActivityPayload) => {
      queryClient.setQueryData<ConversationListResponse>(
        conversationsListQueryKey(CONVERSATION_LIST_LIMIT),
        (current) => applyConversationEnvelopeToList(current, payload),
      )

      if (!payload.message) return

      queryClient.setQueryData(
        conversationMessagesQueryKey(payload.conversation.id),
        (current: ReturnType<typeof applyConversationEnvelopeToThread> | undefined) => {
          if (!current) return current
          return applyConversationEnvelopeToThread(current, payload)
        },
      )
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on(REALTIME_EVENTS.notificationUpserted, handleNotificationUpserted)
    socket.on(REALTIME_EVENTS.notificationRead, handleNotificationRead)
    socket.on(REALTIME_EVENTS.conversationActivity, handleConversationActivity)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off(REALTIME_EVENTS.notificationUpserted, handleNotificationUpserted)
      socket.off(REALTIME_EVENTS.notificationRead, handleNotificationRead)
      socket.off(REALTIME_EVENTS.conversationActivity, handleConversationActivity)
      socket.disconnect()
      setIsConnected(false)
    }
  }, [queryClient, userId])

  return (
    <RealtimeContextProvider
      isConnected={isConnected}
      setActiveConversationId={setActiveConversationId}
    >
      {children}
    </RealtimeContextProvider>
  )
}
