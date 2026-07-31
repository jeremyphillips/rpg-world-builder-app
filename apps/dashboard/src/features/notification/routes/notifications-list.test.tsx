import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'

import { createNotificationInboxFilterSchema } from '../lib/notification-inbox-filter-schema'

const schema = createNotificationInboxFilterSchema([{ value: 'campaign-1', label: 'Stormwatch' }])

vi.mock('../hooks/use-notification-inbox-page', () => ({
  useNotificationInboxPage: () => ({
    schema,
    filters: {},
    setFilterValue: vi.fn(),
    resetFilters: vi.fn(),
    invalidScopeNotice: {
      show: false,
      dismiss: vi.fn(),
      copy: {
        invalidHeading: 'Invalid',
        invalidBody: 'Body',
        invalidDismissLabel: 'Dismiss',
      },
    },
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

    expect(
      screen.getByRole('heading', { name: NOTIFICATION_COPY.title, level: 1 }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: NOTIFICATION_COPY.markAllAsRead }),
    ).toBeInTheDocument()
    expect(screen.getByText(NOTIFICATION_COPY.inboxDescription)).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Unread only' })).toBeInTheDocument()
    expect(screen.getByText('New message')).toBeInTheDocument()
    expect(screen.queryByText('Open')).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(<NotificationsList />)

    await expectNoAxeViolations(container)
  })
})
