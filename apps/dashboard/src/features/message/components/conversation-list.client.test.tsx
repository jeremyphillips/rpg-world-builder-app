import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'
import { makeConversation } from '@/test/fixtures/conversations'
import { MESSAGES_STATUS_COPY } from '../lib/messages-copy'

import { ConversationList } from './conversation-list.client'

describe('ConversationList', () => {
  it('renders peer names, previews, and unread badges', () => {
    renderWithProviders(
      <ConversationList
        conversations={[
          makeConversation(),
          makeConversation({
            id: 'conversation-2',
            peer: { userId: 'user-3', displayName: 'Quiet Peer' },
            latestMessage: undefined,
            unreadCount: 0,
          }),
        ]}
      />,
    )

    expect(screen.getByRole('link', { name: /Campaign Member/i })).toHaveAttribute(
      'href',
      '/messages/conversation-1',
    )
    expect(screen.getByText('Hello there')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText(MESSAGES_STATUS_COPY.noMessagesYet)).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(
      <ConversationList conversations={[makeConversation()]} />,
    )

    await expectNoAxeViolations(container)
  })
})
