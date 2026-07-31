import type { Conversation } from '@rpg/contracts'

export function makeConversation(overrides: Partial<Conversation> = {}): Conversation {
  const now = '2026-07-30T12:00:00.000Z'

  return {
    id: 'conversation-1',
    kind: 'direct',
    participantUserIds: ['user-1', 'user-2'],
    peer: { userId: 'user-2', displayName: 'Campaign Member' },
    latestMessage: {
      messageId: 'message-1',
      senderUserId: 'user-2',
      preview: 'Hello there',
      createdAt: now,
    },
    sharedCampaigns: [],
    unreadCount: 2,
    createdAt: now,
    updatedAt: now,
    version: 1,
    ...overrides,
  }
}
