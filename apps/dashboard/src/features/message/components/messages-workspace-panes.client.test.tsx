import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'

import { ROUTES } from '@/app/routes'
import { renderWithProviders } from '@/test/render'
import {
  MESSAGES_ACTION_COPY,
  MESSAGES_EMPTY_COPY,
  MESSAGES_PREVIEW_COPY,
} from '../lib/messages-copy'

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

  it('links back to the prior conversation when from is present', () => {
    renderWithProviders(<MessagesRecipientPickerPane campaignId="camp_1" />, {
      initialEntries: [ROUTES.messages.new({ from: 'conv_1', campaignId: 'camp_1' })],
    })

    expect(screen.getByRole('link', { name: MESSAGES_ACTION_COPY.backToMessages })).toHaveAttribute(
      'href',
      ROUTES.messages.detail('conv_1', { campaignId: 'camp_1' }),
    )
    expect(screen.getByText(MESSAGES_PREVIEW_COPY.selectRecipientBody)).toBeInTheDocument()
  })
})
