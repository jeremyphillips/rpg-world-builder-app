import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'

import { ROUTES } from '@/app/routes'
import { renderWithProviders } from '@/test/render'
import { MESSAGES_EMPTY_COPY } from '../lib/messages-copy'

import { MessagesRecipientPickerPane } from './messages-workspace-panes.client'

vi.mock('../hooks/use-conversation-recipients', () => ({
  useConversationRecipients: () => ({
    data: {
      recipientsByUserId: {},
      existingDirectByUserId: {},
      campaigns: [],
    },
    isPending: false,
    isError: false,
  }),
}))

vi.mock('../hooks/use-conversation-actions', () => ({
  useConversationActions: () => ({
    createConversation: { mutateAsync: vi.fn(), isPending: false },
  }),
}))

describe('MessagesRecipientPickerPane', () => {
  it('shows scoped recipient empty copy when a campaign filter has no eligible members', () => {
    renderWithProviders(<MessagesRecipientPickerPane campaignId="camp_1" />, {
      initialEntries: [ROUTES.messages.new({ campaignId: 'camp_1' })],
    })

    expect(screen.getByText(MESSAGES_EMPTY_COPY.scopedRecipientHeading)).toBeInTheDocument()
    expect(screen.getByText(MESSAGES_EMPTY_COPY.scopedRecipientBody)).toBeInTheDocument()
  })
})
