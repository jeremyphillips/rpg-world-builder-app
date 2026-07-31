import type { Notification } from '@rpg/contracts'

export function makeNotification(
  overrides: Partial<Extract<Notification, { type: 'message.direct.received' }>> = {},
): Notification {
  return {
    id: 'notification-1',
    type: 'message.direct.received',
    title: 'New message',
    payload: {
      conversationId: 'conversation-1',
      messageId: 'message-1',
      senderDisplayName: 'Ava',
      preview: 'Hello',
      unreadMessageCount: 1,
      campaignIds: [],
    },
    seenAt: null,
    readAt: null,
    archivedAt: null,
    createdAt: '2026-01-01T12:00:00.000Z',
    updatedAt: '2026-01-01T12:00:00.000Z',
    version: 1,
    ...overrides,
  }
}
