import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'

import { NotificationInboxHeader } from './notification-inbox-header.client'
import { NOTIFICATION_COPY } from '../lib/notification-copy'

describe('NotificationInboxHeader', () => {
  it('renders the inbox header, description, and filter control', () => {
    renderWithProviders(
      <NotificationInboxHeader
        unreadCount={2}
        filter="all"
        onFilterChange={vi.fn()}
        onMarkAllRead={vi.fn()}
        markAllReadPending={false}
      />,
    )

    expect(screen.getByRole('heading', { name: NOTIFICATION_COPY.title })).toBeInTheDocument()
    expect(screen.getByText(NOTIFICATION_COPY.inboxDescription)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: NOTIFICATION_COPY.filterAll })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: NOTIFICATION_COPY.filterUnread })).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(
      <NotificationInboxHeader
        unreadCount={0}
        filter="unread"
        onFilterChange={vi.fn()}
        onMarkAllRead={vi.fn()}
        markAllReadPending={false}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
