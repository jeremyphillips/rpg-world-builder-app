import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'

const socketHandlers = vi.hoisted(() => ({
  connect: [] as Array<() => void>,
  notificationUpserted: [] as Array<(payload: unknown) => void>,
}))

const disconnect = vi.hoisted(() => vi.fn())
const ioMock = vi.hoisted(() =>
  vi.fn(() => ({
    on: vi.fn((event: string, handler: (payload: unknown) => void) => {
      if (event === 'connect') socketHandlers.connect.push(handler as () => void)
      if (event === 'notification.upserted') {
        socketHandlers.notificationUpserted.push(handler)
      }
    }),
    off: vi.fn(),
    disconnect,
  })),
)

vi.mock('socket.io-client', () => ({
  io: ioMock,
}))

import { RealtimeProvider } from './realtime-provider.client'
import { useRealtimeStatus } from '../context/realtime-context'
import {
  applyNotificationUpserted,
  notificationsListQueryKey,
  NOTIFICATION_LIST_LIMIT,
} from '@/features/notification'
import { makeNotification } from '@/test/fixtures/notifications'

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <RealtimeProvider userId="user-1">{children}</RealtimeProvider>
      </QueryClientProvider>
    )
  }
}

describe('RealtimeProvider', () => {
  beforeEach(() => {
    ioMock.mockClear()
    disconnect.mockClear()
    socketHandlers.connect.length = 0
    socketHandlers.notificationUpserted.length = 0
  })

  it('connects with credentials and exposes connection status', async () => {
    const queryClient = new QueryClient()
    const { result } = renderHook(() => useRealtimeStatus(), {
      wrapper: createWrapper(queryClient),
    })

    expect(ioMock).toHaveBeenCalledWith({
      path: '/api/socket.io',
      withCredentials: true,
    })
    expect(result.current.isConnected).toBe(false)

    socketHandlers.connect[0]?.()
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true)
    })
  })

  it('patches the bell cache from notification socket events', async () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(notificationsListQueryKey(NOTIFICATION_LIST_LIMIT), {
      items: [],
      unreadCount: 0,
      nextCursor: null,
    })

    renderHook(() => useRealtimeStatus(), {
      wrapper: createWrapper(queryClient),
    })

    const notification = makeNotification({ id: 'notification-live' })
    socketHandlers.notificationUpserted[0]?.({
      notification,
      unreadCount: 1,
      version: 1,
    })

    await waitFor(() => {
      expect(queryClient.getQueryData(notificationsListQueryKey(NOTIFICATION_LIST_LIMIT))).toEqual(
        applyNotificationUpserted(
          { items: [], unreadCount: 0, nextCursor: null },
          { notification, unreadCount: 1, version: 1 },
        ),
      )
    })
  })

  it('disconnects on unmount', () => {
    const queryClient = new QueryClient()
    const { unmount } = renderHook(() => useRealtimeStatus(), {
      wrapper: createWrapper(queryClient),
    })

    unmount()
    expect(disconnect).toHaveBeenCalled()
  })
})
