import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'

import { MessagesWorkspaceHeader } from './messages-workspace-header'
import { MESSAGES_ACTION_COPY } from '../../lib/messages-copy'

describe('MessagesWorkspaceHeader', () => {
  it('renders the page heading and primary new message action', () => {
    renderWithProviders(
      <MessagesWorkspaceHeader isNewRoute={false} onNewMessage={vi.fn()} onCancel={vi.fn()} />,
    )

    expect(screen.getByRole('heading', { name: 'Messages', level: 1 })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: MESSAGES_ACTION_COPY.newMessage }),
    ).toBeInTheDocument()
  })

  it('renders cancel instead of new message on the recipient route', () => {
    renderWithProviders(
      <MessagesWorkspaceHeader isNewRoute={true} onNewMessage={vi.fn()} onCancel={vi.fn()} />,
    )

    expect(screen.getByRole('button', { name: MESSAGES_ACTION_COPY.cancel })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: MESSAGES_ACTION_COPY.newMessage }),
    ).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(
      <MessagesWorkspaceHeader isNewRoute={false} onNewMessage={vi.fn()} onCancel={vi.fn()} />,
    )

    await expectNoAxeViolations(container)
  })
})
