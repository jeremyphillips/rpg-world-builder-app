import { describe, expect, it, vi } from 'vitest'

import { makeNotification } from '@/test/fixtures/notifications'

import { activateNotification } from './activate-notification'

describe('activateNotification', () => {
  it('marks read and navigates when an action path exists', () => {
    const markRead = { mutateAsync: vi.fn().mockResolvedValue(undefined) }
    const navigate = vi.fn()
    const onBeforeNavigate = vi.fn()

    activateNotification({
      notification: makeNotification({
        id: 'notification-1',
        action: { kind: 'conversation_detail', conversationId: 'conv_1' },
        payload: {
          conversationId: 'conv_1',
          messageId: 'message-1',
          senderDisplayName: 'Bobby',
          preview: 'blah',
          unreadMessageCount: 1,
        },
      }),
      markRead,
      navigate,
      onFailure: vi.fn(),
      onBeforeNavigate,
    })

    expect(markRead.mutateAsync).toHaveBeenCalledWith('notification-1')
    expect(onBeforeNavigate).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledWith('/messages/conv_1')
  })

  it('marks read without navigating when no action path exists', () => {
    const markRead = { mutateAsync: vi.fn().mockResolvedValue(undefined) }
    const navigate = vi.fn()

    activateNotification({
      notification: {
        id: 'notification-2',
        type: 'campaign.invite.received',
        title: 'Campaign invitation',
        createdAt: '2026-07-30T12:00:00.000Z',
        updatedAt: '2026-07-30T12:00:00.000Z',
        version: 1,
        payload: {
          campaignId: 'camp_1',
          campaignName: 'Stormwatch',
          inviteId: 'invite_1',
          inviterDisplayName: 'Alex',
        },
      },
      markRead,
      navigate,
      onFailure: vi.fn(),
    })

    expect(markRead.mutateAsync).toHaveBeenCalledWith('notification-2')
    expect(navigate).not.toHaveBeenCalled()
  })
})
