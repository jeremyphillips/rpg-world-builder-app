'use client'

import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io, type Socket } from 'socket.io-client'
import type { NotificationListResponse } from '@rpg/contracts'

import {
  applyNotificationRead,
  applyNotificationUpserted,
  NOTIFICATION_LIST_LIMIT,
  notificationsListQueryKey,
  notificationsQueryKey,
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

  React.useEffect(() => {
    const socket: Socket = io({
      path: SOCKET_IO_PATH,
      withCredentials: true,
    })

    const handleConnect = () => {
      setIsConnected(true)
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
    }

    const handleDisconnect = () => {
      setIsConnected(false)
    }

    const handleNotificationUpserted = (payload: NotificationUpsertedPayload) => {
      queryClient.setQueryData<NotificationListResponse>(
        notificationsListQueryKey(NOTIFICATION_LIST_LIMIT),
        (current) => applyNotificationUpserted(current, payload),
      )
    }

    const handleNotificationRead = (payload: NotificationReadPayload) => {
      queryClient.setQueryData<NotificationListResponse>(
        notificationsListQueryKey(NOTIFICATION_LIST_LIMIT),
        (current) => applyNotificationRead(current, payload),
      )
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on(REALTIME_EVENTS.notificationUpserted, handleNotificationUpserted)
    socket.on(REALTIME_EVENTS.notificationRead, handleNotificationRead)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off(REALTIME_EVENTS.notificationUpserted, handleNotificationUpserted)
      socket.off(REALTIME_EVENTS.notificationRead, handleNotificationRead)
      socket.disconnect()
      setIsConnected(false)
    }
  }, [queryClient, userId])

  return <RealtimeContextProvider isConnected={isConnected}>{children}</RealtimeContextProvider>
}
