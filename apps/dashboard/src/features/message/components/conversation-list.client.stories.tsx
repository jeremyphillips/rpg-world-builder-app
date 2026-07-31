import type { Meta, StoryObj } from '@storybook/react-vite'

import { makeConversation } from '@/test/fixtures/conversations'

import { ConversationList } from './conversation-list.client'

const meta = {
  title: 'Message/ConversationList',
  component: ConversationList,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ConversationList>

export default meta

type Story = StoryObj<typeof ConversationList>

export const SingleUnreadDot: Story = {
  args: {
    conversations: [
      makeConversation({
        unreadCount: 1,
      }),
    ],
  },
}

export const WithUnread: Story = {
  args: {
    conversations: [
      makeConversation(),
      makeConversation({
        id: 'conversation-2',
        peer: { userId: 'user-3', displayName: 'Dungeon Master' },
        latestMessage: {
          messageId: 'message-2',
          senderUserId: 'user-1',
          preview: 'Ready for session two?',
          createdAt: '2026-07-29T18:30:00.000Z',
        },
        unreadCount: 0,
      }),
    ],
  },
}

export const EmptyPreview: Story = {
  args: {
    conversations: [
      makeConversation({
        latestMessage: undefined,
        unreadCount: 0,
      }),
    ],
  },
}
