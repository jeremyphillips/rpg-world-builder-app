import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'

import { ROUTES } from '@/app/routes'
import { renderWithProviders } from '@/test/render'

import { MessagesStartConversationLink } from '../messages-start-conversation-link'
import { MESSAGES_ACTION_COPY } from '../../../lib/messages-copy'

describe('MessagesStartConversationLink', () => {
  it('links to the new-message route as a mobile fallback action', () => {
    renderWithProviders(<MessagesStartConversationLink campaignId="camp_1" />)

    expect(
      screen.getByRole('link', { name: MESSAGES_ACTION_COPY.startConversation }),
    ).toHaveAttribute('href', ROUTES.messages.new({ campaignId: 'camp_1' }))
  })
})
