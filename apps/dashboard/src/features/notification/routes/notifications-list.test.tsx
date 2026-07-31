import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'

vi.mock('../hooks/use-notification-inbox-page', () => ({
  useNotificationInboxPage: () => ({
    filter: 'all',
    setFilter: vi.fn(),
    isPending: false,
    isError: false,
    refetch: vi.fn(),
    previewItems: [
      {
        id: 'notification-1',
        title: 'New message',
        description: 'Bobby V: blah',
        timestamp: '1 hour ago',
        unread: true,
        onActivate: vi.fn(),
      },
    ],
    itemCount: 1,
    totalItemCount: 1,
    unreadCount: 1,
    handleMarkAllRead: vi.fn(),
    markAllReadPending: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    handleLoadMore: vi.fn(),
    emptyTitle: "You're all caught up.",
  }),
}))

import { NotificationsList } from './notifications-list'
import { NOTIFICATION_COPY } from '../lib/notification-copy'

describe('NotificationsList', () => {
  it('renders the compact notification inbox page', () => {
    renderWithProviders(<NotificationsList />)

    expect(screen.getByRole('heading', { name: NOTIFICATION_COPY.title })).toBeInTheDocument()
    expect(screen.getByText(NOTIFICATION_COPY.inboxDescription)).toBeInTheDocument()
    expect(screen.getByText('New message')).toBeInTheDocument()
    expect(screen.queryByText('Open')).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(<NotificationsList />)

    await expectNoAxeViolations(container)
  })
})
