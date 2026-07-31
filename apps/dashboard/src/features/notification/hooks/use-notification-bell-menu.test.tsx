import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useNotificationBellMenu } from './use-notification-bell-menu'

const markSeenMutate = vi.fn()
const markReadMutateAsync = vi.fn()
const markAllReadMutateAsync = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('@rpg/ui', () => ({
  toast: {
    error: vi.fn(),
  },
}))

vi.mock('./use-notifications', () => ({
  useNotifications: () => ({
    data: {
      items: [
        {
          id: 'notification-1',
          type: 'campaign.invite.received',
          title: 'Campaign invitation',
          createdAt: '2026-01-01T12:00:00.000Z',
          updatedAt: '2026-01-01T12:00:00.000Z',
          version: 1,
          seenAt: null,
          readAt: null,
          payload: {
            inviteId: 'invite-1',
            campaignId: 'campaign-1',
            campaignName: 'Stormwatch',
            inviterDisplayName: 'Ava',
          },
        },
      ],
      unreadCount: 1,
      nextCursor: null,
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}))

vi.mock('./use-notification-actions', () => ({
  useNotificationActions: () => ({
    markRead: { mutateAsync: markReadMutateAsync },
    markAllRead: { mutateAsync: markAllReadMutateAsync, isPending: false },
    markSeen: { mutate: markSeenMutate },
  }),
}))

describe('useNotificationBellMenu', () => {
  beforeEach(() => {
    markSeenMutate.mockReset()
    markReadMutateAsync.mockReset()
    markAllReadMutateAsync.mockReset()
    markSeenMutate.mockImplementation((_ids, options) => {
      options?.onSuccess?.()
    })
  })

  it('marks rendered unseen notifications when the popover opens', async () => {
    const { result } = renderHook(() => useNotificationBellMenu())

    act(() => {
      result.current.setOpen(true)
    })

    await waitFor(() => {
      expect(markSeenMutate).toHaveBeenCalledWith(['notification-1'], expect.any(Object))
    })
  })

  it('retries mark-seen after closing and reopening the popover', async () => {
    markSeenMutate
      .mockImplementationOnce((_ids, options) => {
        options?.onError?.(new Error('network'))
      })
      .mockImplementationOnce((_ids, options) => {
        options?.onSuccess?.()
      })

    const { result } = renderHook(() => useNotificationBellMenu())

    act(() => {
      result.current.setOpen(true)
    })

    await waitFor(() => {
      expect(markSeenMutate).toHaveBeenCalledTimes(1)
    })

    act(() => {
      result.current.setOpen(false)
    })

    act(() => {
      result.current.setOpen(true)
    })

    await waitFor(() => {
      expect(markSeenMutate).toHaveBeenCalledTimes(2)
    })
  })
})
