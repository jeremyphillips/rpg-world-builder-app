import type { DirectMessage } from '@rpg/contracts'

export function makeDirectMessage(overrides: Partial<DirectMessage> = {}): DirectMessage {
  return {
    id: 'message-1',
    conversationId: 'conversation-1',
    senderUserId: 'user-2',
    content: { kind: 'text', text: 'Hello there' },
    createdAt: '2026-07-30T12:00:00.000Z',
    ...overrides,
  }
}
