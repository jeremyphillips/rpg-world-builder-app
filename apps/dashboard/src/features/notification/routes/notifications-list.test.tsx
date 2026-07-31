import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'

vi.mock('../hooks/use-notification-inbox-page', () => ({
  useNotificationInboxPage: () => ({
    isPending: false,
    isError: false,
    refetch: vi.fn(),
    previewItems: [
      {
        id: 'notification-1',
        title: 'Invitation accepted',
        description: 'Blake accepted your invitation to Harbor.',
        timestamp: '5 minutes ago',
        unread: false,
        actionLabel: 'Open',
        onActivate: vi.fn(),
      },
    ],
    itemCount: 1,
    unreadCount: 0,
    handleMarkAllRead: vi.fn(),
    markAllReadPending: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    handleLoadMore: vi.fn(),
  }),
}))

import { NotificationsList } from './notifications-list'

describe('NotificationsList', () => {
  it('renders the notification inbox page', () => {
    renderWithProviders(<NotificationsList />)

    expect(screen.getByRole('heading', { name: 'Notifications' })).toBeInTheDocument()
    expect(screen.getByText('Invitation accepted')).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(<NotificationsList />)

    await expectNoAxeViolations(container)
  })
})
