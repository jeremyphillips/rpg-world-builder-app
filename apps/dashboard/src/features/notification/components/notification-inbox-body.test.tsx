import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'

import { NotificationInboxBody } from './notification-inbox-body.client'

const previewItems = [
  {
    id: 'notification-1',
    title: 'New message',
    description: 'Bobby V: blah',
    timestamp: '2 minutes ago',
    unread: true,
    onActivate: vi.fn(),
  },
]

describe('NotificationInboxBody', () => {
  it('renders paginated notification items with load more', () => {
    renderWithProviders(
      <NotificationInboxBody
        isPending={false}
        isError={false}
        itemCount={1}
        previewItems={previewItems}
        emptyTitle="You're all caught up."
        hasNextPage
        isFetchingNextPage={false}
        isFetchNextPageError={false}
        onLoadMore={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Load more' })).toBeInTheDocument()
    expect(screen.getByText('New message')).toBeInTheDocument()
    expect(screen.queryByText('Open')).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(
      <NotificationInboxBody
        isPending={false}
        isError={false}
        itemCount={1}
        previewItems={previewItems}
        emptyTitle="You're all caught up."
        hasNextPage
        isFetchingNextPage={false}
        isFetchNextPageError={false}
        onLoadMore={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
